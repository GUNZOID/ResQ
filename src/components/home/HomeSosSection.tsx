import React, { useState } from 'react';
import type { EmergencyStatus } from '../../types';
import { soundAlert } from '../../services/soundAlert';
import {
  AlertOctagon,
  ShieldCheck,
  HelpCircle,
  Volume2,
  VolumeX,
  Zap,
  Radio,
  Check,
  Battery,
} from 'lucide-react';

interface HomeSosSectionProps {
  currentStatus: EmergencyStatus;
  batteryLevel: number;
  onUpdateStatus: (status: EmergencyStatus) => void;
  onToggleStrobe: () => void;
  isStrobeActive: boolean;
}

export const HomeSosSection: React.FC<HomeSosSectionProps> = ({
  currentStatus,
  batteryLevel,
  onUpdateStatus,
  onToggleStrobe,
  isStrobeActive,
}) => {
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);
  const [powerSaver, setPowerSaver] = useState<boolean>(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  const handleStatusClick = (status: EmergencyStatus) => {
    onUpdateStatus(status);
    soundAlert.playStatusChime();

    let text = "Broadcasted: You are marked Safe to all nodes.";
    if (status === 'CRITICAL_SOS') {
      text = "🚨 Critical SOS broadcast sent over P2P mesh!";
    } else if (status === 'NEED_HELP' || status === 'INJURED') {
      text = "⚠️ Assistance request transmitted to trusted circle.";
    }

    setBroadcastFeedback(text);
    setTimeout(() => {
      setBroadcastFeedback(null);
    }, 4000);
  };

  const handleToggleAlarm = () => {
    if (isAlarmPlaying) {
      soundAlert.stopContinuousAlarm();
      setIsAlarmPlaying(false);
    } else {
      soundAlert.startContinuousAlarm();
      setIsAlarmPlaying(true);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 tracking-tight">Emergency Status</h3>
          <p className="text-xs text-gray-500 mt-0.5">One-tap beacon transmitted across local peer mesh</p>
        </div>

        {/* Current Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            currentStatus === 'CRITICAL_SOS'
              ? 'bg-red-50 text-red-600 border border-red-200'
              : currentStatus === 'NEED_HELP' || currentStatus === 'INJURED'
              ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              currentStatus === 'CRITICAL_SOS'
                ? 'bg-red-500 animate-ping'
                : currentStatus === 'NEED_HELP' || currentStatus === 'INJURED'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
          <span>
            {currentStatus === 'CRITICAL_SOS'
              ? 'SOS Active'
              : currentStatus === 'NEED_HELP' || currentStatus === 'INJURED'
              ? 'Need Help'
              : 'Safe & OK'}
          </span>
        </div>
      </div>

      {/* Broadcast Feedback Toast */}
      {broadcastFeedback && (
        <div className="mb-4 px-3.5 py-2.5 bg-gray-900 text-white text-xs font-medium rounded-2xl flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>{broadcastFeedback}</span>
          </div>
          <span className="text-[11px] text-gray-400">Encrypted</span>
        </div>
      )}

      {/* 3 Main Accessible Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Emergency SOS */}
        <button
          onClick={() => handleStatusClick('CRITICAL_SOS')}
          className={`relative group p-3.5 rounded-2xl flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2 text-left transition-all ${
            currentStatus === 'CRITICAL_SOS'
              ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400 ring-offset-2'
              : 'bg-red-50/70 hover:bg-red-100/80 text-red-900 border border-red-200/60 active:scale-[0.98]'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-2">
            <div
              className={`p-2 rounded-xl ${
                currentStatus === 'CRITICAL_SOS' ? 'bg-white/20' : 'bg-red-500 text-white'
              }`}
            >
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-sm tracking-tight leading-snug">Emergency SOS</span>
              <span
                className={`text-[11px] ${
                  currentStatus === 'CRITICAL_SOS' ? 'text-red-100' : 'text-red-700/80'
                }`}
              >
                Immediate Danger
              </span>
            </div>
          </div>
          {currentStatus === 'CRITICAL_SOS' && (
            <div className="sm:hidden px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-bold">
              ACTIVE
            </div>
          )}
        </button>

        {/* 2. Need Assistance */}
        <button
          onClick={() => handleStatusClick('NEED_HELP')}
          className={`relative group p-3.5 rounded-2xl flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2 text-left transition-all ${
            currentStatus === 'NEED_HELP'
              ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300 ring-offset-2'
              : 'bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 border border-amber-200/60 active:scale-[0.98]'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-2">
            <div
              className={`p-2 rounded-xl ${
                currentStatus === 'NEED_HELP' ? 'bg-white/20' : 'bg-amber-500 text-white'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-sm tracking-tight leading-snug">Need Help</span>
              <span
                className={`text-[11px] ${
                  currentStatus === 'NEED_HELP' ? 'text-amber-100' : 'text-amber-700/80'
                }`}
              >
                Supplies / Aid
              </span>
            </div>
          </div>
          {currentStatus === 'NEED_HELP' && (
            <div className="sm:hidden px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-bold">
              ACTIVE
            </div>
          )}
        </button>

        {/* 3. I'm Safe */}
        <button
          onClick={() => handleStatusClick('SAFE')}
          className={`relative group p-3.5 rounded-2xl flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2 text-left transition-all ${
            currentStatus === 'SAFE'
              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 ring-offset-2'
              : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 active:scale-[0.98]'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-2">
            <div
              className={`p-2 rounded-xl ${
                currentStatus === 'SAFE' ? 'bg-white/20' : 'bg-emerald-600 text-white'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-sm tracking-tight leading-snug">I'm Safe & OK</span>
              <span
                className={`text-[11px] ${
                  currentStatus === 'SAFE' ? 'text-emerald-100' : 'text-emerald-700/80'
                }`}
              >
                Check-in with circle
              </span>
            </div>
          </div>
          {currentStatus === 'SAFE' && (
            <div className="sm:hidden px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-bold">
              ACTIVE
            </div>
          )}
        </button>
      </div>

      {/* Clean Utility Bar */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Audio Whistle / Siren Button */}
          <button
            onClick={handleToggleAlarm}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              isAlarmPlaying
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            {isAlarmPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isAlarmPlaying ? 'Stop Siren' : 'Audio Siren'}</span>
          </button>

          {/* Flashlight / Optical Beacon */}
          <button
            onClick={onToggleStrobe}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              isStrobeActive
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isStrobeActive ? 'Strobe ON' : 'Strobe'}</span>
          </button>

          {/* Mesh Battery Saver */}
          <button
            onClick={() => setPowerSaver((p) => !p)}
            className={`hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              powerSaver
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            <Battery className="w-3.5 h-3.5" />
            <span>{powerSaver ? 'Saver: On' : 'Saver'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
          <span>Battery:</span>
          <span className="font-semibold text-gray-700">{batteryLevel}%</span>
        </div>
      </div>
    </section>
  );
};
