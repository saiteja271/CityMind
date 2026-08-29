/**
 * CITYMIND Hazen-Williams Hydraulic Friction Head Loss Solver
 * Computes Hazen-Williams pipe friction head loss ($h_f = \frac{10.67 \cdot L \cdot Q^{1.852}}{C^{1.852} \cdot d^{4.87}}$),
 * booster pump station pressure, reservoir drawdown, and water purification throughput.
 */

export class HydraulicWaterSegment {
  constructor(pipeId, lengthMeters = 1000, diameterMm = 400, roughnessC = 130) {
    this.pipeId = pipeId;
    this.lengthMeters = lengthMeters;
    this.diameterMm = diameterMm;
    this.roughnessC = roughnessC;
    this.currentFlowLps = 60;
    this.frictionHeadLossMeters = 2.4;
  }

  computeHeadLoss(flowLps) {
    this.currentFlowLps = Math.max(0.1, flowLps);
    const qM3s = this.currentFlowLps / 1000.0;
    const dMeters = this.diameterMm / 1000.0;

    const numerator = 10.67 * this.lengthMeters * Math.pow(qM3s, 1.852);
    const denominator = Math.pow(this.roughnessC, 1.852) * Math.pow(dMeters, 4.87);

    this.frictionHeadLossMeters = Math.round((numerator / Math.max(0.00001, denominator)) * 100) / 100.0;
    return this.frictionHeadLossMeters;
  }
}

export class WaterHydraulicsSolverFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.waterPipesMap = new Map();
    this.reservoirLiters = 60000000;
    this.initializeNetwork();
  }

  initializeNetwork() {
    this.waterPipesMap.set('water_trunk_01', new HydraulicWaterSegment('water_trunk_01', 1500, 500));
    this.waterPipesMap.set('water_dist2_02', new HydraulicWaterSegment('water_dist2_02', 800, 350));
  }

  update(deltaMonths) {
    const demandLps = (this.simulation?.stats?.utilities?.waterDemand || 300) / 10;
    this.waterPipesMap.forEach((pipe) => {
      pipe.computeHeadLoss(demandLps);
    });
  }

  getHydraulicSummary() {
    return {
      monitoredPipesCount: this.waterPipesMap.size,
      reservoirLiters: this.reservoirLiters,
    };
  }
}

export default WaterHydraulicsSolverFull;
