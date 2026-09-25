import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, RepoResponse } from '../types';
import { Send, Bot, User, Loader2, HelpCircle, Code2, Feather } from 'lucide-react';
import { ApiHealthBanner } from './ApiHealthBanner';

interface RagChatSectionProps {
  repoData: RepoResponse;
  heightClass?: string;
  geminiStatus?: 'live' | 'missing_key' | 'quota_exhausted';
  onStatusChange?: (status: 'live' | 'missing_key' | 'quota_exhausted') => void;
}

const SAMPLE_QUESTIONS = [
  "How is this codebase structured and what are the main modules?",
  "What frameworks and libraries does this project rely on?",
  "How can I run and test this repository locally?",
  "Where are the primary entry points and API endpoints defined?"
];

export const RagChatSection: React.FC<RagChatSectionProps> = ({
  repoData,
  heightClass = "h-[820px]",
  geminiStatus,
  onStatusChange,
}) => {
  const [responseStyle, setResponseStyle] = useState<'technical' | 'simple'>('technical');
  const [chatGeminiStatus, setChatGeminiStatus] = useState<'live' | 'missing_key' | 'quota_exhausted'>(
    geminiStatus || repoData.gemini_status || 'live'
  );

  useEffect(() => {
    if (geminiStatus) {
      setChatGeminiStatus(geminiStatus);
    } else if (repoData.gemini_status) {
      setChatGeminiStatus(repoData.gemini_status);
    }
  }, [geminiStatus, repoData.gemini_status]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: `init-${repoData.repository_id}`,
      role: 'assistant',
      text: `Hello! I am CodeSage. I've analyzed **${repoData.overview.owner}/${repoData.overview.repo}**. Ask me any question about its architecture, code structure, languages, or dependencies!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevRepoIdRef = useRef(repoData.repository_id);

  if (prevRepoIdRef.current !== repoData.repository_id) {
    prevRepoIdRef.current = repoData.repository_id;
    setMessages([
      {
        id: `init-${repoData.repository_id}`,
        role: 'assistant',
        text: `Hello! I am CodeSage. I've analyzed **${repoData.overview.owner}/${repoData.overview.repo}**. Ask me any question about its architecture, code structure, languages, or dependencies!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleRecheckGemini = async () => {
    try {
      const res = await fetch('/api/v1/gemini/health?probe=true');
      const data = await res.json();
      if (data.status) {
        setChatGeminiStatus(data.status);
        if (onStatusChange) {
          onStatusChange(data.status);
        }
      }
    } catch {
      // ignore network errors
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/repositories/${repoData.repository_id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, style: responseStyle }),
      });

      const data = await res.json();
      if (data.gemini_status) {
        setChatGeminiStatus(data.gemini_status);
        if (onStatusChange) {
          onStatusChange(data.gemini_status);
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.answer || 'No response returned from RAG assistant.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `Error reaching RAG assistant: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-6 flex flex-col ${heightClass}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-md bg-[#FAFAFA] dark:bg-[#1a1a1e] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <Bot className="w-4 h-4 text-[#e8702a]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-[-0.28px] text-[#171717] dark:text-[#EDEDED]">
              CodeSage RAG Assistant
            </h3>
            <p className="text-[11px] text-[#8F8F8F] dark:text-[#888888]">Grounded in repository context</p>
          </div>
        </div>

        {/* Style Segmented Switcher & Engine Status */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#F2F2F2] dark:bg-[#161618] p-0.5 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <button
              type="button"
              onClick={() => setResponseStyle('technical')}
              title="Detailed technical software architecture answers"
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
                responseStyle === 'technical'
                  ? 'bg-white dark:bg-[#222226] text-[#171717] dark:text-[#EDEDED] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                  : 'text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED]'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Technical</span>
            </button>
            <button
              type="button"
              onClick={() => setResponseStyle('simple')}
              title="Plain language explanations with straightforward analogies"
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
                responseStyle === 'simple'
                  ? 'bg-white dark:bg-[#222226] text-[#171717] dark:text-[#EDEDED] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                  : 'text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED]'
              }`}
            >
              <Feather className="w-3 h-3" />
              <span>Simpler</span>
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] text-[11px] font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                chatGeminiStatus === 'live'
                  ? 'bg-[#45A557]'
                  : chatGeminiStatus === 'missing_key'
                  ? 'bg-amber-500'
                  : 'bg-orange-500'
              }`}
            />
            <span
              className={
                chatGeminiStatus === 'live'
                  ? 'text-[#45A557]'
                  : chatGeminiStatus === 'missing_key'
                  ? 'text-amber-500'
                  : 'text-orange-500'
              }
            >
              {chatGeminiStatus === 'live'
                ? 'Active'
                : chatGeminiStatus === 'missing_key'
                ? 'Key Missing'
                : 'Quota Busy'}
            </span>
          </span>
        </div>
      </div>

      {/* Embedded ApiHealthBanner for chat context */}
      {chatGeminiStatus !== 'live' && (
        <div className="pt-3">
          <ApiHealthBanner
            status={chatGeminiStatus}
            compact={true}
            onRetry={handleRecheckGemini}
          />
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`flex items-start space-x-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] ${
                msg.role === 'user'
                  ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
                  : 'bg-[#FAFAFA] dark:bg-[#161618] text-[#e8702a]'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <picture>
                  <source srcSet="/logos/app-icon.png" type="image/png" />
                  <img src="/logos/app-icon.svg" alt="CodeSage AI" className="w-4 h-4 object-contain rounded" />
                </picture>
              )}
            </div>

            <div
              className={`max-w-[85%] p-3.5 rounded-xl text-xs sm:text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#171717] text-white dark:bg-[#EDEDED] dark:text-[#171717] rounded-tr-none shadow-sm'
                  : 'bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] text-[#171717] dark:text-[#EDEDED] rounded-tl-none font-sans'
              }`}
            >
              <div className="markdown-body text-xs sm:text-[13px] font-sans space-y-1.5">
                <ReactMarkdown
                  components={{
                    strong: ({ children }) => (
                      <span className={msg.role === 'user' ? 'font-semibold underline' : 'font-semibold text-[#171717] dark:text-white'}>
                        {children}
                      </span>
                    ),
                    p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-[#EBEBEB] dark:bg-[#222226] text-[#e8702a] px-1 py-0.5 rounded text-[11px] font-mono shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-[#F2F2F2] dark:bg-[#0c0c0e] p-3 rounded-lg overflow-x-auto shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] text-[12px] font-mono my-2 text-[#171717] dark:text-[#EDEDED] leading-5">
                        {children}
                      </pre>
                    ),
                    h1: ({ children }) => <h1 className="text-sm font-semibold text-[#171717] dark:text-white mt-2 mb-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xs font-semibold text-[#171717] dark:text-white mt-2 mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xs font-semibold text-[#171717] dark:text-white mt-2 mb-1">{children}</h3>,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
              <div
                className={`text-[10px] mt-1.5 font-mono ${
                  msg.role === 'user' ? 'text-white/60 dark:text-black/60 text-right' : 'text-[#8F8F8F] dark:text-[#888888]'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2.5"
          >
            <div className="w-7 h-7 rounded-md bg-[#FAFAFA] dark:bg-[#161618] text-[#e8702a] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-xl text-xs text-[#8F8F8F] dark:text-[#888888] flex items-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e8702a]" />
              <span>Analyzing context & generating response...</span>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="pt-2.5 shadow-[0_-1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_-1px_0_0_rgba(255,255,255,0.08)] mb-3">
        <div className="flex items-center space-x-1.5 text-[11px] text-[#8F8F8F] dark:text-[#888888] mb-1.5">
          <HelpCircle className="w-3 h-3 text-[#e8702a]" />
          <span>Suggested queries:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-[11px] bg-[#FAFAFA] hover:bg-[#EBEBEB] dark:bg-[#161618] dark:hover:bg-[#1f1f23] text-[#4D4D4D] hover:text-[#171717] dark:text-[#A1A1A1] dark:hover:text-[#EDEDED] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] px-2.5 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this repository..."
          aria-label="Ask a question about this repository"
          disabled={loading}
          className="flex-1 bg-[#FAFAFA] dark:bg-[#161618] text-[#171717] dark:text-[#EDEDED] placeholder-[#8F8F8F] dark:placeholder-[#666666] shadow-[0_0_0_1px_rgba(0,0,0,0.12)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] focus:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#0072F5] dark:focus:shadow-[0_0_0_2px_#000000,0_0_0_4px_#0072F5] outline-none rounded-lg px-3.5 py-2 text-xs sm:text-[13px] font-sans transition-all disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="p-2.5 bg-[#171717] hover:bg-[#2c2c2c] dark:bg-[#EDEDED] dark:hover:bg-white text-white dark:text-[#171717] rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </motion.button>
      </form>
    </div>
  );
};

