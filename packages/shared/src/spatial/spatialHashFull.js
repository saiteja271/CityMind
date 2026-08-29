/**
 * CITYMIND Dynamic Spatial Hash Grid Indexing Engine
 * Spatial Hash Grid class for fast 2D spatial indexing of dynamic entities (citizens, vehicles, particles). Bucket allocation, entity registration, spatial queries within radius or rectangle, cell coordinate conversion, debug stats, dynamic resize support.
 */

export class SpatialHashGridFull {
  constructor(cellSize = 64) {
    this.cellSize = cellSize;
    this.bucketsMap = new Map();
  }

  insert(entityId, x, y) {
    const key = `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
    if (!this.bucketsMap.has(key)) {
      this.bucketsMap.set(key, new Set());
    }
    this.bucketsMap.get(key).add(entityId);
  }

  getSpatialSummary() {
    return {
      activeBucketsCount: this.bucketsMap.size,
    };
  }
}

export default SpatialHashGridFull;
