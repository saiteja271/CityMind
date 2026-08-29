/**
 * CitizenManager.js - Central lifecycle, demography, and batch processing engine for citizens.
 * Manages high-throughput tick updates, birth/death dynamics, immigration/emigration drivers,
 * housing allocation, job matching, aging, and census analytics.
 */

import { CITIZEN, OCCUPATIONS, EDUCATION_LEVELS } from '@citymind/constants';
import { generateId, clamp, randomRange, randomChoice, randomInt, distance } from '@citymind/utilities';
import { Citizen } from './Citizen.js';
import { CitizenAI } from './CitizenAI.js';
import { CitizenPsychology, MEMORY_TYPE } from './CitizenPsychology.js';
import { CitizenSocialGraph } from './CitizenSocialGraph.js';

export class CitizenManager {
  /**
   * @param {Object} simulationEngine - Reference to root simulation container
   */
  constructor(simulationEngine) {
    this.sim = simulationEngine;
    this.citizens = new Map(); // citizenId -> Citizen instance
    this.aiEngine = new CitizenAI(simulationEngine);
    this.socialGraph = new CitizenSocialGraph();

    // Demography Metrics & Counters
    this.birthsTotal = 0;
    this.deathsTotal = 0;
    this.immigrantsTotal = 0;
    this.emigrantsTotal = 0;

    // Performance & Analytics Cache
    this.censusCache = null;
    this.lastCensusTick = 0;
  }

  /**
   * Initialize a starting citizen population batch.
   *
   * @param {number} count - Initial population size
   * @param {Object} [options] - Configuration overrides
   */
  initializePopulation(count = 100, options = {}) {
    for (let i = 0; i < count; i++) {
      const citizen = new Citizen({
        age: randomInt(18, 65),
        wealth: randomRange(2000, 45000),
        education: randomChoice([
          EDUCATION_LEVELS.PRIMARY,
          EDUCATION_LEVELS.SECONDARY,
          EDUCATION_LEVELS.HIGHER,
          EDUCATION_LEVELS.UNIVERSITY
        ]),
        homeX: options.defaultHomeX ?? randomInt(10, 90),
        homeY: options.defaultHomeY ?? randomInt(10, 90)
      });

      citizen.psychology = new CitizenPsychology(citizen.personality);
      this.citizens.set(citizen.id, citizen);
      this.socialGraph.addNode(citizen.id, {
        wealthTier: Math.floor(citizen.wealth / 10000) + 1,
        educationLevel: citizen.education
      });
    }

    // Build initial social relationships
    this._seedInitialSocialConnections();
  }

  /**
   * Primary batch update tick loop.
   *
   * @param {number} gameTime - Current game hour float
   * @param {number} currentTick - Current simulation step tick
   * @param {Object} worldState - Environmental & spatial metadata
   */
  tick(gameTime, currentTick, worldState = {}) {
    const aliveCitizens = Array.from(this.citizens.values()).filter((c) => c.alive);

    // 1. Process Individual Citizen Decisions & Updates
    aliveCitizens.forEach((citizen) => {
      // Psychological State Tick
      citizen.psychology.updatePsychologicalState({
        commuteTime: citizen.lastCommuteTime || 15,
        financialDebt: citizen.wealth < 0 ? Math.abs(citizen.wealth) : 0,
        unemployed: citizen.occupation === OCCUPATIONS.UNEMPLOYED,
        crimeWitnessed: citizen.flags?.witnessedCrime || false
      });

      // Decay memories and relationships periodically
      if (currentTick % 50 === 0) {
        citizen.psychology.decayMemories(currentTick);
        citizen.psychology.decayRelationships(currentTick);
      }

      // Execute AI Decision Engine
      const decision = this.aiEngine.decide(citizen, gameTime, currentTick, worldState);

      // Execute Movement & Activity Step
      this._executeCitizenStep(citizen, decision, currentTick);

      // Skill progression & Energy consumption
      this._updateCitizenVitals(citizen);
    });

    // 2. Demographic Cycles (Births, Deaths, Migration)
    if (currentTick % 24 === 0) {
      // Once per simulated day
      this._processAgingCycle(aliveCitizens, currentTick);
      this._processBirthAndDeathCycle(aliveCitizens, currentTick, worldState);
      this._processMigrationDrivers(aliveCitizens, worldState);
    }

    // 3. System Allocations (Jobs & Housing matching clearing)
    if (currentTick % 12 === 0) {
      this.runHousingMatching(worldState.vacantHousing || []);
      this.runJobAllocation(worldState.vacantJobs || []);
    }

    // 4. Update Social Graph Clout
    if (currentTick % 100 === 0) {
      this.socialGraph.calculateCloutScores();
    }
  }

