/**
 * CITYMIND Extended Scenario Scripts & Objective Validation Engine (Part 2)
 * Full scripted logic for scenarios 6 through 15:
 * Outbreak Isolation, Crime Wave Precinct Lockdown, Utopia Megacity, Rustbelt Revitalization,
 * Smart City Frontier, Tourism Renaissance, Agrarian Food Sovereignty, Olympic Hosting, Sea Wall Defense.
 */

export class ExtendedScenarioScript {
  constructor(scenarioId, title, category, targetStats) {
    this.scenarioId = scenarioId;
    this.title = title;
    this.category = category;
    this.targetStats = targetStats;
    this.isCompleted = false;
    this.isFailed = false;
  }

  evaluateState(simulationState) {
    if (this.isCompleted || this.isFailed) return;

    const stats = simulationState?.stats || {};
    let passed = true;

    if (this.targetStats.minPopulation && (stats.population || 0) < this.targetStats.minPopulation) passed = false;
    if (this.targetStats.minHappiness && (stats.happiness || 0) < this.targetStats.minHappiness) passed = false;
    if (this.targetStats.maxCrime && (stats.crimeRate || 0) > this.targetStats.maxCrime) passed = false;
    if (this.targetStats.maxPollution && (stats.pollutionLevel || 0) > this.targetStats.maxPollution) passed = false;
    if (this.targetStats.minTreasury && (stats.treasury || 0) < this.targetStats.minTreasury) passed = false;

    if (passed) {
      this.isCompleted = true;
    }
  }
}

export class ExtendedScenarioEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.scenarios = new Map();
    this.initializeScenarios();
  }

  initializeScenarios() {
    const list = [
      new ExtendedScenarioScript('scen-06', 'Viral Outbreak Isolation', 'Healthcare', { minPopulation: 7000, minHappiness: 70, maxCrime: 15 }),
      new ExtendedScenarioScript('scen-07', 'Crime Wave Precinct Lockdown', 'Safety', { minPopulation: 9000, maxCrime: 5 }),
      new ExtendedScenarioScript('scen-08', 'Utopian Dream Megacity', 'Utopia', { minPopulation: 25000, minHappiness: 95, maxCrime: 0, maxPollution: 0 }),
      new ExtendedScenarioScript('scen-09', 'Rustbelt Industrial Revitalization', 'Growth', { minPopulation: 12000, minHappiness: 80, minTreasury: 200000 }),
      new ExtendedScenarioScript('scen-10', 'Smart City Frontier', 'Infrastructure', { minPopulation: 15000, minHappiness: 85 }),
      new ExtendedScenarioScript('scen-11', 'Tourism & Cultural Renaissance', 'Growth', { minPopulation: 10000, minHappiness: 88, minTreasury: 400000 }),
      new ExtendedScenarioScript('scen-12', 'Agrarian & Food Sovereignty', 'Environment', { minPopulation: 8000, minHappiness: 80, maxPollution: 5 }),
      new ExtendedScenarioScript('scen-13', 'Olympic Games Hosting', 'Growth', { minPopulation: 20000, minHappiness: 90, minTreasury: 500000 }),
      new ExtendedScenarioScript('scen-14', 'Coastal Flood & Sea Wall Defense', 'Disaster', { minPopulation: 11000, minHappiness: 75 }),
      new ExtendedScenarioScript('scen-15', 'Zero-Carbon Industrial Mandate', 'Environment', { minPopulation: 14000, maxPollution: 0 }),
    ];

    list.forEach((s) => this.scenarios.set(s.scenarioId, s));
  }

  evaluateActiveScenario(scenarioId, simulationState) {
    const scen = this.scenarios.get(scenarioId);
    if (scen) {
      scen.evaluateState(simulationState);
      return scen;
    }
    return null;
  }
}

export default ExtendedScenarioEngine;
