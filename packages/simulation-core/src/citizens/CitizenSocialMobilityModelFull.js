/**
 * CITYMIND Social Mobility & Wealth Tier Transition Engine
 * Evaluates wealth tier promotions (Low Income -> Middle Class -> High Net Worth -> Elite),
 * education multipliers, annual salary progressions, and Gini coefficient calculations.
 */

export class WealthTierProfile {
  constructor(citizenId, initialTier = 'MiddleClass', savingsAccountDollars = 25000) {
    this.citizenId = citizenId;
    this.currentTier = initialTier; // 'LowIncome', 'MiddleClass', 'HighNetWorth', 'Elite'
    this.savingsAccountDollars = savingsAccountDollars;
    this.annualWageDollars = 55000;
  }

  evaluatePromotion(educationLevel = 'BACHELOR') {
    let mobilityScore = (this.annualWageDollars / 80000.0) * 0.5 + (this.savingsAccountDollars / 40000.0) * 0.5;
    if (educationLevel === 'MASTER' || educationLevel === 'PHD') mobilityScore += 0.3;

    if (this.currentTier === 'LowIncome' && mobilityScore > 0.75) {
      this.currentTier = 'MiddleClass';
      return true;
    }
    if (this.currentTier === 'MiddleClass' && mobilityScore > 1.25) {
      this.currentTier = 'HighNetWorth';
      return true;
    }
    if (this.currentTier === 'HighNetWorth' && mobilityScore > 2.10) {
      this.currentTier = 'Elite';
      return true;
    }
    return false;
  }
}

export class CitizenSocialMobilityModelFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.profilesMap = new Map();
    this.giniCoefficient = 0.33;
  }

  getOrCreateProfile(citizenId) {
    if (!this.profilesMap.has(citizenId)) {
      this.profilesMap.set(citizenId, new WealthTierProfile(citizenId));
    }
    return this.profilesMap.get(citizenId);
  }

  calculateGiniCoefficient(incomesList) {
    if (!incomesList || incomesList.length < 2) return 0.33;

    const sorted = incomesList.slice().sort((a, b) => a - b);
    const n = sorted.length;
    let sumDiff = 0;
    let sumIncome = 0;

    for (let i = 0; i < n; i++) {
      sumIncome += sorted[i];
      for (let j = 0; j < n; j++) {
        sumDiff += Math.abs(sorted[i] - sorted[j]);
      }
    }

    const mean = sumIncome / n;
    this.giniCoefficient = Math.round((sumDiff / (2 * n * n * Math.max(1, mean))) * 1000) / 1000;
    return this.giniCoefficient;
  }

  getSocialMobilitySummary() {
    return {
      trackedCitizensCount: this.profilesMap.size,
      giniCoefficient: this.giniCoefficient,
    };
  }
}

export default CitizenSocialMobilityModelFull;
