import type { StyleSpecification } from 'maplibre-gl';

/**
 * Self-contained, fully offline vector tile style for MapLibre GL JS.
 * Designed to render PMTiles generated from Planetiler without any external network requests.
 */
export function getOfflineMapStyle(pmtilesAbsoluteUrl: string): StyleSpecification {
  return {
    version: 8,
    name: 'ResQ-Mesh Dark Tactical',
    metadata: {
      'resq:offline': true,
      'resq:generator': 'Planetiler PMTiles',
    },
    sources: {
      openmaptiles: {
        type: 'vector',
        url: `pmtiles://${pmtilesAbsoluteUrl}`,
        tiles: [`pmtiles://${pmtilesAbsoluteUrl}/{z}/{x}/{y}`],
        minzoom: 0,
        maxzoom: 14,
        bounds: [76.84, 28.4, 77.35, 28.88],
      },
    },
    layers: [
      // 1. Base Background Canvas
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#0B0D14',
        },
      },
      // 2. Base Landcover (Natural terrain, vegetation, scrub)
      {
        id: 'landcover',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        paint: {
          'fill-color': '#0F141E',
          'fill-opacity': 0.9,
        },
      },
      // 3. Parks & Greenery (Forests, Gardens, Open Safe Areas)
      {
        id: 'landuse_park',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'park',
        paint: {
          'fill-color': '#064E3B',
          'fill-opacity': 0.85,
        },
      },
      // 4. Urban Landuse (Residential, Commercial, Industrial zones)
      {
        id: 'landuse_urban',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landuse',
        paint: {
          'fill-color': '#131926',
          'fill-opacity': 0.75,
        },
      },
      // 5. Water bodies (Yamuna River, Lakes, Ponds, Reservoirs)
      {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: {
          'fill-color': '#1E3A8A',
          'fill-opacity': 0.95,
        },
      },
      // 6. Waterways (Canals, Streams, Drains)
      {
        id: 'waterway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'waterway',
        paint: {
          'line-color': '#3B82F6',
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.2, 14, 3.5],
        },
      },
      // 7. Buildings Footprints
      {
        id: 'building',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 11,
        paint: {
          'fill-color': '#1E2536',
          'fill-outline-color': '#334155',
          'fill-opacity': 0.9,
        },
      },
      // 8. Minor & Residential Roads (Local neighborhood streets)
      {
        id: 'road_minor',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['all', ['!in', 'class', 'motorway', 'trunk', 'primary', 'secondary', 'rail']],
        paint: {
          'line-color': '#374151',
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.8, 12, 1.6, 14, 3.2],
        },
      },
      // 9. Secondary & Tertiary Roads (Major neighborhood links)
      {
        id: 'road_secondary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', 'class', 'secondary', 'tertiary'],
        paint: {
          'line-color': '#64748B',
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.4, 11, 2.8, 14, 5],
        },
      },
      // 10. Major Arterials & Highways (Ring Road, Mathura Rd, etc.)
      {
        id: 'road_major',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', 'class', 'primary', 'trunk'],
        paint: {
          'line-color': '#38BDF8',
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.8, 10, 3.5, 14, 6.5],
        },
      },
      // 11. Motorways & Expressways (Delhi-Noida Direct, Expressways)
      {
        id: 'road_motorway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'motorway'],
        paint: {
          'line-color': '#F97316',
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 2.2, 10, 4.5, 14, 7.5],
        },
      },
      // 12. Railways & Metro lines
      {
        id: 'rail',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', 'class', 'rail'],
        paint: {
          'line-color': '#9CA3AF',
          'line-width': 1.4,
          'line-dasharray': [2, 2],
        },
      },
      // 13. Administrative & District Boundaries
      {
        id: 'boundary_district',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'boundary',
        paint: {
          'line-color': '#818CF8',
          'line-width': 1.8,
          'line-dasharray': [3, 2],
          'line-opacity': 0.85,
        },
      },
    ],
  };
}
