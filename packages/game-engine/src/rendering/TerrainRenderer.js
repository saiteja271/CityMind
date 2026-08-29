/**
 * TerrainRenderer - Advanced terrain, elevation contour, procedural pattern, shoreline, and seasonal renderer.
 */

import { TERRAIN, MAP } from '@citymind/constants';

export class TerrainRenderer {
  constructor(options = {}) {
    this.tileSize = options.tileSize ?? MAP.TILE_SIZE;
    this.season = options.season ?? 'summer'; // 'spring', 'summer', 'autumn', 'winter'
    this.seasonTransition = options.seasonTransition ?? 1.0; // 0..1 transition progress
    this.time = 0;

    // Pattern cache
    this._patterns = new Map();
    this._patternCanvases = new Map();

    // Color palettes for terrain types per season
    this.palettes = {
      spring: {
        [TERRAIN.GRASS]: '#43a047',
        [TERRAIN.DIRT]: '#8d6e63',
        [TERRAIN.SAND]: '#e0e0e0',
        [TERRAIN.WATER]: '#1e88e5',
        [TERRAIN.ROCK]: '#78909c',
        [TERRAIN.FOREST]: '#2e7d32',
        [TERRAIN.SWAMP]: '#33691e'
      },
      summer: {
        [TERRAIN.GRASS]: '#388e3c',
        [TERRAIN.DIRT]: '#795548',
        [TERRAIN.SAND]: '#d7ccc8',
        [TERRAIN.WATER]: '#1565c0',
        [TERRAIN.ROCK]: '#616161',
        [TERRAIN.FOREST]: '#1b5e20',
        [TERRAIN.SWAMP]: '#2e7d32'
      },
      autumn: {
        [TERRAIN.GRASS]: '#8d6e63',
        [TERRAIN.DIRT]: '#6d4c41',
        [TERRAIN.SAND]: '#bcaaa4',
        [TERRAIN.WATER]: '#0d47a1',
        [TERRAIN.ROCK]: '#546e7a',
        [TERRAIN.FOREST]: '#d84315',
        [TERRAIN.SWAMP]: '#4e342e'
      },
      winter: {
        [TERRAIN.GRASS]: '#eceff1',
        [TERRAIN.DIRT]: '#b0bec5',
        [TERRAIN.SAND]: '#cfd8dc',
        [TERRAIN.WATER]: '#0288d1',
        [TERRAIN.ROCK]: '#455a64',
        [TERRAIN.FOREST]: '#78909c',
        [TERRAIN.SWAMP]: '#37474f'
      }
    };

    // Initialize procedural textures
    this._generateProceduralPatterns();
  }

  setSeason(season, transition = 1.0) {
    this.season = season;
    this.seasonTransition = Math.max(0, Math.min(1, transition));
  }

  update(dt = 0.016) {
    this.time += dt;
  }

  _generateProceduralPatterns() {
    if (typeof document === 'undefined') return; // SSR / Node test fallback

    const createPatternCanvas = (size, drawFn) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      drawFn(ctx, size);
      return canvas;
    };

    // Grass noise pattern
    this._patternCanvases.set('grass', createPatternCanvas(64, (ctx, size) => {
      ctx.fillStyle = '#388e3c';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 1.5 + 0.5;
        const shade = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }));

    // Dirt noise pattern
    this._patternCanvases.set('dirt', createPatternCanvas(64, (ctx, size) => {
      ctx.fillStyle = '#795548';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 1.2 + 0.3;
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }));

