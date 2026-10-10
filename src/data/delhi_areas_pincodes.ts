export interface AreaLocation {
  name: string;
  pincode?: string;
  category: 'PINCODE' | 'AREA' | 'LANDMARK';
  lat: number;
  lng: number;
  district: string;
}

export const DELHI_AREAS_AND_PINCODES: AreaLocation[] = [
  // Major Central & New Delhi Areas & Pincodes
  { name: 'Connaught Place / Rajiv Chowk', pincode: '110001', category: 'AREA', lat: 28.6315, lng: 77.2167, district: 'New Delhi' },
  { name: '110001', pincode: '110001', category: 'PINCODE', lat: 28.6315, lng: 77.2167, district: 'Connaught Place / New Delhi' },
  
  { name: 'New Delhi GPO / Gol Dak Khana', pincode: '110001', category: 'LANDMARK', lat: 28.6250, lng: 77.2085, district: 'New Delhi' },
  { name: 'India Gate / Rajpath / Kartavya Path', pincode: '110001', category: 'LANDMARK', lat: 28.6129, lng: 77.2295, district: 'Central Delhi' },
  { name: 'Parliament House / Central Vista', pincode: '110001', category: 'LANDMARK', lat: 28.6172, lng: 77.2082, district: 'New Delhi' },
  
  { name: 'Daryaganj / Delhi Gate', pincode: '110002', category: 'AREA', lat: 28.6465, lng: 77.2410, district: 'Central Delhi' },
  { name: '110002', pincode: '110002', category: 'PINCODE', lat: 28.6465, lng: 77.2410, district: 'Daryaganj' },
  
  { name: 'LNJP Hospital / Maulana Azad Medical', pincode: '110002', category: 'LANDMARK', lat: 28.6375, lng: 77.2405, district: 'Central Delhi' },
  
  { name: 'Alipur / North Delhi', pincode: '110036', category: 'AREA', lat: 28.7985, lng: 77.1335, district: 'North Delhi' },
  { name: '110036', pincode: '110036', category: 'PINCODE', lat: 28.7985, lng: 77.1335, district: 'Alipur' },

  { name: 'Chandni Chowk / Red Fort', pincode: '110006', category: 'AREA', lat: 28.6562, lng: 77.2307, district: 'North Delhi' },
  { name: '110006', pincode: '110006', category: 'PINCODE', lat: 28.6562, lng: 77.2307, district: 'Chandni Chowk / Old Delhi' },

  { name: 'Paharganj / New Delhi Railway Station', pincode: '110055', category: 'AREA', lat: 28.6435, lng: 77.2140, district: 'Central Delhi' },
  { name: '110055', pincode: '110055', category: 'PINCODE', lat: 28.6435, lng: 77.2140, district: 'Paharganj' },

  { name: 'Karol Bagh / Jhandewalan', pincode: '110005', category: 'AREA', lat: 28.6514, lng: 77.1907, district: 'Central Delhi' },
  { name: '110005', pincode: '110005', category: 'PINCODE', lat: 28.6514, lng: 77.1907, district: 'Karol Bagh' },

  { name: 'Patel Nagar / Shadipur', pincode: '110008', category: 'AREA', lat: 28.6558, lng: 77.1634, district: 'West Delhi' },
  { name: '110008', pincode: '110008', category: 'PINCODE', lat: 28.6558, lng: 77.1634, district: 'Patel Nagar' },

  { name: 'Rajouri Garden / Tagore Garden', pincode: '110027', category: 'AREA', lat: 28.6415, lng: 77.1215, district: 'West Delhi' },
  { name: '110027', pincode: '110027', category: 'PINCODE', lat: 28.6415, lng: 77.1215, district: 'Rajouri Garden' },

  { name: 'Janakpuri / District Centre', pincode: '110058', category: 'AREA', lat: 28.6219, lng: 77.0878, district: 'West Delhi' },
  { name: '110058', pincode: '110058', category: 'PINCODE', lat: 28.6219, lng: 77.0878, district: 'Janakpuri' },

  { name: 'Uttam Nagar / Nawada', pincode: '110059', category: 'AREA', lat: 28.6212, lng: 77.0543, district: 'West Delhi' },
  { name: '110059', pincode: '110059', category: 'PINCODE', lat: 28.6212, lng: 77.0543, district: 'Uttam Nagar' },

  { name: 'Dwarka Sector 21 / Sector 10 / City Centre', pincode: '110075', category: 'AREA', lat: 28.5921, lng: 77.0460, district: 'South West Delhi' },
  { name: '110075', pincode: '110075', category: 'PINCODE', lat: 28.5921, lng: 77.0460, district: 'Dwarka' },
  { name: '110077', pincode: '110077', category: 'PINCODE', lat: 28.5830, lng: 77.0570, district: 'Dwarka Sector 8/9' },
  { name: '110078', pincode: '110078', category: 'PINCODE', lat: 28.6015, lng: 77.0310, district: 'Dwarka Sector 14/Kakrola' },

  { name: 'Delhi Airport (IGI Airport T3 / Aerocity)', pincode: '110037', category: 'LANDMARK', lat: 28.5562, lng: 77.0999, district: 'South West Delhi' },
  { name: '110037', pincode: '110037', category: 'PINCODE', lat: 28.5562, lng: 77.0999, district: 'IGI Airport' },

  { name: 'Vasant Kunj / Vasant Vihar', pincode: '110070', category: 'AREA', lat: 28.5244, lng: 77.1555, district: 'South Delhi' },
  { name: '110070', pincode: '110070', category: 'PINCODE', lat: 28.5244, lng: 77.1555, district: 'Vasant Kunj' },
  { name: '110057', pincode: '110057', category: 'PINCODE', lat: 28.5601, lng: 77.1598, district: 'Vasant Vihar' },

  { name: 'Hauz Khas / IIT Delhi', pincode: '110016', category: 'AREA', lat: 28.5494, lng: 77.1953, district: 'South Delhi' },
  { name: '110016', pincode: '110016', category: 'PINCODE', lat: 28.5494, lng: 77.1953, district: 'Hauz Khas' },

  { name: 'AIIMS / Safdarjung Hospital / Ansari Nagar', pincode: '110029', category: 'LANDMARK', lat: 28.5672, lng: 77.2100, district: 'South Delhi' },
  { name: '110029', pincode: '110029', category: 'PINCODE', lat: 28.5672, lng: 77.2100, district: 'Ansari Nagar / AIIMS' },

  { name: 'Saket / Select Citywalk / Max Hospital', pincode: '110017', category: 'AREA', lat: 28.5245, lng: 77.2140, district: 'South Delhi' },
  { name: '110017', pincode: '110017', category: 'PINCODE', lat: 28.5245, lng: 77.2140, district: 'Saket' },

  { name: 'Lajpat Nagar / Central Market', pincode: '110024', category: 'AREA', lat: 28.5677, lng: 77.2433, district: 'South Delhi' },
  { name: '110024', pincode: '110024', category: 'PINCODE', lat: 28.5677, lng: 77.2433, district: 'Lajpat Nagar' },

  { name: 'Defence Colony / South Extension', pincode: '110049', category: 'AREA', lat: 28.5724, lng: 77.2291, district: 'South Delhi' },
  { name: '110049', pincode: '110049', category: 'PINCODE', lat: 28.5724, lng: 77.2291, district: 'Defence Colony' },

  { name: 'Nehru Place / Kalkaji / Lotus Temple', pincode: '110019', category: 'AREA', lat: 28.5490, lng: 77.2530, district: 'South Delhi' },
  { name: '110019', pincode: '110019', category: 'PINCODE', lat: 28.5490, lng: 77.2530, district: 'Nehru Place / Kalkaji' },

  { name: 'Greater Kailash (GK 1 & GK 2)', pincode: '110048', category: 'AREA', lat: 28.5366, lng: 77.2410, district: 'South Delhi' },
  { name: '110048', pincode: '110048', category: 'PINCODE', lat: 28.5366, lng: 77.2410, district: 'Greater Kailash' },

  { name: 'Malviya Nagar / Khirki Extension', pincode: '110017', category: 'AREA', lat: 28.5312, lng: 77.2065, district: 'South Delhi' },

  { name: 'Sarita Vihar / Apollo Hospital', pincode: '110076', category: 'AREA', lat: 28.5310, lng: 77.2910, district: 'South East Delhi' },
  { name: '110076', pincode: '110076', category: 'PINCODE', lat: 28.5310, lng: 77.2910, district: 'Sarita Vihar' },

  { name: 'Mayur Vihar (Phase 1, 2, 3)', pincode: '110091', category: 'AREA', lat: 28.6080, lng: 77.2980, district: 'East Delhi' },
  { name: '110091', pincode: '110091', category: 'PINCODE', lat: 28.6080, lng: 77.2980, district: 'Mayur Vihar' },
  { name: '110096', pincode: '110096', category: 'PINCODE', lat: 28.6020, lng: 77.3190, district: 'Mayur Vihar Phase 3' },

  { name: 'Laxmi Nagar / Akshardham', pincode: '110092', category: 'AREA', lat: 28.6310, lng: 77.2770, district: 'East Delhi' },
  { name: '110092', pincode: '110092', category: 'PINCODE', lat: 28.6310, lng: 77.2770, district: 'Laxmi Nagar' },

  { name: 'Shahdara / Dilshad Garden / GTB Hospital', pincode: '110032', category: 'AREA', lat: 28.6730, lng: 77.2880, district: 'Shahdara' },
  { name: '110032', pincode: '110032', category: 'PINCODE', lat: 28.6730, lng: 77.2880, district: 'Shahdara' },
  { name: '110095', pincode: '110095', category: 'PINCODE', lat: 28.6830, lng: 77.3120, district: 'Dilshad Garden' },

  { name: 'Rohini (Sector 1 to 25) / Rajiv Gandhi Cancer Inst.', pincode: '110085', category: 'AREA', lat: 28.7180, lng: 77.1080, district: 'North West Delhi' },
  { name: '110085', pincode: '110085', category: 'PINCODE', lat: 28.7180, lng: 77.1080, district: 'Rohini Sector 7/8' },
  { name: '110086', pincode: '110086', category: 'PINCODE', lat: 28.7320, lng: 77.0850, district: 'Rohini Sector 16/17' },

  { name: 'Pitampura / Netaji Subhash Place (NSP)', pincode: '110034', category: 'AREA', lat: 28.6980, lng: 77.1490, district: 'North West Delhi' },
  { name: '110034', pincode: '110034', category: 'PINCODE', lat: 28.6980, lng: 77.1490, district: 'Pitampura' },

  { name: 'Model Town / Delhi University (North Campus)', pincode: '110009', category: 'AREA', lat: 28.6990, lng: 77.1920, district: 'North Delhi' },
  { name: '110009', pincode: '110009', category: 'PINCODE', lat: 28.6990, lng: 77.1920, district: 'Model Town' },
  { name: '110007', pincode: '110007', category: 'PINCODE', lat: 28.6820, lng: 77.2080, district: 'Delhi University / Civil Lines' },

  { name: 'Civil Lines / Kashmiri Gate ISBT', pincode: '110054', category: 'AREA', lat: 28.6720, lng: 77.2280, district: 'Central Delhi' },
  { name: '110054', pincode: '110054', category: 'PINCODE', lat: 28.6720, lng: 77.2280, district: 'Civil Lines' },

  { name: 'Noida Sector 18 / Atta Market / Sector 62', pincode: '201301', category: 'AREA', lat: 28.5700, lng: 77.3200, district: 'Gautam Buddha Nagar' },
  { name: '201301', pincode: '201301', category: 'PINCODE', lat: 28.5700, lng: 77.3200, district: 'Noida Sector 1-20' },

  { name: 'Gurgaon Cyber City / DLF Phase 2 / Sector 29', pincode: '122002', category: 'AREA', lat: 28.4900, lng: 77.0900, district: 'Gurugram' },
  { name: '122001', pincode: '122001', category: 'PINCODE', lat: 28.4600, lng: 77.0300, district: 'Gurgaon Old City' },
  { name: '122002', pincode: '122002', category: 'PINCODE', lat: 28.4900, lng: 77.0900, district: 'DLF Cyber City' }
];

export function findMatchingAreasAndPincodes(query: string): AreaLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return DELHI_AREAS_AND_PINCODES.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.pincode && item.pincode.includes(q)) ||
      item.district.toLowerCase().includes(q)
  ).slice(0, 8);
}
