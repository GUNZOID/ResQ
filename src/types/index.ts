export type EmergencyStatus = 'SAFE' | 'NEED_HELP' | 'INJURED' | 'CRITICAL_SOS' | 'UNKNOWN';

export interface BeaconBreadcrumb {
  id: string;
  timestamp: number;
  lat: number;
  lng: number;
  battery: number;
  status: EmergencyStatus;
  compressedToken: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatarUrl: string;
  pairingKey: string;
  status: EmergencyStatus;
  statusMessage?: string;
  lastLat: number;
  lastLng: number;
  lastSeenTimestamp: number;
  batteryLevel: number; // 0-100
  isOnline: boolean;
  hopsToNode: number; // 1 = direct peer, 2 = 1 relay hop, etc.
  currentSafeZoneId?: string | null;
  signalDbm: number; // e.g. -68 dBm
  breadcrumbs: BeaconBreadcrumb[];
}

export type EmergencyFacilityCategory =
  | 'HOSPITAL'
  | 'POLICE'
  | 'FIRE_STATION'
  | 'COMMUNITY_SHELTER'
  | 'SAFE_ZONE';

export interface EmergencyFacility {
  id: string;
  osmId: number;
  osmType: string;
  name: string;
  category: EmergencyFacilityCategory;
  lat: number;
  lng: number;
  phone?: string;
  address?: string;
  operator?: string;
  isVerified: boolean;
  source: string;
  lastUpdated: string;
  distanceMeters?: number;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'COMMUNITY_CENTER' | 'HOSPITAL' | 'HIGH_GROUND' | 'HOME_SAFEHOUSE' | 'EMERGENCY_DEPOT';
  lat: number;
  lng: number;
  radiusMeters: number;
  description: string;
}

export type DisasterCategory =
  | 'CYCLONE_HURRICANE'
  | 'EARTHQUAKE'
  | 'FLASH_FLOOD'
  | 'WILDFIRE'
  | 'WINTER_BLIZZARD';

export interface DisasterScenario {
  id: DisasterCategory;
  title: string;
  problem: string;
  solutionTactic: string;
  iconName: string;
  hazardPerimeter?: { lat: number; lng: number; radiusMeters: number; label: string };
  recommendedSafeZoneId: string;
}

export interface MeshPacket {
  packetId: string;
  originNodeId: string;
  originName: string;
  targetNodeId: string; // "BROADCAST" | "TRUSTED_CIRCLE" | memberId
  type: 'BEACON' | 'STATUS_CHECKIN' | 'GEOFENCE_ALERT' | 'CHAT_MESSAGE' | 'SOS_ALARM' | 'PEER_PING';
  timestamp: number;
  hopCount: number;
  maxHops: number;
  relayPath: string[];
  payload: any;
  compressedBreadcrumb?: string;
  rawBytes: number;
  compressedBytes: number;
}

export interface GeofenceEvent {
  id: string;
  memberId: string;
  memberName: string;
  zoneId: string;
  zoneName: string;
  action: 'ENTERED' | 'EXITED';
  timestamp: number;
  coordinates: [number, number];
}

export interface OutboxMessage {
  id: string;
  content: string;
  targetId: string;
  targetName: string;
  createdAt: number;
  status: 'QUEUED' | 'RELAYING' | 'DELIVERED';
  hopTrace?: string[];
}

export interface UserProfile {
  name: string;
  age: string | number;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  medicalConditions: string;
}

