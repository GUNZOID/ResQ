import React, { useState, useRef, useEffect } from 'react';
import type { FamilyMember, EmergencyStatus } from '../../types';
import { soundAlert } from '../../services/soundAlert';
import {
  Radio,
  Volume2,
  VolumeX,
  Zap,
  Check,
  ArrowRight,
  ShieldAlert,
  Battery,
  AlertOctagon,
  ChevronLeft,
  Shield,
  HeartPulse,
  Flame,
} from 'lucide-react';

interface SafeZDedicatedSosScreenProps {
  circleMembers: FamilyMember[];
  myStatus: EmergencyStatus;
  myBattery: number;
  onUpdateStatus: (status: EmergencyStatus) => void;
  onToggleStrobe: () => void;
  isStrobeActive: boolean;
  onBackToHome: () => void;
}

export const SafeZDedicatedSosScreen: React.FC<SafeZDedicatedSosScreenProps> = ({
  circleMembers,
  myStatus,
  myBattery,
  onUpdateStatus,
  onToggleStrobe,
  isStrobeActive,
  onBackToHome,
}) => {
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);
  const [isSosActive, setIsSosActive] = useState<boolean>(myStatus === 'CRITICAL_SOS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Smooth Slider Pointer Drag
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [dragProgress, setDragProgress] = useState<number>(myStatus === 'CRITICAL_SOS' ? 1 : 0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    setIsSosActive(myStatus === 'CRITICAL_SOS');
    if (myStatus === 'CRITICAL_SOS') {
      setDragProgress(1);
    } else {
      setDragProgress(0);
    }
  }, [myStatus]);

  const handleSosTrigger = () => {
    setIsSosActive(true);
    setDragProgress(1);
    onUpdateStatus('CRITICAL_SOS');
    soundAlert.playSosChime();
    setToastMessage('🚨 Emergency SOS transmitted to all circle nodes!');
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSosCancel = () => {
    setIsSosActive(false);
    setDragProgress(0);
    onUpdateStatus('SAFE');
    soundAlert.playStatusChime();
    setToastMessage('🟢 Marked Safe. Broadcast cleared.');
    setTimeout(() => setToastMessage(null), 4000);
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

  // Pointer drag event handlers for SOS Slider
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSosActive) return;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateDrag(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateDrag(e.clientX);
  };

  const updateDrag = (clientX: number) => {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const maxSlide = rect.width - 52;
    const offset = Math.max(0, Math.min(clientX - rect.left - 24, maxSlide));
    const progress = offset / maxSlide;
    setDragProgress(progress);

    if (progress >= 0.85) {
      setIsDragging(false);
      setDragProgress(1);
      handleSosTrigger();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    if (dragProgress >= 0.65) {
      setDragProgress(1);
      handleSosTrigger();
    } else {
      setDragProgress(0);
    }
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-28 text-white select-none max-w-[440px] mx-auto w-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181A24] border border-[#272A3A] text-xs font-medium text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Emergency Armed</span>
        </div>
      </div>

      <div className="text-center my-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Emergency SOS
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          One-tap acoustic, optical & P2P mesh distress signal
        </p>
      </div>

      {/* Centerpiece: Glowing Concentric SOS Button */}
      <div className="my-4 sm:my-6 flex flex-col items-center justify-center">
        {/* Outer glowing ring */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-rose-500/20 bg-rose-500/5 flex items-center justify-center animate-sos-pulse-ring">
          {/* Middle glowing ring */}
          <div className="w-42 h-42 sm:w-48 sm:h-48 rounded-full border border-rose-500/35 bg-rose-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(255,71,87,0.3)]">
            {/* Core Circular SOS Button */}
            <button
              onClick={isSosActive ? handleSosCancel : handleSosTrigger}
              className={`w-30 h-30 sm:w-34 sm:h-34 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 active:scale-95 cursor-pointer select-none ${
                isSosActive
                  ? 'bg-gradient-to-b from-red-600 to-red-800 shadow-[0_0_60px_rgba(255,40,40,0.9)] ring-4 ring-red-400 animate-pulse'
                  : 'bg-gradient-to-b from-[#FF5252] via-[#FF3838] to-[#D32F2F] shadow-[0_0_50px_rgba(255,56,56,0.7)] hover:shadow-[0_0_60px_rgba(255,56,56,0.85)]'
              }`}
              title={isSosActive ? 'Tap to cancel SOS' : 'Tap to broadcast SOS'}
              aria-label="SOS Emergency Button"
            >
              <Radio className="w-7 h-7 mb-1 stroke-[2.2] animate-soft-pulse" />
              <span className="text-xl sm:text-2xl font-black tracking-wider uppercase">SOS</span>
            </button>
          </div>
        </div>

        {/* 4 Overlapping Avatar Bubbles + Info Text */}
        <div className="mt-3 flex flex-col items-center gap-1.5">
          <div className="flex -space-x-2 overflow-hidden py-0.5">
            {circleMembers.slice(0, 4).map((member) => (
              <img
                key={member.id}
                src={member.avatarUrl}
                alt={member.name}
                className="inline-block w-6 h-6 rounded-full ring-2 ring-[#0B0C10] object-cover bg-gray-800"
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 font-medium">
            Your SOS broadcast reaches {circleMembers.length} Delhi circle contacts
          </p>
        </div>
      </div>

      {/* Emergency Hotkeys: Police (112), Ambulance (108), Fire (101) */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {/* Police */}
        <a
          href="tel:112"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-[#13151F] hover:bg-[#191C2A] border border-[#232738] hover:border-blue-500/40 text-white transition-all active:scale-95 shadow-sm group text-center"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-1.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-200 leading-tight">Police</span>
          <span className="text-[10px] text-blue-400/90 font-mono font-semibold mt-0.5">112 / 100</span>
        </a>

        {/* Ambulance */}
        <a
          href="tel:108"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-[#13151F] hover:bg-[#191C2A] border border-[#232738] hover:border-rose-500/40 text-white transition-all active:scale-95 shadow-sm group text-center"
        >
          <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-1.5 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <HeartPulse className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-200 leading-tight">Ambulance</span>
          <span className="text-[10px] text-rose-400/90 font-mono font-semibold mt-0.5">108 / 102</span>
        </a>

        {/* Fire Brigade */}
        <a
          href="tel:101"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-[#13151F] hover:bg-[#191C2A] border border-[#232738] hover:border-orange-500/40 text-white transition-all active:scale-95 shadow-sm group text-center"
        >
          <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-1.5 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-200 leading-tight">Fire Brigade</span>
          <span className="text-[10px] text-orange-400/90 font-mono font-semibold mt-0.5">101</span>
        </a>
      </div>

      {/* Slide to Launch SOS Pill with Perfect Circle Knob */}
      <div className="w-full max-w-sm mx-auto mb-4">
        <div
          ref={sliderTrackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative h-14 rounded-full p-1 flex items-center select-none overflow-hidden transition-colors duration-300 shadow-lg cursor-pointer touch-none ${
            isSosActive
              ? 'bg-[#1C0F14] border-2 border-rose-500 shadow-[0_0_25px_rgba(255,71,87,0.4)]'
              : 'bg-[#12141D] border border-[#242838]'
          }`}
        >
          {/* Track Text Label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-bold tracking-wider uppercase text-gray-300 select-none">
            {isSosActive ? '🚨 SOS ACTIVE · TAP TO CLEAR' : 'SLIDE TO BROADCAST SOS'}
          </div>

          {/* Perfect Circle Red Slider Knob */}
          <div
            style={{
              transform: `translateX(${
                isSosActive
                  ? (sliderTrackRef.current ? sliderTrackRef.current.clientWidth - 54 : 220)
                  : dragProgress * (sliderTrackRef.current ? sliderTrackRef.current.clientWidth - 54 : 220)
              }px)`,
              transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className={`relative z-10 w-12 h-12 rounded-full aspect-square shrink-0 flex items-center justify-center shadow-xl transition-colors cursor-grab active:cursor-grabbing ${
              isSosActive
                ? 'bg-white text-rose-600 shadow-[0_0_20px_rgba(255,255,255,0.9)]'
                : 'bg-gradient-to-tr from-red-600 via-rose-600 to-pink-500 text-white shadow-[0_4px_14px_rgba(225,29,72,0.6)]'
            }`}
          >
            {isSosActive ? (
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            ) : (
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
        </div>

        {isSosActive && (
          <button
            onClick={handleSosCancel}
            className="mt-2 w-full py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-xs font-bold text-rose-300 border border-rose-500/40 transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Cancel SOS Alarm & Mark Safe</span>
          </button>
        )}
      </div>

      {/* Emergency Utility Toggles */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#141620] border border-[#222534]">
        <button
          onClick={handleToggleAlarm}
          className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2.5 text-xs font-semibold transition-all ${
            isAlarmPlaying
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
              : 'bg-[#181A24] text-gray-300 hover:text-white border border-[#272A3A]'
          }`}
        >
          {isAlarmPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{isAlarmPlaying ? 'Stop Siren' : 'Siren Alarm'}</span>
        </button>

        <button
          onClick={onToggleStrobe}
          className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2.5 text-xs font-semibold transition-all ${
            isStrobeActive
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-[#181A24] text-gray-300 hover:text-white border border-[#272A3A]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Optical Strobe</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-4 right-4 max-w-[400px] mx-auto z-50 p-3 rounded-2xl bg-[#181A24] border border-[#2A2E40] shadow-xl text-xs font-medium text-white flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
