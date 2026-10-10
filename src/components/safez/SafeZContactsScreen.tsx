import React, { useState, useEffect } from 'react';
import type { FamilyMember, MeshPacket } from '../../types';
import { meshEngine } from '../../services/meshEngine';
import { soundAlert } from '../../services/soundAlert';
import {
  MoreVertical,
  Plus,
  Send,
  MessageSquare,
  Compass,
  Radio,
  Pin,
  ShieldCheck,
  Check,
  Building,
  Heart,
  X,
  Battery,
  Users,
  Signal,
  Wifi,
  Globe,
  RadioTower,
  Sparkles,
} from 'lucide-react';

interface SafeZContactsScreenProps {
  circleMembers: FamilyMember[];
  onSelectMember: (memberId: string) => void;
  onOpenPairing: () => void;
  onNavigateToLocation: () => void;
  selectedContactForChat?: FamilyMember | null;
  onCloseChat?: () => void;
}

interface PublicMeshMessage {
  id: string;
  senderName: string;
  senderNodeId: string;
  badge?: string;
  isVerified?: boolean;
  text: string;
  time: string;
  hops: number;
  isSelf?: boolean;
}

const INITIAL_PUBLIC_MESSAGES: PublicMeshMessage[] = [
  {
    id: 'pub-1',
    senderName: 'Delhi Civil Defence',
    senderNodeId: 'node-hq-civil-defence',
    badge: 'OFFICIAL BROADCAST',
    isVerified: true,
    text: '📢 Emergency supplies and clean drinking water tanker deployed at Saket District Community Centre.',
    time: '8m ago',
    hops: 1,
    isSelf: false,
  },
  {
    id: 'pub-2',
    senderName: 'Volunteer Node #2A8F (Dwarka)',
    senderNodeId: 'node-dwarka-2a8f',
    badge: 'SURVIVOR RELAY',
    text: 'Dwarka Sector 10 underpass is clear for pedestrian passage. High ground safehouse has generator power.',
    time: '14m ago',
    hops: 2,
    isSelf: false,
  },
  {
    id: 'pub-3',
    senderName: 'Medical Triage #4 (CP)',
    senderNodeId: 'node-cp-med4',
    badge: 'PARAMEDIC',
    isVerified: true,
    text: 'First aid tent operational at Connaught Place Outer Circle. Carrying burn dressings and sterile saline.',
    time: '22m ago',
    hops: 1,
    isSelf: false,
  },
  {
    id: 'pub-4',
    senderName: 'Node #7C11 (Noida Sec 18)',
    senderNodeId: 'node-noida-7c11',
    badge: 'MESH BEACON',
    text: 'Solar battery charging station open to all near Metro Gate 2. Local mesh bridge active.',
    time: '35m ago',
    hops: 3,
    isSelf: false,
  },
];

