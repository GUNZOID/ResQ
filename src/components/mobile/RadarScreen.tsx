import React, { useState } from 'react';
import type { FamilyMember, SafeZone, GeofenceEvent, OutboxMessage } from '../../types';
import { calculateDistanceMeters, calculateBearing, formatDistance } from '../../services/geofence';
import {
  UserPlus,
  BatteryCharging,
  BatteryWarning,
  Navigation,
  Clock,
  Send,
  Radio,
  ChevronRight,
  Shield,
  X,
  Heart,
  MessageCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface RadarScreenProps {
  circleMembers: FamilyMember[];
  userLocation: { lat: number; lng: number };
  safeZones: SafeZone[];
  outboxMessages: OutboxMessage[];
  recentGeofenceEvents: GeofenceEvent[];
  onOpenPairModal: () => void;
  onSendRadioMessage: (targetId: string, content: string) => void;
  onSelectMemberForMap: (memberId: string) => void;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({
  circleMembers,
  userLocation,
  safeZones,
  outboxMessages,
  recentGeofenceEvents,
  onOpenPairModal,
  onSendRadioMessage,
  onSelectMemberForMap,
}) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [quickRadioText, setQuickRadioText] = useState('');

  const handleQuickRadioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRadioText.trim()) return;
    onSendRadioMessage('TRUSTED_CIRCLE', quickRadioText.trim());
    setQuickRadioText('');
  };

  return (
    <div className="flex flex-col min-h-full pb-24 px-4 pt-4 space-y-4 font-sans">
      {/* Circle Header & Pairing Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#F7F4EE] tracking-tight flex items-center gap-2">
            <span>Our Trusted Circle</span>
            <span className="text-xs font-medium text-[#A8A194] bg-[#201D1A] px-2 py-0.5 rounded-full border border-[#332E29]">
              {circleMembers.length} loved ones
            </span>
          </h2>
          <p className="text-xs text-[#A8A194] mt-0.5">
            Direct peer pings · Works without cellular towers or internet
          </p>
        </div>

        <button
          onClick={onOpenPairModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#201D1A] hover:bg-[#27231F] border border-[#332E29] text-[#D6D0C4] text-xs font-medium shadow-sm transition-all active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#E07A5F]" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Vertical Stream of Contact Cards with Handcrafted Warmth */}
      <div className="space-y-2.5">
        {circleMembers.map((member) => {
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

          const isSafe = member.status === 'SAFE';
          const isHelp = member.status === 'NEED_HELP';
          const isSOS = member.status === 'INJURED' || member.status === 'CRITICAL_SOS';

          const statusRingColor = isSafe
            ? 'ring-[#81B29A]'
            : isHelp
            ? 'ring-[#E9B44C]'
            : 'ring-[#E07A5F]';

          const statusLabel = isSafe ? 'Safe & OK' : isHelp ? 'Needs Help' : 'Medical Care';

          const zoneMatch = member.currentSafeZoneId
            ? safeZones.find((z) => z.id === member.currentSafeZoneId)
            : null;

          const minutesAgo = Math.max(
            1,
            Math.round((Date.now() - member.lastSeenTimestamp) / 60000)
          );

          const isLostTouch = !member.isOnline || minutesAgo > 10;

          return (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="p-3.5 rounded-2xl bg-[#201D1A] border border-[#332E29] hover:border-[#423C36] active:bg-[#27231F] transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-start gap-3.5">
                {/* Avatar with Soft Status Ring */}
                <div className="relative shrink-0 mt-0.5">
                  <div className={`w-12 h-12 rounded-2xl overflow-hidden bg-[#161412] ring-2 ${statusRingColor} p-0.5`}>
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name
                        )}&background=201D1A&color=F7F4EE`;
                      }}
                    />
                  </div>
                  {member.batteryLevel <= 15 && (
                    <div className="absolute -bottom-1 -right-1 bg-[#E07A5F] text-white rounded-full p-0.5 shadow-md">
                      <BatteryWarning className="w-3 h-3 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-sm text-[#F7F4EE] truncate">
                        {member.name}
                      </span>
                      <span className="text-xs text-[#A8A194] shrink-0">
                        · {member.relation}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
                        isSafe
                          ? 'bg-[#81B29A]/15 text-[#81B29A] border border-[#81B29A]/30'
                          : isHelp
                          ? 'bg-[#E9B44C]/15 text-[#E9B44C] border border-[#E9B44C]/30'
                          : 'bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Grounded Human Micro-Copy Field Note */}
                  <p className="text-xs text-[#D6D0C4] line-clamp-2 leading-relaxed">
                    "{member.statusMessage}"
                  </p>

                  {/* Telemetry Row: Warm & Approachable */}
                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-[#6495ED] font-medium">
                      <Navigation className="w-3 h-3 rotate-45" />
                      {formatDistance(distMeters)} ({bearing.cardinal})
                    </span>

                    <span
                      className={`flex items-center gap-1 font-mono text-[11px] ${
                        member.batteryLevel <= 15
                          ? 'text-[#E07A5F] font-semibold'
                          : member.batteryLevel <= 30
                          ? 'text-[#E9B44C]'
                          : 'text-[#81B29A]'
                      }`}
                    >
                      <BatteryCharging className="w-3 h-3" />
                      {member.batteryLevel}%
                    </span>

                    <span className="text-[#A8A194]">
                      {isLostTouch ? (
                        <span className="text-[#E9B44C]">Last seen {minutesAgo}m ago</span>
                      ) : (
                        <span>Seen {minutesAgo}m ago</span>
                      )}
                    </span>
                  </div>

                  {/* Safe Zone Tag */}
                  {zoneMatch && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#1A261D] border border-[#81B29A]/40 text-[#81B29A] text-[11px] font-medium">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="truncate">Sheltered at {zoneMatch.name}</span>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-[#8B8477] shrink-0 mt-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Auto-Alerts Feed Log */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#81B29A] animate-pulse" />
            <h3 className="text-xs font-semibold text-[#F7F4EE] tracking-normal">
              Live Family Timeline & Check-Ins
            </h3>
          </div>
          <span className="text-[11px] text-[#A8A194]">Mesh Updates</span>
        </div>

        {/* Timeline Log Container */}
        <div className="bg-[#201D1A] border border-[#332E29] rounded-2xl p-3.5 space-y-2.5 max-h-56 overflow-y-auto no-scrollbar shadow-inner">
          {/* Authentic Grounded Disaster Events */}
          <div className="p-2.5 rounded-xl bg-[#161412] border border-[#81B29A]/30 text-xs flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#81B29A] mt-1 shrink-0 animate-ping" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#A8A194] mb-0.5">
                <span className="text-[#81B29A] font-semibold">Safe Haven Reached</span>
                <span>6m ago</span>
              </div>
              <p className="text-[#D6D0C4] leading-relaxed">
                <strong>Brother</strong> reached <strong>Summit Hill Safe Haven</strong>. Auto-shared with your family circle.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#161412] border border-[#E9B44C]/30 text-xs flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#E9B44C] mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#A8A194] mb-0.5">
                <span className="text-[#E9B44C] font-semibold">Battery Care Warning</span>
                <span>2m ago</span>
              </div>
              <p className="text-[#D6D0C4] leading-relaxed">
                <strong>Mummy's</strong> battery dropped to 14%. Packet relayed via Uncle Robert's emergency vehicle.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#161412] border border-[#332E29] text-xs flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#6495ED] mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-[#A8A194] mb-0.5">
                <span className="text-[#6495ED] font-semibold">Signal Relay Route</span>
                <span>14m ago</span>
              </div>
              <p className="text-[#D6D0C4] leading-relaxed">
                Lost touch with <strong>Sarah's</strong> node near eastern flood perimeter. Attempting multi-hop reroute...
              </p>
            </div>
          </div>

          {/* Dynamic Geofence Events */}
          {recentGeofenceEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-2.5 rounded-xl bg-[#161412] border border-[#81B29A]/50 text-xs flex items-start gap-2.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#81B29A] mt-1 shrink-0 animate-ping" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] text-[#A8A194] mb-0.5">
                  <span className="text-[#81B29A] font-semibold">Safe Haven Check-In</span>
                  <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[#D6D0C4] leading-relaxed">
                  <strong>{evt.memberName}</strong> entered <strong>{evt.zoneName}</strong>! Auto-relayed to circle.
                </p>
              </div>
            </div>
          ))}

          {/* Outbox Messages */}
          {outboxMessages.slice(0, 3).map((msg) => (
            <div
              key={msg.id}
              className="p-2.5 rounded-xl bg-[#161412] border border-[#332E29] text-xs flex items-start gap-2.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#E07A5F] mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] text-[#A8A194] mb-0.5">
                  <span className="text-[#E07A5F] font-semibold">{msg.targetName}</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[#D6D0C4] leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Message Input Bar */}
        <form onSubmit={handleQuickRadioSubmit} className="mt-2.5 flex gap-2">
          <input
            type="text"
            value={quickRadioText}
            onChange={(e) => setQuickRadioText(e.target.value)}
            placeholder="Send a quiet note to everyone in your circle..."
            className="flex-1 bg-[#201D1A] border border-[#332E29] rounded-xl px-3.5 py-2.5 text-xs text-[#F7F4EE] placeholder-[#8B8477] focus:outline-none focus:border-[#E07A5F]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#E07A5F] hover:bg-[#D96B50] active:scale-95 text-white font-medium rounded-xl text-xs flex items-center justify-center shrink-0 transition-transform shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Member Detail Slide-Up Bottom Sheet */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 animate-in fade-in">
          <div className="w-full max-w-[430px] bg-[#201D1A] border-t border-[#38332E] rounded-t-3xl p-5 shadow-2xl space-y-4">
            <div className="w-12 h-1 bg-[#3E3832] rounded-full mx-auto -mt-1" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedMember.avatarUrl}
                  alt={selectedMember.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#332E29]"
                />
                <div>
                  <h3 className="font-semibold text-base text-[#F7F4EE]">{selectedMember.name}</h3>
                  <p className="text-xs text-[#A8A194]">
                    {selectedMember.relation} · Key: {selectedMember.pairingKey}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-full text-[#A8A194] hover:text-[#F7F4EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#161412] text-center text-xs">
              <div>
                <span className="text-[10px] text-[#A8A194] block">Distance</span>
                <span className="font-semibold text-[#6495ED]">
                  {formatDistance(
                    calculateDistanceMeters(
                      userLocation.lat,
                      userLocation.lng,
                      selectedMember.lastLat,
                      selectedMember.lastLng
                    )
                  )}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#A8A194] block">Battery</span>
                <span
                  className={`font-semibold ${
                    selectedMember.batteryLevel <= 15 ? 'text-[#E07A5F]' : 'text-[#81B29A]'
                  }`}
                >
                  {selectedMember.batteryLevel}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#A8A194] block">Relay Hops</span>
                <span className="font-semibold text-[#D6D0C4]">{selectedMember.hopsToNode} Hops</span>
              </div>
            </div>

            {/* Field Status */}
            <div className="p-3.5 rounded-2xl bg-[#161412] text-xs text-[#D6D0C4] leading-relaxed">
              <span className="text-[10px] text-[#A8A194] block mb-1">Last Update:</span>
              "{selectedMember.statusMessage}"
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  onSelectMemberForMap(selectedMember.id);
                  setSelectedMember(null);
                }}
                className="py-3 rounded-xl bg-[#E07A5F] hover:bg-[#D96B50] text-white font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Show on Map</span>
              </button>

              <button
                onClick={() => {
                  onSendRadioMessage(
                    selectedMember.id,
                    `Direct check-in to ${selectedMember.name}: How are you holding up? Let us know when you can.`
                  );
                  setSelectedMember(null);
                }}
                className="py-3 rounded-xl bg-[#161412] hover:bg-[#27231F] border border-[#332E29] text-[#D6D0C4] font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#81B29A]" />
                <span>Check In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
