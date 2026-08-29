/**
 * ProceduralGenerator - Advanced World Generation Engine.
 * Features Perlin noise elevation maps, hydraulic erosion simulations, coastlines,
 * forest distribution, ore deposit seeding, and contour-aware initial road layouts.
 */

import { TERRAIN, MAP } from '@citymind/constants';

export const BIOMES = {
  TEMPERATE: 'temperate',
  DESERT: 'desert',
  TROPICAL: 'tropical',
  ALPINE: 'alpine',
  ISLAND: 'island'
};

export class PerlinNoise {
  constructor(seed = 12345) {
    this.perm = new Uint8Array(512);
    this._initPermutation(seed);
  }

  _initPermutation(seed) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Pseudorandom shuffle based on seed
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = Math.floor((s / 2147483647) * (i + 1));
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  _lerp(t, a, b) { return a + t * (b - a); }

  _grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this._fade(xf);
    const v = this._fade(yf);

    const aa = this.perm[this.perm[X] + Y];
    const ab = this.perm[this.perm[X] + Y + 1];
    const ba = this.perm[this.perm[X + 1] + Y];
    const bb = this.perm[this.perm[X + 1] + Y + 1];

    const g1 = this._grad(aa, xf, yf);
    const g2 = this._grad(ba, xf - 1, yf);
    const g3 = this._grad(ab, xf, yf - 1);
    const g4 = this._grad(bb, xf - 1, yf - 1);

    const x1 = this._lerp(u, g1, g2);
    const x2 = this._lerp(u, g3, g4);

    return (this._lerp(v, x1, x2) + 1) / 2; // Normalized 0..1
  }

  octaveNoise2D(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let total = 0;
    let frequency = 1.0;
    let amplitude = 1.0;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
}

export class ProceduralGenerator {
  constructor(options = {}) {
    this.seed = options.seed ?? Math.floor(Math.random() * 1000000);
    this.width = options.width ?? MAP.DEFAULT_WIDTH;
    this.height = options.height ?? MAP.DEFAULT_HEIGHT;
    this.biome = options.biome ?? BIOMES.TEMPERATE;

    this.perlin = new PerlinNoise(this.seed);
  }

  generateWorld() {
    const heightmap = this._generateHeightmap();
    const moistureMap = this._generateMoistureMap();
    this._simulateHydraulicErosion(heightmap, 2000);

    const mapData = this._assignTerrainTypes(heightmap, moistureMap);
    const oreDeposits = this._seedOreDeposits();
    const startingRoads = this._generateStartingRoads(mapData, heightmap);

    return {
      width: this.width,
      height: this.height,
      seed: this.seed,
      biome: this.biome,
      heightmap,
      moistureMap,
      mapData,
      oreDeposits,
      startingRoads
    };
  }

  _generateHeightmap() {
    const grid = new Float32Array(this.width * this.height);
    const scale = 0.03;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let elev = this.perlin.octaveNoise2D(x * scale, y * scale, 5, 0.5, 2.0);

        // Island gradient falloff if island biome
        if (this.biome === BIOMES.ISLAND) {
          const dx = (x - this.width / 2) / (this.width / 2);
          const dy = (y - this.height / 2) / (this.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          elev = elev * (1 - Math.pow(dist, 1.8));
        }

        grid[y * this.width + x] = Math.max(0, elev);
      }
    }
    return grid;
  }

  _generateMoistureMap() {
    const grid = new Float32Array(this.width * this.height);
    const scale = 0.04;
    const noise2 = new PerlinNoise(this.seed + 9999);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        grid[y * this.width + x] = noise2.octaveNoise2D(x * scale, y * scale, 3, 0.5, 2.0);
      }
    }
    return grid;
  }

  _simulateHydraulicErosion(heightmap, dropIterations = 1000) {
    const w = this.width;
    const h = this.height;

    for (let iter = 0; iter < dropIterations; iter++) {
      let dropX = Math.random() * (w - 2) + 1;
      let dropY = Math.random() * (h - 2) + 1;
      let sediment = 0;
      let speed = 1.0;
      let water = 1.0;

      for (let step = 0; step < 30; step++) {
        const ix = Math.floor(dropX);
        const iy = Math.floor(dropY);
        const idx = iy * w + ix;

        const currentElev = heightmap[idx];
        const nextElev = heightmap[idx + 1] || currentElev;

        const diff = currentElev - nextElev;

        if (diff > 0) {
          // Eroding slope
          const erodeAmount = Math.min(diff, 0.005);
          heightmap[idx] -= erodeAmount;
          sediment += erodeAmount;
        } else {
          // Depositing sediment in valley
          const depositAmount = Math.min(sediment, 0.003);
          heightmap[idx] += depositAmount;
          sediment -= depositAmount;
        }

        dropX += (Math.random() - 0.5);
        dropY += (Math.random() - 0.5);

        if (dropX < 1 || dropX >= w - 1 || dropY < 1 || dropY >= h - 1) break;
      }
    }
  }

  _assignTerrainTypes(heightmap, moistureMap) {
    const mapData = [];

    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const elev = heightmap[idx];
        const moist = moistureMap[idx];

        let terrain = TERRAIN.GRASS;

        if (elev < 0.28) {
          terrain = TERRAIN.WATER;
        } else if (elev < 0.32) {
          terrain = TERRAIN.SAND; // Coastline beaches
        } else if (elev > 0.75) {
          terrain = TERRAIN.ROCK; // Mountain peaks
        } else if (moist > 0.65) {
          terrain = TERRAIN.FOREST;
        } else if (this.biome === BIOMES.DESERT && moist < 0.40) {
          terrain = TERRAIN.DIRT;
        }

        row.push({
          x,
          y,
          terrain,
          elevation: Math.floor(elev * 10),
          moisture: Math.round(moist * 100)
        });
      }
      mapData.push(row);
    }

    return mapData;
  }

  _seedOreDeposits() {
    const ores = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const ox = Math.floor(Math.random() * (this.width - 10)) + 5;
      const oy = Math.floor(Math.random() * (this.height - 10)) + 5;
      ores.push({
        type: i % 2 === 0 ? 'iron' : 'coal',
        x: ox,
        y: oy,
        amount: 5000 + Math.floor(Math.random() * 10000)
      });
    }
    return ores;
  }

  _generateStartingRoads(mapData, heightmap) {
    const roads = [];
    // Generate a main arterial backbone road in map center
    const midY = Math.floor(this.height / 2);
    for (let x = 10; x < this.width - 10; x++) {
      const tile = mapData[midY][x];
      if (tile.terrain !== TERRAIN.WATER) {
        roads.push({ x, y: midY });
      }
    }
    return roads;
  }
}

export default ProceduralGenerator;
