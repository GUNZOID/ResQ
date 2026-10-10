import React from 'react';
import type { FamilyMember, SafeZone } from '../types';
import { calculateDistanceMeters, calculateBearing, formatDistance } from '../services/geofence';
import { Compass } from 'lucide-react';

interface MiniMapProps {
  userLocation: { lat: number; lng: number };
  circleMembers: FamilyMember[];
  safeZones: SafeZone[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  userLocation,
  circleMembers,
  safeZones,
  selectedMemberId,
  onSelectMember,
}) => {
  const MAX_RADAR_RADIUS_METERS = 3000;
  const RADAR_PIXEL_RADIUS = 84;

  return (
    <div className="relative p-3.5 bg-[#201D1A]/95 backdrop-blur-md rounded-2xl border border-[#332E29] shadow-xl overflow-hidden font-sans">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#F7F4EE]">
          <Compass className="w-3.5 h-3.5 text-[#81B29A]" />
          <span>Local Range Scope</span>
        </div>
        <span className="text-[10px] text-[#A8A194]">3.0 km reach</span>
      </div>

      {/* Circular Radar Scope with Warm Earth Palette */}
      <div className="relative w-[180px] h-[180px] mx-auto rounded-full bg-[#161412] border border-[#332E29] overflow-hidden flex items-center justify-center shadow-inner">
        {/* Concentric Distance Rings */}
        <div className="absolute w-[140px] h-[140px] rounded-full border border-dashed border-[#2C2722] pointer-events-none" />
        <div className="absolute w-[90px] h-[90px] rounded-full border border-[#2C2722] pointer-events-none" />
        <div className="absolute w-[44px] h-[44px] rounded-full border border-dashed border-[#2C2722] pointer-events-none" />

        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-[#24201C] pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-[#24201C] pointer-events-none" />

        {/* Compass Cardinal Points */}
        <span className="absolute top-1 text-[8px] font-semibold text-[#81B29A] pointer-events-none">N</span>
        <span className="absolute bottom-1 text-[8px] text-[#7A7366] pointer-events-none">S</span>
        <span className="absolute right-1 text-[8px] text-[#7A7366] pointer-events-none">E</span>
        <span className="absolute left-1 text-[8px] text-[#7A7366] pointer-events-none">W</span>

        {/* Radar Sweeping Beam: Soft Honey / Sage Conic Gradient */}
        <div
          className="absolute inset-0 origin-center pointer-events-none animate-radar"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 315deg, rgba(129, 178, 154, 0.22) 360deg)',
          }}
        />

        {/* Safe Zones Blips */}
        {safeZones.map((zone) => {
          const dist = calculateDistanceMeters(
            userLocation.lat,
            userLocation.lng,
            zone.lat,
            zone.lng
          );
          if (dist > MAX_RADAR_RADIUS_METERS) return null;

          const bearing = calculateBearing(
            userLocation.lat,
            userLocation.lng,
            zone.lat,
            zone.lng
          );
          const rad = ((bearing.degrees - 90) * Math.PI) / 180;
          const r = (dist / MAX_RADAR_RADIUS_METERS) * RADAR_PIXEL_RADIUS;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;

          return (
            <div
              key={zone.id}
              className="absolute w-2.5 h-2.5 rounded-full border border-[#81B29A] bg-[#81B29A]/20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              title={`Safe Haven: ${zone.name} (${formatDistance(dist)})`}
            />
          );
        })}

        {/* Family Member Blips */}
        {circleMembers.map((member) => {
          const dist = calculateDistanceMeters(
            userLocation.lat,
            userLocation.lng,
            member.lastLat,
            member.lastLng
          );
          if (dist > MAX_RADAR_RADIUS_METERS) return null;

          const bearing = calculateBearing(
            userLocation.lat,
            userLocation.lng,
            member.lastLat,
            member.lastLng
          );
          const rad = ((bearing.degrees - 90) * Math.PI) / 180;
          const r = (dist / MAX_RADAR_RADIUS_METERS) * RADAR_PIXEL_RADIUS;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;

          const isSelected = member.id === selectedMemberId;
          const blipBg =
            member.status === 'SAFE'
              ? 'bg-[#81B29A]'
              : member.status === 'NEED_HELP'
              ? 'bg-[#E9B44C]'
              : 'bg-[#E07A5F]';

          return (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform ${
                isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
              }`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              title={`${member.name}: ${formatDistance(dist)} ${bearing.cardinal}`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full ${blipBg} border border-[#161412] flex items-center justify-center text-[7px] font-bold text-[#161412] shadow-md ${
                  isSelected ? 'ring-2 ring-[#E07A5F]' : ''
                }`}
              >
                {member.name.charAt(0)}
              </div>
            </button>
          );
        })}

        {/* Center Node (Current User) */}
        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#E07A5F] border border-white z-30 shadow-sm" />
      </div>

      {/* Mini-Map Footer Snapshot */}
      <div className="mt-2.5 pt-2 border-t border-[#332E29] text-[11px] text-[#A8A194] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A]" />
          {circleMembers.filter((m) => m.status === 'SAFE').length} Safe
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E9B44C]" />
          {circleMembers.filter((m) => m.status === 'NEED_HELP' || m.status === 'INJURED').length} Attention
        </span>
      </div>
    </div>
  );
};
