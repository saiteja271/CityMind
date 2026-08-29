/**
 * CanvasRenderer - Efficient tile-based map rendering with camera support.
 */

import { MAP, TERRAIN, ZONE, UI, BUILDING_DEFS } from '@citymind/constants';

const TERRAIN_COLORS = {
  [TERRAIN.GRASS]: '#3d7a3d',
  [TERRAIN.DIRT]: '#8b6914',
  [TERRAIN.SAND]: '#c2b280',
  [TERRAIN.WATER]: '#1a6b9a',
  [TERRAIN.ROCK]: '#6b6b6b',
  [TERRAIN.FOREST]: '#2d5a2d',
  [TERRAIN.SWAMP]: '#4a5c3a'
};

const ZONE_COLORS = {
  [ZONE.RESIDENTIAL]: 'rgba(76, 175, 80, 0.25)',
  [ZONE.COMMERCIAL]: 'rgba(33, 150, 243, 0.25)',
  [ZONE.INDUSTRIAL]: 'rgba(255, 152, 0, 0.25)',
  [ZONE.PUBLIC]: 'rgba(156, 39, 176, 0.25)',
  [ZONE.PARK]: 'rgba(139, 195, 74, 0.2)',
  [ZONE.INFRASTRUCTURE]: 'rgba(96, 125, 139, 0.2)'
};

const BUILDING_COLORS = {
  residential: '#66bb6a',
  commercial: '#42a5f5',
  industrial: '#ffa726',
  public: '#ab47bc',
  infrastructure: '#78909c',
  environment: '#9ccc65'
};

export class CanvasRenderer {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = camera;
    this.tileSize = MAP.TILE_SIZE;
    this.showGrid = false;
    this.showZones = true;
    this.showPollution = false;
    this.showTraffic = false;
    this.selectedTile = null;
    this.hoverTile = null;
    this.buildPreview = null;
    this._offscreen = null;
    this._dirty = true;
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.camera.setViewport(width, height);
    this._dirty = true;
  }

  markDirty() {
    this._dirty = true;
  }

  render(mapGrid, options = {}) {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, width, height);

    const bounds = this.camera.getVisibleTileBounds();
    const ts = this.tileSize * this.camera.zoom;
    const cam = this.camera;

    // Terrain + zones
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        const tile = mapGrid.getTile(x, y);
        if (!tile) continue;

        const screen = cam.tileToScreen(x, y);
        const sx = Math.floor(screen.x);
        const sy = Math.floor(screen.y);
        const size = Math.ceil(ts) + 1;

        // Terrain
        ctx.fillStyle = TERRAIN_COLORS[tile.terrain] || '#333';
        ctx.fillRect(sx, sy, size, size);

        // Zone overlay
        if (this.showZones && tile.zone && tile.zone !== ZONE.NONE && !tile.road) {
          ctx.fillStyle = ZONE_COLORS[tile.zone] || 'transparent';
          ctx.fillRect(sx, sy, size, size);
        }

        // Pollution overlay
        if (this.showPollution && tile.pollution > 5) {
          const alpha = Math.min(0.5, tile.pollution / 100);
          ctx.fillStyle = `rgba(139, 0, 0, ${alpha})`;
          ctx.fillRect(sx, sy, size, size);
        }

        // Road
        if (tile.road) {
          this._drawRoad(ctx, sx, sy, size, tile);
        }
      }
    }

    // Buildings
    for (const building of mapGrid.buildings.values()) {
      this._drawBuilding(ctx, building, cam, ts);
    }

    // Grid
    if (this.showGrid && this.camera.zoom >= 0.5) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let y = bounds.minY; y <= bounds.maxY; y++) {
        for (let x = bounds.minX; x <= bounds.maxX; x++) {
          const screen = cam.tileToScreen(x, y);
          ctx.strokeRect(Math.floor(screen.x), Math.floor(screen.y), Math.ceil(ts), Math.ceil(ts));
        }
      }
    }

    // Hover highlight
    if (this.hoverTile) {
      const screen = cam.tileToScreen(this.hoverTile.x, this.hoverTile.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(screen.x, screen.y, ts, ts);
    }

    // Selection
    if (this.selectedTile) {
      const screen = cam.tileToScreen(this.selectedTile.x, this.selectedTile.y);
      ctx.strokeStyle = UI.COLORS.primary;
      ctx.lineWidth = 3;
      ctx.strokeRect(screen.x - 1, screen.y - 1, ts + 2, ts + 2);
    }

    // Build preview
    if (this.buildPreview) {
      this._drawBuildPreview(ctx, this.buildPreview, cam, ts, mapGrid);
    }

    this._dirty = false;
  }

  _drawRoad(ctx, sx, sy, size, tile) {
    const pad = size * 0.15;
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(sx + pad, sy + pad, size - pad * 2, size - pad * 2);

    // Connection lines
    ctx.fillStyle = '#5a6578';
    const mid = size / 2;
    const thick = size * 0.2;
    if (tile.roadConnections.n) {
      ctx.fillRect(sx + mid - thick / 2, sy, thick, pad + 2);
    }
    if (tile.roadConnections.s) {
      ctx.fillRect(sx + mid - thick / 2, sy + size - pad - 2, thick, pad + 2);
    }
    if (tile.roadConnections.w) {
      ctx.fillRect(sx, sy + mid - thick / 2, pad + 2, thick);
    }
    if (tile.roadConnections.e) {
      ctx.fillRect(sx + size - pad - 2, sy + mid - thick / 2, pad + 2, thick);
    }
  }

  _drawBuilding(ctx, building, cam, ts) {
    const def = BUILDING_DEFS[building.type] || {};
    const w = (def.size?.w || 1) * ts;
    const h = (def.size?.h || 1) * ts;
    const screen = cam.tileToScreen(building.x, building.y);
    const category = def.category || 'residential';
    const color = BUILDING_COLORS[category] || '#888';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(screen.x + 2, screen.y + 2, w, h);

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(screen.x, screen.y, w, h);

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(screen.x, screen.y, w, h);

    // Simple roof/detail for larger buildings
    if ((def.size?.w || 1) > 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(screen.x + 2, screen.y + 2, w - 4, h * 0.3);
    }

    // Label at high zoom
    if (cam.zoom >= 1.2 && def.name) {
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(8, 10 * cam.zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(def.name.slice(0, 8), screen.x + w / 2, screen.y + h / 2 + 4);
    }
  }

  _drawBuildPreview(ctx, preview, cam, ts, mapGrid) {
    const def = BUILDING_DEFS[preview.type] || { size: { w: 1, h: 1 } };
    const w = (def.size?.w || 1);
    const h = (def.size?.h || 1);
    let valid = true;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const tile = mapGrid.getTile(preview.x + dx, preview.y + dy);
        if (!tile || (!tile.isBuildable && preview.type !== 'road')) {
          valid = false;
        }
      }
    }
    const screen = cam.tileToScreen(preview.x, preview.y);
    ctx.fillStyle = valid ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.4)';
    ctx.fillRect(screen.x, screen.y, w * ts, h * ts);
    ctx.strokeStyle = valid ? '#4caf50' : '#f44336';
    ctx.lineWidth = 2;
    ctx.strokeRect(screen.x, screen.y, w * ts, h * ts);
  }
}

export default CanvasRenderer;
