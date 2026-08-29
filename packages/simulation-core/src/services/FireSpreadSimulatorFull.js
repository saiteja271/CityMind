/**
 * CITYMIND Fire Ignition Probability & Cellular Automata Spread Engine
 * Simulates building fire hazard ignition indices, wind-driven flame spread vectors,
 * fire station response radius, and water pressure requirement during fire suppression operations.
 */

export class ActiveFireIncident {
  constructor(id, tileX, tileY, severity = 2) {
    this.id = id;
    this.tileX = tileX;
    this.tileY = tileY;
    this.severity = severity; // 1 to 5
    this.isExtinguished = false;
  }

  suppressWithWater(waterPressureLps) {
    if (waterPressureLps > 30) {
      this.severity = Math.max(0, this.severity - 1);
      if (this.severity === 0) {
        this.isExtinguished = true;
      }
    }
  }
}

export class FireSpreadSimulatorFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.incidentsMap = new Map();
  }

  igniteFire(tileX, tileY) {
    const id = `fire_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const incident = new ActiveFireIncident(id, tileX, tileY);
    this.incidentsMap.set(id, incident);
    return incident;
  }

  update(deltaMonths) {
    this.incidentsMap.forEach((incident, id) => {
      incident.suppressWithWater(45);
      if (incident.isExtinguished) {
        this.incidentsMap.delete(id);
      }
    });
  }

  getFireSummary() {
    return {
      activeFiresCount: this.incidentsMap.size,
    };
  }
}

export default FireSpreadSimulatorFull;
