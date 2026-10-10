import React, { useState } from 'react';
import type {
  DisasterScenario,
  DisasterCategory,
  SafeZone,
  FamilyMember,
  MeshPacket,
} from '../../types';
import { DISASTER_SCENARIOS } from '../../services/disasterData';
import { soundAlert } from '../../services/soundAlert';
import {
  WifiOff,
  BatteryCharging,
  Zap,
  Volume2,
  VolumeX,
  CheckSquare,
  Square,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Droplets,
  Wind,
  Activity,
  Flame,
  Snowflake,
  HeartHandshake,
  Heart,
  HelpCircle,
} from 'lucide-react';

interface ToolsScreenProps {
  currentScenario: DisasterScenario;
  onSelectScenario: (scenario: DisasterScenario) => void;
  isCellTowerDown: boolean;
  onToggleCellBlackout: () => void;
  safeZones: SafeZone[];
  circleMembers: FamilyMember[];
  packets: MeshPacket[];
  localNodeId: string;
  onSimulateRelayBounce: () => void;
  onSimulateGeofenceEntrance: () => void;
  onAddSafeZone: (newZone: Omit<SafeZone, 'id'>) => void;
  onOpenPairModal: () => void;
  onToggleStrobe: () => void;
  isStrobeActive: boolean;
}

interface TriageItem {
  id: string;
  title: string;
  instruction: string;
  completed: boolean;
}

const INITIAL_TRIAGE_CHECKLIST: TriageItem[] = [
  {
    id: 't1',
    title: 'Severe Bleeding Control',
    instruction: 'Apply direct pressure with a clean cloth or tourniquet 5cm above the wound. Write the time applied on clothing.',
    completed: false,
  },
  {
    id: 't2',
    title: 'Staying Warm & Preventing Shock',
    instruction: 'Keep legs elevated 30cm and wrap in an emergency foil blanket. Insulate from damp ground using cardboard or jackets.',
    completed: true,
  },
  {
    id: 't3',
    title: 'Safe Drinking Water Steps',
    instruction: 'Bring water to a rolling boil for 60 seconds or use purification tablets. Avoid standing flood water completely.',
    completed: false,
  },
  {
    id: 't4',
    title: 'Breathing & Smoke Protection',
    instruction: 'Place a damp cloth over nose and mouth. Rest in a low, ventilated spot and keep airways clear.',
    completed: false,
  },
  {
    id: 't5',
    title: 'Caring for Suspected Fractures',
    instruction: 'Support the limb with rolled blankets or sticks above and below the injury. Do not try to realign broken bones.',
    completed: false,
  },
];

