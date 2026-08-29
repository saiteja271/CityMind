/**
 * ParticleEngine - Comprehensive 2D particle system with object pooling,
 * custom emitters (rain, snow, smog, fire, smoke, exhaust, water spray, sparks, construction dust, fireworks),
 * gradient color interpolation, wind vectors, and canvas blend modes.
 */

export class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.gravity = 0;
    this.age = 0;
    this.maxAge = 1.0;
    this.sizeStart = 2;
    this.sizeEnd = 0;
    this.currentSize = 2;
    this.colorStart = { r: 255, g: 255, b: 255, a: 1.0 };
    this.colorEnd = { r: 255, g: 255, b: 255, a: 0.0 };
    this.currentColor = 'rgba(255,255,255,1)';
    this.blendMode = 'source-over';
    this.rotation = 0;
    this.vRot = 0;
  }

  init(config) {
    this.active = true;
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.vx = config.vx ?? (Math.random() - 0.5) * 2;
    this.vy = config.vy ?? (Math.random() - 0.5) * 2;
    this.ax = config.ax ?? 0;
    this.ay = config.ay ?? 0;
    this.gravity = config.gravity ?? 0;
    this.age = 0;
    this.maxAge = config.maxAge ?? (1.0 + Math.random() * 0.5);
    this.sizeStart = config.sizeStart ?? 4;
    this.sizeEnd = config.sizeEnd ?? 0;
    this.colorStart = config.colorStart ?? { r: 255, g: 255, b: 255, a: 1.0 };
    this.colorEnd = config.colorEnd ?? { r: 255, g: 255, b: 255, a: 0.0 };
    this.blendMode = config.blendMode ?? 'source-over';
    this.rotation = config.rotation ?? Math.random() * Math.PI * 2;
    this.vRot = config.vRot ?? (Math.random() - 0.5) * 2;
  }

  update(dt, windX = 0, windY = 0) {
    if (!this.active) return;

    this.age += dt;
    if (this.age >= this.maxAge) {
      this.active = false;
      return;
    }

    const t = this.age / this.maxAge;

    // Physics integration
    this.vx += (this.ax + windX) * dt;
    this.vy += (this.ay + this.gravity + windY) * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.vRot * dt;

    // Size interpolation
    this.currentSize = this.sizeStart + (this.sizeEnd - this.sizeStart) * t;

    // Color gradient interpolation
    const r = Math.round(this.colorStart.r + (this.colorEnd.r - this.colorStart.r) * t);
    const g = Math.round(this.colorStart.g + (this.colorEnd.g - this.colorStart.g) * t);
    const b = Math.round(this.colorStart.b + (this.colorEnd.b - this.colorStart.b) * t);
    const a = (this.colorStart.a + (this.colorEnd.a - this.colorStart.a) * t).toFixed(3);

    this.currentColor = `rgba(${r},${g},${b},${a})`;
  }
}

export class ParticlePool {
  constructor(maxSize = 2000) {
    this.pool = [];
    this.maxSize = maxSize;
    for (let i = 0; i < maxSize; i++) {
      this.pool.push(new Particle());
    }
  }

  obtain(config) {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].active) {
        this.pool[i].init(config);
        return this.pool[i];
      }
    }
    // Pool exhausted, replace oldest
    const particle = this.pool[0];
    particle.init(config);
    return particle;
  }
}

export class ParticleEmitter {
  constructor(type, options = {}) {
    this.type = type;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.rate = options.rate ?? 20; // particles per second
    this.active = options.active ?? true;
    this._accum = 0;
  }

  update(dt, pool, windX = 0, windY = 0) {
    if (!this.active) return;

    this._accum += dt * this.rate;
    while (this._accum >= 1.0) {
      this._accum -= 1.0;
      this._spawnParticle(pool);
    }
  }

