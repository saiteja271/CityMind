/**
 * CITYMIND District Policy Rules & Ordinance Engine
 * Detailed rule evaluations and spatial policy impact formulas for district-level zoning,
 * noise restrictions, local taxation offsets, commercial subsidies, and community policing.
 */

export const DISTRICT_ORDINANCES = [
  {
    id: 'dist_quiet_night',
    name: 'Quiet Night Ordinance (10 PM - 7 AM)',
    category: 'Noise & Quality of Life',
    enactmentCost: 1500,
    monthlyCost: 300,
    effects: { noiseDecibelsReduction: 15, happinessBonus: 5, commercialNightRevenueMultiplier: 0.85 },
    description: 'Enforces strict noise decibel limits during nighttime hours, raising residential satisfaction at the cost of nightlife revenue.',
  },
  {
    id: 'dist_tech_exemption',
    name: 'Tech Startup Local Tax Exemption',
    category: 'Commerce',
    enactmentCost: 5000,
    monthlyCost: 2000,
    effects: { commercialGrowthRateMultiplier: 1.30, techIncubatorAttraction: 2.0, taxIncomeMultiplier: 0.70 },
    description: 'Waives municipal business license fees for technology companies within district boundaries.',
  },
  {
    id: 'dist_heavy_truck_ban',
    name: 'Heavy Freight Truck Transit Ban',
    category: 'Traffic',
    enactmentCost: 2500,
    monthlyCost: 500,
    effects: { trafficCongestionReduction: 0.20, roadWearRateMultiplier: 0.50, industrialDeliveryTimeIncreasePct: 15 },
    description: 'Reroutes heavy cargo vehicles around residential streets, preserving road asphalt and reducing traffic accidents.',
  },
  {
    id: 'dist_organic_waste_compost',
    name: 'District Organic Composting Program',
    category: 'Environment',
    enactmentCost: 3000,
    monthlyCost: 800,
    effects: { wasteProductionReductionPct: 25, organicSoilFertilityBonus: 1.25, landfillLeachateReductionPct: 30 },
    description: 'Collects organic food waste for localized composting, significantly lowering landfill burden.',
  },
  {
    id: 'dist_high_density_permit',
    name: 'High-Density Residential Fast-Track Permit',
    category: 'Housing',
    enactmentCost: 4000,
    monthlyCost: 1000,
    effects: { highriseConstructionSpeedMultiplier: 1.40, landValueGrowthMultiplier: 1.15, infrastructureLoadIncreasePct: 20 },
    description: 'Accelerates zoning approval for apartment skyscrapers, boosting housing supply rapidly.',
  },
  {
    id: 'dist_community_policing',
    name: 'Foot Patrol Community Policing Mandate',
    category: 'Safety',
    enactmentCost: 2000,
    monthlyCost: 1200,
    effects: { crimeRateDeterrencePct: 30, policeTrustIndexBonus: 25, minorOffenseResolutionRatePct: 85 },
    description: 'Requires police officers to conduct walking patrols, establishing strong community trust and deterring petty crime.',
  },
];

export class DistrictPolicyRules {
  constructor(district) {
    this.district = district;
    this.activeOrdinanceIds = new Set(['dist_quiet_night', 'dist_tech_exemption']);
  }

  enactOrdinance(ordinanceId) {
    const ord = DISTRICT_ORDINANCES.find((o) => o.id === ordinanceId);
    if (!ord) return { success: false, reason: 'Ordinance not found' };

    if (!this.activeOrdinanceIds.has(ordinanceId)) {
      this.activeOrdinanceIds.add(ordinanceId);
      return { success: true, ordinance: ord };
    }
    return { success: false, reason: 'Already enacted in this district' };
  }

  repealOrdinance(ordinanceId) {
    if (this.activeOrdinanceIds.has(ordinanceId)) {
      this.activeOrdinanceIds.delete(ordinanceId);
      return { success: true };
    }
    return { success: false, reason: 'Ordinance was not active' };
  }

  evaluateCombinedImpact() {
    let noiseMultiplier = 1.0;
    let happinessBonus = 0;
    let commercialGrowthMultiplier = 1.0;
    let trafficCongestionMultiplier = 1.0;
    let crimeDeterrenceMultiplier = 1.0;
    let totalMonthlyCost = 0;

    this.activeOrdinanceIds.forEach((id) => {
      const ord = DISTRICT_ORDINANCES.find((o) => o.id === id);
      if (ord) {
        totalMonthlyCost += ord.monthlyCost;
        if (ord.effects.noiseDecibelsReduction) noiseMultiplier *= (1 - ord.effects.noiseDecibelsReduction / 100);
        if (ord.effects.happinessBonus) happinessBonus += ord.effects.happinessBonus;
        if (ord.effects.commercialGrowthRateMultiplier) commercialGrowthMultiplier *= ord.effects.commercialGrowthRateMultiplier;
        if (ord.effects.trafficCongestionReduction) trafficCongestionMultiplier *= (1 - ord.effects.trafficCongestionReduction);
        if (ord.effects.crimeRateDeterrencePct) crimeDeterrenceMultiplier *= (1 - ord.effects.crimeRateDeterrencePct / 100);
      }
    });

    return {
      noiseMultiplier,
      happinessBonus,
      commercialGrowthMultiplier,
      trafficCongestionMultiplier,
      crimeDeterrenceMultiplier,
      totalMonthlyCost,
      activeCount: this.activeOrdinanceIds.size,
    };
  }
}

export default DistrictPolicyRules;
