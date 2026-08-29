/**
 * WasteSystem.js - Municipal solid waste collection, landfill leaching, incinerator emissions, and fleet AI routing engine.
 * Models waste production per building type, recycling throughput, landfill accumulation, and garbage truck vehicle routing.
 */

import { clamp, distance, generateId } from '@citymind/utilities';

export const FACILITY_TYPE = {
  LANDFILL: 'LANDFILL',
  INCINERATOR: 'INCINERATOR',
  RECYCLING_PLANT: 'RECYCLING_PLANT'
};

export class GarbageTruck {
  constructor(id, depotX, depotY, capacityTons = 10.0) {
    this.id = id;
    this.x = depotX;
    this.y = depotY;
    this.depotX = depotX;
    this.depotY = depotY;
    this.capacityTons = capacityTons;
    this.currentLoadTons = 0;
    this.targetBuilding = null;
    this.state = 'IDLE'; // 'IDLE' | 'COLLECTING' | 'RETURNING'
  }
}

export class WasteSystem {
  constructor() {
    // Map facilityId -> WasteFacility
    this.facilities = new Map();

    // Fleet list
    this.trucks = [];

    // Cumulative Accumulation Ledger
    this.ledger = {
      totalWasteGeneratedTons: 0,
      totalRecycledTons: 0,
      totalIncineratedTons: 0,
      totalLandfilledTons: 0,
      recyclingRatePct: 25.0,
      incineratorToxicEmissionsPPM: 12.5,
      landfillLeachateRiskPct: 15.0
    };
  }

  /**
   * Register a waste processing facility.
   */
  addFacility(id, type, x, y, capacityTonsPerTick = 100) {
    this.facilities.set(id, {
      id,
      type,
      x,
      y,
      capacityTonsPerTick,
      accumulatedTons: 0,
      maxStorageTons: 50000
    });
  }

  /**
   * Register a garbage truck vehicle into the municipal collection fleet.
   */
  addGarbageTruck(depotX = 25, depotY = 25, capacityTons = 10.0) {
    const truck = new GarbageTruck(generateId('trk'), depotX, depotY, capacityTons);
    this.trucks.push(truck);
    return truck;
  }

  /**
   * Primary Waste Management Tick.
   *
   * @param {Array<Object>} buildings - Active building list with uncollected waste
   * @returns {Object} Waste system summary state
   */
  tick(buildings = []) {
    // 1. Calculate Daily Waste Generation per Building Type
    let totalNewWaste = 0;
    buildings.forEach((b) => {
      let wasteProd = 0.05; // Base 50kg
      if (b.category === 'residential') wasteProd = (b.occupants || 1) * 0.08;
      else if (b.category === 'commercial') wasteProd = 0.35;
      else if (b.category === 'industrial') wasteProd = 0.85;

      b.uncollectedWasteTons = (b.uncollectedWasteTons || 0) + wasteProd;
      totalNewWaste += wasteProd;
    });

    this.ledger.totalWasteGeneratedTons += totalNewWaste;

    // 2. Dispatch Garbage Truck Fleet Routing AI
    this._stepGarbageTruckFleet(buildings);

    // 3. Process Facilities Throughput (Recycling, Incinerators, Landfills)
    let recycledThisTick = 0;
    let incineratedThisTick = 0;
    let landfilledThisTick = 0;

    this.facilities.forEach((fac) => {
      if (fac.type === FACILITY_TYPE.RECYCLING_PLANT) {
        const processAmount = Math.min(fac.accumulatedTons, fac.capacityTonsPerTick);
        fac.accumulatedTons -= processAmount;
        recycledThisTick += processAmount;
      } else if (fac.type === FACILITY_TYPE.INCINERATOR) {
        const processAmount = Math.min(fac.accumulatedTons, fac.capacityTonsPerTick);
        fac.accumulatedTons -= processAmount;
        incineratedThisTick += processAmount;
        // Incinerator toxic smoke emission factor
        this.ledger.incineratorToxicEmissionsPPM = clamp(this.ledger.incineratorToxicEmissionsPPM + processAmount * 0.05, 5, 100);
      } else if (fac.type === FACILITY_TYPE.LANDFILL) {
        const processAmount = Math.min(fac.accumulatedTons, fac.capacityTonsPerTick);
        landfilledThisTick += processAmount;
        // Landfill leachate accumulation
        this.ledger.landfillLeachateRiskPct = clamp(this.ledger.landfillLeachateRiskPct + processAmount * 0.02, 0, 100);
      }
    });

    this.ledger.totalRecycledTons += recycledThisTick;
    this.ledger.totalIncineratedTons += incineratedThisTick;
    this.ledger.totalLandfilledTons += landfilledThisTick;

    const totalProcessed = Math.max(1, this.ledger.totalRecycledTons + this.ledger.totalIncineratedTons + this.ledger.totalLandfilledTons);
    this.ledger.recyclingRatePct = Number(((this.ledger.totalRecycledTons / totalProcessed) * 100).toFixed(1));

    return { ...this.ledger };
  }

  /**
   * Fleet Vehicle Routing AI Step.
   */
  _stepGarbageTruckFleet(buildings) {
    const uncollectedBuildings = buildings.filter((b) => (b.uncollectedWasteTons || 0) > 0.5);

    this.trucks.forEach((truck) => {
      if (truck.state === 'IDLE' && uncollectedBuildings.length > 0) {
        // Nearest neighbor pickup routing
        uncollectedBuildings.sort((a, b) => distance(truck.x, truck.y, a.x, a.y) - distance(truck.x, truck.y, b.x, b.y));
        const target = uncollectedBuildings.shift();
        truck.targetBuilding = target;
        truck.state = 'COLLECTING';
      }

      if (truck.state === 'COLLECTING' && truck.targetBuilding) {
        const d = distance(truck.x, truck.y, truck.targetBuilding.x, truck.targetBuilding.y);
        if (d < 1.0) {
          // Arrived: Collect waste
          const pickedUp = Math.min(truck.targetBuilding.uncollectedWasteTons, truck.capacityTons - truck.currentLoadTons);
          truck.targetBuilding.uncollectedWasteTons -= pickedUp;
          truck.currentLoadTons += pickedUp;

          if (truck.currentLoadTons >= truck.capacityTons) {
            truck.state = 'RETURNING';
            truck.targetBuilding = null;
          } else {
            truck.state = 'IDLE';
          }
        } else {
          // Move towards target
          truck.x += (truck.targetBuilding.x - truck.x) * 0.2;
          truck.y += (truck.targetBuilding.y - truck.y) * 0.2;
        }
      } else if (truck.state === 'RETURNING') {
        const d = distance(truck.x, truck.y, truck.depotX, truck.depotY);
        if (d < 1.0) {
          // Offload to facility depot
          const facList = Array.from(this.facilities.values());
          if (facList.length > 0) {
            facList[0].accumulatedTons += truck.currentLoadTons;
          }
          truck.currentLoadTons = 0;
          truck.state = 'IDLE';
        } else {
          truck.x += (truck.depotX - truck.x) * 0.2;
          truck.y += (truck.depotY - truck.y) * 0.2;
        }
      }
    });
  }

  /**
   * Summary overview of waste system.
   */
  getWasteSummary() {
    return {
      ...this.ledger,
      activeTrucksCount: this.trucks.length,
      facilityCount: this.facilities.size
    };
  }
}
