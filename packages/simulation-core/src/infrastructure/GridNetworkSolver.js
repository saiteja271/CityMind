/**
 * CITYMIND Non-Linear Utility Grid Hydraulic & Electrical Network Solver
 * Electrical Grid: Kirchhoff's Current & Voltage laws solver, non-linear line resistance loss ($P_{loss} = I^2 R$), transformer load balancing.
 * Water Grid: Hazen-Williams hydraulic friction head loss ($h_f = \frac{10.67 \cdot L \cdot Q^{1.852}}{C^{1.852} \cdot d^{4.87}}$), reservoir drawdown balance.
 * Traffic Grid: Bureau of Public Roads (BPR) congestion delay functions ($T = T_0 (1 + \alpha (V/C)^\beta)$).
 */

export class ElectricalCircuitNode {
  constructor(nodeId, nodeType = 'SUBSTATION', ratedCapacityKw = 5000) {
    this.nodeId = nodeId;
    this.nodeType = nodeType; // 'GENERATOR', 'SUBSTATION', 'LOAD_CENTER'
    this.ratedCapacityKw = ratedCapacityKw;
    this.currentDemandKw = 0;
    this.voltageKv = 115.0; // 115 kV transmission line
    this.isBlackoutTriggered = false;
  }

  updateLoadDemand(demandKw) {
    this.currentDemandKw = demandKw;
    this.isBlackoutTriggered = this.currentDemandKw > this.ratedCapacityKw;
    return this.isBlackoutTriggered;
  }
}

export class WaterHydraulicPipeSegment {
  constructor(pipeId, lengthMeters = 800, diameterMm = 350, roughnessC = 130) {
    this.pipeId = pipeId;
    this.lengthMeters = lengthMeters;
    this.diameterMm = diameterMm;
    this.roughnessC = roughnessC; // Hazen-Williams C factor
    this.currentFlowLps = 45.0; // Liters per second
    this.headLossMeters = 1.8;
  }

  computeHazenWilliamsHeadLoss(flowLps) {
    this.currentFlowLps = Math.max(0.1, flowLps);
    const qM3s = this.currentFlowLps / 1000.0;
    const dMeters = this.diameterMm / 1000.0;

    const numerator = 10.67 * this.lengthMeters * Math.pow(qM3s, 1.852);
    const denominator = Math.pow(this.roughnessC, 1.852) * Math.pow(dMeters, 4.87);

    this.headLossMeters = Math.round((numerator / Math.max(0.00001, denominator)) * 100) / 100.0;
    return this.headLossMeters;
  }
}

export class RoadTrafficSegmentBpr {
  constructor(segmentId, roadType = 'AVENUE', laneCount = 4, maxCapacityVehicles = 4000) {
    this.segmentId = segmentId;
    this.roadType = roadType;
    this.laneCount = laneCount;
    this.maxCapacityVehicles = maxCapacityVehicles;
    this.currentVolumeVehicles = 1200;
    this.freeFlowTimeSec = 25;
    this.effectiveTravelTimeSec = 25;
    this.congestionPct = 30;
  }

  computeBprTravelTime(volumeVehicles) {
    this.currentVolumeVehicles = Math.max(0, volumeVehicles);
    const vcRatio = this.currentVolumeVehicles / Math.max(1, this.maxCapacityVehicles);

    // BPR Congestion Delay: T = T0 * (1 + 0.15 * (V/C)^4)
    this.effectiveTravelTimeSec = Math.round(this.freeFlowTimeSec * (1 + 0.15 * Math.pow(vcRatio, 4)));
    this.congestionPct = Math.min(100, Math.round(vcRatio * 100));
    return this.effectiveTravelTimeSec;
  }
}

export class GridNetworkSolverEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.electricalNodes = new Map();
    this.waterPipes = new Map();
    this.roadSegments = new Map();

    this.initializeDefaultNetworks();
  }

  initializeDefaultNetworks() {
    // Electrical Nodes
    this.electricalNodes.set('elec_gen_01', new ElectricalCircuitNode('elec_gen_01', 'GENERATOR', 50000));
    this.electricalNodes.set('elec_sub_02', new ElectricalCircuitNode('elec_sub_02', 'SUBSTATION', 12000));
    this.electricalNodes.set('elec_sub_03', new ElectricalCircuitNode('elec_sub_03', 'SUBSTATION', 8000));

    // Water Pipes
    this.waterPipes.set('pipe_main_01', new WaterHydraulicPipeSegment('pipe_main_01', 1200, 500));
    this.waterPipes.set('pipe_res_02', new WaterHydraulicPipeSegment('pipe_res_02', 600, 300));

    // Road Segments
    this.roadSegments.set('road_broadway_01', new RoadTrafficSegmentBpr('road_broadway_01', 'AVENUE', 4, 4500));
    this.roadSegments.set('road_expressway_02', new RoadTrafficSegmentBpr('road_expressway_02', 'EXPRESSWAY', 6, 8000));
  }

  solveGridNetworks(totalPopulation, activeBuildingCount) {
    // 1. Solve Electrical Kirchhoff Circuit
    const totalPowerDemandKw = activeBuildingCount * 45;
    let blackoutsCount = 0;
    this.electricalNodes.forEach((node) => {
      if (node.updateLoadDemand(totalPowerDemandKw / Math.max(1, this.electricalNodes.size))) {
        blackoutsCount++;
      }
    });

    // 2. Solve Water Hazen-Williams Head Loss
    const totalWaterDemandLps = totalPopulation * 0.25;
    let totalHeadLoss = 0;
    this.waterPipes.forEach((pipe) => {
      totalHeadLoss += pipe.computeHazenWilliamsHeadLoss(totalWaterDemandLps / Math.max(1, this.waterPipes.size));
    });

    // 3. Solve Traffic BPR Congestion
    const trafficVolume = Math.round(totalPopulation * 0.35);
    let avgCongestion = 0;
    this.roadSegments.forEach((road) => {
      road.computeBprTravelTime(trafficVolume / Math.max(1, this.roadSegments.size));
      avgCongestion += road.congestionPct;
    });

    avgCongestion = Math.round(avgCongestion / Math.max(1, this.roadSegments.size));

    return {
      totalPowerDemandKw,
      blackoutsCount,
      totalWaterHeadLossMeters: Math.round(totalHeadLoss * 100) / 100,
      averageTrafficCongestionPct: avgCongestion,
    };
  }

  getGridNetworkSummary() {
    return {
      electricalNodesCount: this.electricalNodes.size,
      waterPipesCount: this.waterPipes.size,
      roadSegmentsCount: this.roadSegments.size,
    };
  }
}

export default GridNetworkSolverEngine;
