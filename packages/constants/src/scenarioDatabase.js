/**
 * CITYMIND Detailed Scenario Presets & Initial Conditions Database
 * Specifies starting city grids, budget allocations, population demographics,
 * initial disaster states, and victory evaluation criteria for all 15 challenge scenarios.
 */

export const SCENARIO_PRESETS = [
  {
    id: 'scen_preset_01',
    scenarioId: 'scen-01', // Category 5 Hurricane
    mapDimensions: { width: 64, height: 64 },
    initialPopulation: 1200,
    initialTreasury: 150000,
    damagedBuildingsCount: 45,
    damagedRoadsCount: 38,
    activeDisasters: ['earthquake_severe', 'chemical_spill_toxic'],
    victoryConditions: {
      minPopulation: 5000,
      minHappiness: 75,
      maxRoadDamageCount: 0,
      maxPollutionPpm: 25,
      timeLimitMonths: 24,
    },
    narrativeBriefing: `Mayor, Category 5 Hurricane Alpha struck the coast 12 hours ago. Power Substation 3 was submerged, destroying 40% of grid capacity. Floodwaters remain in residential sectors. Your mission is to restore critical utilities, repair damaged roads, build emergency housing, and achieve a population of 5,000 satisfied citizens within 24 months.`,
  },
  {
    id: 'scen_preset_02',
    scenarioId: 'scen-02', // Zero-Carbon Eco-Metropolis
    mapDimensions: { width: 64, height: 64 },
    initialPopulation: 500,
    initialTreasury: 300000,
    damagedBuildingsCount: 0,
    damagedRoadsCount: 0,
    activeDisasters: [],
    victoryConditions: {
      minPopulation: 10000,
      minHappiness: 85,
      maxPollutionPpm: 0,
      minRenewablePowerPct: 100,
      timeLimitMonths: 36,
    },
    narrativeBriefing: `Mayor, the City Council has mandated a 100% Zero-Carbon Initiative. Fossil fuel power plants and heavy industrial zoning are strictly forbidden. You must harness solar, wind, and geothermal energy to grow a 10,000-resident eco-metropolis with zero smog emissions.`,
  },
  {
    id: 'scen_preset_03',
    scenarioId: 'scen-03', // Municipal Bankruptcy Insolvency
    mapDimensions: { width: 64, height: 64 },
    initialPopulation: 3500,
    initialTreasury: -250000,
    damagedBuildingsCount: 12,
    damagedRoadsCount: 15,
    activeDisasters: [],
    victoryConditions: {
      minTreasury: 100000,
      minMonthlyCashFlow: 5000,
      minHappiness: 55,
      timeLimitMonths: 18,
    },
    narrativeBriefing: `Mayor, previous administration left the city owing $250,000 in high-interest municipal bonds. Creditors are threatening to seize city assets within 18 months. Restructure tax rates, audit inefficient municipal departments, and achieve a positive monthly cash flow of at least +$5,000.`,
  },
  {
    id: 'scen_preset_04',
    scenarioId: 'scen-04', // Silicon Bay Tech Boom
    mapDimensions: { width: 64, height: 64 },
    initialPopulation: 2000,
    initialTreasury: 500000,
    damagedBuildingsCount: 0,
    damagedRoadsCount: 0,
    activeDisasters: [],
    victoryConditions: {
      minPopulation: 15000,
      minEducationIndex: 90,
      minTechCompaniesCount: 20,
      timeLimitMonths: 48,
    },
    narrativeBriefing: `Mayor, Silicon Bay possesses immense economic potential. Construct a world-class research university, attract high-tech commercial incubators, and build high-density housing for 15,000 educated engineers.`,
  },
];

export function getScenarioPresetById(scenarioId) {
  return SCENARIO_PRESETS.find((s) => s.scenarioId === scenarioId) || SCENARIO_PRESETS[0];
}

export default SCENARIO_PRESETS;
