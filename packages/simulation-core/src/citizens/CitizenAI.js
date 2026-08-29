/**
 * CitizenAI.js - Autonomous AI decision engine for city citizens.
 * Integrates daily itinerary generation, 11 multi-attribute action evaluators,
 * goal decision trees, dynamic path recalculation, and utility curve algorithms.
 */

import { ACTIVITY, OCCUPATIONS, CITIZEN, BUILDING_DEFS } from '@citymind/constants';
import { distance, clamp, randomChoice, randomInt } from '@citymind/utilities';
import { CitizenPsychology, MEMORY_TYPE } from './CitizenPsychology.js';

export const AI_STATE = {
  IDLE: 'IDLE',
  PLANNING: 'PLANNING',
  TRAVELING: 'TRAVELING',
  EXECUTING: 'EXECUTING',
  INTERRUPTED: 'INTERRUPTED'
};

export const ACTION_TYPE = {
  EAT: 'EAT',
  WORK: 'WORK',
  SLEEP: 'SLEEP',
  SOCIALIZE: 'SOCIALIZE',
  SHOP: 'SHOP',
  EXERCISE: 'EXERCISE',
  SEEK_MEDICAL: 'SEEK_MEDICAL',
  ATTEND_SCHOOL: 'ATTEND_SCHOOL',
  ENTERTAIN: 'ENTERTAIN',
  COMMIT_CRIME: 'COMMIT_CRIME',
  PROTEST: 'PROTEST'
};

export class CitizenAI {
  /**
   * @param {Object} simulationEngine - Reference to main simulation context
   */
  constructor(simulationEngine) {
    this.sim = simulationEngine;
  }

  /**
   * Primary decision loop invoked per citizen per tick or schedule boundary.
   *
   * @param {Object} citizen - Target citizen instance
   * @param {number} gameHour - Current hour of the day (0.00 - 23.99)
   * @param {number} currentTick - Total accumulated ticks
   * @param {Object} [worldContext] - Spatial/environmental metadata
   * @returns {Object} Selected decision action payload
   */
  decide(citizen, gameHour, currentTick, worldContext = {}) {
    if (!citizen || !citizen.alive) {
      return this._createDecision(ACTION_TYPE.SLEEP, null, 'Citizen deceased or null', 0);
    }

    // Initialize psychology container if missing
    if (!citizen.psychology) {
      citizen.psychology = new CitizenPsychology(citizen.personality);
    }

    // 1. Evaluate Critical Overrides (Emergency medical, critical sleep, starvation)
    const emergencyAction = this._evaluateCriticalEmergency(citizen, currentTick);
    if (emergencyAction) return emergencyAction;

    // 2. Movement handling - if mid-travel and no interrupt, continue traveling
    if (citizen.aiState === AI_STATE.TRAVELING && citizen.path && citizen.pathIndex < citizen.path.length) {
      return this._createDecision(
        citizen.currentActivity || ACTION_TYPE.EAT,
        citizen.activityTarget,
        'Continuing path travel',
        0.85
      );
    }

    // 3. Obtain Scheduled Activity from Daily Itinerary
    const scheduledActivity = this._getScheduledActivity(citizen, gameHour);

    // 4. Generate candidate actions and compute utility matrix scores
    const candidates = this._evaluateAllActions(citizen, scheduledActivity, gameHour, currentTick, worldContext);

    // Sort by final utility descending
    candidates.sort((a, b) => b.utility - a.utility);
    const chosen = candidates[0];

    // Log decision trace in citizen history
    this._logDecisionTrace(citizen, chosen, candidates.slice(1, 4), gameHour, currentTick);

    return chosen;
  }

