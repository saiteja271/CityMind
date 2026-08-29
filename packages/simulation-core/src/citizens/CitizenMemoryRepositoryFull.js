/**
 * CITYMIND Episodic & Long-Term Citizen Memory Repository
 * Manages indexed episodic memory allocation, memory decay curves, trauma decay half-life,
 * and nostalgia recall probability for multi-agent psychological models.
 */

export class MemoryRecordEntry {
  constructor(id, category, summaryText, emotionalImpact = 0, timestampTick = Date.now()) {
    this.id = id;
    this.category = category; // 'CAREER', 'DISASTER', 'FAMILY', 'CRIME', 'TAX', 'COMMUTE'
    this.summaryText = summaryText;
    this.emotionalImpact = emotionalImpact; // -100 to +100
    this.timestampTick = timestampTick;
    this.memoryStrength = 1.0;
  }

  calculateRetention(currentTick, halfLifeTicks = 2880) {
    const ageTicks = Math.max(0, currentTick - this.timestampTick);
    const lambda = 0.693 / halfLifeTicks;
    this.memoryStrength = Math.max(0.01, Math.exp(-lambda * ageTicks));
    return this.memoryStrength;
  }
}

export class CitizenMemoryRepositoryFull {
  constructor(citizenId) {
    this.citizenId = citizenId;
    this.recordsMap = new Map();
    this.traumaCount = 0;
    this.joyCount = 0;
  }

  storeMemory(category, summaryText, emotionalImpact, currentTick) {
    const id = `mem_${this.citizenId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const record = new MemoryRecordEntry(id, category, summaryText, emotionalImpact, currentTick);
    this.recordsMap.set(id, record);

    if (emotionalImpact <= -30) this.traumaCount += 1;
    if (emotionalImpact >= 30) this.joyCount += 1;

    return record;
  }

  decayAllMemories(currentTick) {
    this.recordsMap.forEach((record, id) => {
      const retention = record.calculateRetention(currentTick);
      if (retention < 0.05) {
        this.recordsMap.delete(id);
      }
    });
  }

  getMemoriesSummary() {
    return {
      totalStoredMemories: this.recordsMap.size,
      traumaCount: this.traumaCount,
      joyCount: this.joyCount,
    };
  }
}

export default CitizenMemoryRepositoryFull;
