import React, { useState, useEffect } from 'react';
import type {
  FamilyMember,
  SafeZone,
  EmergencyStatus,
  MeshPacket,
} from './types';
import { INITIAL_SAFE_ZONES, INITIAL_CIRCLE_MEMBERS } from './services/db';
import { meshEngine } from './services/meshEngine';
import { soundAlert } from './services/soundAlert';

import { SafeZBottomNav, type SafeZTab } from './components/safez/SafeZBottomNav';
import { SafeZHomeScreen } from './components/safez/SafeZHomeScreen';
import { SafeZOfflineMapScreen } from './components/safez/SafeZOfflineMapScreen';
import { SafeZDedicatedSosScreen } from './components/safez/SafeZDedicatedSosScreen';
import { SafeZContactsScreen } from './components/safez/SafeZContactsScreen';
import { SafeZAiScreen } from './components/safez/SafeZAiScreen';
import { SafeZQuickHelpModal } from './components/safez/SafeZQuickHelpModal';
import { CirclePairingModal } from './components/CirclePairingModal';
import { UserProfileModal } from './components/UserProfileModal';
import { loadUserProfile, saveUserProfile } from './services/userProfile';
import type { UserProfile } from './types';
import emergencyFacilitiesData from './data/emergency_facilities.json';
import type { EmergencyFacility } from './types';

import { Smartphone, LayoutGrid } from 'lucide-react';