export const ToolsScreen: React.FC<ToolsScreenProps> = ({
  currentScenario,
  onSelectScenario,
  isCellTowerDown,
  onToggleCellBlackout,
  safeZones,
  circleMembers,
  packets,
  localNodeId,
  onSimulateRelayBounce,
  onSimulateGeofenceEntrance,
  onOpenPairModal,
  onToggleStrobe,
  isStrobeActive,
}) => {
  const [isPowerSaverActive, setIsPowerSaverActive] = useState<boolean>(false);
  const [isMorseActive, setIsMorseActive] = useState<boolean>(false);
  const [triageList, setTriageList] = useState<TriageItem[]>(INITIAL_TRIAGE_CHECKLIST);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const toggleTriageItem = (id: string) => {
    setTriageList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const toggleMorseAudio = () => {
    if (!isMorseActive) {
      soundAlert.playSosAlarm();
      setIsMorseActive(true);
    } else {
      soundAlert.isMuted = true;
      setIsMorseActive(false);
      setTimeout(() => {
        soundAlert.isMuted = false;
      }, 500);
    }
  };

  const handleCopyNodeKey = () => {
    navigator.clipboard.writeText(`RESQ-${localNodeId.slice(-4).toUpperCase()}-NODE`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getDisasterIcon = (id: DisasterCategory) => {
    switch (id) {
      case 'FLASH_FLOOD':
        return <Droplets className="w-4 h-4 text-[#6495ED]" />;
      case 'CYCLONE_HURRICANE':
        return <Wind className="w-4 h-4 text-[#81B29A]" />;
      case 'EARTHQUAKE':
        return <Activity className="w-4 h-4 text-[#E9B44C]" />;
      case 'WILDFIRE':
        return <Flame className="w-4 h-4 text-[#E07A5F]" />;
      case 'WINTER_BLIZZARD':
        return <Snowflake className="w-4 h-4 text-[#A8A194]" />;
    }
  };

  const completedTriageCount = triageList.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col min-h-full pb-24 px-4 pt-4 space-y-4 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-[#F7F4EE] tracking-tight">
          Field Care Kit & Guides
        </h2>
        <p className="text-xs text-[#A8A194] mt-0.5">
          Emergency power conservation, optical signaling & offline first-aid checklist
        </p>
      </div>

      {/* Emergency Signaling Card */}
      <div className="p-4 rounded-2xl bg-[#201D1A] border border-[#332E29] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#F7F4EE]">
            Signaling & Night Beacons
          </span>
          <span className="text-[11px] text-[#E9B44C]">Field Hardware</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Torch / Screen Strobe */}
          <button
            onClick={onToggleStrobe}
            className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 ${
              isStrobeActive
                ? 'bg-[#E07A5F] text-white border-white shadow-lg'
                : 'bg-[#161412] hover:bg-[#27231F] text-[#D6D0C4] border-[#332E29]'
            }`}
          >
            <Zap className={`w-5 h-5 ${isStrobeActive ? 'text-white' : 'text-[#E9B44C]'}`} />
            <span className="text-xs font-semibold">
              {isStrobeActive ? 'Turn Off Strobe' : 'Screen Torch'}
            </span>
            <span className="text-[10px] text-[#A8A194]">High-contrast visual pulse</span>
          </button>

          {/* Morse SOS Tone */}
          <button
            onClick={toggleMorseAudio}
            className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 ${
              isMorseActive
                ? 'bg-[#E9B44C] text-[#161412] border-white shadow-lg font-semibold'
                : 'bg-[#161412] hover:bg-[#27231F] text-[#D6D0C4] border-[#332E29]'
            }`}
          >
            {isMorseActive ? (
              <VolumeX className="w-5 h-5 text-[#161412]" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#81B29A]" />
            )}
            <span className="text-xs font-semibold">
              {isMorseActive ? 'Silence Audio' : 'Morse SOS Tone'}
            </span>
            <span className={`text-[10px] ${isMorseActive ? 'text-[#161412]' : 'text-[#A8A194]'}`}>
              Acoustic distress pulse
            </span>
          </button>
        </div>
      </div>

      {/* Mesh Power Saver Switch */}
      <div className="p-4 rounded-2xl bg-[#201D1A] border border-[#332E29] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BatteryCharging
              className={`w-4 h-4 ${isPowerSaverActive ? 'text-[#81B29A]' : 'text-[#A8A194]'}`}
            />
            <span className="text-xs font-semibold text-[#F7F4EE]">
              Mesh Power Saver
            </span>
          </div>

          <button
            onClick={() => setIsPowerSaverActive(!isPowerSaverActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPowerSaverActive ? 'bg-[#81B29A]' : 'bg-[#332E29]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPowerSaverActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-[#C4BDB0] leading-relaxed">
          {isPowerSaverActive
            ? '🌿 Power Saver is ON: Pings are spaced to 5-minute heartbeats to conserve battery while keeping you reachable.'
            : 'Standard Mode: Regular 15-second heartbeat. Turn this on if your battery is running low or power is out.'}
        </p>

        <div className="p-2.5 rounded-xl bg-[#161412] border border-[#2C2722] flex items-center justify-between text-xs">
          <span className="text-[#A8A194]">Estimated Lifeline:</span>
          <span className={`font-medium ${isPowerSaverActive ? 'text-[#81B29A]' : 'text-[#E9B44C]'}`}>
            {isPowerSaverActive ? '+18.5 hours remaining' : '~4.2 hours remaining'}
          </span>
        </div>
      </div>

      {/* Offline First-Aid Triage Checklist */}
      <div className="p-4 rounded-2xl bg-[#201D1A] border border-[#332E29] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E07A5F]" />
            <span className="text-xs font-semibold text-[#F7F4EE]">
              Offline Emergency First-Aid Guide
            </span>
          </div>
          <span className="text-xs font-medium text-[#81B29A]">
            {completedTriageCount} of {triageList.length} checked
          </span>
        </div>

        <div className="space-y-2">
          {triageList.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleTriageItem(item.id)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                item.completed
                  ? 'bg-[#1A261D] border-[#81B29A]/40 text-[#D6D0C4]'
                  : 'bg-[#161412] border-[#332E29] text-[#F7F4EE] hover:border-[#423C36]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-[#81B29A] shrink-0">
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8B8477]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`font-semibold text-xs block ${
                      item.completed ? 'line-through text-[#8B8477]' : 'text-[#F7F4EE]'
                    }`}
                  >
                    {item.title}
                  </span>
                  <p className="text-[11px] text-[#A8A194] mt-0.5 leading-relaxed">
                    {item.instruction}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Disaster Scenarios */}
      <div className="p-4 rounded-2xl bg-[#201D1A] border border-[#332E29] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#F7F4EE]">
            Disaster Scenario Profiles
          </span>
          <button
            onClick={onToggleCellBlackout}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
              isCellTowerDown
                ? 'bg-[#331C1A] border-[#E07A5F] text-[#E07A5F]'
                : 'bg-[#161412] border-[#332E29] text-[#A8A194]'
            }`}
          >
            <WifiOff className="w-3 h-3" />
            <span>Cellular: {isCellTowerDown ? 'Blackout (Mesh Only)' : 'Active'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DISASTER_SCENARIOS.map((sc) => {
            const isActive = currentScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-[#161412] border-[#E07A5F] text-[#F7F4EE] ring-1 ring-[#E07A5F]/40'
                    : 'bg-[#161412]/60 border-[#332E29] text-[#A8A194] hover:text-[#F7F4EE]'
                }`}
              >
                <div className="shrink-0">{getDisasterIcon(sc.id)}</div>
                <span className="text-xs font-medium truncate">
                  {sc.title.split('&')[0]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-[#161412] border border-[#2C2722] text-xs text-[#D6D0C4] leading-relaxed">
          <strong className="text-[#E9B44C] block mb-0.5 font-medium">Field Situation:</strong>
          {currentScenario.problem}
        </div>
      </div>

      {/* Node Pairing Card */}
      <div className="p-4 rounded-2xl bg-[#201D1A] border border-[#332E29] space-y-3">
        <div>
          <span className="text-xs font-semibold text-[#F7F4EE] block">
            Your Emergency Node Key
          </span>
          <p className="text-[11px] text-[#A8A194] mt-0.5">
            Share this short key with loved ones before disaster strikes to pair your devices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono font-medium text-xs text-[#6495ED] bg-[#161412] px-3.5 py-2.5 rounded-xl border border-[#332E29]">
            RESQ-{localNodeId.slice(-4).toUpperCase()}-NODE
          </div>
          <button
            onClick={handleCopyNodeKey}
            className="p-2.5 rounded-xl bg-[#161412] border border-[#332E29] text-[#D6D0C4] hover:text-white transition-colors"
            title="Copy Key"
          >
            {copiedKey ? <Check className="w-4 h-4 text-[#81B29A]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={onOpenPairModal}
          className="w-full py-3 rounded-xl bg-[#E07A5F] hover:bg-[#D96B50] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
        >
          <QrCode className="w-4 h-4" />
          <span>Show QR Code & WebRTC Link</span>
        </button>
      </div>
    </div>
  );
};
