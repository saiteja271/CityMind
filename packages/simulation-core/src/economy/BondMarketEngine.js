/**
 * CITYMIND Municipal Bond Market Issuance & Yield Rate Solver
 * Simulates city municipal bond issuances, yield-to-maturity (YTM) calculation ($YTM = \frac{C + \frac{F - P}{n}}{\frac{F + P}{2}}$),
 * credit rating degradation (AAA to CCC), coupon payment schedules, and debt-to-GDP ratio caps.
 */

export class MunicipalBondSeries {
  constructor(bondId, faceValueDollars = 100000, couponRatePct = 4.5, termYears = 10) {
    this.bondId = bondId;
    this.faceValueDollars = faceValueDollars;
    this.couponRatePct = couponRatePct;
    this.termYears = termYears;
    this.issuanceTimestamp = Date.now();
    this.marketPriceDollars = faceValueDollars;
    this.isMatured = false;
  }

  calculateYieldToMaturity(yearsRemaining) {
    const annualCoupon = this.faceValueDollars * (this.couponRatePct / 100);
    const price = Math.max(1, this.marketPriceDollars);
    const n = Math.max(0.5, yearsRemaining);

    // YTM = (Coupon + (Face - Price)/n) / ((Face + Price)/2)
    const numerator = annualCoupon + (this.faceValueDollars - price) / n;
    const denominator = (this.faceValueDollars + price) / 2;

    const ytm = (numerator / denominator) * 100;
    return Math.round(ytm * 100) / 100;
  }
}

export class BondMarketEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.issuedBonds = new Map();
    this.totalMunicipalDebtDollars = 350000;
    this.cityCreditRating = 'AAA';
  }

  issueBond(faceValueDollars, couponRatePct, termYears) {
    const bondId = `bond-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const bond = new MunicipalBondSeries(bondId, faceValueDollars, couponRatePct, termYears);
    this.issuedBonds.set(bondId, bond);
    this.totalMunicipalDebtDollars += faceValueDollars;
    return bond;
  }

  update(deltaMonths) {
    const treasury = this.simulation?.stats?.treasury || 250000;
    const gdp = this.simulation?.stats?.gdp || 1200000;
    const debtRatio = (this.totalMunicipalDebtDollars / Math.max(1, gdp)) * 100;

    if (debtRatio > 80) this.cityCreditRating = 'CCC';
    else if (debtRatio > 60) this.cityCreditRating = 'BBB';
    else if (debtRatio > 40) this.cityCreditRating = 'A';
    else if (debtRatio > 20) this.cityCreditRating = 'AA';
    else this.cityCreditRating = 'AAA';
  }

  getBondMarketSummary() {
    return {
      activeBondSeriesCount: this.issuedBonds.size,
      totalMunicipalDebtDollars: this.totalMunicipalDebtDollars,
      cityCreditRating: this.cityCreditRating,
    };
  }
}

export default BondMarketEngine;
