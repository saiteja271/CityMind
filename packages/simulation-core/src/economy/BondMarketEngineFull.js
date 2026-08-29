/**
 * CITYMIND Municipal Bond Issuance & Debt Servicing Engine
 * Computes municipal bond yield-to-maturity (YTM = (C + (F-P)/n) / ((F+P)/2)),
 * municipal credit rating adjustments (AAA to CCC), coupon payments, and debt-to-GDP ratio caps.
 */

export class BondIssueRecord {
  constructor(id, principalValueDollars = 100000, couponRatePct = 4.5, termYears = 10) {
    this.id = id;
    this.principalValueDollars = principalValueDollars;
    this.couponRatePct = couponRatePct;
    this.termYears = termYears;
    this.marketPriceDollars = principalValueDollars;
    this.issuanceDate = Date.now();
  }

  computeYieldToMaturity(yearsRemaining) {
    const annualCoupon = this.principalValueDollars * (this.couponRatePct / 100.0);
    const n = Math.max(0.5, yearsRemaining);

    const numerator = annualCoupon + (this.principalValueDollars - this.marketPriceDollars) / n;
    const denominator = (this.principalValueDollars + this.marketPriceDollars) / 2.0;

    const ytm = (numerator / denominator) * 100.0;
    return Math.round(ytm * 100) / 100.0;
  }
}

export class BondMarketEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.issuedBondsMap = new Map();
    this.totalMunicipalDebtDollars = 400000;
    this.cityCreditRating = 'AAA';
  }

  issueBondSeries(principalValue, couponRate, termYears) {
    const id = `bond_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const bond = new BondIssueRecord(id, principalValue, couponRate, termYears);
    this.issuedBondsMap.set(id, bond);
    this.totalMunicipalDebtDollars += principalValue;

    if (this.simulation?.stats) {
      this.simulation.stats.treasury += principalValue;
    }
    return bond;
  }

  update(deltaMonths) {
    const gdp = this.simulation?.stats?.gdp || 12000000;
    const debtRatioPct = (this.totalMunicipalDebtDollars / Math.max(1, gdp)) * 100.0;

    if (debtRatioPct > 75) this.cityCreditRating = 'CCC';
    else if (debtRatioPct > 55) this.cityCreditRating = 'BBB';
    else if (debtRatioPct > 35) this.cityCreditRating = 'A';
    else if (debtRatioPct > 15) this.cityCreditRating = 'AA';
    else this.cityCreditRating = 'AAA';
  }

  getBondMarketSummary() {
    return {
      totalIssuedBondsCount: this.issuedBondsMap.size,
      totalMunicipalDebtDollars: this.totalMunicipalDebtDollars,
      cityCreditRating: this.cityCreditRating,
    };
  }
}

export default BondMarketEngineFull;