  /**
   * Advance citizen age and role transitions.
   */
  _processAgingCycle(citizens, currentTick) {
    citizens.forEach((c) => {
      c.age += 1 / 365; // Increment age by 1 day equivalent

      // Life Stage Transitions
      if (c.age >= CITIZEN.ADULT_AGE && c.occupation === OCCUPATIONS.STUDENT) {
        c.occupation = OCCUPATIONS.UNEMPLOYED;
        c.psychology.addMemory(MEMORY_TYPE.JOB_PROMOTION, 'Graduated into workforce', 30, currentTick);
      } else if (c.age >= CITIZEN.RETIREMENT_AGE && c.occupation !== OCCUPATIONS.RETIRED) {
        c.occupation = OCCUPATIONS.RETIRED;
        c.workplaceId = null;
        c.psychology.addMemory(MEMORY_TYPE.JOB_PROMOTION, 'Entered retirement', 40, currentTick);
      }
    });
  }

  /**
   * Calculate birth and mortality rates for demographic updates.
   */
  _processBirthAndDeathCycle(citizens, currentTick, worldState) {
    const popSize = citizens.length;
    if (popSize === 0) return;

    const avgHealth = citizens.reduce((sum, c) => sum + c.health, 0) / popSize;
    const avgHappiness = citizens.reduce((sum, c) => sum + c.happiness, 0) / popSize;
    const healthcareIndex = worldState.healthcareCoverage || 0.7;

    // 1. Births (Driven by happiness, healthcare, housing, & fertile age count)
    const fertileAdults = citizens.filter((c) => c.age >= 20 && c.age <= 42 && c.homeId !== null).length;
    const birthProb = (fertileAdults / popSize) * (avgHappiness / 100) * healthcareIndex * 0.002;

    if (Math.random() < birthProb) {
      const newborn = new Citizen({
        age: 0,
        wealth: 500,
        education: EDUCATION_LEVELS.NONE,
        occupation: OCCUPATIONS.CHILD
      });
      newborn.psychology = new CitizenPsychology(newborn.personality);
      this.citizens.set(newborn.id, newborn);
      this.socialGraph.addNode(newborn.id, { wealthTier: 1, educationLevel: 0 });
      this.birthsTotal++;
    }

    // 2. Deaths (Gompertz-Makeham mortality curve + health decay)
    citizens.forEach((c) => {
      // Base mortality increases exponentially with age
      const ageMortality = 0.00001 * Math.exp(0.08 * c.age);
      const healthMortality = c.health < 20 ? (20 - c.health) * 0.01 : 0;
      const totalDeathProb = ageMortality + healthMortality;

      if (Math.random() < totalDeathProb) {
        c.alive = false;
        this.deathsTotal++;
        this.socialGraph.removeNode(c.id);
        c.psychology.addMemory(MEMORY_TYPE.TRAUMA, 'Citizen passed away', -100, currentTick);
      }
    });
  }

