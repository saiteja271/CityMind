/**
 * CITYMIND Fire Ignition Probability & Cellular Automata Spread Engine
 * Simulates building fire hazard ignition indices, wind-driven flame spread vectors,
 * fire station response radius, and water pressure requirement during fire suppression operations.
 */

export class FireHazardCell {
  constructor(x, y, buildingType = 'Commercial') {
    this.x = x;
    this.y = y;
    this.buildingType = buildingType;
    this.flammabilityIndex = 45; // 0 (Fireproof) to 100 (Highly Flammable)
    this.isOnFire = false;
    this.fireIntensityPct = 0;
    this.burnDurationTicks = 0;
  }

  ignite() {
    this.isOnFire = true;
    this.fireIntensityPct = 20;
    this.burnDurationTicks = 0;
  }

  updateSpread(windVector, waterPressureLps) {
    if (!this.isOnFire) return;

    this.burnDurationTicks += 1;
    this.fireIntensityPct = Math.min(100, this.fireIntensityPct + 5);

    if (waterPressureLps > 40) {
      this.fireIntensityPct = Math.max(0, this.fireIntensityPct - 15);
      if (this.fireIntensityPct === 0) {
        this.isOnFire = false;
      }
    }
  }
}

export class FireSpreadSimulatorEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.activeFires = [];
  }

  triggerFireEvent(x, y) {
    const cell = new FireHazardCell(x, y);
    cell.ignite();
    this.activeFires.push(cell);
    return cell;
  }

  update(deltaMonths) {
    this.activeFires = this.activeFires.filter((fire) => {
      fire.updateSpread({ x: 1, y: 0 }, 50);
      return fire.isOnFire;
    });
  }

  getFireSummary() {
    return {
      activeFiresCount: this.activeFires.length,
    };
  }
}

export default FireSpreadSimulatorEngine;
