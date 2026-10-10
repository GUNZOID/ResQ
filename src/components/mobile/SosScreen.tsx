import React, { useState } from 'react';
import type { EmergencyStatus } from '../../types';
import { soundAlert } from '../../services/soundAlert';
import {
  Volume2,
  VolumeX,
  Zap,
  Send,
  Heart,
  Shield,
  HelpCircle,
  Radio,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface SosScreenProps {
  currentStatus: EmergencyStatus;
  batteryLevel: number;
  userLocation: { lat: number; lng: number };
  connectedNodesCount: number;
  onBroadcastStatus: (status: EmergencyStatus, message?: string) => void;
  onToggleStrobe: () => void;
  isStrobeActive: boolean;
}

const EMERGENCY_PRESETS = [
  'Water is rising near our street. Moving to the second floor.',
  'Downed wires blocking the road. Waiting for emergency help.',
  'Someone in our group has a cut. Could use clean gauze & antiseptic.',
  'Made it safely to the community shelter with our emergency bag.',
  'Saving battery now. Phone is low, checking in every 5 minutes.',
];

export const SosScreen: React.FC<SosScreenProps> = ({
  currentStatus,
  batteryLevel,
  userLocation,
  connectedNodesCount,
  onBroadcastStatus,
  onToggleStrobe,
  isStrobeActive,
}) => {
  const [customNote, setCustomNote] = useState('');
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [lastBroadcastTimestamp, setLastBroadcastTimestamp] = useState<string | null>(null);

  const handleStatusBroadcast = (status: EmergencyStatus, messageOverride?: string) => {
    const msg = messageOverride || customNote || undefined;
    onBroadcastStatus(status, msg);
    setLastBroadcastTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCustomNote('');

    if (status === 'NEED_HELP' || status === 'INJURED' || status === 'CRITICAL_SOS') {
      soundAlert.playSosAlarm();
    } else {
      soundAlert.playTacticalPing();
    }
  };

  const toggleSiren = () => {
    if (!isSirenActive) {
      soundAlert.playSosAlarm();
      setIsSirenActive(true);
    } else {
      soundAlert.isMuted = true;
      setIsSirenActive(false);
      setTimeout(() => {
        soundAlert.isMuted = false;
      }, 500);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-24 px-4 pt-4 space-y-4 font-sans">
      {/* Friendly Introduction Card */}
      <div className="p-4 rounded-2xl bg-[#201D1A] border border-[#332E29] shadow-sm space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#81B29A] ring-4 ring-[#81B29A]/20"></span>
            <span className="text-xs font-semibold text-[#F7F4EE]">
              {connectedNodesCount} Family & Neighbor Nodes Nearby
            </span>
          </div>
          <span className="text-[11px] text-[#A8A194]">
            Offline Mesh
          </span>
        </div>
        <p className="text-xs text-[#C4BDB0] leading-relaxed pt-1">
          Tap a status button to send an encrypted beacon to your circle. It bounces phone-to-phone even when cell towers are down.
        </p>
      </div>

      {/* Prominent One-Tap Status Broadcast Cards with Soft Tactile Surfaces */}
      <div className="space-y-2.5">
        {/* I'M SAFE */}
        <button
          onClick={() => handleStatusBroadcast('SAFE')}
          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 active:scale-[0.98] ${
            currentStatus === 'SAFE'
              ? 'bg-[#253026] text-[#F7F4EE] border-[#81B29A] shadow-md ring-2 ring-[#81B29A]/30'
              : 'bg-[#201D1A] hover:bg-[#27231F] text-[#F7F4EE] border-[#332E29]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#81B29A]/20 border border-[#81B29A]/40 flex items-center justify-center text-xl shrink-0">
              🟢
            </div>
            <div>
              <span className="text-sm font-semibold text-[#81B29A] block">
                I'm Safe
              </span>
              <span className="text-xs text-[#A8A194] block mt-0.5">
                Reassure your family that you're unharmed and secure
              </span>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#161412] text-[#81B29A] border border-[#81B29A]/30 shrink-0">
            Share
          </span>
        </button>

        {/* I NEED HELP */}
        <button
          onClick={() => handleStatusBroadcast('NEED_HELP')}
          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 active:scale-[0.98] ${
            currentStatus === 'NEED_HELP'
              ? 'bg-[#312519] text-[#F7F4EE] border-[#E9B44C] shadow-md ring-2 ring-[#E9B44C]/30'
              : 'bg-[#201D1A] hover:bg-[#27231F] text-[#F7F4EE] border-[#332E29]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E9B44C]/20 border border-[#E9B44C]/40 flex items-center justify-center text-xl shrink-0">
              🚨
            </div>
            <div>
              <span className="text-sm font-semibold text-[#E9B44C] block">
                I Need Help
              </span>
              <span className="text-xs text-[#A8A194] block mt-0.5">
                Broadcast your live coordinates so loved ones can locate you
              </span>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#161412] text-[#E9B44C] border border-[#E9B44C]/30 shrink-0">
            Alert
          </span>
        </button>

        {/* INJURED */}
        <button
          onClick={() => handleStatusBroadcast('INJURED')}
          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 active:scale-[0.98] ${
            currentStatus === 'INJURED'
              ? 'bg-[#331C1A] text-[#F7F4EE] border-[#E07A5F] shadow-md ring-2 ring-[#E07A5F]/30'
              : 'bg-[#201D1A] hover:bg-[#27231F] text-[#F7F4EE] border-[#332E29]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E07A5F]/20 border border-[#E07A5F]/40 flex items-center justify-center text-xl shrink-0">
              ⚠️
            </div>
            <div>
              <span className="text-sm font-semibold text-[#E07A5F] block">
                Injured / Medical Care
              </span>
              <span className="text-xs text-[#A8A194] block mt-0.5">
                Urgent notice for medical assist, bandages or rescue
              </span>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#161412] text-[#E07A5F] border border-[#E07A5F]/30 shrink-0">
            Urgent
          </span>
        </button>
      </div>

      {/* Handcrafted Physical Signaling Tools */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onToggleStrobe}
          className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 ${
            isStrobeActive
              ? 'bg-[#E07A5F] text-white border-white shadow-lg'
              : 'bg-[#201D1A] hover:bg-[#27231F] text-[#D6D0C4] border-[#332E29]'
          }`}
        >
          <Zap className={`w-5 h-5 ${isStrobeActive ? 'text-white' : 'text-[#E9B44C]'}`} />
          <span className="text-xs font-semibold">
            {isStrobeActive ? 'Stop Strobe' : 'Screen Torch'}
          </span>
          <span className="text-[10px] text-[#A8A194]">High-contrast visual beacon</span>
        </button>

        <button
          onClick={toggleSiren}
          className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 ${
            isSirenActive
              ? 'bg-[#E9B44C] text-[#161412] border-white shadow-lg font-semibold'
              : 'bg-[#201D1A] hover:bg-[#27231F] text-[#D6D0C4] border-[#332E29]'
          }`}
        >
          {isSirenActive ? (
            <VolumeX className="w-5 h-5 text-[#161412]" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#81B29A]" />
          )}
          <span className="text-xs font-semibold">
            {isSirenActive ? 'Stop Chime' : 'Audio SOS Beacon'}
          </span>
          <span className="text-[10px] text-[#A8A194]">Acoustic locator pulse</span>
        </button>
      </div>

      {/* Situational Message Input */}
      <div className="p-4 rounded-2xl bg-[#201D1A] border border-[#332E29] space-y-2.5">
        <label className="block text-xs font-medium text-[#F7F4EE]">
          Add a note for your circle:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g., Mom and I are safe on the second floor..."
            className="flex-1 bg-[#161412] border border-[#332E29] rounded-xl px-3.5 py-2.5 text-xs text-[#F7F4EE] placeholder-[#8B8477] focus:outline-none focus:border-[#E07A5F]"
          />
          <button
            onClick={() => handleStatusBroadcast(currentStatus)}
            className="px-4 py-2.5 bg-[#E07A5F] hover:bg-[#D96B50] active:scale-95 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-transform shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>

        {/* Quick Triage Presets */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] text-[#A8A194] block">Tap a common message:</span>
          <div className="flex flex-col gap-1.5">
            {EMERGENCY_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleStatusBroadcast(currentStatus, preset)}
                className="text-left text-xs p-2 rounded-xl bg-[#161412] border border-[#2C2722] text-[#D6D0C4] hover:text-[#F7F4EE] hover:border-[#38332E] transition-colors leading-relaxed"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reassuring Quiet Telemetry Footer */}
      <div className="p-3 rounded-2xl bg-[#1A1815] border border-[#2C2722] text-xs text-[#A8A194] flex items-center justify-between">
        <span>Current Coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
        {lastBroadcastTimestamp && (
          <span className="text-[#81B29A] font-medium">Shared at {lastBroadcastTimestamp}</span>
        )}
      </div>
    </div>
  );
};
