/**
 * EntityManager - Tracks dynamic entities (vehicles, pedestrians, effects).
 */

import { generateId } from '@citymind/utilities';

export class EntityManager {
  constructor() {
    this.entities = new Map();
    this.byType = new Map();
    this._nextId = 1;
  }

  add(entity) {
    if (!entity.id) {
      entity.id = generateId('ent');
    }
    this.entities.set(entity.id, entity);
    const type = entity.type || 'unknown';
    if (!this.byType.has(type)) {
      this.byType.set(type, new Set());
    }
    this.byType.get(type).add(entity.id);
    return entity;
  }

  remove(id) {
    const entity = this.entities.get(id);
    if (!entity) return false;
    this.entities.delete(id);
    const typeSet = this.byType.get(entity.type);
    if (typeSet) typeSet.delete(id);
    return true;
  }

  get(id) {
    return this.entities.get(id);
  }

  getByType(type) {
    const ids = this.byType.get(type);
    if (!ids) return [];
    return [...ids].map((id) => this.entities.get(id)).filter(Boolean);
  }

  update(dt, simulationTime) {
    const toRemove = [];
    for (const entity of this.entities.values()) {
      if (typeof entity.update === 'function') {
        entity.update(dt, simulationTime);
      }
      if (entity.destroyed) {
        toRemove.push(entity.id);
      }
    }
    for (const id of toRemove) {
      this.remove(id);
    }
  }

  queryAll() {
    return [...this.entities.values()];
  }

  count() {
    return this.entities.size;
  }

  clear() {
    this.entities.clear();
    this.byType.clear();
  }

  toJSON() {
    return [...this.entities.values()].map((e) =>
      typeof e.toJSON === 'function' ? e.toJSON() : { ...e }
    );
  }
}

export default EntityManager;
