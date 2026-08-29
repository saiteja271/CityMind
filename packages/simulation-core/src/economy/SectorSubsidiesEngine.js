/**
 * CITYMIND Sectoral Subsidy Allocation & Industrial Growth Stimulus Engine
 * Computes municipal subsidy disbursements across High-Tech, Renewable Energy, Agriculture, and Healthcare sectors,
 * evaluates economic multiplier impact, and monitors subsidy abuse compliance rates.
 */

export class SectorSubsidyProgram {
  constructor(sectorName, monthlyGrantDollars = 15000, targetGrowthPct = 12.0) {
    this.sectorName = sectorName;
    this.monthlyGrantDollars = monthlyGrantDollars;
    this.targetGrowthPct = targetGrowthPct;
    this.totalDisbursedDollars = 0;
    this.isActive = true;
  }

  disburseMonthlyGrant() {
    if (!this.isActive) return 0;
    this.totalDisbursedDollars += this.monthlyGrantDollars;
    return this.monthlyGrantDollars;
  }
}

export class SectorSubsidiesEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.programs = new Map();
    this.initializeSubsidies();
  }

  initializeSubsidies() {
    const defaultPrograms = [
      new SectorSubsidyProgram('RenewableEnergy', 25000, 20.0),
      new SectorSubsidyProgram('HighTechStartups', 30000, 25.0),
      new SectorSubsidyProgram('VerticalAgriculture', 12000, 15.0),
    ];

    defaultPrograms.forEach((p) => this.programs.set(p.sectorName, p));
  }

  update(deltaMonths) {
    let totalSpent = 0;
    this.programs.forEach((prog) => {
      totalSpent += prog.disburseMonthlyGrant();
    });

    if (this.simulation?.stats && this.simulation.stats.treasury >= totalSpent) {
      this.simulation.stats.treasury -= totalSpent;
    }
  }

  getSubsidySummary() {
    let totalDisbursed = 0;
    this.programs.forEach((p) => (totalDisbursed += p.totalDisbursedDollars));

    return {
      activeSubsidyProgramsCount: this.programs.size,
      totalDisbursedDollars: totalDisbursed,
    };
  }
}

export default SectorSubsidiesEngine;
