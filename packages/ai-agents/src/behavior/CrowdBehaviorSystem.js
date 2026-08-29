/**
 * CrowdBehaviorSystem - Aggregates citizen flows for district-level movement heatmaps.
 */
import { tileKey } from '@citymind/utilities';

export class CrowdBehaviorSystem {
  constructor(simulation) {
    this.sim = simulation;
    this.heatmap = new Map();
    this.flows = [];
    this.peakHours = {};
    this.history = [];
  }

  update(dtHours) {
    this.heatmap.clear();
    const alive = this.sim.citizens?.getAlive?.() || [];
    for (const c of alive) {
      const key = tileKey(Math.floor(c.x), Math.floor(c.y));
      this.heatmap.set(key, (this.heatmap.get(key) || 0) + 1);
    }
    const hour = Math.floor(this.sim.time?.gameHour || this.sim.time?.hour || 0) % 24;
    this.peakHours[hour] = (this.peakHours[hour] || 0) * 0.9 + alive.length * 0.1;
    // Sample flows: citizens traveling
    this.flows = [];
    for (const c of alive) {
      if (c.currentActivity === 'traveling' && c.path && c.path.length > 1) {
        this.flows.push({
          from: { x: c.path[0].x, y: c.path[0].y },
          to: { x: c.path[c.path.length - 1].x, y: c.path[c.path.length - 1].y },
          citizenId: c.id
        });
      }
    }
    if ((this.sim.time?.totalTicks || 0) % 90 === 0) {
      const top = [...this.heatmap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      this.history.push({ tick: this.sim.time?.totalTicks || 0, hotspots: top, flowCount: this.flows.length });
      if (this.history.length > 50) this.history.shift();
    }
  }

  getHottestTiles(n = 10) {
    return [...this.heatmap.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
  }

  getStats() {
    return {
      trackedCitizens: this.heatmap.size,
      activeFlows: this.flows.length,
      peakHours: { ...this.peakHours },
      hotspots: this.getHottestTiles(5),
      history: this.history.slice(-12)
    };
  }
}

export default CrowdBehaviorSystem;
