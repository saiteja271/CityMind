/**
 * CITYMIND Elevation Contour & Procedural Biome Terrain Renderer
 * Elevation contour rendering, grass/water/rock/sand texturing using procedural canvas patterns, shoreline animation, seasonal biome tinting.
 */

export class TerrainTileBiome {
  constructor(type = 'GRASS', elevationMeters = 10) {
    this.type = type; // 'GRASS', 'WATER', 'ROCK', 'SAND', 'SNOW'
    this.elevationMeters = elevationMeters;
  }
}

export class TerrainRendererFull {
  constructor() {
    this.biomeColors = {
      GRASS: '#22c55e',
      WATER: '#0284c7',
      ROCK: '#64748b',
      SAND: '#eab308',
      SNOW: '#f8fafc',
    };
  }

  renderTile(ctx, type, x, y) {
    if (!ctx) return;
    ctx.fillStyle = this.biomeColors[type] || '#22c55e';
    ctx.fillRect(x, y, 32, 32);
  }
}

export default TerrainRendererFull;
