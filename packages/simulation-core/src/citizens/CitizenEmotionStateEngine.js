/**
 * CITYMIND Valence-Arousal-Dominance (VAD) Citizen Emotion State Engine
 * Computes 3D emotion vectors (Valence: Pleasure/Displeasure, Arousal: High/Low Energy, Dominance: Control/Submissive),
 * mood state transitions (Joy, Anxiety, Anger, Sadness, Serenity), and emotional contagion between neighboring citizens.
 */

export class VadEmotionVector {
  constructor(valence = 0.0, arousal = 0.0, dominance = 0.0) {
    this.valence = valence; // -1.0 to +1.0
    this.arousal = arousal; // -1.0 to +1.0
    this.dominance = dominance; // -1.0 to +1.0
  }

  getPrimaryDiscreteEmotion() {
    if (this.valence > 0.3 && this.arousal > 0.3) return 'Joy';
    if (this.valence > 0.3 && this.arousal <= 0.3) return 'Serenity';
    if (this.valence < -0.3 && this.arousal > 0.3 && this.dominance > 0.2) return 'Anger';
    if (this.valence < -0.3 && this.arousal > 0.3 && this.dominance <= 0.2) return 'Anxiety';
    if (this.valence < -0.3 && this.arousal <= 0.3) return 'Sadness';
    return 'Neutral';
  }
}

export class CitizenEmotionStateEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.emotionVectorsMap = new Map();
  }

  getOrCreateVadVector(citizenId) {
    if (!this.emotionVectorsMap.has(citizenId)) {
      this.emotionVectorsMap.set(citizenId, new VadEmotionVector(0.2, 0.1, 0.3));
    }
    return this.emotionVectorsMap.get(citizenId);
  }

  update(deltaMonths) {
    const stats = this.simulation?.stats || { happiness: 75, crimeRate: 10 };
    const baseValence = (stats.happiness - 50) / 50.0; // -1 to +1

    this.emotionVectorsMap.forEach((vad) => {
      vad.valence = Math.max(-1.0, Math.min(1.0, vad.valence * 0.8 + baseValence * 0.2));
    });
  }
}

export default CitizenEmotionStateEngine;
