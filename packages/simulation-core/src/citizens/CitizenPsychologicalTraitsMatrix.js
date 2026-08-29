/**
 * CITYMIND Citizen Psychological Trait Matrix & Cognitive Bias Engine
 * Evaluates Big-5 OCEAN psychological trait interactions, cognitive decision biases (Loss Aversion, Confirmation Bias, Herd Mentality),
 * emotional resilience factors, and mental wellness index calculations.
 */

export class CognitiveBiasProfile {
  constructor(citizenId, oceanTraits = {}) {
    this.citizenId = citizenId;
    this.openness = oceanTraits.openness || 50;
    this.conscientiousness = oceanTraits.conscientiousness || 50;
    this.extraversion = oceanTraits.extraversion || 50;
    this.agreeableness = oceanTraits.agreeableness || 50;
    this.neuroticism = oceanTraits.neuroticism || 50;

    // Derived Cognitive Biases:
    this.lossAversionFactor = (100 - this.openness) * 0.02 + this.neuroticism * 0.015; // 0.5 to 3.5
    this.herdMentalityIndex = (100 - this.openness) * 0.4 + this.extraversion * 0.6; // 0 to 100
    this.confirmationBiasFactor = (100 - this.agreeableness) * 0.01 + 0.8;
  }

  evaluateRiskTolerance() {
    const score = (this.openness * 0.4 + (100 - this.neuroticism) * 0.4 + this.extraversion * 0.2) / this.lossAversionFactor;
    return Math.max(1, Math.min(100, Math.round(score)));
  }

  evaluateStressVulnerability(workHoursPerWeek, noisePollutionPpm) {
    const baseLoad = (workHoursPerWeek / 40.0) * 45 + noisePollutionPpm * 0.5;
    const neuroticismMultiplier = 1.0 + (this.neuroticism - 50) / 100.0;
    const conscientiousnessBuffer = (this.conscientiousness / 100.0) * 15;

    const stressScore = baseLoad * neuroticismMultiplier - conscientiousnessBuffer;
    return Math.max(0, Math.min(100, Math.round(stressScore)));
  }
}

export class CitizenPsychologicalTraitsMatrixEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.biasProfiles = new Map();
    this.averageCityWellnessIndex = 78;
  }

  getOrCreateProfile(citizen) {
    if (!this.biasProfiles.has(citizen.id)) {
      this.biasProfiles.set(citizen.id, new CognitiveBiasProfile(citizen.id, citizen.ocean));
    }
    return this.biasProfiles.get(citizen.id);
  }

  update(deltaMonths) {
    const citizens = this.simulation?.citizens?.citizensList || [];
    if (citizens.length === 0) return;

    let sumWellness = 0;
    citizens.forEach((citizen) => {
      const profile = this.getOrCreateProfile(citizen);
      const stress = profile.evaluateStressVulnerability(42, 15);
      const wellness = Math.max(0, 100 - stress);
      sumWellness += wellness;
    });

    this.averageCityWellnessIndex = Math.round(sumWellness / citizens.length);
  }

  getPsychologicalMatrixSummary() {
    return {
      evaluatedProfilesCount: this.biasProfiles.size,
      averageCityWellnessIndex: this.averageCityWellnessIndex,
    };
  }
}

export default CitizenPsychologicalTraitsMatrixEngine;
