/**
 * CITYMIND Macro and Micro Economic Simulation Engine
 * Simulates city treasury management, municipal tax brackets (Residential, Commercial, Industrial, Carbon, Wealth),
 * Keynesian fiscal multipliers, Taylor-rule central bank interest rates, municipal bond issuance, and GDP calculations.
 */

export class CityTreasuryLedger {
  constructor(initialBalanceDollars = 250000) {
    this.treasuryBalance = initialBalanceDollars;
    this.monthlyTaxRevenue = 45000;
    this.monthlyMaintenanceExpenditure = 28000;
    this.monthlyServiceExpenditure = 12000;
    this.monthlyDebtServiceExpenditure = 2500;
    this.historicalLedgerLogs = [];
  }

  recordTransaction(type, category, amountDollars, description) {
    if (type === 'REVENUE') {
      this.treasuryBalance += amountDollars;
    } else if (type === 'EXPENDITURE') {
      this.treasuryBalance -= amountDollars;
    }

    const logEntry = {
      timestamp: Date.now(),
      type,
      category, // 'Tax', 'ServiceMaintenance', 'BondYield', 'Subsidies', 'Infrastructure'
      amountDollars,
      description,
      resultingBalance: this.treasuryBalance,
    };

    this.historicalLedgerLogs.push(logEntry);
    if (this.historicalLedgerLogs.length > 500) {
      this.historicalLedgerLogs.shift();
    }
    return logEntry;
  }

  getMonthlyNetCashFlow() {
    return this.monthlyTaxRevenue - (this.monthlyMaintenanceExpenditure + this.monthlyServiceExpenditure + this.monthlyDebtServiceExpenditure);
  }
}

export class MacroEconomicForecast {
  constructor() {
    this.nominalGdpDollars = 12500000;
    this.cpiInflationRatePct = 2.4; // 2.4% annual inflation
    this.centralBankPolicyRatePct = 3.25; // 3.25% base rate
    this.unemploymentRatePct = 4.2;
    this.keynesianMultiplierK = 2.15;
  }

  calculateTaylorRuleRate(currentInflationPct, outputGapPct) {
    // Taylor Rule Equation: r = target_r + pi + 0.5*(pi - target_pi) + 0.5*output_gap
    const targetInflation = 2.0;
    const neutralRate = 2.0;
    const inflationGap = currentInflationPct - targetInflation;

    const calculatedRate = neutralRate + currentInflationPct + 0.5 * inflationGap + 0.5 * outputGapPct;
    this.centralBankPolicyRatePct = Math.max(0.25, Math.min(15.0, Math.round(calculatedRate * 100) / 100));
    return this.centralBankPolicyRatePct;
  }

  updateGdp(population, avgSalary, businessInvestments, govSpending) {
    // Keynesian Expenditure Model: GDP = C + I + G + (X - M)
    const consumptionC = population * avgSalary * 0.75;
    const investmentI = businessInvestments * 1.2;
    const govG = govSpending * this.keynesianMultiplierK;

    this.nominalGdpDollars = Math.round(consumptionC + investmentI + govG);
    return this.nominalGdpDollars;
  }
}

export class EconomyEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.ledger = new CityTreasuryLedger(250000);
    this.macroForecast = new MacroEconomicForecast();

    this.taxRatesPct = {
      residentialLow: 8.0,
      residentialHigh: 14.0,
      commercial: 12.0,
      industrial: 15.0,
      carbonTax: 5.0,
      wealthTax: 2.0,
    };
  }

  updateTaxRates(newTaxRatesObj) {
    this.taxRatesPct = { ...this.taxRatesPct, ...newTaxRatesObj };
  }

  processMonthlyFinancialTick(populationCount, businessCount, activeInfrastructureCount) {
    // 1. Calculate Tax Revenue
    const resRevenue = populationCount * 45 * (this.taxRatesPct.residentialLow / 100.0);
    const commRevenue = businessCount * 250 * (this.taxRatesPct.commercial / 100.0);
    const indRevenue = businessCount * 400 * (this.taxRatesPct.industrial / 100.0);

    const totalMonthlyTax = Math.round(resRevenue + commRevenue + indRevenue);
    this.ledger.monthlyTaxRevenue = totalMonthlyTax;
    this.ledger.recordTransaction('REVENUE', 'Tax', totalMonthlyTax, 'Monthly Municipal Tax Collection');

    // 2. Calculate Maintenance Expenditures
    const maintExpense = Math.round(activeInfrastructureCount * 120);
    this.ledger.monthlyMaintenanceExpenditure = maintExpense;
    this.ledger.recordTransaction('EXPENDITURE', 'ServiceMaintenance', maintExpense, 'Monthly Infrastructure Maintenance');

    // 3. Update Macroeconomic Indicators
    const outputGap = (totalMonthlyTax > 50000 ? 0.8 : -0.5);
    this.macroForecast.calculateTaylorRuleRate(this.macroForecast.cpiInflationRatePct, outputGap);
    this.macroForecast.updateGdp(populationCount, 62000, businessCount * 15000, maintExpense);

    return {
      treasuryBalance: this.ledger.treasuryBalance,
      monthlyTaxRevenue: totalMonthlyTax,
      monthlyMaintenanceExpenditure: maintExpense,
      netCashFlow: this.ledger.getMonthlyNetCashFlow(),
      gdp: this.macroForecast.nominalGdpDollars,
      centralBankRate: this.macroForecast.centralBankPolicyRatePct,
    };
  }

  getEconomicSummary() {
    return {
      treasuryBalanceDollars: this.ledger.treasuryBalance,
      taxRatesPct: this.taxRatesPct,
      nominalGdpDollars: this.macroForecast.nominalGdpDollars,
      cpiInflationRatePct: this.macroForecast.cpiInflationRatePct,
      centralBankPolicyRatePct: this.macroForecast.centralBankPolicyRatePct,
      keynesianMultiplierK: this.macroForecast.keynesianMultiplierK,
      recentTransactions: this.ledger.historicalLedgerLogs.slice(-10),
    };
  }
}

export default EconomyEngine;
