/**
 * Citizen - Autonomous agent with needs, personality, schedule, and memory.
 */

import {
  CITIZEN,
  PERSONALITY_TRAITS,
  OCCUPATIONS,
  EDUCATION_LEVELS,
  ACTIVITY,
  ECONOMY
} from '@citymind/constants';
import {
  generateId,
  randomChoice,
  randomInt,
  randomRange,
  clamp
} from '@citymind/utilities';

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery',
  'Quinn', 'Jamie', 'Cameron', 'Drew', 'Blake', 'Reese', 'Skyler', 'Parker',
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Aiden', 'Ella',
  'Joseph', 'Madison', 'David', 'Scarlett', 'Jackson', 'Victoria', 'Sebastian'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
];

export class Citizen {
  constructor(options = {}) {
    this.id = options.id || generateId('cit');
    this.firstName = options.firstName || randomChoice(FIRST_NAMES);
    this.lastName = options.lastName || randomChoice(LAST_NAMES);
    this.age = options.age ?? randomInt(0, 80);
    this.gender = options.gender || randomChoice(['male', 'female', 'other']);
    this.householdId = options.householdId || null;
    this.homeId = options.homeId || null;
    this.homeX = options.homeX ?? null;
    this.homeY = options.homeY ?? null;
    this.workplaceId = options.workplaceId || null;
    this.workplaceX = options.workplaceX ?? null;
    this.workplaceY = options.workplaceY ?? null;
    this.occupation = options.occupation || OCCUPATIONS.UNEMPLOYED;
    this.education = options.education ?? EDUCATION_LEVELS.SECONDARY;
    this.skills = options.skills || this._generateSkills();
    this.wealth = options.wealth ?? randomRange(1000, 50000);
    this.income = options.income ?? 0;
    this.happiness = options.happiness ?? randomRange(40, 80);
    this.health = options.health ?? randomRange(60, 100);
    this.energy = options.energy ?? CITIZEN.MAX_ENERGY;
    this.hunger = options.hunger ?? randomRange(0, 40);
    this.social = options.social ?? randomRange(30, 70);
    this.personality = options.personality || this._generatePersonality();
    this.preferences = options.preferences || this._generatePreferences();
    this.schedule = options.schedule || this._generateSchedule();
    this.currentActivity = options.currentActivity || ACTIVITY.IDLE;
    this.activityTarget = options.activityTarget || null;
    this.x = options.x ?? this.homeX ?? 0;
    this.y = options.y ?? this.homeY ?? 0;
    this.path = options.path || null;
    this.pathIndex = options.pathIndex ?? 0;
    this.memory = options.memory || [];
    this.relationships = options.relationships || {};
    this.alive = options.alive !== false;
    this.birthTick = options.birthTick ?? 0;
    this.lastDecision = null;
    this.decisionLog = [];
    this.flags = options.flags || {};
  }

  get name() {
    return `${this.firstName} ${this.lastName}`;
  }

  get isAdult() {
    return this.age >= CITIZEN.ADULT_AGE;
  }

  get isRetired() {
    return this.age >= CITIZEN.RETIREMENT_AGE;
  }

  get isEmployed() {
    return (
      this.occupation !== OCCUPATIONS.UNEMPLOYED &&
      this.occupation !== OCCUPATIONS.STUDENT &&
      this.occupation !== OCCUPATIONS.RETIRED &&
      this.workplaceId !== null
    );
  }

  get isHomeless() {
    return this.homeId === null;
  }

  get needsFood() {
    return this.hunger > 60;
  }

  get needsRest() {
    return this.energy < 25;
  }

  get needsSocial() {
    return this.social < 30;
  }

  _generateSkills() {
    return {
      technical: randomRange(0, 100),
      social: randomRange(0, 100),
      physical: randomRange(0, 100),
      creative: randomRange(0, 100),
      administrative: randomRange(0, 100)
    };
  }

