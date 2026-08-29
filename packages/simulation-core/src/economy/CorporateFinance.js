/**
 * CITYMIND Corporate Financial Simulation Engine
 * Simulates commercial and industrial business accounting, balance sheets, profit & loss (P&L),
 * cash flow statements, debt restructuring, bankruptcy liquidations, and employee payroll management.
 */

export class CorporateBalanceSheet {
  constructor(companyName, sector) {
    this.companyName = companyName;
    this.sector = sector; // 'Retail', 'HighTech', 'Manufacturing', 'Logistics', 'Services'
    this.cashAssets = 150000;
    this.propertyAssets = 450000;
    this.inventoryAssets = 80000;
    this.shortTermDebt = 35000;
    this.longTermBonds = 120000;
    this.monthlyRevenue = 45000;
    this.monthlyPayroll = 22000;
    this.monthlyRentAndUtilities = 6500;
    this.monthlyRawMaterialsCost = 8500;
    this.isBankrupt = false;
    this.creditRating = 'A'; // 'AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D'
  }

  calculateMonthlyNetProfit() {
    const totalExpenses = this.monthlyPayroll + this.monthlyRentAndUtilities + this.monthlyRawMaterialsCost;
    const debtInterest = (this.shortTermDebt * 0.08 / 12) + (this.longTermBonds * 0.05 / 12);
    return Math.round(this.monthlyRevenue - totalExpenses - debtInterest);
  }

  processMonthlyFinancialTick() {
    if (this.isBankrupt) return;

    const netProfit = this.calculateMonthlyNetProfit();
    this.cashAssets += netProfit;

    if (this.cashAssets < 0) {
      if (this.cashAssets + this.propertyAssets > 0) {
        // Distressed company emergency restructuring
        this.creditRating = 'CCC';
        this.shortTermDebt += Math.abs(this.cashAssets);
        this.cashAssets = 5000;
      } else {
        // Insolvency liquidation
        this.isBankrupt = true;
        this.creditRating = 'D';
        this.cashAssets = 0;
      }
    } else if (this.cashAssets > 300000) {
      this.creditRating = 'AAA';
    }
  }

  getFinancialReport() {
    const totalAssets = this.cashAssets + this.propertyAssets + this.inventoryAssets;
    const totalLiabilities = this.shortTermDebt + this.longTermBonds;
    const equity = totalAssets - totalLiabilities;

    return {
      companyName: this.companyName,
      sector: this.sector,
      totalAssets,
      totalLiabilities,
      equity,
      monthlyRevenue: this.monthlyRevenue,
      monthlyNetProfit: this.calculateMonthlyNetProfit(),
      creditRating: this.creditRating,
      isBankrupt: this.isBankrupt,
    };
  }
}

export class CorporateFinanceEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.corporations = new Map();
    this.initializeCorporations();
  }

  initializeCorporations() {
    const samples = [
      { name: 'Apex Microelectronics Corp', sector: 'HighTech' },
      { name: 'Metro General Supermarkets', sector: 'Retail' },
      { name: 'Titan Steel & Forging Works', sector: 'Manufacturing' },
      { name: 'Horizon Logistics & Cargo', sector: 'Logistics' },
      { name: 'Metropolis Cloud Services', sector: 'Services' },
    ];

    samples.forEach((s) => {
      const corp = new CorporateBalanceSheet(s.name, s.sector);
      this.corporations.set(s.name, corp);
    });
  }

  update(deltaMonths) {
    this.corporations.forEach((corp) => {
      corp.processMonthlyFinancialTick();
    });
  }

  getCorporateSectorSummary() {
    const reports = [];
    let totalRevenue = 0;
    let totalProfits = 0;
    let bankruptCount = 0;

    this.corporations.forEach((corp) => {
      const rep = corp.getFinancialReport();
      reports.push(rep);
      totalRevenue += rep.monthlyRevenue;
      totalProfits += rep.monthlyNetProfit;
      if (rep.isBankrupt) bankruptCount++;
    });

    return {
      corporationCount: this.corporations.size,
      bankruptCount,
      totalSectorRevenue: totalRevenue,
      totalSectorProfits: totalProfits,
      reports,
    };
  }
}

export default CorporateFinanceEngine;
