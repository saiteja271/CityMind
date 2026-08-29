/**
 * CITYMIND Ebbinghaus Forgetting Curve & Psychological Memory Retention Engine
 * Computes memory retention decay ($R = e^{-t / S}$), psychological trauma half-life,
 * and nostalgic recall probability for citizen life memories.
 */

export class MemoryDecayCurve {
  static computeRetention(ageTicks, memoryStrength = 1.0, halfLifeTicks = 1200) {
    const decayConst = 0.693 / halfLifeTicks;
    return Math.max(0.01, Math.exp(-decayConst * ageTicks) * memoryStrength);
  }

  static computeTraumaDecay(initialTrauma, ageTicks) {
    // Trauma decays slower than standard episodic memory
    const decayConst = 0.693 / 3600; // 3600 ticks half-life (~3 simulation years)
    return Math.round(initialTrauma * Math.exp(-decayConst * ageTicks));
  }
}

export class CitizenMemoryDecayEngine {
  constructor(simulation) {
    this.simulation = simulation;
  }

  processMemoryDecay(memoriesList, currentTick) {
    if (!memoriesList) return [];

    return memoriesList.filter((mem) => {
      const age = Math.max(0, currentTick - (mem.timestampTick || 0));
      const retention = MemoryDecayCurve.computeRetention(age, mem.memoryStrength || 1.0);
      mem.memoryStrength = retention;
      return retention > 0.05; // Keep until strength drops below 5%
    });
  }
}

export default CitizenMemoryDecayEngine;
