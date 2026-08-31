/**
 * DistrictManager.js
 * Manages city districts — named regions of tiles with independent policies,
 * budgets, service coverage stats, and population breakdowns.
 *
 * Each district stores:
 *  - Boundary: a set of tile coordinates (col, row)
 *  - Zone policy: allowed building types and density limits
 *  - Local budget: tax revenue collected from buildings in district
 *  - Service stats: pollution, happiness, coverage metrics per district
 *  - Demographic snapshot: citizens living / working within the boundary
 */

/** @typedef {{ col: number, row: number }} TileCoord */

/** @typedef {object} District
 * @property {string} id
 * @property {string} name
 * @property {string} color - Hex color for map overlay
 * @property {Set<string>} tiles - Set of "col,row" keys
 * @property {object} policy
 * @property {object} stats
 * @property {object} budget
 */

export class DistrictManager {
  constructor() {
    /** @type {Map<string, District>} */
    this._districts = new Map();
    /** @type {Map<string, string>} tile key -> district id */
    this._tileIndex = new Map();
    this._nextId = 1;
  }

  // ─── District CRUD ──────────────────────────────────────────────────────────

  /**
   * Create a new district.
   * @param {object} opts
   * @param {string} opts.name
   * @param {string} [opts.color='#4A90D9']
   * @param {TileCoord[]} [opts.tiles=[]]
   * @param {object} [opts.policy]
   * @returns {District}
   */
  createDistrict({ name, color = '#4A90D9', tiles = [], policy = {} }) {
    const id = `district_${this._nextId++}`;

    const district = {
      id,
      name: name || `District ${this._nextId - 1}`,
      color,
      tiles: new Set(),
      policy: {
        maxDensity: policy.maxDensity ?? 'high',       // 'low' | 'medium' | 'high'
        allowedZones: policy.allowedZones ?? ['residential', 'commercial', 'industrial', 'public'],
        taxMultiplier: policy.taxMultiplier ?? 1.0,    // District-level tax modifier
        speedLimit: policy.speedLimit ?? 50,           // km/h for road network
        noiseOrdinance: policy.noiseOrdinance ?? false,
        greenSpaceRequirement: policy.greenSpaceRequirement ?? 0.1, // 10% min green
      },
      stats: this._emptyStats(),
      budget: {
        revenue: 0,
        expenses: 0,
        balance: 0,
        lastUpdatedAt: null,
      },
    };

    this._districts.set(id, district);
    this.addTiles(id, tiles);
    return district;
  }

  /**
   * Update district properties (name, color, policy).
   * @param {string} id
   * @param {object} patch
   */
  updateDistrict(id, patch) {
    const district = this._getOrThrow(id);
    if (patch.name !== undefined) district.name = patch.name;
    if (patch.color !== undefined) district.color = patch.color;
    if (patch.policy) Object.assign(district.policy, patch.policy);
    return district;
  }

  /**
   * Remove a district, freeing all its tiles.
   * @param {string} id
   */
  removeDistrict(id) {
    const district = this._getOrThrow(id);
    for (const key of district.tiles) {
      this._tileIndex.delete(key);
    }
    this._districts.delete(id);
  }

  // ─── Tile membership ────────────────────────────────────────────────────────

  /**
   * Add tiles to a district. Tiles already in another district are re-assigned.
   * @param {string} id
   * @param {TileCoord[]} tiles
   */
  addTiles(id, tiles) {
    const district = this._getOrThrow(id);
    for (const { col, row } of tiles) {
      const key = `${col},${row}`;
      // Remove from previous district if any
      const prevId = this._tileIndex.get(key);
      if (prevId && prevId !== id) {
        const prev = this._districts.get(prevId);
        if (prev) prev.tiles.delete(key);
      }
      district.tiles.add(key);
      this._tileIndex.set(key, id);
    }
  }

  /**
   * Remove specific tiles from a district.
   * @param {string} id
   * @param {TileCoord[]} tiles
   */
  removeTiles(id, tiles) {
    const district = this._getOrThrow(id);
    for (const { col, row } of tiles) {
      const key = `${col},${row}`;
      district.tiles.delete(key);
      this._tileIndex.delete(key);
    }
  }

  /**
   * Get the district that owns a tile, or null.
   * @param {number} col
   * @param {number} row
   * @returns {District|null}
   */
  getDistrictForTile(col, row) {
    const id = this._tileIndex.get(`${col},${row}`);
    return id ? (this._districts.get(id) ?? null) : null;
  }

