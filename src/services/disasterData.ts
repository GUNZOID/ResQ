import type { DisasterScenario } from '../types';

export const DISASTER_SCENARIOS: DisasterScenario[] = [
  {
    id: 'FLASH_FLOOD',
    title: 'Flash Flood & Urban Monsoon',
    problem:
      'Rapid torrents submerged low-lying power substations. Cellular towers offline; water levels rising 30cm/hr in low basins.',
    solutionTactic:
      'Using cached offline Leaflet vector maps to drop high-ground rescue pins and route around flooded underpasses.',
    iconName: 'Droplets',
    hazardPerimeter: {
      lat: 37.768,
      lng: -122.422,
      radiusMeters: 450,
      label: 'Submerged Basin Zone (Level 3 Surge)',
    },
    recommendedSafeZoneId: 'zone-high-ground',
  },
  {
    id: 'CYCLONE_HURRICANE',
    title: 'Severe Cyclone & Category 4 Typhoon',
    problem:
      'High-speed 140km/h gale winds tore down overhead grid transmission lines and fiber poles. Telecom exchanges lost power.',
    solutionTactic:
      'Neighborhood volunteer mesh hops relay SOS coordinates from rooftop to rooftop directly across peer devices.',
    iconName: 'Wind',
    hazardPerimeter: {
      lat: 37.776,
      lng: -122.418,
      radiusMeters: 550,
      label: 'Downed High-Voltage Corridor',
    },
    recommendedSafeZoneId: 'zone-shelter-alpha',
  },
  {
    id: 'EARTHQUAKE',
    title: 'Major 7.2 Magnitude Earthquake',
    problem:
      'Ground tremors sheared underground trunk cables. Cellular towers collapsed; severe congestion on remaining repeaters.',
    solutionTactic:
      'Decentralized ad-hoc topology prevents single-point failure; packets bounce from pocket to pocket until reaching first responders.',
    iconName: 'Activity',
    hazardPerimeter: {
      lat: 37.772,
      lng: -122.426,
      radiusMeters: 500,
      label: 'Structural Collapse & Debris Gridlock',
    },
    recommendedSafeZoneId: 'zone-hospital-central',
  },
  {
    id: 'WILDFIRE',
    title: 'Wildfire & Fast Fire Front',
    problem:
      'Utility providers executed emergency Public Safety Power Shutoffs (PSPS). Dense smoke plume blocks satellite GPS lock.',
    solutionTactic:
      'Evacuating family convoys share compressed breadcrumb vectors to navigate away from advancing fire perimeters.',
    iconName: 'Flame',
    hazardPerimeter: {
      lat: 37.788,
      lng: -122.405,
      radiusMeters: 600,
      label: 'Active Wildfire Smoke & Fireline',
    },
    recommendedSafeZoneId: 'zone-home-safehouse',
  },
  {
    id: 'WINTER_BLIZZARD',
    title: 'Severe Ice Storm & Blizzard',
    problem:
      'Freezing rain built 40mm ice loads on cables, isolating residential blocks in sub-zero cold without heat or cellular service.',
    solutionTactic:
      'Low-bandwidth micro-packets conserve precious phone battery while broadcasting health status to nearby emergency circles.',
    iconName: 'Snowflake',
    hazardPerimeter: {
      lat: 37.781,
      lng: -122.415,
      radiusMeters: 400,
      label: 'Freezing Drift & Ice Jam Zone',
    },
    recommendedSafeZoneId: 'zone-shelter-alpha',
  },
];
