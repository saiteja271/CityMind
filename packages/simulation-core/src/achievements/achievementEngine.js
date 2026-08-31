/**
 * achievementEngine.js
 * Achievement unlock engine for CITYMIND.
 *
 * Evaluates a set of achievement definitions against the current simulation
 * metrics and unlocks achievements when their conditions are satisfied.
 * Persists unlock state via the backend API and emits events for UI toasts.
 */

// ─── Achievement definitions ──────────────────────────────────────────────────

/**
 * @typedef {object} AchievementDef
 * @property {string} id - Unique achievement ID
 * @property {string} title - Display title
 * @property {string} description - Short description shown to player
 * @property {string} icon - Emoji or icon key
 * @property {string} category - 'population' | 'economy' | 'environment' | 'infrastructure' | 'governance'
 * @property {number} [xpReward] - XP awarded on unlock
 * @property {Function} condition - (metrics: SimMetrics) => boolean
 */

/** @type {AchievementDef[]} */
export const ACHIEVEMENT_DEFINITIONS = [
  // Population milestones
  {
    id: 'pop_100',
    title: 'Growing Town',
    description: 'Reach a population of 100 citizens.',
    icon: '🏘️',
    category: 'population',
    xpReward: 50,
    condition: (m) => m.population >= 100,
  },
  {
    id: 'pop_1000',
    title: 'Bustling City',
    description: 'Reach a population of 1,000 citizens.',
    icon: '🏙️',
    category: 'population',
    xpReward: 200,
    condition: (m) => m.population >= 1000,
  },
  {
    id: 'pop_10000',
    title: 'Metropolis',
    description: 'Reach a population of 10,000 citizens.',
    icon: '🌆',
    category: 'population',
    xpReward: 1000,
    condition: (m) => m.population >= 10_000,
  },

  // Happiness
  {
    id: 'happy_80',
    title: 'Happy People',
    description: 'Maintain city happiness above 80% for 30 consecutive in-game days.',
    icon: '😊',
    category: 'governance',
    xpReward: 300,
    condition: (m) => m.happiness >= 80 && m.consecutiveHappyDays >= 30,
  },
  {
    id: 'happy_95',
    title: 'Utopia',
    description: 'Achieve 95%+ happiness across all districts.',
    icon: '✨',
    category: 'governance',
    xpReward: 1000,
    condition: (m) => m.happiness >= 95,
  },

  // Economy
  {
    id: 'surplus_budget',
    title: 'In the Black',
    description: 'Run a positive city budget for 12 consecutive months.',
    icon: '💰',
    category: 'economy',
    xpReward: 400,
    condition: (m) => m.budgetSurplusMonths >= 12,
  },
  {
    id: 'zero_unemployment',
    title: 'Full Employment',
    description: 'Achieve less than 2% unemployment.',
    icon: '💼',
    category: 'economy',
    xpReward: 500,
    condition: (m) => m.unemploymentRate < 0.02,
  },

  // Environment
  {
    id: 'green_city',
    title: 'Green City',
    description: 'Keep pollution below 10% across the entire map.',
    icon: '🌿',
    category: 'environment',
    xpReward: 400,
    condition: (m) => m.avgPollution < 10,
  },
  {
    id: 'carbon_neutral',
    title: 'Carbon Neutral',
    description: 'Have 50%+ of your energy from renewable sources.',
    icon: '♻️',
    category: 'environment',
    xpReward: 600,
    condition: (m) => m.renewableEnergyPct >= 50,
  },

  // Infrastructure
  {
    id: 'full_coverage',
    title: 'Connected City',
    description: 'Achieve 100% road connectivity across all districts.',
    icon: '🛣️',
    category: 'infrastructure',
    xpReward: 350,
    condition: (m) => m.roadConnectivityPct >= 100,
  },
  {
    id: 'transit_master',
    title: 'Transit Master',
    description: 'Run 5 or more active transit lines.',
    icon: '🚌',
    category: 'infrastructure',
    xpReward: 450,
    condition: (m) => m.activeTransitLines >= 5,
  },

  // Disasters / Resilience
  {
    id: 'disaster_survivor',
    title: 'Disaster Survivor',
    description: 'Recover from a city disaster with happiness remaining above 60%.',
    icon: '🔥',
    category: 'governance',
    xpReward: 700,
    condition: (m) => m.recoveredFromDisaster && m.happiness >= 60,
  },
];

// ─── Achievement engine class ─────────────────────────────────────────────────

export class AchievementEngine {
  /**
   * @param {object} opts
   * @param {Function} opts.onUnlock - Callback (achievement, metrics) => void
   * @param {Set<string>} [opts.initialUnlocked] - Set of already-unlocked achievement IDs
   */
  constructor({ onUnlock, initialUnlocked = new Set() } = {}) {
    this.unlocked = new Set(initialUnlocked);
    this.onUnlock = onUnlock ?? (() => {});
    this._definitions = new Map(ACHIEVEMENT_DEFINITIONS.map((a) => [a.id, a]));
    this._pendingCallbacks = [];
  }

  /**
   * Evaluate all achievement conditions against current simulation metrics.
   * Newly unlocked achievements are collected and emitted via onUnlock.
   *
   * @param {object} metrics - Current simulation metrics snapshot
   * @returns {AchievementDef[]} Array of newly unlocked achievements (empty if none)
   */
  evaluate(metrics) {
    const newlyUnlocked = [];

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (this.unlocked.has(def.id)) continue; // Already unlocked

      try {
        if (def.condition(metrics)) {
          this.unlocked.add(def.id);
          newlyUnlocked.push(def);
          this.onUnlock(def, metrics);
        }
      } catch (err) {
        console.warn(`[AchievementEngine] Error evaluating "${def.id}":`, err.message);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if a specific achievement is unlocked.
   * @param {string} id
   * @returns {boolean}
   */
  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  /**
   * Get progress information for all achievements.
   * @param {object} metrics - Current simulation metrics
   * @returns {Array<{def: AchievementDef, unlocked: boolean}>}
   */
  getProgress(metrics) {
    return ACHIEVEMENT_DEFINITIONS.map((def) => ({
      def,
      unlocked: this.unlocked.has(def.id),
    }));
  }

  /**
   * Return the full set of unlocked achievement IDs (for persistence).
   * @returns {string[]}
   */
  getUnlockedIds() {
    return [...this.unlocked];
  }

  /**
   * Restore unlocked achievements from a persisted set.
   * @param {string[]} ids
   */
  restoreUnlocked(ids) {
    this.unlocked = new Set(ids);
  }

  /**
   * Total XP earned from unlocked achievements.
   * @returns {number}
   */
  getTotalXP() {
    let xp = 0;
    for (const id of this.unlocked) {
      const def = this._definitions.get(id);
      if (def?.xpReward) xp += def.xpReward;
    }
    return xp;
  }
}

export default AchievementEngine;
