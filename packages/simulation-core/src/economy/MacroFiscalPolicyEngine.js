/**
 * CITYMIND Keynesian Macroeconomic Fiscal Multiplier Engine
 * Computes Keynesian spending multipliers ($M = \frac{1}{1 - MPC \cdot (1 - t)}$),
 * marginal propensity to consume (MPC), government expenditure stimulus impact, and fiscal deficit sustainability ratios.
 */

export class MacroFiscalPolicyEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.mpcMarginalPropensityToConsume = 0.75;
    this.taxRatePct = 12.0;
    this.multiplierK = 2.1;
  }

  calculateFiscalMultiplier(mpc = 0.75, taxRate = 0.12) {
    this.mpcMarginalPropensityToConsume = mpc;
    this.taxRatePct = taxRate * 100;

    // Keynesian Multiplier: K = 1 / (1 - MPC * (1 - taxRate))
    const denominator = 1 - this.mpcMarginalPropensityToConsume * (1 - taxRate);
    this.multiplierK = Math.round((1 / Math.max(0.05, denominator)) * 100) / 100;
    return this.multiplierK;
  }

  calculateStimulusImpact(governmentSpendingAmount) {
    const totalGdpImpact = governmentSpendingAmount * this.multiplierK;
    return {
      stimulusInput: governmentSpendingAmount,
      multiplierK: this.multiplierK,
      totalGdpImpact: Math.round(totalGdpImpact),
    };
  }

  getFiscalSummary() {
    return {
      mpcMarginalPropensityToConsume: this.mpcMarginalPropensityToConsume,
      taxRatePct: this.taxRatePct,
      multiplierK: this.multiplierK,
    };
  }
}

export default MacroFiscalPolicyEngine;
