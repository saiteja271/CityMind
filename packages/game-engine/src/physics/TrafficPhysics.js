/**
 * TrafficPhysics - Vehicle movement, congestion, simple collision avoidance on road graph.
 */
import { distance, clamp, tileKey } from '@citymind/utilities';

export class Vehicle {
  constructor(options = {}) {
    this.id = options.id;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = options.speed || 2.0;
    this.maxSpeed = options.maxSpeed || 4.0;
    this.path = options.path || [];
    this.pathIndex = 0;
    this.type = options.type || 'car';
    this.passengerCount = options.passengerCount || 1;
    this.destination = options.destination || null;
    this.stuckTime = 0;
    this.lane = 0;
  }

  update(dt, roadGraph, vehiclesNearby) {
    if (!this.path || this.pathIndex >= this.path.length - 1) {
      this.vx = 0; this.vy = 0;
      return false;
    }
    const target = this.path[this.pathIndex + 1];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
    // Congestion slowdown
    let speedMul = 1;
    for (const other of vehiclesNearby) {
      if (other.id === this.id) continue;
      const d = distance(this.x, this.y, other.x, other.y);
      if (d < 1.5) speedMul = Math.min(speedMul, 0.3);
      else if (d < 3) speedMul = Math.min(speedMul, 0.6);
    }
    const step = Math.min(dist, this.speed * speedMul * dt);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    this.vx = (dx / dist) * this.speed * speedMul;
    this.vy = (dy / dist) * this.speed * speedMul;
    if (dist < 0.3) this.pathIndex++;
    if (speedMul < 0.4) this.stuckTime += dt;
    else this.stuckTime = 0;
    return true;
  }
}

export class TrafficPhysics {
  constructor(mapGrid) {
    this.map = mapGrid;
    this.vehicles = new Map();
    this.congestionMap = new Map();
    this.stats = { activeVehicles: 0, averageSpeed: 0, congestedTiles: 0 };
    this._spatialHash = new Map();
    this._cellSize = 4;
  }

  addVehicle(vehicle) {
    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  removeVehicle(id) {
    this.vehicles.delete(id);
  }

  _hashKey(x, y) {
    return `${Math.floor(x / this._cellSize)},${Math.floor(y / this._cellSize)}`;
  }

  _rebuildSpatialHash() {
    this._spatialHash.clear();
    for (const v of this.vehicles.values()) {
      const key = this._hashKey(v.x, v.y);
      if (!this._spatialHash.has(key)) this._spatialHash.set(key, []);
      this._spatialHash.get(key).push(v);
    }
  }

  _nearby(vehicle, radius = 5) {
    const results = [];
    const cx = Math.floor(vehicle.x / this._cellSize);
    const cy = Math.floor(vehicle.y / this._cellSize);
    const r = Math.ceil(radius / this._cellSize);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const bucket = this._spatialHash.get(`${cx + dx},${cy + dy}`);
        if (bucket) results.push(...bucket);
      }
    }
    return results;
  }

  update(dt) {
    this._rebuildSpatialHash();
    let speedSum = 0;
    const toRemove = [];
    for (const v of this.vehicles.values()) {
      const nearby = this._nearby(v);
      const alive = v.update(dt, this.map?.roadGraph, nearby);
      speedSum += Math.sqrt(v.vx * v.vx + v.vy * v.vy);
      if (!alive || v.stuckTime > 60) toRemove.push(v.id);
      // Congestion recording
      const tk = tileKey(Math.floor(v.x), Math.floor(v.y));
      this.congestionMap.set(tk, (this.congestionMap.get(tk) || 0) + 1);
    }
    for (const id of toRemove) this.vehicles.delete(id);
    // Decay congestion
    for (const [k, v] of this.congestionMap) {
      const nv = v * 0.95;
      if (nv < 0.1) this.congestionMap.delete(k);
      else this.congestionMap.set(k, nv);
    }
    const n = this.vehicles.size;
    this.stats.activeVehicles = n;
    this.stats.averageSpeed = n > 0 ? speedSum / n : 0;
    this.stats.congestedTiles = [...this.congestionMap.values()].filter((v) => v > 3).length;
  }

  getCongestion(x, y) {
    return this.congestionMap.get(tileKey(Math.floor(x), Math.floor(y))) || 0;
  }

  getStats() {
    return { ...this.stats };
  }

  clear() {
    this.vehicles.clear();
    this.congestionMap.clear();
  }
}

export default TrafficPhysics;
