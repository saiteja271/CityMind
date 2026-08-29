/**
 * CITYMIND Sanitary Sewage Flow & Wastewater Treatment Plant Solver
 * Computes Manning's open-channel gravity sewage flow equation ($Q = \frac{1}{n} A R^{2/3} S^{1/2}$),
 * wastewater treatment plant biological oxygen demand (BOD5) removal rates, and sewer pipe overflow risk indices.
 */

export class SewerPipeSegmentFull {
  constructor(pipeId, diameterMm = 450, slopePerKm = 6.0, manningN = 0.013) {
    this.pipeId = pipeId;
    this.diameterMm = diameterMm;
    this.slopePerKm = slopePerKm;
    this.manningN = manningN;
    this.currentFlowLps = 40;
    this.maxCapacityLps = 150;
    this.overflowRiskPct = 25;
  }

  computeManningsFlowCapacity() {
    const rMeters = (this.diameterMm / 1000.0) / 4.0;
    const aM2 = Math.PI * Math.pow((this.diameterMm / 1000.0) / 2.0, 2);
    const slopeRatio = this.slopePerKm / 1000.0;

    const velocityMs = (1.0 / this.manningN) * Math.pow(rMeters, 2 / 3) * Math.sqrt(slopeRatio);
    const fullFlowM3s = velocityMs * aM2;

    this.maxCapacityLps = Math.round(fullFlowM3s * 1000.0);
    this.overflowRiskPct = Math.min(100, Math.round((this.currentFlowLps / Math.max(1, this.maxCapacityLps)) * 100));

    return this.maxCapacityLps;
  }
}

export class SewageNetworkSolverFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.sewerPipesMap = new Map();
    this.dailyWastewaterLiters = 22000000;
    this.initializeNetwork();
  }

  initializeNetwork() {
    this.sewerPipesMap.set('sewer_trunk_01', new SewerPipeSegmentFull('sewer_trunk_01', 600, 8.0));
    this.sewerPipesMap.set('sewer_district3_02', new SewerPipeSegmentFull('sewer_district3_02', 450, 6.0));
  }

  update(deltaMonths) {
    const demandLps = (this.simulation?.stats?.utilities?.waterDemand || 300) * 0.85 / 10;
    this.sewerPipesMap.forEach((pipe) => {
      pipe.currentFlowLps = demandLps;
      pipe.computeManningsFlowCapacity();
    });
  }

  getSewageSummary() {
    return {
      monitoredPipesCount: this.sewerPipesMap.size,
      dailyWastewaterLiters: this.dailyWastewaterLiters,
    };
  }
}

export default SewageNetworkSolverFull;
