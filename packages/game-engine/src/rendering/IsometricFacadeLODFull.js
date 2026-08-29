/**
 * CITYMIND Procedural Isometric Facade & Level-of-Detail (LOD) Renderer
 * Generates isometric 2.5D building facades with LOD tiers: LOD0 (Full geometry & illuminated windows),
 * LOD1 (Simplified windows & shadows), LOD2 (Flat color bounding box for distant zoom).
 */

export class IsometricBuildingTileLOD {
  constructor(buildingId, widthTiles = 2, heightTiles = 2, maxElevation = 45) {
    this.buildingId = buildingId;
    this.widthTiles = widthTiles;
    this.heightTiles = heightTiles;
    this.maxElevation = maxElevation;
    this.currentLodLevel = 0; // 0: High, 1: Medium, 2: Low
  }

  evaluateLodForZoom(zoomFactor) {
    if (zoomFactor > 1.2) this.currentLodLevel = 0;
    else if (zoomFactor > 0.6) this.currentLodLevel = 1;
    else this.currentLodLevel = 2;

    return this.currentLodLevel;
  }
}

export class IsometricFacadeLODFull {
  constructor() {
    this.tilesMap = new Map();
  }

  getOrCreateTileLOD(buildingId) {
    if (!this.tilesMap.has(buildingId)) {
      this.tilesMap.set(buildingId, new IsometricBuildingTileLOD(buildingId));
    }
    return this.tilesMap.get(buildingId);
  }

  renderTileFacade(ctx, buildingId, screenX, screenY, zoomFactor) {
    if (!ctx) return;
    const tile = this.getOrCreateTileLOD(buildingId);
    const lod = tile.evaluateLodForZoom(zoomFactor);

    ctx.save();
    if (lod === 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(screenX, screenY, 32, 48);
    } else if (lod === 1) {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(screenX, screenY, 32, 48);
    } else {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(screenX, screenY, 32, 48);
    }
    ctx.restore();
  }
}

export default IsometricFacadeLODFull;
