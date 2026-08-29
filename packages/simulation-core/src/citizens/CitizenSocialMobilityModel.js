/**
 * CITYMIND Social Mobility & Socio-Economic Class Migration Model
 * Computes intergenerational social mobility transitions between wealth tiers (Low Income, Middle Class, High Net Worth, Elite),
 * education tier influence, and income inequality Gini coefficient ($G = \frac{\sum_{i=1}^n \sum_{j=1}^n |x_i - x_j|}{2n^2 \bar{x}}$).
 */

export class SocialMobilityProfile {
  constructor(citizenId, currentWealthTier = 'MiddleClass', savingsAccountDollars = 25000) {
    this.citizenId = citizenId;
    this.currentWealthTier = currentWealthTier; // 'LowIncome', 'MiddleClass', 'HighNetWorth', 'Elite'
    this.savingsAccountDollars = savingsAccountDollars;
    this.socialMobilityScore = 55; // 0 to 100
  }

  evaluateClassPromotion(educationTier = 'Bachelor', annualWageDollars = 65000) {
    let promotionProbability = (annualWageDollars / 100000.0) * 0.4 + (this.savingsAccountDollars / 50000.0) * 0.3;
    if (educationTier === 'Master' || educationTier === 'PhD') promotionProbability += 0.25;

    if (promotionProbability > 0.8 && this.currentWealthTier === 'LowIncome') {
      this.currentWealthTier = 'MiddleClass';
      return { promoted: true, newTier: 'MiddleClass' };
    }
    if (promotionProbability > 1.2 && this.currentWealthTier === 'MiddleClass') {
      this.currentWealthTier = 'HighNetWorth';
      return { promoted: true, newTier: 'HighNetWorth' };
    }
    return { promoted: false, currentTier: this.currentWealthTier };
  }
}

export class CitizenSocialMobilityEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.profiles = new Map();
    this.cityGiniCoefficient = 0.32; // 0.0 (Perfect equality) to 1.0 (Maximum inequality)
  }

  getOrCreateMobilityProfile(citizenId) {
    if (!this.profiles.has(citizenId)) {
      this.profiles.set(citizenId, new SocialMobilityProfile(citizenId));
    }
    return this.profiles.get(citizenId);
  }

  calculateCityGiniCoefficient(incomesList) {
    if (!incomesList || incomesList.length < 2) return 0.32;

    const sorted = incomesList.slice().sort((a, b) => a - b);
    const n = sorted.length;
    let sumAbsoluteDiff = 0;
    let sumIncome = 0;

    for (let i = 0; i < n; i++) {
      sumIncome += sorted[i];
      for (let j = 0; j < n; j++) {
        sumAbsoluteDiff += Math.abs(sorted[i] - sorted[j]);
      }
    }

    const meanIncome = sumIncome / n;
    this.cityGiniCoefficient = Math.round((sumAbsoluteDiff / (2 * n * n * Math.max(1, meanIncome))) * 1000) / 1000;
    return this.cityGiniCoefficient;
  }

  getMobilitySummary() {
    return {
      monitoredProfilesCount: this.profiles.size,
      cityGiniCoefficient: this.cityGiniCoefficient,
    };
  }
}

export default CitizenSocialMobilityEngine;
