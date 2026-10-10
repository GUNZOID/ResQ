import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Square,
  AlertTriangle,
  Bot,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  source?: string;
  isError?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'ai-init',
    sender: 'assistant',
    text: `Hello! I am your offline **Guardian AI**.

I run 100% offline on this device without internet, cell towers, or cloud APIs.

I provide real-time offline guidance on:
- 🩹 Emergency first aid & trauma stabilization
- 🌊 Disaster survival (floods, earthquakes, fires, storms)
- 💧 Safe water purification without electricity
- 🎒 72-Hour disaster go-bag planning & field kits

Ask me any emergency question below.`,
    timestamp: Date.now(),
    source: 'local-qwen2.5-0.5b',
  },
];

const SUGGESTED_PROMPTS = [
  { label: '🩹 Treat burns without tap water', query: 'How to treat a burn during a power outage without running water?' },
  { label: '💧 Purify contaminated water', query: 'What are the fastest reliable ways to purify contaminated flood water?' },
  { label: '🌀 Earthquake survival steps', query: 'What should I do immediately during and after a major earthquake tremor?' },
  { label: '🎒 72-Hour evacuation bag', query: 'What are the top essential items to pack in a 72-hour disaster evacuation go-bag?' },
];

export const SafeZAiScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleReset = async () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages(INITIAL_MESSAGES);
    try {
      await fetch('/api/chat/reset', { method: 'POST' });
    } catch {
      // ignore network errors on reset
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSend = async (customQuery?: string) => {
    const query = (customQuery || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInputQuery('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: Date.now(),
          source: data.source || 'local-qwen2.5-0.5b',
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: data.error || 'Guardian AI local inference encountered an issue.',
          timestamp: Date.now(),
          source: 'local-model-error',
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const cancelMsg: ChatMessage = {
          id: `ai-cancel-${Date.now()}`,
          sender: 'assistant',
          text: '*Inference cancelled.*',
          timestamp: Date.now(),
          source: 'local-qwen2.5-0.5b',
        };
        setMessages((prev) => [...prev, cancelMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `Local inference error: ${err.message || 'Failed to connect to local LLM.'}\n\nPlease verify that the local model is ready.`,
          timestamp: Date.now(),
          source: 'local-model-error',
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[440px] mx-auto px-4 pt-3 pb-20 text-white select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* DECLUTTERED TOP HEADER BAR */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#202334] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              Guardian AI
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Runs 100% offline</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#181A24] transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 shrink-0">
        {SUGGESTED_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.query)}
            disabled={isLoading}
            className="text-[11px] px-3 py-1.5 rounded-full bg-[#141620] hover:bg-[#1E2130] text-gray-300 hover:text-white border border-[#242738] shrink-0 whitespace-nowrap transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <span>{item.label}</span>
            <ChevronRight className="w-3 h-3 text-gray-500" />
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* CHAT MESSAGE STREAM (SCROLLABLE AREA) */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 p-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.sender === 'assistant' ? (
              <div
                className={`w-full max-w-[95%] rounded-2xl rounded-tl-xs p-3.5 text-xs shadow-md border ${
                  msg.isError
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                    : 'bg-[#141620] border-[#242738] text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#222534] text-[10px] text-gray-400">
                  <span className="font-semibold text-purple-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Guardian AI
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="p-1 rounded hover:bg-[#1E2130] text-gray-400 hover:text-white transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="leading-relaxed whitespace-pre-wrap space-y-1 text-gray-200">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div className="max-w-[85%] rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs bg-purple-600 text-white shadow-md leading-relaxed">
                {msg.text}
              </div>
            )}
            <span className="text-[9px] text-gray-500 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center justify-between bg-[#141620] border border-[#242738] rounded-2xl p-3 text-xs text-gray-300 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Guardian AI is thinking offline...</span>
            </div>
            <button
              onClick={handleCancel}
              className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1 transition-colors"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ========================================================================= */}
      {/* FIXED BOTTOM INPUT TEXT BOX */}
      {/* ========================================================================= */}
      <div className="shrink-0 pt-2 pb-1 bg-transparent">
        <div className="flex items-center gap-2 bg-[#141620] rounded-full p-1.5 pl-4 border border-[#262A3C] shadow-lg">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask emergency triage or survival question..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          {isLoading ? (
            <button
              onClick={handleCancel}
              className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors shrink-0"
              title="Stop inference"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim()}
              className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
