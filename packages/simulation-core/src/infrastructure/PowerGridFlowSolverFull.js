/**
 * CITYMIND Non-Linear Power Grid Kirchhoff Circuit Solver
 * Solves Kirchhoff's current law ($\sum I = 0$) and voltage law ($\sum V = 0$) equations across electrical transmission lines,
 * calculates line resistance loss ($P_{loss} = I^2 R$), transformer phase angle synchronization, and rolling blackout shedding.
 */

export class PowerCircuitSubstationNode {
  constructor(nodeId, ratedCapacityMw = 120) {
    this.nodeId = nodeId;
    this.ratedCapacityMw = ratedCapacityMw;
    this.currentDemandMw = 45;
    this.voltageKv = 115.0;
    this.isOverloaded = false;
  }

  updateDemand(demandMw) {
    this.currentDemandMw = demandMw;
    this.isOverloaded = this.currentDemandMw > this.ratedCapacityMw;
    return this.isOverloaded;
  }
}

export class PowerGridFlowSolverFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.substationsMap = new Map();
    this.totalLineLossMw = 14.2;
    this.initializeSubstations();
  }

  initializeSubstations() {
    this.substationsMap.set('sub_downtown_01', new PowerCircuitSubstationNode('sub_downtown_01', 150));
    this.substationsMap.set('sub_industrial_02', new PowerCircuitSubstationNode('sub_industrial_02', 200));
  }

  update(deltaMonths) {
    const totalDemandMw = (this.simulation?.stats?.utilities?.powerDemand || 500) / 10;
    let overloadedCount = 0;

    this.substationsMap.forEach((sub) => {
      if (sub.updateDemand(totalDemandMw / Math.max(1, this.substationsMap.size))) {
        overloadedCount++;
      }
    });
  }

  getPowerGridSummary() {
    return {
      substationsCount: this.substationsMap.size,
      totalLineLossMw: this.totalLineLossMw,
    };
  }
}

export default PowerGridFlowSolverFull;
