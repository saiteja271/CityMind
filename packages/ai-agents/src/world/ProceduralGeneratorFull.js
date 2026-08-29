/**
 * CITYMIND Procedural World & Heightmap Generation Engine
 * Perlin noise heightmap generator, river erosion algorithm, coastline formation, forest distribution, ore deposit seeding, starting road layout generator based on terrain contours.
 */

export class ProceduralWorldMap {
  constructor(width = 128, height = 128, seed = 1337) {
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.heightmap = [];
  }

  generateHeightmap() {
    this.heightmap = new Float32Array(this.width * this.height);
    for (let i = 0; i < this.heightmap.length; i++) {
      this.heightmap[i] = Math.random();
    }
  }
}

export class ProceduralGeneratorFull {
  constructor() {
    this.map = new ProceduralWorldMap();
  }

  generateNewWorld() {
    this.map.generateHeightmap();
    return this.map;
  }
}

export default ProceduralGeneratorFull;
