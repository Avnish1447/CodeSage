import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { SpendingService } from './spendingService.js';
import { SPENDING_CAP_CONFIG, TIMEOUT_CONFIG } from '../config/limits.js';

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        const err: any = new Error(`${operationName} timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
        err.code = 'ETIMEDOUT';
        err.status = 504;
        reject(err);
      }, timeoutMs);
      if (typeof (timer as any)?.unref === 'function') {
        (timer as any).unref();
      }
    }),
  ]);
}

function ensureEnvLoaded() {
  if (!process.env.GEMINI_API_KEY && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile();
    } catch {
      // .env not found or unreadable, ignore
    }
  }
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  ensureEnvLoaded();
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const FREE_FLASH_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

function extractStringArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return Object.keys(val);
  return [];
}

export async function generateRepositoryInsights(repoData: any) {
  ensureEnvLoaded();
  const apiKey = process.env.GEMINI_API_KEY;
  const owner = repoData.overview?.owner || 'Repository';
  const repo = repoData.overview?.repo || 'Codebase';
  
  const rawLangs = extractStringArray(repoData.facts?.languages);
  const rawFws = extractStringArray(repoData.facts?.frameworks);
  const rawImpFiles = extractStringArray(repoData.facts?.important_files);

  const languages = rawLangs.slice(0, 4).join(', ') || 'TypeScript / JavaScript';
  const frameworks = rawFws.slice(0, 4).join(', ') || 'Standard Libraries';
  const impFiles = rawImpFiles.slice(0, 5).join(', ') || 'package.json, README.md';

  const defaultInsights = {
    learning_path: [
      `1. Explore repository configuration and dependency manifest in ${impFiles}`,
      `2. Understand the core application layout and main entry point files`,
      `3. Review main service modules handling data processing and business logic`,
      `4. Trace key API route definitions and integration tests`
    ],
    architecture_summary: `${owner}/${repo} is built primarily with ${languages} and relies on key frameworks such as ${frameworks}. The architecture follows a clean layered module design separating API routing, business services, and static configuration components.`,
    gemini_available: false
  };

  if (!apiKey) {
    return {
      ...defaultInsights,
      gemini_available: false,
      gemini_status: 'missing_key' as const,
    };
  }

  // Enforce spending cap pre-flight guard with in-flight reservation (Finding 5)
  const reservationId = `ins_${repoData.repository_id || 'repo'}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const capCheck = SpendingService.reserveAllowance(reservationId, SPENDING_CAP_CONFIG.MAX_OUTPUT_TOKENS);
  if (!capCheck.allowed) {
    console.log(`[Gemini Insights] Spending cap enforced: ${capCheck.reason}. Serving deterministic insights.`);
    return {
      ...defaultInsights,
      gemini_available: false,
      gemini_status: 'quota_exhausted' as const,
      spending_capped: true,
      cap_reason: capCheck.reason,
    };
  }

  try {
    const ai = getAiClient();
    const prompt = `Analyze this software repository facts and generate a structured overview:
Repository: ${owner}/${repo}
Languages: ${JSON.stringify(repoData.facts?.languages)}
Frameworks: ${JSON.stringify(repoData.facts?.frameworks)}
Important Files: ${JSON.stringify(repoData.facts?.important_files)}
Stats: ${JSON.stringify(repoData.facts?.stats)}

Provide a JSON object with:
1. "learning_path": an array of 4-6 sequential step-by-step instructions for a developer to understand this codebase.
2. "architecture_summary": a concise 2-3 paragraph architectural explanation of how the system works.

Respond ONLY with valid JSON.`;

    for (const modelName of FREE_FLASH_MODELS) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              maxOutputTokens: SPENDING_CAP_CONFIG.MAX_OUTPUT_TOKENS,
            }
          }),
          TIMEOUT_CONFIG.GEMINI_INSIGHTS_TIMEOUT_MS,
          `Gemini Insights (${modelName})`
        );

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      if (parsed.learning_path && parsed.architecture_summary) {
        // Record token usage in persistent spending ledger with unique call ID
        const promptTokens = Math.ceil(prompt.length / 4);
        const completionTokens = Math.ceil(text.length / 4);
        const callId = crypto.randomBytes(8).toString('hex');
        const idempotencyKey = `insights_${repoData.repository_id}_${Date.now()}_${callId}`;
        SpendingService.recordUsage({
          service: 'gemini_insights',
          model: modelName,
          promptTokens,
          completionTokens,
          repositoryId: repoData.repository_id,
          idempotencyKey,
        });

        return {
          learning_path: parsed.learning_path,
          architecture_summary: parsed.architecture_summary,
          gemini_available: true,
          gemini_status: 'live' as const,
        };
      }
    } catch (err: any) {
      // Clean status logging without stderr error dumping
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
      if (isRateLimit) {
        console.log(`[Gemini] Model ${modelName} rate limited (429), trying next fallback model...`);
      } else {
        console.log(`[Gemini] Model ${modelName} request error: ${err.message || err}`);
      }
    }
    }
  } finally {
    SpendingService.releaseReservation(reservationId);
  }

  return {
    ...defaultInsights,
    gemini_available: false,
    gemini_status: 'quota_exhausted' as const,
  };
}

