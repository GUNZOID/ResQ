import React, { useState } from 'react';
import type { SafeZone, FamilyMember, GeofenceEvent } from '../types';
import { formatDistance, calculateDistanceMeters } from '../services/geofence';
import {
  ShieldAlert,
  Plus,
  MapPin,
  Building2,
  Hospital,
  Mountain,
  Home,
  CheckCircle2,
  BellRing,
} from 'lucide-react';

interface SafeZoneManagerProps {
  safeZones: SafeZone[];
  circleMembers: FamilyMember[];
  userLocation: { lat: number; lng: number };
  recentGeofenceEvents: GeofenceEvent[];
  onAddSafeZone: (newZone: Omit<SafeZone, 'id'>) => void;
  onSimulateMemberEnterZone: (memberId: string, zoneId: string) => void;
}

export const SafeZoneManager: React.FC<SafeZoneManagerProps> = ({
  safeZones,
  circleMembers,
  userLocation,
  recentGeofenceEvents,
  onAddSafeZone,
  onSimulateMemberEnterZone,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<SafeZone['type']>('COMMUNITY_CENTER');
  const [radiusMeters, setRadiusMeters] = useState(300);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [customLat, setCustomLat] = useState(userLocation.lat);
  const [customLng, setCustomLng] = useState(userLocation.lng);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSafeZone({
      name: name.trim(),
      type,
      lat: useCurrentLocation ? userLocation.lat : Number(customLat),
      lng: useCurrentLocation ? userLocation.lng : Number(customLng),
      radiusMeters: Number(radiusMeters),
      description: description.trim() || 'Custom designated safe muster point.',
    });

    setName('');
    setDescription('');
    setIsAdding(false);
  };

  const getZoneIcon = (zoneType: SafeZone['type']) => {
    switch (zoneType) {
      case 'COMMUNITY_CENTER':
        return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'HOSPITAL':
        return <Hospital className="w-4 h-4 text-cyan-400" />;
      case 'HIGH_GROUND':
        return <Mountain className="w-4 h-4 text-amber-400" />;
      case 'HOME_SAFEHOUSE':
        return <Home className="w-4 h-4 text-blue-400" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">
            Safe-Zone Geofences & Auto-Alerts
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ({safeZones.length} active)
          </span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Cancel' : 'Add Geofence'}</span>
        </button>
      </div>

      {/* Geofence Event Alert Banner (if any recent transitions) */}
      {recentGeofenceEvents.length > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-600/70 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <BellRing className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>MESH AUTO-ALERT DISPATCHED:</span>
          </div>
          <p className="text-emerald-200 mt-1 font-mono text-[11px]">
            {recentGeofenceEvents[0].memberName} {recentGeofenceEvents[0].action.toLowerCase()}{' '}
            geofence: <strong className="text-white">{recentGeofenceEvents[0].zoneName}</strong>!
            Broadcasted to all {circleMembers.length} family devices.
          </p>
        </div>
      )}

      {/* Add New Geofence Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-3.5 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
          <h3 className="font-semibold text-slate-200">Configure New Safe Zone Perimeter</h3>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Safe Zone Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Community Red Cross Depot"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Zone Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="COMMUNITY_CENTER">Community Shelter</option>
                <option value="HOSPITAL">Field Hospital</option>
                <option value="HIGH_GROUND">High Ground Point</option>
                <option value="HOME_SAFEHOUSE">Home Safehouse</option>
                <option value="EMERGENCY_DEPOT">Emergency Depot</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Radius (meters)</label>
              <input
                type="number"
                min="50"
                max="2000"
                step="50"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Notes / Supply Info</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Drinking water distribution, satellite link..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow"
            >
              Register Safe Zone
            </button>
          </div>
        </form>
      )}

      {/* List of Registered Safe Zones */}
      <div className="space-y-2">
        {safeZones.map((zone) => {
          const membersInside = circleMembers.filter((m) => {
            const dist = calculateDistanceMeters(m.lastLat, m.lastLng, zone.lat, zone.lng);
            return dist <= zone.radiusMeters;
          });

          const distFromUser = calculateDistanceMeters(
            userLocation.lat,
            userLocation.lng,
            zone.lat,
            zone.lng
          );
          const isUserInside = distFromUser <= zone.radiusMeters;

          return (
            <div
              key={zone.id}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {getZoneIcon(zone.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-200">{zone.name}</span>
                      {isUserInside && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300">
                          YOU ARE HERE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{zone.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-400">
                      <span>Radius: {zone.radiusMeters}m</span>
                      <span>·</span>
                      <span>Distance: {formatDistance(distFromUser)}</span>
                    </div>
                  </div>
                </div>

                {/* Simulation trigger to test geofence auto-alerts */}
                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-mono font-semibold text-emerald-400">
                    {membersInside.length} inside
                  </span>
                  <div className="mt-1">
                    <button
                      onClick={() => onSimulateMemberEnterZone('node-sarah-sister', zone.id)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                      title="Simulate Sarah reaching this coordinate to trigger auto-broadcast"
                    >
                      Test Entrance
                    </button>
                  </div>
                </div>
              </div>

              {/* Members currently inside */}
              {membersInside.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-slate-400">Sheltered:</span>
                  <div className="flex items-center gap-1">
                    {membersInside.map((m) => (
                      <span
                        key={m.id}
                        className="font-medium text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded text-[10px]"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
