/**
 * Tile - Single cell in the city map grid.
 */

import { TERRAIN, ZONE } from '@citymind/constants';
import { generateId } from '@citymind/utilities';

export class Tile {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.terrain = options.terrain || TERRAIN.GRASS;
    this.zone = options.zone || ZONE.NONE;
    this.elevation = options.elevation ?? 0;
    this.buildingId = options.buildingId || null;
    this.road = options.road || false;
    this.roadConnections = options.roadConnections || {
      n: false,
      e: false,
      s: false,
      w: false
    };
    this.pollution = options.pollution ?? 0;
    this.noise = options.noise ?? 0;
    this.power = options.power ?? false;
    this.water = options.water ?? false;
    this.districtId = options.districtId || null;
    this.metadata = options.metadata || {};
    this.traffic = 0;
    this.lastUpdated = 0;
  }

  get isOccupied() {
    return this.buildingId !== null;
  }

  get isBuildable() {
    return (
      !this.isOccupied &&
      this.terrain !== TERRAIN.WATER &&
      this.terrain !== TERRAIN.ROCK
    );
  }

  get isWalkable() {
    if (this.terrain === TERRAIN.WATER && !this.road) return false;
    return true;
  }

  get isRoad() {
    return this.road === true;
  }

  setTerrain(terrain) {
    this.terrain = terrain;
    if (terrain === TERRAIN.WATER) {
      this.zone = ZONE.NONE;
    }
  }

  setZone(zone) {
    if (this.terrain === TERRAIN.WATER) return false;
    this.zone = zone;
    return true;
  }

  placeBuilding(buildingId) {
    if (!this.isBuildable && !this.road) return false;
    this.buildingId = buildingId;
    return true;
  }

  removeBuilding() {
    const id = this.buildingId;
    this.buildingId = null;
    return id;
  }

  setRoad(enabled, connections = null) {
    this.road = enabled;
    if (connections) {
      this.roadConnections = { ...this.roadConnections, ...connections };
    }
    if (enabled) {
      this.zone = ZONE.NONE;
    }
  }

  updateConnections(neighbors) {
    this.roadConnections = {
      n: !!(neighbors.n && neighbors.n.road),
      e: !!(neighbors.e && neighbors.e.road),
      s: !!(neighbors.s && neighbors.s.road),
      w: !!(neighbors.w && neighbors.w.road)
    };
  }

  addPollution(amount) {
    this.pollution = Math.min(100, Math.max(0, this.pollution + amount));
  }

  decayPollution(rate) {
    this.pollution = Math.max(0, this.pollution - rate);
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      terrain: this.terrain,
      zone: this.zone,
      elevation: this.elevation,
      buildingId: this.buildingId,
      road: this.road,
      roadConnections: this.roadConnections,
      pollution: this.pollution,
      noise: this.noise,
      power: this.power,
      water: this.water,
      districtId: this.districtId,
      metadata: this.metadata
    };
  }

  static fromJSON(data) {
    return new Tile(data.x, data.y, data);
  }
}

export default Tile;
