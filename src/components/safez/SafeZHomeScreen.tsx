/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import type { FamilyMember, SafeZone, EmergencyStatus } from '../../types';
import { calculateDistanceMeters, formatDistance } from '../../services/geofence';
import { soundAlert } from '../../services/soundAlert';
import {
  Bell,
  HelpCircle,
  Radio,
  Volume2,
  VolumeX,
  Zap,
  ShieldCheck,
  Check,
  Plus,
  ArrowRight,
  Crosshair,
  Users,
  Shield,
  Navigation,
  AlertOctagon,
  AlertTriangle,
  MapPin,
  ChevronRight,
  HeartPulse,
  Flame,
  PhoneCall,
  User,
} from 'lucide-react';

const GOOGLE_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCXZe_THu3krpyEiGtkWg6R0zCrpw_GHdo';

const GOOGLE_MAPS_DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#10131A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#10131A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8C9BAE' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#CBD5E1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94A3B8' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#064E3B' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#10B981' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2A3447' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E2638' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#CBD5E1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#F97316' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#C2410C' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#38BDF8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#1E3A8A' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#60A5FA' }],
  },
];

interface SafeZHomeScreenProps {
  userLocation: { lat: number; lng: number };
  circleMembers: FamilyMember[];
  safeZones: SafeZone[];
  myStatus: EmergencyStatus;
  myBattery: number;
  userName?: string;
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  onUpdateStatus: (status: EmergencyStatus) => void;
  onOpenPairing: () => void;
  onOpenHelp: () => void;
  onOpenProfile?: () => void;
  onToggleStrobe: () => void;
  isStrobeActive: boolean;
  onNavigateToSos: () => void;
  onNavigateToMap?: () => void;
  onMessageMember: (member: FamilyMember) => void;
}

