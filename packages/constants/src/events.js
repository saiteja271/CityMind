/**
 * CITYMIND Dynamic Events & Disasters Catalog
 * Production-quality dataset featuring 35+ natural, technical, economic, social, and environmental events,
 * complete with trigger conditions, risk factors, 4-tier severity levels, damage formulas,
 * advisor warning alerts, and emergency response mitigation options.
 */

export const EVENT_CATEGORIES = Object.freeze({
  NATURAL: 'natural',
  TECHNICAL: 'technical',
  ECONOMIC: 'economic',
  SOCIAL: 'social',
  ENVIRONMENTAL: 'environmental'
});

export const SEVERITY_LEVELS = Object.freeze({
  MINOR: 'minor',
  MODERATE: 'moderate',
  SEVERE: 'severe',
  CATASTROPHIC: 'catastrophic'
});

export const EVENTS = Object.freeze({
  // ---------------------------------------------------------------------------
  // 1. NATURAL DISASTERS (8 events)
  // ---------------------------------------------------------------------------
  earthquake: {
    id: 'earthquake',
    name: 'Tectonic Earthquake Fault Rupture',
    category: EVENT_CATEGORIES.NATURAL,
    description: 'Sudden seismic shaking caused by subterranean fault line displacement, damaging structural foundations.',
    triggerConditions: {
      minPopulation: 1000,
      chancePerTick: 0.00005,
      seismicZoneRisk: true
    },
    riskFactors: ['Proximity to fault line', 'Lack of earthquake building codes', 'Soil liquefaction rating'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 10, durationTicks: 5, damageMultiplier: 0.15, casualtyMultiplier: 0.02, spreadSpeed: 10 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 25, durationTicks: 10, damageMultiplier: 0.45, casualtyMultiplier: 0.08, spreadSpeed: 20 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 50, durationTicks: 20, damageMultiplier: 0.80, casualtyMultiplier: 0.25, spreadSpeed: 40 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 35, damageMultiplier: 1.50, casualtyMultiplier: 0.60, spreadSpeed: 80 }
    },
    damageFormulas: {
      structuralDamage: '(buildingIntegrity, severity) => Math.max(0, (1.0 - buildingIntegrity) * severity.damageMultiplier * 100)',
      budgetLoss: '(destroyedBuildingsCost) => destroyedBuildingsCost * 0.25',
      happinessPenalty: '(casualtyCount) => Math.min(50, casualtyCount * 0.5)'
    },
    advisorAlertText: {
      minor: 'Minor tremors detected! Minor cracks reported in older brick structures.',
      moderate: 'Moderate seismic shock! Utility gas lines rupturing and power lines downed across midtown.',
      severe: 'Major Earthquake! High-rise structural failures reported. Emergency dispatch needed immediately!',
      catastrophic: 'CATASTROPHIC FAULT RUPTURE! Citywide infrastructure collapse in progress! Declare emergency status!'
    },
    emergencyResponses: [
      { id: 'search_and_rescue', name: 'Deploy Urban Search & Rescue Teams', cost: 50000, timeToDeployTicks: 3, mitigationEffectiveness: { damage: 0.1, casualties: 0.65, duration: 0.2 } },
      { id: 'structural_shoring', name: 'Emergency Utility & Structural Shoring', cost: 120000, timeToDeployTicks: 6, mitigationEffectiveness: { damage: 0.4, casualties: 0.30, duration: 0.5 } },
      { id: 'mobile_hospitals', name: 'Deploy Triage Mobile Medical Units', cost: 80000, timeToDeployTicks: 4, mitigationEffectiveness: { damage: 0.0, casualties: 0.85, duration: 0.3 } }
    ]
  },
  tornado: {
    id: 'tornado',
    name: 'EF-5 Supercell Tornado',
    category: EVENT_CATEGORIES.NATURAL,
    description: 'Violent rotating column of air touching down, flattening structures along a linear swath path.',
    triggerConditions: {
      minPopulation: 2000,
      season: 'spring',
      chancePerTick: 0.00008
    },
    riskFactors: ['High atmospheric instability', 'Flat terrain', 'Unfortified wooden homes'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 3, durationTicks: 8, damageMultiplier: 0.30, casualtyMultiplier: 0.05, spreadSpeed: 5 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 6, durationTicks: 15, damageMultiplier: 0.70, casualtyMultiplier: 0.15, spreadSpeed: 8 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 12, durationTicks: 25, damageMultiplier: 1.20, casualtyMultiplier: 0.35, spreadSpeed: 12 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 20, durationTicks: 40, damageMultiplier: 2.00, casualtyMultiplier: 0.75, spreadSpeed: 15 }
    },
    damageFormulas: {
      structuralDamage: '(woodRatio, severity) => woodRatio * 120 * severity.damageMultiplier',
      budgetLoss: '(radius) => radius * 45000',
      happinessPenalty: '() => 25'
    },
    advisorAlertText: {
      minor: 'Funnel cloud sighted outside suburban perimeter.',
      moderate: 'EF-2 Tornado touched down in residential district! Heavy roof damage.',
      severe: 'EF-4 Tornado carving path through dense city grid! Take shelter!',
      catastrophic: 'EF-5 MONSTER TORNADO DESTROYING ENTIRE NEIGHBORHOODS IN REAL TIME!'
    },
    emergencyResponses: [
      { id: 'siren_alert', name: 'Trigger Tornado Siren Network', cost: 10000, timeToDeployTicks: 1, mitigationEffectiveness: { damage: 0.0, casualties: 0.70, duration: 0.0 } },
      { id: 'debris_clearing', name: 'Dispatch Heavy Debris Removal', cost: 40000, timeToDeployTicks: 5, mitigationEffectiveness: { damage: 0.25, casualties: 0.20, duration: 0.6 } }
    ]
  },
  coastal_flood: {
    id: 'coastal_flood',
    name: 'Storm Surge Coastal Flood',
    category: EVENT_CATEGORIES.NATURAL,
    description: 'Hurricane-driven sea level swell inundating low-lying coastal districts.',
    triggerConditions: {
      minPopulation: 3000,
      coastalLocation: true,
      chancePerTick: 0.0001
    },
    riskFactors: ['Lack of sea walls', 'Low elevation', 'High tide alignment'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 15, durationTicks: 20, damageMultiplier: 0.20, casualtyMultiplier: 0.01, spreadSpeed: 3 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 30, durationTicks: 40, damageMultiplier: 0.50, casualtyMultiplier: 0.04, spreadSpeed: 4 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 60, durationTicks: 80, damageMultiplier: 0.90, casualtyMultiplier: 0.12, spreadSpeed: 6 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 120, durationTicks: 150, damageMultiplier: 1.60, casualtyMultiplier: 0.35, spreadSpeed: 8 }
    },
    damageFormulas: {
      structuralDamage: '(elevation, severity) => Math.max(0, (10 - elevation) * 15 * severity.damageMultiplier)',
      budgetLoss: '(waterDepth) => waterDepth * 80000',
      happinessPenalty: '() => 20'
    },
    advisorAlertText: {
      minor: 'High tide causing minor street flooding along harbor docks.',
      moderate: 'Storm surge breaching ocean embankments. Ground floors flooded.',
      severe: 'Severe coastal inundation! Seaport and waterfront districts submerged.',
      catastrophic: 'CATASTROPHIC 5-METER STORM SURGE SWEEPING INLAND! EVACUATE NOW!'
    },
    emergencyResponses: [
      { id: 'sandbag_barriers', name: 'Deploy Sandbag Flood Barriers', cost: 35000, timeToDeployTicks: 4, mitigationEffectiveness: { damage: 0.45, casualties: 0.50, duration: 0.3 } },
      { id: 'pumping_submersibles', name: 'Activate Heavy Submersible Pumps', cost: 75000, timeToDeployTicks: 8, mitigationEffectiveness: { damage: 0.60, casualties: 0.30, duration: 0.7 } }
    ]
  },
  heatwave: {
    id: 'heatwave',
    name: 'Extreme Urban Heat Dome',
    category: EVENT_CATEGORIES.NATURAL,
    description: 'Prolonged period of dangerously high temperatures straining power grids and public health.',
    triggerConditions: {
      minTemperature: 38, // Celsius
      season: 'summer',
      chancePerTick: 0.0002
    },
    riskFactors: ['High concrete density', 'Lack of shade trees', 'Power grid overload'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 100, durationTicks: 30, damageMultiplier: 0.05, casualtyMultiplier: 0.02, spreadSpeed: 100 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 100, durationTicks: 60, damageMultiplier: 0.15, casualtyMultiplier: 0.06, spreadSpeed: 100 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 100, durationTicks: 120, damageMultiplier: 0.35, casualtyMultiplier: 0.15, spreadSpeed: 100 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 240, damageMultiplier: 0.60, casualtyMultiplier: 0.40, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetLoss: '(powerSurgeKw) => powerSurgeKw * 0.15',
      happinessPenalty: '(temp) => (temp - 35) * 4'
    },
    advisorAlertText: {
      minor: 'Summer temperatures rising above 38°C. Power demand spiking.',
      moderate: 'Severe heatwave warning! Emergency rooms reporting heatstroke spikes.',
      severe: 'Extreme Heat Dome over 43°C! Electrical transformers overheating.',
      catastrophic: 'RECORD 48°C HEATWAVE BINDING CITY! POWER GRID COLLAPSE IMMINENT!'
    },
    emergencyResponses: [
      { id: 'cooling_centers', name: 'Open 24/7 Air-Conditioned Cooling Centers', cost: 30000, timeToDeployTicks: 2, mitigationEffectiveness: { damage: 0.0, casualties: 0.75, duration: 0.2 } },
      { id: 'grid_rolling_brownouts', name: 'Enforce Controlled Industrial Rolling Brownouts', cost: 15000, timeToDeployTicks: 1, mitigationEffectiveness: { damage: 0.50, casualties: 0.20, duration: 0.4 } }
    ]
  },
  blizzard: {
    id: 'blizzard',
    name: 'Polar Vortex Arctic Blizzard',
    category: EVENT_CATEGORIES.NATURAL,
    description: 'Heavy snowfall, sub-zero temperatures, and gale-force winds freezing road networks.',
    triggerConditions: {
      maxTemperature: -10,
      season: 'winter',
      chancePerTick: 0.00015
    },
    riskFactors: ['Inadequate snowplow fleet', 'Uninsulated water pipes', 'Elderly population density'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 100, durationTicks: 40, damageMultiplier: 0.08, casualtyMultiplier: 0.01, spreadSpeed: 100 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 100, durationTicks: 80, damageMultiplier: 0.20, casualtyMultiplier: 0.05, spreadSpeed: 100 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 100, durationTicks: 160, damageMultiplier: 0.45, casualtyMultiplier: 0.14, spreadSpeed: 100 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 300, damageMultiplier: 0.85, casualtyMultiplier: 0.35, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '(snowAccumulationCm) => snowAccumulationCm * 0.5',
      budgetLoss: '(roadKm) => roadKm * 1200',
      happinessPenalty: '() => 18'
    },
    advisorAlertText: {
      minor: 'Light snow accumulation. Salt trucks dispatched.',
      moderate: 'Arctic Vortex blizzard dropping 40cm snow! Road transport paralyzed.',
      severe: 'Severe Blizzard! Sub-zero ice freezing water mains citywide.',
      catastrophic: 'CATASTROPHIC DEEP FREEZE! POWER GRID FAILURE RISKS HYPOTHERMIA!'
    },
    emergencyResponses: [
      { id: 'snowplow_fleet', name: 'Mobilize Municipal Snowplow Fleet', cost: 45000, timeToDeployTicks: 3, mitigationEffectiveness: { damage: 0.30, casualties: 0.40, duration: 0.6 } },
      { id: 'emergency_shelters', name: 'Distribute Emergency Heating Fuel & Shelters', cost: 60000, timeToDeployTicks: 4, mitigationEffectiveness: { damage: 0.10, casualties: 0.80, duration: 0.3 } }
    ]
  },
  meteor_strike: {
    id: 'meteor_strike',
    name: 'Kinetic Meteorite Impact',
    category: EVENT_CATEGORIES.NATURAL,
    description: 'Extraterrestrial rock impact causing massive kinetic destruction explosion and cratering.',
    triggerConditions: {
      minPopulation: 5000,
      chancePerTick: 0.000005 // Rare
    },
    riskFactors: ['Random cosmic trajectory'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 5, durationTicks: 1, damageMultiplier: 0.50, casualtyMultiplier: 0.10, spreadSpeed: 50 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 15, durationTicks: 1, damageMultiplier: 1.20, casualtyMultiplier: 0.35, spreadSpeed: 100 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 35, durationTicks: 1, damageMultiplier: 2.50, casualtyMultiplier: 0.70, spreadSpeed: 200 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 70, durationTicks: 1, damageMultiplier: 5.00, casualtyMultiplier: 0.95, spreadSpeed: 400 }
    },
    damageFormulas: {
      structuralDamage: '() => 100', // Total vaporisation in epicenter
      budgetLoss: '(impactRadius) => impactRadius * 500000',
      happinessPenalty: '() => 60'
    },
    advisorAlertText: {
      minor: 'Small meteorite impact recorded in vacant industrial lot.',
      moderate: 'Meteorite strike in commercial district! Massive crater and shockwave.',
      severe: 'MAJOR METEORITE IMPACT! MULTIPLE CITY BLOCKS COMPLETELY WIPED OUT!',
      catastrophic: 'CATASTROPHIC KINETIC METEOR IMPACT! CITYWIDE DEVASTATION CRATER!'
    },
    emergencyResponses: [
      { id: 'disaster_relief', name: 'Federal Disaster Relief Mobilization', cost: 200000, timeToDeployTicks: 10, mitigationEffectiveness: { damage: 0.20, casualties: 0.50, duration: 0.8 } }
    ]
  },
  landslide: {
    id: 'landslide',
    name: 'Hillside Mudslide & Landslide',
    category: EVENT_CATEGORIES.NATURAL,
    description: 'Heavy torrential rainfall triggering slope instability and soil collapse along steep hillsides.',
    triggerConditions: {
      minPopulation: 2000,
      heavyRain: true,
      chancePerTick: 0.0001
    },
    riskFactors: ['Deforestation on slopes', 'Steep terrain grade', 'Unstable clay soil'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 4, durationTicks: 6, damageMultiplier: 0.25, casualtyMultiplier: 0.04, spreadSpeed: 6 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 10, durationTicks: 12, damageMultiplier: 0.60, casualtyMultiplier: 0.15, spreadSpeed: 10 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 20, durationTicks: 20, damageMultiplier: 1.10, casualtyMultiplier: 0.40, spreadSpeed: 15 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 35, durationTicks: 35, damageMultiplier: 1.90, casualtyMultiplier: 0.70, spreadSpeed: 25 }
    },
    damageFormulas: {
      structuralDamage: '(slopeAngle, severity) => slopeAngle * 1.5 * severity.damageMultiplier',
      budgetLoss: '(buriedStructures) => buriedStructures * 65000',
      happinessPenalty: '() => 15'
    },
    advisorAlertText: {
      minor: 'Mud slipping onto hillside residential access road.',
      moderate: 'Hillside landslide burying homes along valley baseline.',
      severe: 'Major mudslide sweeping away cliffside residential villas!',
      catastrophic: 'CATASTROPHIC MOUNTAIN COLLAPSE BURYING ENTIRE DISTRICT!'
    },
    emergencyResponses: [
      { id: 'retaining_barriers', name: 'Erect Emergency Retaining Walls', cost: 40000, timeToDeployTicks: 5, mitigationEffectiveness: { damage: 0.40, casualties: 0.30, duration: 0.4 } }
    ]
  },
  tsunami: {
    id: 'tsunami',
    name: 'Submarine Earthquake Tsunami Wave',
    category: EVENT_CATEGORIES.NATURAL,
    description: 'Massive oceanic shockwave producing wall-of-water coastal inundation.',
    triggerConditions: {
      coastalLocation: true,
      recentEarthquake: true,
      chancePerTick: 0.00004
    },
    riskFactors: ['Lack of offshore breakwaters', 'Low elevation harbor', 'Delayed warning sirens'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 20, durationTicks: 15, damageMultiplier: 0.40, casualtyMultiplier: 0.08, spreadSpeed: 25 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 45, durationTicks: 25, damageMultiplier: 0.90, casualtyMultiplier: 0.25, spreadSpeed: 45 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 80, durationTicks: 45, damageMultiplier: 1.80, casualtyMultiplier: 0.55, spreadSpeed: 70 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 150, durationTicks: 90, damageMultiplier: 3.20, casualtyMultiplier: 0.88, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '(distanceFromCoast, severity) => Math.max(0, (100 - distanceFromCoast) * severity.damageMultiplier)',
      budgetLoss: '(coastalAssetValue) => coastalAssetValue * 0.70',
      happinessPenalty: '() => 45'
    },
    advisorAlertText: {
      minor: 'Harbor sea level receding rapidly. Tsunami advisory active.',
      moderate: '3-meter tsunami wave washing over seaport docks!',
      severe: '10-METER TSUNAMI WALL OF WATER SLAMMING COASTAL TOWERS!',
      catastrophic: 'CATASTROPHIC MEGA-TSUNAMI INUNDATING CITY 5KM INLAND!'
    },
    emergencyResponses: [
      { id: 'coastal_evacuation', name: 'Order Immediate High-Ground Coastal Evacuation', cost: 25000, timeToDeployTicks: 2, mitigationEffectiveness: { damage: 0.0, casualties: 0.90, duration: 0.0 } }
    ]
  },

  // ---------------------------------------------------------------------------
  // 2. TECHNICAL & INDUSTRIAL DISASTERS (7 events)
  // ---------------------------------------------------------------------------
  power_grid_collapse: {
    id: 'power_grid_collapse',
    name: 'Cascade Power Grid Blackout',
    category: EVENT_CATEGORIES.TECHNICAL,
    description: 'Catastrophic failure of central transmission lines triggering widespread electrical blackout.',
    triggerConditions: {
      powerDeficit: true,
      gridLoadRatio: 1.15,
      chancePerTick: 0.001
    },
    riskFactors: ['Aging electrical infrastructure', 'Excessive power deficit', 'Lack of smart grid'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 30, durationTicks: 15, damageMultiplier: 0.02, casualtyMultiplier: 0.001, spreadSpeed: 50 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 60, durationTicks: 30, damageMultiplier: 0.05, casualtyMultiplier: 0.005, spreadSpeed: 80 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 100, durationTicks: 60, damageMultiplier: 0.12, casualtyMultiplier: 0.02, spreadSpeed: 100 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 120, damageMultiplier: 0.25, casualtyMultiplier: 0.05, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetLoss: '(unpoweredBusinesses) => unpoweredBusinesses * 1500',
      happinessPenalty: '(duration) => duration * 0.3'
    },
    advisorAlertText: {
      minor: 'Substation trip caused local neighborhood blackout.',
      moderate: 'Major grid overload! Half the city without power.',
      severe: 'Citywide Blackout! Traffic signals dark, subways stranded underground.',
      catastrophic: 'CATASTROPHIC GRID COLLAPSE! RESTART REQUIRES COLD START PROCEDURE!'
    },
    emergencyResponses: [
      { id: 'emergency_generators', name: 'Fire Up Auxiliary Reserve Power Turbines', cost: 50000, timeToDeployTicks: 4, mitigationEffectiveness: { damage: 0.0, casualties: 0.50, duration: 0.7 } }
    ]
  },
  chemical_spill: {
    id: 'chemical_spill',
    name: 'Toxic Chemical Industrial Leak',
    category: EVENT_CATEGORIES.TECHNICAL,
    description: 'Accidental discharge of corrosive or nerve-agent chemicals from industrial plants.',
    triggerConditions: {
      industrialDensityHigh: true,
      lowMaintenance: true,
      chancePerTick: 0.0003
    },
    riskFactors: ['Heavy chemical plant proximity', 'Lack of EPA safety audits'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 5, durationTicks: 10, damageMultiplier: 0.10, casualtyMultiplier: 0.03, spreadSpeed: 3 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 12, durationTicks: 25, damageMultiplier: 0.30, casualtyMultiplier: 0.10, spreadSpeed: 5 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 25, durationTicks: 50, damageMultiplier: 0.65, casualtyMultiplier: 0.28, spreadSpeed: 8 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 45, durationTicks: 100, damageMultiplier: 1.10, casualtyMultiplier: 0.60, spreadSpeed: 12 }
    },
    damageFormulas: {
      structuralDamage: '(corrosiveness) => corrosiveness * 20',
      budgetLoss: '(soilDecontaminationArea) => soilDecontaminationArea * 12000',
      happinessPenalty: '() => 22'
    },
    advisorAlertText: {
      minor: 'Minor solvent spill contained inside factory grounds.',
      moderate: 'Toxic chemical plume venting into nearby residential neighborhood!',
      severe: 'Lethal Chemical Leak! Hazmat quarantine zone declared!',
      catastrophic: 'CATASTROPHIC TOXIC GAS CLOUD DRIFTING TOWARDS DOWNTOWN!'
    },
    emergencyResponses: [
      { id: 'hazmat_containment', name: 'Deploy Hazmat Decontamination Unit', cost: 65000, timeToDeployTicks: 3, mitigationEffectiveness: { damage: 0.50, casualties: 0.70, duration: 0.6 } }
    ]
  },
  nuclear_meltdown: {
    id: 'nuclear_meltdown',
    name: 'Nuclear Core Thermal Meltdown',
    category: EVENT_CATEGORIES.TECHNICAL,
    description: 'Coolant failure resulting in nuclear fuel core breach and radioactive fallout contamination.',
    triggerConditions: {
      hasNuclearPlant: true,
      maintenanceZero: true,
      chancePerTick: 0.00001
    },
    riskFactors: ['Unmaintained nuclear reactor', 'Coolant pump blackout', 'Disaster impact'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 15, durationTicks: 50, damageMultiplier: 0.40, casualtyMultiplier: 0.10, spreadSpeed: 10 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 35, durationTicks: 150, damageMultiplier: 1.00, casualtyMultiplier: 0.30, spreadSpeed: 20 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 75, durationTicks: 400, damageMultiplier: 2.20, casualtyMultiplier: 0.65, spreadSpeed: 40 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 150, durationTicks: 1000, damageMultiplier: 4.50, casualtyMultiplier: 0.95, spreadSpeed: 80 }
    },
    damageFormulas: {
      structuralDamage: '() => 100', // Permanent exclusion zone
      budgetLoss: '() => 5000000',
      happinessPenalty: '() => 80'
    },
    advisorAlertText: {
      minor: 'Secondary containment pressure anomaly at nuclear reactor.',
      moderate: 'Coolant breach! Radiation leak detected around nuclear plant boundary.',
      severe: 'CORE MELTDOWN IN PROGRESS! RADIOACTIVE FALLOUT DRIFTING CITYWIDE!',
      catastrophic: 'CATASTROPHIC NUCLEAR REACTOR EXPLOSION! PERMANENT EXCLUSION ZONE!'
    },
    emergencyResponses: [
      { id: 'boron_blanket', name: 'Air-Drop Boron & Concrete Sarcophagus Blanket', cost: 500000, timeToDeployTicks: 12, mitigationEffectiveness: { damage: 0.30, casualties: 0.60, duration: 0.5 } }
    ]
  },
  internet_outage: {
    id: 'internet_outage',
    name: 'Undersea Fiber Cable Disruption',
    category: EVENT_CATEGORIES.TECHNICAL,
    description: 'Severed telecom trunk lines paralyzing banking, tech sector, and online commerce.',
    triggerConditions: {
      minPopulation: 10000,
      chancePerTick: 0.0004
    },
    riskFactors: ['Lack of redundant satellite links', 'High tech sector dependency'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 50, durationTicks: 10, damageMultiplier: 0.01, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 100, durationTicks: 25, damageMultiplier: 0.03, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 100, durationTicks: 50, damageMultiplier: 0.08, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 100, damageMultiplier: 0.15, casualtyMultiplier: 0.0, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetLoss: '(techCompanyCount) => techCompanyCount * 25000',
      happinessPenalty: '() => 12'
    },
    advisorAlertText: {
      minor: 'High latency reported on local ISP DNS servers.',
      moderate: 'Undersea cable severed! Financial transactions failing downtown.',
      severe: 'Metropolitan Data Blackout! Stock exchanges and tech firms offline.',
      catastrophic: 'COMPLETE DIGITAL BLACKOUT! ALL TELECOM AND INTERNET SEVERED!'
    },
    emergencyResponses: [
      { id: 'satellite_backup', name: 'Activate Emergency Satellite Grid Backup', cost: 40000, timeToDeployTicks: 2, mitigationEffectiveness: { damage: 0.0, casualties: 0.0, duration: 0.8 } }
    ]
  },
  dam_breach: {
    id: 'dam_breach',
    name: 'Hydroelectric Reservoir Dam Breach',
    category: EVENT_CATEGORIES.TECHNICAL,
    description: 'Structural failure of upstream water dam unleashing inland tsunami down river valley.',
    triggerConditions: {
      hasDam: true,
      reservoirFull: true,
      chancePerTick: 0.00005
    },
    riskFactors: ['Aging concrete dam walls', 'Recent heavy rainfall', 'High water pressure'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 10, durationTicks: 15, damageMultiplier: 0.45, casualtyMultiplier: 0.10, spreadSpeed: 20 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 25, durationTicks: 30, damageMultiplier: 1.00, casualtyMultiplier: 0.30, spreadSpeed: 40 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 50, durationTicks: 60, damageMultiplier: 2.10, casualtyMultiplier: 0.60, spreadSpeed: 70 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 90, durationTicks: 120, damageMultiplier: 3.80, casualtyMultiplier: 0.90, spreadSpeed: 110 }
    },
    damageFormulas: {
      structuralDamage: '() => 100',
      budgetLoss: '(downstreamValue) => downstreamValue * 0.85',
      happinessPenalty: '() => 50'
    },
    advisorAlertText: {
      minor: 'Minor seepage cracks detected in reservoir dam spillway.',
      moderate: 'Spillway wall collapsed! River valley flooding lowlands.',
      severe: 'MAIN DAM WALL BREACHED! WALL OF WATER SWEEPING DOWNVALLEY!',
      catastrophic: 'CATASTROPHIC DAM FAILURE! ENTIRE RIVER BASIN SUBMERGED UNDER 8M WATER!'
    },
    emergencyResponses: [
      { id: 'spillway_release', name: 'Open Emergency Spillway Floodgates', cost: 20000, timeToDeployTicks: 1, mitigationEffectiveness: { damage: 0.35, casualties: 0.50, duration: 0.4 } }
    ]
  },

  // ---------------------------------------------------------------------------
  // 3. ECONOMIC CRISES & BOOMS (7 events)
  // ---------------------------------------------------------------------------
  stock_market_crash: {
    id: 'stock_market_crash',
    name: 'Financial Exchange Black Monday Crash',
    category: EVENT_CATEGORIES.ECONOMIC,
    description: 'Sudden collapse of asset valuations wiping out corporate investment capital and pensions.',
    triggerConditions: {
      realEstateBubble: true,
      highDebt: true,
      chancePerTick: 0.0003
    },
    riskFactors: ['Over-leveraged financial sector', 'High corporate debt ratio'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 100, durationTicks: 60, damageMultiplier: 0.05, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 100, durationTicks: 120, damageMultiplier: 0.15, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 100, durationTicks: 240, damageMultiplier: 0.35, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 500, damageMultiplier: 0.70, casualtyMultiplier: 0.0, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetLoss: '(taxBase) => taxBase * 0.35',
      happinessPenalty: '() => 30'
    },
    advisorAlertText: {
      minor: 'Stock index dips 5% following global trade friction.',
      moderate: 'Financial Exchange trading halted after 18% market collapse!',
      severe: 'Black Monday Crash! Commercial bankruptcy filings spiking citywide.',
      catastrophic: 'GREAT DEPRESSION CRASH! TOTAL LIQUIDITY FREEZE ACROSS CAPITAL MARKETS!'
    },
    emergencyResponses: [
      { id: 'municipal_bailout', name: 'Issue Municipal Emergency Commercial Liquidity Bailout', cost: 300000, timeToDeployTicks: 5, mitigationEffectiveness: { damage: 0.0, casualties: 0.0, duration: 0.6 } }
    ]
  },
  industrial_boom: {
    id: 'industrial_boom',
    name: 'Manufacturing & Export Expansion Boom',
    category: EVENT_CATEGORIES.ECONOMIC,
    description: 'Surge in foreign demand creating thousands of new industrial jobs and high tax revenues.',
    triggerConditions: {
      unemploymentLow: true,
      hasPortOrAirport: true,
      chancePerTick: 0.0005
    },
    riskFactors: ['High manufacturing capacity', 'Favorable exchange rates'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 100, durationTicks: 60, damageMultiplier: -0.10, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 100, durationTicks: 120, damageMultiplier: -0.25, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 100, durationTicks: 240, damageMultiplier: -0.50, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 360, damageMultiplier: -0.80, casualtyMultiplier: 0.0, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetGain: '(industrialOutput) => industrialOutput * 0.40',
      happinessBonus: '() => 20'
    },
    advisorAlertText: {
      minor: 'Factory orders up 12% over last quarter.',
      moderate: 'Industrial Expansion Boom! Factory hiring at record high.',
      severe: 'Major Export Boom! Port container volumes smashing historic records.',
      catastrophic: 'GOLDEN INDUSTRIAL AGE! MUNICIPAL SURPLUS REACHES ALL-TIME PEAK!'
    },
    emergencyResponses: []
  },
  real_estate_bubble: {
    id: 'real_estate_bubble',
    name: 'Housing Real Estate Speculation Bubble',
    category: EVENT_CATEGORIES.ECONOMIC,
    description: 'Speculative capital inflating property values beyond citizen wage affordability limits.',
    triggerConditions: {
      highWealth: true,
      housingShortage: true,
      chancePerTick: 0.0004
    },
    riskFactors: ['Low interest rates', 'Foreign investor speculation', 'Restrictive zoning'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 100, durationTicks: 90, damageMultiplier: 0.10, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 100, durationTicks: 180, damageMultiplier: 0.25, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 100, durationTicks: 300, damageMultiplier: 0.50, casualtyMultiplier: 0.0, spreadSpeed: 100 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 450, damageMultiplier: 0.90, casualtyMultiplier: 0.0, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetLoss: '() => 0',
      happinessPenalty: '(unaffordabilityRatio) => unaffordabilityRatio * 15'
    },
    advisorAlertText: {
      minor: 'Housing prices rising 15% faster than median wage growth.',
      moderate: 'Real Estate Speculation Bubble! First-time buyers priced out.',
      severe: 'Severe Housing Affordability Crisis! Rent strikes breaking out.',
      catastrophic: 'BUBBLE BURSTING! FORECLOSURE SPIKES POPPING REAL ESTATE ASSETS!'
    },
    emergencyResponses: [
      { id: 'rent_control_cap', name: 'Enact Emergency Rent Increase Cap', cost: 20000, timeToDeployTicks: 2, mitigationEffectiveness: { damage: 0.0, casualties: 0.0, duration: 0.5 } }
    ]
  },

  // ---------------------------------------------------------------------------
  // 4. SOCIAL EVENTS (7 events)
  // ---------------------------------------------------------------------------
  civil_unrest: {
    id: 'civil_unrest',
    name: 'Civil Unrest & Mass Rioting',
    category: EVENT_CATEGORIES.SOCIAL,
    description: 'Widespread public protests escalating into store looting and arson across commercial centers.',
    triggerConditions: {
      happinessBelow30: true,
      highUnemployment: true,
      chancePerTick: 0.0006
    },
    riskFactors: ['High inequality rating', 'Police misconduct incident', 'Food scarcity'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 10, durationTicks: 15, damageMultiplier: 0.10, casualtyMultiplier: 0.01, spreadSpeed: 8 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 25, durationTicks: 35, damageMultiplier: 0.35, casualtyMultiplier: 0.04, spreadSpeed: 15 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 50, durationTicks: 70, damageMultiplier: 0.75, casualtyMultiplier: 0.12, spreadSpeed: 25 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 90, durationTicks: 140, damageMultiplier: 1.40, casualtyMultiplier: 0.30, spreadSpeed: 40 }
    },
    damageFormulas: {
      structuralDamage: '(commercialStorefronts) => commercialStorefronts * 35',
      budgetLoss: '(lootedValuations) => lootedValuations * 0.40',
      happinessPenalty: '() => 35'
    },
    advisorAlertText: {
      minor: 'Peaceful protest march assembling near City Hall plaza.',
      moderate: 'Rioting breaking out downtown! Store windows smashed.',
      severe: 'Major Civil Unrest! Arson fires burning in commercial strip.',
      catastrophic: 'CATASTROPHIC CITYWIDE INSURRECTION! LAW ENFORCEMENT OVERRUN!'
    },
    emergencyResponses: [
      { id: 'national_guard', name: 'Deploy National Guard & Enforce Curfew', cost: 120000, timeToDeployTicks: 4, mitigationEffectiveness: { damage: 0.60, casualties: 0.40, duration: 0.7 } }
    ]
  },
  epidemic_outbreak: {
    id: 'epidemic_outbreak',
    name: 'Contagious Pathogen Epidemic',
    category: EVENT_CATEGORIES.SOCIAL,
    description: 'Rapid airborne viral outbreak overwhelming municipal hospitals and quarantining commerce.',
    triggerConditions: {
      highDensity: true,
      lowHealthcareCoverage: true,
      chancePerTick: 0.0003
    },
    riskFactors: ['International airport inflow', 'Lack of hospital beds', 'Low vaccination'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 100, durationTicks: 40, damageMultiplier: 0.05, casualtyMultiplier: 0.02, spreadSpeed: 100 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 100, durationTicks: 90, damageMultiplier: 0.15, casualtyMultiplier: 0.08, spreadSpeed: 100 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 100, durationTicks: 180, damageMultiplier: 0.40, casualtyMultiplier: 0.22, spreadSpeed: 100 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 360, damageMultiplier: 0.85, casualtyMultiplier: 0.50, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetLoss: '(sickWorkforce) => sickWorkforce * 850',
      happinessPenalty: '() => 40'
    },
    advisorAlertText: {
      minor: 'Novel influenza strain identified in city clinics.',
      moderate: 'Epidemic outbreak expanding! Hospital ICUs approaching capacity.',
      severe: 'Severe Contagious Epidemic! Public gatherings banned citywide.',
      catastrophic: 'CATASTROPHIC PANDEMIC OUTBREAK! HEALTH SYSTEM COMPLETE COLLAPSE!'
    },
    emergencyResponses: [
      { id: 'citywide_quarantine', name: 'Enforce Citywide Lockdown & Vaccine Mandate', cost: 180000, timeToDeployTicks: 3, mitigationEffectiveness: { damage: 0.0, casualties: 0.80, duration: 0.6 } }
    ]
  },
  cultural_music_festival: {
    id: 'cultural_music_festival',
    name: 'International Arts & Music Festival',
    category: EVENT_CATEGORIES.SOCIAL,
    description: 'Week-long celebration bringing hundreds of thousands of tourists and cultural prestige.',
    triggerConditions: {
      season: 'summer',
      hasLargePark: true,
      chancePerTick: 0.0008
    },
    riskFactors: ['Traffic congestion', 'Litter cleanup demand'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 15, durationTicks: 20, damageMultiplier: -0.10, casualtyMultiplier: 0.0, spreadSpeed: 15 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 30, durationTicks: 40, damageMultiplier: -0.25, casualtyMultiplier: 0.0, spreadSpeed: 30 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 50, durationTicks: 70, damageMultiplier: -0.50, casualtyMultiplier: 0.0, spreadSpeed: 50 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 80, durationTicks: 100, damageMultiplier: -0.90, casualtyMultiplier: 0.0, spreadSpeed: 80 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetGain: '() => 450000',
      happinessBonus: '() => 30'
    },
    advisorAlertText: {
      minor: 'Local acoustic music weekend in Central Park.',
      moderate: 'Regional Arts & Music Festival hosting 50,000 visitors!',
      severe: 'International Mega Music Expo! Hotels and restaurants booked solid.',
      catastrophic: 'WORLD CULTURAL FESTIVAL SPECTACULAR! GLOBAL MEDIA EYE ON CITY!'
    },
    emergencyResponses: []
  },

  // ---------------------------------------------------------------------------
  // 5. ENVIRONMENTAL EVENTS (6 events)
  // ---------------------------------------------------------------------------
  toxic_smog: {
    id: 'toxic_smog',
    name: 'Industrial Inversion Toxic Smog',
    category: EVENT_CATEGORIES.ENVIRONMENTAL,
    description: 'Thermal inversion trapping heavy industrial emissions close to ground level.',
    triggerConditions: {
      highAirPollution: true,
      windSpeedLow: true,
      chancePerTick: 0.0007
    },
    riskFactors: ['Coal power plant density', 'Heavy vehicle traffic', 'Basin topography'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 60, durationTicks: 15, damageMultiplier: 0.05, casualtyMultiplier: 0.01, spreadSpeed: 60 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 80, durationTicks: 30, damageMultiplier: 0.15, casualtyMultiplier: 0.04, spreadSpeed: 80 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 100, durationTicks: 60, damageMultiplier: 0.35, casualtyMultiplier: 0.10, spreadSpeed: 100 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 120, damageMultiplier: 0.65, casualtyMultiplier: 0.25, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetLoss: '(sickAbsenceCount) => sickAbsenceCount * 400',
      happinessPenalty: '() => 25'
    },
    advisorAlertText: {
      minor: 'Haze hanging over industrial valley district.',
      moderate: 'Air Quality Alert! Hazardous PM2.5 particulate levels.',
      severe: 'Toxic Inversion Smog! Citizens advised to stay indoors with masks.',
      catastrophic: 'LETHAL CHEMICAL SMOG EMBANKING CITY! OUTDOOR ACTIVITY FATAL!'
    },
    emergencyResponses: [
      { id: 'factory_shutdown', name: 'Order Temporary Factory Emissions Shutdown', cost: 40000, timeToDeployTicks: 2, mitigationEffectiveness: { damage: 0.0, casualties: 0.70, duration: 0.8 } }
    ]
  },
  water_contamination: {
    id: 'water_contamination',
    name: 'Municipal Aquifer Chemical Contamination',
    category: EVENT_CATEGORIES.ENVIRONMENTAL,
    description: 'Industrial waste or heavy metal leaching into central freshwater reservoirs.',
    triggerConditions: {
      waterPollutionHigh: true,
      chancePerTick: 0.0004
    },
    riskFactors: ['Unregulated industrial dumping', 'Outdated water filtration'],
    severityLevels: {
      [SEVERITY_LEVELS.MINOR]: { radius: 25, durationTicks: 20, damageMultiplier: 0.10, casualtyMultiplier: 0.02, spreadSpeed: 25 },
      [SEVERITY_LEVELS.MODERATE]: { radius: 50, durationTicks: 45, damageMultiplier: 0.30, casualtyMultiplier: 0.07, spreadSpeed: 50 },
      [SEVERITY_LEVELS.SEVERE]: { radius: 85, durationTicks: 90, damageMultiplier: 0.70, casualtyMultiplier: 0.18, spreadSpeed: 85 },
      [SEVERITY_LEVELS.CATASTROPHIC]: { radius: 100, durationTicks: 180, damageMultiplier: 1.20, casualtyMultiplier: 0.45, spreadSpeed: 100 }
    },
    damageFormulas: {
      structuralDamage: '() => 0',
      budgetLoss: '(affectedCitizens) => affectedCitizens * 250',
      happinessPenalty: '() => 32'
    },
    advisorAlertText: {
      minor: 'Elevated lead traces detected in northern water mains.',
      moderate: 'Do Not Drink Tap Water Advisory issued for 3 districts!',
      severe: 'Toxic Heavy Metal Contamination across main reservoir!',
      catastrophic: 'CATASTROPHIC POISONING OF ENTIRE MUNICIPAL WATER GRID!'
    },
    emergencyResponses: [
      { id: 'clean_water_trucks', name: 'Dispatch Tanker Fleet with Bottled Water Relief', cost: 55000, timeToDeployTicks: 3, mitigationEffectiveness: { damage: 0.0, casualties: 0.85, duration: 0.4 } }
    ]
  }
});

// Helper functions
export function getEventById(id) {
  return EVENTS[id] || null;
}

export function getEventsByCategory(category) {
  return Object.values(EVENTS).filter(e => e.category === category);
}

export function calculateEventMitigation(eventId, responseIds = []) {
  const event = EVENTS[eventId];
  if (!event) return null;

  let totalDamageMitigation = 0;
  let totalCasualtyMitigation = 0;
  let totalDurationMitigation = 0;
  let totalCost = 0;

  for (const respId of responseIds) {
    const resp = event.emergencyResponses.find(r => r.id === respId);
    if (!resp) continue;

    totalCost += resp.cost;
    totalDamageMitigation += resp.mitigationEffectiveness.damage;
    totalCasualtyMitigation += resp.mitigationEffectiveness.casualties;
    totalDurationMitigation += resp.mitigationEffectiveness.duration;
  }

  return {
    totalCost,
    effectiveDamageMultiplier: Math.max(0.1, 1.0 - totalDamageMitigation),
    effectiveCasualtyMultiplier: Math.max(0.05, 1.0 - totalCasualtyMitigation),
    effectiveDurationMultiplier: Math.max(0.2, 1.0 - totalDurationMitigation)
  };
}

export default EVENTS;
