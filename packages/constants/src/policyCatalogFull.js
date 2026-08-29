/**
 * CITYMIND Extended Ordinance & Legal Policy Specifications Catalog
 * Additional city law specs covering public safety curfews, plastic bans, Universal Basic Income (UBI), UBI tax credits.
 */

export const EXTENDED_POLICY_CATALOG = [
  {
    id: 'universal_basic_income',
    name: 'Universal Basic Income (UBI) Municipal Guarantee',
    category: 'SocialWelfare',
    description: 'Provides a monthly $1,000 stipend to all low-income citizens below the poverty threshold.',
    enactmentCostDollars: 150000,
    monthlyCostDollars: 45000,
    requiredCityLevel: 5,
    minPopulation: 15000,
    voterApprovalBasePct: 88,
    effects: {
      povertyReductionPct: 75,
      happinessBonus: 15,
      crimeReductionPct: 25,
      treasuryOutflowDollars: 45000,
    },
  },
  {
    id: 'single_use_plastic_ban',
    name: 'Single-Use Plastic Packaging Ban',
    category: 'Environment',
    description: 'Outlaws non-recyclable plastic bags and containers in retail stores and supermarkets.',
    enactmentCostDollars: 12000,
    monthlyCostDollars: 800,
    requiredCityLevel: 2,
    minPopulation: 2000,
    voterApprovalBasePct: 65,
    effects: {
      wasteProductionReductionPct: 20,
      pollutionMultiplier: 0.90,
      happinessBonus: 3,
    },
  },
  {
    id: 'juvenile_curfew_law',
    name: 'Nighttime Youth & Juvenile Curfew',
    category: 'PublicSafety',
    description: 'Restricts unaccompanied minors under age 18 from public plazas between 11 PM and 6 AM.',
    enactmentCostDollars: 8000,
    monthlyCostDollars: 1500,
    requiredCityLevel: 1,
    minPopulation: 1000,
    voterApprovalBasePct: 58,
    effects: {
      nightCrimeReductionPct: 30,
      happinessBonus: -2,
      policeEffectivenessMultiplier: 1.15,
    },
  },
];

export default EXTENDED_POLICY_CATALOG;
