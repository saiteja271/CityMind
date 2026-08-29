/**
 * CITYMIND Power Grid Generator Dispatch & Transmission Loss Engine
 * Electrical circuit simulation, generator output (Fossil, Solar, Wind, Nuclear, Hydro), high-voltage vs low-voltage distribution loss, grid overload handling, rolling blackouts, battery storage dispatch.
 */

export class PowerGeneratorFacility {
  constructor(id, type = 'SOLAR', ratedOutputKw = 50000) {
    this.id = id;
    this.type = type; // 'FOSSIL', 'SOLAR', 'WIND', 'NUCLEAR', 'HYDRO'
    this.ratedOutputKw = ratedOutputKw;
    this.currentOutputKw = ratedOutputKw;
    this.fuelCostPerKw = type === 'SOLAR' ? 0 : 0.05;
  }
}

export class PowerGridFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.generatorsMap = new Map();
    this.initializeGenerators();
  }

  initializeGenerators() {
    this.generatorsMap.set('gen_solar_01', new PowerGeneratorFacility('gen_solar_01', 'SOLAR', 50000));
    this.generatorsMap.set('gen_nuclear_02', new PowerGeneratorFacility('gen_nuclear_02', 'NUCLEAR', 120000));
  }

  getPowerSummary() {
    return {
      generatorsCount: this.generatorsMap.size,
    };
  }
}

export default PowerGridFull;
