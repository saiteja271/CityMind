/**
 * HappinessSystem - Aggregates individual, district, and city happiness.
 */

export class HappinessSystem {
  constructor(simulation) {
    this.sim = simulation;
    this.history = [];
  }

  updateAll() {
    const factors = this.sim.getCityFactors();
    let sum = 0;
    let count = 0;
    for (const c of this.sim.citizens.getAlive()) {
      c.recalculateHappiness(factors);
      sum += c.happiness;
      count++;
    }
    const cityHappiness = count > 0 ? sum / count : 50;
    this.history.push({
      tick: this.sim.time.totalTicks,
      city: cityHappiness,
      population: count
    });
    if (this.history.length > 100) this.history.shift();
    return cityHappiness;
  }

  getCityHappiness() {
    const alive = this.sim.citizens.getAlive();
    if (alive.length === 0) return 50;
    return alive.reduce((s, c) => s + c.happiness, 0) / alive.length;
  }

  getDistribution() {
    const buckets = { low: 0, medium: 0, high: 0 };
    for (const c of this.sim.citizens.getAlive()) {
      if (c.happiness < 35) buckets.low++;
      else if (c.happiness < 65) buckets.medium++;
      else buckets.high++;
    }
    return buckets;
  }
}

export default HappinessSystem;
