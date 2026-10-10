import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { FamilyMember, SafeZone } from '../../types';
import { calculateDistanceMeters, calculateBearing, formatDistance } from '../../services/geofence';
import { Crosshair, Users, Shield, MessageCircle, X, Battery, Clock, MapPin, Compass } from 'lucide-react';

interface HomeMapSectionProps {
  userLocation: { lat: number; lng: number };
  circleMembers: FamilyMember[];
  safeZones: SafeZone[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  onMessageMember?: (member: FamilyMember) => void;
}

export const HomeMapSection: React.FC<HomeMapSectionProps> = ({
  userLocation,
  circleMembers,
  safeZones,
  selectedMemberId,
  onSelectMember,
  onMessageMember,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const [showShelters, setShowShelters] = useState(true);
  const [activeZone, setActiveZone] = useState<SafeZone | null>(null);

  const selectedMember = circleMembers.find((m) => m.id === selectedMemberId) || null;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean, crisp light cartography tiles (CartoDB Positron / OSM style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    zonesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Small delay to ensure container dimension calculation
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync markers & layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !zonesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    zonesLayerRef.current.clearLayers();

    // 1. Draw Safe Zones / Shelters
    if (showShelters) {
      safeZones.forEach((zone) => {
        const isSelected = activeZone?.id === zone.id;
        const color = zone.type === 'HOSPITAL' ? '#3B82F6' : '#10B981';

        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radiusMeters,
          color: color,
          weight: isSelected ? 2.5 : 1.5,
          opacity: 0.8,
          fillColor: color,
          fillOpacity: isSelected ? 0.2 : 0.08,
          dashArray: '4, 4',
        });

        circle.on('click', () => {
          setActiveZone(zone);
          onSelectMember(null);
        });

        circle.addTo(zonesLayerRef.current!);

        // Shelter Icon Marker
        const shelterIcon = L.divIcon({
          className: 'custom-shelter-pin',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="w-7 h-7 rounded-full bg-white shadow-md border-2 ${
                isSelected ? 'border-emerald-600 scale-110' : 'border-emerald-500'
              } flex items-center justify-center transition-transform">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded-full bg-white/95 text-[10px] font-semibold text-gray-700 shadow-xs border border-gray-200">
                ${zone.name.split(' ')[0]}
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const shelterMarker = L.marker([zone.lat, zone.lng], { icon: shelterIcon });
        shelterMarker.on('click', () => {
          setActiveZone(zone);
          onSelectMember(null);
        });
        shelterMarker.addTo(zonesLayerRef.current!);
      });
    }

    // 2. User Location Pin
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full bg-blue-500/25 animate-ping absolute"></div>
          <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md relative z-10"></div>
          <div class="absolute -bottom-4 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
            You
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(markersLayerRef.current);

    // 3. Circle Members Pins
    circleMembers.forEach((member) => {
      const isSelected = selectedMemberId === member.id;
      const statusRing =
        member.status === 'CRITICAL_SOS'
          ? 'ring-2 ring-red-500'
          : member.status === 'INJURED' || member.status === 'NEED_HELP'
          ? 'ring-2 ring-amber-500'
          : 'ring-2 ring-emerald-500';

      const memberIcon = L.divIcon({
        className: 'custom-member-pin',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer group">
            <div class="w-9 h-9 rounded-full bg-white shadow-md p-0.5 ${statusRing} ${
          isSelected ? 'scale-125 ring-4 ring-blue-600 shadow-lg' : 'hover:scale-110'
        } transition-all">
              <img src="${member.avatarUrl}" alt="${member.name}" class="w-full h-full object-cover rounded-full" />
              <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                member.status === 'CRITICAL_SOS'
                  ? 'bg-red-500'
                  : member.status === 'INJURED' || member.status === 'NEED_HELP'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }"></div>
            </div>
            <div class="mt-1 px-1.5 py-0.5 rounded-full bg-white/95 text-[10px] font-semibold text-gray-800 shadow-xs border border-gray-200 whitespace-nowrap">
              ${member.name}
            </div>
          </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 22],
      });

      const marker = L.marker([member.lastLat, member.lastLng], { icon: memberIcon });
      marker.on('click', () => {
        setActiveZone(null);
        onSelectMember(isSelected ? null : member.id);
      });
      marker.addTo(markersLayerRef.current!);
    });
  }, [userLocation, circleMembers, safeZones, showShelters, selectedMemberId, activeZone]);

  // Center on selected member
  useEffect(() => {
    if (!selectedMemberId || !mapInstanceRef.current) return;
    const member = circleMembers.find((m) => m.id === selectedMemberId);
    if (member) {
      mapInstanceRef.current.panTo([member.lastLat, member.lastLng], { animate: true });
    }
  }, [selectedMemberId, circleMembers]);

  const handleCenterOnUser = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const coords: [number, number][] = [
      [userLocation.lat, userLocation.lng],
      ...circleMembers.map((m) => [m.lastLat, m.lastLng] as [number, number]),
    ];
    const bounds = L.latLngBounds(coords);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  return (
    <section className="relative w-full h-[32vh] min-h-[250px] max-h-[360px] bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        {/* Left: Active Status Indicator */}
        <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-xs border border-gray-200/70 text-xs font-medium text-gray-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live P2P Radar</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{circleMembers.length} active</span>
        </div>

        {/* Right: Quick Map Actions */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-xs border border-gray-200/70">
          <button
            onClick={handleCenterOnUser}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
            title="My Location"
            aria-label="My Location"
          >
            <Crosshair className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={handleFitAll}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
            title="Fit All"
            aria-label="Fit All"
          >
            <Users className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => setShowShelters((prev) => !prev)}
            className={`p-1.5 rounded-full transition-colors ${
              showShelters ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="Toggle Shelters"
            aria-label="Toggle Shelters"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Member Detail Floating Card (Instagram Style) */}
      {selectedMember && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-gray-200/90 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={selectedMember.avatarUrl}
                  alt={selectedMember.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    selectedMember.status === 'CRITICAL_SOS'
                      ? 'bg-red-500'
                      : selectedMember.status === 'INJURED' || selectedMember.status === 'NEED_HELP'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{selectedMember.name}</h4>
                  <span className="text-[11px] text-gray-500">({selectedMember.relation})</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                  <span className="flex items-center gap-0.5 font-medium text-blue-600">
                    <Compass className="w-3 h-3" />
                    {formatDistance(
                      calculateDistanceMeters(
                        userLocation.lat,
                        userLocation.lng,
                        selectedMember.lastLat,
                        selectedMember.lastLng
                      )
                    )}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Battery className="w-3 h-3 text-gray-400" />
                    {selectedMember.batteryLevel}%
                  </span>
                  <span>•</span>
                  <span className="text-gray-400">
                    {Math.round((Date.now() - selectedMember.lastSeenTimestamp) / 60000)}m ago
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onMessageMember && (
                <button
                  onClick={() => onMessageMember(selectedMember)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium shadow-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              )}
              <button
                onClick={() => onSelectMember(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Safe Haven / Shelter Card */}
      {activeZone && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-gray-200/90 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{activeZone.name}</h4>
                <p className="text-xs text-gray-500 truncate">{activeZone.description}</p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-medium mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {formatDistance(
                      calculateDistanceMeters(
                        userLocation.lat,
                        userLocation.lng,
                        activeZone.lat,
                        activeZone.lng
                      )
                    )}{' '}
                    away
                  </span>
                  <span>•</span>
                  <span>Radius: {activeZone.radiusMeters}m</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveZone(null)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