  /**
   * Generate 24-hour routine itinerary based on citizen role, age, and personality.
   *
   * @param {Object} citizen
   * @returns {Array<string>} Array of 24 hourly activity tags
   */
  generateDailyItinerary(citizen) {
    const itinerary = new Array(24).fill(ACTIVITY.IDLE);
    const isNightOwl = (citizen.personality?.openness || 50) > 70;

    // Default sleep hours
    const sleepStart = isNightOwl ? 1 : 23;
    const sleepEnd = isNightOwl ? 8 : 6;

    for (let h = 0; h < 24; h++) {
      if (sleepStart > sleepEnd) {
        if (h >= sleepStart || h < sleepEnd) itinerary[h] = ACTION_TYPE.SLEEP;
      } else {
        if (h >= sleepStart && h < sleepEnd) itinerary[h] = ACTION_TYPE.SLEEP;
      }
    }

    // Role-based schedule assignment
    if (citizen.age < 18) {
      // Student Schedule
      for (let h = 8; h < 15; h++) itinerary[h] = ACTION_TYPE.ATTEND_SCHOOL;
      itinerary[15] = ACTION_TYPE.EXERCISE;
      itinerary[16] = ACTION_TYPE.SOCIALIZE;
    } else if (citizen.isEmployed) {
      // Work Schedule (9 AM - 5 PM)
      for (let h = 9; h < 17; h++) itinerary[h] = ACTION_TYPE.WORK;
      itinerary[12] = ACTION_TYPE.EAT; // Lunch
      itinerary[17] = ACTION_TYPE.SHOP;
      itinerary[18] = ACTION_TYPE.ENTERTAIN;
    } else if (citizen.isRetired) {
      // Senior Schedule
      itinerary[9] = ACTION_TYPE.EXERCISE;
      itinerary[11] = ACTION_TYPE.SHOP;
      itinerary[14] = ACTION_TYPE.SOCIALIZE;
      itinerary[17] = ACTION_TYPE.ENTERTAIN;
    } else {
      // Unemployed Schedule
      itinerary[10] = ACTION_TYPE.SHOP;
      itinerary[14] = ACTION_TYPE.SOCIALIZE;
    }

    // Dinner & Evening Rest
    itinerary[19] = ACTION_TYPE.EAT;
    itinerary[20] = ACTION_TYPE.ENTERTAIN;

    return itinerary;
  }

  /**
   * Evaluate critical emergency conditions that override standard schedules.
   */
  _evaluateCriticalEmergency(citizen, currentTick) {
    if (citizen.health < 20) {
      citizen.psychology.addMemory(MEMORY_TYPE.HEALTH_CRISIS, 'Severe health deterioration', -60, currentTick);
      return this._createDecision(
        ACTION_TYPE.SEEK_MEDICAL,
        { type: 'hospital', x: citizen.x, y: citizen.y },
        `CRITICAL HEALTH (${citizen.health.toFixed(1)}). Seeking immediate medical care.`,
        100.0
      );
    }
    if (citizen.energy < 8) {
      return this._createDecision(
        ACTION_TYPE.SLEEP,
        { type: 'home', x: citizen.homeX, y: citizen.homeY },
        `CRITICAL FATIGUE (${citizen.energy.toFixed(1)}). Collapse imminent.`,
        98.0
      );
    }
    if (citizen.hunger > 92) {
      return this._createDecision(
        ACTION_TYPE.EAT,
        { type: 'food', x: citizen.x, y: citizen.y },
        `CRITICAL STARVATION (${citizen.hunger.toFixed(1)}). Seeking food source.`,
        95.0
      );
    }
    return null;
  }

  /**
   * Retrieve scheduled action tag for current game hour.
   */
  _getScheduledActivity(citizen, gameHour) {
    if (!citizen.itinerary || citizen.itinerary.length !== 24) {
      citizen.itinerary = this.generateDailyItinerary(citizen);
    }
    const hourInt = Math.floor(gameHour) % 24;
    return citizen.itinerary[hourInt] || ACTION_TYPE.EAT;
  }

