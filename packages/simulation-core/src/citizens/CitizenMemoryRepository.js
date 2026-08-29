/**
 * CITYMIND Citizen Memory Repository & Memory Pool Manager
 * Manages indexed episodic memory allocation, memory decay, key event tagging (e.g., Promotion, Eviction, Disaster),
 * and query filtering for multi-agent citizen psychological models.
 */

export class EpisodicMemoryEntry {
  constructor(id, type, description, emotionalImpact = 0, timestampTick = Date.now()) {
    this.id = id;
    this.type = type; // 'Promotion', 'Disaster', 'Marriage', 'CrimeVictim', 'TaxHike'
    this.description = description;
    this.emotionalImpact = emotionalImpact; // -100 to +100
    this.timestampTick = timestampTick;
    this.memoryStrength = 1.0;
  }
}

export class CitizenMemoryRepository {
  constructor(citizenId) {
    this.citizenId = citizenId;
    this.memoriesMap = new Map();
  }

  addMemory(type, description, emotionalImpact) {
    const id = `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const entry = new EpisodicMemoryEntry(id, type, description, emotionalImpact);
    this.memoriesMap.set(id, entry);
    return entry;
  }

  getMemoriesByType(type) {
    return Array.from(this.memoriesMap.values()).filter((m) => m.type === type);
  }

  getRecentTraumas() {
    return Array.from(this.memoriesMap.values()).filter((m) => m.emotionalImpact <= -30);
  }
}

export default CitizenMemoryRepository;
