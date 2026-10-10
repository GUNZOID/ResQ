import Dexie, { type Table } from 'dexie';
import type { BeaconBreadcrumb, SafeZone, OutboxMessage, FamilyMember } from '../types';

export interface StoredBeaconRecord {
  id?: number;
  nodeId: string;
  nodeName: string;
  lat: number;
  lng: number;
  battery: number;
  status: string;
  timestamp: number;
  compressedToken: string;
}

export class ResQMeshDatabase extends Dexie {
  beacons!: Table<StoredBeaconRecord, number>;
  messages!: Table<OutboxMessage, string>;
  safeZones!: Table<SafeZone, string>;
  circle!: Table<FamilyMember, string>;

  constructor() {
    super('ResQMeshDisasterDB');
    this.version(1).stores({
      beacons: '++id, nodeId, timestamp, status',
      messages: 'id, targetId, status, createdAt',
      safeZones: 'id, name, type',
      circle: 'id, pairingKey, status, lastSeenTimestamp',
    });
  }
}

export const db = new ResQMeshDatabase();

// Default safe zones for emergency simulation (Delhi NCR)
export const INITIAL_SAFE_ZONES: SafeZone[] = [
  {
    id: 'zone-shelter-alpha',
    name: 'Talkatora Stadium Relief Shelter',
    type: 'COMMUNITY_CENTER',
    lat: 28.6180,
    lng: 77.1950,
    radiusMeters: 280,
    description: 'Designated disaster refuge zone equipped with emergency backup generators, water supply, and triage unit.',
  },
  {
    id: 'zone-hospital-central',
    name: 'AIIMS Trauma Center & Field Hospital',
    type: 'HOSPITAL',
    lat: 28.5672,
    lng: 77.2100,
    radiusMeters: 350,
    description: 'Critical casualty hub with emergency power and air-ambulance landing pad.',
  },
  {
    id: 'zone-high-ground',
    name: 'Central Ridge Forest (High Ground Point)',
    type: 'HIGH_GROUND',
    lat: 28.6010,
    lng: 77.1720,
    radiusMeters: 320,
    description: 'Elevated topography safe from coastal surge waves and urban flood torrents.',
  },
  {
    id: 'zone-home-safehouse',
    name: 'Family Safehouse (Lodhi Reinforced)',
    type: 'HOME_SAFEHOUSE',
    lat: 28.5933,
    lng: 77.2197,
    radiusMeters: 180,
    description: 'Pre-agreed domestic muster point with stored emergency rations and first-aid kits.',
  },
];

// Initial pre-paired contacts in Delhi NCR
export const INITIAL_CIRCLE_MEMBERS: FamilyMember[] = [
  {
    id: 'node-kevin',
    name: 'Kevin',
    relation: 'Friend',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    pairingKey: 'CIRCLE-1102',
    status: 'SAFE',
    statusMessage: 'Sheltering safely near Karol Bagh metro.',
    lastLat: 28.6514,
    lastLng: 77.1907,
    lastSeenTimestamp: Date.now() - 1000 * 60 * 3,
    batteryLevel: 94,
    isOnline: true,
    hopsToNode: 1,
    currentSafeZoneId: 'zone-shelter-alpha',
    signalDbm: -54,
    breadcrumbs: [],
  },
  {
    id: 'node-amber',
    name: 'Amber',
    relation: 'Partner',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    pairingKey: 'CIRCLE-2489',
    status: 'SAFE',
    statusMessage: 'At Saket District Centre. Battery holding well.',
    lastLat: 28.5245,
    lastLng: 77.2066,
    lastSeenTimestamp: Date.now() - 1000 * 60 * 1,
    batteryLevel: 86,
    isOnline: true,
    hopsToNode: 1,
    currentSafeZoneId: 'zone-high-ground',
    signalDbm: -48,
    breadcrumbs: [],
  },
  {
    id: 'node-rasheed-josh',
    name: 'Rasheed & Josh',
    relation: 'Roommates',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    pairingKey: 'CIRCLE-5190',
    status: 'SAFE',
    statusMessage: 'Together at Dwarka Sector 10. We have clean water.',
    lastLat: 28.5823,
    lastLng: 77.0500,
    lastSeenTimestamp: Date.now() - 1000 * 60 * 8,
    batteryLevel: 72,
    isOnline: true,
    hopsToNode: 2,
    currentSafeZoneId: null,
    signalDbm: -76,
    breadcrumbs: [],
  },
  {
    id: 'node-jacob',
    name: 'Jacob',
    relation: 'Colleague',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    pairingKey: 'CIRCLE-9421',
    status: 'SAFE',
    statusMessage: 'At Rohini Sector 8 building. Safe from rain.',
    lastLat: 28.7041,
    lastLng: 77.1025,
    lastSeenTimestamp: Date.now() - 1000 * 60 * 12,
    batteryLevel: 65,
    isOnline: true,
    hopsToNode: 2,
    currentSafeZoneId: null,
    signalDbm: -82,
    breadcrumbs: [],
  },
  {
    id: 'node-karen-castillo',
    name: 'Karen Castillo',
    relation: 'Family',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    pairingKey: 'CIRCLE-7704',
    status: 'SAFE',
    statusMessage: 'Connaught Place Outer Circle. Direct beacon active.',
    lastLat: 28.6304,
    lastLng: 77.2270,
    lastSeenTimestamp: Date.now() - 1000 * 45,
    batteryLevel: 88,
    isOnline: true,
    hopsToNode: 1,
    currentSafeZoneId: null,
    signalDbm: -62,
    breadcrumbs: [],
  },
  {
    id: 'node-austin-arthur',
    name: 'Austin Arthur',
    relation: 'Office Staff',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    pairingKey: 'CIRCLE-3312',
    status: 'SAFE',
    statusMessage: 'Lajpat Nagar Central Market · Node #2A8F',
    lastLat: 28.5677,
    lastLng: 77.2433,
    lastSeenTimestamp: Date.now() - 1000 * 60 * 6,
    batteryLevel: 92,
    isOnline: true,
    hopsToNode: 1,
    signalDbm: -58,
    breadcrumbs: [],
  },
  {
    id: 'node-lawrence',
    name: 'Lawrence',
    relation: 'Family',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    pairingKey: 'CIRCLE-4481',
    status: 'SAFE',
    statusMessage: 'Noida Sector 18 Metro Hub · Node #7C11',
    lastLat: 28.5708,
    lastLng: 77.3200,
    lastSeenTimestamp: Date.now() - 1000 * 60 * 15,
    batteryLevel: 74,
    isOnline: true,
    hopsToNode: 2,
    signalDbm: -78,
    breadcrumbs: [],
  },
  {
    id: 'node-louis-maison',
    name: 'Louis Maison',
    relation: 'Office Staff',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    pairingKey: 'CIRCLE-8832',
    status: 'SAFE',
    statusMessage: 'Janakpuri District Centre · Node #9E44',
    lastLat: 28.6219,
    lastLng: 77.0878,
    lastSeenTimestamp: Date.now() - 1000 * 60 * 4,
    batteryLevel: 81,
    isOnline: true,
    hopsToNode: 1,
    signalDbm: -65,
    breadcrumbs: [],
  },
];
