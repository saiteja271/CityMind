/**
 * DemandForecastEngine - Simple time-series forecasts for population, housing, traffic, budget.
 * All outputs marked as estimates.
 */
export class DemandForecastEngine {
  constructor(simulation) {
    this.sim = simulation;
    this.series = {
      population: [],
      happiness: [],
      unemployment: [],
      budget: [],
      pollution: [],
      traffic: []
    };
    this.maxHistory = 120;
  }

  record(snapshot) {
    for (const key of Object.keys(this.series)) {
      if (snapshot[key] !== undefined) {
        this.series[key].push({ t: snapshot.tick || 0, v: snapshot[key] });
        if (this.series[key].length > this.maxHistory) this.series[key].shift();
      }
    }
  }

  recordFromSimulation() {
    const cit = this.sim.citizens?.getStats?.() || {};
    const eco = this.sim.economy?.getStats?.() || {};
    this.record({
      tick: this.sim.time?.totalTicks || 0,
      population: cit.total || 0,
      happiness: cit.averageHappiness || 50,
      unemployment: cit.unemploymentRate || 0,
      budget: eco.budget || 0,
      pollution: this.sim.environment?.pollution || 0,
      traffic: 0
    });
  }

  /**
   * Linear regression forecast. Returns estimate with confidence band.
   */
  forecast(seriesName, steps = 12) {
    const data = this.series[seriesName] || [];
    if (data.length < 3) {
      return { estimate: null, low: null, high: null, confidence: 0, note: 'Insufficient data — estimate unavailable' };
    }
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i].v;
      sumXY += i * data[i].v;
      sumX2 += i * i;
    }
    const denom = n * sumX2 - sumX * sumX;
    const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const intercept = (sumY - slope * sumX) / n;
    // Residual std
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      const pred = intercept + slope * i;
      ssRes += (data[i].v - pred) ** 2;
    }
    const std = Math.sqrt(ssRes / Math.max(1, n - 2));
    const futureX = n - 1 + steps;
    const estimate = intercept + slope * futureX;
    const conf = Math.min(0.9, 0.3 + n / 100);
    return {
      estimate: Math.round(estimate * 100) / 100,
      low: Math.round((estimate - 1.96 * std) * 100) / 100,
      high: Math.round((estimate + 1.96 * std) * 100) / 100,
      confidence: conf,
      slope,
      note: 'Estimate only — based on recent linear trend'
    };
  }

  forecastAll(steps = 12) {
    const result = {};
    for (const key of Object.keys(this.series)) {
      result[key] = this.forecast(key, steps);
    }
    return result;
  }

  detectAnomalies(seriesName, threshold = 2.5) {
    const data = this.series[seriesName] || [];
    if (data.length < 5) return [];
    const values = data.map((d) => d.v);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length) || 1;
    const anomalies = [];
    for (let i = 0; i < data.length; i++) {
      const z = Math.abs((data[i].v - mean) / std);
      if (z >= threshold) {
        anomalies.push({ index: i, tick: data[i].t, value: data[i].v, zScore: z });
      }
    }
    return anomalies;
  }

  getSummary() {
    return {
      historyLengths: Object.fromEntries(Object.entries(this.series).map(([k, v]) => [k, v.length])),
      forecasts: this.forecastAll(6),
      anomalies: {
        population: this.detectAnomalies('population'),
        budget: this.detectAnomalies('budget')
      }
    };
  }
}

export default DemandForecastEngine;
