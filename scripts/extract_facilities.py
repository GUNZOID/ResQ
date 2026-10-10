import os
import json
import sqlite3
import osmium

BBOX_MIN_LON = 76.84
BBOX_MIN_LAT = 28.40
BBOX_MAX_LON = 77.35
BBOX_MAX_LAT = 28.88

class EmergencyFacilityExtractor(osmium.SimpleHandler):
    def __init__(self):
        super(EmergencyFacilityExtractor, self).__init__()
        self.facilities = []
        self.counts = {
            'HOSPITAL': 0,
            'POLICE': 0,
            'FIRE_STATION': 0,
            'COMMUNITY_SHELTER': 0,
            'SAFE_ZONE': 0
        }

    def process_node(self, tags, lat, lon, osm_id):
        if not (BBOX_MIN_LON <= lon <= BBOX_MAX_LON and BBOX_MIN_LAT <= lat <= BBOX_MAX_LAT):
            return

        amenity = tags.get('amenity', '')
        healthcare = tags.get('healthcare', '')
        emergency = tags.get('emergency', '')
        shelter_type = tags.get('shelter_type', '')
        social_facility = tags.get('social_facility', '')
        name = tags.get('name', '') or tags.get('name:en', '') or tags.get('name:hi', '')

        category = None

        if amenity in ('hospital', 'clinic') or healthcare in ('hospital', 'clinic', 'centre'):
            category = 'HOSPITAL'
        elif amenity == 'police':
            category = 'POLICE'
        elif amenity == 'fire_station':
            category = 'FIRE_STATION'
        elif amenity == 'shelter' or social_facility == 'shelter' or shelter_type:
            category = 'COMMUNITY_SHELTER'
        elif emergency in ('assembly_point', 'designated_shelter', 'safe_area'):
            category = 'SAFE_ZONE'

        if category:
            if not name:
                name = f"Unnamed {category.replace('_', ' ').title()}"

            phone = tags.get('phone', '') or tags.get('contact:phone', '') or tags.get('emergency:phone', '')
            address = tags.get('addr:full', '') or tags.get('addr:street', '') or tags.get('addr:city', '') or 'Delhi NCR'
            operator = tags.get('operator', '') or tags.get('operator:type', '')

            facility = {
                'id': f"osm-node-{osm_id}",
                'osmId': int(osm_id),
                'osmType': 'node',
                'name': name,
                'category': category,
                'lat': round(lat, 6),
                'lng': round(lon, 6),
                'phone': phone,
                'address': address,
                'operator': operator,
                'isVerified': False,
                'source': 'OpenStreetMap (Geofabrik)',
                'lastUpdated': '2026-10-09'
            }

            self.facilities.append(facility)
            self.counts[category] += 1

    def node(self, n):
        if n.location.valid():
            self.process_node(n.tags, n.location.lat, n.location.lon, n.id)

def main():
    pbf_path = 'northern-zone-261008.osm.pbf'
    if not os.path.exists(pbf_path):
        print(f"Error: {pbf_path} not found")
        return

    print("Extracting emergency facilities from PBF for Delhi NCR...")
    handler = EmergencyFacilityExtractor()
    handler.apply_file(pbf_path, locations=False)

    print(f"Extraction complete! Total facilities found: {len(handler.facilities)}")
    for cat, count in handler.counts.items():
        print(f"  - {cat}: {count}")

    # 1. Save to SQLite database
    sqlite_path = 'emergency_facilities.sqlite'
    conn = sqlite3.connect(sqlite_path)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS emergency_facilities (
            id TEXT PRIMARY KEY,
            osm_id INTEGER,
            osm_type TEXT,
            name TEXT,
            category TEXT,
            lat REAL,
            lng REAL,
            phone TEXT,
            address TEXT,
            operator TEXT,
            is_verified INTEGER,
            source TEXT,
            last_updated TEXT
        )
    ''')
    cursor.execute('DELETE FROM emergency_facilities')

    for f in handler.facilities:
        cursor.execute('''
            INSERT INTO emergency_facilities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            f['id'], f['osmId'], f['osmType'], f['name'], f['category'],
            f['lat'], f['lng'], f['phone'], f['address'], f['operator'],
            1 if f['isVerified'] else 0, f['source'], f['lastUpdated']
        ))
    conn.commit()
    conn.close()
    print(f"Saved to SQLite database: {sqlite_path}")

    # 2. Save JSON for frontend bundling
    os.makedirs('src/data', exist_ok=True)
    json_path = 'src/data/emergency_facilities.json'
    with open(json_path, 'w', encoding='utf-8') as jf:
        json.dump(handler.facilities, jf, indent=2, ensure_ascii=False)
    print(f"Saved to JSON: {json_path} ({os.path.getsize(json_path)} bytes)")

if __name__ == '__main__':
    main()
