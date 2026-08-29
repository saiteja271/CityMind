/**
 * CITYMIND Multi-Agent Citizen Psychology & Emotion Transition Engine
 * Advanced cognitive modeling: OCEAN Big-5 trait influences, 3D Valence-Arousal-Dominance (VAD) emotion vectors,
 * utility-based action candidate scoring, episodic memory decay curves, and social relationship graph dynamics.
 */

export class EmotionalStateVAD {
  constructor(valence = 0.0, arousal = 0.0, dominance = 0.0) {
    this.valence = Math.max(-1.0, Math.min(1.0, valence));
    this.arousal = Math.max(-1.0, Math.min(1.0, arousal));
    this.dominance = Math.max(-1.0, Math.min(1.0, dominance));
  }

  updateValence(delta) {
    this.valence = Math.max(-1.0, Math.min(1.0, this.valence + delta));
  }

  updateArousal(delta) {
    this.arousal = Math.max(-1.0, Math.min(1.0, this.arousal + delta));
  }

  updateDominance(delta) {
    this.dominance = Math.max(-1.0, Math.min(1.0, this.dominance + delta));
  }

  getDiscreteEmotionCategory() {
    if (this.valence > 0.25 && this.arousal > 0.25) return 'ECSTATIC';
    if (this.valence > 0.25 && this.arousal <= 0.25) return 'SERENE';
    if (this.valence < -0.25 && this.arousal > 0.25 && this.dominance > 0.2) return 'FURIOUS';
    if (this.valence < -0.25 && this.arousal > 0.25 && this.dominance <= 0.2) return 'ANXIOUS';
    if (this.valence < -0.25 && this.arousal <= 0.25) return 'DEPRESSED';
    return 'NEUTRAL';
  }
}

export class CitizenEpisodicMemory {
  constructor(id, eventType, description, emotionalImpact, timestampTick) {
    this.id = id;
    this.eventType = eventType;
    this.description = description;
    this.emotionalImpact = emotionalImpact; // -100 to +100
    this.timestampTick = timestampTick;
    this.retentionStrength = 1.0;
  }

  decayMemory(currentTick, halfLifeTicks = 1440) {
    const ageTicks = Math.max(0, currentTick - this.timestampTick);
    const decayConst = 0.693 / halfLifeTicks;
    this.retentionStrength = Math.max(0.01, Math.exp(-decayConst * ageTicks));
    return this.retentionStrength;
  }
}

export class RelationshipLink {
  constructor(targetCitizenId, relationshipType = 'Friend', bondStrength = 50) {
    this.targetCitizenId = targetCitizenId;
    this.relationshipType = relationshipType; // 'Spouse', 'Parent', 'Child', 'Friend', 'Colleague', 'Rival'
    this.bondStrength = Math.max(0, Math.min(100, bondStrength));
    this.lastInteractionTick = Date.now();
  }

  adjustBond(delta) {
    this.bondStrength = Math.max(0, Math.min(100, this.bondStrength + delta));
    this.lastInteractionTick = Date.now();
  }
}

export class CitizenPsychologyEngine {
  constructor(citizenId, oceanTraits = {}) {
    this.citizenId = citizenId;
    this.openness = oceanTraits.openness || 50;
    this.conscientiousness = oceanTraits.conscientiousness || 50;
    this.extraversion = oceanTraits.extraversion || 50;
    this.agreeableness = oceanTraits.agreeableness || 50;
    this.neuroticism = oceanTraits.neuroticism || 50;

    this.vadEmotion = new EmotionalStateVAD(0.1, 0.0, 0.2);
    this.memories = new Map();
    this.relationships = new Map();

    this.needs = {
      hunger: 80,
      energy: 85,
      health: 90,
      safety: 85,
      social: 70,
      fulfillment: 75,
    };
  }

  recordEpisodicMemory(eventType, description, emotionalImpact, currentTick) {
    const id = `mem_${this.citizenId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const mem = new CitizenEpisodicMemory(id, eventType, description, emotionalImpact, currentTick);
    this.memories.set(id, mem);

    // Emotional impact shift
    const impactScale = emotionalImpact / 100.0;
    this.vadEmotion.updateValence(impactScale * 0.4);
    if (Math.abs(emotionalImpact) > 50) {
      this.vadEmotion.updateArousal(0.3);
    }
    return mem;
  }

  updateRelationships(targetId, type, deltaBond) {
    if (!this.relationships.has(targetId)) {
      this.relationships.set(targetId, new RelationshipLink(targetId, type, 50));
    }
    const link = this.relationships.get(targetId);
    link.adjustBond(deltaBond);
  }

  evaluateActionCandidateUtilities(cityState) {
    const utilities = [];

    // 1. Sleep Utility
    const sleepUtility = (100 - this.needs.energy) * 1.8 + (this.neuroticism * 0.1);
    utilities.push({ action: 'SLEEP', utility: sleepUtility });

    // 2. Eat Utility
    const eatUtility = (100 - this.needs.hunger) * 1.6;
    utilities.push({ action: 'EAT', utility: eatUtility });

    // 3. Work Utility
    const workUtility = (this.needs.fulfillment * 0.5) + (this.conscientiousness * 0.6) - (cityState.taxRate > 20 ? 15 : 0);
    utilities.push({ action: 'WORK', utility: workUtility });

    // 4. Socialize Utility
    const socializeUtility = (100 - this.needs.social) * 1.4 + (this.extraversion * 0.7);
    utilities.push({ action: 'SOCIALIZE', utility: socializeUtility });

    // 5. Seek Medical Utility
    const medicalUtility = (100 - this.needs.health) * 2.5;
    utilities.push({ action: 'SEEK_MEDICAL', utility: medicalUtility });

    // 6. Commit Crime Utility (Driven by low safety, low agreeableness, high neuroticism, low fulfillment)
    const crimeDesperation = (100 - this.needs.safety) * 0.5 + (100 - this.needs.fulfillment) * 0.5;
    const crimePropensity = (100 - this.agreeableness) * 0.4 + (100 - this.conscientiousness) * 0.3;
    const crimeUtility = (crimeDesperation * crimePropensity) / 100.0 - (cityState.policeCoverage * 0.8);
    utilities.push({ action: 'COMMIT_CRIME', utility: Math.max(0, crimeUtility) });

    utilities.sort((a, b) => b.utility - a.utility);
    return utilities;
  }

  tickPsychology(currentTick, cityState) {
    // 1. Decay needs over time
    this.needs.hunger = Math.max(0, this.needs.hunger - 0.4);
    this.needs.energy = Math.max(0, this.needs.energy - 0.3);
    this.needs.social = Math.max(0, this.needs.social - 0.2);

    // 2. Decay memory retention
    this.memories.forEach((mem, id) => {
      const retention = mem.decayMemory(currentTick);
      if (retention < 0.05) {
        this.memories.delete(id);
      }
    });

    // 3. Rebalance emotion VAD towards baseline
    this.vadEmotion.valence *= 0.98;
    this.vadEmotion.arousal *= 0.95;

    return {
      discreteEmotion: this.vadEmotion.getDiscreteEmotionCategory(),
      needs: this.needs,
      topAction: this.evaluateActionCandidateUtilities(cityState)[0],
    };
  }
}

export default CitizenPsychologyEngine;
