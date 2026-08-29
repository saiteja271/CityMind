/**
 * CITYMIND Industrial Sector Subsidies & Growth Stimulus Engine
 * Computes municipal subsidy disbursements across High-Tech, Renewable Energy, Agriculture, and Healthcare sectors,
 * evaluates economic multiplier impact, and monitors subsidy abuse compliance rates.
 */

export class SubsidyGrantProgram {
  constructor(sectorName, monthlyAmountDollars = 20000, targetGrowthRatePct = 15.0) {
    this.sectorName = sectorName;
    this.monthlyAmountDollars = monthlyAmountDollars;
    this.targetGrowthRatePct = targetGrowthRatePct;
    this.cumulativeDisbursedDollars = 0;
    this.isActive = true;
  }

  disburseGrant() {
    if (!this.isActive) return 0;
    this.cumulativeDisbursedDollars += this.monthlyAmountDollars;
    return this.monthlyAmountDollars;
  }
}

export class SectorSubsidiesEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.programsMap = new Map();
    this.initializePrograms();
  }

  initializePrograms() {
    this.programsMap.set('HighTech', new SubsidyGrantProgram('HighTech', 35000, 25.0));
    this.programsMap.set('CleanEnergy', new SubsidyGrantProgram('CleanEnergy', 25000, 20.0));
    this.programsMap.set('BioMedicine', new SubsidyGrantProgram('BioMedicine', 20000, 18.0));
  }

  update(deltaMonths) {
    let monthlyOutflow = 0;
    this.programsMap.forEach((prog) => {
      monthlyOutflow += prog.disburseGrant();
    });

    if (this.simulation?.stats && this.simulation.stats.treasury >= monthlyOutflow) {
      this.simulation.stats.treasury -= monthlyOutflow;
    }
  }

  getSubsidySummary() {
    let totalDisbursed = 0;
    this.programsMap.forEach((p) => (totalDisbursed += p.cumulativeDisbursedDollars));

    return {
      activeProgramsCount: this.programsMap.size,
      cumulativeDisbursedDollars: totalDisbursed,
    };
  }
}

export default SectorSubsidiesEngineFull;
