/**
 * ScenarioEngine.js - City Simulation Scenario & Quest Orchestration Engine
 * 
 * Includes 15 fully scripted, production-quality city scenarios with initialization states,
 * multi-tier objective trees, step-by-step subtasks, event triggers, narrative briefs,
 * win/loss evaluators, and reward payout mechanics.
 */

import { EventEmitter, generateId, clamp } from '@citymind/utilities';

/**
 * Scenario Category Enum
 */
export const SCENARIO_CATEGORY = {
  SURVIVAL: 'survival',
  ENVIRONMENT: 'environment',
  ECONOMY: 'economy',
  EXPANSION: 'expansion',
  TRANSPORTATION: 'transportation',
  INDUSTRY: 'industry',
  TECHNOLOGY: 'technology',
  CULTURE: 'culture',
  SECURITY: 'security',
  HEALTHCARE: 'healthcare',
  SUSTAINABILITY: 'sustainability',
  INFRASTRUCTURE: 'infrastructure',
  SPECIAL_EVENT: 'special_event',
  MASTER_CHALLENGE: 'master_challenge'
};

/**
 * Scenario Difficulty Levels
 */
export const SCENARIO_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  VERY_HARD: 'very_hard',
  ULTIMATE: 'ultimate'
};

/**
 * Objective Status Enum
 */
export const OBJECTIVE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * 15 Fully Scripted City Scenario Definitions
 */