  /**
   * Evaluate all 11 candidate actions using dynamic utility curves.
   */
  _evaluateAllActions(citizen, scheduledActivity, gameHour, currentTick, worldContext) {
    const psych = citizen.psychology;
    const actions = [];

    const statePayload = {
      energy: citizen.energy,
      hunger: citizen.hunger,
      social: citizen.social,
      health: citizen.health,
      wealth: citizen.wealth,
      safety: citizen.safety || 70
    };

    // Helper: Add scheduled bias (+15 utility boost if matching schedule)
    const scheduleBonus = (act) => (act === scheduledActivity ? 18.0 : 0.0);

    // 1. EAT Evaluator
    const eatScore = psych.calculateUtility(ACTION_TYPE.EAT, statePayload, worldContext) + scheduleBonus(ACTION_TYPE.EAT);
    actions.push(this._createDecision(ACTION_TYPE.EAT, this._findFoodLocation(citizen), 'Satisfying hunger needs', eatScore));

    // 2. SLEEP Evaluator
    const sleepScore = psych.calculateUtility(ACTION_TYPE.SLEEP, statePayload, worldContext) + scheduleBonus(ACTION_TYPE.SLEEP);
    actions.push(this._createDecision(ACTION_TYPE.SLEEP, { type: 'home', x: citizen.homeX, y: citizen.homeY }, 'Resting & recovering energy', sleepScore));

    // 3. WORK Evaluator
    if (citizen.isEmployed) {
      const workScore = psych.calculateUtility(ACTION_TYPE.WORK, statePayload, worldContext) + scheduleBonus(ACTION_TYPE.WORK);
      actions.push(this._createDecision(ACTION_TYPE.WORK, { type: 'workplace', id: citizen.workplaceId, x: citizen.workplaceX, y: citizen.workplaceY }, 'Earning income & career progress', workScore));
    }

    // 4. SOCIALIZE Evaluator
    const socialScore = psych.calculateUtility(ACTION_TYPE.SOCIALIZE, statePayload, worldContext) + scheduleBonus(ACTION_TYPE.SOCIALIZE);
    actions.push(this._createDecision(ACTION_TYPE.SOCIALIZE, this._findSocialLocation(citizen), 'Connecting with social network', socialScore));

    // 5. SHOP Evaluator
    const shopScore = psych.calculateUtility(ACTION_TYPE.SHOP, statePayload, worldContext) + scheduleBonus(ACTION_TYPE.SHOP);
    actions.push(this._createDecision(ACTION_TYPE.SHOP, this._findCommercialLocation(citizen), 'Purchasing goods & services', shopScore));

    // 6. EXERCISE Evaluator
    const exerciseScore = psych.calculateUtility(ACTION_TYPE.EXERCISE, statePayload, worldContext) + scheduleBonus(ACTION_TYPE.EXERCISE);
    actions.push(this._createDecision(ACTION_TYPE.EXERCISE, this._findParkLocation(citizen), 'Maintaining physical health', exerciseScore));

    // 7. SEEK_MEDICAL Evaluator
    const medicalScore = psych.calculateUtility(ACTION_TYPE.SEEK_MEDICAL, statePayload, worldContext);
    actions.push(this._createDecision(ACTION_TYPE.SEEK_MEDICAL, this._findHospitalLocation(citizen), 'Receiving healthcare treatment', medicalScore));

    // 8. ATTEND_SCHOOL Evaluator
    if (citizen.age < 22) {
      const schoolScore = psych.calculateUtility('WORK', statePayload, worldContext) + scheduleBonus(ACTION_TYPE.ATTEND_SCHOOL);
      actions.push(this._createDecision(ACTION_TYPE.ATTEND_SCHOOL, { type: 'school', x: citizen.homeX, y: citizen.homeY }, 'Gaining education & skills', schoolScore + 10));
    }

    // 9. ENTERTAIN Evaluator
    const entertainScore = psych.calculateUtility(ACTION_TYPE.ENTERTAIN, statePayload, worldContext) + scheduleBonus(ACTION_TYPE.ENTERTAIN);
    actions.push(this._createDecision(ACTION_TYPE.ENTERTAIN, this._findLeisureLocation(citizen), 'Recreation & stress relief', entertainScore));

    // 10. COMMIT_CRIME Evaluator
    const crimeScore = psych.calculateUtility(ACTION_TYPE.COMMIT_CRIME, statePayload, worldContext);
    if (crimeScore > 40) {
      actions.push(this._createDecision(ACTION_TYPE.COMMIT_CRIME, this._findCrimeTargetLocation(citizen), 'Unlawful activity for economic gain', crimeScore));
    }

    // 11. PROTEST Evaluator
    const protestScore = psych.calculateUtility(ACTION_TYPE.PROTEST, statePayload, worldContext);
    if (protestScore > 50) {
      actions.push(this._createDecision(ACTION_TYPE.PROTEST, { type: 'city_hall', x: 50, y: 50 }, 'Public protest against city conditions', protestScore));
    }

    return actions;
  }