export async function streamRepositoryQuery(
  repoData: any,
  userQuery: string,
  style: 'technical' | 'simple' = 'technical',
  onChunk: (delta: string) => void,
  onStatus?: (status: 'live' | 'missing_key' | 'quota_exhausted', model?: string) => void
): Promise<{ answer: string; gemini_status: 'live' | 'missing_key' | 'quota_exhausted' }> {
  ensureEnvLoaded();
  const apiKey = process.env.GEMINI_API_KEY;
  const owner = repoData.overview?.owner || 'owner';
  const repo = repoData.overview?.repo || 'repo';

  const rawLangs = extractStringArray(repoData.facts?.languages);
  const rawFws = extractStringArray(repoData.facts?.frameworks);
  const rawImpFiles = extractStringArray(repoData.facts?.important_files);

  const languages = rawLangs.join(', ') || 'N/A';
  const frameworks = rawFws.join(', ') || 'N/A';
  const importantFiles = rawImpFiles.join(', ') || 'N/A';
  const fileCount = repoData.facts?.stats?.file_count || 0;

  if (!apiKey) {
    const text = style === 'simple'
      ? `**Repository Summary (${owner}/${repo})**:\n- **Main Programming Languages**: ${languages}\n- **Tools & Libraries**: ${frameworks}\n- **Key Starting Files**: ${importantFiles}\n\n*Note: Gemini API key is not set. Please add GEMINI_API_KEY to unlock interactive AI answers.*`
      : `**Repository Context (${owner}/${repo})**:\n- **Languages**: ${languages}\n- **Frameworks**: ${frameworks}\n- **Key Files**: ${importantFiles}\n\n*Note: Gemini API key is not configured. Please set GEMINI_API_KEY to enable full AI model responses.*`;
    onStatus?.('missing_key');
    onChunk(text);
    return {
      answer: text,
      gemini_status: 'missing_key',
    };
  }

  // Pre-flight check with in-flight reservation: Prevent runaway costs if spending caps are exceeded
  const chatReservationId = `chat_${repoData.repository_id || 'repo'}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const capCheck = SpendingService.reserveAllowance(chatReservationId, SPENDING_CAP_CONFIG.MAX_OUTPUT_TOKENS);
  if (!capCheck.allowed) {
    console.log(`[Gemini Stream] Spending cap enforced: ${capCheck.reason}. Serving context fallback.`);
    const capNotice = style === 'simple'
      ? `### ⚠️ Daily AI Spending Limit Reached\n\nTo prevent unexpected API costs, the configured daily budget cap ($${capCheck.dailyCapUsd.toFixed(2)}) is currently in effect. Here is an overview of **${owner}/${repo}** from cached repository context:\n\n- **Languages**: ${languages}\n- **Frameworks**: ${frameworks}\n- **Key Starting Files**: ${importantFiles}\n\n**Regarding your query ("*${userQuery}*")**: This project utilizes ${languages} with key structure rooted around \`${importantFiles.split(', ')[0] || 'package.json'}\`.\n\n*The spending cap will automatically reset tomorrow.*`
      : `### ⚠️ AI Spending Cap Enforced\n\nDaily spending cap reached ($${capCheck.dailySpendUsd.toFixed(2)} / $${capCheck.dailyCapUsd.toFixed(2)} USD). Switching to deterministic metadata context response:\n\n- **Languages**: ${languages}\n- **Libraries**: ${frameworks}\n- **Core Components**: ${importantFiles}\n- **File Count**: ${fileCount} files\n\n#### Architectural Response for ("*${userQuery}*"):\nBased on the indexed codebase topology for **${owner}/${repo}**, the system organizes its logic across ${languages}.\n\n${repoData.architecture_summary ? `**Architecture Summary**: ${repoData.architecture_summary}` : ''}\n\n*Budget caps protect your Gemini API account from uncontrolled billing.*`;

    onStatus?.('quota_exhausted');
    onChunk(capNotice);
    return {
      answer: capNotice,
      gemini_status: 'quota_exhausted',
    };
  }

  try {
    const ai = getAiClient();

  const styleDirective = style === 'simple'
    ? `RESPONSE STYLE DIRECTIVE (SIMPLIFIED & BEGINNER FRIENDLY):
- Explain everything in simple, plain, easy-to-understand language.
- Use intuitive analogies (e.g., comparing parts of code to blueprint blueprints, building blocks, or helpers).
- Avoid overly dense developer jargon, or explain technical terms clearly if you must use them.
- Keep explanations clear, concise, and friendly.`
    : `RESPONSE STYLE DIRECTIVE (TECHNICAL & DEEP ARCHITECTURAL):
- Provide an in-depth, highly technical analysis suited for senior software developers.
- Reference precise code organization patterns, dependency structures, and engineering abstractions.
- Use standard software engineering terminology and exact markdown formatting.`;

  const contextPrompt = `You are CodeSage, an AI codebase assistant analyzing a GitHub repository.

Repository Context:
- Owner/Repo: ${owner}/${repo}
- ID: ${repoData.repository_id}
- Languages: ${JSON.stringify(repoData.facts?.languages)}
- Frameworks: ${JSON.stringify(repoData.facts?.frameworks)}
- Important Files: ${JSON.stringify(repoData.facts?.important_files)}
- Stats: ${JSON.stringify(repoData.facts?.stats)}
- Architecture Summary: ${repoData.architecture_summary || 'N/A'}
- Learning Path: ${JSON.stringify(repoData.learning_path || [])}

${styleDirective}

User Question: ${userQuery}`;

  for (const modelName of FREE_FLASH_MODELS) {
    try {
      const responseStream = await withTimeout(
        ai.models.generateContentStream({
          model: modelName,
          contents: contextPrompt,
          config: {
            maxOutputTokens: SPENDING_CAP_CONFIG.MAX_OUTPUT_TOKENS,
          },
        }),
        TIMEOUT_CONFIG.GEMINI_CHAT_TIMEOUT_MS,
        `Gemini Chat Stream (${modelName})`
      );

      onStatus?.('live', modelName);
      let accumulated = '';
      for await (const chunk of responseStream) {
        if (chunk.text) {
          accumulated += chunk.text;
          onChunk(chunk.text);
        }
      }

      if (accumulated.trim().length > 0) {
        // Record token usage in persistent spending ledger with unique non-colliding key (without leaking query text)
        const promptTokens = Math.ceil(contextPrompt.length / 4);
        const completionTokens = Math.ceil(accumulated.length / 4);
        const callId = crypto.randomBytes(8).toString('hex');
        const idempotencyKey = `chat_${repoData.repository_id}_${Date.now()}_${callId}`;
        SpendingService.recordUsage({
          service: 'gemini_chat',
          model: modelName,
          promptTokens,
          completionTokens,
          repositoryId: repoData.repository_id,
          idempotencyKey,
        });

        return {
          answer: accumulated,
          gemini_status: 'live',
        };
      }
    } catch (err: any) {
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
      if (isRateLimit) {
        console.log(`[Gemini Stream] Model ${modelName} rate limited (429), trying fallback model...`);
      } else {
        console.log(`[Gemini Stream] Model ${modelName} error: ${err.message || err}`);
      }
    }
  }
  } finally {
    SpendingService.releaseReservation(chatReservationId);
  }

  // Graceful fallback response grounded in repo metadata when all model quotas are temporarily rate-limited
  const fallbackText = style === 'simple'
    ? `### 💡 Quick Summary for ${owner}/${repo}

*The AI assistant model is currently busy. Here is a simple overview based on the project information:*

- **Languages**: ${languages}
- **Main Tools**: ${frameworks}
- **Important Files to Check**: ${importantFiles}

**Regarding your question ("*${userQuery}*")**:
This project (${owner}/${repo}) uses **${languages}** as its main foundation. You can start exploring by looking at the main configuration files like \`${importantFiles.split(', ')[0] || 'package.json'}\`.

*Feel free to ask again in a moment!*`
    : `### 📊 Repository Insights (${owner}/${repo})

*Note: Free tier Gemini API model quota is temporarily busy. Here is an architectural breakdown grounded in the indexed codebase context:*

- **Languages Used**: ${languages}
- **Primary Frameworks**: ${frameworks}
- **Key Project Files**: ${importantFiles}
- **Indexed File Count**: ${fileCount} files

#### Answer to your query ("*${userQuery}*"):
Based on the repository index for **${owner}/${repo}**, the system utilizes **${languages}** for its core logic. Primary configuration and entry points are located in \`${importantFiles.split(', ')[0] || 'package.json'}\`.

${repoData.architecture_summary ? `**Architecture Summary**: ${repoData.architecture_summary}` : ''}

*You can ask another question or retry in a few moments as the quota resets.*`;

  onStatus?.('quota_exhausted');
  onChunk(fallbackText);

  return {
    answer: fallbackText,
    gemini_status: 'quota_exhausted',
  };
}

