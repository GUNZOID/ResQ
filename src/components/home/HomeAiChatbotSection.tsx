import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  Bot,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  source?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'ai-welcome',
    sender: 'assistant',
    text: `Hello! I am your **Lifeline AI Assistant**. 

I can help with emergency first aid, disaster safety protocols (cyclones, floods, earthquakes), water purification, and survival prep.

Ask a question or tap a prompt below to get started.`,
    timestamp: Date.now(),
    source: 'system',
  },
];

const SUGGESTED_PROMPTS = [
  { label: '🩹 Treat burns without power', query: 'How to treat a burn during a power outage without running water?' },
  { label: '💧 Safe water purification', query: 'What are the fastest ways to purify drinking water during a flood?' },
  { label: '🌀 Earthquake safety protocol', query: 'What should I do immediately during and after a major earthquake?' },
  { label: '🎒 72-Hour go-bag items', query: 'What are the top essential items to pack in a 72-hour disaster evacuation go-bag?' },
];

export const HomeAiChatbotSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
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

    try {
      // Call backend /api/chat which uses GoogleGenAI gemini-3.8-flash
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || "Stay calm and follow emergency instructions.",
          timestamp: Date.now(),
          source: data.source || 'gemini-3.8-flash',
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Server returned non-200');
      }
    } catch {
      // Intelligent offline emergency fallback
      const offlineReply = generateOfflineGuidance(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: offlineReply,
        timestamp: Date.now(),
        source: 'offline-knowledge-base',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-semibold text-gray-900 tracking-tight">Lifeline AI Assistant</h3>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-600 border border-indigo-100">
                LLM
              </span>
            </div>
            <p className="text-xs text-gray-500">24/7 disaster survival & first aid advisor</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Reset Chat"
          aria-label="Reset Chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
        {SUGGESTED_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.query)}
            disabled={isLoading}
            className="text-[11px] px-3 py-1.5 rounded-full bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 border border-gray-200/70 shrink-0 whitespace-nowrap transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <span>{item.label}</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="h-64 sm:h-72 overflow-y-auto no-scrollbar space-y-3.5 p-2 bg-gray-50/50 rounded-2xl border border-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.sender === 'assistant' ? (
              <div className="w-full max-w-[92%] bg-white rounded-2xl rounded-tl-xs p-3.5 text-xs text-gray-800 border border-gray-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100 text-[11px] text-gray-400 font-medium">
                  <div className="flex items-center gap-1 text-indigo-600">
                    <Bot className="w-3.5 h-3.5" />
                    <span className="font-semibold">ResQ AI</span>
                    {msg.source && (
                      <span className="text-[10px] text-gray-400 font-normal">
                        • {msg.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Offline Engine'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px]">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="prose prose-xs text-gray-800 space-y-2 whitespace-pre-line leading-relaxed">
                  {renderMarkdownSafe(msg.text)}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs leading-relaxed max-w-[85%] shadow-xs">
                <p>{msg.text}</p>
              </div>
            )}

            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-white rounded-2xl rounded-tl-xs p-3 text-xs border border-gray-200/80 shadow-xs flex items-center gap-2 text-gray-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>Thinking with Gemini AI...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask about emergency first aid, water, shelter..."
          disabled={isLoading}
          className="flex-1 bg-gray-100 focus:bg-white text-sm text-gray-900 placeholder:text-gray-400 rounded-full px-4 py-2.5 border border-transparent focus:border-gray-300 outline-none transition-all disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-xs transition-all shrink-0 active:scale-95"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
};

// Simple clean markdown bold/bullet formatting
function renderMarkdownSafe(content: string) {
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    let formatted: React.ReactNode = line;

    // Handle bold **text**
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      formatted = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    }

    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-bold text-gray-900 text-xs mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={idx} className="ml-3 list-disc text-gray-700 text-[11px] leading-snug">
          {formatted}
        </li>
      );
    }

    if (/^\d+\.\s/.test(line)) {
      return (
        <div key={idx} className="ml-1 text-gray-700 text-[11px] leading-snug py-0.5">
          {formatted}
        </div>
      );
    }

    return (
      <p key={idx} className="text-[11px] text-gray-700 leading-relaxed">
        {formatted}
      </p>
    );
  });
}

function generateOfflineGuidance(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('burn') || q.includes('fire')) {
    return `### Emergency Burn Care:
1. **Cool Immediately:** Run clean, cool water over the burn for 10–15 minutes. Never apply ice, butter, or oil.
2. **Remove Jewelry:** Take off rings or tight clothing before tissue swells.
3. **Cover Loosely:** Use sterile, non-adhesive gauze or a clean plastic wrap. Do not pop blisters.
4. **Hydration:** Sip clean water. Keep warm to avoid hypothermia.`;
  }

  if (q.includes('water') || q.includes('purif') || q.includes('drink')) {
    return `### Emergency Water Purification:
1. **Boil:** 1 full minute of rolling boil kills virtually all bacteria and viruses (3 minutes at high elevations).
2. **Household Bleach:** If clear, use 2 drops of regular 6% unscented bleach per 1 liter. Wait 30 minutes before drinking.
3. **Filter First:** If water is cloudy, strain through clean cloth or coffee filter before disinfecting.`;
  }

  if (q.includes('earthquake') || q.includes('shake')) {
    return `### Earthquake Response:
1. **Drop, Cover, and Hold On:** Under sturdy furniture away from windows.
2. **Interior Walls:** If no furniture, crouch against an interior wall protecting your head and neck.
3. **Aftershocks:** Expect repeated tremors. Shut off gas if you detect a sulfur smell. Evacuate on foot.`;
  }

  if (q.includes('bag') || q.includes('kit') || q.includes('pack') || q.includes('supplies')) {
    return `### Essential Go-Bag Essentials:
- Water (1 gal/person/day for 3 days)
- High-calorie non-perishable food
- First aid kit + 7 days prescription medications
- Battery radio & flashlight + power bank
- Multi-tool, whistle, emergency foil blankets
- Waterproof bag with ID and cash.`;
  }

  return `### Crisis Priority Checklist:
- **Assess Safety:** Check for immediate hazards (gas leaks, fire, rising water, falling debris).
- **Conserve Energy:** Turn down screen brightness and communicate using short mesh text updates.
- **Stay Connected:** Keep within 500m of mesh nodes to relay SOS beacons to family.`;
}
