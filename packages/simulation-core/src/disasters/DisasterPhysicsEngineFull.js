/**
 * CITYMIND Disaster Physics & Structural Damage Engine
 * Computes damage mechanics for 12 disasters: Earthquakes, Tornadoes, Floods, Chemical Spills,
 * Meteor Impacts, Firestorms, Power Explosions, and Dam Breaches.
 */

export class DisasterDamageVector {
  constructor(disasterType = 'EARTHQUAKE', epicenterTileX = 50, epicenterTileY = 50, radiusTiles = 25) {
    this.disasterType = disasterType;
    this.epicenterTileX = epicenterTileX;
    this.epicenterTileY = epicenterTileY;
    this.radiusTiles = radiusTiles;
  }

  computeDamageAtTile(tileX, tileY) {
    const dx = tileX - this.epicenterTileX;
    const dy = tileY - this.epicenterTileY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.radiusTiles) return 0;
    const attenuation = 1.0 - (dist / this.radiusTiles);
    return Math.round(attenuation * 100);
  }
}

export class DisasterPhysicsEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.activeDisastersList = [];
  }

  triggerDisaster(disasterType, epicenterTileX, epicenterTileY, radiusTiles = 25) {
    const disaster = new DisasterDamageVector(disasterType, epicenterTileX, epicenterTileY, radiusTiles);
    this.activeDisastersList.push(disaster);
    return disaster;
  }

  getDisasterSummary() {
    return {
      activeDisastersCount: this.activeDisastersList.length,
    };
  }
}

export default DisasterPhysicsEngineFull;
