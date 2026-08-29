import React, { useState, useMemo } from 'react';

/**
 * SCENARIO DATA DEFINITIONS (15 Detailed Production-Quality Scenarios)
 */
export const SCENARIOS_DATABASE = [
  {
    id: 'scen_01',
    title: 'Metropolis Rising',
    category: 'Growth',
    difficulty: 1,
    badge: 'Beginner',
    summary: 'Transform a peaceful coastal farming village into a thriving regional metropolis of 50,000 citizens.',
    description: 'The regional government has designated Riverdale Valley as a strategic growth zone. As newly elected Mayor, your task is to lay down basic grid infrastructure, establish high-density residential zones, attract commercial investments, and grow the population while keeping citizen satisfaction above 80%.',
    startingConditions: {
      population: 1250,
      treasury: 500000,
      areaSqKm: 64,
      terrain: 'Coastal Valley',
      infrastructureRating: 'Basic',
      disasterThreat: 'Low'
    },
    primaryObjectives: [
      { id: 'obj_01_1', title: 'Reach Population 25,000', target: 25000, current: 1250, unit: 'citizens', required: true },
      { id: 'obj_01_2', title: 'Achieve Treasury Balance', target: 2000000, current: 500000, unit: '$', required: true },
      { id: 'obj_01_3', title: 'Maintain Approval Rating Above 80%', target: 80, current: 72, unit: '%', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_01_s1', title: 'Build International Airport', target: 1, current: 0, unit: 'facility' },
      { id: 'obj_01_s2', title: 'Keep Unemployment Below 4%', target: 4, current: 6.8, unit: '%' }
    ],
    bonusChallenges: [
      { id: 'bon_01_1', title: 'Zero Pollution Complaints for 5 Years', reward: '$250,000 Bonus', multiplier: '1.25x Score' },
      { id: 'bon_01_2', title: 'Complete without Taking Any Bank Loans', reward: 'Gold Pioneer Medal', multiplier: '1.5x Score' }
    ],
    specialRules: ['+15% Migration Rate', 'Standard Tax Limits', 'Disasters Off'],
    highScores: [
      { rank: 1, mayor: 'Alex_Vanderbilt', score: 184500, timeMonths: 42, medal: 'Platinum', date: '2026-08-15' },
      { rank: 2, mayor: 'Elena_Rostova', score: 162000, timeMonths: 48, medal: 'Gold', date: '2026-08-12' },
      { rank: 3, mayor: 'TechTycoon99', score: 145200, timeMonths: 54, medal: 'Gold', date: '2026-08-01' },
      { rank: 4, mayor: 'UrbanistPro', score: 128900, timeMonths: 60, medal: 'Silver', date: '2026-07-28' },
      { rank: 5, mayor: 'CivicMaster', score: 110400, timeMonths: 66, medal: 'Bronze', date: '2026-07-20' }
    ],
    unlocked: true,
    completed: true,
    userBestScore: 162000,
    userBestMedal: 'Gold'
  },
  {
    id: 'scen_02',
    title: 'Blackout Crisis',
    category: 'Energy',
    difficulty: 2,
    badge: 'Intermediate',
    summary: 'A catastrophic grid failure has plunged Ironwood Bay into total darkness. Restore power and modernize the grid.',
    description: 'Aging coal plants have collapsed under peak heatwave demand, leaving 120,000 citizens without power or clean water. Violent riots are threatening city hall. You must quickly deploy emergency generators, transition to clean microgrids, and stabilize the electrical supply before public panic causes economic ruin.',
    startingConditions: {
      population: 118000,
      treasury: 350000,
      areaSqKm: 100,
      terrain: 'Industrial Bay',
      infrastructureRating: 'Critical Failure',
      disasterThreat: 'High (Heatwave)'
    },
    primaryObjectives: [
      { id: 'obj_02_1', title: 'Restore 100% Power Grid Coverage', target: 100, current: 18, unit: '%', required: true },
      { id: 'obj_02_2', title: 'Reduce Grid Outages to Zero', target: 0, current: 48, unit: 'blackouts/mo', required: true },
      { id: 'obj_02_3', title: 'Quell Civil Restlessness Below 10%', target: 10, current: 84, unit: '% unrest', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_02_s1', title: 'Construct 4 Solar Thermal Parks', target: 4, current: 0, unit: 'parks' },
      { id: 'obj_02_s2', title: 'Export 50 MW Surplus Power to Neighbor Region', target: 50, current: 0, unit: 'MW' }
    ],
    bonusChallenges: [
      { id: 'bon_02_1', title: 'Decommission All Coal Plants within 12 Months', reward: 'Green Power Award', multiplier: '1.3x Score' },
      { id: 'bon_02_2', title: 'Prevent Any Building Fires During Outage', reward: 'Safety Shield', multiplier: '1.4x Score' }
    ],
    specialRules: ['Double Power Plant Cost', 'High Heatwave Fire Risk', 'Urgency Timer: 24 Months'],
    highScores: [
      { rank: 1, mayor: 'VoltMaster', score: 210900, timeMonths: 14, medal: 'Platinum', date: '2026-08-20' },
      { rank: 2, mayor: 'GridArchitect', score: 188400, timeMonths: 18, medal: 'Gold', date: '2026-08-11' },
      { rank: 3, mayor: 'SolarSam', score: 154000, timeMonths: 22, medal: 'Silver', date: '2026-07-30' }
    ],
    unlocked: true,
    completed: true,
    userBestScore: 188400,
    userBestMedal: 'Gold'
  },
  {
    id: 'scen_03',
    title: 'Toxic Legacy',
    category: 'Eco',
    difficulty: 3,
    badge: 'Hard',
    summary: 'Decontaminate a heavily polluted rust-belt city and engineer a green eco-paradise.',
    description: 'Decades of unchecked chemical dumping have turned Oldport Basin into a toxic wasteland with toxic groundwater, thick smog, and soaring healthcare costs. Remediate brownfield sites, construct bio-filtration wetlands, replace heavy industry with green high-tech, and raise life expectancy.',
    startingConditions: {
      population: 45000,
      treasury: 750000,
      areaSqKm: 81,
      terrain: 'River Basin (Contaminated)',
      infrastructureRating: 'Decaying',
      disasterThreat: 'Toxic Spills'
    },
    primaryObjectives: [
      { id: 'obj_03_1', title: 'Reduce Average Soil Pollution Below 15 ppm', target: 15, current: 87, unit: 'ppm', required: true },
      { id: 'obj_03_2', title: 'Achieve 90%+ Clean Water Index', target: 90, current: 32, unit: '%', required: true },
      { id: 'obj_03_3', title: 'Increase Citizen Life Expectancy to 82 Years', target: 82, current: 61, unit: 'years', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_03_s1', title: 'Build 10 Eco-Park Bio-Filters', target: 10, current: 1, unit: 'parks' },
      { id: 'obj_03_s2', title: 'Convert 100% Heavy Industry to Green Tech', target: 100, current: 12, unit: '%' }
    ],
    bonusChallenges: [
      { id: 'bon_03_1', title: 'Zero Health Center Overflows for 36 Months', reward: 'Caduceus Medal', multiplier: '1.35x Score' }
    ],
    specialRules: ['High Health Care Expenses', 'Bio-Remediation Tech Unlocked', 'Demolition Costs +50%'],
    highScores: [
      { rank: 1, mayor: 'BioGuardian', score: 245000, timeMonths: 36, medal: 'Platinum', date: '2026-08-22' },
      { rank: 2, mayor: 'EcoQueen', score: 212000, timeMonths: 42, medal: 'Gold', date: '2026-08-04' }
    ],
    unlocked: true,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_04',
    title: 'High-Tech Haven',
    category: 'Tech',
    difficulty: 4,
    badge: 'Expert',
    summary: 'Build a cutting-edge Silicon Valley rival driven by AI research, robotics labs, and quantum computing.',
    description: 'Transform an academic town into the world premier innovation hub. Attract global tech conglomerates, fund top-tier university research centers, establish automated public transit networks, and export microchips to the global market.',
    startingConditions: {
      population: 30000,
      treasury: 1200000,
      areaSqKm: 49,
      terrain: 'Hilly Plateau',
      infrastructureRating: 'Advanced',
      disasterThreat: 'Cyberattacks'
    },
    primaryObjectives: [
      { id: 'obj_04_1', title: 'Attract 15 Commercial High-Tech Headquarters', target: 15, current: 2, unit: 'HQs', required: true },
      { id: 'obj_04_2', title: 'Achieve 95% Higher Education Graduate Rate', target: 95, current: 48, unit: '%', required: true },
      { id: 'obj_04_3', title: 'Generate $5M Monthly High-Tech Export Revenue', target: 5000000, current: 420000, unit: '$/mo', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_04_s1', title: 'Deploy Autonomous Hyperloop Grid', target: 1, current: 0, unit: 'grid' },
      { id: 'obj_04_s2', title: 'Build Quantum Computing Center', target: 1, current: 0, unit: 'center' }
    ],
    bonusChallenges: [
      { id: 'bon_04_1', title: 'Reach 100% Smart Grid Coverage', reward: 'Cyber City Trophy', multiplier: '1.4x Score' }
    ],
    specialRules: ['High Skilled Worker Demands', 'Special Tech Grants', 'R&D Tax Incentives'],
    highScores: [
      { rank: 1, mayor: 'QuantumMind', score: 320000, timeMonths: 30, medal: 'Platinum', date: '2026-08-25' }
    ],
    unlocked: true,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_05',
    title: 'Coastal Surge',
    category: 'Disaster',
    difficulty: 3,
    badge: 'Hard',
    summary: 'Defend a low-lying island municipality from recurring sea level rises and hurricane storm surges.',
    description: 'Category 5 hurricanes threaten Tidal Creek every autumn. Construct seawalls, storm surge barriers, drainage pumps, and elevated transit corridors. Evacuate flooded districts during peak storms and rebuild stronger.',
    startingConditions: {
      population: 62000,
      treasury: 900000,
      areaSqKm: 72,
      terrain: 'Low-lying Estuary',
      infrastructureRating: 'Vulnerable',
      disasterThreat: 'Category 5 Storms'
    },
    primaryObjectives: [
      { id: 'obj_05_1', title: 'Construct Continuous Sea Wall Protection', target: 100, current: 35, unit: '% coast', required: true },
      { id: 'obj_05_2', title: 'Survive 3 Major Hurricanes with Zero Casualties', target: 3, current: 0, unit: 'storms', required: true },
      { id: 'obj_05_3', title: 'Maintain Positive Cash Flow During Disasters', target: 1, current: 0, unit: 'status', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_05_s1', title: 'Build Automated Flood Pumping Network', target: 6, current: 1, unit: 'pumps' }
    ],
    bonusChallenges: [
      { id: 'bon_05_1', title: 'Zero Building Destruction during Hurricane 3', reward: 'Titanium Shield', multiplier: '1.5x Score' }
    ],
    specialRules: ['Seasonal Storm Timers', 'Flooding Damage Dynamic', 'Coastal Barrier Unlocked'],
    highScores: [],
    unlocked: true,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_06',
    title: 'Megacity Traffic Gridlock',
    category: 'Transport',
    difficulty: 4,
    badge: 'Expert',
    summary: 'Untangle catastrophic 98% traffic gridlock in a sprawling 300,000 citizen urban jungle.',
    description: 'Commuters are stranded for 4 hours daily in bumper-to-bumper traffic. Commuter satisfaction is at an all-time low. Re-engineer highway interchanges, construct multi-line subway networks, introduce congestion pricing, and expand bus rapid transit.',
    startingConditions: {
      population: 295000,
      treasury: 1500000,
      areaSqKm: 144,
      terrain: 'Dense Urban Sprawl',
      infrastructureRating: 'Gridlocked',
      disasterThreat: 'None'
    },
    primaryObjectives: [
      { id: 'obj_06_1', title: 'Reduce Traffic Congestion Below 35%', target: 35, current: 98, unit: '%', required: true },
      { id: 'obj_06_2', title: 'Achieve 150,000 Daily Transit Ridership', target: 150000, current: 12000, unit: 'riders/day', required: true },
      { id: 'obj_06_3', title: 'Raise Commute Satisfaction to 85%', target: 85, current: 19, unit: '%', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_06_s1', title: 'Build Central Union Railway Station', target: 1, current: 0, unit: 'station' },
      { id: 'obj_06_s2', title: 'Implement City-wide Congestion Pricing', target: 1, current: 0, unit: 'policy' }
    ],
    bonusChallenges: [
      { id: 'bon_06_1', title: 'Eliminate All Heavy Truck Congestion in Downtown', reward: 'Transit Wizard Medal', multiplier: '1.35x Score' }
    ],
    specialRules: ['Subway Tunnels 20% Cheaper', 'Road Demolition Causes Temporary Panic', 'High Transit Fares Allowed'],
    highScores: [],
    unlocked: false,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_07',
    title: 'Green Utopia',
    category: 'Eco',
    difficulty: 2,
    badge: 'Intermediate',
    summary: 'Design a 100% net-zero carbon eco-city with zero fossil fuels and total recycling integration.',
    description: 'Build a model sustainable community powered by wind, solar, and geothermal energy. Implement vertical farming, zero-waste recycling plants, extensive bike highway corridors, and car-free pedestrian zones.',
    startingConditions: {
      population: 18000,
      treasury: 600000,
      areaSqKm: 36,
      terrain: 'Alpine Valley',
      infrastructureRating: 'Eco-Draft',
      disasterThreat: 'Low'
    },
    primaryObjectives: [
      { id: 'obj_07_1', title: 'Achieve 0% Carbon Footprint Index', target: 0, current: 64, unit: '% carbon', required: true },
      { id: 'obj_07_2', title: 'Process 100% Recycling Waste Stream', target: 100, current: 28, unit: '% waste', required: true },
      { id: 'obj_07_3', title: 'Reach Population of 40,000 Net-Zero Citizens', target: 40000, current: 18000, unit: 'citizens', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_07_s1', title: 'Build 5 Geothermal Power Plants', target: 5, current: 1, unit: 'plants' }
    ],
    bonusChallenges: [
      { id: 'bon_07_1', title: 'Zero Gasoline Vehicles Allowed in City Limits', reward: 'Earth Saver Emblem', multiplier: '1.4x Score' }
    ],
    specialRules: ['Fossil Fuels Banned', 'Park Upkeep -30%', 'Green Subsidies Active'],
    highScores: [],
    unlocked: true,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_08',
    title: 'Financial Bankruptcy',
    category: 'Economy',
    difficulty: 5,
    badge: 'Extreme',
    summary: 'Rescue a city saddled with $20M in debt, high bond interest, and collapsing public services.',
    description: 'Previous corruption has left Metro City $20,000,000 in municipal debt with interest rates soaring at 14%. Emergency austerity, selective tax reform, privatized efficiency, and industrial economic rebirth are required to prevent federal takeover.',
    startingConditions: {
      population: 85000,
      treasury: -20000000,
      areaSqKm: 100,
      terrain: 'Urban Industrial',
      infrastructureRating: 'Bankrupt / Neglected',
      disasterThreat: 'Economic Collapse'
    },
    primaryObjectives: [
      { id: 'obj_08_1', title: 'Pay Off All Municipal Debt ($0 Balance)', target: 0, current: -20000000, unit: '$ debt', required: true },
      { id: 'obj_08_2', title: 'Achieve Positive Monthly Budget Surplus ($500k/mo)', target: 500000, current: -350000, unit: '$/mo', required: true },
      { id: 'obj_08_3', title: 'Prevent Approval Rating Falling Below 30%', target: 30, current: 34, unit: '% approval', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_08_s1', title: 'Refinance High-Interest Bonds', target: 3, current: 0, unit: 'bonds' }
    ],
    bonusChallenges: [
      { id: 'bon_08_1', title: 'Accumulate $5,000,000 Reserve Treasury', reward: 'Financial Titan Trophy', multiplier: '1.6x Score' }
    ],
    specialRules: ['Bond Interest 14%', 'Strict Tax Rate Ceiling 20%', 'High Inflation'],
    highScores: [],
    unlocked: false,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_09',
    title: 'Volcanic Awakening',
    category: 'Disaster',
    difficulty: 3,
    badge: 'Hard',
    summary: 'Manage an active volcanic alert in Mount Obsidian Valley while constructing evacuation routes and lava diversions.',
    description: 'Seismologists warn Mount Obsidian will erupt within 36 months. Build lava trench channels, emergency shelters, seismic monitoring stations, and evacuate high-risk slope districts before pyroclastic flows destroy the township.',
    startingConditions: {
      population: 38000,
      treasury: 800000,
      areaSqKm: 64,
      terrain: 'Volcanic Slopes',
      infrastructureRating: 'Moderate',
      disasterThreat: 'Eruption Imminent'
    },
    primaryObjectives: [
      { id: 'obj_09_1', title: 'Construct Lava Canal Diversion Network', target: 100, current: 20, unit: '% coverage', required: true },
      { id: 'obj_09_2', title: 'Evacuate 15,000 Red Zone Residents', target: 15000, current: 0, unit: 'citizens', required: true },
      { id: 'obj_09_3', title: 'Maintain City Survival Post-Eruption', target: 1, current: 0, unit: 'status', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_09_s1', title: 'Build 4 Deep Seismic Warning Stations', target: 4, current: 1, unit: 'stations' }
    ],
    bonusChallenges: [
      { id: 'bon_09_1', title: 'Zero Fatalities During Eruption Phase', reward: 'Vulcan Medal', multiplier: '1.5x Score' }
    ],
    specialRules: ['Seismic Tremor Frequency', 'Lava Flow Simulation Active', 'Evacuation Drills Enabled'],
    highScores: [],
    unlocked: true,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_10',
    title: 'Rust Belt Renaissance',
    category: 'Economy',
    difficulty: 2,
    badge: 'Intermediate',
    summary: 'Revitalize a abandoned manufacturing city by converting old auto factories into tech incubators and cultural hubs.',
    description: 'Steel Mill City lost 40% of its workforce after plant closures. Repurpose abandoned factory complexes into loft apartments, micro-breweries, robotics incubators, and green riverfront parks to reignite regional prosperity.',
    startingConditions: {
      population: 52000,
      treasury: 650000,
      areaSqKm: 81,
      terrain: 'Industrial Riverfront',
      infrastructureRating: 'Aging Steel Infrastructure',
      disasterThreat: 'Low'
    },
    primaryObjectives: [
      { id: 'obj_10_1', title: 'Repurpose 20 Abandoned Industrial Sites', target: 20, current: 2, unit: 'factories', required: true },
      { id: 'obj_10_2', title: 'Attract 15,000 New Creative & Tech Workers', target: 15000, current: 1400, unit: 'workers', required: true },
      { id: 'obj_10_3', title: 'Raise Land Value Index to $450/sqm', target: 450, current: 180, unit: '$/sqm', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_10_s1', title: 'Build Riverfront Promenade Arts District', target: 1, current: 0, unit: 'district' }
    ],
    bonusChallenges: [
      { id: 'bon_08_2', title: 'Achieve Top 10 Cultural Rating in Region', reward: 'Renaissance Cup', multiplier: '1.3x Score' }
    ],
    specialRules: ['Factory Repurposing Subsidy', 'Low Initial Commercial Demand'],
    highScores: [],
    unlocked: true,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_11',
    title: 'Island Archipelago',
    category: 'Transport',
    difficulty: 4,
    badge: 'Expert',
    summary: 'Connect 6 isolated tropical islands with bridges, ferry lanes, cargo docks, and underwater tunnels.',
    description: 'Paradise Isles consists of six rugged volcanic islands separated by deep sea channels. Build a cohesive multi-modal transport network using deepwater suspension bridges, ferry lines, underground hydro-tunnels, and inter-island power cables.',
    startingConditions: {
      population: 28000,
      treasury: 1100000,
      areaSqKm: 121,
      terrain: 'Multi-Island Archipelago',
      infrastructureRating: 'Isolated Islands',
      disasterThreat: 'Tropical Cyclones'
    },
    primaryObjectives: [
      { id: 'obj_11_1', title: 'Connect All 6 Islands to Central Transit Network', target: 6, current: 2, unit: 'islands', required: true },
      { id: 'obj_11_2', title: 'Establish 4 Inter-Island Freight Cargo Docks', target: 4, current: 1, unit: 'docks', required: true },
      { id: 'obj_11_3', title: 'Reach Population of 75,000 Across Archipelago', target: 75000, current: 28000, unit: 'citizens', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_11_s1', title: 'Construct Underwater Hydro-Tunnel Hub', target: 1, current: 0, unit: 'tunnel' }
    ],
    bonusChallenges: [
      { id: 'bon_11_1', title: 'Achieve 100% Inter-Island Utility Grid Integration', reward: 'Mariner Guild Emblem', multiplier: '1.4x Score' }
    ],
    specialRules: ['High Water Bridge Construction Costs', 'Ferry Transit Unlocked', 'Maritime Trade Bonus'],
    highScores: [],
    unlocked: false,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_12',
    title: 'Cybernetic Metropolis',
    category: 'Tech',
    difficulty: 5,
    badge: 'Extreme',
    summary: 'Deploy autonomous drone logistics, AI city management systems, and smart energy grids in a futuristic megacity.',
    description: 'Neo-Tokyo 2099 demands full automation. Integrate City Mind AI controllers into traffic signals, waste management drones, automated emergency dispatchers, and vertical skyscraper hydro-farms.',
    startingConditions: {
      population: 180000,
      treasury: 2500000,
      areaSqKm: 100,
      terrain: 'Cyberpunk Skyscraper District',
      infrastructureRating: 'High-Tech Grid',
      disasterThreat: 'AI System Malfunction / Cyber Wars'
    },
    primaryObjectives: [
      { id: 'obj_12_1', title: 'Automate 90% of City Services with AI Drones', target: 90, current: 25, unit: '% automation', required: true },
      { id: 'obj_12_2', title: 'Build 10 Vertical Hydroponic Farming Towers', target: 10, current: 2, unit: 'towers', required: true },
      { id: 'obj_12_3', title: 'Achieve 0 Traffic Accidents via Autonomous Vehicles', target: 0, current: 142, unit: 'accidents/yr', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_12_s1', title: 'Construct Quantum Core Server Facility', target: 1, current: 0, unit: 'core' }
    ],
    bonusChallenges: [
      { id: 'bon_12_1', title: 'Prevent Any Cyber Hacking Breaches for 5 Years', reward: 'Singularity Key', multiplier: '1.6x Score' }
    ],
    specialRules: ['AI Automation Module Active', 'High Electricity Consumption', 'Drone Maintenance Costs'],
    highScores: [],
    unlocked: false,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_13',
    title: 'Mega-Hub Airport Metro',
    category: 'Growth',
    difficulty: 2,
    badge: 'Intermediate',
    summary: 'Construct a world-class aerotropolis with 4 runway terminals, logistics parks, luxury hotel districts, and high-speed rail.',
    description: 'Skyport Valley is slated to become the continent busiest aviation hub. Balance noisy airport corridors with luxury tourist resorts, duty-free shopping districts, freight logistics centers, and high-speed maglev lines.',
    startingConditions: {
      population: 40000,
      treasury: 1000000,
      areaSqKm: 81,
      terrain: 'Flat Valley Corridor',
      infrastructureRating: 'Aviation Focus',
      disasterThreat: 'Low'
    },
    primaryObjectives: [
      { id: 'obj_13_1', title: 'Build International Aerotropolis Terminal (4 Runways)', target: 4, current: 1, unit: 'runways', required: true },
      { id: 'obj_13_2', title: 'Serve 500,000 Annual Airline Passengers', target: 500000, current: 65000, unit: 'passengers', required: true },
      { id: 'obj_13_3', title: 'Generate $3M Monthly Duty-Free & Hotel Tax Revenue', target: 3000000, current: 280000, unit: '$/mo', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_13_s1', title: 'Connect Maglev Rail from Terminal to Downtown', target: 1, current: 0, unit: 'line' }
    ],
    bonusChallenges: [
      { id: 'bon_13_1', title: 'Maintain 90%+ Passenger Satisfaction Index', reward: 'Golden Wings Medal', multiplier: '1.35x Score' }
    ],
    specialRules: ['Aviation Zone Noise Rules', 'Hotel Commercial Tax Multiplier +25%'],
    highScores: [],
    unlocked: true,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_14',
    title: 'Solarpunk Oasis',
    category: 'Eco',
    difficulty: 1,
    badge: 'Beginner',
    summary: 'Build a harmonious desert eco-oasis using solar microgrids, atmospheric moisture harvesters, and permaculture forests.',
    description: 'Transform arid Sun Valley into a thriving green oasis. Utilize solar glass architecture, atmospheric water generators, shade canopy streets, and sustainable permaculture farms to create a prosperous desert haven.',
    startingConditions: {
      population: 8500,
      treasury: 450000,
      areaSqKm: 49,
      terrain: 'Desert Dunes',
      infrastructureRating: 'Solar Microgrid',
      disasterThreat: 'Sandstorms'
    },
    primaryObjectives: [
      { id: 'obj_14_1', title: 'Achieve 100% Solar & Thermal Energy Supply', target: 100, current: 40, unit: '% clean', required: true },
      { id: 'obj_14_2', title: 'Plant 1,000 Permaculture Oasis Trees', target: 1000, current: 120, unit: 'trees', required: true },
      { id: 'obj_14_3', title: 'Reach Population 20,000 Desert Settlers', target: 20000, current: 8500, unit: 'citizens', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_14_s1', title: 'Construct Atmospheric Condenser Water Tower', target: 3, current: 1, unit: 'towers' }
    ],
    bonusChallenges: [
      { id: 'bon_14_1', title: 'Export 200 m3 Clean Water to Neighboring Outposts', reward: 'Sun Crystal Award', multiplier: '1.25x Score' }
    ],
    specialRules: ['High Solar Energy Yield', 'Water Scarcity Dynamic', 'Bio-Dome Tech Unlocked'],
    highScores: [],
    unlocked: true,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  },
  {
    id: 'scen_15',
    title: 'Epidemic Containment Zone',
    category: 'Disaster',
    difficulty: 4,
    badge: 'Expert',
    summary: 'Contain a virulent viral outbreak in Metro City using medical quarantine zones, field hospitals, and contact tracing.',
    description: 'A novel pathogen has erupted across Metro City. Establish quarantine checkpoints, deploy mobile testing units, construct specialized infectious disease wings, fund vaccine research, and protect citizen life while maintaining vital food supply chains.',
    startingConditions: {
      population: 95000,
      treasury: 1000000,
      areaSqKm: 81,
      terrain: 'Metropolitan Grid',
      infrastructureRating: 'Medical Crisis',
      disasterThreat: 'Viral Epidemic'
    },
    primaryObjectives: [
      { id: 'obj_15_1', title: 'Contain Infection Rate Below 2%', target: 2, current: 38, unit: '% infected', required: true },
      { id: 'obj_15_2', title: 'Construct 8 Advanced Quarantine Hospitals', target: 8, current: 2, unit: 'hospitals', required: true },
      { id: 'obj_15_3', title: 'Achieve 100% Vaccine Distribution', target: 100, current: 0, unit: '% vaccinated', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_15_s1', title: 'Fund Bio-Research Lab Expansion', target: 1, current: 0, unit: 'lab' }
    ],
    bonusChallenges: [
      { id: 'bon_15_1', title: 'Zero Business Closures during Quarantine Phase', reward: 'Caduceus Cross of Valor', multiplier: '1.5x Score' }
    ],
    specialRules: ['Epidemic Spread Simulation', 'Hospital Surge Capacity Unlocked', 'Quarantine Zones Enabled'],
    highScores: [],
    unlocked: false,
    completed: false,
    userBestScore: 0,
    userBestMedal: null
  }
];

/**
 * HELPER: Render Difficulty Stars
 */
const StarRating = ({ rating, max = 5 }) => {
  return (
    <div style={{ display: 'inline-flex', gap: '2px', color: '#fbbc04', fontSize: '1rem' }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ opacity: i < rating ? 1 : 0.25 }}>★</span>
      ))}
    </div>
  );
};

/**
 * HELPER: Medal Badge Pill
 */
const MedalBadge = ({ medal }) => {
  if (!medal) return null;
  const colors = {
    Platinum: { bg: '#e5e4e2', text: '#111', border: '#b4b4b4' },
    Gold: { bg: '#ffe57f', text: '#5d4037', border: '#ffc107' },
    Silver: { bg: '#cfd8dc', text: '#263238', border: '#90a4ae' },
    Bronze: { bg: '#d7ccc8', text: '#3e2723', border: '#a1887f' }
  };
  const style = colors[medal] || colors.Bronze;
  return (
    <span style={{
      background: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      🏆 {medal}
    </span>
  );
};

/**
 * MINI MAP PREVIEW SVG COMPONENT
 */
const MiniMapPreviewSVG = ({ scenario }) => {
  const terrainType = scenario.startingConditions.terrain;
  let bgGradientStart = '#1b2a38';
  let bgGradientEnd = '#0d1620';
  let featurePath = null;

  if (terrainType.includes('Coastal') || terrainType.includes('Estuary')) {
    bgGradientStart = '#1a3a4b';
    bgGradientEnd = '#0f232e';
    featurePath = <path d="M 0 120 Q 80 80 160 140 T 320 100 L 320 200 L 0 200 Z" fill="#1e5f74" opacity="0.6" />;
  } else if (terrainType.includes('River') || terrainType.includes('Basin')) {
    bgGradientStart = '#1c3127';
    bgGradientEnd = '#0e1d17';
    featurePath = <path d="M 40 0 Q 120 100 80 200 M 180 0 Q 220 120 280 200" stroke="#2d767f" strokeWidth="18" fill="none" opacity="0.5" />;
  } else if (terrainType.includes('Desert')) {
    bgGradientStart = '#3a2d1a';
    bgGradientEnd = '#241a0d';
    featurePath = <circle cx="160" cy="100" r="70" fill="#6e5026" opacity="0.4" />;
  } else if (terrainType.includes('Volcanic') || terrainType.includes('Slopes')) {
    bgGradientStart = '#331a1a';
    bgGradientEnd = '#1a0d0d';
    featurePath = <polygon points="160,30 260,170 60,170" fill="#5c2626" opacity="0.6" />;
  } else {
    bgGradientStart = '#1e293b';
    bgGradientEnd = '#0f172a';
    featurePath = <rect x="40" y="40" width="240" height="120" rx="8" fill="#334155" opacity="0.4" />;
  }

  return (
    <svg width="100%" height="160" style={{ borderRadius: '8px', border: '1px solid #2d3a4f', display: 'block' }}>
      <defs>
        <linearGradient id={`grad_${scenario.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgGradientStart} />
          <stop offset="100%" stopColor={bgGradientEnd} />
        </linearGradient>
        <pattern id={`grid_${scenario.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#grad_${scenario.id})`} />
      <rect width="100%" height="100%" fill={`url(#grid_${scenario.id})`} />
      {featurePath}
      <circle cx="160" cy="100" r="8" fill="#1a73e8" />
      <circle cx="160" cy="100" r="16" fill="none" stroke="#4285f4" strokeWidth="2" opacity="0.7">
        <animate attributeName="r" values="8;24;8" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="160" y="140" textAnchor="middle" fill="#9aa0a6" fontSize="11" fontFamily="sans-serif" fontWeight="600">
        {scenario.startingConditions.terrain} ({scenario.startingConditions.areaSqKm} km²)
      </text>
    </svg>
  );
};

/**
 * MAIN SCENARIO VIEW PAGE COMPONENT
 */
export default function ScenarioView({ onLaunchScenario, onBackToMenu }) {
  const [scenarios] = useState(SCENARIOS_DATABASE);
  const [selectedScenarioId, setSelectedScenarioId] = useState('scen_01');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [activeTab, setActiveTab] = useState('briefing');
  
  const [customModifiers, setCustomModifiers] = useState({
    sandboxMode: false,
    hardcoreEconomy: false,
    disasterFrequency: 'Normal',
    startingFundMultiplier: 1.0,
    unlockedTechTrees: false
  });

  const selectedScenario = useMemo(() => {
    return scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
  }, [scenarios, selectedScenarioId]);

  const categories = ['All', 'Growth', 'Energy', 'Eco', 'Tech', 'Disaster', 'Transport', 'Economy'];

  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scen => {
      const matchesSearch = scen.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            scen.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || scen.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || scen.difficulty === parseInt(selectedDifficulty, 10);
      return matchesSearch && matchesCategory && matchesDifficulty;
    }).sort((a, b) => {
      if (sortBy === 'difficulty_asc') return a.difficulty - b.difficulty;
      if (sortBy === 'difficulty_desc') return b.difficulty - a.difficulty;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'completed') return (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
      return 0;
    });
  }, [scenarios, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const handleLaunch = () => {
    if (!selectedScenario.unlocked) return;
    const launchPayload = {
      scenario: selectedScenario,
      modifiers: customModifiers,
      launchedAt: new Date().toISOString()
    };
    if (onLaunchScenario) {
      onLaunchScenario(launchPayload);
    } else {
      alert(`Launching Scenario: "${selectedScenario.title}"!\nDifficulty: ${selectedScenario.difficulty} Stars\nBudget: $${(selectedScenario.startingConditions.treasury * customModifiers.startingFundMultiplier).toLocaleString()}`);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f1419',
      color: '#e8eaed',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      <header style={{
        height: '64px',
        background: '#1a2332',
        borderBottom: '1px solid #2d3a4f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBackToMenu} 
            className="secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px' }}
          >
            ← Main Menu
          </button>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#4285f4', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 CITYMIND Scenario Challenges
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#9aa0a6', margin: 0 }}>
              Master 15 tactical urban management missions & earn global medals
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#243044', padding: '6px 16px', borderRadius: '8px', border: '1px solid #2d3a4f', textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block' }}>COMPLETED</span>
            <strong style={{ fontSize: '1rem', color: '#34a853' }}>
              {scenarios.filter(s => s.completed).length} / {scenarios.length} Scenarios
            </strong>
          </div>
          <div style={{ background: '#243044', padding: '6px 16px', borderRadius: '8px', border: '1px solid #2d3a4f', textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block' }}>TOTAL SCORE</span>
            <strong style={{ fontSize: '1rem', color: '#fbbc04' }}>
              {scenarios.reduce((acc, curr) => acc + (curr.userBestScore || 0), 0).toLocaleString()} PTS
            </strong>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{
          width: '58%',
          borderRight: '1px solid #2d3a4f',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f1419'
        }}>
          <div style={{
            padding: '16px 20px',
            background: '#161e2e',
            borderBottom: '1px solid #2d3a4f',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="🔍 Search scenarios by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: '#1a2332', border: '1px solid #2d3a4f', color: '#fff', borderRadius: '6px', padding: '8px 12px' }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ background: '#1a2332', border: '1px solid #2d3a4f', color: '#fff', borderRadius: '6px', padding: '8px 12px' }}
              >
                <option value="default">Sort by: Default</option>
                <option value="difficulty_asc">Difficulty: Low to High</option>
                <option value="difficulty_desc">Difficulty: High to Low</option>
                <option value="title">Title: A - Z</option>
                <option value="completed">Status: Completed First</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      borderRadius: '14px',
                      background: selectedCategory === cat ? '#1a73e8' : '#243044',
                      color: selectedCategory === cat ? '#fff' : '#9aa0a6',
                      border: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Stars:</span>
                {['All', '1', '2', '3', '4', '5'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      background: selectedDifficulty === diff ? '#fbbc04' : '#243044',
                      color: selectedDifficulty === diff ? '#111' : '#9aa0a6',
                      fontWeight: selectedDifficulty === diff ? '700' : '400',
                      border: 'none'
                    }}
                  >
                    {diff === 'All' ? 'All' : `${diff}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
            alignContent: 'start'
          }}>
            {filteredScenarios.map(scen => {
              const isSelected = scen.id === selectedScenarioId;
              const isLocked = !scen.unlocked;

              return (
                <div
                  key={scen.id}
                  onClick={() => !isLocked && setSelectedScenarioId(scen.id)}
                  style={{
                    background: isSelected ? '#1a273b' : '#161e2e',
                    border: isSelected ? '2px solid #1a73e8' : '1px solid #2d3a4f',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(26, 115, 232, 0.3)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        background: '#243044',
                        color: '#4285f4',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {scen.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StarRating rating={scen.difficulty} />
                        {scen.userBestMedal && <MedalBadge medal={scen.userBestMedal} />}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 6px 0', color: isSelected ? '#ffffff' : '#e8eaed' }}>
                      {scen.title} {isLocked && '🔒'}
                    </h3>

                    <p style={{
                      fontSize: '0.8rem',
                      color: '#9aa0a6',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {scen.summary}
                    </p>
                  </div>

                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '10px',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: '#9aa0a6'
                  }}>
                    <span>👥 Pop: {(scen.startingConditions.population).toLocaleString()}</span>
                    <span>💰 ${(scen.startingConditions.treasury / 1000).toFixed(0)}k</span>
                    <span style={{ color: scen.completed ? '#34a853' : '#ea4335', fontWeight: '600' }}>
                      {scen.completed ? '✓ Completed' : isLocked ? 'Locked' : 'Unattempted'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#161e2e',
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '24px',
            background: 'linear-gradient(180deg, #1f2b3e 0%, #161e2e 100%)',
            borderBottom: '1px solid #2d3a4f'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ background: '#1a73e8', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {selectedScenario.category} MODE
                  </span>
                  <StarRating rating={selectedScenario.difficulty} />
                  <span style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>{selectedScenario.badge} Level</span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  {selectedScenario.title}
                </h2>
              </div>
              {selectedScenario.userBestMedal && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block' }}>YOUR BEST MEDAL</span>
                  <MedalBadge medal={selectedScenario.userBestMedal} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '1px solid #2d3a4f' }}>
              {[
                { id: 'briefing', label: '📋 Mission Briefing' },
                { id: 'objectives', label: '🎯 Objectives Checklist' },
                { id: 'leaderboard', label: '🏆 Leaderboards' },
                { id: 'modifiers', label: '⚙️ Rules & Modifiers' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid #1a73e8' : '3px solid transparent',
                    color: activeTab === tab.id ? '#4285f4' : '#9aa0a6',
                    borderRadius: 0,
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {activeTab === 'briefing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
                  <h4 style={{ color: '#4285f4', margin: '0 0 8px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📖 Mayor Directive & Background
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#e8eaed', margin: 0 }}>
                    {selectedScenario.description}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: '#4285f4', margin: '0 0 12px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📊 Initial Conditions
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ background: '#1a2332', padding: '12px', borderRadius: '6px', border: '1px solid #2d3a4f' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block' }}>STARTING POPULATION</span>
                      <strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                        {(selectedScenario.startingConditions.population).toLocaleString()} Citizens
                      </strong>
                    </div>
                    <div style={{ background: '#1a2332', padding: '12px', borderRadius: '6px', border: '1px solid #2d3a4f' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block' }}>INITIAL TREASURY</span>
                      <strong style={{ fontSize: '1.1rem', color: selectedScenario.startingConditions.treasury < 0 ? '#ea4335' : '#34a853' }}>
                        ${(selectedScenario.startingConditions.treasury).toLocaleString()}
                      </strong>
                    </div>
                    <div style={{ background: '#1a2332', padding: '12px', borderRadius: '6px', border: '1px solid #2d3a4f' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block' }}>DISASTER THREAT LEVEL</span>
                      <strong style={{ fontSize: '1.1rem', color: '#fbbc04' }}>
                        {selectedScenario.startingConditions.disasterThreat}
                      </strong>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#4285f4', margin: '0 0 12px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🗺️ Topographical Terrain Map
                  </h4>
                  <MiniMapPreviewSVG scenario={selectedScenario} />
                </div>

                <div>
                  <h4 style={{ color: '#4285f4', margin: '0 0 8px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⚡ Special Scenario Rules & Constraints
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedScenario.specialRules.map((rule, idx) => (
                      <span key={idx} style={{
                        background: 'rgba(26, 115, 232, 0.15)',
                        border: '1px solid #1a73e8',
                        color: '#8ab4f8',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        ⚡ {rule}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'objectives' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ color: '#34a853', margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700' }}>
                    ⭐ Primary Mission Victory Requirements
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedScenario.primaryObjectives.map(obj => (
                      <div key={obj.id} style={{ background: '#1a2332', padding: '14px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>{obj.title}</span>
                          <span style={{ fontSize: '0.8rem', color: '#4285f4', fontWeight: '700' }}>
                            Target: {obj.target.toLocaleString()} {obj.unit}
                          </span>
                        </div>
                        <div style={{ height: '8px', background: '#0f1419', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, (obj.current / obj.target) * 100)}%`,
                            height: '100%',
                            background: '#34a853',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedScenario.secondaryObjectives && selectedScenario.secondaryObjectives.length > 0 && (
                  <div>
                    <h4 style={{ color: '#fbbc04', margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700' }}>
                      🎖️ Secondary Performance Milestones
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedScenario.secondaryObjectives.map(obj => (
                        <div key={obj.id} style={{ background: '#1a2332', padding: '12px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#e8eaed', fontSize: '0.85rem' }}>{obj.title}</span>
                            <span style={{ fontSize: '0.8rem', color: '#fbbc04' }}>{obj.target} {obj.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScenario.bonusChallenges && selectedScenario.bonusChallenges.length > 0 && (
                  <div>
                    <h4 style={{ color: '#e5e4e2', margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700' }}>
                      💎 Optional Platinum Bonus Challenges
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedScenario.bonusChallenges.map(bon => (
                        <div key={bon.id} style={{
                          background: 'linear-gradient(90deg, #243044 0%, #1a2332 100%)',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px stroke #ffc107',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.85rem', display: 'block' }}>{bon.title}</span>
                            <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Reward: {bon.reward}</span>
                          </div>
                          <span style={{ background: '#fbbc04', color: '#111', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>
                            {bon.multiplier}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div>
                <h4 style={{ color: '#fbbc04', margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700' }}>
                  🏆 High Score Hall of Fame
                </h4>
                {selectedScenario.highScores.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9aa0a6', background: '#1a2332', borderRadius: '8px' }}>
                    <p style={{ fontSize: '1.1rem', margin: '0 0 8px 0' }}>No high scores recorded yet!</p>
                    <p style={{ fontSize: '0.85rem' }}>Be the first mayor to complete this scenario and claim the #1 spot!</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1a2332', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#243044', color: '#9aa0a6', fontSize: '0.75rem', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px' }}>RANK</th>
                        <th style={{ padding: '10px 14px' }}>MAYOR</th>
                        <th style={{ padding: '10px 14px' }}>SCORE</th>
                        <th style={{ padding: '10px 14px' }}>TIME (MONTHS)</th>
                        <th style={{ padding: '10px 14px' }}>MEDAL</th>
                        <th style={{ padding: '10px 14px' }}>DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedScenario.highScores.map(row => (
                        <tr key={row.rank} style={{ borderBottom: '1px solid #2d3a4f', fontSize: '0.85rem' }}>
                          <td style={{ padding: '12px 14px', fontWeight: '800', color: row.rank === 1 ? '#fbbc04' : '#fff' }}>
                            #{row.rank}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: '600', color: '#8ab4f8' }}>{row.mayor}</td>
                          <td style={{ padding: '12px 14px', fontWeight: '700' }}>{row.score.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px', color: '#9aa0a6' }}>{row.timeMonths} mos</td>
                          <td style={{ padding: '12px 14px' }}><MedalBadge medal={row.medal} /></td>
                          <td style={{ padding: '12px 14px', color: '#9aa0a6', fontSize: '0.75rem' }}>{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'modifiers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ color: '#4285f4', margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: '700' }}>
                  ⚙️ Custom Rule Modifiers
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#9aa0a6', margin: '0 0 12px 0' }}>
                  Customize your scenario challenge settings before launching.
                </p>

                <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>Sandbox Mode (Unlimited Funds)</strong>
                      <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Disables achievements and high scores</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={customModifiers.sandboxMode}
                      onChange={(e) => setCustomModifiers(prev => ({ ...prev, sandboxMode: e.target.checked }))}
                    />
                  </label>

                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>Hardcore Realism Economy</strong>
                      <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Increases building maintenance costs by +30%</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={customModifiers.hardcoreEconomy}
                      onChange={(e) => setCustomModifiers(prev => ({ ...prev, hardcoreEconomy: e.target.checked }))}
                    />
                  </label>

                  <div>
                    <label style={{ display: 'block', color: '#fff', fontSize: '0.9rem', marginBottom: '6px' }}>
                      Disaster Occurrence Rate:
                    </label>
                    <select
                      value={customModifiers.disasterFrequency}
                      onChange={(e) => setCustomModifiers(prev => ({ ...prev, disasterFrequency: e.target.value }))}
                      style={{ width: '100%', background: '#0f1419', border: '1px solid #2d3a4f', color: '#fff', padding: '8px', borderRadius: '6px' }}
                    >
                      <option value="Off">Disasters Off</option>
                      <option value="Normal">Normal Frequency</option>
                      <option value="Frequent">Frequent Disasters (1.5x Score)</option>
                      <option value="Cataclysmic">Cataclysmic Mode (2.0x Score)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{
            padding: '20px 24px',
            background: '#1a2332',
            borderTop: '1px solid #2d3a4f',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block' }}>SELECTED MAP</span>
              <strong style={{ fontSize: '1rem', color: '#fff' }}>{selectedScenario.title}</strong>
            </div>

            <button
              onClick={handleLaunch}
              disabled={!selectedScenario.unlocked}
              style={{
                background: selectedScenario.unlocked ? '#34a853' : '#334155',
                color: '#fff',
                padding: '12px 32px',
                fontSize: '1rem',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                boxShadow: selectedScenario.unlocked ? '0 4px 14px rgba(52, 168, 83, 0.4)' : 'none',
                cursor: selectedScenario.unlocked ? 'pointer' : 'not-allowed'
              }}
            >
              🚀 LAUNCH SCENARIO
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
