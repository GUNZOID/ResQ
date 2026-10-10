import type { SafeZone, GeofenceEvent } from '../types';

/**
 * Calculates Great-Circle distance between two coordinates in meters using the Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates bearing from origin to destination in degrees [0, 360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { degrees: number; cardinal: string } {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  const normalized = (deg + 360) % 360;

  const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  const cardIndex = Math.round(normalized / 45);
  return {
    degrees: Math.round(normalized),
    cardinal: CARDINALS[cardIndex],
  };
}

/**
 * Evaluates whether coordinates reside within any registered Safe Zone
 */
export function checkGeofenceStatus(
  lat: number,
  lng: number,
  safeZones: SafeZone[]
): SafeZone | null {
  for (const zone of safeZones) {
    const dist = calculateDistanceMeters(lat, lng, zone.lat, zone.lng);
    if (dist <= zone.radiusMeters) {
      return zone;
    }
  }
  return null;
}

/**
 * Detects entrance / exit transitions across geofenced safe zones
 */
export function evaluateGeofenceTransition(
  memberId: string,
  memberName: string,
  lat: number,
  lng: number,
  previousZoneId: string | null | undefined,
  safeZones: SafeZone[]
): {
  currentZone: SafeZone | null;
  event: GeofenceEvent | null;
} {
  const currentZone = checkGeofenceStatus(lat, lng, safeZones);
  const currentZoneId = currentZone ? currentZone.id : null;

  if (currentZoneId !== previousZoneId) {
    if (currentZone) {
      return {
        currentZone,
        event: {
          id: `geo-enter-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          memberId,
          memberName,
          zoneId: currentZone.id,
          zoneName: currentZone.name,
          action: 'ENTERED',
          timestamp: Date.now(),
          coordinates: [lat, lng],
        },
      };
    } else if (previousZoneId) {
      const prevZone = safeZones.find((z) => z.id === previousZoneId);
      return {
        currentZone: null,
        event: {
          id: `geo-exit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          memberId,
          memberName,
          zoneId: previousZoneId,
          zoneName: prevZone?.name || 'Safe Zone',
          action: 'EXITED',
          timestamp: Date.now(),
          coordinates: [lat, lng],
        },
      };
    }
  }

  return { currentZone, event: null };
}

/**
 * Formats distance into human readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
