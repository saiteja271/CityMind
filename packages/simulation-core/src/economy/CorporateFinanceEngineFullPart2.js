/**
 * CITYMIND Corporate Financial Accounting & Balance Sheet Auditor
 * Computes corporate quarterly income statements, retained earnings reinvestment,
 * corporate tax obligations, and solvency ratio auditing.
 */

export class CorporateFinancialAuditor {
  constructor(companyName, initialEquity = 1000000) {
    this.companyName = companyName;
    this.cashEquity = initialEquity;
    this.retainedEarnings = 250000;
    this.quarterlyRevenue = 450000;
    this.quarterlyExpenses = 320000;
    this.solvencyRatio = 2.4;
  }

  processQuarterlyAudit(taxRate = 0.15) {
    const grossOperatingProfit = this.quarterlyRevenue - this.quarterlyExpenses;
    const taxOwed = Math.max(0, grossOperatingProfit * taxRate);
    const netIncomeAfterTax = grossOperatingProfit - taxOwed;

    if (netIncomeAfterTax > 0) {
      this.retainedEarnings += netIncomeAfterTax * 0.65; // 65% retained
      this.cashEquity += netIncomeAfterTax * 0.35;
    } else {
      this.cashEquity += netIncomeAfterTax; // Deduct losses
    }

    this.solvencyRatio = this.cashEquity / Math.max(1, this.quarterlyExpenses);
    return {
      grossOperatingProfit,
      taxOwed,
      netIncomeAfterTax,
      solvencyRatio: Math.round(this.solvencyRatio * 100) / 100,
    };
  }
}

export class CorporateFinanceEngineFullPart2 {
  constructor(simulation) {
    this.simulation = simulation;
    this.auditorsMap = new Map();
  }

  registerCompanyAudit(companyName, initialEquity) {
    const auditor = new CorporateFinancialAuditor(companyName, initialEquity);
    this.auditorsMap.set(companyName, auditor);
    return auditor;
  }

  update(deltaMonths) {
    let totalTaxOwed = 0;
    this.auditorsMap.forEach((auditor) => {
      const res = auditor.processQuarterlyAudit(0.15);
      totalTaxOwed += res.taxOwed;
    });

    if (this.simulation?.stats) {
      this.simulation.stats.treasury += Math.round(totalTaxOwed);
    }
  }
}

export default CorporateFinanceEngineFullPart2;
