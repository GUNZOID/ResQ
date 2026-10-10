import React, { useState, useRef, useEffect } from 'react';
import type { FamilyMember, OutboxMessage } from '../../types';
import { meshEngine } from '../../services/meshEngine';
import { db } from '../../services/db';
import {
  Send,
  Radio,
  CheckCheck,
  Check,
  Sparkles,
  MapPin,
  Battery,
  Users,
} from 'lucide-react';

interface HomeMessagingSectionProps {
  circleMembers: FamilyMember[];
  selectedRecipientId: string | null;
  onSelectRecipient: (id: string | null) => void;
}

interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // 'ALL' or member ID
  text: string;
  timestamp: number;
  isSelf: boolean;
  hopCount: number;
  status: 'DELIVERED' | 'RELAYING' | 'QUEUED';
}

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: 'msg-init-1',
    senderId: 'node-maya-mom',
    senderName: 'Mummy',
    recipientId: 'ALL',
    text: 'Water rising near 4th St canal. Sheltering safely on the 2nd floor.',
    timestamp: Date.now() - 1000 * 60 * 18,
    isSelf: false,
    hopCount: 2,
    status: 'DELIVERED',
  },
  {
    id: 'msg-init-2',
    senderId: 'self',
    senderName: 'You',
    recipientId: 'ALL',
    text: 'Stay upstairs Mom. I have the battery radio and emergency rations with me.',
    timestamp: Date.now() - 1000 * 60 * 12,
    isSelf: true,
    hopCount: 1,
    status: 'DELIVERED',
  },
  {
    id: 'msg-init-3',
    senderId: 'node-sarah-sister',
    senderName: 'Sarah',
    recipientId: 'ALL',
    text: 'Civic Shelter has clean drinking water & first aid tents operational.',
    timestamp: Date.now() - 1000 * 60 * 5,
    isSelf: false,
    hopCount: 1,
    status: 'DELIVERED',
  },
];

const QUICK_DISASTER_REPLIES = [
  "📍 At Civic Shelter point",
  "🔋 Low battery, text only",
  "💧 Clean water available here",
  "🚶 Safe, on my way to you",
  "⚠️ Need first-aid supplies",
];

export const HomeMessagingSection: React.FC<HomeMessagingSectionProps> = ({
  circleMembers,
  selectedRecipientId,
  onSelectRecipient,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedRecipientId]);

  const activeRecipient = circleMembers.find((m) => m.id === selectedRecipientId) || null;

  // Filter messages for active thread
  const filteredMessages = messages.filter((msg) => {
    if (!selectedRecipientId) return true; // Show all circle broadcast
    return (
      msg.recipientId === 'ALL' ||
      msg.recipientId === selectedRecipientId ||
      msg.senderId === selectedRecipientId
    );
  });

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    const newMessage: MessageItem = {
      id: `msg-${Date.now()}`,
      senderId: 'self',
      senderName: 'You',
      recipientId: selectedRecipientId || 'ALL',
      text: content,
      timestamp: Date.now(),
      isSelf: true,
      hopCount: 1,
      status: 'DELIVERED',
    };

    setMessages((prev) => [...prev, newMessage]);
    if (!textToSend) setInputText('');

    // Broadcast across Mesh Engine
    meshEngine.broadcastChatMessage(content, selectedRecipientId || undefined);

    // Save to Dexie IndexedDB
    const targetMember = circleMembers.find((m) => m.id === selectedRecipientId);
    const outboxRecord: OutboxMessage = {
      id: newMessage.id,
      targetId: selectedRecipientId || 'BROADCAST',
      targetName: targetMember ? targetMember.name : 'All Circle',
      content: content,
      createdAt: newMessage.timestamp,
      status: 'DELIVERED',
    };
    db.messages.put(outboxRecord).catch(() => {});
  };

  return (
    <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900 tracking-tight">Direct & Circle Chat</h3>
          <p className="text-xs text-gray-500 mt-0.5">Encrypted peer-to-peer transmission (no cellular required)</p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-[11px] font-medium text-gray-600">
          <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span>Local Mesh</span>
        </div>
      </div>

      {/* Recipient Filter Pills (Instagram Direct style) */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelectRecipient(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
            selectedRecipientId === null
              ? 'bg-gray-900 text-white shadow-xs'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Circle ({circleMembers.length})</span>
        </button>

        {circleMembers.map((member) => {
          const isSelected = selectedRecipientId === member.id;
          return (
            <button
              key={member.id}
              onClick={() => onSelectRecipient(isSelected ? null : member.id)}
              className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{member.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Stream */}
      <div className="h-56 sm:h-64 overflow-y-auto no-scrollbar space-y-3 p-2 bg-gray-50/50 rounded-2xl border border-gray-100">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <Radio className="w-8 h-8 text-gray-300 mb-2 stroke-1" />
            <p className="text-xs">No messages in this thread yet.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Send a quick check-in below.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const sender = circleMembers.find((m) => m.id === msg.senderId);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
              >
                {!msg.isSelf && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {sender && (
                      <img
                        src={sender.avatarUrl}
                        alt={msg.senderName}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    )}
                    <span className="text-[11px] font-semibold text-gray-700">{msg.senderName}</span>
                  </div>
                )}

                <div
                  className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed max-w-[85%] break-words shadow-xs ${
                    msg.isSelf
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white text-gray-900 border border-gray-200/80 rounded-tl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>•</span>
                  <span>{msg.hopCount === 1 ? 'Direct' : `${msg.hopCount} hops`}</span>
                  {msg.isSelf && <CheckCheck className="w-3 h-3 text-blue-500 ml-0.5" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Crisis Response Chips */}
      <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-medium text-gray-400 shrink-0">Quick:</span>
        {QUICK_DISASTER_REPLIES.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(reply)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 shrink-0 whitespace-nowrap transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeRecipient ? `Message ${activeRecipient.name}...` : 'Broadcast to all family members...'
            }
            className="w-full bg-gray-100 focus:bg-white text-sm text-gray-900 placeholder:text-gray-400 rounded-full px-4 py-2.5 pr-10 border border-transparent focus:border-gray-300 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white shadow-xs transition-all shrink-0 active:scale-95"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
};
