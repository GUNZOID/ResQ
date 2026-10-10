import React, { useState } from 'react';
import type { EmergencyStatus } from '../types';
import { soundAlert } from '../services/soundAlert';
import {
  ShieldCheck,
  HelpCircle,
  AlertOctagon,
  Flame,
  Volume2,
  VolumeX,
  Zap,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface SafetyCheckInBarProps {
  currentStatus: EmergencyStatus;
  batteryLevel: number;
  onBroadcastStatus: (status: EmergencyStatus, message?: string) => void;
  onToggleStrobe: () => void;
  isStrobeActive: boolean;
}

export const SafetyCheckInBar: React.FC<SafetyCheckInBarProps> = ({
  currentStatus,
  batteryLevel,
  onBroadcastStatus,
  onToggleStrobe,
  isStrobeActive,
}) => {
  const [customNote, setCustomNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState<string | null>(null);

  const handleStatusClick = (status: EmergencyStatus) => {
    onBroadcastStatus(status, customNote || undefined);
    setLastBroadcastTime(new Date().toLocaleTimeString());
    setShowNoteInput(false);
    setCustomNote('');

    if (status === 'CRITICAL_SOS') {
      soundAlert.playSosAlarm();
    } else {
      soundAlert.playTacticalPing();
    }
  };

  const toggleSoundMute = () => {
    soundAlert.isMuted = !soundAlert.isMuted;
    setIsMuted(soundAlert.isMuted);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">
            One-Tap Emergency Mesh Status Broadcaster
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            · BAT: {batteryLevel}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lastBroadcastTime && (
            <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
              Last Ping: {lastBroadcastTime}
            </span>
          )}

          {/* Strobe Light Button */}
          <button
            onClick={onToggleStrobe}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isStrobeActive
                ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Screen Flashlight / Optical Signal Strobe"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isStrobeActive ? 'Stop Strobe' : 'Visual Strobe'}</span>
          </button>

          {/* Audio Alert Mute Toggle */}
          <button
            onClick={toggleSoundMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title={isMuted ? 'Unmute Audio Beacons' : 'Mute Audio Beacons'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Primary Action Buttons: High Contrast Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* I'm Safe */}
        <button
          onClick={() => handleStatusClick('SAFE')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg border font-semibold text-xs transition-all ${
            currentStatus === 'SAFE'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-900/40 ring-2 ring-emerald-500/50'
              : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/80'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="truncate">I'm Safe</span>
        </button>

        {/* Need Help */}
        <button
          onClick={() => handleStatusClick('NEED_HELP')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg border font-semibold text-xs transition-all ${
            currentStatus === 'NEED_HELP'
              ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/40 ring-2 ring-amber-500/50'
              : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800/80'
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="truncate">Need Help</span>
        </button>

        {/* Injured */}
        <button
          onClick={() => handleStatusClick('INJURED')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg border font-semibold text-xs transition-all ${
            currentStatus === 'INJURED'
              ? 'bg-rose-700 text-white border-rose-400 shadow-md shadow-rose-900/40 ring-2 ring-rose-500/50'
              : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/80'
          }`}
        >
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="truncate">Injured</span>
        </button>

        {/* TRAPPED / CRITICAL SOS */}
        <button
          onClick={() => handleStatusClick('CRITICAL_SOS')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg border font-bold text-xs uppercase tracking-wider transition-all ${
            currentStatus === 'CRITICAL_SOS'
              ? 'bg-red-600 text-white border-red-300 shadow-xl shadow-red-600/50 ring-4 ring-red-500 animate-pulse'
              : 'bg-red-950/70 hover:bg-red-900/80 text-red-200 border-red-700'
          }`}
        >
          <Flame className="w-4 h-4 shrink-0 text-red-400 animate-bounce" />
          <span className="truncate">SOS / Trapped</span>
        </button>
      </div>

      {/* Optional Note toggle */}
      <div className="mt-2.5 flex items-center justify-between text-xs">
        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          className="text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
        >
          {showNoteInput ? '- Hide situation detail note' : '+ Attach situation detail note (e.g., trapped on roof)'}
        </button>
      </div>

      {showNoteInput && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. 2 adults, 1 child on 2nd floor, water rising..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={() => handleStatusClick(currentStatus)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
          >
            Broadcast Note
          </button>
        </div>
      )}
    </div>
  );
};
