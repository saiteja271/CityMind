/**
 * CITYMIND Disaster Catalog & Mitigation Database
 * Specifications, damage radius formulas, evacuation protocols, and emergency response costs
 * for 20 environmental, technical, economic, and social urban catastrophes.
 */

export const DISASTER_CATALOG = {
  earthquake_severe: {
    id: 'earthquake_severe',
    name: 'Magnitude 7.2 Fault Line Earthquake',
    category: 'Natural',
    severity: 'Catastrophic',
    damageRadiusTiles: 24,
    roadDestructionProbability: 0.45,
    powerSubstationTripProbability: 0.80,
    waterPipeRuptureProbability: 0.70,
    buildingCollapseRiskPct: 15,
    reconstructionCostEstimate: 250000,
    advisorWarning: 'CRITICAL: Seismic fault rupture! Widespread destruction of roads, water mains, and substations detected.',
    mitigationOptions: [
      { name: 'Deploy Urban Search & Rescue Teams', cost: 25000, casualtyReductionPct: 60 },
      { name: 'Dispatch Emergency Road Repair Crews', cost: 15000, transitRecoverySpeedMultiplier: 2.0 },
      { name: 'Establish Red Cross Emergency Shelters', cost: 10000, happinessDropMitigationPct: 40 },
    ],
  },
  tornado_f5: {
    id: 'tornado_f5',
    name: 'F5 Funnel Cloud Tornado',
    category: 'Natural',
    severity: 'Catastrophic',
    damageRadiusTiles: 16,
    roadDestructionProbability: 0.30,
    powerSubstationTripProbability: 0.90,
    waterPipeRuptureProbability: 0.20,
    buildingCollapseRiskPct: 35,
    reconstructionCostEstimate: 180000,
    advisorWarning: 'CRITICAL: F5 Tornado touchdown in Central District! Extreme wind speeds tearing down power lines and roofs.',
    mitigationOptions: [
      { name: 'Issue Emergency Siren Evacuation Alarm', cost: 5000, casualtyReductionPct: 75 },
      { name: 'Deploy Debris Clearance Heavy Machinery', cost: 20000, roadRecoverySpeedMultiplier: 2.5 },
    ],
  },
  chemical_spill_toxic: {
    id: 'chemical_spill_toxic',
    name: 'Industrial Chemical Tank Explosion & Toxic Smog',
    category: 'Technical',
    severity: 'Severe',
    damageRadiusTiles: 12,
    roadDestructionProbability: 0.10,
    powerSubstationTripProbability: 0.30,
    waterPipeRuptureProbability: 0.60,
    buildingCollapseRiskPct: 10,
    reconstructionCostEstimate: 120000,
    advisorWarning: 'WARNING: Toxic chemical tank explosion in Heavy Industrial Zone! Plume drifting toward residential sectors.',
    mitigationOptions: [
      { name: 'Deploy Hazmat Decontamination Squads', cost: 30000, smogClearanceSpeedMultiplier: 3.0 },
      { name: 'Issue Residential Respirator Masks', cost: 12000, healthDecayMitigationPct: 50 },
    ],
  },
  power_grid_collapse: {
    id: 'power_grid_collapse',
    name: 'Citywide Electrical Grid Cascade Blackout',
    category: 'Technical',
    severity: 'Severe',
    damageRadiusTiles: 99, // Citywide
    roadDestructionProbability: 0.0,
    powerSubstationTripProbability: 1.0,
    waterPipeRuptureProbability: 0.10,
    buildingCollapseRiskPct: 0,
    reconstructionCostEstimate: 45000,
    advisorWarning: 'CRITICAL: Substation 3 failure triggered citywide blackout! Traffic lights and hospital pumps offline.',
    mitigationOptions: [
      { name: 'Dispatch Emergency Backup Generator Fleet', cost: 15000, hospitalPowerRestorationTimeMin: 15 },
      { name: 'Manual Power Substation Reset', cost: 8000, gridRestartProbabilityPct: 90 },
    ],
  },
};

export function getDisasterById(id) {
  return DISASTER_CATALOG[id] || null;
}

export function getDisastersByCategory(category) {
  return Object.values(DISASTER_CATALOG).filter((d) => d.category === category);
}

export default DISASTER_CATALOG;
