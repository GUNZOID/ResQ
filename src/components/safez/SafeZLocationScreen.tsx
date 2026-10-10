import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { FamilyMember, SafeZone } from '../../types';
import { calculateDistanceMeters, formatDistance } from '../../services/geofence';
import {
  ChevronLeft,
  Navigation,
  Crosshair,
  Users,
  Shield,
  Send,
  Battery,
  MapPin,
  Clock,
} from 'lucide-react';

interface SafeZLocationScreenProps {
  userLocation: { lat: number; lng: number };
  circleMembers: FamilyMember[];
  safeZones: SafeZone[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  onBackToHome: () => void;
  onMessageMember: (member: FamilyMember) => void;
}

export const SafeZLocationScreen: React.FC<SafeZLocationScreenProps> = ({
  userLocation,
  circleMembers,
  safeZones,
  selectedMemberId,
  onSelectMember,
  onBackToHome,
  onMessageMember,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const distanceMarkerRef = useRef<L.Marker | null>(null);

  // Filter chips matching SafeZ inspiration design
  const [activeFilter, setActiveFilter] = useState<'contacts' | 'university' | 'family' | 'office' | 'shelters'>('contacts');
  const [showShelters, setShowShelters] = useState<boolean>(true);

  // Find targeted contact: default to Karen Castillo if not selected
  const defaultMember = circleMembers.find((m) => m.name.toLowerCase().includes('karen')) || circleMembers[0];
  const activeMember = circleMembers.find((m) => m.id === selectedMemberId) || defaultMember;

  // Initialize Dark Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark Matter tiles for sleek dark mode
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map markers, route line, and distance badge
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (distanceMarkerRef.current) {
      map.removeLayer(distanceMarkerRef.current);
      distanceMarkerRef.current = null;
    }

    // 1. User Location Pulse Dot
    const userMarkerHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></span>
        <span class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10"></span>
      </div>
    `;
    const userIcon = L.divIcon({
      html: userMarkerHtml,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(markersLayer);

    // 2. Safe Shelters
    if (showShelters) {
      safeZones.forEach((zone) => {
        L.circle([zone.lat, zone.lng], {
          radius: zone.radiusMeters,
          color: '#10B981',
          fillColor: '#10B981',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '4, 4',
        }).addTo(markersLayer);

        const shelterIcon = L.divIcon({
          html: `
            <div class="p-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 shadow-xs flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          `,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker([zone.lat, zone.lng], { icon: shelterIcon }).addTo(markersLayer);
      });
    }

    // 3. Contact pins
    circleMembers.forEach((member) => {
      const isTarget = activeMember && member.id === activeMember.id;
      const markerHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transition-transform ${
          isTarget ? 'scale-115 z-50' : 'hover:scale-105 opacity-90'
        }">
          <div class="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr ${
            isTarget ? 'from-rose-500 to-amber-400 ring-2 ring-white' : 'from-gray-600 to-gray-500'
          } shadow-xl relative">
            <img src="${member.avatarUrl}" class="w-full h-full rounded-full object-cover bg-gray-800" />
            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${
              member.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
            } border-2 border-[#12141C]"></span>
          </div>
          <!-- Drop pointer tail -->
          <div class="w-2 h-2 rotate-45 -mt-1 bg-gradient-to-tr ${
            isTarget ? 'from-rose-500 to-amber-400' : 'from-gray-600 to-gray-500'
          }"></div>
        </div>
      `;

      const contactIcon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [40, 48],
        iconAnchor: [20, 46],
      });

      const m = L.marker([member.lastLat, member.lastLng], { icon: contactIcon }).addTo(markersLayer);
      m.on('click', () => {
        onSelectMember(member.id);
      });
    });

    // 4. Blue Route Line & Distance Tag matching SafeZ inspiration design
    if (activeMember) {
      const latlngs: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        // mid simulated waypoint to look like city route
        [
          (userLocation.lat + activeMember.lastLat) / 2 + 0.0012,
          (userLocation.lng + activeMember.lastLng) / 2 - 0.0018,
        ],
        [activeMember.lastLat, activeMember.lastLng],
      ];

      const polyline = L.polyline(latlngs, {
        color: '#3B82F6',
        weight: 3.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routeLayerRef.current = polyline;

      // Distance calculation
      const distMeters = calculateDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        activeMember.lastLat,
        activeMember.lastLng
      );
      const distText = formatDistance(distMeters);

      // Distance pill marker at midpoint
      const midPoint = latlngs[1];
      const distPillHtml = `
        <div class="px-2 py-0.5 rounded-full bg-[#181A24]/90 backdrop-blur-md border border-[#3B82F6]/70 shadow-lg text-[10px] font-bold text-blue-400 whitespace-nowrap">
          ${distText}
        </div>
      `;
      const distIcon = L.divIcon({
        html: distPillHtml,
        className: '',
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });
      distanceMarkerRef.current = L.marker(midPoint, { icon: distIcon }).addTo(map);

      // Fit bounds with user & active member
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [activeMember.lastLat, activeMember.lastLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [userLocation, circleMembers, safeZones, activeMember, showShelters]);

  const handleCenterUser = () => {
    mapInstanceRef.current?.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const coords: [number, number][] = [
      [userLocation.lat, userLocation.lng],
      ...circleMembers.map((m) => [m.lastLat, m.lastLng] as [number, number]),
    ];
    mapInstanceRef.current.fitBounds(L.latLngBounds(coords), { padding: [40, 40], animate: true });
  };

  return (
    <div className="relative flex flex-col h-screen max-w-[440px] mx-auto w-full bg-[#0B0C10] text-white overflow-hidden pb-18">
      {/* Top Floating Header & Filter Chips */}
      <div className="absolute top-0 left-0 right-0 z-[400] bg-gradient-to-b from-[#0B0C10]/95 via-[#0B0C10]/80 to-transparent p-4 pb-2">
        {/* Back button & Title */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <span>Location</span>
          </button>

          {/* Quick Floating Map Controls */}
          <div className="flex items-center gap-1.5 bg-[#181A24]/90 backdrop-blur-md p-1 rounded-full border border-[#272A3A]">
            <button
              onClick={handleCenterUser}
              className="p-1.5 rounded-full hover:bg-[#252838] text-blue-400 transition-colors"
              title="My GPS Location"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitAll}
              className="p-1.5 rounded-full hover:bg-[#252838] text-gray-300 transition-colors"
              title="Fit All Contacts"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowShelters((p) => !p)}
              className={`p-1.5 rounded-full transition-colors ${
                showShelters ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Toggle Safe Shelters"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips matching SafeZ inspiration design */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveFilter('contacts')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeFilter === 'contacts'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-[#181A24] text-gray-400 hover:text-white border border-[#272A3A]'
            }`}
          >
            My Contacts
          </button>
          <button
            onClick={() => setActiveFilter('university')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeFilter === 'university'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-[#181A24] text-gray-400 hover:text-white border border-[#272A3A]'
            }`}
          >
            University
          </button>
          <button
            onClick={() => setActiveFilter('family')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeFilter === 'family'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-[#181A24] text-gray-400 hover:text-white border border-[#272A3A]'
            }`}
          >
            Family
          </button>
          <button
            onClick={() => setActiveFilter('office')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeFilter === 'office'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-[#181A24] text-gray-400 hover:text-white border border-[#272A3A]'
            }`}
          >
            Office
          </button>
          <button
            onClick={() => setActiveFilter('shelters')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeFilter === 'shelters'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-[#181A24] text-gray-400 hover:text-white border border-[#272A3A]'
            }`}
          >
            Shelters
          </button>
        </div>
      </div>

      {/* Full Map Container */}
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[300px]" />

      {/* Bottom Floating "People" Drawer Card matching SafeZ inspiration design */}
      <div className="absolute bottom-16 left-3 right-3 z-[400] pointer-events-auto">
        <div className="bg-[#141620]/95 backdrop-blur-xl rounded-3xl p-4 border border-[#26293A] shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              People
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Direct Mesh Peer
            </span>
          </div>

          {activeMember && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-rose-500 to-amber-400 shrink-0">
                  <img
                    src={activeMember.avatarUrl}
                    alt={activeMember.name}
                    className="w-full h-full rounded-full object-cover bg-gray-800"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#141620]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      {activeMember.name}
                    </h3>
                    <span className="text-[10px] text-gray-400">
                      {activeMember.batteryLevel}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {activeMember.statusMessage || 'New Gold Gold, West Avenue 5'}
                  </p>
                </div>
              </div>

              {/* Fly / Route Action Button matching SafeZ paper airplane ↗ */}
              <button
                onClick={() => onMessageMember(activeMember)}
                className="w-10 h-10 rounded-full bg-white text-gray-950 hover:bg-gray-200 active:scale-95 flex items-center justify-center shrink-0 shadow-lg transition-all"
                title="Send Mesh Message / Route"
                aria-label="Direct Mesh Action"
              >
                <Navigation className="w-4 h-4 fill-gray-950 rotate-45" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
