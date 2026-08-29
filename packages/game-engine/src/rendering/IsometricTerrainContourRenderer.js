/**
 * CITYMIND Isometric Terrain Height Contour & Slope Renderer
 * Generates height map elevation contours, slope gradient shading matrices,
 * hydraulic erosion visual channels, and biome height transition blending algorithms.
 */

export class TerrainHeightContourMap {
  constructor(width = 64, height = 64) {
    this.width = width;
    this.height = height;
    this.elevationGrid = new Float32Array(width * height);
    this.biomeGrid = new Uint8Array(width * height); // 0: Water, 1: Sand, 2: Grass, 3: Rock, 4: Snow
  }

  setElevation(x, y, heightVal) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.elevationGrid[y * this.width + x] = heightVal;
    }
  }

  getElevation(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.elevationGrid[y * this.width + x];
    }
    return 0;
  }

  calculateSlopeGradient(x, y) {
    const hL = this.getElevation(x - 1, y);
    const hR = this.getElevation(x + 1, y);
    const hU = this.getElevation(x, y - 1);
    const hD = this.getElevation(x, y + 1);

    const dx = (hR - hL) / 2;
    const dy = (hD - hU) / 2;
    return Math.sqrt(dx * dx + dy * dy); // Slope magnitude
  }
}

export class IsometricTerrainContourRenderer {
  constructor(camera) {
    this.camera = camera;
    this.contourColors = {
      water: '#0284c7',
      sand: '#fde047',
      grass: '#22c55e',
      rock: '#64748b',
      snow: '#f8fafc',
    };
  }

  renderTerrainContourTile(ctx, x, y, elevation, biomeType = 2) {
    if (!ctx || !this.camera) return;
    const screenPos = this.camera.tileToScreen(x, y);
    ctx.save();

    let color = this.contourColors.grass;
    if (elevation < 0.2) color = this.contourColors.water;
    else if (elevation < 0.3) color = this.contourColors.sand;
    else if (elevation < 0.7) color = this.contourColors.grass;
    else if (elevation < 0.9) color = this.contourColors.rock;
    else color = this.contourColors.snow;

    // Draw Isometric Diamond Tile with Elevation Offset
    const elevationHeightOffset = elevation * 32;
    const topY = screenPos.y - elevationHeightOffset;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, topY);
    ctx.lineTo(screenPos.x + 32, topY + 16);
    ctx.lineTo(screenPos.x, topY + 32);
    ctx.lineTo(screenPos.x - 32, topY + 16);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export default IsometricTerrainContourRenderer;
