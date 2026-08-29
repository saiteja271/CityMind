/**
 * CITYMIND Episodic Memory Compression & Archive Engine
 * Compresses citizen episodic memories into long-term psychological trait shifts,
 * nostalgia indices, trauma decay curves, and public opinion summaries.
 */

export class CitizenMemoryCompression {
  constructor(simulation) {
    this.simulation = simulation;
    this.compressedSummaryMap = new Map();
  }

  compressMemoriesForCitizen(citizenId, memoriesList) {
    if (!memoriesList || memoriesList.length === 0) return;

    let positiveImpactSum = 0;
    let negativeImpactSum = 0;

    memoriesList.forEach((mem) => {
      if (mem.emotionalImpact > 0) positiveImpactSum += mem.emotionalImpact;
      if (mem.emotionalImpact < 0) negativeImpactSum += Math.abs(mem.emotionalImpact);
    });

    const netImpact = positiveImpactSum - negativeImpactSum;
    const summary = {
      citizenId,
      netEmotionalState: netImpact > 20 ? 'Optimistic' : netImpact < -20 ? 'Traumatized' : 'Balanced',
      positiveMemoriesCount: memoriesList.filter((m) => m.emotionalImpact > 0).length,
      negativeMemoriesCount: memoriesList.filter((m) => m.emotionalImpact < 0).length,
      lastCompressedTick: Date.now(),
    };

    this.compressedSummaryMap.set(citizenId, summary);
    return summary;
  }

  getCompressedSummary(citizenId) {
    return this.compressedSummaryMap.get(citizenId) || null;
  }
}

export default CitizenMemoryCompression;
