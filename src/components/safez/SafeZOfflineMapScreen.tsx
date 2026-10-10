/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreglWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

if (typeof window !== 'undefined' && maplibregl.setWorkerUrl) {
  maplibregl.setWorkerUrl(maplibreglWorker);
}
import * as pmtiles from 'pmtiles';
import type { EmergencyFacility, EmergencyFacilityCategory } from '../../types';
import { getOfflineMapStyle } from '../../services/mapStyle';
import { emergencyDb } from '../../services/emergencyDb';
import { formatDistance } from '../../services/geofence';
import {
  findMatchingAreasAndPincodes,
  type AreaLocation,
} from '../../data/delhi_areas_pincodes';
import {
  Shield,
  HeartPulse,
  Flame,
  Search,
  Crosshair,
  MapPin,
  Phone,
  Info,
  CheckCircle2,
  ChevronLeft,
  X,
  Compass,
  Building2,
  Navigation2,
  Layers,
  Globe,
  Radio,
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

const globalProtocol = new pmtiles.Protocol();
let isProtocolAdded = false;

function ensurePmtilesProtocol() {
  if (!isProtocolAdded) {
    maplibregl.addProtocol('pmtiles', globalProtocol.tile);
    isProtocolAdded = true;
  }
  try {
    const tilePath = `${window.location.origin}/tiles/delhi.pmtiles`;
    const pmtilesInstance = new pmtiles.PMTiles(tilePath);
    globalProtocol.add(pmtilesInstance);
  } catch (err) {
    console.warn('PMTiles registration notice:', err);
  }
}

interface SafeZOfflineMapScreenProps {
  userLocation: { lat: number; lng: number };
  onBackToHome?: () => void;
  seedFacilities?: EmergencyFacility[];
}

const CATEGORY_COLORS: Record<
  EmergencyFacilityCategory,
  { bg: string; text: string; border: string; marker: string }
> = {
  HOSPITAL: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/40',
    marker: '#EF4444',
  },
  POLICE: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    marker: '#3B82F6',
  },
  FIRE_STATION: {
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    border: 'border-orange-500/40',
    marker: '#F97316',
  },
  COMMUNITY_SHELTER: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    marker: '#10B981',
  },
  SAFE_ZONE: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    marker: '#8B5CF6',
  },
};

