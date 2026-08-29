/**
 * EmploymentSystem - Job matching based on skills, education, distance, salary.
 */

import { OCCUPATIONS, ECONOMY, EDUCATION_LEVELS } from '@citymind/constants';
import { distance } from '@citymind/utilities';

const JOB_REQUIREMENTS = {
  shop_worker: { education: EDUCATION_LEVELS.PRIMARY, skills: { social: 20 } },
  office_worker: { education: EDUCATION_LEVELS.SECONDARY, skills: { administrative: 30 } },
  factory_worker: { education: EDUCATION_LEVELS.PRIMARY, skills: { physical: 30 } },
  teacher: { education: EDUCATION_LEVELS.BACHELOR, skills: { social: 40 } },
  doctor: { education: EDUCATION_LEVELS.DOCTORATE, skills: { technical: 70 } },
  nurse: { education: EDUCATION_LEVELS.VOCATIONAL, skills: { social: 40 } },
  police_officer: { education: EDUCATION_LEVELS.SECONDARY, skills: { physical: 40 } },
  firefighter: { education: EDUCATION_LEVELS.SECONDARY, skills: { physical: 50 } },
  engineer: { education: EDUCATION_LEVELS.BACHELOR, skills: { technical: 60 } },
  manager: { education: EDUCATION_LEVELS.BACHELOR, skills: { administrative: 50, social: 40 } },
  executive: { education: EDUCATION_LEVELS.MASTER, skills: { administrative: 70, social: 50 } },
  construction: { education: EDUCATION_LEVELS.PRIMARY, skills: { physical: 40 } },
  service: { education: EDUCATION_LEVELS.NONE, skills: {} },
  driver: { education: EDUCATION_LEVELS.PRIMARY, skills: { physical: 20 } }
};

export class EmploymentSystem {
  constructor(simulation) {
    this.sim = simulation;
  }

  getVacancies() {
    const vacancies = [];
    for (const b of this.sim.buildings.getAll()) {
      if (!b.operating || b.constructionProgress < 1) continue;
      const open = (b.employees || 0) - (b.currentEmployees || 0);
      if (open > 0) {
        const occ = this._occupationForBuilding(b);
        vacancies.push({
          buildingId: b.id,
          x: b.x,
          y: b.y,
          occupation: occ,
          slots: open,
          salary: ECONOMY.SALARY_BASE[occ] || 20000
        });
      }
    }
    return vacancies;
  }

  _occupationForBuilding(b) {
    const map = {
      shop: OCCUPATIONS.SHOP_WORKER, office: OCCUPATIONS.OFFICE_WORKER,
      market: OCCUPATIONS.SHOP_WORKER, business_center: OCCUPATIONS.MANAGER,
      factory: OCCUPATIONS.FACTORY_WORKER, warehouse: OCCUPATIONS.FACTORY_WORKER,
      school: OCCUPATIONS.TEACHER, hospital: OCCUPATIONS.DOCTOR,
      fire_station: OCCUPATIONS.FIREFIGHTER, police_station: OCCUPATIONS.POLICE_OFFICER,
      government: OCCUPATIONS.MANAGER
    };
    return map[b.type] || OCCUPATIONS.SERVICE;
  }

  matchCitizenToJob(citizen, vacancies) {
    if (!citizen.isAdult || citizen.isRetired || citizen.isEmployed) return null;
    let best = null;
    let bestScore = -Infinity;
    for (const v of vacancies) {
      const score = this._scoreMatch(citizen, v);
      if (score > bestScore && score > 0.2) {
        bestScore = score;
        best = v;
      }
    }
    return best;
  }

  _scoreMatch(citizen, vacancy) {
    const req = JOB_REQUIREMENTS[vacancy.occupation] || { education: 0, skills: {} };
    if (citizen.education < req.education) return -1;
    let score = 0.5;
    for (const [skill, min] of Object.entries(req.skills || {})) {
      const val = citizen.skills[skill] || 0;
      if (val < min) score -= 0.2;
      else score += 0.1 * (val / 100);
    }
    const dist = distance(citizen.x, citizen.y, vacancy.x, vacancy.y);
    if (dist > citizen.preferences.preferredWorkDistance) score -= 0.15;
    else score += 0.1;
    score += Math.min(0.2, vacancy.salary / 100000);
    if (citizen.personality.ambition > 0.6) score += 0.1;
    return score;
  }

  hire(citizen, vacancy) {
    const building = this.sim.buildings.get(vacancy.buildingId);
    if (!building) return false;
    if ((building.currentEmployees || 0) >= (building.employees || 0)) return false;
    citizen.workplaceId = vacancy.buildingId;
    citizen.workplaceX = vacancy.x;
    citizen.workplaceY = vacancy.y;
    citizen.occupation = vacancy.occupation;
    citizen.income = vacancy.salary;
    building.currentEmployees = (building.currentEmployees || 0) + 1;
    citizen.addMemory('hired', this.sim.time.totalTicks);
    return true;
  }

  processJobSeekers() {
    const vacancies = this.getVacancies();
    if (vacancies.length === 0) return 0;
    let hired = 0;
    const seekers = this.sim.citizens.getAlive().filter(
      (c) => c.isAdult && !c.isRetired && !c.isEmployed && c.occupation !== OCCUPATIONS.STUDENT
    );
    for (const citizen of seekers) {
      const match = this.matchCitizenToJob(citizen, vacancies);
      if (match && this.hire(citizen, match)) {
        hired++;
        match.slots--;
        if (match.slots <= 0) {
          const idx = vacancies.indexOf(match);
          if (idx >= 0) vacancies.splice(idx, 1);
        }
      }
    }
    return hired;
  }
}

export default EmploymentSystem;