  _generatePersonality() {
    const traits = [];
    const count = randomInt(2, 4);
    const pool = [...PERSONALITY_TRAITS];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = randomInt(0, pool.length - 1);
      traits.push(pool.splice(idx, 1)[0]);
    }
    return {
      traits,
      ambition: randomRange(0, 1),
      sociability: randomRange(0, 1),
      riskTolerance: randomRange(0, 1),
      workEthic: randomRange(0, 1)
    };
  }

  _generatePreferences() {
    return {
      preferredWorkDistance: randomRange(5, 30),
      preferredHomeType: randomChoice(['small_house', 'apartment', 'high_rise']),
      likesParks: Math.random() > 0.3,
      likesQuiet: Math.random() > 0.5,
      shoppingFrequency: randomRange(0.3, 1)
    };
  }

  _generateSchedule() {
    // Hour-based preferred activities (0-23)
    const schedule = {};
    if (this.isRetired) {
      for (let h = 0; h < 24; h++) {
        if (h >= 22 || h < 7) schedule[h] = ACTIVITY.SLEEPING;
        else if (h >= 7 && h < 9) schedule[h] = ACTIVITY.PREPARING;
        else if (h >= 12 && h < 14) schedule[h] = ACTIVITY.EATING;
        else schedule[h] = ACTIVITY.IDLE;
      }
    } else if (this.occupation === OCCUPATIONS.STUDENT || this.age < CITIZEN.ADULT_AGE) {
      for (let h = 0; h < 24; h++) {
        if (h >= 22 || h < 7) schedule[h] = ACTIVITY.SLEEPING;
        else if (h >= 7 && h < 8) schedule[h] = ACTIVITY.PREPARING;
        else if (h >= 8 && h < 15) schedule[h] = ACTIVITY.STUDYING;
        else if (h >= 15 && h < 18) schedule[h] = ACTIVITY.SOCIALIZING;
        else schedule[h] = ACTIVITY.IDLE;
      }
    } else {
      for (let h = 0; h < 24; h++) {
        if (h >= 23 || h < 6) schedule[h] = ACTIVITY.SLEEPING;
        else if (h >= 6 && h < 8) schedule[h] = ACTIVITY.PREPARING;
        else if (h >= 8 && h < 17) schedule[h] = ACTIVITY.WORKING;
        else if (h >= 17 && h < 19) schedule[h] = ACTIVITY.SHOPPING;
        else if (h >= 19 && h < 21) schedule[h] = ACTIVITY.SOCIALIZING;
        else schedule[h] = ACTIVITY.RESTING;
      }
    }
    return schedule;
  }

  /**
   * Decay needs over time (called each simulation tick).
   */
  updateNeeds(dtHours) {
    const rates = CITIZEN.NEEDS_DECAY_RATE;
    this.energy = clamp(this.energy - rates.energy * dtHours * 10, 0, CITIZEN.MAX_ENERGY);
    this.hunger = clamp(this.hunger + rates.hunger * dtHours * 10, 0, CITIZEN.MAX_HUNGER);
    this.social = clamp(this.social - rates.social * dtHours * 10, 0, CITIZEN.MAX_SOCIAL);
    this.health = clamp(this.health - rates.health * dtHours * 5, 0, CITIZEN.MAX_HEALTH);

    // Activity modifiers
    if (this.currentActivity === ACTIVITY.SLEEPING) {
      this.energy = clamp(this.energy + 15 * dtHours, 0, CITIZEN.MAX_ENERGY);
    }
    if (this.currentActivity === ACTIVITY.EATING) {
      this.hunger = clamp(this.hunger - 30 * dtHours, 0, CITIZEN.MAX_HUNGER);
    }
    if (this.currentActivity === ACTIVITY.SOCIALIZING) {
      this.social = clamp(this.social + 20 * dtHours, 0, CITIZEN.MAX_SOCIAL);
    }
    if (this.currentActivity === ACTIVITY.WORKING) {
      this.energy = clamp(this.energy - 5 * dtHours, 0, CITIZEN.MAX_ENERGY);
      this.social = clamp(this.social - 2 * dtHours, 0, CITIZEN.MAX_SOCIAL);
    }
  }

  /**
   * Calculate happiness from current conditions.
   */
  recalculateHappiness(cityFactors = {}) {
    let score = 50;
    // Personal factors
    if (this.isEmployed) score += 15;
    else if (this.isAdult && !this.isRetired) score -= 20;
    if (!this.isHomeless) score += 10;
    else score -= 30;
    score += (this.health - 50) * 0.2;
    score += (this.energy - 50) * 0.1;
    score -= this.hunger * 0.15;
    score += (this.social - 50) * 0.1;
    score += clamp(this.wealth / 10000, 0, 15);
    // Personality modifiers
    if (this.personality.traits.includes('optimistic')) score += 5;
    if (this.personality.traits.includes('pessimistic')) score -= 5;
    // City factors
    if (cityFactors.safety !== undefined) score += (cityFactors.safety - 50) * 0.15;
    if (cityFactors.pollution !== undefined) score -= cityFactors.pollution * 0.2;
    if (cityFactors.taxRate !== undefined) score -= (cityFactors.taxRate - 0.15) * 50;
    if (cityFactors.services !== undefined) score += cityFactors.services * 0.1;
    this.happiness = clamp(score, 0, CITIZEN.MAX_HAPPINESS);
    return this.happiness;
  }

  addMemory(event, tick) {
    this.memory.push({ event, tick, timestamp: Date.now() });
    if (this.memory.length > 50) {
      this.memory.shift();
    }
  }

  logDecision(decision) {
    this.lastDecision = decision;
    this.decisionLog.push({ ...decision, timestamp: Date.now() });
    if (this.decisionLog.length > 20) {
      this.decisionLog.shift();
    }
  }

  moveAlongPath(speed) {
    if (!this.path || this.pathIndex >= this.path.length - 1) {
      this.path = null;
      this.pathIndex = 0;
      return false;
    }
    this.pathIndex += 1;
    const next = this.path[this.pathIndex];
    this.x = next.x;
    this.y = next.y;
    return true;
  }

  setPath(path) {
    this.path = path;
    this.pathIndex = 0;
    if (path && path.length > 0) {
      this.x = path[0].x;
      this.y = path[0].y;
    }
  }

  ageOneYear() {
    this.age += 1;
    if (this.age >= CITIZEN.RETIREMENT_AGE && this.isEmployed) {
      this.occupation = OCCUPATIONS.RETIRED;
      this.workplaceId = null;
      this.workplaceX = null;
      this.workplaceY = null;
      this.income = ECONOMY.UNEMPLOYMENT_BENEFIT * 0.8;
      this.schedule = this._generateSchedule();
    }
    if (this.age >= CITIZEN.MAX_AGE) {
      // Probability of death increases with age
      const deathChance = (this.age - 70) / 40;
      if (Math.random() < deathChance || this.age >= CITIZEN.MAX_AGE) {
        this.alive = false;
      }
    }
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      age: this.age,
      gender: this.gender,
      householdId: this.householdId,
      homeId: this.homeId,
      homeX: this.homeX,
      homeY: this.homeY,
      workplaceId: this.workplaceId,
      workplaceX: this.workplaceX,
      workplaceY: this.workplaceY,
      occupation: this.occupation,
      education: this.education,
      skills: this.skills,
      wealth: this.wealth,
      income: this.income,
      happiness: this.happiness,
      health: this.health,
      energy: this.energy,
      hunger: this.hunger,
      social: this.social,
      personality: this.personality,
      preferences: this.preferences,
      schedule: this.schedule,
      currentActivity: this.currentActivity,
      x: this.x,
      y: this.y,
      alive: this.alive,
      birthTick: this.birthTick,
      memory: this.memory.slice(-10),
      relationships: this.relationships
    };
  }

  static fromJSON(data) {
    return new Citizen(data);
  }
}

export default Citizen;
