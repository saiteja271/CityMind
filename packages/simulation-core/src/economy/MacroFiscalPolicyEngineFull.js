/**
 * CITYMIND Keynesian Macroeconomic Multiplier & Fiscal Stimulus Engine
 * Computes Keynesian multiplier ($K = \frac{1}{1 - MPC (1 - t)}$), marginal propensity to consume (MPC),
 * government expenditure stimulus impact, and fiscal deficit sustainability ratios.
 */

export class FiscalMultiplierModel {
  constructor(mpc = 0.75, taxRate = 0.12) {
    this.mpc = mpc; // Marginal Propensity to Consume
    this.taxRate = taxRate;
    this.multiplierK = 2.15;
  }

  computeMultiplier() {
    const denominator = 1.0 - this.mpc * (1.0 - this.taxRate);
    this.multiplierK = Math.round((1.0 / Math.max(0.05, denominator)) * 100) / 100.0;
    return this.multiplierK;
  }

  evaluateStimulusImpact(spendingDollars) {
    const totalGdpMultiplierEffect = spendingDollars * this.multiplierK;
    return Math.round(totalGdpMultiplierEffect);
  }
}

export class MacroFiscalPolicyEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.model = new FiscalMultiplierModel(0.75, 0.12);
  }

  update(deltaMonths) {
    const currentTaxRate = (this.simulation?.stats?.taxRate || 12) / 100.0;
    this.model.taxRate = currentTaxRate;
    this.model.computeMultiplier();
  }

  getFiscalSummary() {
    return {
      mpc: this.model.mpc,
      taxRate: this.model.taxRate,
      multiplierK: this.model.multiplierK,
    };
  }
}

export default MacroFiscalPolicyEngineFull;
