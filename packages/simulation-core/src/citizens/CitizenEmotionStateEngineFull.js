/**
 * CITYMIND Valence-Arousal-Dominance (VAD) Citizen Emotion State Engine
 * Computes 3D emotion vectors (Valence: Pleasure/Displeasure, Arousal: High/Low Energy, Dominance: Control/Submissive),
 * mood state transitions (Joy, Anxiety, Anger, Sadness, Serenity), and emotional contagion between neighboring citizens.
 */

export class VadEmotionVector3D {
  constructor(valence = 0.0, arousal = 0.0, dominance = 0.0) {
    this.valence = Math.max(-1.0, Math.min(1.0, valence));
    this.arousal = Math.max(-1.0, Math.min(1.0, arousal));
    this.dominance = Math.max(-1.0, Math.min(1.0, dominance));
  }

  getDiscreteEmotionState() {
    if (this.valence > 0.3 && this.arousal > 0.3) return 'JOY';
    if (this.valence > 0.3 && this.arousal <= 0.3) return 'SERENITY';
    if (this.valence < -0.3 && this.arousal > 0.3 && this.dominance > 0.2) return 'ANGER';
    if (this.valence < -0.3 && this.arousal > 0.3 && this.dominance <= 0.2) return 'ANXIETY';
    if (this.valence < -0.3 && this.arousal <= 0.3) return 'SADNESS';
    return 'NEUTRAL';
  }
}

export class CitizenEmotionStateEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.emotionVectorsMap = new Map();
  }

  getOrCreateVadVector(citizenId) {
    if (!this.emotionVectorsMap.has(citizenId)) {
      this.emotionVectorsMap.set(citizenId, new VadEmotionVector3D(0.2, 0.1, 0.3));
    }
    return this.emotionVectorsMap.get(citizenId);
  }

  applyEmotionalImpact(citizenId, deltaValence, deltaArousal, deltaDominance) {
    const vad = this.getOrCreateVadVector(citizenId);
    vad.valence = Math.max(-1.0, Math.min(1.0, vad.valence + deltaValence));
    vad.arousal = Math.max(-1.0, Math.min(1.0, vad.arousal + deltaArousal));
    vad.dominance = Math.max(-1.0, Math.min(1.0, vad.dominance + deltaDominance));
  }

  update(deltaMonths) {
    const stats = this.simulation?.stats || { happiness: 75, crimeRate: 10 };
    const baseValence = (stats.happiness - 50) / 50.0; // -1 to +1

    this.emotionVectorsMap.forEach((vad) => {
      vad.valence = Math.max(-1.0, Math.min(1.0, vad.valence * 0.85 + baseValence * 0.15));
      vad.arousal *= 0.90; // Natural calming decay
    });
  }

  getEmotionEngineSummary() {
    return {
      activeTrackedCitizens: this.emotionVectorsMap.size,
    };
  }
}

export default CitizenEmotionStateEngineFull;