    // Sand pattern
    this._patternCanvases.set('sand', createPatternCanvas(64, (ctx, size) => {
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = 'rgba(121, 85, 72, 0.1)';
        ctx.fillRect(x, y, 2, 2);
      }
    }));

    // Rock noise pattern
    this._patternCanvases.set('rock', createPatternCanvas(64, (ctx, size) => {
      ctx.fillStyle = '#616161';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = Math.random() * 8 + 2;
        const h = Math.random() * 8 + 2;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, y, w, h);
      }
    }));
  }

  getTerrainColor(type, seasonOverride = null) {
    const currentSeason = seasonOverride || this.season;
    const palette = this.palettes[currentSeason] || this.palettes.summer;
    return palette[type] || palette[TERRAIN.GRASS] || '#388e3c';
  }

  renderTile(ctx, tile, screenX, screenY, size, options = {}) {
    const { isometric = false, elevation = 0, isShoreline = false, neighbors = {} } = options;
    const baseColor = this.getTerrainColor(tile.terrain);

    ctx.save();

    if (isometric) {
      this._renderIsometricTile(ctx, tile, screenX, screenY, size, baseColor, elevation);
    } else {
      this._renderOrthographicTile(ctx, tile, screenX, screenY, size, baseColor, elevation);
    }

    // Shoreline foam and water ripples
    if (tile.terrain === TERRAIN.WATER || isShoreline) {
      this._renderShorelineAnimation(ctx, screenX, screenY, size, tile, neighbors);
    }

    // Elevation contour lines
    if (options.showContours && elevation > 0) {
      this._renderContourLines(ctx, screenX, screenY, size, elevation);
    }

    ctx.restore();
  }

  _renderOrthographicTile(ctx, tile, x, y, size, baseColor, elevation) {
    // Height shadow displacement
    if (elevation > 0) {
      const shadowOffset = Math.min(8, elevation * 1.5);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(x + shadowOffset, y + shadowOffset, size, size);
    }

    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, size, size);

    // Apply noise pattern if available
    const patternCanvas = this._patternCanvases.get(tile.terrain);
    if (patternCanvas) {
      ctx.globalAlpha = 0.35;
      ctx.drawImage(patternCanvas, 0, 0, patternCanvas.width, patternCanvas.height, x, y, size, size);
      ctx.globalAlpha = 1.0;
    }

    // Slope shading based on tile elevation gradient
    if (tile.elevationSlope) {
      const slopeShade = Math.max(-0.3, Math.min(0.3, tile.elevationSlope));
      if (slopeShade > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${slopeShade * 0.4})`;
      } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${-slopeShade * 0.4})`;
      }
      ctx.fillRect(x, y, size, size);
    }
  }

  _renderIsometricTile(ctx, tile, x, y, size, baseColor, elevation) {
    const halfW = size;
    const halfH = size / 2;
    const hOffset = elevation * 8;

    // Top face
    ctx.beginPath();
    ctx.moveTo(x, y - hOffset);
    ctx.lineTo(x + halfW, y + halfH - hOffset);
    ctx.lineTo(x, y + size - hOffset);
    ctx.lineTo(x - halfW, y + halfH - hOffset);
    ctx.closePath();

    ctx.fillStyle = baseColor;
    ctx.fill();

    // Side faces for elevated tiles
    if (elevation > 0) {
      // Left side face
      ctx.beginPath();
      ctx.moveTo(x - halfW, y + halfH - hOffset);
      ctx.lineTo(x, y + size - hOffset);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - halfW, y + halfH);
      ctx.closePath();
      ctx.fillStyle = this._adjustColor(baseColor, -30);
      ctx.fill();

      // Right side face
      ctx.beginPath();
      ctx.moveTo(x + halfW, y + halfH - hOffset);
      ctx.lineTo(x, y + size - hOffset);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x + halfW, y + halfH);
      ctx.closePath();
      ctx.fillStyle = this._adjustColor(baseColor, -50);
      ctx.fill();
    }
  }

  _renderShorelineAnimation(ctx, x, y, size, tile, neighbors) {
    const waveOffset = Math.sin(this.time * 2.5 + (x * 0.05 + y * 0.05)) * 2;

    if (tile.terrain === TERRAIN.WATER) {
      // Water wave highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      const waveY = y + (size * 0.3) + waveOffset;
      ctx.fillRect(x + 4, waveY, size - 8, 2);

      const secondaryY = y + (size * 0.7) - waveOffset;
      ctx.fillRect(x + 8, secondaryY, size - 16, 1.5);
    }

    // Shoreline foam on water edges adjacent to land
    if (neighbors.northLand || neighbors.southLand || neighbors.westLand || neighbors.eastLand) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(this.time * 3) * 0.15})`;
      if (neighbors.northLand) ctx.fillRect(x, y, size, 3);
      if (neighbors.southLand) ctx.fillRect(x, y + size - 3, size, 3);
      if (neighbors.westLand) ctx.fillRect(x, y, 3, size);
      if (neighbors.eastLand) ctx.fillRect(x + size - 3, y, 3, size);
    }
  }

  _renderContourLines(ctx, x, y, size, elevation) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    if (elevation % 5 === 0) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1.5;
    }

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  _adjustColor(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    if (isNaN(num)) return hex;
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

export default TerrainRenderer;
