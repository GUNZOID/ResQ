import React, { useState } from 'react';
import type { FamilyMember, SafeZone } from '../types';
import { calculateDistanceMeters, calculateBearing, formatDistance } from '../services/geofence';
import {
  Users,
  UserPlus,
  BatteryCharging,
  BatteryWarning,
  Navigation2,
  Footprints,
  Shield,
  Clock,
  Radio,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TrustedCircleListProps {
  circleMembers: FamilyMember[];
  userLocation: { lat: number; lng: number };
  safeZones: SafeZone[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  onOpenPairingModal: () => void;
  onSendDirectMessage: (memberId: string, memberName: string) => void;
}

export const TrustedCircleList: React.FC<TrustedCircleListProps> = ({
  circleMembers,
  userLocation,
  safeZones,
  selectedMemberId,
  onSelectMember,
  onOpenPairingModal,
  onSendDirectMessage,
}) => {
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMemberId(expandedMemberId === id ? null : id);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">
            Trusted Family Circle
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ({circleMembers.length} paired)
          </span>
        </div>

        <button
          onClick={onOpenPairingModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Pair Node</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {circleMembers.map((member) => {
          const isSelected = member.id === selectedMemberId;
          const isExpanded = expandedMemberId === member.id;
          const distMeters = calculateDistanceMeters(
            userLocation.lat,
            userLocation.lng,
            member.lastLat,
            member.lastLng
          );
          const bearing = calculateBearing(
            userLocation.lat,
            userLocation.lng,
            member.lastLat,
            member.lastLng
          );

          // Estimated walking time (assuming ~3.5 km/h through obstacle terrain)
          const walkingMinutes = Math.round((distMeters / 1000 / 3.5) * 60);

          const statusBadge =
            member.status === 'SAFE'
              ? { text: 'Safe', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' }
              : member.status === 'NEED_HELP'
              ? { text: 'Needs Help', color: 'text-amber-400 bg-amber-950/60 border-amber-800' }
              : { text: 'Urgent / Injured', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };

          const zoneMatch = member.currentSafeZoneId
            ? safeZones.find((z) => z.id === member.currentSafeZoneId)
            : null;

          return (
            <div
              key={member.id}
              onClick={() => onSelectMember(isSelected ? null : member.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-500 ring-1 ring-sky-500/40 shadow-lg'
                  : 'bg-slate-950/70 hover:bg-slate-800/50 border-slate-800/80'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Member Avatar with Status Ring */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name
                        )}&background=0f172a&color=fff`;
                      }}
                    />
                  </div>
                  {/* Battery alert icon if critically low */}
                  {member.batteryLevel <= 15 && (
                    <div
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      title="Critical Battery Warning (< 15%)"
                    >
                      <BatteryWarning className="w-3 h-3 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Name, Relation & Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-xs text-slate-100 truncate">
                        {member.name}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        ({member.relation})
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.color} shrink-0`}
                    >
                      {statusBadge.text}
                    </span>
                  </div>

                  {member.statusMessage && (
                    <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                      "{member.statusMessage}"
                    </p>
                  )}

                  {/* Telemetry Row: Distance, Bearing, Battery & Hops */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-sky-400 font-semibold">
                      <Navigation2 className="w-3 h-3 rotate-45" />
                      {formatDistance(distMeters)} ({bearing.cardinal} {bearing.degrees}°)
                    </span>

                    <span className="flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-slate-500" />
                      ~{walkingMinutes}m walk
                    </span>

                    <span
                      className={`flex items-center gap-1 ${
                        member.batteryLevel <= 15 ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <BatteryCharging className="w-3 h-3" />
                      {member.batteryLevel}%
                    </span>

                    <span className="flex items-center gap-1 text-slate-500">
                      <Radio className="w-3 h-3" />
                      {member.hopsToNode} {member.hopsToNode === 1 ? 'direct' : 'hops'}
                    </span>
                  </div>

                  {/* Safe Zone Badge if present */}
                  {zoneMatch && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 text-[10px] font-medium">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span>Inside Safe Zone: {zoneMatch.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => toggleExpand(member.id, e)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    Beacon Trail ({member.breadcrumbs?.length || 0})
                  </span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendDirectMessage(member.id, member.name);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-[11px] font-medium border border-slate-700 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Ping Node</span>
                  </button>
                </div>
              </div>

              {/* Expanded Last Known Beacon Trail History */}
              {isExpanded && member.breadcrumbs && member.breadcrumbs.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 space-y-1.5 text-[11px] font-mono">
                  <p className="text-slate-400 font-sans font-semibold text-[11px]">
                    IndexedDB Stored Beacon Trail:
                  </p>
                  {member.breadcrumbs.map((bc, idx) => (
                    <div
                      key={bc.id}
                      className="flex items-center justify-between py-1 px-2 rounded bg-slate-900 border border-slate-800/60 text-slate-300"
                    >
                      <span>
                        #{idx + 1} · {new Date(bc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-slate-400">
                        {bc.lat.toFixed(4)}, {bc.lng.toFixed(4)}
                      </span>
                      <span className="text-emerald-400">{bc.battery}% bat</span>
                      <span className="text-sky-400">{bc.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
