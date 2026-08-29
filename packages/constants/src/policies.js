/**
 * CITYMIND City Policies & Legislation Constants
 * Production-quality dataset featuring 50+ city policies across 6 major policy sectors,
 * complete with cost structures, prerequisites, approval ratings, stat effect matrices,
 * compliance formulas, and secondary side-effects.
 */

export const POLICY_CATEGORIES = Object.freeze({
  TAXATION: 'taxation',
  ENVIRONMENT: 'environment',
  PUBLIC_SAFETY: 'public_safety',
  SOCIAL_WELFARE: 'social_welfare',
  INFRASTRUCTURE: 'infrastructure',
  COMMERCE: 'commerce'
});

export const POLICIES = Object.freeze({
  // ---------------------------------------------------------------------------
  // 1. TAXATION CATEGORY (9 policies)
  // ---------------------------------------------------------------------------
  progressive_income_tax: {
    id: 'progressive_income_tax',
    name: 'Progressive Income Tax Brackets',
    category: POLICY_CATEGORIES.TAXATION,
    description: 'Establishes tiered tax rates for high earners while offering tax relief to lower income households.',
    monthlyCost: 15000,
    enactmentCost: 50000,
    requiredCityLevel: 2,
    minPopulation: 5000,
    voterApprovalBase: 65,
    effects: {
      budgetRevenueMultiplier: 1.25,
      happinessLowIncomeBonus: 10,
      happinessHighIncomePenalty: -12,
      wealthInequalityReduction: 0.15,
      businessGrowthMultiplier: 0.95
    },
    complianceFormula: '(population, taxRate) => Math.min(0.98, 1.0 - (taxRate * 0.4))',
    sideEffects: ['Minor capital flight among ultra-wealthy residents.', 'Increased tax administration compliance overhead.']
  },
  corporate_tax_break: {
    id: 'corporate_tax_break',
    name: 'Corporate Innovation Tax Exemption',
    category: POLICY_CATEGORIES.TAXATION,
    description: 'Reduces corporate tax rates to attract multinational tech hubs and commercial headquarters.',
    monthlyCost: 50000,
    enactmentCost: 120000,
    requiredCityLevel: 3,
    minPopulation: 15000,
    voterApprovalBase: 42,
    effects: {
      budgetRevenueMultiplier: 0.82,
      businessGrowthMultiplier: 1.40,
      jobCreationMultiplier: 1.30,
      commercialZoneDemand: 0.35,
      happinessBonus: -5
    },
    complianceFormula: '() => 0.99',
    sideEffects: ['Increased income disparity.', 'Loss of municipal revenue during economic downturns.']
  },
  land_value_tax: {
    id: 'land_value_tax',
    name: 'Unimproved Land Value Tax',
    category: POLICY_CATEGORIES.TAXATION,
    description: 'Taxes the unimproved location value of land rather than building structures, penalizing land speculation.',
    monthlyCost: 20000,
    enactmentCost: 75000,
    requiredCityLevel: 3,
    minPopulation: 10000,
    voterApprovalBase: 58,
    effects: {
      budgetRevenueMultiplier: 1.15,
      highDensityDevelopmentBonus: 0.25,
      landSpeculationPenalty: -0.80,
      housingAffordabilityBonus: 8
    },
    complianceFormula: '(landValue) => Math.max(0.70, 1.0 - (landValue * 0.0001))',
    sideEffects: ['Rapid redevelopment of vacant lots.', 'Resistance from real estate holding firms.']
  },
  carbon_tax_mandate: {
    id: 'carbon_tax_mandate',
    name: 'Industrial Carbon Tax & Offset',
    category: POLICY_CATEGORIES.TAXATION,
    description: 'Imposes a monetary penalty per ton of greenhouse gases emitted by industrial facilities.',
    monthlyCost: 25000,
    enactmentCost: 90000,
    requiredCityLevel: 4,
    minPopulation: 25000,
    voterApprovalBase: 62,
    effects: {
      budgetRevenueMultiplier: 1.10,
      industrialPollutionAirReduction: 0.30,
      cleanEnergyAdoptionMultiplier: 1.50,
      heavyIndustryGrowthMultiplier: 0.85
    },
    complianceFormula: '(emissionsCap) => Math.min(0.95, 0.60 + (emissionsCap * 0.01))',
    sideEffects: ['Heavy industrial relocations to outer regions.', 'Stimulates green tech investment.']
  },
  wealth_tax: {
    id: 'wealth_tax',
    name: 'Net Worth Wealth Tax Levy',
    category: POLICY_CATEGORIES.TAXATION,
    description: 'Applies an annual tax rate on individual net assets exceeding $5M.',
    monthlyCost: 40000,
    enactmentCost: 150000,
    requiredCityLevel: 5,
    minPopulation: 50000,
    voterApprovalBase: 70,
    effects: {
      budgetRevenueMultiplier: 1.35,
      happinessBonus: 6,
      luxuryHousingDemand: -0.25,
      capitalFlightRisk: 0.18
    },
    complianceFormula: '(enforcementLevel) => 0.50 + (enforcementLevel * 0.40)',
    sideEffects: ['Offshore tax evasion attempts.', 'Significant revenue for public welfare programs.']
  },
  congestion_tax: {
    id: 'congestion_tax',
    name: 'Downtown Congestion Zone Toll',
    category: POLICY_CATEGORIES.TAXATION,
    description: 'Charges private vehicles daily tolls for entering dense commercial downtown districts during peak hours.',
    monthlyCost: 18000,
    enactmentCost: 60000,
    requiredCityLevel: 3,
    minPopulation: 20000,
    voterApprovalBase: 48,
    effects: {
      budgetRevenueMultiplier: 1.08,
      downtownTrafficReduction: 0.35,
      publicTransportRidership: 0.28,
      downtownAirPollutionReduction: 0.22
    },
    complianceFormula: '(tollRate) => Math.max(0.80, 1.0 - (tollRate * 0.02))',
    sideEffects: ['Initial backlash from suburban commuters.', 'Boosts retail foot traffic near transit hubs.']
  },
  luxury_goods_tax: {
    id: 'luxury_goods_tax',
    name: 'Luxury Consumption Tax Levy',
    category: POLICY_CATEGORIES.TAXATION,
    description: 'Adds a 15% sales tax on high-end luxury items, sports cars, and private yachts.',
    monthlyCost: 10000,
    enactmentCost: 30000,
    requiredCityLevel: 2,
    minPopulation: 8000,
    voterApprovalBase: 72,
    effects: {
      budgetRevenueMultiplier: 1.06,
      luxuryRetailDemand: -0.10,
      happinessBonus: 2
    },
    complianceFormula: '() => 0.94',
    sideEffects: ['Cross-border shopping by wealthy residents.']
  },
  vacancy_tax: {
    id: 'vacancy_tax',
    name: 'Unoccupied Property Vacancy Surcharge',
    category: POLICY_CATEGORIES.TAXATION,
    description: 'Penalizes residential and commercial owners who leave properties vacant for over 6 months.',
    monthlyCost: 12000,
    enactmentCost: 45000,
    requiredCityLevel: 3,
    minPopulation: 12000,
    voterApprovalBase: 80,
    effects: {
      rentalSupplyIncrease: 0.18,
      housingCostReduction: 0.08,
      budgetRevenueMultiplier: 1.04
    },
    complianceFormula: '() => 0.88',
    sideEffects: ['Forces landlord lease price reductions.']
  },
  financial_transaction_tax: {
    id: 'financial_transaction_tax',
    name: 'Stock & Derivatives Trading Fee',
    category: POLICY_CATEGORIES.TAXATION,
    description: 'Levies a 0.1% tax on high-frequency financial trading transactions within city exchanges.',
    monthlyCost: 30000,
    enactmentCost: 100000,
    requiredCityLevel: 5,
    minPopulation: 60000,
    voterApprovalBase: 64,
    effects: {
      budgetRevenueMultiplier: 1.20,
      speculativeVolatileTradingReduction: 0.40,
      financialSectorGrowthMultiplier: 0.92
    },
    complianceFormula: '() => 0.99',
    sideEffects: ['Trading volume shifts to automated dark pools outside city limits.']
  },

  // ---------------------------------------------------------------------------
  // 2. ENVIRONMENT CATEGORY (9 policies)
  // ---------------------------------------------------------------------------
  green_building_mandate: {
    id: 'green_building_mandate',
    name: 'LEED-Certified Green Construction Standard',
    category: POLICY_CATEGORIES.ENVIRONMENT,
    description: 'Requires all new commercial and residential developments to achieve high energy efficiency ratings.',
    monthlyCost: 30000,
    enactmentCost: 100000,
    requiredCityLevel: 3,
    minPopulation: 15000,
    voterApprovalBase: 70,
    effects: {
      buildingPowerConsumption: 0.80,
      buildingWaterConsumption: 0.85,
      constructionCostMultiplier: 1.12,
      cityPollutionDecayBonus: 0.15,
      happinessBonus: 8
    },
    complianceFormula: '(inspectionRate) => Math.min(0.96, 0.70 + (inspectionRate * 0.3))',
    sideEffects: ['Slight increase in initial building construction times.']
  },
  renewable_energy_subsidy: {
    id: 'renewable_energy_subsidy',
    name: 'Solar & Wind Micro-Generation Rebate',
    category: POLICY_CATEGORIES.ENVIRONMENT,
    description: 'Provides municipal rebates for property owners installing solar panels or wind turbines.',
    monthlyCost: 80000,
    enactmentCost: 200000,
    requiredCityLevel: 3,
    minPopulation: 10000,
    voterApprovalBase: 82,
    effects: {
      gridPowerDemand: 0.75,
      renewableEnergyAdoption: 0.60,
      airPollutionReduction: 0.20,
      happinessBonus: 10
    },
    complianceFormula: '() => 0.98',
    sideEffects: ['Accelerates decentralized power grid resilience.']
  },
  recycling_program_mandate: {
    id: 'recycling_program_mandate',
    name: 'Universal Waste Composting & Recycling',
    category: POLICY_CATEGORIES.ENVIRONMENT,
    description: 'Mandates 3-stream waste sorting for all households and businesses with high non-compliance fines.',
    monthlyCost: 35000,
    enactmentCost: 80000,
    requiredCityLevel: 2,
    minPopulation: 5000,
    voterApprovalBase: 68,
    effects: {
      wasteProductionReduction: 0.45,
      recyclingFacilityEfficiency: 1.35,
      landfillUsageReduction: 0.50,
      happinessBonus: 5
    },
    complianceFormula: '(educationLevel) => Math.min(0.92, 0.50 + (educationLevel * 0.10))',
    sideEffects: ['Reduces municipal landfill expansion expenses.']
  },
  single_use_plastic_ban: {
    id: 'single_use_plastic_ban',
    name: 'Single-Use Plastic Container Ban',
    category: POLICY_CATEGORIES.ENVIRONMENT,
    description: 'Bans plastic bags, straws, and non-biodegradable food containers across retail stores.',
    monthlyCost: 15000,
    enactmentCost: 40000,
    requiredCityLevel: 2,
    minPopulation: 8000,
    voterApprovalBase: 65,
    effects: {
      waterPollutionReduction: 0.35,
      wasteVolumeReduction: 0.15,
      retailCostIncrease: 0.03,
      happinessBonus: 6
    },
    complianceFormula: '() => 0.91',
    sideEffects: ['Spurs growth in eco-friendly packaging startups.']
  },
  urban_reforestation: {
    id: 'urban_reforestation',
    name: 'Million Tree Canopy & Park Corridor',
    category: POLICY_CATEGORIES.ENVIRONMENT,
    description: 'Plants urban shade trees along thoroughfares and converts vacant plots into green micro-parks.',
    monthlyCost: 45000,
    enactmentCost: 150000,
    requiredCityLevel: 2,
    minPopulation: 10000,
    voterApprovalBase: 88,
    effects: {
      heatIslandTemperatureReduction: 2.5, // Celsius
      airPollutionDecayBonus: 0.25,
      citizensHealthBonus: 12,
      happinessBonus: 16
    },
    complianceFormula: '() => 1.0',
    sideEffects: ['Boosts property values across residential zones.']
  },
  industrial_emissions_cap: {
    id: 'industrial_emissions_cap',
    name: 'Strict Cap-and-Trade Emissions Limit',
    category: POLICY_CATEGORIES.ENVIRONMENT,
    description: 'Enforces hard legal ceilings on toxic industrial pollutants with daily monitoring.',
    monthlyCost: 60000,
    enactmentCost: 180000,
    requiredCityLevel: 4,
    minPopulation: 30000,
    voterApprovalBase: 74,
    effects: {
      heavyIndustrialPollutionAir: 0.50,
      heavyIndustrialPollutionWater: 0.55,
      citizenRespiratoryHealthBonus: 20,
      industrialProfitability: 0.90
    },
    complianceFormula: '(fineAmount) => Math.min(0.95, 0.70 + (fineAmount * 0.0001))',
    sideEffects: ['Forces outdated factories to modernize or close down.']
  },
  zero_emission_transit_fleet: {
    id: 'zero_emission_transit_fleet',
    name: '100% Electric Bus & Service Fleet',
    category: POLICY_CATEGORIES.ENVIRONMENT,
    description: 'Replaces all diesel municipal buses and maintenance trucks with zero-emission electric vehicles.',
    monthlyCost: 95000,
    enactmentCost: 400000,
    requiredCityLevel: 4,
    minPopulation: 35000,
    voterApprovalBase: 84,
    effects: {
      transitNoisePollutionReduction: 0.60,
      transitAirPollutionReduction: 0.95,
      publicTransitRidership: 0.15,
      happinessBonus: 10
    },
    complianceFormula: '() => 1.0',
    sideEffects: ['Increases municipal electric grid load during overnight charging.']
  },
  water_conservation_order: {
    id: 'water_conservation_order',
    name: 'Smart Water Metering & Drought Protocol',
    category: POLICY_CATEGORIES.ENVIRONMENT,
    description: 'Mandates low-flow fixtures and restricts lawn watering during high temperature summer months.',
    monthlyCost: 20000,
    enactmentCost: 65000,
    requiredCityLevel: 2,
    minPopulation: 6000,
    voterApprovalBase: 55,
    effects: {
      cityWaterConsumption: 0.70,
      droughtResilience: 0.85,
      happinessPenalty: -3
    },
    complianceFormula: '() => 0.89',
    sideEffects: ['Prevents acute water shortages during heatwaves.']
  },
  clean_waterway_act: {
    id: 'clean_waterway_act',
    name: 'Riverbank & Ocean Clean Water Act',
    category: POLICY_CATEGORIES.ENVIRONMENT,
    description: 'Penalizes chemical runoff and storm drain dumping with heavy criminal prosecution.',
    monthlyCost: 35000,
    enactmentCost: 95000,
    requiredCityLevel: 3,
    minPopulation: 12000,
    voterApprovalBase: 81,
    effects: {
      waterPollutionReduction: 0.65,
      waterfrontPropertyPrestige: 0.30,
      tourismAttractiveness: 0.18
    },
    complianceFormula: '() => 0.93',
    sideEffects: ['Restores marine wildlife and recreational swimming safety.']
  },

  // ---------------------------------------------------------------------------
  // 3. PUBLIC SAFETY CATEGORY (9 policies)
  // ---------------------------------------------------------------------------
  police_camera_network: {
    id: 'police_camera_network',
    name: 'Citywide AI Surveillance Grid',
    category: POLICY_CATEGORIES.PUBLIC_SAFETY,
    description: 'Deploys license plate readers and facial recognition cameras across public thoroughfares.',
    monthlyCost: 75000,
    enactmentCost: 250000,
    requiredCityLevel: 3,
    minPopulation: 20000,
    voterApprovalBase: 45,
    effects: {
      streetCrimeReduction: 0.45,
      stolenVehicleRecovery: 0.80,
      civilLibertiesHappinessPenalty: -8,
      policeEfficiencyMultiplier: 1.35
    },
    complianceFormula: '() => 0.99',
    sideEffects: ['Protests by privacy advocacy groups.', 'Dramatically cuts solve times for felony crimes.']
  },
  neighborhood_watch_program: {
    id: 'neighborhood_watch_program',
    name: 'Community Neighborhood Watch Grant',
    category: POLICY_CATEGORIES.PUBLIC_SAFETY,
    description: 'Funds local civilian patrols and crime prevention training workshops in residential areas.',
    monthlyCost: 12000,
    enactmentCost: 30000,
    requiredCityLevel: 1,
    minPopulation: 3000,
    voterApprovalBase: 78,
    effects: {
      pettyCrimeReduction: 0.20,
      communityTrustBonus: 14,
      happinessBonus: 6
    },
    complianceFormula: '() => 0.85',
    sideEffects: ['Strengthens local community cohesion.']
  },
  youth_curfew: {
    id: 'youth_curfew',
    name: 'Nighttime Youth Movement Ordinance',
    category: POLICY_CATEGORIES.PUBLIC_SAFETY,
    description: 'Enforces a 10:00 PM weekend curfew for unaccompanied minors under 17.',
    monthlyCost: 18000,
    enactmentCost: 40000,
    requiredCityLevel: 2,
    minPopulation: 10000,
    voterApprovalBase: 52,
    effects: {
      nighttimeVandalismReduction: 0.35,
      youthCrimeReduction: 0.25,
      teenHappinessPenalty: -15,
      adultSafetyPerceptionBonus: 8
    },
    complianceFormula: '(policeDensity) => Math.min(0.90, 0.40 + (policeDensity * 0.50))',
    sideEffects: ['Tension between youth groups and patrol officers.']
  },
  gun_control_act: {
    id: 'gun_control_act',
    name: 'Firearm Licensing & Background Check Act',
    category: POLICY_CATEGORIES.PUBLIC_SAFETY,
    description: 'Mandates strict psychiatric screening, waiting periods, and assault weapon bans.',
    monthlyCost: 40000,
    enactmentCost: 110000,
    requiredCityLevel: 3,
    minPopulation: 18000,
    voterApprovalBase: 63,
    effects: {
      violentCrimeReduction: 0.40,
      homicideRateReduction: 0.50,
      safetyPerceptionBonus: 18,
      gunRightsGroupProtestRisk: 0.25
    },
    complianceFormula: '() => 0.92',
    sideEffects: ['Substantial reduction in emergency room trauma admissions.']
  },
  disaster_preparedness_fund: {
    id: 'disaster_preparedness_fund',
    name: 'Emergency Response & Early Warning Grid',
    category: POLICY_CATEGORIES.PUBLIC_SAFETY,
    description: 'Maintains emergency stockpiles, earthquake sensors, and flood barrier warning sirens.',
    monthlyCost: 55000,
    enactmentCost: 180000,
    requiredCityLevel: 3,
    minPopulation: 15000,
    voterApprovalBase: 86,
    effects: {
      disasterDamageReduction: 0.40,
      disasterCasualtyReduction: 0.65,
      emergencyResponseSpeedBonus: 1.50
    },
    complianceFormula: '() => 1.0',
    sideEffects: ['Minimizes economic downtime following major natural disasters.']
  },
  zero_tolerance_policing: {
    id: 'zero_tolerance_policing',
    name: 'Strict Broken-Windows Enforcement',
    category: POLICY_CATEGORIES.PUBLIC_SAFETY,
    description: 'Aggressively prosecutes minor infractions such as graffiti, loitering, and fare evasion.',
    monthlyCost: 85000,
    enactmentCost: 200000,
    requiredCityLevel: 3,
    minPopulation: 22000,
    voterApprovalBase: 48,
    effects: {
      overallCrimeReduction: 0.55,
      incarcerationRateMultiplier: 2.10,
      minorityDistrustPenalty: -18,
      businessDistrictSafetyBonus: 15
    },
    complianceFormula: '() => 0.95',
    sideEffects: ['Overcrowding in municipal detention centers.']
  },
  smart_traffic_enforcement: {
    id: 'smart_traffic_enforcement',
    name: 'Automated Speed & Red Light Cameras',
    category: POLICY_CATEGORIES.PUBLIC_SAFETY,
    description: 'Issues automated citations for speeding and reckless driving at high-risk intersections.',
    monthlyCost: 22000,
    enactmentCost: 70000,
    requiredCityLevel: 2,
    minPopulation: 8000,
    voterApprovalBase: 50,
    effects: {
      trafficAccidentFatalities: -0.45,
      ticketRevenueMultiplier: 1.15,
      commuterHappinessPenalty: -4
    },
    complianceFormula: '() => 0.97',
    sideEffects: ['Increases traffic flow compliance on major arteries.']
  },
  fire_safety_code_inspection: {
    id: 'fire_safety_code_inspection',
    name: 'Mandatory Commercial Fire Sprinkler Audit',
    category: POLICY_CATEGORIES.PUBLIC_SAFETY,
    description: 'Requires annual fire safety inspections for high-density occupancy buildings.',
    monthlyCost: 28000,
    enactmentCost: 50000,
    requiredCityLevel: 2,
    minPopulation: 7000,
    voterApprovalBase: 84,
    effects: {
      buildingFireSpreadRisk: -0.70,
      fireDepartmentResponseCost: -0.25,
      insurancePremiumReduction: 0.12
    },
    complianceFormula: '() => 0.94',
    sideEffects: ['Prevents catastrophic industrial infernos.']
  },
  cyber_defense_taskforce: {
    id: 'cyber_defense_taskforce',
    name: 'Municipal Critical Infrastructure Cyber Shield',
    category: POLICY_CATEGORIES.PUBLIC_SAFETY,
    description: 'Protects municipal water, power grids, and transit networks against ransomware cyberattacks.',
    monthlyCost: 65000,
    enactmentCost: 220000,
    requiredCityLevel: 4,
    minPopulation: 35000,
    voterApprovalBase: 76,
    effects: {
      infrastructureCyberAttackImmunity: 0.90,
      techSectorConfidenceBonus: 0.20
    },
    complianceFormula: '() => 0.98',
    sideEffects: ['Safeguards smart city IoT infrastructure.']
  },

  // ---------------------------------------------------------------------------
  // 4. SOCIAL WELFARE CATEGORY (8 policies)
  // ---------------------------------------------------------------------------
  universal_basic_income: {
    id: 'universal_basic_income',
    name: 'Universal Basic Income Dividend (UBI)',
    category: POLICY_CATEGORIES.SOCIAL_WELFARE,
    description: 'Provides every adult citizen an unconditional monthly stipend of $1,000 to eradicate poverty.',
    monthlyCost: 500000,
    enactmentCost: 1000000,
    requiredCityLevel: 5,
    minPopulation: 50000,
    voterApprovalBase: 85,
    effects: {
      povertyRateReduction: 0.90,
      overallCitizenHappinessBonus: 35,
      lowWageJobLaborSupply: 0.85,
      smallBusinessRetailSpend: 1.40,
      budgetExpenditureIncrease: 2.20
    },
    complianceFormula: '() => 1.0',
    sideEffects: ['Requires high tax revenue base to avoid municipal bankruptcy.']
  },
  universal_free_healthcare: {
    id: 'universal_free_healthcare',
    name: 'Single-Payer Universal Health Coverage',
    category: POLICY_CATEGORIES.SOCIAL_WELFARE,
    description: 'Covers all medical expenses, prescriptions, and emergency room visits for all residents.',
    monthlyCost: 350000,
    enactmentCost: 800000,
    requiredCityLevel: 4,
    minPopulation: 30000,
    voterApprovalBase: 88,
    effects: {
      citizenAverageLifeExpectancy: 6.5, // years
      hospitalCapacityStress: 1.25,
      workforceSickDaysReduction: 0.50,
      happinessBonus: 28
    },
    complianceFormula: '() => 1.0',
    sideEffects: ['Eliminates medical bankruptcy.', 'Requires expanding hospital facilities.']
  },
  public_housing_initiative: {
    id: 'public_housing_initiative',
    name: 'Municipal Social Housing Construction Fund',
    category: POLICY_CATEGORIES.SOCIAL_WELFARE,
    description: 'Constructs quality, rent-subsidized apartments for low and middle income families.',
    monthlyCost: 180000,
    enactmentCost: 500000,
    requiredCityLevel: 3,
    minPopulation: 15000,
    voterApprovalBase: 78,
    effects: {
      homelessnessReduction: 0.75,
      housingAffordabilityIndex: 0.30,
      privateDeveloperMarginReduction: -0.08,
      happinessLowIncomeBonus: 20
    },
    complianceFormula: '() => 0.95',
    sideEffects: ['Saturates low-income housing deficits.']
  },
  senior_pension_subsidy: {
    id: 'senior_pension_subsidy',
    name: 'Elderly Pension & Care Assistance',
    category: POLICY_CATEGORIES.SOCIAL_WELFARE,
    description: 'Supplements state pensions and provides free home health care aides for citizens over 65.',
    monthlyCost: 110000,
    enactmentCost: 250000,
    requiredCityLevel: 3,
    minPopulation: 12000,
    voterApprovalBase: 92,
    effects: {
      seniorHappinessBonus: 30,
      seniorMortalityRateReduction: 0.25,
      familyCaregiverStressReduction: 0.35
    },
    complianceFormula: '() => 1.0',
    sideEffects: ['Earns overwhelming approval from senior voter demographics.']
  },
  unemployment_safety_net: {
    id: 'unemployment_safety_net',
    name: 'Extended Unemployment & Retraining Allowance',
    category: POLICY_CATEGORIES.SOCIAL_WELFARE,
    description: 'Provides 80% wage replacement for up to 12 months alongside mandatory tech retraining courses.',
    monthlyCost: 95000,
    enactmentCost: 200000,
    requiredCityLevel: 2,
    minPopulation: 10000,
    voterApprovalBase: 74,
    effects: {
      jobTransitionSuccessRate: 1.45,
      economicRecessionBuffer: 0.50,
      unemployedHappinessPenaltyReduction: 0.60
    },
    complianceFormula: '() => 0.92',
    sideEffects: ['Prevents sudden spikes in poverty during economic downturns.']
  },
  free_childcare_program: {
    id: 'free_childcare_program',
    name: 'Universal Subsidized Pre-K & Childcare',
    category: POLICY_CATEGORIES.SOCIAL_WELFARE,
    description: 'Funds free early childhood education centers, enabling parents to rejoin the labor force.',
    monthlyCost: 140000,
    enactmentCost: 320000,
    requiredCityLevel: 3,
    minPopulation: 20000,
    voterApprovalBase: 90,
    effects: {
      femaleLaborForceParticipation: 0.22,
      familyDisposableIncomeBonus: 0.14,
      earlyChildhoodEducationBonus: 0.35,
      happinessBonus: 22
    },
    complianceFormula: '() => 0.98',
    sideEffects: ['Boosts commercial productivity across all employment categories.']
  },
  affordable_college_grant: {
    id: 'affordable_college_grant',
    name: 'Higher Education Tuition Waiver',
    category: POLICY_CATEGORIES.SOCIAL_WELFARE,
    description: 'Covers full tuition fees at public universities for residents maintaining a B average.',
    monthlyCost: 160000,
    enactmentCost: 450000,
    requiredCityLevel: 4,
    minPopulation: 25000,
    voterApprovalBase: 86,
    effects: {
      bachelorDegreeAttainmentRate: 0.40,
      highTechIndustryAttractiveness: 0.30,
      youthBrainDrainReduction: 0.65
    },
    complianceFormula: '() => 0.96',
    sideEffects: ['Transforms the city into a regional knowledge capital.']
  },
  mental_health_crisis_outreach: {
    id: 'mental_health_crisis_outreach',
    name: '24/7 Mental Health Mobile Crisis Response',
    category: POLICY_CATEGORIES.SOCIAL_WELFARE,
    description: 'Dispatches social workers instead of armed police to non-violent mental health calls.',
    monthlyCost: 42000,
    enactmentCost: 90000,
    requiredCityLevel: 2,
    minPopulation: 10000,
    voterApprovalBase: 82,
    effects: {
      policeFatalEncounterReduction: 0.70,
      addictionRecoveryRate: 0.35,
      homelessnessStabilityBonus: 0.20,
      happinessBonus: 12
    },
    complianceFormula: '() => 0.97',
    sideEffects: ['Diverts non-criminal calls away from police dispatch lines.']
  },

  // ---------------------------------------------------------------------------
  // 5. INFRASTRUCTURE CATEGORY (8 policies)
  // ---------------------------------------------------------------------------
  free_public_transport: {
    id: 'free_public_transport',
    name: 'Zero-Fare Farebox Public Transit',
    category: POLICY_CATEGORIES.INFRASTRUCTURE,
    description: 'Abolishes transit fares across all municipal buses, subways, and light rail lines.',
    monthlyCost: 220000,
    enactmentCost: 350000,
    requiredCityLevel: 3,
    minPopulation: 25000,
    voterApprovalBase: 91,
    effects: {
      publicTransportRidership: 1.85,
      privateVehicleTrafficVolume: 0.60,
      roadMaintenanceCostReduction: 0.25,
      cityAirPollutionReduction: 0.30,
      happinessBonus: 25
    },
    complianceFormula: '() => 1.0',
    sideEffects: ['Requires high tax revenue subsidy to replace ticket farebox earnings.']
  },
  high_speed_rail_subsidy: {
    id: 'high_speed_rail_subsidy',
    name: 'Intercity Maglev High-Speed Rail Corridor',
    category: POLICY_CATEGORIES.INFRASTRUCTURE,
    description: 'Subsidizes construction and ticket fares for ultra-fast rail connections to neighbor cities.',
    monthlyCost: 280000,
    enactmentCost: 1500000,
    requiredCityLevel: 5,
    minPopulation: 60000,
    voterApprovalBase: 83,
    effects: {
      intercityTourismBonus: 0.65,
      commercialOfficeDemand: 0.40,
      regionalTradeEfficiency: 1.50
    },
    complianceFormula: '() => 0.99',
    sideEffects: ['Positions city as a major economic mega-region hub.']
  },
  smart_grid_investment: {
    id: 'smart_grid_investment',
    name: 'AI Smart Grid Load Balancing',
    category: POLICY_CATEGORIES.INFRASTRUCTURE,
    description: 'Upgrades electrical substations with real-time AI sensors to eliminate rolling blackouts.',
    monthlyCost: 120000,
    enactmentCost: 600000,
    requiredCityLevel: 4,
    minPopulation: 35000,
    voterApprovalBase: 85,
    effects: {
      gridPowerEfficiency: 1.35,
      blackoutRiskReduction: 0.95,
      powerPlantFuelWasteReduction: 0.20
    },
    complianceFormula: '() => 0.98',
    sideEffects: ['Enhances grid stability during extreme heatwaves and blizzards.']
  },
  autonomous_transit_corridor: {
    id: 'autonomous_transit_corridor',
    name: 'Dedicated Autonomous Vehicle Lanes',
    category: POLICY_CATEGORIES.INFRASTRUCTURE,
    description: 'Designates priority lanes equipped with V2X sensors for self-driving shuttles and robo-taxis.',
    monthlyCost: 85000,
    enactmentCost: 400000,
    requiredCityLevel: 4,
    minPopulation: 40000,
    voterApprovalBase: 68,
    effects: {
      trafficFlowSpeedBonus: 0.30,
      trafficAccidentReduction: 0.40,
      techSectorPrestige: 15
    },
    complianceFormula: '() => 0.92',
    sideEffects: ['Reduces delivery costs for automated logistics.']
  },
  micro_mobility_expansion: {
    id: 'micro_mobility_expansion',
    name: 'Protected Bike Highway & Scooter Grid',
    category: POLICY_CATEGORIES.INFRASTRUCTURE,
    description: 'Constructs physical barrier-separated bicycle lanes and docking stations across all districts.',
    monthlyCost: 35000,
    enactmentCost: 120000,
    requiredCityLevel: 2,
    minPopulation: 10000,
    voterApprovalBase: 76,
    effects: {
      shortDistanceCarTripsReduction: 0.35,
      citizenPhysicalHealthBonus: 10,
      trafficCongestionReduction: 0.15,
      happinessBonus: 12
    },
    complianceFormula: '() => 0.95',
    sideEffects: ['Lowers pedestrian-vehicle collision rates.']
  },
  broadband_public_utility: {
    id: 'broadband_public_utility',
    name: 'Municipal Fiber Gigabit Internet Utility',
    category: POLICY_CATEGORIES.INFRASTRUCTURE,
    description: 'Treats high-speed fiber internet as a public utility with low-cost municipal rates.',
    monthlyCost: 95000,
    enactmentCost: 450000,
    requiredCityLevel: 3,
    minPopulation: 20000,
    voterApprovalBase: 89,
    effects: {
      techCompanyAttractiveness: 0.35,
      remoteWorkProductivityBonus: 0.25,
      digitalDivideEradication: 0.90,
      happinessBonus: 18
    },
    complianceFormula: '() => 0.99',
    sideEffects: ['Forces private telecom ISPs to lower commercial prices.']
  },
  desalination_expansion_act: {
    id: 'desalination_expansion_act',
    name: 'Emergency Sea Water Desalination Mandate',
    category: POLICY_CATEGORIES.INFRASTRUCTURE,
    description: 'Subsidizes high-volume reverse-osmosis ocean plants to guarantee endless freshwater supply.',
    monthlyCost: 140000,
    enactmentCost: 750000,
    requiredCityLevel: 4,
    minPopulation: 30000,
    voterApprovalBase: 72,
    effects: {
      cityWaterSupplyMultiplier: 1.80,
      droughtVulnerability: 0.05,
      coastalWaterBrinePollution: 0.08
    },
    complianceFormula: '() => 0.98',
    sideEffects: ['Slight increase in coastal marine salinity near outflow pipes.']
  },
  underground_cables_initiative: {
    id: 'underground_cables_initiative',
    name: 'Power & Telecom Undergrounding',
    category: POLICY_CATEGORIES.INFRASTRUCTURE,
    description: 'Buries overhead power lines and fiber cables underground to prevent storm damage and improve city aesthetics.',
    monthlyCost: 65000,
    enactmentCost: 500000,
    requiredCityLevel: 3,
    minPopulation: 15000,
    voterApprovalBase: 84,
    effects: {
      stormPowerOutageRisk: -0.85,
      cityLandmarkPrestige: 0.20,
      happinessBonus: 10
    },
    complianceFormula: '() => 1.0',
    sideEffects: ['Eliminates ugly overhead telephone poles across historical districts.']
  },

  // ---------------------------------------------------------------------------
  // 6. COMMERCE CATEGORY (8 policies)
  // ---------------------------------------------------------------------------
  small_business_grant: {
    id: 'small_business_grant',
    name: 'Main Street Small Business Relief Fund',
    category: POLICY_CATEGORIES.COMMERCE,
    description: 'Provides low-interest micro-loans and matching grants for mom-and-pop storefronts.',
    monthlyCost: 60000,
    enactmentCost: 150000,
    requiredCityLevel: 1,
    minPopulation: 4000,
    voterApprovalBase: 86,
    effects: {
      smallBusinessSurvivalRate: 1.40,
      retailZoneOccupancyRate: 0.95,
      commercialTaxBaseGrowth: 0.15,
      happinessBonus: 14
    },
    complianceFormula: '() => 0.95',
    sideEffects: ['Revitalizes historic downtown commercial districts.']
  },
  tech_incubator_initiative: {
    id: 'tech_incubator_initiative',
    name: 'Venture Tech Incubator & Seed Accelerator',
    category: POLICY_CATEGORIES.COMMERCE,
    description: 'Provides free office space, cloud compute credits, and mentor networks for tech founders.',
    monthlyCost: 85000,
    enactmentCost: 300000,
    requiredCityLevel: 3,
    minPopulation: 18000,
    voterApprovalBase: 78,
    effects: {
      startupCreationRateMultiplier: 1.80,
      highSkillJobCreation: 0.35,
      patentsFiledMultiplier: 2.10
    },
    complianceFormula: '() => 0.96',
    sideEffects: ['Spurs high-valuation IPO exits that enrich city tax coffers.']
  },
  tourism_global_marketing: {
    id: 'tourism_global_marketing',
    name: 'Global Cultural & Tourism Marketing Campaign',
    category: POLICY_CATEGORIES.COMMERCE,
    description: 'Funds international ads showcasing local heritage landmarks, food festivals, and resorts.',
    monthlyCost: 50000,
    enactmentCost: 120000,
    requiredCityLevel: 2,
    minPopulation: 10000,
    voterApprovalBase: 74,
    effects: {
      internationalTouristInflow: 1.65,
      hotelOccupancyRate: 0.92,
      restaurantRetailRevenue: 0.30
    },
    complianceFormula: '() => 1.0',
    sideEffects: ['Overcrowding in historic tourist plazas during peak season.']
  },
  nighttime_economy_license: {
    id: 'nighttime_economy_license',
    name: '24-Hour Nighttime District Permit',
    category: POLICY_CATEGORIES.COMMERCE,
    description: 'Allows designated entertainment districts to operate bars, clubs, and venues 24 hours a day.',
    monthlyCost: 25000,
    enactmentCost: 60000,
    requiredCityLevel: 3,
    minPopulation: 20000,
    voterApprovalBase: 58,
    effects: {
      nightlifeCommercialRevenue: 0.50,
      entertainmentSectorJobs: 0.25,
      nighttimeNoisePollution: 0.30,
      policePatrolCostIncrease: 0.15
    },
    complianceFormula: '() => 0.88',
    sideEffects: ['Attracts young professionals and vibrant nightlife culture.']
  },
  special_economic_zone: {
    id: 'special_economic_zone',
    name: 'Free Trade Special Economic Zone (SEZ)',
    category: POLICY_CATEGORIES.COMMERCE,
    description: 'Waives import duties and offers streamlined customs processing near port and airport zones.',
    monthlyCost: 110000,
    enactmentCost: 500000,
    requiredCityLevel: 4,
    minPopulation: 35000,
    voterApprovalBase: 65,
    effects: {
      exportImportTradeVolume: 2.20,
      industrialLogisticsJobs: 0.45,
      foreignDirectInvestment: 1.75
    },
    complianceFormula: '() => 0.98',
    sideEffects: ['Huge surge in container shipping traffic.']
  },
  artisan_craft_exemption: {
    id: 'artisan_craft_exemption',
    name: 'Artisan & Cultural Craft License Exemption',
    category: POLICY_CATEGORIES.COMMERCE,
    description: 'Waives licensing fees for street artists, farmers market vendors, and independent craftsmen.',
    monthlyCost: 8000,
    enactmentCost: 15000,
    requiredCityLevel: 1,
    minPopulation: 2000,
    voterApprovalBase: 88,
    effects: {
      streetMarketVibrancy: 0.40,
      culturalPrestigeBonus: 0.15,
      happinessBonus: 8
    },
    complianceFormula: '() => 0.90',
    sideEffects: ['Fosters organic, unique neighborhood identity.']
  },
  film_production_tax_credit: {
    id: 'film_production_tax_credit',
    name: '30% Film & Digital Media Production Credit',
    category: POLICY_CATEGORIES.COMMERCE,
    description: 'Offers tax credits to major movie studios and streaming platforms filming within the city.',
    monthlyCost: 70000,
    enactmentCost: 180000,
    requiredCityLevel: 3,
    minPopulation: 22000,
    voterApprovalBase: 76,
    effects: {
      mediaCreativeJobs: 0.40,
      tourismPrestigeBonus: 0.25,
      hospitalityRevenue: 0.20
    },
    complianceFormula: '() => 0.95',
    sideEffects: ['Occasional temporary street closures for movie shoots.']
  },
  green_tech_export_subsidy: {
    id: 'green_tech_export_subsidy',
    name: 'Clean Energy & Battery Export Grant',
    category: POLICY_CATEGORIES.COMMERCE,
    description: 'Subsidizes local factories producing solar panels, EV batteries, and wind turbines for export.',
    monthlyCost: 130000,
    enactmentCost: 400000,
    requiredCityLevel: 4,
    minPopulation: 30000,
    voterApprovalBase: 82,
    effects: {
      greenIndustrialManufacturingJobs: 0.50,
      cityGlobalGreenBrandPrestige: 0.40,
      cleanTechTaxRevenue: 0.35
    },
    complianceFormula: '() => 0.97',
    sideEffects: ['Establishes the city as a worldwide clean energy exporter.']
  }
});

