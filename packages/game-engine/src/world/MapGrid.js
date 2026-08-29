/**
 * MapGrid - Tile-based city world representation.
 * Supports spatial queries, building placement, road graph integration.
 */

import { MAP, TERRAIN, ZONE } from '@citymind/constants';
import {
  isInBounds,
  getNeighbors,
  getTilesInRadius,
  tileKey,
  generateId,
  createSeededRandom
} from '@citymind/utilities';
import { Tile } from './Tile.js';

export class MapGrid {
  constructor(width = MAP.DEFAULT_WIDTH, height = MAP.DEFAULT_HEIGHT, seed = Date.now()) {
    this.width = Math.max(MAP.MIN_SIZE, Math.min(MAP.MAX_SIZE, width));
    this.height = Math.max(MAP.MIN_SIZE, Math.min(MAP.MAX_SIZE, height));
    this.seed = seed;
    this.tiles = [];
    this.buildings = new Map();
    this.roadGraph = new Map();
    this._rng = createSeededRandom(seed);
    this._initTiles();
  }

  _initTiles() {
    this.tiles = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = new Tile(x, y);
      }
    }
  }

  getTile(x, y) {
    if (!isInBounds(x, y, this.width, this.height)) return null;
    return this.tiles[y][x];
  }

  setTile(x, y, tile) {
    if (!isInBounds(x, y, this.width, this.height)) return false;
    this.tiles[y][x] = tile;
    return true;
  }

  /**
   * Procedural terrain generation using simple noise-like approach.
   */
  generateTerrain(options = {}) {
    const {
      waterChance = 0.08,
      forestChance = 0.12,
      rockChance = 0.03,
      riverCount = 2
    } = options;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const r = this._rng();
        let terrain = TERRAIN.GRASS;
        if (r < waterChance) terrain = TERRAIN.WATER;
        else if (r < waterChance + rockChance) terrain = TERRAIN.ROCK;
        else if (r < waterChance + rockChance + forestChance) terrain = TERRAIN.FOREST;
        else if (r < waterChance + rockChance + forestChance + 0.1) terrain = TERRAIN.DIRT;
        this.tiles[y][x].terrain = terrain;
        this.tiles[y][x].elevation = this._rng() * 10;
      }
    }

    // Simple river generation
    for (let i = 0; i < riverCount; i++) {
      this._generateRiver();
    }
  }

  _generateRiver() {
    let x = Math.floor(this._rng() * this.width);
    let y = 0;
    const length = Math.floor(this.height * (0.4 + this._rng() * 0.5));
    for (let i = 0; i < length; i++) {
      if (isInBounds(x, y, this.width, this.height)) {
        this.tiles[y][x].terrain = TERRAIN.WATER;
        this.tiles[y][x].elevation = 0;
        // Widen slightly
        if (isInBounds(x + 1, y, this.width, this.height) && this._rng() > 0.5) {
          this.tiles[y][x + 1].terrain = TERRAIN.WATER;
        }
      }
      y += 1;
      x += Math.floor(this._rng() * 3) - 1;
      x = Math.max(0, Math.min(this.width - 1, x));
    }
  }

  /**
   * Place a building occupying size.w x size.h tiles.
   */
  placeBuilding(building, x, y) {
    const { size } = building;
    const w = size?.w || 1;
    const h = size?.h || 1;

    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const tile = this.getTile(x + dx, y + dy);
        if (!tile || (!tile.isBuildable && building.type !== 'road')) {
          return { success: false, reason: 'Invalid placement location' };
        }
      }
    }

    const id = building.id || generateId('bld');
    building.id = id;
    building.x = x;
    building.y = y;

    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const tile = this.getTile(x + dx, y + dy);
        tile.placeBuilding(id);
      }
    }

    this.buildings.set(id, building);
    return { success: true, building };
  }

  removeBuilding(buildingId) {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    const w = building.size?.w || 1;
    const h = building.size?.h || 1;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const tile = this.getTile(building.x + dx, building.y + dy);
        if (tile && tile.buildingId === buildingId) {
          tile.removeBuilding();
        }
      }
    }
    this.buildings.delete(buildingId);
    return true;
  }

  placeRoad(x, y) {
    const tile = this.getTile(x, y);
    if (!tile) return false;
    if (tile.terrain === TERRAIN.WATER) {
      // Allow bridges
      tile.setRoad(true);
    } else if (tile.isBuildable || !tile.isOccupied) {
      tile.setRoad(true);
      tile.buildingId = null;
    } else {
      return false;
    }
    this._updateRoadConnections(x, y);
    this._rebuildRoadNode(x, y);
    return true;
  }

  removeRoad(x, y) {
    const tile = this.getTile(x, y);
    if (!tile || !tile.road) return false;
    tile.setRoad(false);
    this._updateRoadConnections(x, y);
    this.roadGraph.delete(tileKey(x, y));
    // Update neighbors
    for (const n of getNeighbors(x, y)) {
      if (isInBounds(n.x, n.y, this.width, this.height)) {
        this._updateRoadConnections(n.x, n.y);
        this._rebuildRoadNode(n.x, n.y);
      }
    }
    return true;
  }

  _updateRoadConnections(x, y) {
    const tile = this.getTile(x, y);
    if (!tile) return;
    const neighbors = {
      n: this.getTile(x, y - 1),
      e: this.getTile(x + 1, y),
      s: this.getTile(x, y + 1),
      w: this.getTile(x - 1, y)
    };
    tile.updateConnections(neighbors);
  }

  _rebuildRoadNode(x, y) {
    const tile = this.getTile(x, y);
    if (!tile || !tile.road) {
      this.roadGraph.delete(tileKey(x, y));
      return;
    }
    const edges = [];
    const dirs = [
      { key: 'n', dx: 0, dy: -1 },
      { key: 'e', dx: 1, dy: 0 },
      { key: 's', dx: 0, dy: 1 },
      { key: 'w', dx: -1, dy: 0 }
    ];
    for (const d of dirs) {
      if (tile.roadConnections[d.key]) {
        edges.push({
          x: x + d.dx,
          y: y + d.dy,
          cost: 1
        });
      }
    }
    this.roadGraph.set(tileKey(x, y), { x, y, edges });
  }

  rebuildRoadGraph() {
    this.roadGraph.clear();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].road) {
          this._updateRoadConnections(x, y);
          this._rebuildRoadNode(x, y);
        }
      }
    }
  }

  setZone(x, y, zone, width = 1, height = 1) {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const tile = this.getTile(x + dx, y + dy);
        if (tile) tile.setZone(zone);
      }
    }
  }

  getBuildingsInArea(x, y, w, h) {
    const ids = new Set();
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const tile = this.getTile(x + dx, y + dy);
        if (tile && tile.buildingId) ids.add(tile.buildingId);
      }
    }
    return [...ids].map((id) => this.buildings.get(id)).filter(Boolean);
  }

  getTilesInRadius(cx, cy, radius) {
    return getTilesInRadius(cx, cy, radius, this.width, this.height).map(
      ({ x, y }) => this.getTile(x, y)
    );
  }

  applyPollution(x, y, amount, radius = 3) {
    const tiles = this.getTilesInRadius(x, y, radius);
    for (const tile of tiles) {
      if (!tile) continue;
      const dist = Math.sqrt((tile.x - x) ** 2 + (tile.y - y) ** 2);
      const factor = 1 - dist / (radius + 1);
      tile.addPollution(amount * factor);
    }
  }

  decayAllPollution(rate) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x].decayPollution(rate);
      }
    }
  }

  getStats() {
    let grass = 0;
    let water = 0;
    let road = 0;
    let occupied = 0;
    let totalPollution = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = this.tiles[y][x];
        if (t.terrain === TERRAIN.GRASS) grass++;
        if (t.terrain === TERRAIN.WATER) water++;
        if (t.road) road++;
        if (t.isOccupied) occupied++;
        totalPollution += t.pollution;
      }
    }
    const total = this.width * this.height;
    return {
      width: this.width,
      height: this.height,
      totalTiles: total,
      grass,
      water,
      roadCount: road,
      occupied,
      buildingCount: this.buildings.size,
      averagePollution: total > 0 ? totalPollution / total : 0
    };
  }

  toJSON() {
    const tilesData = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        tilesData.push(this.tiles[y][x].toJSON());
      }
    }
    return {
      width: this.width,
      height: this.height,
      seed: this.seed,
      tiles: tilesData,
      buildings: [...this.buildings.values()]
    };
  }

  static fromJSON(data) {
    const grid = new MapGrid(data.width, data.height, data.seed);
    for (const td of data.tiles) {
      grid.tiles[td.y][td.x] = Tile.fromJSON(td);
    }
    if (data.buildings) {
      for (const b of data.buildings) {
        grid.buildings.set(b.id, b);
      }
    }
    grid.rebuildRoadGraph();
    return grid;
  }
}

export default MapGrid;