export const SafeZOfflineMapScreen: React.FC<SafeZOfflineMapScreenProps> = ({
  userLocation,
  onBackToHome,
  seedFacilities = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const googleUserMarkerRef = useRef<google.maps.Marker | null>(null);

  // States
  const [mapEngine, setMapEngine] = useState<'google' | 'pmtiles'>('google');
  const [googleMapType, setGoogleMapType] = useState<'dark' | 'satellite' | 'roadmap'>('dark');
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<
    EmergencyFacilityCategory | 'ALL'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [areaSuggestions, setAreaSuggestions] = useState<AreaLocation[]>([]);
  const [activeSearchCenter, setActiveSearchCenter] = useState<{
    lat: number;
    lng: number;
    label: string;
  }>({
    lat: 28.6139,
    lng: 77.209,
    label: 'Connaught Place, New Delhi',
  });

  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [selectedFacility, setSelectedFacility] =
    useState<EmergencyFacility | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsAccuracyText, setGpsAccuracyText] = useState<string>('Detecting GPS...');

  // 1. Load Google Maps JS Script dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).google && (window as any).google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script-resq';
    if (document.getElementById(scriptId)) {
      const checkLoaded = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          setIsGoogleMapsLoaded(true);
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
      setIsGoogleMapsLoaded(true);
    };
    script.onerror = () => {
      console.warn('Google Maps script failed to load, falling back to local PMTiles');
      setMapEngine('pmtiles');
    };
    document.head.appendChild(script);
  }, []);

  // 2. Automatic Live GPS Location Detection
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude, accuracy } = pos.coords;
          const inDelhi =
            latitude >= 28.35 &&
            latitude <= 28.95 &&
            longitude >= 76.80 &&
            longitude <= 77.45;

          if (inDelhi) {
            setActiveSearchCenter({
              lat: latitude,
              lng: longitude,
              label: `Your GPS (±${Math.round(accuracy)}m)`,
            });
            setGpsAccuracyText(`Live GPS (±${Math.round(accuracy)}m)`);
            panToLocation(latitude, longitude);
          } else {
            setGpsAccuracyText('GPS Active (Delhi Region Simulated)');
          }
        },
        (err) => {
          setIsLocating(false);
          setGpsAccuracyText('GPS Off / Fallback');
          console.warn('Geolocation lookup notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // 3. Initialize IndexedDB
  useEffect(() => {
    async function loadDb() {
      try {
        if (seedFacilities && seedFacilities.length > 0) {
          await emergencyDb.initializeWithSeedData(seedFacilities);
        }
        refreshFacilities();
      } catch (err) {
        console.error('Failed to initialize emergency database:', err);
      }
    }
    loadDb();
  }, [seedFacilities]);

  // 4. Query Facilities from IndexedDB
  const refreshFacilities = async () => {
    setIsLoading(true);
    try {
      const results = await emergencyDb.searchNearbyFacilities(
        activeSearchCenter.lat,
        activeSearchCenter.lng,
        selectedCategory,
        35000,
        searchQuery
      );
      setFacilities(results);
    } catch (e) {
      console.warn('Query error from indexedDB:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFacilities();
  }, [selectedCategory, searchQuery, activeSearchCenter]);

  // 5. Update Area / Pincode Suggestions
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const matches = findMatchingAreasAndPincodes(searchQuery);
      setAreaSuggestions(matches);
    } else {
      setAreaSuggestions([]);
    }
  }, [searchQuery]);

  const panToLocation = (lat: number, lng: number) => {
    if (mapEngine === 'google' && googleMapRef.current) {
      googleMapRef.current.panTo({ lat, lng });
      googleMapRef.current.setZoom(14);
    } else if (mapEngine === 'pmtiles' && mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 13.5,
        speed: 1.2,
      });
    }
  };

  // 6. INITIALIZE MAP (Google Maps or PMTiles)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup existing instances when switching engine
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    if (googleMapRef.current) {
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMarkersRef.current = [];
      if (googleUserMarkerRef.current) googleUserMarkerRef.current.setMap(null);
      googleMapRef.current = null;
    }

    if (mapEngine === 'google' && isGoogleMapsLoaded && (window as any).google?.maps) {
      // --- GOOGLE MAPS INITIALIZATION ---
      try {
        const google = (window as any).google;
        const mapTypeId =
          googleMapType === 'satellite'
            ? google.maps.MapTypeId.HYBRID
            : google.maps.MapTypeId.ROADMAP;

        const gMap = new google.maps.Map(mapContainerRef.current, {
          center: { lat: activeSearchCenter.lat, lng: activeSearchCenter.lng },
          zoom: 13,
          mapTypeId,
          disableDefaultUI: true,
          zoomControl: false,
          styles: googleMapType === 'dark' ? GOOGLE_MAPS_DARK_STYLE : undefined,
        });

        googleMapRef.current = gMap;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Google Maps, falling back to PMTiles:', err);
        setMapEngine('pmtiles');
      }
    } else {
      // --- PMTILES + MAPLIBRE INITIALIZATION ---
      ensurePmtilesProtocol();
      try {
        const tilePath = `${window.location.origin}/tiles/delhi.pmtiles`;
        const style = getOfflineMapStyle(tilePath);

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style,
          center: [activeSearchCenter.lng, activeSearchCenter.lat],
          zoom: 12.5,
          minZoom: 9,
          maxZoom: 15,
          attributionControl: false,
        });

        map.addControl(
          new maplibregl.AttributionControl({
            compact: true,
            customAttribution: '© OpenStreetMap contributors · Offline PMTiles',
          }),
          'bottom-right'
        );

        map.on('load', () => {
          setIsLoading(false);
          map.resize();
        });

        map.on('idle', () => {
          setIsLoading(false);
        });

        mapRef.current = map;

        const t1 = setTimeout(() => map.resize(), 100);
        const t2 = setTimeout(() => map.resize(), 500);

        const resizeObserver = new ResizeObserver(() => {
          map.resize();
        });
        if (mapContainerRef.current) {
          resizeObserver.observe(mapContainerRef.current);
        }

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          resizeObserver.disconnect();
          map.remove();
          mapRef.current = null;
        };
      } catch (err: any) {
        console.error('Failed to initialize MapLibre:', err);
        setIsLoading(false);
      }
    }
  }, [mapEngine, isGoogleMapsLoaded, googleMapType]);

  // 7. Update User Location Marker
  useEffect(() => {
    if (mapEngine === 'google' && googleMapRef.current && (window as any).google?.maps) {
      const google = (window as any).google;
      if (googleUserMarkerRef.current) {
        googleUserMarkerRef.current.setMap(null);
      }
      const marker = new google.maps.Marker({
        position: { lat: activeSearchCenter.lat, lng: activeSearchCenter.lng },
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        title: activeSearchCenter.label,
        zIndex: 999,
      });
      googleUserMarkerRef.current = marker;
    } else if (mapEngine === 'pmtiles' && mapRef.current) {
      const map = mapRef.current;
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <span class="absolute w-8 h-8 rounded-full bg-blue-500/35 animate-ping"></span>
        <span class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-xl z-10"></span>
      `;
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([activeSearchCenter.lng, activeSearchCenter.lat])
        .addTo(map);
      userMarkerRef.current = marker;
    }
  }, [activeSearchCenter, mapEngine]);

  // 8. Render Facility Markers
  useEffect(() => {
    if (mapEngine === 'google' && googleMapRef.current && (window as any).google?.maps) {
      const google = (window as any).google;
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMarkersRef.current = [];

      facilities.forEach((fac) => {
        const catColor = CATEGORY_COLORS[fac.category] || CATEGORY_COLORS.COMMUNITY_SHELTER;
        const marker = new google.maps.Marker({
          position: { lat: fac.lat, lng: fac.lng },
          map: googleMapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: catColor.marker,
            fillOpacity: 0.95,
            strokeColor: '#FFFFFF',
            strokeWeight: 1.5,
          },
          title: fac.name,
        });

        marker.addListener('click', () => {
          setSelectedFacility(fac);
          googleMapRef.current?.panTo({ lat: fac.lat, lng: fac.lng });
        });

        googleMarkersRef.current.push(marker);
      });
    } else if (mapEngine === 'pmtiles' && mapRef.current) {
      const map = mapRef.current;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      facilities.forEach((fac) => {
        const catColor = CATEGORY_COLORS[fac.category] || CATEGORY_COLORS.COMMUNITY_SHELTER;
        const el = document.createElement('div');
        el.className =
          'w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-125 border-2 border-white';
        el.style.backgroundColor = catColor.marker;
        el.innerHTML = `<span class="text-[9px] font-bold text-white">+</span>`;

        el.addEventListener('click', () => {
          setSelectedFacility(fac);
          map.flyTo({
            center: [fac.lng, fac.lat],
            zoom: 14.5,
            speed: 1.2,
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([fac.lng, fac.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [facilities, mapEngine]);

  const handleSelectArea = (area: AreaLocation) => {
    setActiveSearchCenter({
      lat: area.lat,
      lng: area.lng,
      label: `${area.name} (${area.pincode})`,
    });
    setSearchQuery('');
    setAreaSuggestions([]);
    panToLocation(area.lat, area.lng);
  };

  const handleTriggerGpsDetection = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude, accuracy } = pos.coords;
          setActiveSearchCenter({
            lat: latitude,
            lng: longitude,
            label: `Your GPS (±${Math.round(accuracy)}m)`,
          });
          setGpsAccuracyText(`Live GPS (±${Math.round(accuracy)}m)`);
          panToLocation(latitude, longitude);
        },
        (err) => {
          setIsLocating(false);
          setGpsAccuracyText('GPS Unavailable');
          console.warn('Geolocation failed:', err.message);
          setActiveSearchCenter({
            lat: 28.6139,
            lng: 77.209,
            label: 'Connaught Place, New Delhi',
          });
          panToLocation(28.6139, 77.209);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col bg-[#07080B] text-white select-none overflow-hidden">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
        {/* Header Pill & Engine Switcher */}
        <div className="flex items-center justify-between pointer-events-auto bg-[#0E1017]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#1E2230] shadow-xl">
          <div className="flex items-center gap-2">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1D28] transition-colors"
                title="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-xs font-bold text-white tracking-wide">
                  Tactical Emergency Map
                </h1>
              </div>
              <p className="text-[10px] text-gray-400 truncate max-w-[170px]">
                {activeSearchCenter.label}
              </p>
            </div>
          </div>

          {/* Engine & Layer Controls */}
          <div className="flex items-center gap-1">
            {/* Google / PMTiles Switcher */}
            <div className="flex items-center bg-[#161822] p-0.5 rounded-xl border border-[#232738] text-[10px]">
              <button
                onClick={() => setMapEngine('google')}
                className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                  mapEngine === 'google'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Online Google Maps API"
              >
                <Globe className="w-3 h-3" />
                <span>Google</span>
              </button>

              <button
                onClick={() => setMapEngine('pmtiles')}
                className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                  mapEngine === 'pmtiles'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="100% Offline PMTiles Map"
              >
                <Shield className="w-3 h-3" />
                <span>Offline</span>
              </button>
            </div>

            {/* Satellite / Dark Toggle (For Google Maps) */}
            {mapEngine === 'google' && (
              <button
                onClick={() =>
                  setGoogleMapType((prev) => (prev === 'dark' ? 'satellite' : 'dark'))
                }
                className={`p-1.5 rounded-xl border border-[#232738] transition-colors ${
                  googleMapType === 'satellite'
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#161822] text-gray-300 hover:text-white'
                }`}
                title={googleMapType === 'satellite' ? 'Dark Tactical' : 'Satellite View'}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleTriggerGpsDetection}
              disabled={isLocating}
              className={`p-1.5 rounded-xl bg-[#161822] hover:bg-[#202434] text-gray-300 hover:text-white border border-[#232738] transition-all active:scale-95 shadow-xs flex items-center gap-1 ${
                isLocating ? 'opacity-70 animate-pulse' : ''
              }`}
              title="Auto-detect GPS Location"
            >
              <Crosshair className={`w-3.5 h-3.5 text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Input Bar with Pincode / Area Support */}
        <div className="pointer-events-auto relative">
          <div className="flex items-center gap-2 bg-[#0E1017]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#1E2230] shadow-lg">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pincode (110001), area (Dwarka, Saket) or hospital..."
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setAreaSuggestions([]);
                }}
                className="p-0.5 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Area / Pincode Autocomplete Dropdown */}
          {areaSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#12141C] border border-[#262A3C] rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto no-scrollbar z-50">
              <div className="p-2 border-b border-[#1E2230] text-[10px] font-bold text-gray-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span>Delhi NCR Districts & Pincodes ({areaSuggestions.length})</span>
              </div>
              {areaSuggestions.map((area, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectArea(area)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#1C202E] border-b border-[#181B26] last:border-none flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">{area.name}</div>
                      <div className="text-[10px] text-gray-400">{area.district}, Delhi NCR</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    PIN {area.pincode}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter Horizontal Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-white text-gray-950 shadow-md font-bold'
                : 'bg-[#141620]/90 text-gray-300 hover:text-white border border-[#242738]'
            }`}
          >
            All ({facilities.length})
          </button>

          <button
            onClick={() => setSelectedCategory('HOSPITAL')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
              selectedCategory === 'HOSPITAL'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-[#141620]/90 text-rose-400 hover:text-rose-300 border border-rose-500/30'
            }`}
          >
            <HeartPulse className="w-3 h-3" />
            <span>Hospitals</span>
          </button>

          <button
            onClick={() => setSelectedCategory('POLICE')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
              selectedCategory === 'POLICE'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#141620]/90 text-blue-400 hover:text-blue-300 border border-blue-500/30'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Police</span>
          </button>

          <button
            onClick={() => setSelectedCategory('FIRE_STATION')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
              selectedCategory === 'FIRE_STATION'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-[#141620]/90 text-orange-400 hover:text-orange-300 border border-orange-500/30'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Fire</span>
          </button>

          <button
            onClick={() => setSelectedCategory('COMMUNITY_SHELTER')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
              selectedCategory === 'COMMUNITY_SHELTER'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#141620]/90 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>Shelters</span>
          </button>

          <button
            onClick={() => setSelectedCategory('SAFE_ZONE')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
              selectedCategory === 'SAFE_ZONE'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#141620]/90 text-purple-400 hover:text-purple-300 border border-purple-500/30'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Safe Zones</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Container (Google Maps or MapLibre WebGL) */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-[#141620] border border-[#242738] shadow-2xl flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-semibold text-gray-200">
              Loading {mapEngine === 'google' ? 'Google Maps' : 'offline map'} & facilities...
            </span>
          </div>
        </div>
      )}

      {/* Selected Facility Details Sheet (Bottom Modal) */}
      {selectedFacility && (
        <div className="absolute bottom-4 left-3 right-3 z-40 max-w-[420px] mx-auto bg-[#12141C] border border-[#242738] rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    (
                      CATEGORY_COLORS[selectedFacility.category] ||
                      CATEGORY_COLORS.COMMUNITY_SHELTER
                    ).bg
                  } ${
                    (
                      CATEGORY_COLORS[selectedFacility.category] ||
                      CATEGORY_COLORS.COMMUNITY_SHELTER
                    ).text
                  } border ${
                    (
                      CATEGORY_COLORS[selectedFacility.category] ||
                      CATEGORY_COLORS.COMMUNITY_SHELTER
                    ).border
                  }`}
                >
                  {selectedFacility.category.replace('_', ' ')}
                </span>
                {selectedFacility.isVerified && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                {selectedFacility.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedFacility(null)}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-[#1E2230] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-gray-300 my-3">
            {selectedFacility.address && (
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{selectedFacility.address}</span>
              </div>
            )}
            {selectedFacility.phone && (
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href={`tel:${selectedFacility.phone}`}
                  className="hover:underline text-emerald-300 font-semibold"
                >
                  {selectedFacility.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1 border-t border-[#1C202E]">
              <Info className="w-3 h-3 text-blue-400 shrink-0" />
              <span>
                Coordinates: {selectedFacility.lat.toFixed(4)},{' '}
                {selectedFacility.lng.toFixed(4)}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">OSM ID: {selectedFacility.osmId}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#1F2436]">
            <button
              onClick={() => {
                panToLocation(selectedFacility.lat, selectedFacility.lng);
              }}
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <Navigation2 className="w-3.5 h-3.5" />
              <span>Center on Map</span>
            </button>
            {selectedFacility.phone && (
              <a
                href={`tel:${selectedFacility.phone}`}
                className="px-4 py-2 rounded-xl bg-[#1E2334] hover:bg-[#282F46] text-emerald-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#2D354E]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
