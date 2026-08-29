/**
 * CITYMIND Procedural Noise & Terrain Generation Library
 * Production-quality implementation of Perlin Noise 2D/3D, Simplex Noise 2D/3D,
 * Fractal Brownian Motion (fBm), Voronoi Cell Diagrams, Diamond-Square Heightmap Generator,
 * Ridge Noise, and Turbulence Noise with deterministic PRNG seed support.
 */

// ---------------------------------------------------------------------------
// SEEDED PSEUDO-RANDOM NUMBER GENERATOR (Mulberry32)
// ---------------------------------------------------------------------------
export class PRNG {
  constructor(seed = 1337) {
    this.seed = seed >>> 0;
  }

  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextRange(min, max) {
    return min + this.next() * (max - min);
  }
}

// ---------------------------------------------------------------------------
// PERLIN NOISE 2D & 3D
// ---------------------------------------------------------------------------
export class PerlinNoise {
  constructor(seed = 42) {
    this.prng = new PRNG(seed);
    this.p = new Uint8Array(512);
    this.permutation = new Uint8Array(256);
    this.initPermutations();
  }

  initPermutations() {
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(this.prng.next() * (i + 1));
      const tmp = this.permutation[i];
      this.permutation[i] = this.permutation[j];
      this.permutation[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.p[i] = this.permutation[i & 255];
    }
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10); // Quintic S-curve
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad2D(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  grad3D(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;

    return this.lerp(
      v,
      this.lerp(u, this.grad2D(this.p[A], x, y), this.grad2D(this.p[B], x - 1, y)),
      this.lerp(u, this.grad2D(this.p[A + 1], x, y - 1), this.grad2D(this.p[B + 1], x - 1, y - 1))
    );
  }

  noise3D(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(
      w,
      this.lerp(
        v,
        this.lerp(u, this.grad3D(this.p[AA], x, y, z), this.grad3D(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad3D(this.p[AB], x, y - 1, z), this.grad3D(this.p[BB], x - 1, y - 1, z))
      ),
      this.lerp(
        v,
        this.lerp(u, this.grad3D(this.p[AA + 1], x, y, z - 1), this.grad3D(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad3D(this.p[AB + 1], x, y - 1, z - 1), this.grad3D(this.p[BB + 1], x - 1, y - 1, z - 1))
      )
    );
  }
}

// ---------------------------------------------------------------------------
// SIMPLEX NOISE 2D
// ---------------------------------------------------------------------------
export class SimplexNoise2D {
  constructor(seed = 99) {
    this.perlin = new PerlinNoise(seed);
    this.F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    this.G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  }

  noise2D(xin, yin) {
    let n0, n1, n2;

    const s = (xin + yin) * this.F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);

    const t = (i + j) * this.G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + this.G2;
    const y1 = y0 - j1 + this.G2;
    const x2 = x0 - 1.0 + 2.0 * this.G2;
    const y2 = y0 - 1.0 + 2.0 * this.G2;

    const ii = i & 255;
    const jj = j & 255;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.perlin.grad2D(this.perlin.p[ii + this.perlin.p[jj]], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.perlin.grad2D(this.perlin.p[ii + i1 + this.perlin.p[jj + j1]], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.perlin.grad2D(this.perlin.p[ii + 1 + this.perlin.p[jj + 1]], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }
}

// ---------------------------------------------------------------------------
// FRACTAL BROWNIAN MOTION (fBm)
// ---------------------------------------------------------------------------
export class FBM {
  constructor(seed = 1234, octaves = 6, persistence = 0.5, lacunarity = 2.0) {
    this.perlin = new PerlinNoise(seed);
    this.octaves = octaves;
    this.persistence = persistence;
    this.lacunarity = lacunarity;
  }

  get2D(x, y) {
    let total = 0;
    let frequency = 1.0;
    let amplitude = 1.0;
    let maxValue = 0;

    for (let i = 0; i < this.octaves; i++) {
      total += this.perlin.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    return total / maxValue;
  }

  get3D(x, y, z) {
    let total = 0;
    let frequency = 1.0;
    let amplitude = 1.0;
    let maxValue = 0;

    for (let i = 0; i < this.octaves; i++) {
      total += this.perlin.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    return total / maxValue;
  }
}

// ---------------------------------------------------------------------------
// RIDGE NOISE & TURBULENCE NOISE
// ---------------------------------------------------------------------------
export class RidgeNoise {
  constructor(seed = 777, octaves = 5) {
    this.fbm = new FBM(seed, octaves);
  }

  get2D(x, y) {
    const val = this.fbm.get2D(x, y);
    return 1.0 - Math.abs(val);
  }
}

export class TurbulenceNoise {
  constructor(seed = 888, octaves = 5) {
    this.perlin = new PerlinNoise(seed);
    this.octaves = octaves;
  }

  get2D(x, y) {
    let sum = 0;
    let freq = 1.0;
    let amp = 1.0;
    for (let i = 0; i < this.octaves; i++) {
      sum += Math.abs(this.perlin.noise2D(x * freq, y * freq)) * amp;
      freq *= 2.0;
      amp *= 0.5;
    }
    return sum;
  }
}

// ---------------------------------------------------------------------------
// VORONOI DIAGRAM CELL GENERATOR
// ---------------------------------------------------------------------------
export const VORONOI_METRICS = Object.freeze({
  EUCLIDEAN: 'euclidean',
  MANHATTAN: 'manhattan',
  CHEBYSHEV: 'chebyshev'
});

export class VoronoiNoise {
  constructor(numPoints = 20, width = 100, height = 100, seed = 555) {
    this.width = width;
    this.height = height;
    this.prng = new PRNG(seed);
    this.points = [];

    for (let i = 0; i < numPoints; i++) {
      this.points.push({
        x: this.prng.nextRange(0, width),
        y: this.prng.nextRange(0, height),
        value: this.prng.next()
      });
    }
  }

  getDistance(x1, y1, x2, y2, metric = VORONOI_METRICS.EUCLIDEAN) {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);

    if (metric === VORONOI_METRICS.MANHATTAN) return dx + dy;
    if (metric === VORONOI_METRICS.CHEBYSHEV) return Math.max(dx, dy);
    return Math.sqrt(dx * dx + dy * dy);
  }

  getNearestCell(x, y, metric = VORONOI_METRICS.EUCLIDEAN) {
    let minDist = Infinity;
    let nearest = null;

    for (const p of this.points) {
      const d = this.getDistance(x, y, p.x, p.y, metric);
      if (d < minDist) {
        minDist = d;
        nearest = p;
      }
    }

    return { nearest, distance: minDist };
  }
}

// ---------------------------------------------------------------------------
// DIAMOND-SQUARE HEIGHTMAP GENERATOR
// ---------------------------------------------------------------------------
export class DiamondSquare {
  constructor(sizePower = 6, roughness = 0.5, seed = 404) {
    this.size = Math.pow(2, sizePower) + 1;
    this.grid = new Float32Array(this.size * this.size);
    this.roughness = roughness;
    this.prng = new PRNG(seed);

    // Set corners
    this.setVal(0, 0, this.prng.next());
    this.setVal(this.size - 1, 0, this.prng.next());
    this.setVal(0, this.size - 1, this.prng.next());
    this.setVal(this.size - 1, this.size - 1, this.prng.next());

    this.generate();
  }

  getVal(x, y) {
    return this.grid[y * this.size + x];
  }

  setVal(x, y, val) {
    this.grid[y * this.size + x] = val;
  }

  generate() {
    let step = this.size - 1;
    let scale = 1.0;

    while (step > 1) {
      const half = Math.floor(step / 2);

      // Diamond step
      for (let y = 0; y < this.size - 1; y += step) {
        for (let x = 0; x < this.size - 1; x += step) {
          const avg = (
            this.getVal(x, y) +
            this.getVal(x + step, y) +
            this.getVal(x, y + step) +
            this.getVal(x + step, y + step)
          ) * 0.25;
          const offset = (this.prng.next() * 2 - 1) * scale;
          this.setVal(x + half, y + half, Math.max(0, Math.min(1, avg + offset)));
        }
      }

      // Square step
      for (let y = 0; y < this.size; y += half) {
        for (let x = (y + half) % step; x < this.size; x += step) {
          let count = 0;
          let sum = 0;

          if (x >= half) { sum += this.getVal(x - half, y); count++; }
          if (x + half < this.size) { sum += this.getVal(x + half, y); count++; }
          if (y >= half) { sum += this.getVal(x, y - half); count++; }
          if (y + half < this.size) { sum += this.getVal(x, y + half); count++; }

          const avg = sum / (count || 1);
          const offset = (this.prng.next() * 2 - 1) * scale;
          this.setVal(x, y, Math.max(0, Math.min(1, avg + offset)));
        }
      }

      step = half;
      scale *= this.roughness;
    }
  }
}

export default {
  PRNG,
  PerlinNoise,
  SimplexNoise2D,
  FBM,
  RidgeNoise,
  TurbulenceNoise,
  VoronoiNoise,
  VORONOI_METRICS,
  DiamondSquare
};
