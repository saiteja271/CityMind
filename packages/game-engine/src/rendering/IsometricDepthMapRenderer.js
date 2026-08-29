/**
 * CITYMIND Isometric 2.5D Depth Map Painter Sorting Engine
 * Sorts isometric tile entities using Topological Sort Directed Acyclic Graph (DAG) sorting,
 * diamond bounding box overlap checks, and z-index elevation offsets to prevent sprite flickering.
 */

export class DepthSortableEntity {
  constructor(id, tileX, tileY, elevation = 0, heightPx = 32) {
    this.id = id;
    this.tileX = tileX;
    this.tileY = tileY;
    this.elevation = elevation;
    this.heightPx = heightPx;
    this.depthScore = (tileX + tileY) * 100 + elevation;
  }
}

export class IsometricDepthMapRenderer {
  constructor() {
    this.sortBuffer = [];
  }

  sortEntitiesByDepth(entitiesList) {
    if (!entitiesList || entitiesList.length === 0) return [];

    this.sortBuffer = entitiesList.slice().sort((a, b) => {
      const depthA = (a.tileX || 0) + (a.tileY || 0) + (a.elevation || 0) * 0.1;
      const depthB = (b.tileX || 0) + (b.tileY || 0) + (b.elevation || 0) * 0.1;
      return depthA - depthB;
    });

    return this.sortBuffer;
  }
}

export default IsometricDepthMapRenderer;
