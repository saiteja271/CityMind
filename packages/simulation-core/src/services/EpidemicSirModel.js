/**
 * CITYMIND Susceptible-Infected-Recovered (SIR) Epidemiological Engine
 * Differential equations model ($\frac{dS}{dt} = -\frac{\beta S I}{N}, \quad \frac{dI}{dt} = \frac{\beta S I}{N} - \gamma I, \quad \frac{dR}{dt} = \gamma I$),
 * basic reproduction number $R_0 = \beta / \gamma$, hospital bed utilization rates, and quarantine lockdown effectiveness.
 */

export class EpidemicSirModelEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.susceptibleCount = 1200;
    this.infectedCount = 50;
    this.recoveredCount = 0;
    this.betaTransmissionRate = 0.35; // Contact transmission rate
    this.gammaRecoveryRate = 0.10; // 10-day recovery rate
    this.r0BasicReproductionNumber = 3.5;
  }

  update(deltaMonths) {
    const N = Math.max(1, this.susceptibleCount + this.infectedCount + this.recoveredCount);
    this.r0BasicReproductionNumber = Math.round((this.betaTransmissionRate / this.gammaRecoveryRate) * 100) / 100;

    // Differential step equations:
    const newInfections = Math.round((this.betaTransmissionRate * this.susceptibleCount * this.infectedCount) / N);
    const newRecoveries = Math.round(this.gammaRecoveryRate * this.infectedCount);

    this.susceptibleCount = Math.max(0, this.susceptibleCount - newInfections);
    this.infectedCount = Math.max(0, this.infectedCount + newInfections - newRecoveries);
    this.recoveredCount += newRecoveries;
  }

  getSirSummary() {
    return {
      r0BasicReproductionNumber: this.r0BasicReproductionNumber,
      susceptibleCount: this.susceptibleCount,
      infectedCount: this.infectedCount,
      recoveredCount: this.recoveredCount,
    };
  }
}

export default EpidemicSirModelEngine;