export const SafeZHomeScreen: React.FC<SafeZHomeScreenProps> = ({
  userLocation,
  circleMembers,
  safeZones,
  myStatus,
  myBattery,
  userName = 'George',
  selectedMemberId,
  onSelectMember,
  onUpdateStatus,
  onOpenPairing,
  onOpenHelp,
  onOpenProfile,
  onToggleStrobe,
  isStrobeActive,
  onNavigateToSos,
  onNavigateToMap,
  onMessageMember,
}) => {
  // Google Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const shelterCirclesRef = useRef<google.maps.Circle[]>([]);

  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState<boolean>(false);

  // Filter Chips on the 1/3 Map
  const [activeFilter, setActiveFilter] = useState<'contacts' | 'family' | 'shelters'>('contacts');
  const [showShelters, setShowShelters] = useState<boolean>(true);

  // Find active contact
  const defaultMember =
    circleMembers.find((m) => m.name.toLowerCase().includes('karen')) || circleMembers[0];
  const activeMember = circleMembers.find((m) => m.id === selectedMemberId) || defaultMember;

  // Emergency SOS & Slider State
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);
  const [isSosActive, setIsSosActive] = useState<boolean>(myStatus === 'CRITICAL_SOS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Smooth Slider Pointer Drag
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [dragProgress, setDragProgress] = useState<number>(myStatus === 'CRITICAL_SOS' ? 1 : 0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync SOS state with prop
  useEffect(() => {
    setIsSosActive(myStatus === 'CRITICAL_SOS');
    if (myStatus === 'CRITICAL_SOS') {
      setDragProgress(1);
    } else {
      setDragProgress(0);
    }
  }, [myStatus]);

  // Stories Ring colors
  const ringColors = [
    'border-[#FFB085]', // Kevin peach
    'border-[#FF6B6B]', // Amber coral
    'border-[#51CF66]', // Rasheed & Josh green
    'border-[#22B8CF]', // Jacob cyan
    'border-[#845EF7]', // Karen purple
  ];

  // 1. Dynamically Load Google Maps JS SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).google && (window as any).google.maps) {
      setIsGoogleMapsReady(true);
      return;
    }

    const scriptId = 'google-maps-script-resq';
    if (document.getElementById(scriptId)) {
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleMapsReady(true);
    };
    document.head.appendChild(script);
  }, []);

  // 2. Initialize Google Maps for the 1/3 Screen Preview
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!isGoogleMapsReady || !(window as any).google?.maps) return;
    if (googleMapRef.current) return;

    try {
      const google = (window as any).google;
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: false,
        styles: GOOGLE_MAPS_DARK_STYLE,
      });

      googleMapRef.current = map;
    } catch (err) {
      console.error('Google Maps home preview init error:', err);
    }
  }, [isGoogleMapsReady, userLocation]);

  // 3. Render User Marker & Contact Markers (NO lines/polylines!)
  useEffect(() => {
    if (!googleMapRef.current || !(window as any).google?.maps) return;
    const google = (window as any).google;
    const map = googleMapRef.current;

    // Clear old markers & circles
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    shelterCirclesRef.current.forEach((c) => c.setMap(null));
    shelterCirclesRef.current = [];

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // 1. User Location Beacon (Pulsing blue marker)
    const userMarker = new google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2.5,
      },
      title: 'Your Location (Delhi NCR)',
      zIndex: 999,
    });
    userMarkerRef.current = userMarker;

    // 2. Safe Zones / Shelters (Green Circles)
    if (showShelters) {
      safeZones.forEach((zone) => {
        const circle = new google.maps.Circle({
          strokeColor: '#10B981',
          strokeOpacity: 0.8,
          strokeWeight: 1.5,
          fillColor: '#10B981',
          fillOpacity: 0.12,
          map,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radiusMeters,
        });
        shelterCirclesRef.current.push(circle);

        const shelterMarker = new google.maps.Marker({
          position: { lat: zone.lat, lng: zone.lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 1.5,
          },
          title: zone.name,
        });
        markersRef.current.push(shelterMarker);
      });
    }

    // 3. Circle Contact Pins (Filtered)
    const filteredMembers = circleMembers.filter((m) => {
      if (activeFilter === 'family') return m.relation?.toLowerCase().includes('family');
      return true;
    });

    filteredMembers.forEach((member) => {
      const isTarget = activeMember && member.id === activeMember.id;
      const marker = new google.maps.Marker({
        position: { lat: member.lastLat, lng: member.lastLng },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isTarget ? 10 : 8,
          fillColor: isTarget ? '#EC4899' : '#8B5CF6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: isTarget ? 2.5 : 1.5,
        },
        title: `${member.name} (${member.relation || 'Circle'})`,
        zIndex: isTarget ? 500 : 100,
      });

      marker.addListener('click', () => {
        onSelectMember(member.id);
        map.panTo({ lat: member.lastLat, lng: member.lastLng });
      });

      markersRef.current.push(marker);
    });
  }, [userLocation, circleMembers, safeZones, activeMember, showShelters, activeFilter]);

  const handleCenterUser = () => {
    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      googleMapRef.current.setZoom(14);
    }
  };

  const handleFitAll = () => {
    if (!googleMapRef.current || !(window as any).google?.maps) return;
    const google = (window as any).google;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
    circleMembers.forEach((m) => {
      bounds.extend({ lat: m.lastLat, lng: m.lastLng });
    });
    googleMapRef.current.fitBounds(bounds, 40);
  };

  const handleSosTrigger = () => {
    setIsSosActive(true);
    setDragProgress(1);
    onUpdateStatus('CRITICAL_SOS');
    soundAlert.playSosChime();
    setToastMessage('🚨 Emergency SOS transmitted to all circle nodes!');
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSosCancel = () => {
    setIsSosActive(false);
    setDragProgress(0);
    onUpdateStatus('SAFE');
    soundAlert.playStatusChime();
    setToastMessage('🟢 Marked Safe. Broadcast cleared.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleAlarm = () => {
    if (isAlarmPlaying) {
      soundAlert.stopContinuousAlarm();
      setIsAlarmPlaying(false);
    } else {
      soundAlert.startContinuousAlarm();
      setIsAlarmPlaying(true);
    }
  };

  // Pointer drag event handlers for SOS Slider
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSosActive) return;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateDrag(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateDrag(e.clientX);
  };

  const updateDrag = (clientX: number) => {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const maxSlide = rect.width - 52;
    const offset = Math.max(0, Math.min(clientX - rect.left - 24, maxSlide));
    const progress = offset / maxSlide;
    setDragProgress(progress);

    if (progress >= 0.85) {
      setIsDragging(false);
      setDragProgress(1);
      handleSosTrigger();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    if (dragProgress >= 0.65) {
      setDragProgress(1);
      handleSosTrigger();
    } else {
      setDragProgress(0);
    }
  };

  return (
    <div className="flex flex-col px-4 pt-3 pb-24 text-white select-none max-w-[440px] mx-auto w-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold tracking-tight text-white">ResQ</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-gray-400 font-medium ml-1">P2P</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setToastMessage('🔔 2 Circle check-ins received via local mesh.');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="relative p-2 rounded-full bg-[#181A24] border border-[#272A3A] hover:bg-[#222534] transition-colors text-gray-300 hover:text-white"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-full bg-[#181A24] border border-[#272A3A] hover:bg-[#222534] transition-colors text-gray-300 hover:text-white"
            title="Help & Emergency Info"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* My Account & Emergency Medical ID Button (Blank PFP) */}
          <button
            onClick={onOpenProfile}
            className="relative p-0.5 rounded-full bg-[#181A24] border border-[#2A2E42] hover:border-[#424866] hover:bg-[#222534] transition-all flex items-center justify-center group active:scale-95"
            title="My Account (Medical ID & Profile)"
          >
            <div className="w-7 h-7 rounded-full bg-[#202334] border border-[#2C3147] flex items-center justify-center overflow-hidden">
              <User className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#12141D]" />
          </button>
        </div>
      </div>

      {/* Greeting Row */}
      <div className="mt-2.5 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Hi, {userName}!
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            4 Nodes Active in Delhi NCR · {myBattery}% battery
          </p>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-[#181A24] border border-[#272A3A] text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Radar</span>
        </div>
      </div>

      {/* Stories / Circle Contacts Strip */}
      <div className="mt-3.5 flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        {circleMembers.slice(0, 4).map((member, idx) => (
          <button
            key={member.id}
            onClick={() => onSelectMember(member.id)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            <div
              className={`w-13 h-13 rounded-full p-[2px] border-2 ${
                ringColors[idx % ringColors.length]
              } transition-transform group-hover:scale-105 active:scale-95 relative`}
            >
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-full h-full rounded-full object-cover bg-gray-800"
              />
              {member.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0B0C10]" />
              )}
            </div>
            <span className="text-[11px] font-medium text-gray-300 max-w-[58px] truncate text-center">
              {member.name}
            </span>
          </button>
        ))}

        <button
          onClick={onOpenPairing}
          className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
        >
          <div className="w-13 h-13 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-400 transition-colors bg-[#141620]">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-gray-400">Add</span>
        </button>
      </div>

      {/* MAP SECTION COVERING 1/3 PART OF THE HOME SCREEN (Google Maps Preview) */}
      <div className="mt-4 relative w-full h-[32vh] min-h-[220px] max-h-[290px] rounded-3xl overflow-hidden border border-[#272A3C] shadow-xl bg-[#12141C]">
        {/* Google Map Container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top Floating Controls on the 1/3 Map */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none">
          {/* Filter Chips */}
          <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[70%]">
            {onNavigateToMap && (
              <button
                onClick={onNavigateToMap}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1"
                title="Open Tactical Emergency Map"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Full Map</span>
              </button>
            )}
            <button
              onClick={() => setActiveFilter('contacts')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all ${
                activeFilter === 'contacts'
                  ? 'bg-white text-gray-900 shadow-md font-bold'
                  : 'bg-[#181A24]/90 backdrop-blur-md text-gray-300 border border-[#2A2E40]'
              }`}
            >
              My Contacts
            </button>
            <button
              onClick={() => setActiveFilter('family')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all ${
                activeFilter === 'family'
                  ? 'bg-white text-gray-900 shadow-md font-bold'
                  : 'bg-[#181A24]/90 backdrop-blur-md text-gray-300 border border-[#2A2E40]'
              }`}
            >
              Family
            </button>
            <button
              onClick={() => setActiveFilter('shelters')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all ${
                activeFilter === 'shelters'
                  ? 'bg-white text-gray-900 shadow-md font-bold'
                  : 'bg-[#181A24]/90 backdrop-blur-md text-gray-300 border border-[#2A2E40]'
              }`}
            >
              Shelters
            </button>
          </div>

          {/* Map action buttons */}
          <div className="pointer-events-auto flex items-center gap-1 bg-[#181A24]/90 backdrop-blur-md p-1 rounded-full border border-[#2A2E40]">
            <button
              onClick={handleCenterUser}
              className="p-1 rounded-full hover:bg-[#252838] text-blue-400"
              title="Center on My Location"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitAll}
              className="p-1 rounded-full hover:bg-[#252838] text-gray-300"
              title="Fit All Contacts"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowShelters((p) => !p)}
              className={`p-1 rounded-full ${
                showShelters ? 'text-emerald-400 bg-emerald-500/20' : 'text-gray-500'
              }`}
              title="Toggle Shelters"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Floating Active Member Card on Map */}
        {activeMember && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 pointer-events-auto">
            <div className="bg-[#141620]/95 backdrop-blur-md rounded-2xl px-3 py-2 border border-[#2A2E40] shadow-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={activeMember.avatarUrl}
                  alt={activeMember.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {activeMember.name}
                    </span>
                    <span className="text-[10px] text-blue-400 font-bold">
                      • {formatDistance(
                        calculateDistanceMeters(
                          userLocation.lat,
                          userLocation.lng,
                          activeMember.lastLat,
                          activeMember.lastLng
                        )
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{activeMember.statusMessage}</p>
                </div>
              </div>

              <button
                onClick={() => onMessageMember(activeMember)}
                className="w-8 h-8 rounded-full bg-white text-gray-950 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
                title="Send direct message"
              >
                <Navigation className="w-3.5 h-3.5 rotate-45 -mr-0.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Hotkeys: Police (112), Ambulance (108), Fire (101) */}
      <div className="mt-3.5 grid grid-cols-3 gap-2">
        {/* Police */}
        <a
          href="tel:112"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-[#13151F] hover:bg-[#191C2A] border border-[#232738] hover:border-blue-500/40 text-white transition-all active:scale-95 shadow-sm group text-center"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-1.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-200 leading-tight">Police</span>
          <span className="text-[10px] text-blue-400/90 font-mono font-semibold mt-0.5">112 / 100</span>
        </a>

        {/* Ambulance */}
        <a
          href="tel:108"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-[#13151F] hover:bg-[#191C2A] border border-[#232738] hover:border-rose-500/40 text-white transition-all active:scale-95 shadow-sm group text-center"
        >
          <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-1.5 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <HeartPulse className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-200 leading-tight">Ambulance</span>
          <span className="text-[10px] text-rose-400/90 font-mono font-semibold mt-0.5">108 / 102</span>
        </a>

        {/* Fire Brigade */}
        <a
          href="tel:101"
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-[#13151F] hover:bg-[#191C2A] border border-[#232738] hover:border-orange-500/40 text-white transition-all active:scale-95 shadow-sm group text-center"
        >
          <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-1.5 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-200 leading-tight">Fire Brigade</span>
          <span className="text-[10px] text-orange-400/90 font-mono font-semibold mt-0.5">101</span>
        </a>
      </div>

      {/* Swipe SOS Emergency Slider with Perfect Circle Knob */}
      <div className="mt-3">
        <div
          ref={sliderTrackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-full h-14 rounded-full p-1 flex items-center shadow-lg cursor-pointer select-none transition-colors duration-300 touch-none ${
            isSosActive
              ? 'bg-[#1C0F14] border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
              : 'bg-[#12141D] border border-[#242838]'
          }`}
        >
          {/* Track Text Label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-bold tracking-wider uppercase text-gray-300 select-none">
            {isSosActive ? '🚨 SOS ACTIVE — BROADCASTING' : 'SLIDE TO BROADCAST SOS'}
          </div>

          {/* Perfect Circle Red Slider Knob */}
          <div
            style={{
              transform: `translateX(${
                isSosActive
                  ? (sliderTrackRef.current ? sliderTrackRef.current.clientWidth - 54 : 220)
                  : dragProgress * (sliderTrackRef.current ? sliderTrackRef.current.clientWidth - 54 : 220)
              }px)`,
              transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className={`relative z-10 w-12 h-12 rounded-full aspect-square shrink-0 flex items-center justify-center shadow-xl transition-colors cursor-grab active:cursor-grabbing ${
              isSosActive
                ? 'bg-white text-rose-600 shadow-[0_0_20px_rgba(255,255,255,0.9)]'
                : 'bg-gradient-to-tr from-red-600 via-rose-600 to-pink-500 text-white shadow-[0_4px_14px_rgba(225,29,72,0.6)]'
            }`}
          >
            {isSosActive ? (
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            ) : (
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
        </div>

        {isSosActive && (
          <button
            onClick={handleSosCancel}
            className="mt-2 w-full py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-xs font-bold text-rose-300 border border-rose-500/40 transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Cancel SOS Alarm & Mark Safe</span>
          </button>
        )}
      </div>

      {/* Quick Action Cards Bar */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={onToggleStrobe}
          className={`p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
            isStrobeActive
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-[#141620] border-[#272A3C] text-gray-300 hover:text-white'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-[#1E2232] flex items-center justify-center shrink-0">
            <Zap className={`w-4 h-4 ${isStrobeActive ? 'text-amber-400' : 'text-gray-400'}`} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold">Strobe Light</div>
            <div className="text-[10px] text-gray-400">
              {isStrobeActive ? 'Active' : 'Off'}
            </div>
          </div>
        </button>

        <button
          onClick={handleToggleAlarm}
          className={`p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
            isAlarmPlaying
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-[#141620] border-[#272A3C] text-gray-300 hover:text-white'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-[#1E2232] flex items-center justify-center shrink-0">
            {isAlarmPlaying ? (
              <Volume2 className="w-4 h-4 text-rose-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold">Siren Siren</div>
            <div className="text-[10px] text-gray-400">
              {isAlarmPlaying ? 'Playing' : 'Silent'}
            </div>
          </div>
        </button>
      </div>

      {/* Status Toast Popup */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 max-w-[390px] mx-auto z-50 p-3 rounded-2xl bg-[#161924] border border-[#2B3044] shadow-2xl text-xs font-medium text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
