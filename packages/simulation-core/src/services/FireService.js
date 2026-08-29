/**
 * FireService.js - Building fire hazard index, cellular automaton fire spread, and fire engine dispatch engine.
 * Models flammability risk, thermal spread dynamics across adjacent tiles, and fire station coverage.
 */

import { clamp, distance, generateId } from '@citymind/utilities';

export class FireEngine {
  constructor(id, stationX, stationY) {
    this.id = id;
    this.x = stationX;
    this.y = stationY;
    this.stationX = stationX;
    this.stationY = stationY;
    this.state = 'IDLE'; // 'IDLE' | 'DISPATCHED'
    this.targetFire = null;
    this.waterCapacity = 100.0;
  }
}

export class FireService {
  constructor(gridWidth = 50, gridHeight = 50) {
    this.width = gridWidth;
    this.height = gridHeight;

    // Fire Stations
    this.stations = new Map();

    // Fire Engines Fleet
    this.engines = [];

    // Active Fires: Map buildingId -> FireData
    this.activeFires = new Map();

    // System Metrics Summary
    this.ledger = {
      totalFiresIgnited: 0,
      firesExtinguished: 0,
      buildingsDestroyed: 0,
      avgHazardIndex: 12.5
    };
  }

  /**
   * Register a fire station.
   */
  addStation(id, x, y, radius = 12) {
    const station = { id, x, y, radius, active: true };
    this.stations.set(id, station);

    // Spawn 2 fire engines per station
    this.engines.push(new FireEngine(generateId('eng'), x, y));
    this.engines.push(new FireEngine(generateId('eng'), x, y));
    return station;
  }

  /**
   * Primary Fire Service Simulation Tick.
   *
   * @param {Array<Object>} buildings - Active building list
   * @param {Object} weather - Temperature, humidity, wind metadata
   * @param {number} waterPressureRatio - Water grid pressure ratio (0.0 to 1.0)
   * @returns {Object} Fire service summary
   */
  tick(buildings = [], weather = {}, waterPressureRatio = 1.0) {
    const tempC = weather.temperatureC || 25.0;
    const humidityPct = weather.humidityPct || 45.0;

    // 1. Calculate Fire Hazard Index per building
    buildings.forEach((b) => {
      const flammability = b.category === 'industrial' ? 0.8 : b.category === 'residential' ? 0.4 : 0.2;
      const climateFactor = (tempC / 40.0) * (1 - humidityPct / 100);

      b.fireHazardIndex = clamp(flammability * 50 + climateFactor * 40, 5, 95);

      // Stochastic ignition trigger
      if (!this.activeFires.has(b.id) && Math.random() < (b.fireHazardIndex * 0.0001)) {
        this._igniteFire(b);
      }
    });

    // 2. Cellular Automaton Fire Spread to Adjacent Buildings
    this._processFireSpread(buildings);

    // 3. Fire Engine Dispatch & Suppression Steps
    this._stepFireEngineSuppression(waterPressureRatio);

    return {
      activeFiresCount: this.activeFires.size,
      stationCount: this.stations.size,
      engineCount: this.engines.length,
      ledger: { ...this.ledger }
    };
  }

  /**
   * Ignite fire event at target building.
   */
  _igniteFire(building) {
    const fire = {
      id: generateId('fir'),
      buildingId: building.id,
      x: building.x,
      y: building.y,
      intensity: 10.0, // 0 to 100
      ignitedTick: Date.now()
    };

    this.activeFires.set(building.id, fire);
    building.isOnFire = true;
    this.ledger.totalFiresIgnited++;
  }

  /**
   * Cellular Automaton Spatial Fire Spread step between adjacent buildings.
   */
  _processFireSpread(buildings) {
    const fireList = Array.from(this.activeFires.values());

    fireList.forEach((fire) => {
      // Increase fire intensity over time
      fire.intensity = clamp(fire.intensity + 2.0, 0, 100.0);

      // Check adjacent buildings for spatial spread
      buildings.forEach((other) => {
        if (!this.activeFires.has(other.id) && distance(fire.x, fire.y, other.x, other.y) < 2.5) {
          const spreadChance = (fire.intensity / 100) * (other.fireHazardIndex / 100) * 0.15;
          if (Math.random() < spreadChance) {
            this._igniteFire(other);
          }
        }
      });

      // Structural destruction check
      if (fire.intensity >= 95.0) {
        this.ledger.buildingsDestroyed++;
      }
    });
  }

  /**
   * Dispatch fire engines to active fires and perform water suppression.
   */
  _stepFireEngineSuppression(waterPressureRatio) {
    const unassignedFires = Array.from(this.activeFires.values());

    this.engines.forEach((eng) => {
      if (eng.state === 'IDLE' && unassignedFires.length > 0) {
        unassignedFires.sort((a, b) => distance(eng.x, eng.y, a.x, a.y) - distance(eng.x, eng.y, b.x, b.y));
        const target = unassignedFires.shift();
        eng.targetFire = target;
        eng.state = 'DISPATCHED';
      }

      if (eng.state === 'DISPATCHED' && eng.targetFire) {
        const d = distance(eng.x, eng.y, eng.targetFire.x, eng.targetFire.y);
        if (d < 1.5) {
          // Perform Fire Suppression (Water Pressure boosts efficiency)
          const suppressionRate = 8.0 * waterPressureRatio;
          eng.targetFire.intensity -= suppressionRate;

          if (eng.targetFire.intensity <= 0) {
            // Extinguished!
            this.activeFires.delete(eng.targetFire.buildingId);
            this.ledger.firesExtinguished++;
            eng.targetFire = null;
            eng.state = 'IDLE';
          }
        } else {
          // Move engine towards target
          eng.x += (eng.targetFire.x - eng.x) * 0.35;
          eng.y += (eng.targetFire.y - eng.y) * 0.35;
        }
      }
    });
  }

  getFireSummary() {
    return {
      activeFires: this.activeFires.size,
      stations: this.stations.size,
      engines: this.engines.length,
      ledger: { ...this.ledger }
    };
  }
}
