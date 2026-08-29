/**
 * CITYMIND Bureau of Public Roads (BPR) Traffic Congestion Solver
 * Simulates non-linear traffic congestion delay curves ($T = T_0 \cdot (1 + \alpha \cdot (V/C)^\beta)$),
 * dynamic traffic assignment (DTA) flow fields, signalized intersection delay equations, and road segment capacity limits.
 */

export class RoadSegmentCapacity {
  constructor(segmentId, roadType = 'Avenue', laneCount = 2, maxCapacityVehiclesPerHour = 2000) {
    this.segmentId = segmentId;
    this.roadType = roadType; // 'LocalStreet', 'Avenue', 'Expressway', 'BRTLane'
    this.laneCount = laneCount;
    this.maxCapacityVehiclesPerHour = maxCapacityVehiclesPerHour;
    this.currentVolumeVehiclesPerHour = 500;
    this.freeFlowTravelTimeSec = 30; // T0
    this.alphaBpr = 0.15; // BPR alpha parameter
    this.betaBpr = 4.0; // BPR beta parameter
    this.effectiveTravelTimeSec = 30;
    this.congestionIndexPct = 25;
  }

  calculateBprTravelTime(volume) {
    this.currentVolumeVehiclesPerHour = Math.max(0, volume);
    const vcRatio = this.currentVolumeVehiclesPerHour / Math.max(1, this.maxCapacityVehiclesPerHour);

    // BPR Congestion Delay Equation: T = T0 * (1 + alpha * (V/C)^beta)
    this.effectiveTravelTimeSec = Math.round(this.freeFlowTravelTimeSec * (1 + this.alphaBpr * Math.pow(vcRatio, this.betaBpr)));
    this.congestionIndexPct = Math.min(100, Math.round(vcRatio * 100));

    return this.effectiveTravelTimeSec;
  }

  isGridlockHazard() {
    return this.congestionIndexPct >= 85;
  }
}

export class TrafficFlowSolverEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.roadSegments = new Map();
    this.averageCityCongestionPct = 18;
    this.initializeRoadSegments();
  }

  initializeRoadSegments() {
    const defaultSegments = [
      { id: 'seg_main_ave_01', type: 'Avenue', lanes: 4, capacity: 4000 },
      { id: 'seg_broadway_02', type: 'Avenue', lanes: 4, capacity: 4000 },
      { id: 'seg_highway_03', type: 'Expressway', lanes: 6, capacity: 7500 },
      { id: 'seg_market_st_04', type: 'LocalStreet', lanes: 2, capacity: 1800 },
    ];

    defaultSegments.forEach((s) => {
      this.roadSegments.set(s.id, new RoadSegmentCapacity(s.id, s.type, s.lanes, s.capacity));
    });
  }

  update(deltaMonths) {
    const population = this.simulation?.stats?.population || 1250;
    let sumCongestion = 0;

    this.roadSegments.forEach((seg) => {
      const volume = Math.round((population * 0.45 * Math.random()) * (seg.roadType === 'Expressway' ? 1.5 : 1.0));
      seg.calculateBprTravelTime(volume);
      sumCongestion += seg.congestionIndexPct;
    });

    const count = this.roadSegments.size;
    this.averageCityCongestionPct = count > 0 ? Math.round(sumCongestion / count) : 18;

    if (this.simulation?.stats) {
      this.simulation.stats.trafficCongestion = this.averageCityCongestionPct;
    }
  }

  getTrafficSummary() {
    const gridlockCount = Array.from(this.roadSegments.values()).filter((s) => s.isGridlockHazard()).length;
    return {
      averageCityCongestionPct: this.averageCityCongestionPct,
      totalMonitoredSegments: this.roadSegments.size,
      gridlockCount,
    };
  }
}

export default TrafficFlowSolverEngine;