// Helper functions
export function getPolicyById(id) {
  return POLICIES[id] || null;
}

export function getPoliciesByCategory(category) {
  return Object.values(POLICIES).filter(p => p.category === category);
}

export function calculateActivePoliciesImpact(activePolicyIds = []) {
  const result = {
    totalMonthlyCost: 0,
    budgetRevenueMultiplier: 1.0,
    happinessBonus: 0,
    pollutionMultiplier: 1.0,
    crimeMultiplier: 1.0,
    trafficMultiplier: 1.0,
    businessGrowthMultiplier: 1.0
  };

  for (const id of activePolicyIds) {
    const policy = POLICIES[id];
    if (!policy) continue;

    result.totalMonthlyCost += policy.monthlyCost;
    if (policy.effects.budgetRevenueMultiplier) result.budgetRevenueMultiplier *= policy.effects.budgetRevenueMultiplier;
    if (policy.effects.happinessBonus) result.happinessBonus += policy.effects.happinessBonus;
    if (policy.effects.businessGrowthMultiplier) result.businessGrowthMultiplier *= policy.effects.businessGrowthMultiplier;
    if (policy.effects.overallCrimeReduction) result.crimeMultiplier *= (1.0 - policy.effects.overallCrimeReduction);
    if (policy.effects.cityAirPollutionReduction) result.pollutionMultiplier *= (1.0 - policy.effects.cityAirPollutionReduction);
    if (policy.effects.trafficCongestionReduction) result.trafficMultiplier *= (1.0 - policy.effects.trafficCongestionReduction);
  }

  return result;
}

export default POLICIES;