  /**
   * Evaluate city quality of life to trigger immigration or emigration.
   */
  _processMigrationDrivers(citizens, worldState) {
    const popSize = citizens.length;
    const cityQuality = (worldState.cityHappiness || 60) + (worldState.jobVacancyCount || 10) * 0.5 - (worldState.pollutionIndex || 10);

    // Immigration trigger
    if (cityQuality > 65 && Math.random() < 0.3) {
      const immigrant = new Citizen({
        age: randomInt(20, 40),
        wealth: randomRange(5000, 25000),
        education: randomChoice([EDUCATION_LEVELS.SECONDARY, EDUCATION_LEVELS.HIGHER])
      });
      immigrant.psychology = new CitizenPsychology(immigrant.personality);
      this.citizens.set(immigrant.id, immigrant);
      this.socialGraph.addNode(immigrant.id, { wealthTier: 2, educationLevel: immigrant.education });
      this.immigrantsTotal++;
    }

    // Emigration trigger (Dissatisfied citizens leave)
    citizens.forEach((c) => {
      if (c.happiness < 15 && c.wealth > 1000 && Math.random() < 0.05) {
        c.alive = false;
        this.emigrantsTotal++;
        this.socialGraph.removeNode(c.id);
      }
    });
  }

  /**
   * Housing Matching Algorithm (Gale-Shapley Stable Matching Variant).
   * Matches unhoused citizens to available vacant residential properties.
   *
   * @param {Array<Object>} vacantProperties - List of vacant building slots
   */
  runHousingMatching(vacantProperties = []) {
    if (vacantProperties.length === 0) return;

    const homeless = Array.from(this.citizens.values()).filter((c) => c.alive && c.homeId === null);
    if (homeless.length === 0) return;

    homeless.forEach((citizen) => {
      // Find affordable housing within commute distance preference
      const affordable = vacantProperties.filter((p) => (p.rent || 500) <= citizen.wealth * 0.3);
      if (affordable.length > 0) {
        // Pick best property based on proximity to workplace or origin
        affordable.sort((a, b) => {
          const distA = distance(citizen.x, citizen.y, a.x, a.y);
          const distB = distance(citizen.x, citizen.y, b.x, b.y);
          return distA - distB;
        });

        const chosen = affordable[0];
        citizen.homeId = chosen.id;
        citizen.homeX = chosen.x;
        citizen.homeY = chosen.y;
        chosen.occupants = (chosen.occupants || 0) + 1;

        if (chosen.occupants >= chosen.capacity) {
          const idx = vacantProperties.indexOf(chosen);
          if (idx !== -1) vacantProperties.splice(idx, 1);
        }
      }
    });
  }

  /**
   * Job Allocation Engine.
   * Matches unemployed citizens with available business vacancies.
   *
   * @param {Array<Object>} vacantJobs - Available employment positions
   */
  runJobAllocation(vacantJobs = []) {
    if (vacantJobs.length === 0) return;

    const unemployed = Array.from(this.citizens.values()).filter(
      (c) => c.alive && c.isAdult && !c.isRetired && c.occupation === OCCUPATIONS.UNEMPLOYED
    );

    unemployed.forEach((citizen) => {
      const qualified = vacantJobs.filter((job) => (job.requiredEducation || 1) <= citizen.education);
      if (qualified.length > 0) {
        // Pick highest paying job
        qualified.sort((a, b) => b.salary - a.salary);
        const job = qualified[0];

        citizen.occupation = job.title || OCCUPATIONS.COMMERCIAL_WORKER;
        citizen.workplaceId = job.buildingId;
        citizen.workplaceX = job.x;
        citizen.workplaceY = job.y;
        citizen.income = job.salary;

        job.openings--;
        if (job.openings <= 0) {
          const idx = vacantJobs.indexOf(job);
          if (idx !== -1) vacantJobs.splice(idx, 1);
        }
      }
    });
  }

  /**
   * Execute citizen physical position movement & activity execution step.
   */
  _executeCitizenStep(citizen, decision, currentTick) {
    citizen.currentActivity = decision.activity;

    // Movement along travel path
    if (citizen.path && citizen.pathIndex < citizen.path.length) {
      const waypoint = citizen.path[citizen.pathIndex];
      citizen.x = waypoint.x;
      citizen.y = waypoint.y;
      citizen.pathIndex++;
      citizen.aiState = citizen.pathIndex < citizen.path.length ? 'TRAVELING' : 'EXECUTING';
    } else if (decision.target) {
      // Calculate new route if target changed
      const route = this.aiEngine.calculateRoute(citizen, decision.target);
      citizen.path = route.path;
      citizen.pathIndex = 0;
      citizen.aiState = 'TRAVELING';
    }
  }

