/**
 * questSystem.js
 * Scenario/Quest engine for CITYMIND.
 *
 * Scenarios are structured challenge sets that give the player a series of
 * objectives (quests) to complete within a city, with rewards and narrative context.
 *
 * Features:
 *  - Scenario definitions with ordered quest chains
 *  - Quest condition evaluation against simulation metrics
 *  - Progress tracking: locked → active → completed → failed
 *  - Time-limited quests with fail conditions
 *  - Reward emission (currency, XP, unlocks) on completion
 */

// ─── Types and constants ──────────────────────────────────────────────────────

/**
 * @typedef {'locked'|'active'|'completed'|'failed'} QuestStatus
 */

/**
 * @typedef {object} QuestDef
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} icon
 * @property {Function} condition        - (metrics) => boolean: completion check
 * @property {Function} [failCondition]  - (metrics, elapsed) => boolean: fail check
 * @property {number} [timeLimitMs]      - Optional time limit in sim-milliseconds
 * @property {object} [rewards]          - { xp, currency, unlock }
 * @property {string[]} [requiredQuests] - IDs that must be completed first
 */

/**
 * @typedef {object} ScenarioDef
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} difficulty   - 'easy' | 'medium' | 'hard' | 'expert'
 * @property {QuestDef[]} quests
 * @property {object} [startConditions] - Initial map/population overrides
 */

// ─── Built-in scenario definitions ───────────────────────────────────────────

/** @type {ScenarioDef[]} */
export const SCENARIOS = [
  {
    id: 'scenario_starter',
    title: 'From Scratch',
    description: 'Build your first city from the ground up. House citizens, create jobs, and keep them happy.',
    difficulty: 'easy',
    startConditions: { mapSize: 'small', startBudget: 50_000, startPopulation: 0 },
    quests: [
      {
        id: 'q_first_house',
        title: 'Shelter for All',
        description: 'Place at least 5 residential buildings.',
        icon: '🏠',
        condition: (m) => m.residentialBuildings >= 5,
        rewards: { xp: 100, currency: 5_000 },
      },
      {
        id: 'q_first_jobs',
        title: 'Open for Business',
        description: 'Place at least 3 commercial buildings.',
        icon: '🏪',
        condition: (m) => m.commercialBuildings >= 3,
        requiredQuests: ['q_first_house'],
        rewards: { xp: 150, currency: 8_000 },
      },
      {
        id: 'q_pop_50',
        title: 'Growing Community',
        description: 'Grow your population to 50 citizens.',
        icon: '👥',
        condition: (m) => m.population >= 50,
        requiredQuests: ['q_first_house'],
        rewards: { xp: 200, currency: 10_000 },
      },
      {
        id: 'q_happy_70',
        title: 'Content Citizens',
        description: 'Achieve city happiness above 70%.',
        icon: '😊',
        condition: (m) => m.happiness >= 70,
        requiredQuests: ['q_pop_50'],
        rewards: { xp: 300, currency: 15_000, unlock: 'civic_center' },
      },
    ],
  },

  {
    id: 'scenario_industrial',
    title: 'Industrial Revolution',
    description: 'Build a thriving industrial economy while managing pollution and worker happiness.',
    difficulty: 'medium',
    startConditions: { mapSize: 'medium', startBudget: 100_000, startPopulation: 50 },
    quests: [
      {
        id: 'q_factories',
        title: 'Factory Floor',
        description: 'Build 10 industrial buildings.',
        icon: '🏭',
        condition: (m) => m.industrialBuildings >= 10,
        rewards: { xp: 200, currency: 20_000 },
      },
      {
        id: 'q_employment_80',
        title: 'Work for Everyone',
        description: 'Reach 80%+ employment rate.',
        icon: '💼',
        condition: (m) => m.employmentRate >= 0.8,
        requiredQuests: ['q_factories'],
        rewards: { xp: 300, currency: 25_000 },
      },
      {
        id: 'q_pollution_control',
        title: 'Clean Up the Mess',
        description: 'Keep average pollution below 30 despite industrial growth.',
        icon: '♻️',
        condition: (m) => m.avgPollution < 30,
        failCondition: (m) => m.avgPollution > 70,
        requiredQuests: ['q_factories'],
        rewards: { xp: 400, currency: 30_000, unlock: 'recycling_plant' },
      },
      {
        id: 'q_pop_500',
        title: 'Industrial City',
        description: 'Grow to 500 citizens.',
        icon: '🌆',
        condition: (m) => m.population >= 500,
        requiredQuests: ['q_employment_80'],
        rewards: { xp: 500, currency: 50_000 },
      },
    ],
  },

  {
    id: 'scenario_crisis',
    title: 'Crisis Management',
    description: 'Your city is in debt. Recover financial stability before time runs out.',
    difficulty: 'hard',
    startConditions: { mapSize: 'medium', startBudget: -20_000, startPopulation: 200 },
    quests: [
      {
        id: 'q_balance_zero',
        title: 'Break Even',
        description: 'Bring the city budget back to positive within 12 months.',
        icon: '📊',
        condition: (m) => m.budgetBalance >= 0,
        failCondition: (m, elapsed) => elapsed > 12 * 30 * 24 * 60 * 60 * 1000,
        timeLimitMs: 12 * 30 * 24 * 60 * 60 * 1000,
        rewards: { xp: 500, currency: 0 },
      },
      {
        id: 'q_no_exodus',
        title: 'Stop the Exodus',
        description: 'Prevent city population from dropping below 150.',
        icon: '🚨',
        condition: (m) => m.population >= 150 && m.budgetBalance > 0,
        failCondition: (m) => m.population < 150,
        rewards: { xp: 600, currency: 20_000 },
      },
    ],
  },
];

