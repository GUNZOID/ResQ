import React, { useState, useEffect } from 'react';
import { WifiOff, Radio, BatteryCharging, BatteryWarning, HeartHandshake, ShieldCheck } from 'lucide-react';

interface MobileTopBarProps {
  connectedNodesCount: number;
  batteryLevel: number;
  isCellularDown: boolean;
  onOpenQuickSos?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  connectedNodesCount,
  batteryLevel,
  isCellularDown,
}) => {
  const [timeString, setTimeString] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#161412]/95 backdrop-blur-md border-b border-[#2C2722] px-4 pt-2.5 pb-3 select-none">
      {/* Phone System Status Row */}
      <div className="flex items-center justify-between text-[11px] font-medium text-[#A8A194] mb-1.5 tracking-normal">
        <span className="font-semibold text-[#D6D0C4]">{timeString}</span>

        <div className="flex items-center gap-2">
          {isCellularDown ? (
            <span className="inline-flex items-center gap-1 text-[#E9B44C] text-[10px] bg-[#2A2318] px-2 py-0.5 rounded-full border border-[#E9B44C]/30">
              <WifiOff className="w-2.5 h-2.5" />
              <span>Offline Mesh Lifeline</span>
            </span>
          ) : (
            <span className="text-[#8B8477] text-[10px]">Cellular Active</span>
          )}

          <div className="flex items-center gap-1 text-[#D6D0C4] bg-[#201D1A] px-2 py-0.5 rounded-full border border-[#332E29]">
            {batteryLevel <= 15 ? (
              <BatteryWarning className="w-3.5 h-3.5 text-[#E07A5F] animate-pulse" />
            ) : (
              <BatteryCharging className="w-3.5 h-3.5 text-[#81B29A]" />
            )}
            <span className="tabular-nums font-mono text-[10px]">{batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* App Header Branding */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#E07A5F] flex items-center justify-center shadow-sm text-white">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-[#F7F4EE] leading-none">
              ResQ-Mesh
            </h1>
            <span className="text-[10px] text-[#A8A194] tracking-normal font-normal">
              Family & Community Lifeline
            </span>
          </div>
        </div>

        {/* Friendly Connected Circle Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#201D1A] border border-[#38332E] text-xs font-medium text-[#EAE5D9] shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81B29A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#81B29A]"></span>
          </span>
          <span className="tabular-nums font-semibold text-[#81B29A]">
            {connectedNodesCount}
          </span>
          <span className="text-[11px] text-[#C4BDB0]">In Touch</span>
        </div>
      </div>
    </header>
  );
};
