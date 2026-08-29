/**
 * CITYMIND City Analytics Reporter & Time-Series Data Aggregator
 * Collects periodic snapshots of municipal metrics (Treasury, Population, GDP, Happiness, Pollution, Traffic),
 * formats structured JSON time-series reports, and calculates historical growth trends.
 */

export class AnalyticsSnapshot {
  constructor(stats = {}) {
    this.timestamp = Date.now();
    this.population = stats.population || 1250;
    this.treasury = stats.treasury || 250000;
    this.gdp = stats.gdp || 1200000;
    this.happiness = stats.happiness || 78;
    this.pollutionLevel = stats.pollutionLevel || 15;
    this.trafficCongestion = stats.trafficCongestion || 22;
  }
}

export class CityAnalyticsReporterEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.historySnapshots = [];
    this.maxHistoryLength = 120; // 10 years of monthly data
  }

  takeSnapshot() {
    const stats = this.simulation?.stats || {};
    const snapshot = new AnalyticsSnapshot(stats);
    this.historySnapshots.push(snapshot);

    if (this.historySnapshots.length > this.maxHistoryLength) {
      this.historySnapshots.shift();
    }
    return snapshot;
  }

  calculateGrowthRates() {
    if (this.historySnapshots.length < 2) {
      return { populationGrowthPct: 0, gdpGrowthPct: 0 };
    }

    const first = this.historySnapshots[0];
    const last = this.historySnapshots[this.historySnapshots.length - 1];

    const popGrowth = ((last.population - first.population) / Math.max(1, first.population)) * 100;
    const gdpGrowth = ((last.gdp - first.gdp) / Math.max(1, first.gdp)) * 100;

    return {
      populationGrowthPct: Math.round(popGrowth * 10) / 10,
      gdpGrowthPct: Math.round(gdpGrowth * 10) / 10,
    };
  }
}

export default CityAnalyticsReporterEngine;
