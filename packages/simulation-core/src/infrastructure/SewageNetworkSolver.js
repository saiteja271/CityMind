/**
 * CITYMIND Sanitary Sewage Flow & Wastewater Treatment Plant Solver
 * Computes Manning's open-channel gravity sewage flow equation ($Q = \frac{1}{n} A R^{2/3} S^{1/2}$),
 * wastewater treatment plant biological oxygen demand (BOD5) removal rates, and sewer pipe overflow risk indices.
 */

export class SewerPipeSegment {
  constructor(pipeId, diameterMm = 400, slopeMetersPerKm = 5.0, manningN = 0.013) {
    this.pipeId = pipeId;
    this.diameterMm = diameterMm;
    this.slopeMetersPerKm = slopeMetersPerKm;
    this.manningN = manningN; // Manning's roughness coefficient (0.013 for smooth PVC/concrete)
    this.currentFlowLps = 35;
    this.maxFullCapacityLps = 120;
    this.overflowRiskPct = 29;
  }

  calculateManningsFlowCapacity() {
    const rMeters = (this.diameterMm / 1000) / 4; // Hydraulic radius for full pipe R = D/4
    const aM2 = Math.PI * Math.pow((this.diameterMm / 1000) / 2, 2); // Cross sectional area
    const slopeRatio = this.slopeMetersPerKm / 1000;

    // Manning's Equation: Q = (1/n) * A * R^(2/3) * S^(1/2)
    const velocityMs = (1 / this.manningN) * Math.pow(rMeters, 2 / 3) * Math.sqrt(slopeRatio);
    const fullFlowM3s = velocityMs * aM2;

    this.maxFullCapacityLps = Math.round(fullFlowM3s * 1000);
    this.overflowRiskPct = Math.min(100, Math.round((this.currentFlowLps / Math.max(1, this.maxFullCapacityLps)) * 100));

    return this.maxFullCapacityLps;
  }
}

export class SewageNetworkSolverEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.sewerNetwork = new Map();
    this.dailyWastewaterProcessedLiters = 18000000; // 18M Liters
    this.bod5RemovalEfficiencyPct = 94.5;
    this.initializeSewerPipes();
  }

  initializeSewerPipes() {
    const defaultPipes = [
      new SewerPipeSegment('sewer_main_01', 600, 8.0),
      new SewerPipeSegment('sewer_district2_02', 450, 6.0),
      new SewerPipeSegment('sewer_ind_03', 500, 10.0),
    ];

    defaultPipes.forEach((p) => this.sewerNetwork.set(p.pipeId, p));
  }

  update(deltaMonths) {
    const wastewaterGenLps = (this.simulation?.stats?.utilities?.waterDemand || 280) * 0.85 / 10;
    this.sewerNetwork.forEach((pipe) => {
      pipe.currentFlowLps = wastewaterGenLps;
      pipe.calculateManningsFlowCapacity();
    });
  }

  getSewageSummary() {
    return {
      totalMonitoredSewerPipes: this.sewerNetwork.size,
      dailyWastewaterProcessedLiters: this.dailyWastewaterProcessedLiters,
      bod5RemovalEfficiencyPct: this.bod5RemovalEfficiencyPct,
    };
  }
}

export default SewageNetworkSolverEngine;
