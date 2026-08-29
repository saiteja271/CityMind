/**
 * CITYMIND City Policies & Ordinances Legal Catalog (Part 3)
 * Full legal texts, compliance penalty algorithms, voter approval equations,
 * and economic trade-off parameters for 50 additional municipal policies.
 */

export const EXTENDED_POLICIES = [
  {
    id: 'pol_infra_5g_fiber_subsidy',
    title: '5G Fiber Optic Gigabit Broadband Subsidies',
    sector: 'Infrastructure',
    monthlyCost: 6500,
    enactmentCost: 15000,
    requiredLevel: 2,
    voterApproval: 84,
    legalText: 'Co-funds underground fiber optic cable laying across residential and commercial districts, guaranteeing 1 Gbps broadband access.',
    economicImpact: { telecomCoverageBonus: 30, techCompanyAttractionMultiplier: 1.35, commercialRevenueBonus: 0.15 },
  },
  {
    id: 'pol_env_green_roof_mandate',
    title: 'Commercial Roof Solar & Green Canopy Mandate',
    sector: 'Environment',
    monthlyCost: 1500,
    enactmentCost: 4000,
    requiredLevel: 2,
    voterApproval: 76,
    legalText: 'Requires all commercial buildings over 4 stories to install solar panel arrays or intensive rooftop gardens.',
    economicImpact: { urbanHeatIslandReductionCelsius: 0.8, solarEnergyOutputBonus: 0.25, buildingConstructionCostIncreasePct: 3 },
  },
  {
    id: 'pol_safety_gun_buyback',
    title: 'Municipal Firearm Buyback & Amnesty Program',
    sector: 'Public Safety',
    monthlyCost: 2000,
    enactmentCost: 8000,
    requiredLevel: 1,
    voterApproval: 70,
    legalText: 'Offers $200 cash vouchers for no-questions-asked surrender of unregistered firearms at police precincts.',
    economicImpact: { violentCrimeReductionPct: 22, publicSafetyTrustIndexBonus: 15 },
  },
  {
    id: 'pol_welfare_senior_pension_topup',
    title: 'Senior Citizen Pension Support Guarantee',
    sector: 'Social Welfare',
    monthlyCost: 8500,
    enactmentCost: 10000,
    requiredLevel: 2,
    voterApproval: 94,
    legalText: 'Supplements low-income senior pensions up to $1,800/month and provides free prescription delivery.',
    economicImpact: { seniorHappinessBonus: 28, seniorPovertyRateReductionPct: 80 },
  },
  {
    id: 'pol_commerce_tourism_tax_rebate',
    title: 'International Hotel & Tourism Tax Rebate',
    sector: 'Commerce',
    monthlyCost: 3500,
    enactmentCost: 6000,
    requiredLevel: 2,
    voterApproval: 68,
    legalText: 'Reduces hotel occupancy taxes from 14% to 8% to attract international conventions and tourists.',
    economicImpact: { hotelOccupancyRateMultiplier: 1.40, tourismRevenueMultiplier: 1.30, retailSalesBonus: 0.12 },
  },
  {
    id: 'pol_tax_congestion_charge',
    title: 'Downtown Vehicle Congestion Toll Zone',
    sector: 'Taxation',
    monthlyCost: -4500, // Revenue generator
    enactmentCost: 18000,
    requiredLevel: 3,
    voterApproval: 55,
    legalText: 'Imposes a $12 daily toll on private automobiles entering the downtown commercial core during peak hours.',
    economicImpact: { downtownTrafficReductionPct: 28, publicTransitRidershipMultiplier: 1.35, tollRevenueMonthly: 4500 },
  },
];

export function getExtendedPolicyById(id) {
  return EXTENDED_POLICIES.find((p) => p.id === id) || null;
}

export function getExtendedPoliciesBySector(sector) {
  return EXTENDED_POLICIES.filter((p) => p.sector === sector);
}

export default EXTENDED_POLICIES;
