/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import type { FamilyMember, SafeZone, DisasterScenario } from '../types';
import { calculateDistanceMeters, calculateBearing, formatDistance } from '../services/geofence';
import { TacticalMap } from './TacticalMap';
import { Navigation, Crosshair, Shield, Heart } from 'lucide-react';

interface GoogleTacticalMapProps {
  userLocation: { lat: number; lng: number };
  circleMembers: FamilyMember[];
  safeZones: SafeZone[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  disasterScenario: DisasterScenario;
  showBreadcrumbs?: boolean;
  showVectors?: boolean;
}

// Warm Earth & Sand Custom Dark Mode Styling Array
const GOOGLE_MAPS_WARM_EARTH_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1B1815' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1B1815' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A8A194' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#D6D0C4' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B8477' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#232920' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#81B29A' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2A2521' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E1B18' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#A8A194' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#38322B' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#24201C' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#201D1A' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#131822' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6495ED' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#131822' }],
  },
];

export const GoogleTacticalMap: React.FC<GoogleTacticalMapProps> = ({
  userLocation,
  circleMembers,
  safeZones,
  selectedMemberId,
  onSelectMember,
  disasterScenario,
  showBreadcrumbs = true,
  showVectors = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [showGeofenceCircles, setShowGeofenceCircles] = useState<boolean>(true);

  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof process !== 'undefined' ? (process.env as any).REACT_APP_GOOGLE_MAPS_API_KEY : '') ||
    '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).google && (window as any).google.maps) {
      setIsGoogleMapsReady(true);
      return;
    }

    const scriptId = 'google-maps-script-loader';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          setIsGoogleMapsReady(true);
          clearInterval(checkLoaded);
        }
      }, 200);
      return () => clearInterval(checkLoaded);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsGoogleMapsReady(true);
    };

    script.onerror = () => {
      console.warn('Google Maps script load fallback to tactical offline map');
      setLoadError(true);
    };

    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (!isGoogleMapsReady || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 14,
        styles: GOOGLE_MAPS_WARM_EARTH_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeId: 'roadmap',
        backgroundColor: '#161412',
      });

      mapInstanceRef.current = map;
    } catch (e) {
      console.warn('Google Map initialization fallback:', e);
      setLoadError(true);
    }
  }, [isGoogleMapsReady, userLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isGoogleMapsReady) return;

    markersRef.current.forEach((m) => m.setMap(null));
    circlesRef.current.forEach((c) => c.setMap(null));
    polylinesRef.current.forEach((p) => p.setMap(null));
    markersRef.current = [];
    circlesRef.current = [];
    polylinesRef.current = [];

    // Current User Marker
    const userMarker = new google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map,
      title: 'Your Spot (Broadcasting)',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#E07A5F',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2.5,
      },
    });
    markersRef.current.push(userMarker);

    // Safe Havens Geofence Perimeters
    if (showGeofenceCircles) {
      safeZones.forEach((zone) => {
        const isSafeHaven = zone.type === 'COMMUNITY_CENTER' || zone.type === 'HIGH_GROUND';
        const color = isSafeHaven ? '#81B29A' : zone.type === 'HOSPITAL' ? '#6495ED' : '#E9B44C';

        const circle = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.85,
          strokeWeight: 1.5,
          fillColor: color,
          fillOpacity: 0.12,
          map,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radiusMeters,
        });

        circle.addListener('click', () => {
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="background:#201D1A;color:#F7F4EE;padding:8px;font-family:sans-serif;font-size:12px;border-radius:12px;max-width:200px;">
                <b style="color:${color};font-size:13px;">Safe Haven: ${zone.name}</b>
                <p style="margin:4px 0 2px;color:#C4BDB0;line-height:1.4;">${zone.description}</p>
                <div style="color:#A8A194;font-size:10px;margin-top:4px;">Perimeter: ${zone.radiusMeters}m safe radius</div>
              </div>
            `,
            position: { lat: zone.lat, lng: zone.lng },
          });
          infoWindow.open(map);
        });

        circlesRef.current.push(circle);
      });
    }

    // Family Circle Markers
    circleMembers.forEach((member) => {
      const isSelected = member.id === selectedMemberId;
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

      const statusColor =
        member.status === 'SAFE'
          ? '#81B29A'
          : member.status === 'NEED_HELP'
          ? '#E9B44C'
          : '#E07A5F';

      const memberMarker = new google.maps.Marker({
        position: { lat: member.lastLat, lng: member.lastLng },
        map,
        title: `${member.name} (${member.relation})`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 9,
          fillColor: statusColor,
          fillOpacity: 1,
          strokeColor: isSelected ? '#FFFFFF' : '#161412',
          strokeWeight: isSelected ? 3 : 2,
        },
      });

      memberMarker.addListener('click', () => {
        onSelectMember(member.id);
        const info = new google.maps.InfoWindow({
          content: `
            <div style="background:#201D1A;color:#F7F4EE;padding:8px;font-family:sans-serif;font-size:12px;min-width:170px;border-radius:12px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <b style="color:#F7F4EE;font-size:13px;">${member.name}</b>
                <span style="color:${statusColor};font-weight:600;font-size:11px;">${member.status === 'SAFE' ? 'Safe' : 'Needs Help'}</span>
              </div>
              <p style="margin:4px 0;color:#C4BDB0;font-size:11px;line-height:1.4;">${member.statusMessage || member.relation}</p>
              <div style="font-size:11px;color:#A8A194;margin-top:6px;border-top:1px solid #332E29;padding-top:4px;">
                <div>Distance: ${formatDistance(dist)} (${bearing.cardinal})</div>
                <div>Battery: ${member.batteryLevel}% · ${member.hopsToNode} hops</div>
              </div>
            </div>
          `,
          position: { lat: member.lastLat, lng: member.lastLng },
        });
        info.open(map);
      });

      markersRef.current.push(memberMarker);

      // Distance Vector Lines
      if (showVectors) {
        const polyline = new google.maps.Polyline({
          path: [
            { lat: userLocation.lat, lng: userLocation.lng },
            { lat: member.lastLat, lng: member.lastLng },
          ],
          geodesic: true,
          strokeColor: isSelected ? '#E07A5F' : statusColor,
          strokeOpacity: isSelected ? 0.9 : 0.45,
          strokeWeight: isSelected ? 2.5 : 1.5,
          map,
        });
        polylinesRef.current.push(polyline);
      }
    });
  }, [
    isGoogleMapsReady,
    userLocation,
    circleMembers,
    safeZones,
    selectedMemberId,
    showGeofenceCircles,
    showVectors,
  ]);

  const handleCenterUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      mapInstanceRef.current.setZoom(15);
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
    circleMembers.forEach((m) => bounds.extend({ lat: m.lastLat, lng: m.lastLng }));
    mapInstanceRef.current.fitBounds(bounds);
  };

  if (loadError) {
    return (
      <TacticalMap
        userLocation={userLocation}
        circleMembers={circleMembers}
        safeZones={safeZones}
        selectedMemberId={selectedMemberId}
        onSelectMember={onSelectMember}
        disasterScenario={disasterScenario}
        showBreadcrumbs={showBreadcrumbs}
        showVectors={showVectors}
      />
    );
  }

  return (
    <div className="relative w-full h-full min-h-[420px] bg-[#161412] overflow-hidden">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Floating Warm Map Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1 bg-[#201D1A]/95 backdrop-blur-md border border-[#332E29] rounded-2xl shadow-xl text-xs">
          <button
            onClick={handleCenterUser}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161412] hover:bg-[#27231F] text-[#F7F4EE] font-medium active:scale-95 transition-all"
            title="Center on My Location"
          >
            <Navigation className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>My Spot</span>
          </button>
          <button
            onClick={handleFitAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161412] hover:bg-[#27231F] text-[#F7F4EE] font-medium active:scale-95 transition-all"
            title="Fit All Loved Ones"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#81B29A]" />
            <span>All Family</span>
          </button>
          <button
            onClick={() => setShowGeofenceCircles(!showGeofenceCircles)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              showGeofenceCircles
                ? 'bg-[#81B29A]/20 border border-[#81B29A]/40 text-[#81B29A]'
                : 'bg-[#161412] text-[#A8A194]'
            }`}
          >
            Safe Havens
          </button>
        </div>
      </div>

      {/* Quiet Brand Pill */}
      <div className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-xl bg-[#161412]/85 backdrop-blur-sm border border-[#2C2722] text-[10px] text-[#A8A194]">
        Warm Earth Map · Off-Grid Community Overlays
      </div>
    </div>
  );
};
