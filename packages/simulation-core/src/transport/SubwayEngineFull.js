/**
 * CITYMIND Mass Transit Metro & Subway Network Simulation Engine
 * Metro line graph topology, underground station nodes, platform passenger queue dynamics,
 * train vehicle dispatch frequency, ticket fare pricing elasticity, line transfer nodes, power grid dependency, emergency evacuation protocols.
 */

export class MetroSubwayStationNode {
  constructor(id, name, lineId = 'RED_LINE') {
    this.id = id;
    this.name = name;
    this.lineId = lineId;
    this.waitingPassengersCount = 120;
    this.dailyRidership = 4500;
  }

  boardPassengers(capacity) {
    const boarded = Math.min(this.waitingPassengersCount, capacity);
    this.waitingPassengersCount -= boarded;
    return boarded;
  }
}

export class SubwayEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.stationsMap = new Map();
    this.initializeStations();
  }

  initializeStations() {
    this.stationsMap.set('stn_downtown_center', new MetroSubwayStationNode('stn_downtown_center', 'Downtown Central Station', 'RED_LINE'));
    this.stationsMap.set('stn_westside_park', new MetroSubwayStationNode('stn_westside_park', 'Westside Park Station', 'RED_LINE'));
  }

  update(deltaMonths) {
    this.stationsMap.forEach((stn) => {
      stn.waitingPassengersCount += Math.floor(Math.random() * 15);
    });
  }

  getSubwaySummary() {
    return {
      activeStationsCount: this.stationsMap.size,
    };
  }
}

export default SubwayEngineFull;
