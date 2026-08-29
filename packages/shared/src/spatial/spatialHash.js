/**
 * CITYMIND Dynamic Spatial Hash Grid Library
 * Production-quality high-performance 2D Spatial Hash Grid for fast indexing of dynamic entities
 * (citizens, vehicles, particles) supporting radius queries, AABB rectangle queries, entity movement updates,
 * cell coordinate conversions, debug statistics, and dynamic grid resizing.
 */

import { Vector2, BoundingBox2D } from '../math/vector.js';

export class SpatialHashGrid {
  constructor(cellSize = 32) {
    this.cellSize = cellSize;
    this.buckets = new Map();
    this.entityMap = new Map(); // entityId -> { entity, position, cellKey, bounds }
    this.stats = {
      totalEntities: 0,
      totalBuckets: 0,
      totalQueries: 0,
      lastQueryTimeMs: 0
    };
  }

  hashKey(cellX, cellY) {
    // Large prime XOR spatial hashing formula
    const h1 = (cellX * 73856093) >>> 0;
    const h2 = (cellY * 19349663) >>> 0;
    return `${h1}_${h2}`;
  }

  worldToCell(x, y) {
    return {
      cellX: Math.floor(x / this.cellSize),
      cellY: Math.floor(y / this.cellSize)
    };
  }

  cellToWorld(cellX, cellY) {
    return new Vector2(cellX * this.cellSize, cellY * this.cellSize);
  }

  insert(entityId, entity, position, boundsRadius = 0) {
    if (this.entityMap.has(entityId)) {
      this.remove(entityId);
    }

    const { cellX, cellY } = this.worldToCell(position.x, position.y);
    const key = this.hashKey(cellX, cellY);

    if (!this.buckets.has(key)) {
      this.buckets.set(key, new Set());
    }

    const bucket = this.buckets.get(key);
    bucket.add(entityId);

    const record = {
      id: entityId,
      entity,
      position: position.clone(),
      cellX,
      cellY,
      key,
      boundsRadius
    };

    this.entityMap.set(entityId, record);
    this.stats.totalEntities = this.entityMap.size;
    this.stats.totalBuckets = this.buckets.size;
    return true;
  }

  update(entityId, newPosition) {
    const record = this.entityMap.get(entityId);
    if (!record) return false;

    const { cellX, cellY } = this.worldToCell(newPosition.x, newPosition.y);
    if (cellX === record.cellX && cellY === record.cellY) {
      record.position.copy(newPosition);
      return true; // No cell re-hashing needed
    }

    // Cell changed, re-index
    const oldBucket = this.buckets.get(record.key);
    if (oldBucket) {
      oldBucket.delete(entityId);
      if (oldBucket.size === 0) {
        this.buckets.delete(record.key);
      }
    }

    const newKey = this.hashKey(cellX, cellY);
    if (!this.buckets.has(newKey)) {
      this.buckets.set(newKey, new Set());
    }
    this.buckets.get(newKey).add(entityId);

    record.position.copy(newPosition);
    record.cellX = cellX;
    record.cellY = cellY;
    record.key = newKey;

    this.stats.totalBuckets = this.buckets.size;
    return true;
  }

  remove(entityId) {
    const record = this.entityMap.get(entityId);
    if (!record) return false;

    const bucket = this.buckets.get(record.key);
    if (bucket) {
      bucket.delete(entityId);
      if (bucket.size === 0) {
        this.buckets.delete(record.key);
      }
    }

    this.entityMap.delete(entityId);
    this.stats.totalEntities = this.entityMap.size;
    this.stats.totalBuckets = this.buckets.size;
    return true;
  }

  queryRadius(center, radius) {
    const startTime = performance.now();
    this.stats.totalQueries++;

    const minCell = this.worldToCell(center.x - radius, center.y - radius);
    const maxCell = this.worldToCell(center.x + radius, center.y + radius);

    const radiusSq = radius * radius;
    const results = [];

    for (let cx = minCell.cellX; cx <= maxCell.cellX; cx++) {
      for (let cy = minCell.cellY; cy <= maxCell.cellY; cy++) {
        const key = this.hashKey(cx, cy);
        const bucket = this.buckets.get(key);
        if (!bucket) continue;

        for (const entityId of bucket) {
          const record = this.entityMap.get(entityId);
          if (record && record.position.distanceToSquared(center) <= radiusSq) {
            results.push(record.entity);
          }
        }
      }
    }

    this.stats.lastQueryTimeMs = performance.now() - startTime;
    return results;
  }

  queryAABB(minPos, maxPos) {
    const startTime = performance.now();
    this.stats.totalQueries++;

    const minCell = this.worldToCell(minPos.x, minPos.y);
    const maxCell = this.worldToCell(maxPos.x, maxPos.y);

    const results = [];

    for (let cx = minCell.cellX; cx <= maxCell.cellX; cx++) {
      for (let cy = minCell.cellY; cy <= maxCell.cellY; cy++) {
        const key = this.hashKey(cx, cy);
        const bucket = this.buckets.get(key);
        if (!bucket) continue;

        for (const entityId of bucket) {
          const record = this.entityMap.get(entityId);
          if (
            record &&
            record.position.x >= minPos.x && record.position.x <= maxPos.x &&
            record.position.y >= minPos.y && record.position.y <= maxPos.y
          ) {
            results.push(record.entity);
          }
        }
      }
    }

    this.stats.lastQueryTimeMs = performance.now() - startTime;
    return results;
  }

  resizeCellSize(newCellSize) {
    if (newCellSize === this.cellSize || newCellSize <= 0) return;

    const allRecords = Array.from(this.entityMap.values());
    this.clear();
    this.cellSize = newCellSize;

    for (const rec of allRecords) {
      this.insert(rec.id, rec.entity, rec.position, rec.boundsRadius);
    }
  }

  clear() {
    this.buckets.clear();
    this.entityMap.clear();
    this.stats.totalEntities = 0;
    this.stats.totalBuckets = 0;
  }

  getDebugStats() {
    let maxBucketSize = 0;
    let totalItemsInBuckets = 0;

    for (const bucket of this.buckets.values()) {
      maxBucketSize = Math.max(maxBucketSize, bucket.size);
      totalItemsInBuckets += bucket.size;
    }

    const avgBucketSize = this.buckets.size > 0 ? totalItemsInBuckets / this.buckets.size : 0;

    return {
      cellSize: this.cellSize,
      totalEntities: this.stats.totalEntities,
      totalBuckets: this.stats.totalBuckets,
      maxBucketSize,
      avgBucketSize,
      totalQueries: this.stats.totalQueries,
      lastQueryTimeMs: this.stats.lastQueryTimeMs
    };
  }
}

export default SpatialHashGrid;
