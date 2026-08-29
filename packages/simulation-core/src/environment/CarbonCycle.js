/**
 * CITYMIND City Carbon Footprint & Environmental Cycle Engine
 * Simulates greenhouse gas (CO2/CH4) emissions across urban sectors,
 * carbon sequestration by urban tree canopy and parks, industrial direct air capture,
 * carbon credit market trading ($/ton CO2), and heat island microclimate intensity.
 */

export class CarbonCycle {
  constructor(simulation) {
    this.simulation = simulation;
    this.totalEmissionsTonsMonthly = 1250;
    this.totalSequestrationTonsMonthly = 420;
    this.netCarbonFootprintTons = 830;
    this.carbonCreditPricePerTon = 45.00; // $45/ton CO2
    this.heatIslandIntensityCelsius = 2.4; // +2.4°C over rural ambient
    this.airQualityIndexPpm = 18;

    this.emissionsBySector = {
      residential: 320,
      commercial: 280,
      industrial: 450,
      transport: 200,
    };

    this.sequestrationBySource = {
      forestsAndParks: 310,
      greenRoofMandates: 60,
      carbonCaptureTowers: 50,
    };
  }

  update(deltaMonths) {
    const population = this.simulation?.stats?.population || 1250;
    const activePolicies = this.simulation?.activePolicies || [];

    // Base sector emissions
    let res = population * 0.25;
    let com = population * 0.22;
    let ind = population * 0.35;
    let tra = population * 0.16;

    // Policy mitigations
    if (activePolicies.includes('green_energy_incentive')) {
      res *= 0.80;
      com *= 0.80;
    }
    if (activePolicies.includes('free_public_transit')) {
      tra *= 0.70;
    }
    if (activePolicies.includes('carbon_tax_high')) {
      ind *= 0.75;
    }

    this.emissionsBySector.residential = Math.round(res);
    this.emissionsBySector.commercial = Math.round(com);
    this.emissionsBySector.industrial = Math.round(ind);
    this.emissionsBySector.transport = Math.round(tra);

    this.totalEmissionsTonsMonthly = Math.round(res + com + ind + tra);

    // Sequestration
    const parkCount = 12; // Sample park count
    this.sequestrationBySource.forestsAndParks = Math.round(parkCount * 28);
    this.sequestrationBySource.greenRoofMandates = activePolicies.includes('green_building_mandate') ? 120 : 30;
    this.sequestrationBySource.carbonCaptureTowers = 80;

    this.totalSequestrationTonsMonthly = Object.values(this.sequestrationBySource).reduce((a, b) => a + b, 0);
    this.netCarbonFootprintTons = Math.max(0, this.totalEmissionsTonsMonthly - this.totalSequestrationTonsMonthly);

    // Heat island calculation
    this.heatIslandIntensityCelsius = Math.round((1.0 + (this.netCarbonFootprintTons / 500) * 0.8) * 10) / 10;
    this.airQualityIndexPpm = Math.round(10 + (this.netCarbonFootprintTons / 100) * 1.2);

    // Carbon credit market fluctuation
    const globalDemandFactor = 1 + (Math.sin(Date.now() / 100000) * 0.15);
    this.carbonCreditPricePerTon = Math.round((45.00 * globalDemandFactor) * 100) / 100;
  }

  tradeCarbonCredits(tonsToSell) {
    if (this.totalSequestrationTonsMonthly > this.totalEmissionsTonsMonthly) {
      const surplus = this.totalSequestrationTonsMonthly - this.totalEmissionsTonsMonthly;
      const actualTrade = Math.min(surplus, tonsToSell);
      const revenue = Math.round(actualTrade * this.carbonCreditPricePerTon);
      return { success: true, tonsTraded: actualTrade, revenue, creditPrice: this.carbonCreditPricePerTon };
    }
    return { success: false, reason: 'City is a net carbon emitter. No surplus carbon credits available to sell.' };
  }

  getCarbonSummary() {
    return {
      totalEmissionsTonsMonthly: this.totalEmissionsTonsMonthly,
      totalSequestrationTonsMonthly: this.totalSequestrationTonsMonthly,
      netCarbonFootprintTons: this.netCarbonFootprintTons,
      carbonCreditPricePerTon: this.carbonCreditPricePerTon,
      heatIslandIntensityCelsius: this.heatIslandIntensityCelsius,
      airQualityIndexPpm: this.airQualityIndexPpm,
      emissionsBySector: this.emissionsBySector,
      sequestrationBySource: this.sequestrationBySource,
      isNetZero: this.netCarbonFootprintTons === 0,
    };
  }
}

export default CarbonCycle;