export const SCENARIO_DEFINITIONS = {

  // --------------------------------------------------------------------------
  // Scenario 1: Disaster Recovery (Category 5 Hurricane)
  // --------------------------------------------------------------------------
  disaster_recovery: {
    id: 'disaster_recovery',
    title: 'Disaster Recovery: Category 5 Hurricane',
    category: SCENARIO_CATEGORY.SURVIVAL,
    difficulty: SCENARIO_DIFFICULTY.HARD,
    durationLimitTicks: 2880, // 120 days (24 ticks/day * 120)
    icon: 'hurricane-alert',
    narrativeBrief: {
      intro: 'Category 5 Hurricane "Aegis" made landfall hours ago, devastating coastal infrastructure, severing power grids, and leaving 3,500 citizens displaced. Debris clogs primary transportation corridors and water sanitation plants are submerged.',
      midpoint: 'FEMA disaster relief funds have arrived, but local civil unrest is rising due to shelter shortages. Emergency power restoration is critical before hospital back-up generators run out of fuel.',
      victory: 'Miraculous recovery! The city stands rebuilt, storm defenses are fortified, public utilities are fully operational, and citizens have returned home stronger than ever.',
      defeat: 'Disaster management collapsed. Massive population exodus, widespread epidemic spread in temporary camps, and unmanaged municipal bankruptcy.'
    },
    startingState: {
      treasury: 50000,
      damagedBuildingRatio: 0.60,
      displacedCitizens: 3500,
      powerGridOnline: false,
      waterGridOnline: false,
      healthIndex: 42,
      debrisTilesCount: 180,
      initialDisasters: ['coastal_flood_surge', 'power_substation_failure']
    },
    objectives: [
      {
        id: 'obj_clear_debris',
        type: 'primary',
        title: 'Clear Hurricane Debris',
        description: 'Clear all storm debris blocking city road networks and building plots.',
        targetValue: 100, // percentage
        currentValue: 0,
        subtasks: [
          { id: 'sub_deploy_clean_crews', title: 'Deploy 6 Road Clearance Crews', target: 6, current: 0 },
          { id: 'sub_clear_arterial_roads', title: 'Clear Main Arterial Roads', target: 100, current: 0 },
          { id: 'sub_dispose_flood_rubble', title: 'Process 180 Debris Tiles', target: 180, current: 0 }
        ],
        evaluator: (sim) => {
          const remainingDebris = sim.map ? sim.map.countTilesByProperty('hasDebris', true) : 0;
          const cleared = Math.max(0, 180 - remainingDebris);
          return clamp((cleared / 180) * 100, 0, 100);
        }
      },
      {
        id: 'obj_restore_power',
        type: 'primary',
        title: 'Restore Utility Grid',
        description: 'Rebuild destroyed substations and achieve >95% power & water coverage.',
        targetValue: 95,
        currentValue: 0,
        subtasks: [
          { id: 'sub_repair_substations', title: 'Repair 3 Central Power Substations', target: 3, current: 0 },
          { id: 'sub_reconnect_water_mains', title: 'Fix 12 Fractured Water Mains', target: 12, current: 0 },
          { id: 'sub_power_coverage_95', title: 'Achieve 95% Power Grid Coverage', target: 95, current: 0 }
        ],
        evaluator: (sim) => {
          if (!sim.infrastructure) return 0;
          const pCoverage = sim.infrastructure.powerGrid ? sim.infrastructure.powerGrid.getCoveragePercentage() : 0;
          const wCoverage = sim.infrastructure.waterGrid ? sim.infrastructure.waterGrid.getCoveragePercentage() : 0;
          return Math.min(pCoverage, wCoverage);
        }
      },
      {
        id: 'obj_shelter_displaced',
        type: 'primary',
        title: 'House Displaced Citizens',
        description: 'Construct 3 Emergency Shelters and rebuild damaged residential zones.',
        targetValue: 3500,
        currentValue: 0,
        subtasks: [
          { id: 'sub_build_shelters', title: 'Construct 3 Emergency Relief Shelters', target: 3, current: 0 },
          { id: 'sub_rebuild_housing', title: 'Rebuild 1,000 Residential Units', target: 1000, current: 0 }
        ],
        evaluator: (sim) => {
          if (!sim.citizens) return 0;
          const housedDisplaced = 3500 - (sim.citizens.homelessCount || 0);
          return clamp(housedDisplaced, 0, 3500);
        }
      },
      {
        id: 'obj_build_sea_wall',
        type: 'secondary',
        title: 'Construct Coastal Sea Wall Barrier',
        description: 'Prevent future storm surges by erecting a 20-tile reinforced sea wall.',
        targetValue: 20,
        currentValue: 0,
        subtasks: [
          { id: 'sub_place_sea_wall_tiles', title: 'Place 20 Sea Wall Structure Tiles', target: 20, current: 0 }
        ],
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('sea_wall') : 0;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_fema_grant',
        tick: 480, // Day 20
        type: 'narrative_event',
        title: 'FEMA Disaster Relief Grant',
        description: 'Federal emergency management has released a $150,000 disaster recovery grant.',
        action: (sim) => {
          if (sim.economy) sim.economy.deposit(150000, 'FEMA Emergency Grant');
        }
      },
      {
        id: 'trig_epidemic_risk',
        condition: (sim) => sim.environment && sim.environment.sanitationScore < 40,
        type: 'crisis_event',
        title: 'Stagnant Floodwater Contamination',
        description: 'Waterborne pathogens detected in temporary camps! Healthcare demand increased by 40%.',
        action: (sim) => {
          if (sim.services && sim.services.healthcare) {
            sim.services.healthcare.triggerEpidemicAlert('cholera_outbreak');
          }
        }
      }
    ],
    rewards: {
      funds: 100000,
      prestigePoints: 500,
      unlocks: ['building_storm_barrier_v2', 'policy_disaster_insurance_mandate'],
      title: 'Resilient City Champion'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 2: Eco-City Transition (Zero-Carbon Target)
  // --------------------------------------------------------------------------
  eco_city_transition: {
    id: 'eco_city_transition',
    title: 'Eco-City Transition: Net-Zero Carbon',
    category: SCENARIO_CATEGORY.ENVIRONMENT,
    difficulty: SCENARIO_DIFFICULTY.MEDIUM,
    durationLimitTicks: 4320, // 180 days
    icon: 'leaf-eco',
    narrativeBrief: {
      intro: 'The city council has ratified the Global Climate Accord. With 10,000 citizens relying on aging coal plants and heavy industrial emissions, you must orchestrate a complete transition to clean renewable energy while maintaining grid stability.',
      midpoint: 'Fossil fuel lobby groups are protesting coal plant closures. Renewable energy storage buffers are tested as severe cloud cover reduces solar yields.',
      victory: 'Zero carbon achieved! Your city is a beacon of green innovation, operating on 100% clean power with thriving eco-districts and crystal-clear skies.',
      defeat: 'Grid blackout cascades, citizen revolt against carbon taxes, and failure to meet international emissions reduction deadlines.'
    },
    startingState: {
      treasury: 250000,
      population: 10000,
      powerPlants: [
        { type: 'coal_plant', count: 4, outputMW: 400 },
        { type: 'diesel_generator', count: 6, outputMW: 120 }
      ],
      renewableShare: 0.05,
      carbonEmissionsTons: 14500,
      airQualityIndex: 142 // Hazardous
    },
    objectives: [
      {
        id: 'obj_decommission_coal',
        type: 'primary',
        title: 'Decommission Coal & Fossil Fuel Infrastructure',
        description: 'Shut down and demolish all 4 coal plants and 6 diesel generators.',
        targetValue: 10,
        currentValue: 0,
        evaluator: (sim) => {
          const coal = sim.buildings ? sim.buildings.countByType('coal_plant') : 4;
          const diesel = sim.buildings ? sim.buildings.countByType('diesel_generator') : 6;
          const remaining = coal + diesel;
          return clamp(10 - remaining, 0, 10);
        }
      },
      {
        id: 'obj_100_renewable_grid',
        type: 'primary',
        title: 'Achieve 100% Renewable Energy Grid',
        description: 'Construct solar farms, wind turbine parks, and geothermal plants to power 10,000 citizens.',
        targetValue: 100,
        currentValue: 5,
        evaluator: (sim) => {
          return sim.infrastructure && sim.infrastructure.powerGrid ? sim.infrastructure.powerGrid.getRenewablePercentage() : 5;
        }
      },
      {
        id: 'obj_public_transit_70',
        type: 'primary',
        title: 'Public Transit Adoption >70%',
        description: 'Expand electric bus networks and metro rail lines to reduce vehicle emissions.',
        targetValue: 70,
        currentValue: 18,
        evaluator: (sim) => {
          return sim.transportation ? sim.transportation.getTransitAdoptionRate() : 18;
        }
      },
      {
        id: 'obj_plant_50_parks',
        type: 'secondary',
        title: 'Establish 50 Urban Parks & Green Roofs',
        description: 'Increase urban canopy cover to absorb atmospheric carbon.',
        targetValue: 50,
        currentValue: 0,
        evaluator: (sim) => {
          const parks = sim.buildings ? sim.buildings.countByType('urban_park') : 0;
          const greenRoofs = sim.buildings ? sim.buildings.countByType('green_roof_building') : 0;
          return parks + greenRoofs;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_solar_rebate',
        tick: 720,
        type: 'policy_unlock',
        title: 'Solar Roof Subsidies Unlocked',
        description: 'State eco-grant allows citizens to install solar panels with 40% municipal tax rebate.',
        action: (sim) => {
          if (sim.economy) sim.economy.unlockPolicy('solar_roof_rebate');
        }
      }
    ],
    rewards: {
      funds: 200000,
      prestigePoints: 750,
      unlocks: ['building_fusion_experimental', 'policy_carbon_neutral_rebate'],
      title: 'Global Eco-Pioneer'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 3: Financial Bankruptcy Crisis
  // --------------------------------------------------------------------------
  financial_bankruptcy: {
    id: 'financial_bankruptcy',
    title: 'Financial Bankruptcy: $500k Municipal Debt',
    category: SCENARIO_CATEGORY.ECONOMY,
    difficulty: SCENARIO_DIFFICULTY.VERY_HARD,
    durationLimitTicks: 5760, // 24 months (240 ticks/month * 24)
    icon: 'bankrupt-warning',
    narrativeBrief: {
      intro: 'Mismanagement by the previous administration left the city $500,000 in debt to bondholders. International credit agencies have downgraded the city bond rating to "D Junk". Municipal workers threaten mass strikes.',
      midpoint: 'Austerity measures are taking a toll on public safety and park maintenance. Commercial tax revenues must be revitalized without causing corporate flight.',
      victory: 'Fiscal miracle! All municipal debt eliminated, $200,000 cash reserve built, credit rating restored to AAA rating.',
      defeat: 'Municipal bankruptcy receivership declared. State governor dissolves city council.'
    },
    startingState: {
      treasury: -500000,
      creditRating: 'D',
      monthlyInterestCost: 25000,
      inflationRate: 0.18,
      citizenHappiness: 44,
      taxDiscontent: 72
    },
    objectives: [
      {
        id: 'obj_clear_debt',
        type: 'primary',
        title: 'Eliminate $500,000 Municipal Debt',
        description: 'Pay off all outstanding high-interest bonds and bring treasury balance above $0.',
        targetValue: 500000,
        currentValue: 0,
        evaluator: (sim) => {
          const balance = sim.economy ? sim.economy.treasury : -500000;
          return clamp(balance + 500000, 0, 500000);
        }
      },
      {
        id: 'obj_build_reserve',
        type: 'primary',
        title: 'Build $200,000 Treasury Cash Reserve',
        description: 'Accumulate a positive financial reserve to guard against future economic shocks.',
        targetValue: 200000,
        currentValue: 0,
        evaluator: (sim) => {
          const balance = sim.economy ? sim.economy.treasury : 0;
          return clamp(Math.max(0, balance), 0, 200000);
        }
      },
      {
        id: 'obj_restore_credit',
        type: 'primary',
        title: 'Restore Bond Credit Rating to AAA',
        description: 'Maintain 6 consecutive months of balanced budget to improve debt rating.',
        targetValue: 100, // percentage score
        currentValue: 10,
        evaluator: (sim) => {
          return sim.economy ? sim.economy.getCreditScorePercentage() : 10;
        }
      },
      {
        id: 'obj_maintain_happiness_55',
        type: 'secondary',
        title: 'Maintain Citizen Happiness Above 55%',
        description: 'Avoid total civil breakdown during period of strict municipal austerity.',
        targetValue: 55,
        currentValue: 44,
        evaluator: (sim) => {
          return sim.citizens ? sim.citizens.getAverageHappiness() : 44;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_strike_warning',
        tick: 960,
        type: 'crisis_event',
        title: 'Municipal Transit Strike Threatened',
        description: 'Transit workers demand payment of overdue wages or will halt all bus operations.',
        action: (sim) => {
          if (sim.events) sim.events.triggerEvent('transit_strike_warning');
        }
      }
    ],
    rewards: {
      funds: 300000,
      prestigePoints: 1000,
      unlocks: ['building_international_stock_exchange', 'policy_tax_free_enterprise_zone'],
      title: 'Financial Wizard'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 4: Megacity Explosion (50k Population Surge)
  // --------------------------------------------------------------------------
  megacity_explosion: {
    id: 'megacity_explosion',
    title: 'Megacity Explosion: 50,000 Population Surge',
    category: SCENARIO_CATEGORY.EXPANSION,
    difficulty: SCENARIO_DIFFICULTY.HARD,
    durationLimitTicks: 3600, // 150 days
    icon: 'population-surge',
    narrativeBrief: {
      intro: 'Regional economic collapse in neighboring states has triggered a massive migration wave toward your city. 45,000 new residents will arrive over the next 150 days. Construct massive residential towers, expand utility grids, and avert catastrophic homelessness.',
      midpoint: 'Homeless encampments are popping up in central parks. Gridlock locks down main thoroughfares. High-density zoning and rapid skyscraper construction are required immediately.',
      victory: 'Megacity achieved! 50,000 citizens accommodated with robust high-density housing, thriving commerce, and smooth transit corridors.',
      defeat: 'Massive slum formation, uncontrollable crime wave, sewage grid collapse, and total civil disorder.'
    },
    startingState: {
      treasury: 600000,
      population: 5000,
      residentialCapacity: 6000,
      homelessnessRate: 0.02,
      trafficCongestion: 0.35
    },
    objectives: [
      {
        id: 'obj_reach_50k_pop',
        type: 'primary',
        title: 'Reach 50,000 Total Population',
        description: 'Successfully absorb incoming migration wave without population collapse.',
        targetValue: 50000,
        currentValue: 5000,
        evaluator: (sim) => {
          return sim.citizens ? sim.citizens.populationCount : 5000;
        }
      },
      {
        id: 'obj_homelessness_under_2',
        type: 'primary',
        title: 'Keep Homelessness Rate Under 2%',
        description: 'Build high-density residential skyscrapers to ensure adequate housing supply.',
        targetValue: 98, // 100 - max homeless rate (98% housed)
        currentValue: 98,
        evaluator: (sim) => {
          if (!sim.citizens) return 0;
          const homelessPct = (sim.citizens.homelessCount / sim.citizens.populationCount) * 100;
          return clamp(100 - homelessPct, 0, 100);
        }
      },
      {
        id: 'obj_traffic_flow_70',
        type: 'primary',
        title: 'Maintain Traffic Flow Index > 70%',
        description: 'Expand road networks, build multi-layer interchanges and metro lines.',
        targetValue: 70,
        currentValue: 65,
        evaluator: (sim) => {
          return sim.transportation ? sim.transportation.getTrafficFlowIndex() : 65;
        }
      },
      {
        id: 'obj_build_120_towers',
        type: 'secondary',
        title: 'Construct 120 Residential Skyscrapers',
        description: 'Develop high-density urban residential blocks.',
        targetValue: 120,
        currentValue: 2,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('high_density_residential') : 2;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_migrant_wave_1',
        tick: 480,
        type: 'population_spawn',
        title: 'Migration Wave Alpha Arrives',
        description: '+10,000 citizens arrived at central train station seeking housing and employment.',
        action: (sim) => {
          if (sim.citizens) sim.citizens.spawnMigrationWave(10000);
        }
      }
    ],
    rewards: {
      funds: 500000,
      prestigePoints: 1200,
      unlocks: ['building_arcology_tower', 'policy_hyper_density_zoning'],
      title: 'Architect of the Megacity'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 5: Transit Gridlock Solution
  // --------------------------------------------------------------------------
  transit_gridlock: {
    id: 'transit_gridlock',
    title: 'Transit Gridlock: Multi-Modal Mobility',
    category: SCENARIO_CATEGORY.TRANSPORTATION,
    difficulty: SCENARIO_DIFFICULTY.MEDIUM,
    durationLimitTicks: 2160, // 90 days
    icon: 'transit-gridlock',
    narrativeBrief: {
      intro: 'The city is paralyzed by 92% traffic congestion. Commuters spend an average of 3.5 hours per day stuck on clogged arterial bridges. Logistics trucks cannot deliver food to supermarkets.',
      midpoint: 'Subway tunneling crews hit subterranean rock formations. Commuter dissatisfaction is driving retail sales down by 30%.',
      victory: 'Gridlock dismantled! A seamless multi-modal transit network of subways, electric buses, and elevated monorails moves citizens effortlessly.',
      defeat: 'Total vehicular lockup. Emergency services unable to reach fires and medical calls.'
    },
    startingState: {
      treasury: 350000,
      trafficCongestion: 0.92,
      averageCommuteMinutes: 210,
      transitCoverage: 0.12,
      activeSubwayLines: 0,
      activeBusRoutes: 2
    },
    objectives: [
      {
        id: 'obj_reduce_congestion_30',
        type: 'primary',
        title: 'Reduce Traffic Congestion to Below 30%',
        description: 'Divert commuter vehicles off roads into mass transit systems.',
        targetValue: 70, // 100 - 30% congestion = 70% flow score
        currentValue: 8,
        evaluator: (sim) => {
          const cong = sim.transportation ? sim.transportation.congestionLevel * 100 : 92;
          return clamp(100 - cong, 0, 100);
        }
      },
      {
        id: 'obj_build_3_subways',
        type: 'primary',
        title: 'Construct 3 Metro Subway Lines & 15 Stations',
        description: 'Build underground heavy rail transit connecting key districts.',
        targetValue: 15,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('subway_station') : 0;
        }
      },
      {
        id: 'obj_build_15_brt',
        type: 'primary',
        title: 'Establish 15 Bus Rapid Transit (BRT) Corridors',
        description: 'Designate dedicated bus lanes across primary avenues.',
        targetValue: 15,
        currentValue: 2,
        evaluator: (sim) => {
          return sim.transportation ? sim.transportation.getBRTRouteCount() : 2;
        }
      },
      {
        id: 'obj_commute_under_30m',
        type: 'secondary',
        title: 'Reduce Average Commute Time to < 30 Mins',
        description: 'Optimize transit transfer hubs and pedestrian walkways.',
        targetValue: 180, // target reduction in minutes (210 -> 30 = 180)
        currentValue: 0,
        evaluator: (sim) => {
          const currentCommute = sim.citizens ? sim.citizens.getAverageCommuteTime() : 210;
          return clamp(210 - currentCommute, 0, 180);
        }
      }
    ],
    triggers: [
      {
        id: 'trig_tunnel_boring_grant',
        tick: 480,
        type: 'technology_unlock',
        title: 'High-Speed Tunnel Boring Machine Unlocked',
        description: 'Subway construction cost reduced by 35% and speed doubled.',
        action: (sim) => {
          if (sim.infrastructure) sim.infrastructure.enableTunnelBoringTech();
        }
      }
    ],
    rewards: {
      funds: 250000,
      prestigePoints: 600,
      unlocks: ['building_maglev_terminal', 'policy_free_public_transit'],
      title: 'Master of Mobility'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 6: Rustbelt Industrial Revitalization
  // --------------------------------------------------------------------------
  rustbelt_revitalization: {
    id: 'rustbelt_revitalization',
    title: 'Rustbelt Revitalization: Factory to Tech Hub',
    category: SCENARIO_CATEGORY.INDUSTRY,
    difficulty: SCENARIO_DIFFICULTY.HARD,
    durationLimitTicks: 4800, // 200 days
    icon: 'factory-tech',
    narrativeBrief: {
      intro: 'Decades of industrial decline left the eastern district a wasteland of abandoned steel mills, toxic soil brownfields, and 28% unemployment. Transform this rustbelt graveyard into a high-tech innovation ecosystem.',
      midpoint: 'Soil de-contamination requires specialized bio-remediation protocols. Displaced factory workers need university re-training programs.',
      victory: 'Industrial rebirth! High-tech labs, robotics incubators, and clean manufacturing facilities replace old smokestacks, driving unemployment down to 3.5%.',
      defeat: 'Persistent toxic run-off, mass worker emigration, and permanent economic stagnation.'
    },
    startingState: {
      treasury: 300000,
      unemploymentRate: 0.28,
      derelictFactoriesCount: 30,
      toxicBrownfieldTiles: 85,
      techJobsCount: 150
    },
    objectives: [
      {
        id: 'obj_demolish_derelict',
        type: 'primary',
        title: 'Demolish 30 Derelict Factories & Decontaminate Soil',
        description: 'Clear abandoned industrial ruins and neutralize heavy metal soil contamination.',
        targetValue: 30,
        currentValue: 0,
        evaluator: (sim) => {
          const remaining = sim.buildings ? sim.buildings.countByType('derelict_factory') : 30;
          return clamp(30 - remaining, 0, 30);
        }
      },
      {
        id: 'obj_build_15_incubators',
        type: 'primary',
        title: 'Construct 15 Technology Incubators & Robotics Labs',
        description: 'Attract venture capital and high-tech startups to the revitalized zone.',
        targetValue: 15,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('tech_incubator') : 0;
        }
      },
      {
        id: 'obj_unemployment_under_5',
        type: 'primary',
        title: 'Lower Unemployment Rate to Below 5%',
        description: 'Retrain former industrial workers in software, automation, and clean tech.',
        targetValue: 95, // 100 - 5% = 95
        currentValue: 72,
        evaluator: (sim) => {
          const unemp = sim.economy ? sim.economy.unemploymentRate * 100 : 28;
          return clamp(100 - unemp, 0, 100);
        }
      },
      {
        id: 'obj_attract_1m_vc',
        type: 'secondary',
        title: 'Attract $1,000,000 VC Tech Investment',
        description: 'Generate commercial tech export value.',
        targetValue: 1000000,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.economy ? sim.economy.totalTechInvestment : 0;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_bioremediation_unlock',
        tick: 960,
        type: 'technology_unlock',
        title: 'Bio-Remediation Soil Cleansing Unlocked',
        description: 'Allows rapid decontamination of toxic brownfield tiles.',
        action: (sim) => {
          if (sim.services && sim.services.zoning) sim.services.zoning.enableBioRemediation();
        }
      }
    ],
    rewards: {
      funds: 350000,
      prestigePoints: 900,
      unlocks: ['building_quantum_computing_center', 'policy_tech_start_up_tax_holiday'],
      title: 'Innovation Catalyst'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 7: Smart City Frontier
  // --------------------------------------------------------------------------
  smart_city_frontier: {
    id: 'smart_city_frontier',
    title: 'Smart City Frontier: AI Grid & 5G Coverage',
    category: SCENARIO_CATEGORY.TECHNOLOGY,
    difficulty: SCENARIO_DIFFICULTY.MEDIUM,
    durationLimitTicks: 2880, // 120 days
    icon: 'smart-city-5g',
    narrativeBrief: {
      intro: 'Transform your municipality into the world\'s first fully automated Smart City. Upgrade utility networks with AI sensors, deploy a city-wide 5G telecom grid, and automate traffic signal controls.',
      midpoint: 'Cybersecurity vulnerability detected in automated water valves! Firewall upgrades must be deployed immediately to prevent rogue hacker intrusion.',
      victory: 'The Smart City is live! AI algorithms optimize traffic flow in real-time, zero power waste occurs, and citizen digital satisfaction reaches 99.9%.',
      defeat: 'Catastrophic cyber attack disables city infrastructure, causing widespread blackouts and water corruption.'
    },
    startingState: {
      treasury: 400000,
      telecomCoverage5G: 0.15,
      aiGridAutomationRatio: 0.10,
      cyberSecurityIndex: 55,
      trafficOptimization: 0.20
    },
    objectives: [
      {
        id: 'obj_deploy_50_towers',
        type: 'primary',
        title: 'Install 50 5G Telecom Micro-Towers',
        description: 'Achieve 100% gigabit wireless data coverage across all city districts.',
        targetValue: 50,
        currentValue: 8,
        evaluator: (sim) => {
          return sim.infrastructure && sim.infrastructure.telecomGrid ? sim.infrastructure.telecomGrid.countTowersByType('5g_micro') : 8;
        }
      },
      {
        id: 'obj_ai_grid_100',
        type: 'primary',
        title: 'Automate 100% of Municipal Utility Nodes',
        description: 'Install smart meters and AI balance nodes on power, water, and waste networks.',
        targetValue: 100,
        currentValue: 10,
        evaluator: (sim) => {
          return sim.infrastructure ? sim.infrastructure.getSmartAutomationPercentage() : 10;
        }
      },
      {
        id: 'obj_cyber_defense_90',
        type: 'primary',
        title: 'Maintain Cybersecurity Defense Rating > 90',
        description: 'Construct a Central Cyber Command Operations Center.',
        targetValue: 90,
        currentValue: 55,
        evaluator: (sim) => {
          return sim.services && sim.services.police ? sim.services.police.cyberSecurityScore : 55;
        }
      },
      {
        id: 'obj_ai_traffic_lights',
        type: 'secondary',
        title: 'Deploy AI Traffic Control Systems at 40 Intersections',
        description: 'Dynamically balance traffic light timing based on real-time vehicle camera feeds.',
        targetValue: 40,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.transportation ? sim.transportation.smartIntersectionCount : 0;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_hacker_attack',
        tick: 1440,
        type: 'crisis_event',
        title: 'Ransomware Attack Discovered!',
        description: 'Malware targeting municipal power grid! Deploy emergency security patches within 24 hours.',
        action: (sim) => {
          if (sim.events) sim.events.triggerEvent('cyber_ransomware_attack');
        }
      }
    ],
    rewards: {
      funds: 300000,
      prestigePoints: 800,
      unlocks: ['building_city_ai_supercomputer', 'policy_autonomous_vehicle_lanes'],
      title: 'Digital Visionary'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 8: Tourism & Cultural Renaissance
  // --------------------------------------------------------------------------
  tourism_renaissance: {
    id: 'tourism_renaissance',
    title: 'Tourism & Cultural Renaissance: World Wonders',
    category: SCENARIO_CATEGORY.CULTURE,
    difficulty: SCENARIO_DIFFICULTY.EASY,
    durationLimitTicks: 3600, // 150 days
    icon: 'landmark-wonder',
    narrativeBrief: {
      intro: 'Your city is unknown on the international stage, receiving fewer than 50 visitors per month. Construct 5 world-class architectural wonders, build luxury hotel districts, and establish your city as a global tourist destination.',
      midpoint: 'International travel magazines are featuring your new Grand Opera House. Hotel room shortages threaten to turn away high-spending tourists.',
      victory: 'Global cultural epicenter! Over 25,000 monthly tourists flock to your landmarks, generating millions in luxury hotel tax revenues.',
      defeat: 'Failed landmark projects, budget overruns, and empty tourist districts.'
    },
    startingState: {
      treasury: 500000,
      monthlyTourists: 50,
      landmarkWondersCount: 0,
      hotelTaxRevenue: 1200,
      cityCultureScore: 32
    },
    objectives: [
      {
        id: 'obj_build_5_wonders',
        type: 'primary',
        title: 'Construct 5 World Landmark Wonders',
        description: 'Build Grand Opera, Science Museum, Botanical Gardens, Coastal Boardwalk, and City Tower.',
        targetValue: 5,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByTag('landmark_wonder') : 0;
        }
      },
      {
        id: 'obj_25k_tourists',
        type: 'primary',
        title: 'Attract 25,000 Monthly Tourist Arrivals',
        description: 'Expand international airport capacity and luxury hotel accommodations.',
        targetValue: 25000,
        currentValue: 50,
        evaluator: (sim) => {
          return sim.economy ? sim.economy.monthlyTouristCount : 50;
        }
      },
      {
        id: 'obj_hotel_tax_boost',
        type: 'primary',
        title: 'Increase Hotel Tax Revenue by 500%',
        description: 'Develop 5-star hotel districts around landmark wonders.',
        targetValue: 6000, // 1200 * 5 = 6000
        currentValue: 1200,
        evaluator: (sim) => {
          return sim.economy ? sim.economy.getHotelTaxRevenue() : 1200;
        }
      },
      {
        id: 'obj_culture_score_90',
        type: 'secondary',
        title: 'Achieve City Culture Rating > 90',
        description: 'Host international art festivals and music galas.',
        targetValue: 90,
        currentValue: 32,
        evaluator: (sim) => {
          return sim.citizens ? sim.citizens.cultureRating : 32;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_world_expo_nomination',
        tick: 1200,
        type: 'narrative_event',
        title: 'Nominated Host for World Cultural Expo',
        description: 'Winning the nomination will boost tourist arrivals by +300% for 60 days.',
        action: (sim) => {
          if (sim.events) sim.events.triggerEvent('world_cultural_expo');
        }
      }
    ],
    rewards: {
      funds: 400000,
      prestigePoints: 950,
      unlocks: ['building_colossal_pantheon', 'policy_tourist_tax_exemption'],
      title: 'Cultural Titan'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 9: Crime Wave Containment
  // --------------------------------------------------------------------------
  crime_wave_containment: {
    id: 'crime_wave_containment',
    title: 'Crime Wave Containment: Law & Order Restoration',
    category: SCENARIO_CATEGORY.SECURITY,
    difficulty: SCENARIO_DIFFICULTY.HARD,
    durationLimitTicks: 2400, // 100 days
    icon: 'police-shield',
    narrativeBrief: {
      intro: 'Rampant gang warfare has pushed the city crime rate to an unbearable 45%. Storefronts are looted, citizens fear walking outdoors after sunset, and only 2 underfunded police stations remain operational.',
      midpoint: 'A major criminal syndicate has fortified the northern industrial park. High-intensity SWAT operations and community policing units are required.',
      victory: 'Law and order restored! Crime rate plummeted below 5%, public safety confidence reached 90%, and criminal syndicates dismantled.',
      defeat: 'Police department overwhelmed, total lawlessness, and complete loss of municipal authority.'
    },
    startingState: {
      treasury: 350000,
      crimeRate: 0.45,
      policePrecinctsCount: 2,
      activeOfficers: 35,
      publicSafetyIndex: 22,
      syndicateHotspotsCount: 4
    },
    objectives: [
      {
        id: 'obj_lower_crime_5',
        type: 'primary',
        title: 'Lower Overall Crime Rate to Below 5%',
        description: 'Saturate high-risk districts with police patrols and investigative surveillance.',
        targetValue: 95, // 100 - 5 = 95
        currentValue: 55,
        evaluator: (sim) => {
          const crime = sim.services && sim.services.police ? sim.services.police.crimeRate * 100 : 45;
          return clamp(100 - crime, 0, 100);
        }
      },
      {
        id: 'obj_build_8_precincts',
        type: 'primary',
        title: 'Construct 8 Police Precincts & SWAT Depots',
        description: 'Provide 100% police response coverage across all city tiles.',
        targetValue: 8,
        currentValue: 2,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('police_precinct') : 2;
        }
      },
      {
        id: 'obj_dismantle_4_syndicates',
        type: 'primary',
        title: 'Dismantle All 4 Major Criminal Syndicate Hotspots',
        description: 'Conduct targeted police raids on illegal contraband warehouses.',
        targetValue: 4,
        currentValue: 0,
        evaluator: (sim) => {
          const remaining = sim.services && sim.services.police ? sim.services.police.activeSyndicateHotspots : 4;
          return clamp(4 - remaining, 0, 4);
        }
      },
      {
        id: 'obj_public_safety_85',
        type: 'secondary',
        title: 'Raise Public Safety Index > 85%',
        description: 'Install street lighting networks and community watch programs.',
        targetValue: 85,
        currentValue: 22,
        evaluator: (sim) => {
          return sim.citizens ? sim.citizens.safetyRating : 22;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_syndicate_retaliation',
        tick: 720,
        type: 'crisis_event',
        title: 'Syndicate Warehouse Ambush',
        description: 'Criminal syndicate launched a retaliatory attack against District 3 precinct.',
        action: (sim) => {
          if (sim.events) sim.events.triggerEvent('syndicate_ambush_attack');
        }
      }
    ],
    rewards: {
      funds: 280000,
      prestigePoints: 700,
      unlocks: ['building_high_tech_surveillance_hq', 'policy_zero_tolerance_policing'],
      title: 'Guardian of Peace'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 10: Epidemic Outbreak Quarantine
  // --------------------------------------------------------------------------
  epidemic_quarantine: {
    id: 'epidemic_quarantine',
    title: 'Epidemic Outbreak: Containment & Vaccine Drive',
    category: SCENARIO_CATEGORY.HEALTHCARE,
    difficulty: SCENARIO_DIFFICULTY.VERY_HARD,
    durationLimitTicks: 1440, // 60 days
    icon: 'biohazard-quarantine',
    narrativeBrief: {
      intro: 'A highly contagious respiratory virus ("N-Variant") has broken out in the crowded downtown market. 30% of citizens are infected, local hospitals are at 180% capacity, and panic buying has emptied stores.',
      midpoint: 'Medical research labs are racing to formulate a vaccine. District quarantines must be enforced to halt exponential transmission.',
      victory: 'Epidemic extinguished! 90% of population vaccinated, active infection rate reduced to 0%, healthcare system fortified.',
      defeat: 'Catastrophic casualty toll (>15% population mortality) and collapse of public health infrastructure.'
    },
    startingState: {
      treasury: 300000,
      infectionRate: 0.30,
      hospitalBedCapacity: 450,
      infectedCitizensCount: 3000,
      vaccinationCoverage: 0.0,
      epidemicMortalityTotal: 120
    },
    objectives: [
      {
        id: 'obj_zero_infection',
        type: 'primary',
        title: 'Lower Active Infection Rate to 0%',
        description: 'Enforce district lockdowns, isolation wards, and sanitation field sweeps.',
        targetValue: 100, // 100% infection eliminated
        currentValue: 70,
        evaluator: (sim) => {
          const inf = sim.services && sim.services.healthcare ? sim.services.healthcare.infectionRate * 100 : 30;
          return clamp(100 - inf, 0, 100);
        }
      },
      {
        id: 'obj_vaccinate_90',
        type: 'primary',
        title: 'Achieve 90% Vaccination Coverage',
        description: 'Construct 4 Medical Distribution Hubs and mass vaccinate citizens.',
        targetValue: 90,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.services && sim.services.healthcare ? sim.services.healthcare.vaccineCoveragePercentage : 0;
        }
      },
      {
        id: 'obj_build_4_hospitals',
        type: 'primary',
        title: 'Construct 4 High-Capacity Quarantine Hospitals',
        description: 'Expand ICU bed capacity to prevent patient turning-away.',
        targetValue: 4,
        currentValue: 1,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('quarantine_hospital') : 1;
        }
      },
      {
        id: 'obj_mortality_under_1',
        type: 'secondary',
        title: 'Keep Mortality Rate Below 1%',
        description: 'Deploy therapeutic treatments to critical ICU patients.',
        targetValue: 99, // 100 - 1% mortality = 99% survival rate
        currentValue: 95,
        evaluator: (sim) => {
          if (!sim.citizens) return 95;
          const mortPct = (sim.services.healthcare.totalDeaths / sim.citizens.populationCount) * 100;
          return clamp(100 - mortPct, 0, 100);
        }
      }
    ],
    triggers: [
      {
        id: 'trig_vaccine_breakthrough',
        tick: 480,
        type: 'technology_unlock',
        title: 'Vaccine Formula Discovered!',
        description: 'Medical research labs successfully synthesized the vaccine. Mass distribution authorized.',
        action: (sim) => {
          if (sim.services && sim.services.healthcare) sim.services.healthcare.enableVaccineDistribution();
        }
      }
    ],
    rewards: {
      funds: 320000,
      prestigePoints: 850,
      unlocks: ['building_cdc_research_complex', 'policy_emergency_health_quarantine'],
      title: 'Savior of Public Health'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 11: Silicon Bay Tech Boom
  // --------------------------------------------------------------------------
  silicon_bay_boom: {
    id: 'silicon_bay_boom',
    title: 'Silicon Bay: Tech Boom & University Incubators',
    category: SCENARIO_CATEGORY.TECHNOLOGY,
    difficulty: SCENARIO_DIFFICULTY.MEDIUM,
    durationLimitTicks: 4320, // 180 days
    icon: 'silicon-bay',
    narrativeBrief: {
      intro: 'Your local community college has received a massive endowment. Leverage this talent pool to transform the bay district into "Silicon Bay"—a world leader in Artificial Intelligence, Biotechnology, and Quantum Computing.',
      midpoint: 'Global tech conglomerates are competing for office space. Housing costs in the surrounding district are skyrocketing, threatening gentrification displacement.',
      victory: 'Tech Mecca! 20 research incubators, 5 global tech headquarters, and 100 patented innovations generated right in your city.',
      defeat: 'Brain drain to rival tech cities and failed commercialization of research.'
    },
    startingState: {
      treasury: 450000,
      universityLevel: 1,
      techIncubatorsCount: 2,
      patentsFiled: 4,
      techHQCount: 0,
      techExportRevenue: 25000
    },
    objectives: [
      {
        id: 'obj_upgrade_university_tier1',
        type: 'primary',
        title: 'Upgrade University to Tier-1 Research Institute',
        description: 'Construct Advanced Supercomputing Labs and Engineering Faculties.',
        targetValue: 100, // percentage score
        currentValue: 20,
        evaluator: (sim) => {
          return sim.services && sim.services.education ? sim.services.education.getUniversityTierScore() : 20;
        }
      },
      {
        id: 'obj_build_20_incubators',
        type: 'primary',
        title: 'Attract 20 Tech Incubators & Biotech Labs',
        description: 'Provide tax incentives for venture capital startup creation.',
        targetValue: 20,
        currentValue: 2,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByTag('tech_incubator') : 2;
        }
      },
      {
        id: 'obj_file_100_patents',
        type: 'primary',
        title: 'Generate 100 Municipal Tech Patents',
        description: 'Fund commercial R&D projects through university grants.',
        targetValue: 100,
        currentValue: 4,
        evaluator: (sim) => {
          return sim.economy ? sim.economy.totalPatentsFiled : 4;
        }
      },
      {
        id: 'obj_attract_5_hq',
        type: 'secondary',
        title: 'Attract 5 Global Tech Company HQs',
        description: 'Build prime commercial office skyscrapers with fiber-optic connectivity.',
        targetValue: 5,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('global_tech_hq') : 0;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_unicorn_ipo',
        tick: 1440,
        type: 'narrative_event',
        title: 'Local Startup Goes Public (Unicorn IPO)',
        description: 'A city-incubated AI company reached a $10B valuation, pouring tax revenue into the city treasury.',
        action: (sim) => {
          if (sim.economy) sim.economy.deposit(250000, 'Unicorn IPO Tax Revenue');
        }
      }
    ],
    rewards: {
      funds: 450000,
      prestigePoints: 900,
      unlocks: ['building_quantum_network_node', 'policy_patent_royalty_sharing'],
      title: 'Silicon Bay Titan'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 12: Agrarian & Food Sovereignty
  // --------------------------------------------------------------------------
  agrarian_sovereignty: {
    id: 'agrarian_sovereignty',
    title: 'Agrarian & Food Sovereignty: Vertical Agriculture',
    category: SCENARIO_CATEGORY.SUSTAINABILITY,
    difficulty: SCENARIO_DIFFICULTY.EASY,
    durationLimitTicks: 2880, // 120 days
    icon: 'hydroponics-farm',
    narrativeBrief: {
      intro: 'Global trade blockades have severed food import pipelines, leaving grocery store shelves empty. Achieve 100% urban food self-sufficiency through vertical hydroponic towers and community agriculture.',
      midpoint: 'Severe drought threatens traditional soil crops. Indoor hydroponic vertical farms are the only viable solution to feed citizens.',
      victory: 'Food sovereignty secured! Bountiful vertical harvests feed the entire city with zero reliance on external food imports.',
      defeat: 'Famine conditions, malnutrition crisis, and widespread food riots.'
    },
    startingState: {
      treasury: 300000,
      foodImportDependence: 0.90, // 90% imported
      verticalFarmsCount: 1,
      communityGardensCount: 3,
      foodSecurityIndex: 28
    },
    objectives: [
      {
        id: 'obj_100_food_sovereignty',
        type: 'primary',
        title: 'Achieve 100% Urban Food Self-Sufficiency',
        description: 'Produce enough organic crops locally to satisfy total citizen caloric demand.',
        targetValue: 100,
        currentValue: 10,
        evaluator: (sim) => {
          const selfSuff = sim.economy ? (1 - sim.economy.foodImportDependence) * 100 : 10;
          return clamp(selfSuff, 0, 100);
        }
      },
      {
        id: 'obj_build_15_vertical_farms',
        type: 'primary',
        title: 'Construct 15 Hydroponic Skyscraper Farms',
        description: 'Utilize automated LED vertical growth racks to maximize yield per square meter.',
        targetValue: 15,
        currentValue: 1,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('vertical_hydroponic_farm') : 1;
        }
      },
      {
        id: 'obj_build_30_gardens',
        type: 'primary',
        title: 'Establish 30 Rooftop & Community Gardens',
        description: 'Transform unused urban rooftops into vibrant vegetable gardens.',
        targetValue: 30,
        currentValue: 3,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('community_rooftop_garden') : 3;
        }
      },
      {
        id: 'obj_food_waste_reduction',
        type: 'secondary',
        title: 'Reduce Food Waste by 75%',
        description: 'Deploy municipal compost bio-digesters to recycle organic waste into fertilizer.',
        targetValue: 75,
        currentValue: 10,
        evaluator: (sim) => {
          return sim.infrastructure && sim.infrastructure.wasteSystem ? sim.infrastructure.wasteSystem.foodWasteReductionPct : 10;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_drought_wave',
        tick: 720,
        type: 'weather_event',
        title: 'Severe Regional Drought',
        description: 'External agricultural yields down by 80%. Hydroponic farms are essential.',
        action: (sim) => {
          if (sim.environment) sim.environment.setWeatherOverride('drought', 240);
        }
      }
    ],
    rewards: {
      funds: 220000,
      prestigePoints: 550,
      unlocks: ['building_spirulina_bio_refinery', 'policy_urban_agriculture_subsidies'],
      title: 'Master of Agrarian Sustenance'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 13: Olympic Games Hosting
  // --------------------------------------------------------------------------
  olympic_games_hosting: {
    id: 'olympic_games_hosting',
    title: 'Olympic Games Hosting: Global Mega-Event',
    category: SCENARIO_CATEGORY.SPECIAL_EVENT,
    difficulty: SCENARIO_DIFFICULTY.VERY_HARD,
    durationLimitTicks: 8640, // 360 days (1 full year)
    icon: 'olympic-flame',
    narrativeBrief: {
      intro: 'Your city won the bid to host the Summer Olympic Games! In 360 days, 100,000 international visitors and 10,000 athletes will arrive. Construct mega-stadiums, transport corridors, and athlete villages before the opening ceremony.',
      midpoint: 'Construction strikes and cost overruns threaten stadium completion deadlines. International Olympic Inspectors are conducting a status audit.',
      victory: 'Triumphant Olympic Games! World records broken, seamless event execution, and $1.5M revenue windfall generated.',
      defeat: 'Unfinished venues, embarrassing international media scandal, and crushing debt.'
    },
    startingState: {
      treasury: 1000000,
      olympicStadiumBuilt: false,
      aquaticsCenterBuilt: false,
      olympicVillageBuilt: false,
      transitCorridorReady: false,
      olympicReadinessScore: 5
    },
    objectives: [
      {
        id: 'obj_build_mega_stadium',
        type: 'primary',
        title: 'Construct 80,000-Seat Olympic Mega-Stadium',
        description: 'Complete the flagship venue for opening ceremonies and athletics.',
        targetValue: 1,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.buildings && sim.buildings.countByType('olympic_mega_stadium') > 0 ? 1 : 0;
        }
      },
      {
        id: 'obj_build_aquatics_center',
        type: 'primary',
        title: 'Construct International Aquatics Center & Velodrome',
        description: 'Build specialized Olympic sports complexes.',
        targetValue: 2,
        currentValue: 0,
        evaluator: (sim) => {
          const aqua = sim.buildings ? sim.buildings.countByType('aquatics_center') : 0;
          const velo = sim.buildings ? sim.buildings.countByType('indoor_velodrome') : 0;
          return aqua + velo;
        }
      },
      {
        id: 'obj_build_olympic_village',
        type: 'primary',
        title: 'Construct Olympic Athlete Village (10,000 Capacity)',
        description: 'Provide high-quality housing, dining, and training centers for athletes.',
        targetValue: 100, // completion percentage
        currentValue: 0,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.getOlympicVillageCompletionPct() : 0;
        }
      },
      {
        id: 'obj_express_transit_corridor',
        type: 'primary',
        title: 'Complete Olympic Dedicated Express Transit Corridor',
        description: 'Connect airport, hotels, and all venues with high-speed monorail lines.',
        targetValue: 100,
        currentValue: 10,
        evaluator: (sim) => {
          return sim.transportation ? sim.transportation.getOlympicTransitReadiness() : 10;
        }
      },
      {
        id: 'obj_generate_1_5m_profit',
        type: 'secondary',
        title: 'Generate $1,500,000 Profit from Ticket Sales & Broadcasting',
        description: 'Maximize commercial sponsorships and broadcasting rights.',
        targetValue: 1500000,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.economy ? sim.economy.olympicRevenueTotal : 0;
        }
      }
    ],
    triggers: [
      {
        id: 'trig_ioc_inspection',
        tick: 4320, // Day 180
        type: 'narrative_event',
        title: 'International Olympic Committee Audit',
        description: 'IOC inspectors are evaluating venue progress. +$200k bonus awarded if venues are >50% complete.',
        action: (sim) => {
          const ready = sim.buildings ? sim.buildings.getOlympicVillageCompletionPct() : 0;
          if (ready >= 50 && sim.economy) {
            sim.economy.deposit(200000, 'IOC Progress Bonus');
          }
        }
      }
    ],
    rewards: {
      funds: 600000,
      prestigePoints: 2000,
      unlocks: ['building_golden_torch_monument', 'policy_global_event_hosting_rights'],
      title: 'Olympic Master Architect'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 14: Coastal Flood & Sea Wall Defense
  // --------------------------------------------------------------------------
  coastal_flood_defense: {
    id: 'coastal_flood_defense',
    title: 'Coastal Flood Defense: Sea Walls & Canals',
    category: SCENARIO_CATEGORY.INFRASTRUCTURE,
    difficulty: SCENARIO_DIFFICULTY.HARD,
    durationLimitTicks: 3600, // 150 days
    icon: 'water-defense-shield',
    narrativeBrief: {
      intro: 'Accelerating sea-level rise causes bi-weekly tidal flooding that submerges 35% of low-lying city districts. Construct a defensive perimeter of sea walls, tidal floodgates, and internal stormwater canal networks.',
      midpoint: 'Spring high-tide surge is expected in 15 days. Unfinished sea wall segments must be reinforced with sandbag barriers immediately.',
      victory: 'Impenetrable hydro-defense! Sea walls, storm gates, and canal networks successfully protect all waterfront districts from sea level rise.',
      defeat: 'Permanent inundation of downtown financial district, driving $10B in property destruction.'
    },
    startingState: {
      treasury: 400000,
      floodedDistrictRatio: 0.35,
      seaWallLengthTiles: 0,
      pumpingStationsCount: 0,
      canalNetworkLengthTiles: 0
    },
    objectives: [
      {
        id: 'obj_build_12km_seawall',
        type: 'primary',
        title: 'Construct 30 Sea Wall Perimeter Tiles',
        description: 'Erect reinforced concrete sea walls along the coastal boundary.',
        targetValue: 30,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('sea_wall') : 0;
        }
      },
      {
        id: 'obj_build_5_pumping_stations',
        type: 'primary',
        title: 'Construct 5 High-Capacity Storm Pumping Stations',
        description: 'Pump accumulated rainwater back into the ocean during high tide.',
        targetValue: 5,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.buildings ? sim.buildings.countByType('storm_pumping_station') : 0;
        }
      },
      {
        id: 'obj_build_canal_network',
        type: 'primary',
        title: 'Construct 25 Canal Network Tiles',
        description: 'Divert floodwater safely through urban water channels.',
        targetValue: 25,
        currentValue: 0,
        evaluator: (sim) => {
          return sim.map ? sim.map.countTilesByProperty('isCanal', true) : 0;
        }
      },
      {
        id: 'obj_zero_flooded_tiles',
        type: 'secondary',
        title: 'Eliminate All Active District Inundation',
        description: 'Drain all flooded city tiles to 0.',
        targetValue: 100, // 100% dry tiles
        currentValue: 65,
        evaluator: (sim) => {
          const flooded = sim.map ? sim.map.countTilesByProperty('isFlooded', true) : 35;
          return clamp(100 - flooded, 0, 100);
        }
      }
    ],
    triggers: [
      {
        id: 'trig_king_tide_surge',
        tick: 1440,
        type: 'disaster_event',
        title: 'King Tide Storm Surge Approaching',
        description: 'Extreme tidal surge wave will hit coastal districts in 24 hours!',
        action: (sim) => {
          if (sim.events) sim.events.triggerEvent('king_tide_storm_surge');
        }
      }
    ],
    rewards: {
      funds: 380000,
      prestigePoints: 850,
      unlocks: ['building_hydro_barrier_gate_complex', 'policy_coastal_zoning_setback'],
      title: 'Protector of the Shore'
    }
  },

  // --------------------------------------------------------------------------
  // Scenario 15: Utopia Challenge (95% Happiness Benchmark)
  // --------------------------------------------------------------------------
  utopia_challenge: {
    id: 'utopia_challenge',
    title: 'Utopia Challenge: 95% Universal Happiness',
    category: SCENARIO_CATEGORY.MASTER_CHALLENGE,
    difficulty: SCENARIO_DIFFICULTY.ULTIMATE,
    durationLimitTicks: 7200, // 300 days
    icon: 'utopia-crown',
    narrativeBrief: {
      intro: 'The ultimate urban planning milestone: Create a true city Utopia. You must achieve 95% happiness across all 5 demographic tiers, eliminate homelessness and unemployment completely, run on 100% clean energy, and maintain a $1,000,000 treasury reserve.',
      midpoint: 'Wealth inequality between high-tech executives and service workers is causing happiness divergence. Balancing public services and tax equity is paramount.',
      victory: 'Utopia Achieved! Your city stands as the pinnacle of human civilization—a harmonious, prosperous, eco-friendly paradise for all.',
      defeat: 'Inequality riots, economic imbalance, and failure to meet the strict 95% happiness threshold.'
    },
    startingState: {
      treasury: 500000,
      overallHappiness: 52,
      homelessnessRate: 0.05,
      unemploymentRate: 0.08,
      crimeRate: 0.12,
      renewableEnergyShare: 0.30
    },
    objectives: [
      {
        id: 'obj_95_overall_happiness',
        type: 'primary',
        title: 'Achieve >95% Overall Citizen Happiness',
        description: 'Satisfy housing, safety, health, education, parks, and culture across all citizens.',
        targetValue: 95,
        currentValue: 52,
        evaluator: (sim) => {
          return sim.citizens ? sim.citizens.getAverageHappiness() : 52;
        }
      },
      {
        id: 'obj_zero_homelessness',
        type: 'primary',
        title: 'Eliminate Homelessness Completely (0%)',
        description: 'Provide universal affordable housing for every resident.',
        targetValue: 100, // 100% housed
        currentValue: 95,
        evaluator: (sim) => {
          if (!sim.citizens) return 95;
          const hCount = sim.citizens.homelessCount || 0;
          return hCount === 0 ? 100 : Math.max(0, 100 - (hCount / sim.citizens.populationCount) * 100);
        }
      },
      {
        id: 'obj_zero_unemployment',
        type: 'primary',
        title: 'Lower Unemployment Rate to Below 2%',
        description: 'Ensure abundant commercial, industrial, and municipal jobs for all workers.',
        targetValue: 98,
        currentValue: 92,
        evaluator: (sim) => {
          const unemp = sim.economy ? sim.economy.unemploymentRate * 100 : 8;
          return clamp(100 - unemp, 0, 100);
        }
      },
      {
        id: 'obj_crime_under_2',
        type: 'primary',
        title: 'Lower Crime Rate Below 2%',
        description: 'Maintain absolute public safety and civil harmony.',
        targetValue: 98,
        currentValue: 88,
        evaluator: (sim) => {
          const crime = sim.services && sim.services.police ? sim.services.police.crimeRate * 100 : 12;
          return clamp(100 - crime, 0, 100);
        }
      },
      {
        id: 'obj_1m_reserve',
        type: 'secondary',
        title: 'Maintain $1,000,000 Treasury Cash Reserve',
        description: 'Solidify long-term economic stability.',
        targetValue: 1000000,
        currentValue: 500000,
        evaluator: (sim) => {
          const balance = sim.economy ? sim.economy.treasury : 500000;
          return clamp(balance, 0, 1000000);
        }
      }
    ],
    triggers: [
      {
        id: 'trig_utopia_committee_visit',
        tick: 3600,
        type: 'narrative_event',
        title: 'Global Utopia Evaluation Committee Visit',
        description: 'International auditors evaluating city metrics for the World Liveability Award.',
        action: (sim) => {
          if (sim.events) sim.events.triggerEvent('utopia_evaluation_audit');
        }
      }
    ],
    rewards: {
      funds: 1000000,
      prestigePoints: 5000,
      unlocks: ['building_utopian_arcology_spire', 'policy_universal_basic_income'],
      title: 'Architect of Utopia'
    }
  }
};

/**
 * ScenarioEngine Class
 * Handles scenario registration, active state lifecycle, real-time evaluation,
 * narrative triggers, choice prompts, and reward claims.
 */
export class ScenarioEngine extends EventEmitter {
  /**
   * @param {Object} [simulationEngine] - Reference to root SimulationEngine
   */
  constructor(simulationEngine = null) {
    super();
    this.sim = simulationEngine;
    this.scenarios = new Map();
    this.activeScenario = null;
    this.activeState = null;
    this.elapsedTicks = 0;
    this.isPaused = false;
    this.narrativeHistory = [];

    // Register all standard definitions
    this._registerDefaultScenarios();
  }

  /**
   * Connect root simulation engine reference.
   * @param {Object} simulationEngine 
   */
  connectSimulation(simulationEngine) {
    this.sim = simulationEngine;
  }

  /**
   * Register standard 15 scenario definitions.
   * @private
   */
  _registerDefaultScenarios() {
    for (const [id, def] of Object.entries(SCENARIO_DEFINITIONS)) {
      this.registerScenario(def);
    }
  }

  /**
   * Register a scenario definition object.
   * @param {Object} scenarioDef 
   */
  registerScenario(scenarioDef) {
    this.validateScenarioDefinition(scenarioDef);
    this.scenarios.set(scenarioDef.id, JSON.parse(JSON.stringify(scenarioDef)));
  }

  /**
   * Validate scenario definition object schema.
   * @param {Object} scenarioDef 
   * @returns {boolean}
   */
  validateScenarioDefinition(scenarioDef) {
    if (!scenarioDef || !scenarioDef.id || !scenarioDef.title) {
      throw new Error('Scenario definition missing required id or title.');
    }
    if (!scenarioDef.objectives || !Array.isArray(scenarioDef.objectives)) {
      throw new Error(`Scenario ${scenarioDef.id} must define an array of objectives.`);
    }
    return true;
  }

  /**
   * Retrieve scenario definition by ID.
   * @param {string} id 
   * @returns {Object|null}
   */
  getScenario(id) {
    return this.scenarios.get(id) || null;
  }

  /**
   * Get all registered scenarios array.
   * @returns {Array<Object>}
   */
  getAllScenarios() {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get scenarios by category.
   * @param {string} category 
   * @returns {Array<Object>}
   */
  getScenariosByCategory(category) {
    return this.getAllScenarios().filter(s => s.category === category);
  }

  /**
   * Load and activate a scenario by ID.
   * @param {string} scenarioId 
   * @param {Object} [options] 
   * @returns {boolean} Success status
   */
  loadScenario(scenarioId, options = {}) {
    const scenarioDef = this.scenarios.get(scenarioId);
    if (!scenarioDef) {
      console.error(`ScenarioEngine: Scenario "${scenarioId}" not found.`);
      return false;
    }

    // Deep clone definition for active state mutation
    this.activeScenario = JSON.parse(JSON.stringify(scenarioDef));
    this.elapsedTicks = 0;
    this.isPaused = false;
    this.narrativeHistory = [];

    // Construct active state tracking object
    this.activeState = {
      id: this.activeScenario.id,
      title: this.activeScenario.title,
      status: OBJECTIVE_STATUS.IN_PROGRESS,
      startTime: Date.now(),
      durationLimitTicks: this.activeScenario.durationLimitTicks,
      ticksRemaining: this.activeScenario.durationLimitTicks,
      completedObjectives: [],
      failedObjectives: [],
      claimedRewards: false,
      objectiveProgressMap: {},
      triggeredEvents: new Set()
    };

    // Initialize objective state maps
    for (const obj of this.activeScenario.objectives) {
      obj.status = OBJECTIVE_STATUS.PENDING;
      obj.currentValue = obj.currentValue || 0;
      this.activeState.objectiveProgressMap[obj.id] = {
        status: OBJECTIVE_STATUS.PENDING,
        progressPct: 0,
        currentValue: obj.currentValue,
        targetValue: obj.targetValue
      };

      if (obj.subtasks) {
        for (const sub of obj.subtasks) {
          sub.status = OBJECTIVE_STATUS.PENDING;
          sub.current = sub.current || 0;
        }
      }
    }

    // Apply scenario starting state mutations to simulation if connected
    if (this.sim && this.activeScenario.startingState) {
      this._applyStartingState(this.activeScenario.startingState);
    }

    this.emit('scenario_loaded', { scenario: this.activeScenario, state: this.activeState });
    return true;
  }

  /**
   * Apply initial state settings to simulation engine.
   * @private
   * @param {Object} state 
   */
  _applyStartingState(state) {
    if (!this.sim) return;

    if (state.treasury !== undefined && this.sim.economy) {
      this.sim.economy.treasury = state.treasury;
    }
    if (state.population !== undefined && this.sim.citizens) {
      this.sim.citizens.spawnInitialPopulation(state.population);
    }
    if (state.airQualityIndex !== undefined && this.sim.environment) {
      this.sim.environment.airQualityIndex = state.airQualityIndex;
    }
    if (state.initialDisasters && Array.isArray(state.initialDisasters) && this.sim.disasters) {
      for (const dType of state.initialDisasters) {
        this.sim.disasters.triggerDisaster(dType);
      }
    }
  }

  /**
   * Start or resume active scenario execution.
   */
  startScenario() {
    if (!this.activeScenario) return;
    this.isPaused = false;
    this.emit('scenario_started', { scenarioId: this.activeScenario.id });
  }

  /**
   * Pause scenario evaluation.
   */
  pauseScenario() {
    this.isPaused = true;
    this.emit('scenario_paused', { scenarioId: this.activeScenario ? this.activeScenario.id : null });
  }

  /**
   * Reset current scenario to initial state.
   */
  resetScenario() {
    if (!this.activeScenario) return;
    this.loadScenario(this.activeScenario.id);
  }

  /**
   * Main update tick called from simulation loop.
   * @param {number} dtHours - Simulation hours elapsed
   * @param {number} currentTick - Root simulation tick counter
   */
  update(dtHours, currentTick) {
    if (!this.activeScenario || this.isPaused || this.activeState.status !== OBJECTIVE_STATUS.IN_PROGRESS) {
      return;
    }

    this.elapsedTicks += 1;
    this.activeState.ticksRemaining = Math.max(0, this.activeScenario.durationLimitTicks - this.elapsedTicks);

    // Evaluate objectives
    this.evaluateObjectives();

    // Check triggers
    this.checkTriggers(this.elapsedTicks);

    // Evaluate Win / Loss conditions
    this._checkScenarioCompletion();
  }

  /**
   * Evaluate progress of all scenario objectives against current simulation state.
   */
  evaluateObjectives() {
    if (!this.activeScenario || !this.sim) return;

    // Retrieve corresponding scenario definition for original evaluator functions
    const origDef = this.scenarios.get(this.activeScenario.id);
    if (!origDef) return;

    let allPrimaryCompleted = true;

    for (let i = 0; i < this.activeScenario.objectives.length; i++) {
      const obj = this.activeScenario.objectives[i];
      const origObj = origDef.objectives[i];

      if (obj.status === OBJECTIVE_STATUS.COMPLETED) {
        continue;
      }

      // Execute evaluator function
      let val = 0;
      if (typeof origObj.evaluator === 'function') {
        try {
          val = origObj.evaluator(this.sim);
        } catch (err) {
          console.warn(`ScenarioEngine: Evaluator error for ${obj.id}`, err);
          val = obj.currentValue || 0;
        }
      } else {
        val = obj.currentValue || 0;
      }

      obj.currentValue = val;
      const progressPct = clamp((val / obj.targetValue) * 100, 0, 100);

      // Update state tracking map
      this.activeState.objectiveProgressMap[obj.id] = {
        status: obj.status,
        progressPct,
        currentValue: val,
        targetValue: obj.targetValue
      };

      // Check subtask progress
      if (obj.subtasks && origObj.subtasks) {
        for (let j = 0; j < obj.subtasks.length; j++) {
          const sub = obj.subtasks[j];
          const origSub = origObj.subtasks[j];
          if (typeof origSub.evaluator === 'function') {
            try {
              sub.current = origSub.evaluator(this.sim);
            } catch (err) {}
          } else {
            sub.current = Math.min(sub.target, Math.floor((val / obj.targetValue) * sub.target));
          }
          if (sub.current >= sub.target) {
            sub.status = OBJECTIVE_STATUS.COMPLETED;
          }
        }
      }

      // Completion check
      if (progressPct >= 100) {
        obj.status = OBJECTIVE_STATUS.COMPLETED;
        this.activeState.completedObjectives.push(obj.id);
        this.emit('objective_completed', { objectiveId: obj.id, objective: obj });
      } else if (obj.type === 'primary') {
        allPrimaryCompleted = false;
      }
    }
  }

  /**
   * Check scenario triggers (time milestones, metric conditions).
   * @param {number} elapsedTicks 
   */
  checkTriggers(elapsedTicks) {
    if (!this.activeScenario || !this.activeScenario.triggers) return;

    const origDef = this.scenarios.get(this.activeScenario.id);

    for (let i = 0; i < this.activeScenario.triggers.length; i++) {
      const trig = this.activeScenario.triggers[i];
      const origTrig = origDef ? origDef.triggers[i] : null;

      if (this.activeState.triggeredEvents.has(trig.id)) {
        continue;
      }

      let fire = false;
      if (trig.tick && elapsedTicks >= trig.tick) {
        fire = true;
      } else if (origTrig && typeof origTrig.condition === 'function') {
        try {
          fire = origTrig.condition(this.sim);
        } catch (err) {}
      }

      if (fire) {
        this.activeState.triggeredEvents.add(trig.id);
        this.triggerNarrativeEvent(trig, origTrig);
      }
    }
  }

  /**
   * Fire a narrative event dialog/trigger.
   * @param {Object} trig 
   * @param {Object} [origTrig] 
   */
  triggerNarrativeEvent(trig, origTrig = null) {
    const entry = {
      id: trig.id,
      title: trig.title,
      description: trig.description,
      type: trig.type,
      timestamp: Date.now(),
      tick: this.elapsedTicks
    };

    this.narrativeHistory.push(entry);

    // Execute trigger action callback if present
    if (origTrig && typeof origTrig.action === 'function' && this.sim) {
      try {
        origTrig.action(this.sim);
      } catch (err) {
        console.error(`ScenarioEngine: Error executing action for trigger ${trig.id}`, err);
      }
    }

    this.emit('narrative_event_triggered', entry);
  }

  /**
   * Handle player choice selection for interactive narrative choices.
   * @param {string} eventId 
   * @param {string} choiceId 
   */
  handlePlayerChoice(eventId, choiceId) {
    this.emit('player_choice_made', { eventId, choiceId, tick: this.elapsedTicks });
  }

  /**
   * Check overall win / loss conditions.
   * @private
   */
  _checkScenarioCompletion() {
    if (!this.activeScenario || this.activeState.status !== OBJECTIVE_STATUS.IN_PROGRESS) return;

    // Primary objectives win check
    const primaryObjs = this.activeScenario.objectives.filter(o => o.type === 'primary');
    const primaryCompleted = primaryObjs.every(o => o.status === OBJECTIVE_STATUS.COMPLETED);

    if (primaryCompleted) {
      this.completeScenario();
      return;
    }

    // Time limit defeat check
    if (this.activeState.ticksRemaining <= 0) {
      this.failScenario('Time limit expired before primary objectives completed.');
      return;
    }

    // Critical bankruptcy defeat check
    if (this.sim && this.sim.economy && this.sim.economy.treasury < -1000000) {
      this.failScenario('Unrecoverable city bankruptcy.');
    }
  }

  /**
   * Mark scenario as successfully completed.
   */
  completeScenario() {
    if (!this.activeScenario) return;

    this.activeState.status = OBJECTIVE_STATUS.COMPLETED;
    this.activeState.endTime = Date.now();

    // Auto payout rewards
    this.claimReward();

    this.emit('scenario_completed', {
      scenarioId: this.activeScenario.id,
      rewards: this.activeScenario.rewards,
      elapsedTicks: this.elapsedTicks,
      narrativeVictory: this.activeScenario.narrativeBrief ? this.activeScenario.narrativeBrief.victory : ''
    });
  }

  /**
   * Mark scenario as failed with reason.
   * @param {string} reason 
   */
  failScenario(reason = 'Objective failure.') {
    if (!this.activeScenario) return;

    this.activeState.status = OBJECTIVE_STATUS.FAILED;
    this.activeState.failReason = reason;
    this.activeState.endTime = Date.now();

    this.emit('scenario_failed', {
      scenarioId: this.activeScenario.id,
      reason,
      elapsedTicks: this.elapsedTicks,
      narrativeDefeat: this.activeScenario.narrativeBrief ? this.activeScenario.narrativeBrief.defeat : ''
    });
  }

  /**
   * Claim scenario completion reward payout.
   */
  claimReward() {
    if (!this.activeScenario || !this.activeScenario.rewards || this.activeState.claimedRewards) {
      return false;
    }

    const rewards = this.activeScenario.rewards;
    this.activeState.claimedRewards = true;

    if (this.sim && this.sim.economy && rewards.funds) {
      this.sim.economy.deposit(rewards.funds, `Scenario Reward: ${this.activeScenario.title}`);
    }

    this.emit('reward_claimed', { rewards, scenarioId: this.activeScenario.id });
    return true;
  }

  /**
   * Get detailed progress summary object for UI rendering.
   * @returns {Object|null}
   */
  getScenarioProgress() {
    if (!this.activeScenario || !this.activeState) return null;

    const totalObjs = this.activeScenario.objectives.length;
    const completedCount = this.activeState.completedObjectives.length;
    const overallProgressPct = totalObjs > 0 ? (completedCount / totalObjs) * 100 : 0;

    return {
      id: this.activeScenario.id,
      title: this.activeScenario.title,
      category: this.activeScenario.category,
      difficulty: this.activeScenario.difficulty,
      status: this.activeState.status,
      elapsedTicks: this.elapsedTicks,
      ticksRemaining: this.activeState.ticksRemaining,
      durationLimitTicks: this.activeScenario.durationLimitTicks,
      overallProgressPct,
      objectives: this.activeScenario.objectives.map(o => ({
        id: o.id,
        type: o.type,
        title: o.title,
        description: o.description,
        status: o.status,
        currentValue: o.currentValue,
        targetValue: o.targetValue,
        subtasks: o.subtasks || []
      })),
      narrativeBrief: this.activeScenario.narrativeBrief,
      narrativeHistory: this.narrativeHistory,
      rewards: this.activeScenario.rewards
    };
  }

  /**
   * Export scenario engine state for saving game.
   * @returns {Object}
   */
  exportState() {
    return {
      activeScenarioId: this.activeScenario ? this.activeScenario.id : null,
      activeState: this.activeState ? {
        ...this.activeState,
        triggeredEvents: Array.from(this.activeState.triggeredEvents)
      } : null,
      elapsedTicks: this.elapsedTicks,
      isPaused: this.isPaused,
      narrativeHistory: this.narrativeHistory
    };
  }

  /**
   * Restore scenario engine state from saved game.
   * @param {Object} stateData 
   */
  importState(stateData) {
    if (!stateData || !stateData.activeScenarioId) return;

    this.loadScenario(stateData.activeScenarioId);
    if (stateData.activeState) {
      this.activeState = {
        ...stateData.activeState,
        triggeredEvents: new Set(stateData.activeState.triggeredEvents || [])
      };
    }
    this.elapsedTicks = stateData.elapsedTicks || 0;
    this.isPaused = !!stateData.isPaused;
    this.narrativeHistory = stateData.narrativeHistory || [];
  }
}