// ─── Quest state tracker ──────────────────────────────────────────────────────

export class QuestSystem {
  /**
   * @param {object} opts
   * @param {string} opts.scenarioId - ID from SCENARIOS
   * @param {Function} [opts.onQuestComplete] - (quest) => void
   * @param {Function} [opts.onQuestFail] - (quest) => void
   * @param {Function} [opts.onScenarioComplete] - (scenario) => void
   */
  constructor({ scenarioId, onQuestComplete, onQuestFail, onScenarioComplete } = {}) {
    this._scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!this._scenario) throw new Error(`Scenario "${scenarioId}" not found`);

    this.onQuestComplete = onQuestComplete ?? (() => {});
    this.onQuestFail = onQuestFail ?? (() => {});
    this.onScenarioComplete = onScenarioComplete ?? (() => {});

    /** @type {Map<string, { status: QuestStatus, startedAt: number|null, completedAt: number|null }>} */
    this._state = new Map(
      this._scenario.quests.map((q) => [q.id, { status: 'locked', startedAt: null, completedAt: null }])
    );

    this._scenarioComplete = false;
    this._elapsedMs = 0;
  }

  // ─── Tick ────────────────────────────────────────────────────────────────────

  /**
   * Evaluate all quest conditions against current metrics.
   * Call once per simulation tick.
   *
   * @param {object} metrics - Current simulation snapshot
   * @param {number} deltaMs - Milliseconds elapsed since last tick
   */
  tick(metrics, deltaMs = 0) {
    if (this._scenarioComplete) return;
    this._elapsedMs += deltaMs;

    let allComplete = true;

    for (const quest of this._scenario.quests) {
      const state = this._state.get(quest.id);

      if (state.status === 'completed') continue;
      if (state.status === 'failed') { allComplete = false; continue; }

      // Check if prerequisites are met to unlock
      if (state.status === 'locked') {
        const prereqsMet = (quest.requiredQuests ?? []).every(
          (reqId) => this._state.get(reqId)?.status === 'completed'
        );
        if (prereqsMet) {
          state.status = 'active';
          state.startedAt = this._elapsedMs;
        } else {
          allComplete = false;
          continue;
        }
      }

      // Evaluate fail condition
      const questElapsed = this._elapsedMs - (state.startedAt ?? 0);
      if (quest.failCondition && quest.failCondition(metrics, questElapsed)) {
        state.status = 'failed';
        this.onQuestFail(quest);
        allComplete = false;
        continue;
      }

      // Evaluate completion condition
      if (quest.condition(metrics)) {
        state.status = 'completed';
        state.completedAt = this._elapsedMs;
        this.onQuestComplete(quest);
      } else {
        allComplete = false;
      }
    }

    if (allComplete && !this._scenarioComplete) {
      this._scenarioComplete = true;
      this.onScenarioComplete(this._scenario);
    }
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  /** @returns {Array<{ quest: QuestDef, status: QuestStatus }>} */
  getQuestProgress() {
    return this._scenario.quests.map((quest) => ({
      quest,
      ...this._state.get(quest.id),
    }));
  }

  /** @returns {boolean} */
  isScenarioComplete() {
    return this._scenarioComplete;
  }

  /** @returns {ScenarioDef} */
  getScenario() {
    return this._scenario;
  }

  /** Serialize for save/load */
  serialize() {
    return {
      scenarioId: this._scenario.id,
      elapsedMs: this._elapsedMs,
      scenarioComplete: this._scenarioComplete,
      state: Object.fromEntries(this._state),
    };
  }

  /** Restore from serialized data */
  static deserialize(data, callbacks = {}) {
    const qs = new QuestSystem({ scenarioId: data.scenarioId, ...callbacks });
    qs._elapsedMs = data.elapsedMs ?? 0;
    qs._scenarioComplete = data.scenarioComplete ?? false;
    for (const [id, state] of Object.entries(data.state ?? {})) {
      if (qs._state.has(id)) qs._state.set(id, state);
    }
    return qs;
  }
}

export default QuestSystem;
