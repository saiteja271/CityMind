/**
 * BuildingManager - Construction, operation, efficiency of all city buildings.
 */

import { BUILDING_DEFS, BUILDING_CATEGORY } from '@citymind/constants';
import { generateId } from '@citymind/utilities';

export class BuildingManager {
  constructor(simulation) {
    this.sim = simulation;
    this.buildings = new Map();
  }

  create(type, x, y, options = {}) {
    const def = BUILDING_DEFS[type];
    if (!def) return { success: false, reason: 'Unknown building type' };

    const building = {
      id: options.id || generateId('bld'),
      type,
      name: def.name,
      category: def.category,
      x,
      y,
      size: { ...def.size },
      cost: def.cost,
      maintenance: def.maintenance,
      capacity: def.capacity || 0,
      employees: def.employees || 0,
      currentEmployees: 0,
      occupants: [],
      power: def.power || 0,
      water: def.water || 0,
      pollution: def.pollution || 0,
      influenceRadius: def.influenceRadius || 0,
      efficiency: 1.0,
      operating: true,
      constructionProgress: options.instant ? 1 : 0,
      constructionTime: def.constructionTime || 1,
      level: 1,
      revenue: 0,
      customerCapacity: def.customerCapacity || 0,
      ...options
    };

    this.buildings.set(building.id, building);
    return { success: true, building };
  }

  remove(id) {
    return this.buildings.delete(id);
  }

  get(id) {
    return this.buildings.get(id);
  }

  getAll() {
    return [...this.buildings.values()];
  }

  getByCategory(category) {
    return this.getAll().filter((b) => b.category === category);
  }

  getByType(type) {
    return this.getAll().filter((b) => b.type === type);
  }

  getResidential() {
    return this.getByCategory(BUILDING_CATEGORY.RESIDENTIAL);
  }

  getTotalHousingCapacity() {
    return this.getResidential().reduce((s, b) => s + (b.capacity || 0), 0);
  }

  getTotalJobs() {
    return this.getAll().reduce((s, b) => s + (b.employees || 0), 0);
  }

  getFilledJobs() {
    return this.getAll().reduce((s, b) => s + (b.currentEmployees || 0), 0);
  }

  updateConstruction(dtDays) {
    for (const b of this.buildings.values()) {
      if (b.constructionProgress < 1) {
        b.constructionProgress = Math.min(
          1,
          b.constructionProgress + dtDays / Math.max(1, b.constructionTime)
        );
        if (b.constructionProgress >= 1) {
          b.operating = true;
        }
      }
    }
  }

  updateEfficiency() {
    for (const b of this.buildings.values()) {
      if (!b.operating || b.constructionProgress < 1) {
        b.efficiency = 0;
        continue;
      }
      let eff = 1.0;
      if (b.employees > 0) {
        const ratio = b.currentEmployees / b.employees;
        eff *= 0.3 + 0.7 * Math.min(1, ratio);
      }
      b.efficiency = Math.max(0, Math.min(1, eff));
    }
  }

  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      residential: this.getByCategory(BUILDING_CATEGORY.RESIDENTIAL).length,
      commercial: this.getByCategory(BUILDING_CATEGORY.COMMERCIAL).length,
      industrial: this.getByCategory(BUILDING_CATEGORY.INDUSTRIAL).length,
      public: this.getByCategory(BUILDING_CATEGORY.PUBLIC).length,
      housingCapacity: this.getTotalHousingCapacity(),
      totalJobs: this.getTotalJobs(),
      filledJobs: this.getFilledJobs()
    };
  }

  toJSON() {
    return { buildings: this.getAll() };
  }

  static fromJSON(data, simulation) {
    const mgr = new BuildingManager(simulation);
    if (data.buildings) {
      for (const b of data.buildings) {
        mgr.buildings.set(b.id, b);
      }
    }
    return mgr;
  }
}

export default BuildingManager;
