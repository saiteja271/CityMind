/**
 * CITYMIND Central Bank Policy & Interest Rate Reaction Engine
 * Simulates Taylor-rule central bank interest rate decisions ($r = r^* + \pi + 0.5(\pi - \pi^*) + 0.5(y - y^*)$),
 * reserve requirement mandates, and commercial bank liquidity operations.
 */

export class CentralBankPolicyRatesEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.basePolicyRatePct = 3.5; // 3.5% base rate
    this.targetInflationPct = 2.0; // 2.0% target inflation
    this.targetGdpGrowthPct = 2.5; // 2.5% target growth
    this.rateHistory = [3.5];
  }

  evaluateTaylorRuleRate(currentInflationPct, currentGdpGrowthPct) {
    const inflationGap = currentInflationPct - this.targetInflationPct;
    const outputGap = currentGdpGrowthPct - this.targetGdpGrowthPct;

    // Taylor Rule: r = 2.0 + inflation + 0.5*(inflation - 2.0) + 0.5*(outputGap)
    const taylorRate = 2.0 + currentInflationPct + 0.5 * inflationGap + 0.5 * outputGap;
    this.basePolicyRatePct = Math.max(0.25, Math.min(15.0, Math.round(taylorRate * 100) / 100));

    this.rateHistory.push(this.basePolicyRatePct);
    if (this.rateHistory.length > 50) this.rateHistory.shift();

    return this.basePolicyRatePct;
  }

  getPolicyRateSummary() {
    return {
      basePolicyRatePct: this.basePolicyRatePct,
      targetInflationPct: this.targetInflationPct,
      targetGdpGrowthPct: this.targetGdpGrowthPct,
      rateHistory: this.rateHistory,
    };
  }
}

export default CentralBankPolicyRatesEngine;