  // ─── Stats recalculation ────────────────────────────────────────────────────

  /**
   * Recompute district stats from the current map, building, and citizen state.
   * Should be called once per simulation tick (or less frequently for large maps).
   *
   * @param {object} worldState
   * @param {object[]} worldState.buildings - All placed buildings
   * @param {object[]} worldState.citizens  - All citizens
   */
  recalculateStats({ buildings = [], citizens = [] }) {
    // Reset all district stats
    for (const d of this._districts.values()) {
      d.stats = this._emptyStats();
      d.budget.revenue = 0;
      d.budget.expenses = 0;
    }

    // Aggregate building data
    for (const building of buildings) {
      const districtId = this._tileIndex.get(`${building.col},${building.row}`);
      if (!districtId) continue;
      const d = this._districts.get(districtId);
      if (!d) continue;

      d.stats.buildingCount++;
      d.stats.pollutionSum += building.pollution ?? 0;
      d.budget.revenue += (building.taxRevenue ?? 0) * d.policy.taxMultiplier;
      d.budget.expenses += building.maintenanceCost ?? 0;

      if (building.zone === 'residential') d.stats.residentialBuildings++;
      if (building.zone === 'commercial') d.stats.commercialBuildings++;
      if (building.zone === 'industrial') d.stats.industrialBuildings++;
      if (building.zone === 'public') d.stats.publicBuildings++;
    }

    // Aggregate citizen data
    for (const citizen of citizens) {
      const homeKey = `${citizen.homeCol},${citizen.homeRow}`;
      const districtId = this._tileIndex.get(homeKey);
      if (!districtId) continue;
      const d = this._districts.get(districtId);
      if (!d) continue;

      d.stats.residentCount++;
      d.stats.happinessSum += citizen.happiness ?? 50;
      if (!citizen.employed) d.stats.unemployedCount++;
    }

    // Finalize averages and balances
    for (const d of this._districts.values()) {
      if (d.stats.buildingCount > 0) {
        d.stats.avgPollution = d.stats.pollutionSum / d.stats.buildingCount;
      }
      if (d.stats.residentCount > 0) {
        d.stats.avgHappiness = d.stats.happinessSum / d.stats.residentCount;
        d.stats.unemploymentRate = d.stats.unemployedCount / d.stats.residentCount;
      }
      d.budget.balance = d.budget.revenue - d.budget.expenses;
      d.budget.lastUpdatedAt = new Date().toISOString();
    }
  }

  // ─── Queries ────────────────────────────────────────────────────────────────

  /** @returns {District[]} All districts sorted by name */
  listDistricts() {
    return [...this._districts.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  /** @param {string} id @returns {District} */
  getDistrict(id) {
    return this._getOrThrow(id);
  }

  /**
   * Return a GeoJSON-like summary of all districts for the map overlay renderer.
   * @returns {Array}
   */
  toMapOverlay() {
    return [...this._districts.values()].map((d) => ({
      id: d.id,
      name: d.name,
      color: d.color,
      tileCount: d.tiles.size,
      stats: { ...d.stats },
    }));
  }

  /**
   * Serialize all districts to plain JSON for persistence.
   * @returns {object[]}
   */
  serialize() {
    return [...this._districts.values()].map((d) => ({
      ...d,
      tiles: [...d.tiles],
    }));
  }

  /**
   * Restore districts from serialized data.
   * @param {object[]} data
   */
  deserialize(data) {
    this._districts.clear();
    this._tileIndex.clear();
    this._nextId = 1;
    for (const raw of data) {
      const district = { ...raw, tiles: new Set(raw.tiles) };
      this._districts.set(district.id, district);
      for (const key of district.tiles) {
        this._tileIndex.set(key, district.id);
      }
      const num = parseInt(district.id.replace('district_', ''), 10);
      if (num >= this._nextId) this._nextId = num + 1;
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  _getOrThrow(id) {
    const d = this._districts.get(id);
    if (!d) throw new Error(`District "${id}" not found`);
    return d;
  }

  _emptyStats() {
    return {
      buildingCount: 0,
      residentialBuildings: 0,
      commercialBuildings: 0,
      industrialBuildings: 0,
      publicBuildings: 0,
      residentCount: 0,
      unemployedCount: 0,
      unemploymentRate: 0,
      happinessSum: 0,
      avgHappiness: 0,
      pollutionSum: 0,
      avgPollution: 0,
    };
  }
}

export default DistrictManager;