export const SafeZContactsScreen: React.FC<SafeZContactsScreenProps> = ({
  circleMembers,
  onSelectMember,
  onOpenPairing,
  onNavigateToLocation,
  selectedContactForChat,
  onCloseChat,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [chattingMember, setChattingMember] = useState<FamilyMember | null>(selectedContactForChat || null);
  const [isPublicChannelOpen, setIsPublicChannelOpen] = useState<boolean>(false);
  
  // Public Mesh Chat State
  const [publicMessages, setPublicMessages] = useState<PublicMeshMessage[]>(INITIAL_PUBLIC_MESSAGES);
  const [publicInput, setPublicInput] = useState<string>('');

  // 1-on-1 Direct Family Chat State
  const [directChatLogs, setDirectChatLogs] = useState<Record<string, Array<{ id: string; text: string; isSelf: boolean; time: string }>>>({
    'member-1': [
      { id: '101', text: 'Hey Kevin, are you safe near Karol Bagh metro?', isSelf: true, time: '18m ago' },
      { id: '102', text: 'Yes, sheltered on 2nd floor with 4 others. Water is holding up.', isSelf: false, time: '12m ago' },
    ],
    'member-2': [
      { id: '201', text: 'Amber, how is the battery situation at Saket?', isSelf: true, time: '25m ago' },
      { id: '202', text: 'Holding at 82%, solar power pack working. Stay safe!', isSelf: false, time: '20m ago' },
    ],
    'member-5': [
      { id: '501', text: 'Karen, do you see the emergency triage post in CP?', isSelf: true, time: '10m ago' },
      { id: '502', text: 'Yes, just checked in. They have clean water and first aid.', isSelf: false, time: '5m ago' },
    ],
  });
  const [directInput, setDirectInput] = useState<string>('');

  // Subscribe to live incoming mesh packets
  useEffect(() => {
    const unsub = meshEngine.subscribe((packet: MeshPacket) => {
      if (packet.type === 'CHAT_MESSAGE' && packet.payload?.text) {
        if (packet.targetNodeId === 'BROADCAST') {
          setPublicMessages((prev) => [
            ...prev,
            {
              id: packet.packetId || `pub-${Date.now()}`,
              senderName: packet.originName || 'Nearby Mesh Node',
              senderNodeId: packet.originNodeId || 'node-unknown',
              badge: 'LIVE P2P MESH',
              text: packet.payload.text,
              time: 'Just now',
              hops: packet.hopCount || 1,
              isSelf: false,
            },
          ]);
        } else {
          // Direct chat packet
          const memberId = packet.originNodeId;
          setDirectChatLogs((prev) => ({
            ...prev,
            [memberId]: [
              ...(prev[memberId] || []),
              {
                id: packet.packetId || `msg-${Date.now()}`,
                text: packet.payload.text,
                isSelf: false,
                time: 'Just now',
              },
            ],
          }));
        }
      }
    });

    return () => unsub();
  }, []);

  const handleSendPublicMessage = () => {
    if (!publicInput.trim()) return;
    const text = publicInput.trim();
    meshEngine.broadcastChatMessage(text, 'BROADCAST');
    soundAlert.playStatusChime();

    setPublicMessages((prev) => [
      ...prev,
      {
        id: `pub-${Date.now()}`,
        senderName: 'You (Local Node)',
        senderNodeId: meshEngine.getNodeId(),
        badge: 'YOUR BROADCAST',
        text,
        time: 'Just now',
        hops: 0,
        isSelf: true,
      },
    ]);
    setPublicInput('');
  };

  const handleSendDirectMessage = () => {
    if (!directInput.trim() || !chattingMember) return;
    const text = directInput.trim();
    meshEngine.broadcastChatMessage(text, chattingMember.id);
    soundAlert.playStatusChime();

    setDirectChatLogs((prev) => ({
      ...prev,
      [chattingMember.id]: [
        ...(prev[chattingMember.id] || []),
        {
          id: `msg-${Date.now()}`,
          text,
          isSelf: true,
          time: 'Just now',
        },
      ],
    }));
    setDirectInput('');
  };

  const currentMemberChatLog = chattingMember
    ? directChatLogs[chattingMember.id] || [
        { id: 'default-1', text: `Connected via direct mesh to ${chattingMember.name}.`, isSelf: false, time: 'Active' },
      ]
    : [];

  return (
    <div className="relative flex flex-col px-4 pt-4 pb-28 text-white max-w-[440px] mx-auto w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Contacts
        </h1>
        <button
          onClick={onOpenPairing}
          className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          View all
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. PINNED PUBLIC MESH NETWORK CHANNEL (ON TOP) */}
      {/* ========================================================================= */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 tracking-wide">
            <Pin className="w-3.5 h-3.5 fill-emerald-400 rotate-45" />
            <span>PINNED · PUBLIC MESH NETWORK</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            34 Nodes in Range
          </span>
        </div>

        {/* Public Mesh Channel Card */}
        <div
          onClick={() => setIsPublicChannelOpen(true)}
          className="relative bg-gradient-to-r from-[#121824] via-[#141A28] to-[#121622] rounded-3xl p-4 border-2 border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-[0_4px_20px_rgba(16,185,129,0.12)] group active:scale-[0.99]"
        >
          {/* Top Row: Channel Icon, Title & Live Status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#121824] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white truncate">
                    # Public Mesh Network
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    OPEN
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/80 font-medium truncate mt-0.5">
                  Delhi NCR Disaster Band · 868 MHz / BLE
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-emerald-300 text-xs font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </div>
          </div>

          {/* Latest Public Broadcast Snippet */}
          <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-start gap-2 text-xs">
            <span className="text-[10px] font-bold uppercase text-emerald-400 shrink-0 mt-0.5">
              Latest:
            </span>
            <p className="text-gray-300 text-[11px] line-clamp-1 flex-1 font-normal leading-relaxed">
              {publicMessages[publicMessages.length - 1]?.text ||
                'Civil Defence: Drinking water tanker positioned at Saket Community Center.'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FAMILY MEMBERS & CONTACTS (RIGHT BELOW) */}
      {/* ========================================================================= */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-rose-400" />
            <span>Family & Trusted Circle</span>
          </h2>
          <span className="text-[11px] text-gray-500 font-medium">
            {circleMembers.length} Saved
          </span>
        </div>

        <div className="space-y-2.5">
          {circleMembers.map((member) => (
            <div
              key={member.id}
              className="bg-[#141620] rounded-2xl p-3 border border-[#222534] hover:border-[#2E3348] transition-all flex items-center justify-between gap-3 shadow-xs"
            >
              {/* Left: Avatar & Info - Tapping opens direct 1-on-1 chat */}
              <div
                onClick={() => setChattingMember(member)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                title={`Open direct mesh chat with ${member.name}`}
              >
                <div className="relative w-11 h-11 rounded-full shrink-0">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover bg-gray-800 ring-1 ring-[#2A2E42] group-hover:ring-rose-500/50 transition-all"
                  />
                  {member.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#141620]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                      {member.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Battery className="w-3 h-3 text-emerald-400" />
                      {member.batteryLevel}%
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {member.statusMessage || `${member.relation} · ${member.status}`}
                  </p>
                </div>
              </div>

              {/* Right: Direct Chat Button + 3-Dots Menu */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setChattingMember(member)}
                  className="p-2 rounded-xl bg-[#1A1D2A] hover:bg-[#25283B] text-gray-300 hover:text-white border border-[#2B2F42] transition-colors"
                  title="Direct Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                </button>

                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveMenuId(activeMenuId === member.id ? null : member.id)
                    }
                    className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#1E212E] transition-colors"
                    aria-label="Contact options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Action Menu */}
                  {activeMenuId === member.id && (
                    <div className="absolute right-0 top-8 z-30 w-38 bg-[#1A1D28] border border-[#2B2F42] rounded-xl p-1.5 shadow-xl text-xs space-y-1 animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => {
                          setChattingMember(member);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#252838] text-left text-gray-200"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span>Direct Chat</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectMember(member.id);
                          onNavigateToLocation();
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#252838] text-left text-gray-200"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View on Map</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MY COMMUNITIES SECTION */}
      {/* ========================================================================= */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-300">My Communities</h2>
          <button
            onClick={onOpenPairing}
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Family Community Card */}
          <div className="bg-[#141620] rounded-3xl p-4 border border-[#222534] shadow-xs flex flex-col justify-between h-32 hover:border-[#2E3348] transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Heart className="w-4 h-4 fill-rose-400" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400">P2P Mesh</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Family</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex -space-x-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    className="w-5 h-5 rounded-full ring-2 ring-[#141620]"
                    alt="Member"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                    className="w-5 h-5 rounded-full ring-2 ring-[#141620]"
                    alt="Member"
                  />
                </div>
                <span className="text-[10px] font-semibold text-gray-400">+1</span>
              </div>
            </div>
          </div>

          {/* Office Staff Community Card */}
          <div className="bg-[#141620] rounded-3xl p-4 border border-[#222534] shadow-xs flex flex-col justify-between h-32 hover:border-[#2E3348] transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-blue-400">Cluster</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Office Staff</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex -space-x-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    className="w-5 h-5 rounded-full ring-2 ring-[#141620]"
                    alt="Member"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                    className="w-5 h-5 rounded-full ring-2 ring-[#141620]"
                    alt="Member"
                  />
                </div>
                <span className="text-[10px] font-semibold text-gray-400">+21</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (+) */}
      <button
        onClick={onOpenPairing}
        className="fixed bottom-20 right-6 sm:right-auto sm:left-[calc(50%+160px)] z-40 w-13 h-13 rounded-full bg-white text-gray-950 hover:bg-gray-200 active:scale-95 shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform"
        title="Pair New Trusted Node"
        aria-label="Add Contact"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* ========================================================================= */}
      {/* 4. PUBLIC MESH BROADCAST CHANNEL MODAL / STREAM */}
      {/* ========================================================================= */}
      {isPublicChannelOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#11131C] w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl border border-[#272B3C] shadow-2xl flex flex-col max-h-[90vh] h-[600px] overflow-hidden">
            {/* Public Channel Header */}
            <div className="p-4 border-b border-[#202334] bg-[#141824] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white"># Public Mesh Channel</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    <span className="text-emerald-400 font-semibold">Delhi NCR Local Mesh</span>
                    <span>•</span>
                    <span>34 Nodes</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPublicChannelOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#1E2232] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Public Mesh Notice */}
            <div className="px-4 py-2 bg-[#0E1017] border-b border-[#1D202E] flex items-center gap-2 text-[10px] text-gray-400 shrink-0">
              <RadioTower className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Public broadcast packets relay across up to 5 radio hops to all nearby survivors.</span>
            </div>

            {/* Public Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {publicMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Badge & Name */}
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400 px-1">
                    <span className="font-bold text-white">{msg.senderName}</span>
                    {msg.badge && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                        msg.isVerified
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : msg.isSelf
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {msg.badge}
                      </span>
                    )}
                    <span>· {msg.time}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.isSelf
                        ? 'bg-emerald-600 text-white rounded-br-xs shadow-md shadow-emerald-950/50'
                        : msg.isVerified
                        ? 'bg-[#1C1620] text-gray-100 rounded-bl-xs border border-rose-500/30'
                        : 'bg-[#181B28] text-gray-200 rounded-bl-xs border border-[#272C3E]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Public Message Input Composer */}
            <div className="p-3 border-t border-[#202334] flex items-center gap-2 bg-[#0E1017]">
              <input
                type="text"
                value={publicInput}
                onChange={(e) => setPublicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendPublicMessage()}
                placeholder="Broadcast to all nearby mesh nodes..."
                className="flex-1 bg-[#161824] text-xs text-white placeholder-gray-500 rounded-full px-4 py-2.5 border border-[#272B3C] focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
              <button
                onClick={handleSendPublicMessage}
                disabled={!publicInput.trim()}
                className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all shadow-md active:scale-95"
                title="Broadcast Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DIRECT 1-ON-1 FAMILY / CONTACT CHAT MODAL */}
      {/* ========================================================================= */}
      {chattingMember && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#11131C] w-full max-w-[440px] rounded-t-3xl sm:rounded-3xl border border-[#272B3C] shadow-2xl flex flex-col max-h-[90vh] h-[600px] overflow-hidden">
            {/* Direct Chat Header */}
            <div className="p-4 border-b border-[#202334] bg-[#141622] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full">
                  <img
                    src={chattingMember.avatarUrl}
                    alt={chattingMember.name}
                    className="w-full h-full rounded-full object-cover ring-2 ring-[#272B3C]"
                  />
                  {chattingMember.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#11131C]" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{chattingMember.name}</h3>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>P2P Encrypted · {chattingMember.relation}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setChattingMember(null);
                  if (onCloseChat) onCloseChat();
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#1E2232] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {currentMemberChatLog.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      msg.isSelf
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-950/50'
                        : 'bg-[#181B28] text-gray-200 rounded-bl-xs border border-[#272C3E]'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Direct Message Input Composer */}
            <div className="p-3 border-t border-[#202334] flex items-center gap-2 bg-[#0E1017]">
              <input
                type="text"
                value={directInput}
                onChange={(e) => setDirectInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendDirectMessage()}
                placeholder={`Message ${chattingMember.name} via mesh...`}
                className="flex-1 bg-[#161824] text-xs text-white placeholder-gray-500 rounded-full px-4 py-2.5 border border-[#272B3C] focus:outline-hidden focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSendDirectMessage}
                disabled={!directInput.trim()}
                className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-md active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
