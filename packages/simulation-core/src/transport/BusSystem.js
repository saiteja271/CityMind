/**
 * CITYMIND Bus Rapid Transit (BRT) & Municipal Bus Network Engine
 * Simulates bus route graph topology, bus stop passenger queues, vehicle dispatch schedules,
 * driver shifts, traffic congestion delays, electric bus charging infrastructure, and fare revenue.
 */

export class BusStop {
  constructor(id, name, locationTile) {
    this.id = id;
    this.name = name;
    this.locationTile = locationTile; // { x, y }
    this.passengerQueue = [];
    this.maxQueueCapacity = 200;
    this.shelterLevel = 1; // 1: Basic pole, 2: Covered shelter, 3: Smart heated station
    this.passengerWaitTimes = [];
  }

  addPassenger(citizenId, destinationStopId) {
    if (this.passengerQueue.length < this.maxQueueCapacity) {
      this.passengerQueue.push({ citizenId, destinationStopId, arrivalTime: Date.now() });
      return true;
    }
    return false;
  }

  boardPassengers(busCapacity) {
    const boarded = this.passengerQueue.splice(0, busCapacity);
    const now = Date.now();
    boarded.forEach((p) => {
      this.passengerWaitTimes.push(now - p.arrivalTime);
    });
    if (this.passengerWaitTimes.length > 100) {
      this.passengerWaitTimes = this.passengerWaitTimes.slice(-50);
    }
    return boarded;
  }

  getAverageWaitTimeSec() {
    if (this.passengerWaitTimes.length === 0) return 0;
    const sum = this.passengerWaitTimes.reduce((a, b) => a + b, 0);
    return Math.round((sum / this.passengerWaitTimes.length) / 1000);
  }
}

export class BusRoute {
  constructor(id, name, color = '#38bdf8') {
    this.id = id;
    this.name = name;
    this.color = color;
    this.stops = []; // Array of BusStop
    this.assignedBuses = [];
    this.dispatchIntervalMinutes = 10;
    this.farePrice = 2.50;
    this.totalMonthlyPassengers = 0;
    this.totalMonthlyRevenue = 0;
  }

  addStop(stop) {
    this.stops.push(stop);
  }

  removeStop(stopId) {
    this.stops = this.stops.filter((s) => s.id !== stopId);
  }

  calculateRouteLengthKm() {
    let dist = 0;
    for (let i = 0; i < this.stops.length - 1; i++) {
      const s1 = this.stops[i].locationTile;
      const s2 = this.stops[i + 1].locationTile;
      const dx = s1.x - s2.x;
      const dy = s1.y - s2.y;
      dist += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.round(dist * 0.1 * 10) / 10; // 1 tile = 100m = 0.1km
  }
}

export class BusVehicle {
  constructor(id, model, capacity = 60) {
    this.id = id;
    this.model = model; // 'electric_city_bus', 'articulated_express', 'diesel_standard'
    this.capacity = capacity;
    this.currentPassengers = [];
    this.currentStopIndex = 0;
    this.fuelLevelPct = 100;
    this.isCharging = false;
    this.maintenanceConditionPct = 100;
    this.totalKmDriven = 0;
  }

  board(passengers) {
    const spaceLeft = this.capacity - this.currentPassengers.length;
    const boarding = passengers.slice(0, spaceLeft);
    this.currentPassengers.push(...boarding);
    return boarding;
  }

  alight(currentStopId) {
    const remaining = [];
    const alighted = [];
    this.currentPassengers.forEach((p) => {
      if (p.destinationStopId === currentStopId) {
        alighted.push(p);
      } else {
        remaining.push(p);
      }
    });
    this.currentPassengers = remaining;
    return alighted;
  }
}

export class BusSystem {
  constructor(simulation) {
    this.simulation = simulation;
    this.stops = new Map();
    this.routes = new Map();
    this.vehicles = new Map();
    this.totalMonthlyPassengers = 0;
    this.totalMonthlyRevenue = 0;
    this.maintenanceCostMonthly = 0;
  }

  createStop(name, locationTile) {
    const id = `stop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const stop = new BusStop(id, name, locationTile);
    this.stops.set(id, stop);
    return stop;
  }

  createRoute(name, color) {
    const id = `route-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const route = new BusRoute(id, name, color);
    this.routes.set(id, route);
    return route;
  }

  dispatchVehicle(routeId, model = 'electric_city_bus') {
    const route = this.routes.get(routeId);
    if (!route) return null;

    const id = `bus-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const bus = new BusVehicle(id, model);
    this.vehicles.set(id, bus);
    route.assignedBuses.push(id);
    return bus;
  }

  update(deltaTicks) {
    let monthlyPassengers = 0;
    let monthlyRevenue = 0;
    let maintenanceFees = 0;

    this.routes.forEach((route) => {
      route.assignedBuses.forEach((busId) => {
        const bus = this.vehicles.get(busId);
        if (!bus || route.stops.length < 2) return;

        // Move bus to next stop
        bus.currentStopIndex = (bus.currentStopIndex + 1) % route.stops.length;
        const currentStop = route.stops[bus.currentStopIndex];

        // Alight passengers
        const alighted = bus.alight(currentStop.id);
        monthlyPassengers += alighted.length;
        monthlyRevenue += alighted.length * route.farePrice;

        // Board passengers
        const boardingSpace = bus.capacity - bus.currentPassengers.length;
        const boarded = currentStop.boardPassengers(boardingSpace);
        bus.board(boarded);

        // Vehicle wear and tear
        bus.maintenanceConditionPct = Math.max(10, bus.maintenanceConditionPct - 0.05);
        bus.totalKmDriven += 0.5;
        maintenanceFees += 15; // $15 upkeep per dispatch cycle
      });
    });

    this.totalMonthlyPassengers += monthlyPassengers;
    this.totalMonthlyRevenue += monthlyRevenue;
    this.maintenanceCostMonthly += maintenanceFees;
  }

  getSystemSummary() {
    return {
      totalStops: this.stops.size,
      totalRoutes: this.routes.size,
      totalVehicles: this.vehicles.size,
      totalMonthlyPassengers: this.totalMonthlyPassengers,
      totalMonthlyRevenue: this.totalMonthlyRevenue,
      netProfit: this.totalMonthlyRevenue - this.maintenanceCostMonthly,
    };
  }
}

export default BusSystem;
