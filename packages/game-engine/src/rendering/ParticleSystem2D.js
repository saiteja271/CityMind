/**
 * CITYMIND 24-Bit Color Weather & Emission Particle System 2D
 * Simulates weather rain drops, snow flurries, industrial smoke stacks, vehicle exhaust, and explosion shockwaves.
 */

export class Particle2D {
  constructor(x = 0, y = 0, vx = 0, vy = 1, lifetimeSec = 2.0, color = '#ffffff') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.lifetimeSec = lifetimeSec;
    this.remainingLifeSec = lifetimeSec;
    this.color = color;
    this.alpha = 1.0;
  }

  update(deltaTimeSec) {
    this.x += this.vx * deltaTimeSec;
    this.y += this.vy * deltaTimeSec;
    this.remainingLifeSec -= deltaTimeSec;
    this.alpha = Math.max(0, this.remainingLifeSec / this.lifetimeSec);
    return this.remainingLifeSec > 0;
  }
}

export class ParticleSystem2D {
  constructor() {
    this.particles = [];
  }

  emitParticle(x, y, vx, vy, lifetime, color) {
    this.particles.push(new Particle2D(x, y, vx, vy, lifetime, color));
  }

  updateAndRender(ctx, deltaTimeSec) {
    if (!ctx) return;
    this.particles = this.particles.filter((p) => {
      const alive = p.update(deltaTimeSec);
      if (alive) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
        ctx.restore();
      }
      return alive;
    });
  }
}

export default ParticleSystem2D;
