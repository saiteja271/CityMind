/**
 * CITYMIND Corporate Finance & Enterprise Balance Sheet Engine
 * Simulates commercial enterprise income statements, balance sheets, capital expenditure (CapEx),
 * retained earnings reinvestment, dividend payout ratios, and corporate insolvency bankruptcy triggers.
 */

export class CorporateEntityBalanceSheet {
  constructor(companyId, name, sector = 'HighTech', initialCapital = 500000) {
    this.companyId = companyId;
    this.name = name;
    this.sector = sector;
    this.cashAssets = initialCapital;
    this.propertyAssets = 1200000;
    this.shortTermLiabilities = 150000;
    this.longTermDebt = 400000;
    this.quarterlyRevenue = 280000;
    this.quarterlyExpenses = 210000;
    this.retainedEarnings = 100000;
    this.dividendPayoutRatio = 0.35; // 35% of net profit
    this.isBankrupt = false;
  }

  processQuarterlyFinancials() {
    if (this.isBankrupt) return null;

    const grossProfit = this.quarterlyRevenue - this.quarterlyExpenses;
    const taxExpense = Math.max(0, grossProfit * 0.15); // 15% Corporate Tax
    const netIncome = grossProfit - taxExpense;

    if (netIncome > 0) {
      const dividends = netIncome * this.dividendPayoutRatio;
      const retained = netIncome - dividends;
      this.cashAssets += retained;
      this.retainedEarnings += retained;
    } else {
      this.cashAssets += netIncome; // Net loss reduces cash
      if (this.cashAssets < -this.shortTermLiabilities) {
        this.isBankrupt = true;
      }
    }

    return {
      grossProfit,
      taxExpense,
      netIncome,
      cashAssets: this.cashAssets,
      isBankrupt: this.isBankrupt,
    };
  }
}

export class CorporateFinanceEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.corporations = new Map();
    this.totalCorporateTaxCollected = 145000;
    this.initializeCorporations();
  }

  initializeCorporations() {
    const defaultCompanies = [
      new CorporateEntityBalanceSheet('corp_tech_01', 'Metropolis Microelectronics Corp', 'HighTech', 850000),
      new CorporateEntityBalanceSheet('corp_retail_02', 'OmniMart Hypermarkets Group', 'Retail', 620000),
      new CorporateEntityBalanceSheet('corp_steel_03', 'Apex Heavy Industries & Steel', 'HeavyIndustrial', 1200000),
    ];

    defaultCompanies.forEach((c) => this.corporations.set(c.companyId, c));
  }

  update(deltaMonths) {
    let taxSum = 0;
    this.corporations.forEach((corp) => {
      const result = corp.processQuarterlyFinancials();
      if (result) {
        taxSum += result.taxExpense;
      }
    });

    this.totalCorporateTaxCollected += Math.round(taxSum);
  }

  getCorporateFinanceSummary() {
    const activeCount = Array.from(this.corporations.values()).filter((c) => !c.isBankrupt).length;
    return {
      totalMonitoredCorporations: this.corporations.size,
      activeCorporationsCount: activeCount,
      totalCorporateTaxCollected: this.totalCorporateTaxCollected,
    };
  }
}

export default CorporateFinanceEngineFull;