export async function answerRepositoryQuery(
  repoData: any,
  userQuery: string,
  style: 'technical' | 'simple' = 'technical'
) {
  return await streamRepositoryQuery(repoData, userQuery, style, () => {});
}

export async function checkGeminiHealth(forceProbe: boolean = false): Promise<{
  configured: boolean;
  status: 'live' | 'missing_key' | 'quota_exhausted';
  model?: string;
  message?: string;
}> {
  ensureEnvLoaded();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      configured: false,
      status: 'missing_key',
      message: 'GEMINI_API_KEY is not defined in the environment or .env file.',
    };
  }

  if (!forceProbe) {
    return {
      configured: true,
      status: 'live',
      message: 'GEMINI_API_KEY is configured.',
    };
  }

  // Pre-flight check: skip live probe if spending cap exceeded
  const capCheck = SpendingService.checkSpendingCap();
  if (!capCheck.allowed) {
    return {
      configured: true,
      status: 'quota_exhausted',
      message: `Spending cap reached: ${capCheck.reason}`,
    };
  }

  try {
    const ai = getAiClient();
    for (const model of FREE_FLASH_MODELS) {
      try {
        await withTimeout(
          ai.models.generateContent({
            model,
            contents: 'Say OK',
          }),
          TIMEOUT_CONFIG.GEMINI_PROBE_TIMEOUT_MS,
          `Gemini Probe (${model})`
        );
        const probeId = crypto.randomBytes(6).toString('hex');
        SpendingService.recordUsage({
          service: 'health_probe',
          model,
          promptTokens: 2,
          completionTokens: 2,
          idempotencyKey: `probe_${Date.now()}_${probeId}`,
        });
        return {
          configured: true,
          status: 'live',
          model,
          message: `Connection verified with model ${model}.`,
        };
      } catch (mErr: any) {
        if (mErr.status === 429 || (mErr.message && mErr.message.includes('429'))) {
          continue;
        }
      }
    }
    return {
      configured: true,
      status: 'quota_exhausted',
      message: 'Free-tier rate limits or model demand threshold reached.',
    };
  } catch (err: any) {
    return {
      configured: true,
      status: 'quota_exhausted',
      message: err.message || 'Error communicating with Gemini API.',
    };
  }
}

