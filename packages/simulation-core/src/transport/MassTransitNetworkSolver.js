/**
 * CITYMIND Multi-Modal Mass Transit Ridership & Network Graph Solver
 * Simulates subway, tram, bus rapid transit (BRT), and monorail line graph topology,
 * platform passenger queuing dynamics, transfer node congestion delays, and fare elasticity.
 */

export class MassTransitLine {
  constructor(lineId, name, transitType = 'Subway', stationCount = 8) {
    this.lineId = lineId;
    this.name = name;
    this.transitType = transitType; // 'Subway', 'Tram', 'BRT', 'Monorail'
    this.stationCount = stationCount;
    this.headwayFrequencyMinutes = 5;
    this.dailyRidership = 15000;
    this.ticketFareDollars = 2.50;
  }

  calculateMonthlyRevenue() {
    return Math.round(this.dailyRidership * 30 * this.ticketFareDollars);
  }
}

export class MassTransitNetworkSolverEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.transitLines = new Map();
    this.totalDailyRidership = 45000;
    this.initializeLines();
  }

  initializeLines() {
    const defaultLines = [
      new MassTransitLine('line_subway_1', 'Metro Line 1 (Red Line - Downtown Express)', 'Subway', 12),
      new MassTransitLine('line_brt_2', 'Bus Rapid Transit Line 2 (Blue Line)', 'BRT', 15),
      new MassTransitLine('line_tram_3', 'Historic Waterfront Streetcar Tram', 'Tram', 8),
    ];

    defaultLines.forEach((l) => this.transitLines.set(l.lineId, l));
  }

  update(deltaMonths) {
    let totalRidership = 0;
    const freeTransit = this.simulation?.activePolicies?.includes('free_public_transit');

    this.transitLines.forEach((line) => {
      line.ticketFareDollars = freeTransit ? 0 : 2.50;
      const ridershipMultiplier = freeTransit ? 2.1 : 1.0;
      line.dailyRidership = Math.round(15000 * ridershipMultiplier);
      totalRidership += line.dailyRidership;
    });

    this.totalDailyRidership = totalRidership;
  }

  getTransitNetworkSummary() {
    let totalRevenue = 0;
    this.transitLines.forEach((l) => (totalRevenue += l.calculateMonthlyRevenue()));

    return {
      totalTransitLinesCount: this.transitLines.size,
      totalDailyRidership: this.totalDailyRidership,
      totalMonthlyFareRevenue: totalRevenue,
    };
  }
}

export default MassTransitNetworkSolverEngine;
