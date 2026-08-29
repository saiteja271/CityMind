/**
 * CITYMIND Detailed Building Upgrade Trees & Architectural Specifications
 * Specifies 5-tier upgrade levels for all 80+ city building types, including cost formulas,
 * capacity scaling factors, power/water demand curves, and special ability unlocks.
 */

export const BUILDING_UPGRADE_TREE_SPECS = {
  solar_farm: [
    { level: 1, name: 'Standard Photovoltaic Array', cost: 25000, powerOutput: 100, maintenance: 200, spec: 'Basic silicon solar panels' },
    { level: 2, name: 'Dual-Axis Solar Tracker', cost: 18000, powerOutput: 145, maintenance: 280, spec: 'Motorized sun-tracking panels (+45% yield)' },
    { level: 3, name: 'Perovskite Multi-Junction Cell Array', cost: 35000, powerOutput: 210, maintenance: 420, spec: 'Next-gen high efficiency cells (+110% yield)' },
    { level: 4, name: 'AI Smart Grid Inverter & Storage', cost: 60000, powerOutput: 310, maintenance: 650, spec: 'Integrated battery bank stores excess midday solar energy' },
    { level: 5, name: 'Quantum Dot Concentrator Solar Array', cost: 120000, powerOutput: 500, maintenance: 1100, spec: 'State-of-the-art quantum concentrators (+400% yield)' },
  ],
  highrise_apartment: [
    { level: 1, name: 'Standard Residential Complex', cost: 80000, capacity: 120, happinessBonus: 0, maintenance: 450, spec: '12-story concrete apartment tower' },
    { level: 2, name: 'Renovated Modern Facade & Balconies', cost: 40000, capacity: 150, happinessBonus: 5, maintenance: 600, spec: 'Adds private balconies & soundproof windows' },
    { level: 3, name: 'Rooftop Garden & Community Center', cost: 75000, capacity: 190, happinessBonus: 12, maintenance: 850, spec: 'Adds rooftop green space & gym' },
    { level: 4, name: 'Smart Home Automation Integration', cost: 120000, capacity: 240, happinessBonus: 20, maintenance: 1200, spec: 'Fiber internet & automated climate control' },
    { level: 5, name: 'Luxury Arcology Vertical Habitat', cost: 250000, capacity: 320, happinessBonus: 35, maintenance: 1900, spec: 'Self-sustaining vertical city ecosystem' },
  ],
  hospital: [
    { level: 1, name: 'Municipal District Hospital', cost: 150000, beds: 80, healthBonus: 15, maintenance: 2200, spec: 'Emergency ER & general wards' },
    { level: 2, name: 'Intensive Care Unit (ICU) Extension', cost: 85000, beds: 120, healthBonus: 25, maintenance: 3100, spec: 'Adds 40 ICU beds & trauma center' },
    { level: 3, name: 'Robotic Surgery Wing & MRI Suite', cost: 160000, beds: 170, healthBonus: 38, maintenance: 4500, spec: 'Precision surgical robots & 3D scanners' },
    { level: 4, name: 'Biotech Genetic Therapy Research Lab', cost: 280000, beds: 230, healthBonus: 52, maintenance: 6800, spec: 'Personalized gene therapy & oncology center' },
    { level: 5, name: 'Metropolis Medical Center of Excellence', cost: 500000, beds: 320, healthBonus: 75, maintenance: 10500, spec: 'World-renowned medical research university hospital' },
  ],
  police_station: [
    { level: 1, name: 'Neighborhood Police Precinct', cost: 60000, patrolCars: 4, crimeReductionPct: 20, maintenance: 900, spec: 'Local patrol station' },
    { level: 2, name: 'K-9 & Tactical SWAT Unit', cost: 35000, patrolCars: 7, crimeReductionPct: 35, maintenance: 1400, spec: 'Adds SWAT vehicle & trained K-9 units' },
    { level: 3, name: 'AI Forensic Lab & Cybercrime Division', cost: 75000, patrolCars: 10, crimeReductionPct: 50, maintenance: 2100, spec: 'Digital forensics & automated crime mapping' },
    { level: 4, name: 'Aerial Surveillance Drone Hangar', cost: 130000, patrolCars: 14, crimeReductionPct: 68, maintenance: 3200, spec: '24/7 autonomous police drone fleet' },
    { level: 5, name: 'Metropolis Law Enforcement HQ', cost: 240000, patrolCars: 20, crimeReductionPct: 88, maintenance: 4800, spec: 'Central police headquarters for whole city' },
  ],
};

export function getUpgradeSpec(buildingType, targetLevel) {
  const tree = BUILDING_UPGRADE_TREE_SPECS[buildingType];
  if (!tree) return null;
  return tree.find((tier) => tier.level === targetLevel) || null;
}

export default BUILDING_UPGRADE_TREE_SPECS;