  /**
   * Calculate travel route and transit mode choice (walk, drive, transit).
   *
   * @param {Object} citizen
   * @param {Object} targetLocation
   * @returns {Object} Transit plan containing mode, estimated duration, and waypoint list
   */
  calculateRoute(citizen, targetLocation) {
    if (!targetLocation || targetLocation.x == null || targetLocation.y == null) {
      return { mode: 'walk', path: [{ x: citizen.x, y: citizen.y }], duration: 0 };
    }

    const dist = distance(citizen.x, citizen.y, targetLocation.x, targetLocation.y);
    let mode = 'walk';
    let speed = 1.0; // grid units per tick

    if (dist > 30 && citizen.wealth > 5000) {
      mode = 'drive';
      speed = 3.5;
    } else if (dist > 15) {
      mode = 'bus';
      speed = 2.2;
    }

    // Simplified straight-line path interpolation (A* smoothing step)
    const steps = Math.ceil(dist / speed);
    const path = [];

    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 1 : i / steps;
      path.push({
        x: citizen.x + (targetLocation.x - citizen.x) * t,
        y: citizen.y + (targetLocation.y - citizen.y) * t
      });
    }

    return {
      mode,
      path,
      duration: steps,
      distance: dist
    };
  }

  /**
   * Construct decision object payload.
   */
  _createDecision(action, target, explanation, utility) {
    return {
      activity: action,
      target: target || { x: 0, y: 0 },
      reason: explanation,
      utility: Number(utility.toFixed(2))
    };
  }

  /**
   * Helper location queries.
   */
  _findFoodLocation(c) {
    return { type: 'restaurant', x: c.homeX ? c.homeX + randomInt(-3, 3) : c.x, y: c.homeY ? c.homeY + randomInt(-3, 3) : c.y };
  }
  _findSocialLocation(c) {
    return { type: 'park', x: c.x + randomInt(-5, 5), y: c.y + randomInt(-5, 5) };
  }
  _findCommercialLocation(c) {
    return { type: 'store', x: c.x + randomInt(-8, 8), y: c.y + randomInt(-8, 8) };
  }
  _findParkLocation(c) {
    return { type: 'park', x: c.x + randomInt(-4, 4), y: c.y + randomInt(-4, 4) };
  }
  _findHospitalLocation(c) {
    return { type: 'hospital', x: c.x + randomInt(-10, 10), y: c.y + randomInt(-10, 10) };
  }
  _findLeisureLocation(c) {
    return { type: 'theater', x: c.x + randomInt(-6, 6), y: c.y + randomInt(-6, 6) };
  }
  _findCrimeTargetLocation(c) {
    return { type: 'target', x: c.x + randomInt(-12, 12), y: c.y + randomInt(-12, 12) };
  }

  /**
   * Append decision trace for explainable AI inspection.
   */
  _logDecisionTrace(citizen, chosen, topAlternatives, gameHour, currentTick) {
    if (!citizen.decisionLog) citizen.decisionLog = [];

    citizen.decisionLog.unshift({
      tick: currentTick,
      hour: gameHour.toFixed(2),
      chosen: chosen.activity,
      utility: chosen.utility,
      reason: chosen.reason,
      alternatives: topAlternatives.map((alt) => ({ activity: alt.activity, utility: alt.utility }))
    });

    if (citizen.decisionLog.length > 25) citizen.decisionLog.pop();
  }
}
