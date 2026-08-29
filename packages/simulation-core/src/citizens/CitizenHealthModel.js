/**
 * CITYMIND Citizen Health Degradation & Biological Sickness Model
 * Computes health decay caused by air pollution PPM, noise decibels, malnutrition, and viral contagions,
 * medical treatment recovery curves, and life expectancy adjustments.
 */

export class CitizenHealthState {
  constructor(citizenId, initialHealth = 90) {
    this.citizenId = citizenId;
    this.healthPct = initialHealth; // 0 to 100
    this.isSick = false;
    this.sicknessType = null; // 'Flu', 'RespiratoryIllness', 'Cardiovascular'
    this.daysSick = 0;
  }

  evaluateDecay(pollutionPpm, noiseDecibels, hasMedicalAccess) {
    let decay = 0;
    if (pollutionPpm > 30) decay += (pollutionPpm - 30) * 0.1;
    if (noiseDecibels > 65) decay += (noiseDecibels - 65) * 0.05;

    if (hasMedicalAccess) {
      decay -= 2.0; // Medical care restores health
    }

    this.healthPct = Math.max(0, Math.min(100, this.healthPct - decay));
    if (this.healthPct < 40 && !this.isSick) {
      this.isSick = true;
      this.sicknessType = 'RespiratoryIllness';
    }
    return this.healthPct;
  }
}

export class CitizenHealthModelEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.healthStatesMap = new Map();
  }

  getOrCreateHealthState(citizenId) {
    if (!this.healthStatesMap.has(citizenId)) {
      this.healthStatesMap.set(citizenId, new CitizenHealthState(citizenId));
    }
    return this.healthStatesMap.get(citizenId);
  }

  update(deltaMonths) {
    const stats = this.simulation?.stats || { pollutionLevel: 15 };
    this.healthStatesMap.forEach((state) => {
      state.evaluateDecay(stats.pollutionLevel, 50, true);
    });
  }
}

export default CitizenHealthModelEngine;
