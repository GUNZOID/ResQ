import React, { useState } from 'react';
import type { FamilyMember, OutboxMessage, MeshPacket } from '../types';
import {
  MessageSquare,
  Send,
  Radio,
  Clock,
  CheckCheck,
  Check,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface EmergencyChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  circleMembers: FamilyMember[];
  outboxMessages: OutboxMessage[];
  onSendMessage: (targetId: string, content: string) => void;
  selectedTargetId: string;
  onSelectTargetId: (id: string) => void;
}

const QUICK_PRESETS = [
  'Safe and accounted for. Moving toward high ground.',
  'Trapped by floodwater, need rescue team assistance.',
  'Have extra clean drinking water and medical kit.',
  'Power and grid lines completely down in our sector.',
  'Battery below 10%, switching to conservation mode.',
];

export const EmergencyChatDrawer: React.FC<EmergencyChatDrawerProps> = ({
  isOpen,
  onClose,
  circleMembers,
  outboxMessages,
  onSendMessage,
  selectedTargetId,
  onSelectTargetId,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(selectedTargetId, inputText.trim());
    setInputText('');
  };

  const handlePresetClick = (preset: string) => {
    onSendMessage(selectedTargetId, preset);
  };

  const targetName =
    selectedTargetId === 'TRUSTED_CIRCLE'
      ? 'All Family Circle (Broadcast)'
      : circleMembers.find((m) => m.id === selectedTargetId)?.name || 'Direct Peer';

  return (
    <div className="fixed inset-y-0 right-0 z-[1500] w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              Offline Mesh Emergency Radio
            </h2>
            <span className="text-[11px] font-mono text-emerald-400">
              Zero-Cloud · Store-and-Forward Outbox
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Recipient Target Selector */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/50">
        <label className="block text-[11px] text-slate-400 mb-1">Packet Recipient Target:</label>
        <select
          value={selectedTargetId}
          onChange={(e) => onSelectTargetId(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        >
          <option value="TRUSTED_CIRCLE">Broadcast to Entire Family Circle</option>
          {circleMembers.map((m) => (
            <option key={m.id} value={m.id}>
              Direct to {m.name} ({m.relation})
            </option>
          ))}
        </select>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {outboxMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-6">
            <Radio className="w-8 h-8 mb-2 text-slate-600 animate-pulse" />
            <p className="font-semibold text-slate-400">Airwaves Clear</p>
            <p className="text-[11px] mt-1 text-slate-500">
              Messages typed here hop across peer nodes and are saved to IndexedDB until acknowledged.
            </p>
          </div>
        ) : (
          outboxMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-sky-400">{msg.targetName}</span>
                <span className="font-mono text-slate-500">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed font-sans">{msg.content}</p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                <span className="text-slate-500">
                  {msg.hopTrace ? `Route: ${msg.hopTrace.join(' → ')}` : 'Relayed direct'}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{msg.status}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Emergency Presets */}
      <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 overflow-x-auto whitespace-nowrap space-x-1.5">
        {QUICK_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetClick(preset)}
            className="inline-block px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message to ${targetName}...`}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Hop Packet</span>
        </button>
      </form>
    </div>
  );
};
