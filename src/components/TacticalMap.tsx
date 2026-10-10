import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { FamilyMember, SafeZone, DisasterScenario } from '../types';
import { calculateDistanceMeters, calculateBearing, formatDistance } from '../services/geofence';
import { ShieldCheck, Crosshair, MapPin, AlertTriangle, Layers, Navigation } from 'lucide-react';

interface TacticalMapProps {
  userLocation: { lat: number; lng: number };
  circleMembers: FamilyMember[];
  safeZones: SafeZone[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  disasterScenario: DisasterScenario;
  showBreadcrumbs: boolean;
  showVectors: boolean;
  onAddSafeZoneAtCoord?: (lat: number, lng: number) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  userLocation,
  circleMembers,
  safeZones,
  selectedMemberId,
  onSelectMember,
  disasterScenario,
  showBreadcrumbs,
  showVectors,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const vectorsLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const trailsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap standard tile layer with dark tactical filter
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'tactical-map-tiles',
    });

    tileLayer.addTo(map);

    // Layer groups for clean updates
    zonesLayerRef.current = L.layerGroup().addTo(map);
    trailsLayerRef.current = L.layerGroup().addTo(map);
    vectorsLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Safe Zones & Disaster Hazard Perimeter
  useEffect(() => {
    const map = mapInstanceRef.current;
    const zonesGroup = zonesLayerRef.current;
    if (!map || !zonesGroup) return;

    zonesGroup.clearLayers();

    // Render Safe Zones
    safeZones.forEach((zone) => {
      const isCommunity = zone.type === 'COMMUNITY_CENTER' || zone.type === 'HIGH_GROUND';
      const color = isCommunity ? '#10b981' : zone.type === 'HOSPITAL' ? '#06b6d4' : '#f59e0b';

      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radiusMeters,
        color: color,
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: color,
        fillOpacity: 0.12,
      });

      const labelIcon = L.divIcon({
        className: 'custom-zone-label',
        html: `
          <div style="background-color: #0f172a; border: 1px solid ${color}; color: ${color}; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            ⛊ ${zone.name} (${zone.radiusMeters}m)
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });

      const labelMarker = L.marker([zone.lat, zone.lng], { icon: labelIcon });
      circle.bindPopup(`
        <div class="p-1">
          <p class="font-bold text-sm text-emerald-400">SAFE ZONE: ${zone.name}</p>
          <p class="text-xs text-slate-300 mt-1">${zone.description}</p>
          <p class="text-xs font-mono text-slate-400 mt-1">Perimeter: ${zone.radiusMeters} meters radius</p>
        </div>
      `);

      circle.addTo(zonesGroup);
      labelMarker.addTo(zonesGroup);
    });

    // Render Disaster Hazard Perimeter
    if (disasterScenario.hazardPerimeter) {
      const hp = disasterScenario.hazardPerimeter;
      const hazardCircle = L.circle([hp.lat, hp.lng], {
        radius: hp.radiusMeters,
        color: '#ef4444',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#dc2626',
        fillOpacity: 0.18,
      });

      hazardCircle.bindPopup(`
        <div class="p-1">
          <p class="font-bold text-sm text-red-500">⚠ HAZARD SECTOR: ${hp.label}</p>
          <p class="text-xs text-slate-300 mt-1">${disasterScenario.problem}</p>
          <p class="text-xs font-mono text-amber-400 mt-1">Recommendation: Route to ${disasterScenario.recommendedSafeZoneId}</p>
        </div>
      `);

      hazardCircle.addTo(zonesGroup);
    }
  }, [safeZones, disasterScenario]);

  // Update Markers, Breadcrumbs & Vector Lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const vectorsGroup = vectorsLayerRef.current;
    const trailsGroup = trailsLayerRef.current;
    if (!map || !markersGroup || !vectorsGroup || !trailsGroup) return;

    markersGroup.clearLayers();
    vectorsGroup.clearLayers();
    trailsGroup.clearLayers();

    // 1. User Marker (Local Node)
    const userDivIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: rgba(56, 189, 248, 0.25); animation: beacon-ripple 2s infinite;"></div>
          <div style="position: relative; width: 18px; height: 18px; border-radius: 9999px; background-color: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 12px #38bdf8;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userDivIcon });
    userMarker.bindPopup(`
      <div class="p-1">
        <p class="font-bold text-sm text-sky-400">YOU (Origin Node)</p>
        <p class="text-xs text-slate-300 mt-1">Status: Active Broadcaster</p>
        <p class="text-xs font-mono text-slate-400 mt-1">${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}</p>
      </div>
    `);
    userMarker.addTo(markersGroup);

    // 2. Family Circle Members
    circleMembers.forEach((member) => {
      const isSelected = member.id === selectedMemberId;
      const statusColor =
        member.status === 'SAFE'
          ? '#10b981'
          : member.status === 'NEED_HELP'
          ? '#f59e0b'
          : '#ef4444';

      const dist = calculateDistanceMeters(
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

      // Marker Icon
      const memberIcon = L.divIcon({
        className: 'member-marker',
        html: `
          <div style="position: relative; cursor: pointer;">
            <div style="position: relative; width: 44px; height: 44px; border-radius: 9999px; border: 2.5px solid ${statusColor}; overflow: hidden; background-color: #0f172a; box-shadow: 0 4px 14px rgba(0,0,0,0.8); ${
          isSelected ? 'box-shadow: 0 0 0 3px #38bdf8, 0 8px 20px rgba(0,0,0,0.9);' : ''
        }">
              <img src="${member.avatarUrl}" alt="${member.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(
          member.name
        )}&background=0f172a&color=fff'" />
            </div>
            <div style="position: absolute; bottom: -2px; right: -2px; background-color: #0f172a; border: 1.5px solid ${statusColor}; color: #f8fafc; font-size: 9px; font-weight: 700; border-radius: 9999px; padding: 1px 5px; font-family: monospace;">
              ${member.batteryLevel}%
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const memberMarker = L.marker([member.lastLat, member.lastLng], { icon: memberIcon });

      memberMarker.on('click', () => {
        onSelectMember(member.id);
      });

      memberMarker.bindPopup(`
        <div class="p-1 min-w-[180px]">
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-slate-100">${member.name}</span>
            <span class="text-xs text-slate-400">(${member.relation})</span>
          </div>
          <p class="text-xs font-semibold mt-1" style="color: ${statusColor}">
            Status: ${member.status.replace('_', ' ')}
          </p>
          <div class="text-xs text-slate-300 mt-2 space-y-0.5 font-mono">
            <div>Distance: ${formatDistance(dist)} (${bearing.cardinal} ${bearing.degrees}°)</div>
            <div>Hops: ${member.hopsToNode} hop${member.hopsToNode > 1 ? 's' : ''}</div>
            <div>Battery: ${member.batteryLevel}%</div>
            <div>Last Seen: ${Math.round((Date.now() - member.lastSeenTimestamp) / 60000)}m ago</div>
          </div>
        </div>
      `);

      memberMarker.addTo(markersGroup);

      // 3. Distance & Direction Vector Line
      if (showVectors) {
        const vectorLine = L.polyline(
          [
            [userLocation.lat, userLocation.lng],
            [member.lastLat, member.lastLng],
          ],
          {
            color: isSelected ? '#38bdf8' : statusColor,
            weight: isSelected ? 2.5 : 1.5,
            dashArray: '5, 8',
            opacity: isSelected ? 0.9 : 0.65,
          }
        );

        const midLat = (userLocation.lat + member.lastLat) / 2;
        const midLng = (userLocation.lng + member.lastLng) / 2;

        const vectorTag = L.marker([midLat, midLng], {
          icon: L.divIcon({
            className: 'vector-label',
            html: `
              <div style="background-color: #090d16; border: 1px solid ${statusColor}; color: #f8fafc; font-size: 10px; font-family: monospace; padding: 1px 6px; border-radius: 4px; white-space: nowrap; transform: translate(-50%, -50%); opacity: 0.9;">
                ${formatDistance(dist)} · ${bearing.cardinal}
              </div>
            `,
            iconSize: [70, 18],
            iconAnchor: [35, 9],
          }),
        });

        vectorLine.addTo(vectorsGroup);
        vectorTag.addTo(vectorsGroup);
      }

      // 4. "Last Known Beacon" Breadcrumb Trail
      if (showBreadcrumbs && member.breadcrumbs && member.breadcrumbs.length > 0) {
        const points: [number, number][] = [
          ...member.breadcrumbs.map((b) => [b.lat, b.lng] as [number, number]),
          [member.lastLat, member.lastLng],
        ];

        const trailPolyline = L.polyline(points, {
          color: statusColor,
          weight: 2,
          opacity: 0.5,
          lineJoin: 'round',
        });
        trailPolyline.addTo(trailsGroup);

        // Dots on breadcrumbs
        member.breadcrumbs.forEach((bc, idx) => {
          const trailMarker = L.circleMarker([bc.lat, bc.lng], {
            radius: 3.5,
            color: statusColor,
            fillColor: statusColor,
            fillOpacity: 0.7,
            weight: 1,
          });

          trailMarker.bindTooltip(
            `Beacon #${idx + 1} (${Math.round((Date.now() - bc.timestamp) / 60000)}m ago) · ${bc.battery}%`,
            { className: 'text-xs bg-slate-900 text-slate-200 border border-slate-700' }
          );
          trailMarker.addTo(trailsGroup);
        });
      }
    });
  }, [userLocation, circleMembers, selectedMemberId, showBreadcrumbs, showVectors]);

  // Focus map when a member is selected
  useEffect(() => {
    if (!selectedMemberId || !mapInstanceRef.current) return;
    const member = circleMembers.find((m) => m.id === selectedMemberId);
    if (member) {
      mapInstanceRef.current.panTo([member.lastLat, member.lastLng], { animate: true });
    }
  }, [selectedMemberId, circleMembers]);

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const allCoords: [number, number][] = [
      [userLocation.lat, userLocation.lng],
      ...circleMembers.map((m) => [m.lastLat, m.lastLng] as [number, number]),
    ];
    const bounds = L.latLngBounds(allCoords);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Floating Tactical Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl text-xs">
          <button
            onClick={handleCenterOnUser}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-200 font-medium transition-colors"
            title="Center on My Location"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>My Node</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={handleFitAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-200 font-medium transition-colors"
            title="Fit All Circle Members"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fit All ({circleMembers.length})</span>
          </button>
        </div>
      </div>

      {/* Tactical Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-950/85 backdrop-blur-md rounded-md border border-slate-800 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30"></span>
          You
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Safe
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          Need Help
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          SOS
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 border border-dashed border-emerald-400"></span>
          Safe Zone
        </span>
      </div>
    </div>
  );
};
