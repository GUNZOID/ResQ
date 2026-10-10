import React, { useState } from 'react';
import type { FamilyMember, SafeZone, DisasterScenario } from '../../types';
import { calculateDistanceMeters, calculateBearing, formatDistance } from '../../services/geofence';
import { GoogleTacticalMap } from '../GoogleTacticalMap';
import { MiniMap } from '../MiniMap';
import {
  Compass,
  ChevronUp,
  ChevronDown,
  Navigation,
  Heart,
  BatteryCharging,
} from 'lucide-react';

interface MapScreenProps {
  userLocation: { lat: number; lng: number };
  circleMembers: FamilyMember[];
  safeZones: SafeZone[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  disasterScenario: DisasterScenario;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  userLocation,
  circleMembers,
  safeZones,
  selectedMemberId,
  onSelectMember,
  disasterScenario,
}) => {
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);

  const selectedMember = circleMembers.find((m) => m.id === selectedMemberId) || circleMembers[0];

  const distMeters = selectedMember
    ? calculateDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        selectedMember.lastLat,
        selectedMember.lastLng
      )
    : 0;
  const bearing = selectedMember
    ? calculateBearing(
        userLocation.lat,
        userLocation.lng,
        selectedMember.lastLat,
        selectedMember.lastLng
      )
    : { degrees: 0, cardinal: 'N' };

  return (
    <div className="relative w-full h-[calc(100dvh-130px)] flex flex-col bg-[#161412] font-sans">
      {/* Floating Warm Controls Top Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          {/* Radar HUD Toggle Pill */}
          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#201D1A]/95 backdrop-blur-md border border-[#332E29] text-xs font-medium text-[#F7F4EE] shadow-lg active:scale-95 transition-transform"
          >
            <Compass className="w-3.5 h-3.5 text-[#81B29A]" />
            <span>{showMiniMap ? 'Hide Radar' : 'Range Radar'}</span>
            {showMiniMap ? <ChevronUp className="w-3 h-3 text-[#A8A194]" /> : <ChevronDown className="w-3 h-3 text-[#A8A194]" />}
          </button>

          {/* Quick Layers Toggle */}
          <div className="flex items-center gap-1 bg-[#201D1A]/95 backdrop-blur-md border border-[#332E29] rounded-full p-1 shadow-lg text-[11px]">
            <button
              onClick={() => setShowVectors(!showVectors)}
              className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                showVectors ? 'bg-[#6495ED] text-white' : 'text-[#A8A194]'
              }`}
            >
              Vectors
            </button>
            <button
              onClick={() => setShowBreadcrumbs(!showBreadcrumbs)}
              className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                showBreadcrumbs ? 'bg-[#81B29A] text-[#161412] font-semibold' : 'text-[#A8A194]'
              }`}
            >
              Trails
            </button>
          </div>
        </div>

        {/* Collapsible Mini Radar HUD Widget */}
        {showMiniMap && (
          <div className="pointer-events-auto animate-in slide-in-from-top-2 duration-150">
            <MiniMap
              userLocation={userLocation}
              circleMembers={circleMembers}
              safeZones={safeZones}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
            />
          </div>
        )}
      </div>

      {/* Main Google Maps Tactical Container */}
      <div className="flex-1 w-full h-full">
        <GoogleTacticalMap
          userLocation={userLocation}
          circleMembers={circleMembers}
          safeZones={safeZones}
          selectedMemberId={selectedMemberId}
          onSelectMember={onSelectMember}
          disasterScenario={disasterScenario}
          showBreadcrumbs={showBreadcrumbs}
          showVectors={showVectors}
        />
      </div>

      {/* Floating Bottom Contact Glance Card */}
      {selectedMember && (
        <div className="absolute bottom-16 left-3 right-3 z-[1000] p-3.5 rounded-2xl bg-[#201D1A]/95 backdrop-blur-md border border-[#332E29] shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={selectedMember.avatarUrl}
              alt={selectedMember.name}
              className="w-11 h-11 rounded-2xl object-cover border border-[#332E29] shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-[#F7F4EE] truncate">
                  {selectedMember.name}
                </span>
                <span className="text-xs text-[#A8A194] shrink-0">
                  ({selectedMember.relation})
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6495ED] mt-0.5">
                <span>{formatDistance(distMeters)} ({bearing.cardinal})</span>
                <span className="text-[#A8A194]">·</span>
                <span
                  className={
                    selectedMember.batteryLevel <= 15 ? 'text-[#E07A5F] font-semibold' : 'text-[#81B29A]'
                  }
                >
                  {selectedMember.batteryLevel}% battery
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onSelectMember(selectedMember.id)}
              className="px-3.5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#D96B50] text-white font-medium text-xs shadow-sm active:scale-95 transition-transform"
            >
              Focus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
