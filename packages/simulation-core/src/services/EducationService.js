/**
 * EducationService.js - School district coverage, literacy rates, student skill progression, and research unlock engine.
 * Models Elementary, High School, and University catchment zones, student-teacher ratios,
 * and university research point generation for tech unlocks.
 */

import { clamp, distance, generateId } from '@citymind/utilities';

export const SCHOOL_TYPE = {
  ELEMENTARY: 'ELEMENTARY',
  HIGH_SCHOOL: 'HIGH_SCHOOL',
  UNIVERSITY: 'UNIVERSITY'
};

export const TECH_UNLOCKS = {
  SMART_GRID_EFFICIENCY: 'SMART_GRID_EFFICIENCY',
  HIGH_DENSITY_BUILDINGS: 'HIGH_DENSITY_BUILDINGS',
  ADVANCED_RECYCLING: 'ADVANCED_RECYCLING',
  GREEN_SOLAR_TECH: 'GREEN_SOLAR_TECH',
  AUTOMATED_TRANSIT: 'AUTOMATED_TRANSIT'
};

export class SchoolFacility {
  constructor(id, type, x, y, capacity = 300, studentTeacherRatio = 20) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.capacity = capacity;
    this.enrolledStudents = 0;
    this.studentTeacherRatio = studentTeacherRatio;
    this.active = true;
  }
}

export class EducationService {
  constructor() {
    // Map schoolId -> SchoolFacility
    this.schools = new Map();

    // Accumulated Research Points (RP) from Universities
    this.researchPoints = 0;
    this.unlockedTechnologies = new Set();

    // Tech Unlock Thresholds (in Research Points)
    this.techCosts = {
      [TECH_UNLOCKS.SMART_GRID_EFFICIENCY]: 500,
      [TECH_UNLOCKS.HIGH_DENSITY_BUILDINGS]: 1200,
      [TECH_UNLOCKS.ADVANCED_RECYCLING]: 800,
      [TECH_UNLOCKS.GREEN_SOLAR_TECH]: 1500,
      [TECH_UNLOCKS.AUTOMATED_TRANSIT]: 2500
    };

    // System Metrics Summary
    this.ledger = {
      cityLiteracyRatePct: 92.0,
      universityGraduatesTotal: 0,
      researchPointsPerTick: 0,
      avgStudentTeacherRatio: 18.5
    };
  }

  /**
   * Register a new educational institution.
   */
  addSchool(id, type, x, y, capacity = 300) {
    const ratio = type === SCHOOL_TYPE.UNIVERSITY ? 12 : type === SCHOOL_TYPE.HIGH_SCHOOL ? 18 : 22;
    const school = new SchoolFacility(id, type, x, y, capacity, ratio);
    this.schools.set(id, school);
    return school;
  }

  /**
   * Primary Education Simulation Tick.
   *
   * @param {Array<Object>} citizens - Active citizen population
   * @returns {Object} Education service summary state
   */
  tick(citizens = []) {
    let totalEnrolled = 0;
    let universityStudentCount = 0;

    // Reset student enrollment counters
    this.schools.forEach((s) => { s.enrolledStudents = 0; });

    // Enroll eligible student citizens into nearest school
    citizens.forEach((c) => {
      if (!c.alive) return;

      if (c.age < 18 || c.education < 4) {
        let bestSchool = null;
        let minDist = Infinity;

        this.schools.forEach((s) => {
          if (s.enrolledStudents < s.capacity) {
            const d = distance(c.x, c.y, s.x, s.y);
            if (d < minDist) {
              minDist = d;
              bestSchool = s;
            }
          }
        });

        if (bestSchool) {
          bestSchool.enrolledStudents++;
          totalEnrolled++;

          if (bestSchool.type === SCHOOL_TYPE.UNIVERSITY) {
            universityStudentCount++;
          }

          // Skill XP Progression for enrolled citizens
          c.education = clamp(c.education + 0.001, 1, 4);
        }
      }
    });

    // 2. University Research Point Generation
    let rpGen = 0;
    this.schools.forEach((s) => {
      if (s.type === SCHOOL_TYPE.UNIVERSITY) {
        rpGen += Math.floor((s.enrolledStudents / 10) * 1.5);
      }
    });

    this.researchPoints += rpGen;
    this.ledger.researchPointsPerTick = rpGen;

    // 3. Evaluate Technology Unlocks
    this._evaluateTechUnlocks();

    // 4. Update Literacy Rate
    const totalPop = Math.max(1, citizens.length);
    const educatedCount = citizens.filter((c) => c.alive && c.education >= 2).length;
    this.ledger.cityLiteracyRatePct = Number(((educatedCount / totalPop) * 100).toFixed(1));

    return {
      literacyRate: `${this.ledger.cityLiteracyRatePct}%`,
      researchPoints: this.researchPoints,
      unlockedTechsCount: this.unlockedTechnologies.size,
      schoolCount: this.schools.size,
      totalEnrolled
    };
  }

  /**
   * Unlock technologies when research point thresholds are met.
   */
  _evaluateTechUnlocks() {
    Object.keys(this.techCosts).forEach((tech) => {
      if (!this.unlockedTechnologies.has(tech)) {
        const cost = this.techCosts[tech];
        if (this.researchPoints >= cost) {
          this.unlockedTechnologies.add(tech);
        }
      }
    });
  }

  /**
   * Check if a specific technology is unlocked.
   */
  isTechUnlocked(techKey) {
    return this.unlockedTechnologies.has(techKey);
  }

  getEducationSummary() {
    return {
      ...this.ledger,
      researchPoints: this.researchPoints,
      unlockedTechs: Array.from(this.unlockedTechnologies.values())
    };
  }
}
