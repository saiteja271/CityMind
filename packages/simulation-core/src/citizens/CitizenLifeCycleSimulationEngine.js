/**
 * CITYMIND Citizen Biological Lifecycle & Demographic State Engine
 * Simulates demographic aging ticks, biological fertility rates, retirement age transitions,
 * healthcare insurance policy coverage, and mortality tables per age cohort.
 */

export class CitizenDemographicCohort {
  constructor(ageBracket = 'Adult', population = 500) {
    this.ageBracket = ageBracket; // 'Child', 'YoungAdult', 'Adult', 'Senior', 'Elderly'
    this.population = population;
    this.fertilityRatePct = ageBracket === 'YoungAdult' ? 4.5 : 0;
    this.mortalityRatePct = ageBracket === 'Elderly' ? 2.5 : 0.1;
  }

  processCycle() {
    const births = Math.round(this.population * (this.fertilityRatePct / 100.0));
    const deaths = Math.round(this.population * (this.mortalityRatePct / 100.0));
    this.population = Math.max(0, this.population + births - deaths);
    return { births, deaths, population: this.population };
  }
}

export class CitizenLifeCycleSimulationEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.cohorts = new Map();
    this.initializeCohorts();
  }

  initializeCohorts() {
    this.cohorts.set('Child', new CitizenDemographicCohort('Child', 250));
    this.cohorts.set('YoungAdult', new CitizenDemographicCohort('YoungAdult', 450));
    this.cohorts.set('Adult', new CitizenDemographicCohort('Adult', 600));
    this.cohorts.set('Senior', new CitizenDemographicCohort('Senior', 200));
  }

  update(deltaMonths) {
    let totalBirths = 0;
    let totalDeaths = 0;

    this.cohorts.forEach((cohort) => {
      const res = cohort.processCycle();
      totalBirths += res.births;
      totalDeaths += res.deaths;
    });

    if (this.simulation?.stats) {
      this.simulation.stats.population += totalBirths - totalDeaths;
    }
  }
}

export default CitizenLifeCycleSimulationEngine;
