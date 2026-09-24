import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, RepoResponse } from '../types';
import { Send, Bot, User, Sparkles, Loader2, HelpCircle, Code2, Feather } from 'lucide-react';

interface RagChatSectionProps {
  repoData: RepoResponse;
  heightClass?: string;
}

const SAMPLE_QUESTIONS = [
  "How is this codebase structured and what are the main modules?",
  "What frameworks and libraries does this project rely on?",
  "How can I run and test this repository locally?",
  "Where are the primary entry points and API endpoints defined?"
];

export const RagChatSection: React.FC<RagChatSectionProps> = ({ repoData, heightClass = "h-[820px]" }) => {
  const repoFullName = `${repoData.overview.owner}/${repoData.overview.repo}`;

  const [responseStyle, setResponseStyle] = useState<'technical' | 'simple'>('technical');

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
    <div className={`bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-black/50 flex flex-col backdrop-blur-xl ${heightClass}`}>
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-950 border border-[#e8702a]/30 shadow-[0_0_12px_rgba(232,112,42,0.25)] rounded-xl flex items-center justify-center">
            <picture>
              <source srcSet="/logos/app-icon.png" type="image/png" />
              <img src="/logos/app-icon.svg" alt="CodeSage" className="w-6 h-6 object-contain rounded" />
            </picture>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Interactive CodeSage Chat</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ask questions grounded in codebase context</p>
          </div>
        </div>

        {/* AI Response Style Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-inner">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setResponseStyle('technical')}
              title="Detailed technical software architecture answers"
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
                responseStyle === 'technical'
                  ? 'bg-[#e8702a] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Technical</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setResponseStyle('simple')}
              title="Beginner-friendly plain English explanations with simple analogies"
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
                responseStyle === 'simple'
                  ? 'bg-[#e8702a] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Feather className="w-3 h-3" />
              <span>In Simpler Language</span>
            </motion.button>
          </div>

          <span className="hidden sm:flex px-2.5 py-1 text-xs font-mono font-semibold bg-[#e8702a]/10 text-[#e8702a] border border-[#e8702a]/30 rounded-full items-center space-x-1 whitespace-nowrap">
            <Bot className="w-3 h-3 text-[#e8702a]" />
            <span>CodeSage RAG</span>
          </span>
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                msg.role === 'user'
                  ? 'bg-[#e8702a] text-white'
                  : 'bg-slate-100 dark:bg-slate-950 text-[#e8702a] border border-slate-200 dark:border-slate-800'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <picture>
                  <source srcSet="/logos/app-icon.png" type="image/png" />
                  <img src="/logos/app-icon.svg" alt="CodeSage AI" className="w-5 h-5 object-contain rounded" />
                </picture>
              )}
            </div>

            <div
              className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-[#e8702a] text-white rounded-tr-none'
                  : 'bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none font-sans'
              }`}
            >
              <div className="markdown-body text-xs sm:text-sm font-sans space-y-1.5">
                <ReactMarkdown
                  components={{
                    strong: ({ children }) => <span className={msg.role === 'user' ? 'font-bold underline' : 'font-bold text-[#e8702a]'}>{children}</span>,
                    p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-slate-200 dark:bg-slate-800 text-[#e8702a] px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-300 dark:border-slate-700">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-800 text-xs font-mono my-2 text-slate-900 dark:text-slate-100">
                        {children}
                      </pre>
                    ),
                    h1: ({ children }) => <h1 className="text-base font-bold text-[#e8702a] mt-2 mb-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-bold text-[#e8702a] mt-2 mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xs font-bold text-[#e8702a] mt-2 mb-1">{children}</h3>,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
              <div
                className={`text-[10px] mt-2 font-mono ${
                  msg.role === 'user' ? 'text-white/80 text-right' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-950 text-[#e8702a] border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e8702a]" />
              <span>Analyzing context & generating response...</span>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 mb-3">
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
          <HelpCircle className="w-3 h-3 text-[#e8702a]" />
          <span>Suggested queries:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <motion.button
              whileTap={{ scale: 0.96 }}
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-[11px] bg-slate-100 dark:bg-slate-950/80 hover:bg-slate-200 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input Box */}
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
          className="flex-1 bg-slate-50 dark:bg-slate-950/90 border border-slate-300 dark:border-slate-800 focus:border-[#e8702a] focus:ring-1 focus:ring-[#e8702a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-sans transition-all disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="p-2.5 bg-[#e8702a] hover:bg-[#d2611f] text-white rounded-xl shadow-md shadow-[#e8702a]/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </form>
    </div>
  );
};