export default function App() {
  // Navigation: active tab down the app (like Instagram), with SOS switched with Maps
  const [activeTab, setActiveTab] = useState<SafeZTab>('home');
  const [viewMode, setViewMode] = useState<'mobile' | 'studio'>('mobile');

  // User Location & Status
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.2090,
  });
  const [myStatus, setMyStatus] = useState<EmergencyStatus>('SAFE');
  const [myBattery, setMyBattery] = useState<number>(88);
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);

  // Core Data
  const [circleMembers, setCircleMembers] = useState<FamilyMember[]>(INITIAL_CIRCLE_MEMBERS);
  const [safeZones, setSafeZones] = useState<SafeZone[]>(INITIAL_SAFE_ZONES);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Real Geolocation & Battery APIs
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos.coords.latitude && pos.coords.longitude) {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
        },
        () => {},
        { timeout: 5000 }
      );
    }

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          setMyBattery(Math.round(battery.level * 100));
          battery.addEventListener('levelchange', () => {
            setMyBattery(Math.round(battery.level * 100));
          });
        })
        .catch(() => {});
    }
  }, []);

  // Listen to Mesh Packet Events
  useEffect(() => {
    const unsub = meshEngine.subscribe((packet: MeshPacket) => {
      if (
        (packet.type === 'STATUS_CHECKIN' || packet.type === 'SOS_ALARM') &&
        packet.payload?.status
      ) {
        setCircleMembers((prev) =>
          prev.map((m) =>
            m.id === packet.originNodeId
              ? {
                  ...m,
                  status: packet.payload.status,
                  lastSeenTimestamp: Date.now(),
                  batteryLevel: packet.payload.battery ?? m.batteryLevel,
                }
              : m
          )
        );

        if (packet.payload.status === 'CRITICAL_SOS') {
          soundAlert.playSosChime();
        }
      }
    });

    return () => unsub();
  }, []);

  const handleUpdateStatus = (status: EmergencyStatus) => {
    setMyStatus(status);
    meshEngine.broadcastStatus(status, userLocation.lat, userLocation.lng, myBattery);
  };

  const handleMessageMember = (member: FamilyMember) => {
    setSelectedMemberId(member.id);
    setActiveTab('contacts');
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-white flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Desktop Top Toolbar: View switcher (Mobile App vs Side-by-Side Studio) */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-[#0E1017] border-b border-[#1E2230] text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-white tracking-wide">SafeZ Disaster Lifeline</span>
          <span className="text-gray-500">· Dark Mode Native UI</span>
        </div>

        <div className="flex items-center gap-1 bg-[#161822] p-1 rounded-xl border border-[#232738]">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'mobile'
                ? 'bg-white text-gray-950 font-bold shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>
          <button
            onClick={() => setViewMode('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'studio'
                ? 'bg-white text-gray-950 font-bold shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Triple-Screen Mockup</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'mobile' ? (
        /* SINGLE MOBILE CONTAINER VIEW (Exact native mobile phone layout) */
        <div className="flex-1 flex items-center justify-center p-0 lg:p-6 bg-[#07080B]">
          <div className="relative w-full max-w-[430px] h-screen lg:h-[880px] lg:max-h-[95vh] bg-[#0B0C10] lg:rounded-[44px] lg:border-[8px] lg:border-[#1E212E] lg:shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
            {/* Native Mobile Status Bar on Top */}
            <div className="hidden lg:flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-gray-400 select-none shrink-0">
              <span>9:41</span>
              {/* Dynamic Island / Speaker notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto -mt-1 shadow-inner" />
              <div className="flex items-center gap-1.5 text-gray-300">
                <span className="text-[10px]">5G</span>
                <span>{myBattery}%</span>
              </div>
            </div>

            {/* Screen Content based on Active Bottom Tab */}
            <main className={`flex-1 relative min-h-0 ${activeTab === 'map' || activeTab === 'ai' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto no-scrollbar'}`}>
              {activeTab === 'home' && (
                <SafeZHomeScreen
                  userLocation={userLocation}
                  circleMembers={circleMembers}
                  safeZones={safeZones}
                  myStatus={myStatus}
                  myBattery={myBattery}
                  userName={userProfile.name}
                  selectedMemberId={selectedMemberId}
                  onSelectMember={(id) => setSelectedMemberId(id)}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenPairing={() => setIsPairingModalOpen(true)}
                  onOpenHelp={() => setIsHelpModalOpen(true)}
                  onOpenProfile={() => setIsProfileModalOpen(true)}
                  onToggleStrobe={() => setIsStrobeActive((prev) => !prev)}
                  isStrobeActive={isStrobeActive}
                  onNavigateToSos={() => setActiveTab('sos')}
                  onNavigateToMap={() => setActiveTab('map')}
                  onMessageMember={handleMessageMember}
                />
              )}

              {activeTab === 'map' && (
                <SafeZOfflineMapScreen
                  userLocation={userLocation}
                  onBackToHome={() => setActiveTab('home')}
                  seedFacilities={emergencyFacilitiesData as EmergencyFacility[]}
                />
              )}

              {activeTab === 'sos' && (
                <SafeZDedicatedSosScreen
                  circleMembers={circleMembers}
                  myStatus={myStatus}
                  myBattery={myBattery}
                  onUpdateStatus={handleUpdateStatus}
                  onToggleStrobe={() => setIsStrobeActive((prev) => !prev)}
                  isStrobeActive={isStrobeActive}
                  onBackToHome={() => setActiveTab('home')}
                />
              )}

              {activeTab === 'contacts' && (
                <SafeZContactsScreen
                  circleMembers={circleMembers}
                  onSelectMember={setSelectedMemberId}
                  onOpenPairing={() => setIsPairingModalOpen(true)}
                  onNavigateToLocation={() => setActiveTab('home')}
                />
              )}

              {activeTab === 'ai' && <SafeZAiScreen />}
            </main>

            {/* Section Bar DOWN the app (Fixed Bottom Navigation Bar) */}
            <SafeZBottomNav
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              unreadCount={2}
              isSosActive={myStatus === 'CRITICAL_SOS'}
            />
          </div>
        </div>
      ) : (
        /* TRIPLE-SCREEN STUDIO VIEW (Matching the side-by-side presentation from the user's reference image!) */
        <div className="flex-1 overflow-x-auto p-8 flex items-center justify-center gap-8 bg-[#090A0F]">
          {/* Screen 1: Home Screen with 1/3 Map & Quick SOS */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
              1. Home & 1/3 Map
            </span>
            <div className="relative w-[370px] h-[760px] bg-[#0B0C10] rounded-[38px] border-[6px] border-[#1C1F2B] shadow-2xl overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
                <SafeZHomeScreen
                  userLocation={userLocation}
                  circleMembers={circleMembers}
                  safeZones={safeZones}
                  myStatus={myStatus}
                  myBattery={myBattery}
                  userName={userProfile.name}
                  selectedMemberId={selectedMemberId}
                  onSelectMember={(id) => setSelectedMemberId(id)}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenPairing={() => setIsPairingModalOpen(true)}
                  onOpenHelp={() => setIsHelpModalOpen(true)}
                  onOpenProfile={() => setIsProfileModalOpen(true)}
                  onToggleStrobe={() => setIsStrobeActive((prev) => !prev)}
                  isStrobeActive={isStrobeActive}
                  onNavigateToSos={() => setActiveTab('sos')}
                  onMessageMember={handleMessageMember}
                />
              </div>
              <SafeZBottomNav activeTab="home" onChangeTab={setActiveTab} />
            </div>
          </div>

          {/* Screen 2: Dedicated SOS Broadcast Screen */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
              2. Emergency SOS Screen
            </span>
            <div className="relative w-[370px] h-[760px] bg-[#0B0C10] rounded-[38px] border-[6px] border-[#1C1F2B] shadow-2xl overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
                <SafeZDedicatedSosScreen
                  circleMembers={circleMembers}
                  myStatus={myStatus}
                  myBattery={myBattery}
                  onUpdateStatus={handleUpdateStatus}
                  onToggleStrobe={() => setIsStrobeActive((prev) => !prev)}
                  isStrobeActive={isStrobeActive}
                  onBackToHome={() => setActiveTab('home')}
                />
              </div>
              <SafeZBottomNav activeTab="sos" onChangeTab={setActiveTab} isSosActive={myStatus === 'CRITICAL_SOS'} />
            </div>
          </div>

          {/* Screen 3: Contacts & Communities Screen */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
              3. Contacts & Communities
            </span>
            <div className="relative w-[370px] h-[760px] bg-[#0B0C10] rounded-[38px] border-[6px] border-[#1C1F2B] shadow-2xl overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
                <SafeZContactsScreen
                  circleMembers={circleMembers}
                  onSelectMember={setSelectedMemberId}
                  onOpenPairing={() => setIsPairingModalOpen(true)}
                  onNavigateToLocation={() => setActiveTab('home')}
                />
              </div>
              <SafeZBottomNav activeTab="contacts" onChangeTab={setActiveTab} />
            </div>
          </div>
        </div>
      )}

      {/* Circle Pairing Modal */}
      <CirclePairingModal
        isOpen={isPairingModalOpen}
        localNodeId={meshEngine.getNodeId()}
        onClose={() => setIsPairingModalOpen(false)}
        onAddMember={(partialMember) => {
          const fullMember: FamilyMember = {
            id: partialMember.id || `node-${Date.now()}`,
            name: partialMember.name || 'Circle Member',
            relation: partialMember.relation || 'Friend',
            avatarUrl:
              partialMember.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            pairingKey:
              partialMember.pairingKey || `PAIR-${Math.floor(1000 + Math.random() * 9000)}`,
            status: partialMember.status || 'SAFE',
            lastLat: partialMember.lastLat || userLocation.lat + (Math.random() - 0.5) * 0.01,
            lastLng: partialMember.lastLng || userLocation.lng + (Math.random() - 0.5) * 0.01,
            lastSeenTimestamp: Date.now(),
            batteryLevel: partialMember.batteryLevel ?? 95,
            isOnline: true,
            hopsToNode: 1,
            signalDbm: -65,
            breadcrumbs: [],
          };
          setCircleMembers((prev) => [...prev, fullMember]);
          setIsPairingModalOpen(false);
        }}
      />

      {/* Quick Help Guide Modal */}
      <SafeZQuickHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* User Profile & Emergency Medical ID Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Emergency Full-Screen Strobe Flashlight */}
      {isStrobeActive && (
        <div
          onClick={() => setIsStrobeActive(false)}
          className="fixed inset-0 z-[9999] animate-strobe flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
        >
          <div className="px-6 py-3 rounded-full bg-black/80 text-white font-bold text-sm tracking-widest backdrop-blur-md shadow-2xl">
            EMERGENCY OPTICAL STROBE · TAP ANYWHERE TO STOP
          </div>
        </div>
      )}
    </div>
  );
}