export async function generateGitReverseFallbackPrompt(repoData: any): Promise<string> {
  ensureEnvLoaded();
  const apiKey = process.env.GEMINI_API_KEY;
  const owner = repoData.overview?.owner || 'owner';
  const repo = repoData.overview?.repo || 'repo';
  const rawLangs = extractStringArray(repoData.facts?.languages);
  const rawFws = extractStringArray(repoData.facts?.frameworks);
  const rawImpFiles = extractStringArray(repoData.facts?.important_files);

  const languages = rawLangs.slice(0, 5).join(', ') || 'TypeScript / JavaScript';
  const frameworks = rawFws.slice(0, 5).join(', ') || 'Standard Libraries';
  const importantFiles = rawImpFiles.slice(0, 8).join(', ') || 'Core files';
  const fileCount = repoData.facts?.stats?.file_count || 0;

  if (!apiKey) {
    return `Build me a modern, production-grade application inspired by ${owner}/${repo}.\n\nThe project should be built primarily using ${languages} with core libraries and frameworks including ${frameworks}. Organize the architecture with modular separation of concerns, referencing key entry points like ${importantFiles}. Total codebase scope is approximately ${fileCount} files.\n\nPlease include solid unit tests, clear configuration defaults, clean documentation, and a working demo starter.`;
  }

  // Pre-flight check with in-flight reservation: skip AI call if spending cap exceeded
  const reverseReservationId = `gitrev_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const capCheck = SpendingService.reserveAllowance(reverseReservationId, SPENDING_CAP_CONFIG.MAX_OUTPUT_TOKENS);
  if (!capCheck.allowed) {
    return `Build me a modern, production-grade application inspired by ${owner}/${repo}.\n\nThe project should be built primarily using ${languages} with core libraries and frameworks including ${frameworks}. Organize the architecture with modular separation of concerns, referencing key entry points like ${importantFiles}. Total codebase scope is approximately ${fileCount} files.\n\nPlease include solid unit tests, clear configuration defaults, clean documentation, and a working demo starter.`;
  }

  try {
    const prompt = `You are GitReverse, an elite reverse-engineering system.
Analyze the following repository metadata and generate a single, comprehensive, natural-language "build-from" prompt that a developer could feed into an AI coding assistant (like Cursor, Claude Code, or v0) to recreate this project or build an equivalent system from scratch.

Repository: ${owner}/${repo}
Languages: ${languages}
Frameworks / Tools: ${frameworks}
Key Architecture Files: ${importantFiles}
Total Files: ${fileCount}

Guidelines for the prompt:
- Write in first person ("Build me a...", "Create a...", "I want to build...").
- Specify the core goals, technology choices, required features, routing/API layout, and file organization.
- Mention key libraries and configuration patterns.
- Ask for realistic tests and an example starter / demo.
- Keep the prompt focused, actionable, and between 2 to 4 concise paragraphs.
- Do NOT output extra conversational preamble or markdown code fences around the prompt. Return ONLY the prompt text itself.`;

    for (const model of FREE_FLASH_MODELS) {
      try {
        const ai = getAiClient();
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              maxOutputTokens: SPENDING_CAP_CONFIG.MAX_OUTPUT_TOKENS,
            },
          }),
          TIMEOUT_CONFIG.GEMINI_INSIGHTS_TIMEOUT_MS,
          `GitReverse Fallback (${model})`
        );
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text && text.length > 50) {
        const fallbackId = crypto.randomBytes(6).toString('hex');
        SpendingService.recordUsage({
          service: 'gitreverse_fallback',
          model,
          promptTokens: Math.ceil(prompt.length / 4),
          completionTokens: Math.ceil(text.length / 4),
          repositoryId: repoData.repository_id,
          idempotencyKey: `gitreverse_${repoData.repository_id || 'unknown'}_${Date.now()}_${fallbackId}`,
        });
        return text;
      }
    } catch {
      continue;
    }
  }
  } finally {
    SpendingService.releaseReservation(reverseReservationId);
  }

  return `Build me a modern, production-grade application inspired by ${owner}/${repo}.\n\nThe project should be built primarily using ${languages} with core libraries and frameworks including ${frameworks}. Organize the architecture with modular separation of concerns, referencing key entry points like ${importantFiles}. Total codebase scope is approximately ${fileCount} files.\n\nPlease include solid unit tests, clear configuration defaults, clean documentation, and a working demo starter.`;
}

