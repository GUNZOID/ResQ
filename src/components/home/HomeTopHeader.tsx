import React from 'react';
import type { FamilyMember, EmergencyStatus } from '../../types';
import { Radio, Plus, Shield, Battery, UserPlus } from 'lucide-react';

interface HomeTopHeaderProps {
  circleMembers: FamilyMember[];
  userLocation: { lat: number; lng: number };
  myStatus: EmergencyStatus;
  myBattery: number;
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  onOpenPairing: () => void;
}

export const HomeTopHeader: React.FC<HomeTopHeaderProps> = ({
  circleMembers,
  myStatus,
  myBattery,
  selectedMemberId,
  onSelectMember,
  onOpenPairing,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-[500] border-b border-gray-100">
      {/* Top Navbar Row */}
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">
              ResQ<span className="text-blue-600 font-light">Mesh</span>
            </h1>
            <span className="text-[10px] text-gray-400 font-medium">Disaster Lifeline</span>
          </div>
        </div>

        {/* Status Pill & Actions */}
        <div className="flex items-center gap-2">
          {/* Active Nodes Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200/80 rounded-full text-xs font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{circleMembers.length + 1} Nodes Active</span>
          </div>

          {/* Add Circle Member Button */}
          <button
            onClick={onOpenPairing}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Pair Trusted Circle Node"
            aria-label="Pair Trusted Circle Node"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instagram-Style Family Circle "Stories" Strip */}
      <div className="max-w-2xl mx-auto px-4 pb-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
        {/* "You" Avatar */}
        <button
          onClick={() => onSelectMember(null)}
          className={`flex flex-col items-center gap-1 shrink-0 group transition-transform ${
            selectedMemberId === null ? 'scale-105' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <div className="relative">
            <div
              className={`w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr ${
                myStatus === 'CRITICAL_SOS'
                  ? 'from-red-500 to-amber-500'
                  : 'from-blue-500 to-emerald-400'
              }`}
            >
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs">
                  You
                </div>
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 max-w-[56px] truncate">
            My Node
          </span>
        </button>

        {/* Circle Members Avatars */}
        {circleMembers.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const ringGradient =
            member.status === 'CRITICAL_SOS'
              ? 'from-red-600 to-rose-400'
              : member.status === 'NEED_HELP' || member.status === 'INJURED'
              ? 'from-amber-500 to-yellow-400'
              : 'from-emerald-500 to-teal-400';

          return (
            <button
              key={member.id}
              onClick={() => onSelectMember(isSelected ? null : member.id)}
              className={`flex flex-col items-center gap-1 shrink-0 group transition-transform ${
                isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
              }`}
            >
              <div className="relative">
                <div className={`w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr ${ringGradient}`}>
                  <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    member.status === 'CRITICAL_SOS'
                      ? 'bg-red-500'
                      : member.status === 'NEED_HELP' || member.status === 'INJURED'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
              <span className="text-[11px] font-medium text-gray-700 max-w-[58px] truncate">
                {member.name}
              </span>
            </button>
          );
        })}

        {/* Pair New Member Story Button */}
        <button
          onClick={onOpenPairing}
          className="flex flex-col items-center gap-1 shrink-0 group opacity-70 hover:opacity-100 transition-opacity"
        >
          <div className="w-13 h-13 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-gray-500">Pair Node</span>
        </button>
      </div>
    </header>
  );
};
