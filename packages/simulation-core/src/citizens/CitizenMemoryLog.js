/**
 * CITYMIND Citizen Memory Log & Episodic Memory Engine
 * Simulates citizen long-term emotional memory traces, nostalgia, trauma decay,
 * life event journal logs, policy reaction histories, and relationship memories.
 */

export class MemoryTrace {
  constructor(id, type, description, emotionalImpact = 0, timestampTick = 0) {
    this.id = id;
    this.type = type; // 'life_event', 'policy_change', 'disaster_survival', 'crime_victim', 'promotion', 'family'
    this.description = description;
    this.emotionalImpact = emotionalImpact; // -100 to +100
    this.timestampTick = timestampTick;
    this.memoryStrength = 1.0; // 1.0 down to 0.0 (decay)
    this.forgettingHalfLifeTicks = 1200; // Half life in simulation ticks
  }

  calculateDecay(currentTick) {
    const ageTicks = Math.max(0, currentTick - this.timestampTick);
    this.memoryStrength = Math.exp(-0.693 * (ageTicks / this.forgettingHalfLifeTicks));
    return this.memoryStrength;
  }

  getEffectiveEmotionalImpact(currentTick) {
    const decay = this.calculateDecay(currentTick);
    return Math.round(this.emotionalImpact * decay);
  }
}

export class CitizenMemoryLog {
  constructor(citizenId) {
    this.citizenId = citizenId;
    this.memories = [];
    this.maxMemoriesCount = 100;
    this.traumaIndex = 0;
    this.nostalgiaIndex = 0;
  }

  addMemory(type, description, emotionalImpact, currentTick) {
    const id = `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const trace = new MemoryTrace(id, type, description, emotionalImpact, currentTick);

    this.memories.unshift(trace);

    if (this.memories.length > this.maxMemoriesCount) {
      // Remove oldest memories with lowest strength
      this.memories.sort((a, b) => b.memoryStrength - a.memoryStrength);
      this.memories.pop();
    }

    this.updatePsychologicalIndices(currentTick);
    return trace;
  }

  updatePsychologicalIndices(currentTick) {
    let positiveSum = 0;
    let negativeSum = 0;

    this.memories.forEach((mem) => {
      const impact = mem.getEffectiveEmotionalImpact(currentTick);
      if (impact > 0) positiveSum += impact;
      if (impact < 0) negativeSum += Math.abs(impact);
    });

    this.traumaIndex = Math.min(100, Math.round(negativeSum * 0.25));
    this.nostalgiaIndex = Math.min(100, Math.round(positiveSum * 0.25));
  }

  getNetMemoryMoodOffset(currentTick) {
    let totalOffset = 0;
    this.memories.forEach((mem) => {
      totalOffset += mem.getEffectiveEmotionalImpact(currentTick);
    });
    return Math.max(-40, Math.min(40, Math.round(totalOffset * 0.15)));
  }

  getRecentMemories(count = 10) {
    return this.memories.slice(0, count).map((m) => ({
      id: m.id,
      type: m.type,
      description: m.description,
      emotionalImpact: m.emotionalImpact,
      strengthPct: Math.round(m.memoryStrength * 100),
    }));
  }
}

export default CitizenMemoryLog;
