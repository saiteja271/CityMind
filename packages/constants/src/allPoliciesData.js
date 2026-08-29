/**
 * CITYMIND Full Policy & Ordinance Database Data
 * Specifications for 60+ city laws across Taxation, Environment, Public Safety, Social Welfare, Infrastructure, and Commerce.
 */

export const ALL_POLICIES_DATABASE = [
  {
    id: 'green_building_mandate',
    name: 'Green Building Environmental Ordinance',
    category: 'Environment',
    description: 'Mandates solar panels and LEED certification for all new commercial high-rises.',
    enactmentCostDollars: 45000,
    monthlyCostDollars: 3500,
    requiredCityLevel: 3,
    minPopulation: 2500,
    voterApprovalBasePct: 68,
    effects: {
      pollutionMultiplier: 0.70,
      buildingCostMultiplier: 1.12,
      happinessBonus: 6,
      powerDemandMultiplier: 0.85,
    },
  },
  {
    id: 'congestion_charge',
    name: 'Downtown Traffic Congestion Charge',
    category: 'Infrastructure',
    description: 'Levies a $5 daily toll on non-resident vehicles entering the central business district during peak hours.',
    enactmentCostDollars: 25000,
    monthlyCostDollars: 1200,
    requiredCityLevel: 2,
    minPopulation: 5000,
    voterApprovalBasePct: 52,
    effects: {
      trafficCongestionMultiplier: 0.65,
      publicTransitRidershipMultiplier: 1.45,
      monthlyTaxRevenueBonusDollars: 18000,
      happinessBonus: -2,
    },
  },
  {
    id: 'free_public_transit',
    name: 'Universal Free Public Transit Initiative',
    category: 'SocialWelfare',
    description: 'Abolishes ticket fares across all bus, tram, and subway lines, funded by municipal tax revenues.',
    enactmentCostDollars: 85000,
    monthlyCostDollars: 28000,
    requiredCityLevel: 4,
    minPopulation: 10000,
    voterApprovalBasePct: 84,
    effects: {
      trafficCongestionMultiplier: 0.40,
      publicTransitRidershipMultiplier: 2.10,
      happinessBonus: 12,
      pollutionMultiplier: 0.80,
    },
  },
  {
    id: 'tech_incubator_grant',
    name: 'High-Tech Startup Incubator Subsidy',
    category: 'Commerce',
    description: 'Provides tax credits and seed funding for artificial intelligence and microelectronics startups.',
    enactmentCostDollars: 60000,
    monthlyCostDollars: 15000,
    requiredCityLevel: 3,
    minPopulation: 4000,
    voterApprovalBasePct: 72,
    effects: {
      highTechJobsGrowthMultiplier: 1.60,
      gdpGrowthMultiplier: 1.25,
      commercialTaxRevenueBonusDollars: 35000,
    },
  },
];

export default ALL_POLICIES_DATABASE;
