/**
 * CITYMIND Procedural City Names, District Titles, Street Names, and Landmark Catalog
 * Comprehensive database for procedural world generation, street signage, and district naming.
 */

export const CITY_NAME_PREFIXES = [
  'New', 'Port', 'Fort', 'Saint', 'Mount', 'Lake', 'Grand', 'West', 'East', 'North', 'South',
  'Upper', 'Lower', 'High', 'Glen', 'Oak', 'Pine', 'Cedar', 'Maple', 'Silver', 'Golden',
  'Crystal', 'Iron', 'Copper', 'Emerald', 'Ruby', 'Diamond', 'Sun', 'Star', 'Moon', 'Sky',
  'River', 'Ocean', 'Bay', 'Harbor', 'Bridge', 'Valley', 'Ridge', 'Crest', 'Peak', 'Haven',
];

export const CITY_NAME_SUFFIXES = [
  'polis', 'ton', 'ville', 'burg', 'field', 'dale', 'haven', 'port', 'beach', 'creek',
  'view', 'wood', 'side', 'ford', 'land', 'shire', 'hollow', 'park', 'heights', 'crest',
  'plaza', 'center', 'harbor', 'bay', 'falls', 'springs', 'ridge', 'mont', 'gardens',
];

export const DISTRICT_NAME_THEMES = {
  tech: [
    'Silicon Harbor', 'Innovation Corridor', 'Quantum Valley', 'Tech Hub Alpha', 'Cyber Heights',
    'Data Bay', 'Biotech Park', 'Futureworks District', 'Algorithm Ridge', 'Nanotech Basin',
  ],
  historic: [
    'Old Town Heritage', 'Colonial Square', 'Founder\'s Quarter', 'Cathedral Hill', 'Merchant Row',
    'King\'s Crossing', 'Cobblestone Market', 'Victoria Square', 'Guildhall District', 'Heritage Park',
  ],
  commercial: [
    'Financial District', 'Downtown Core', 'Metropolis Center', 'Commerce Square', 'Trade Basin',
    'Exchange Row', 'Corporate Plaza', 'Marketplace Square', 'Central Avenue', 'Harbor Commerce',
  ],
  industrial: [
    'Heavy Works Sector', 'Iron Forge Basin', 'Cargo Terminal East', 'Factory District', 'Smelter Row',
    'Rail Freight Hub', 'Warehouse Central', 'Dockside Industrial', 'Power Grid North', 'Refinery Basin',
  ],
  residential: [
    'Pine Crest Meadows', 'Sunset Hills', 'Oak Ridge Estates', 'Maplewood Gardens', 'Cedar Valley',
    'Greenbelt Park', 'Lakeside Heights', 'Willow Grove', 'Riverbend Terrace', 'Highland Park',
  ],
};

export const STREET_NAME_CATALOG = [
  'First Avenue', 'Second Avenue', 'Third Avenue', 'Fourth Avenue', 'Fifth Avenue',
  'Main Street', 'Market Street', 'Broadway', 'Park Avenue', 'Lexington Avenue',
  'Washington Street', 'Lincoln Boulevard', 'Jefferson Way', 'Franklin Street', 'Adams Avenue',
  'Oak Street', 'Pine Street', 'Maple Drive', 'Cedar Lane', 'Elm Street', 'Willow Way',
  'Harbor Boulevard', 'Ocean Parkway', 'Bayfront Drive', 'River Road', 'Valley Way',
  'Industrial Parkway', 'Commerce Way', 'Tech Center Drive', 'Innovation Parkway',
  'Grand Avenue', 'Highland Boulevard', 'Sunset Drive', 'Sunrise Way', 'Hillside Drive',
];

export function generateProceduralCityName() {
  const prefix = CITY_NAME_PREFIXES[Math.floor(Math.random() * CITY_NAME_PREFIXES.length)];
  const suffix = CITY_NAME_SUFFIXES[Math.floor(Math.random() * CITY_NAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

export function generateDistrictName(theme = 'residential') {
  const list = DISTRICT_NAME_THEMES[theme] || DISTRICT_NAME_THEMES.residential;
  return list[Math.floor(Math.random() * list.length)];
}

export default {
  CITY_NAME_PREFIXES,
  CITY_NAME_SUFFIXES,
  DISTRICT_NAME_THEMES,
  STREET_NAME_CATALOG,
  generateProceduralCityName,
  generateDistrictName,
};