  /**
   * Update vitals: energy depletion, hunger accumulation, health recovery.
   */
  _updateCitizenVitals(citizen) {
    // Energy decay based on activity
    const energyCost = citizen.currentActivity === 'EXERCISE' ? 2.5 : citizen.currentActivity === 'WORK' ? 1.2 : 0.4;
    const energyGain = citizen.currentActivity === 'SLEEP' ? 4.0 : 0;

    citizen.energy = clamp(citizen.energy - energyCost + energyGain, 0, CITIZEN.MAX_ENERGY);

    // Hunger increase
    const hungerGain = citizen.currentActivity === 'EAT' ? -40 : 0.8;
    citizen.hunger = clamp(citizen.hunger + hungerGain, 0, 100);

    // Social satisfaction
    const socialGain = citizen.currentActivity === 'SOCIALIZE' || citizen.currentActivity === 'ENTERTAIN' ? 3.0 : -0.2;
    citizen.social = clamp(citizen.social + socialGain, 0, 100);
  }

  /**
   * Seed initial network connections between citizens.
   */
  _seedInitialSocialConnections() {
    const list = Array.from(this.citizens.values());
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const dist = distance(list[i].x, list[i].y, list[j].x, list[j].y);
        if (dist < 15 && Math.random() < 0.2) {
          this.socialGraph.addEdge(list[i].id, list[j].id, randomRange(0.2, 0.9));
          list[i].psychology.updateRelationship(list[j].id, 'friend', 20, 30, 0);
          list[j].psychology.updateRelationship(list[i].id, 'friend', 20, 30, 0);
        }
      }
    }
  }

  /**
   * Generate comprehensive demographic Census report.
   * Includes Gini coefficient calculation for wealth inequality.
   */
  getCensusReport() {
    const alive = Array.from(this.citizens.values()).filter((c) => c.alive);
    const N = alive.length;

    if (N === 0) return { totalPopulation: 0, giniIndex: 0 };

    // 1. Wealth & Income Metrics
    const wealths = alive.map((c) => c.wealth).sort((a, b) => a - b);
    const totalWealth = wealths.reduce((a, b) => a + b, 0);
    const avgWealth = totalWealth / N;

    // Gini Coefficient Formula: G = (2 * SUM(i * y_i)) / (n * SUM(y_i)) - (n + 1) / n
    let weightedSum = 0;
    wealths.forEach((w, idx) => { weightedSum += (idx + 1) * w; });
    const giniIndex = N > 0 ? ((2 * weightedSum) / (N * totalWealth)) - ((N + 1) / N) : 0;

    // 2. Age Pyramid
    const agePyramid = { children: 0, adults: 0, seniors: 0 };
    let totalHappiness = 0;
    let totalHealth = 0;
    let employedCount = 0;

    alive.forEach((c) => {
      if (c.age < 18) agePyramid.children++;
      else if (c.age >= 65) agePyramid.seniors++;
      else agePyramid.adults++;

      totalHappiness += c.happiness;
      totalHealth += c.health;
      if (c.isEmployed) employedCount++;
    });

    return {
      totalPopulation: N,
      birthsTotal: this.birthsTotal,
      deathsTotal: this.deathsTotal,
      immigrantsTotal: this.immigrantsTotal,
      emigrantsTotal: this.emigrantsTotal,
      avgWealth: Math.round(avgWealth),
      giniIndex: Number(clamp(giniIndex, 0, 1).toFixed(3)),
      avgHappiness: Number((totalHappiness / N).toFixed(1)),
      avgHealth: Number((totalHealth / N).toFixed(1)),
      employmentRate: Number(((employedCount / Math.max(1, agePyramid.adults)) * 100).toFixed(1)),
      agePyramid,
      socialGraph: this.socialGraph.getGraphAnalytics()
    };
  }
}
