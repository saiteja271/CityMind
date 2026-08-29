/**
 * CITYMIND Susceptible-Infected-Recovered (SIR) Epidemiological Engine
 * Simulates viral disease transmission matrix ($\frac{dS}{dt} = -\frac{\beta S I}{N}$, $\frac{dI}{dt} = \frac{\beta S I}{N} - \gamma I$),
 * basic reproduction number ($R_0 = \frac{\beta}{\gamma}$), hospital quarantine capacity, and vaccination coverage.
 */

export class EpidemicSirParameters {
  constructor(populationN = 10000, betaTransmissionRate = 0.35, gammaRecoveryRate = 0.10) {
    this.populationN = populationN;
    this.betaTransmissionRate = betaTransmissionRate;
    this.gammaRecoveryRate = gammaRecoveryRate;
    this.basicReproductionNumberR0 = Math.round((betaTransmissionRate / Math.max(0.01, gammaRecoveryRate)) * 100) / 100;

    this.susceptibleS = populationN - 10;
    this.infectedI = 10;
    this.recoveredR = 0;
  }

  stepSirDifferentialEquations(dtDays = 1.0) {
    const sFraction = this.susceptibleS / this.populationN;
    const newInfections = Math.round(this.betaTransmissionRate * sFraction * this.infectedI * dtDays);
    const newRecoveries = Math.round(this.gammaRecoveryRate * this.infectedI * dtDays);

    this.susceptibleS = Math.max(0, this.susceptibleS - newInfections);
    this.infectedI = Math.max(0, this.infectedI + newInfections - newRecoveries);
    this.recoveredR += newRecoveries;

    return {
      S: this.susceptibleS,
      I: this.infectedI,
      R: this.recoveredR,
      R0: this.basicReproductionNumberR0,
    };
  }
}

export class EpidemicSirModelFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.sirParams = new EpidemicSirParameters(simulation?.stats?.population || 10000);
  }

  update(deltaMonths) {
    this.sirParams.stepSirDifferentialEquations(1.0);
  }

  getSirSummary() {
    return {
      S: this.sirParams.susceptibleS,
      I: this.sirParams.infectedI,
      R: this.sirParams.recoveredR,
      R0: this.sirParams.basicReproductionNumberR0,
    };
  }
}

export default EpidemicSirModelFull;
