import Dexie, { type Table } from 'dexie';
import type { EmergencyFacility, EmergencyFacilityCategory } from '../types';
import { calculateDistanceMeters } from './geofence';

export class EmergencyDatabase extends Dexie {
  facilities!: Table<EmergencyFacility, string>;

  constructor() {
    super('ResQEmergencyDatabase');
    this.version(1).stores({
      facilities: 'id, osmId, category, name, isVerified, lat, lng',
    });
  }

  async initializeWithSeedData(seedFacilities: EmergencyFacility[]) {
    const count = await this.facilities.count();
    if (count === 0 && seedFacilities.length > 0) {
      await this.facilities.bulkPut(seedFacilities);
      console.log(`[EmergencyDb] Populated IndexedDB with ${seedFacilities.length} offline facilities.`);
    }
  }

  async searchNearbyFacilities(
    userLat: number,
    userLng: number,
    categoryFilter?: EmergencyFacilityCategory | 'ALL',
    maxRadiusMeters: number = 25000,
    searchQuery: string = ''
  ): Promise<EmergencyFacility[]> {
    let query = this.facilities.toCollection();

    let list = await query.toArray();

    if (categoryFilter && categoryFilter !== 'ALL') {
      list = list.filter((f) => f.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.address && f.address.toLowerCase().includes(q)) ||
          (f.operator && f.operator.toLowerCase().includes(q))
      );
    }

    // Compute distances & sort
    const withDistances = list.map((f) => {
      const dist = calculateDistanceMeters(userLat, userLng, f.lat, f.lng);
      return {
        ...f,
        distanceMeters: dist,
      };
    });

    const filteredByRadius = withDistances.filter(
      (f) => (f.distanceMeters || 0) <= maxRadiusMeters
    );

    filteredByRadius.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

    return filteredByRadius;
  }
}

export const emergencyDb = new EmergencyDatabase();