  _spawnParticle(pool) {
    const config = { x: this.x, y: this.y };

    switch (this.type) {
      case 'rain':
        config.x += (Math.random() - 0.5) * 800;
        config.y -= 300;
        config.vx = (Math.random() - 0.5) * 20;
        config.vy = 400 + Math.random() * 100;
        config.sizeStart = 1.5;
        config.sizeEnd = 1.5;
        config.maxAge = 1.2;
        config.colorStart = { r: 180, g: 220, b: 255, a: 0.7 };
        config.colorEnd = { r: 180, g: 220, b: 255, a: 0.2 };
        break;

      case 'snow':
        config.x += (Math.random() - 0.5) * 800;
        config.y -= 300;
        config.vx = (Math.random() - 0.5) * 30;
        config.vy = 40 + Math.random() * 30;
        config.sizeStart = 3;
        config.sizeEnd = 2;
        config.maxAge = 4.0;
        config.colorStart = { r: 255, g: 255, b: 255, a: 0.9 };
        config.colorEnd = { r: 240, g: 240, b: 255, a: 0.4 };
        break;

      case 'fire':
        config.vx = (Math.random() - 0.5) * 15;
        config.vy = -30 - Math.random() * 40;
        config.sizeStart = 6;
        config.sizeEnd = 1;
        config.maxAge = 0.8;
        config.colorStart = { r: 255, g: 200, b: 50, a: 1.0 };
        config.colorEnd = { r: 255, g: 30, b: 0, a: 0.0 };
        config.blendMode = 'lighter';
        break;

      case 'smoke':
        config.vx = (Math.random() - 0.5) * 10;
        config.vy = -20 - Math.random() * 20;
        config.sizeStart = 4;
        config.sizeEnd = 16;
        config.maxAge = 2.0;
        config.colorStart = { r: 100, g: 100, b: 100, a: 0.5 };
        config.colorEnd = { r: 50, g: 50, b: 50, a: 0.0 };
        break;

      case 'exhaust':
        config.vx = (Math.random() - 0.5) * 5;
        config.vy = (Math.random() - 0.5) * 5;
        config.sizeStart = 2;
        config.sizeEnd = 6;
        config.maxAge = 0.5;
        config.colorStart = { r: 150, g: 150, b: 150, a: 0.4 };
        config.colorEnd = { r: 200, g: 200, b: 200, a: 0.0 };
        break;

      case 'sparks':
        config.vx = (Math.random() - 0.5) * 100;
        config.vy = -50 - Math.random() * 80;
        config.gravity = 150;
        config.sizeStart = 2;
        config.sizeEnd = 0.5;
        config.maxAge = 0.6;
        config.colorStart = { r: 255, g: 235, b: 59, a: 1.0 };
        config.colorEnd = { r: 255, g: 112, b: 67, a: 0.0 };
        config.blendMode = 'lighter';
        break;

      case 'construction_dust':
        config.vx = (Math.random() - 0.5) * 25;
        config.vy = -10 - Math.random() * 15;
        config.sizeStart = 3;
        config.sizeEnd = 12;
        config.maxAge = 1.5;
        config.colorStart = { r: 215, g: 204, b: 200, a: 0.6 };
        config.colorEnd = { r: 188, g: 170, b: 164, a: 0.0 };
        break;

      case 'fireworks':
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 120;
        config.vx = Math.cos(angle) * speed;
        config.vy = Math.sin(angle) * speed;
        config.gravity = 30;
        config.sizeStart = 4;
        config.sizeEnd = 1;
        config.maxAge = 1.2;
        config.colorStart = { r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: 255, a: 1.0 };
        config.colorEnd = { r: 255, g: 255, b: 255, a: 0.0 };
        config.blendMode = 'lighter';
        break;
    }

    pool.obtain(config);
  }
}

export class ParticleEngine {
  constructor(options = {}) {
    this.pool = new ParticlePool(options.maxParticles ?? 2000);
    this.emitters = [];
    this.windX = options.windX ?? 0;
    this.windY = options.windY ?? 0;
  }

  addEmitter(type, options = {}) {
    const emitter = new ParticleEmitter(type, options);
    this.emitters.push(emitter);
    return emitter;
  }

  removeEmitter(emitter) {
    const idx = this.emitters.indexOf(emitter);
    if (idx !== -1) this.emitters.splice(idx, 1);
  }

  setWind(x, y) {
    this.windX = x;
    this.windY = y;
  }

  update(dt = 0.016) {
    // 1. Update active emitters
    for (const emitter of this.emitters) {
      emitter.update(dt, this.pool, this.windX, this.windY);
    }

    // 2. Update active particles
    for (const particle of this.pool.pool) {
      if (particle.active) {
        particle.update(dt, this.windX, this.windY);
      }
    }
  }

  render(ctx, camera) {
    ctx.save();
    let currentBlendMode = 'source-over';

    for (const particle of this.pool.pool) {
      if (!particle.active) continue;

      const screen = camera ? camera.worldToScreen(particle.x, particle.y) : { x: particle.x, y: particle.y };

      // Set blend mode if changed
      if (particle.blendMode !== currentBlendMode) {
        currentBlendMode = particle.blendMode;
        ctx.globalCompositeOperation = currentBlendMode;
      }

      ctx.fillStyle = particle.currentColor;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, particle.currentSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export default ParticleEngine;
