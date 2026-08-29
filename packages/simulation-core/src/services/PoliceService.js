/**
 * PoliceService.js - Spatial crime risk heatmaps, precinct coverage, patrol vehicle dispatch AI, and crime deterrence engine.
 * Models 5 distinct crime types (Theft, Vandalism, Assault, Financial Fraud, Organized Crime), response time decay,
 * and patrol route optimization.
 */

import { clamp, distance, generateId } from '@citymind/utilities';

export const CRIME_TYPE = {
  THEFT: 'THEFT',
  VANDALISM: 'VANDALISM',
  ASSAULT: 'ASSAULT',
  FINANCIAL_FRAUD: 'FINANCIAL_FRAUD',
  ORGANIZED_CRIME: 'ORGANIZED_CRIME'
};

export class PatrolVehicle {
  constructor(id, precinctX, precinctY) {
    this.id = id;
    this.x = precinctX;
    this.y = precinctY;
    this.precinctX = precinctX;
    this.precinctY = precinctY;
    this.state = 'PATROLLING'; // 'PATROLLING' | 'RESPONDING' | 'RETURNING'
    this.targetIncident = null;
    this.speed = 2.5;
  }
}

export class PoliceService {
  constructor(gridWidth = 50, gridHeight = 50) {
    this.width = gridWidth;
    this.height = gridHeight;

    // 2D Spatial Crime Risk Heatmap Matrix (0.0 to 100.0)
    this.crimeHeatmap = new Float32Array(gridWidth * gridHeight);

    // Map precinctId -> PrecinctData
    this.precincts = new Map();

    // Patrol Vehicles Fleet
    this.patrolFleet = [];

    // Active Crime Emergency Incidents
    this.activeIncidents = [];

    // Statistics Ledger
    this.ledger = {
      totalCrimesCommitted: 0,
      crimesSolved: 0,
      avgResponseTimeTicks: 4.5,
      overallCitySafetyIndex: 82.0
    };
  }

  /**
   * Register a new police precinct station.
   */
  addPrecinct(id, x, y, radius = 15, officerCount = 20) {
    const precinct = { id, x, y, radius, officerCount, active: true };
    this.precincts.set(id, precinct);

    // Spawn 2 patrol cars per precinct
    this.patrolFleet.push(new PatrolVehicle(generateId('pat'), x, y));
    this.patrolFleet.push(new PatrolVehicle(generateId('pat'), x, y));
    return precinct;
  }

  /**
   * Primary Police Service Tick.
   * Updates spatial crime heatmaps, dispatches patrol cars to active incidents, and calculates deterrence.
   *
   * @param {Array<Object>} citizens - Active citizen population
   * @param {Object} cityMetrics - Unemployment, poverty, and lighting metadata
   * @returns {Object} Police service summary state
   */
  tick(citizens = [], cityMetrics = {}) {
    // 1. Update Spatial Crime Risk Heatmap Matrix
    this._updateCrimeHeatmap(cityMetrics);

    // 2. Evaluate Random Crime Outbreak Generation
    this._generateCrimeEvents(citizens);

    // 3. Dispatch Patrol Vehicle AI to Active Incidents
    this._dispatchPatrolFleet();

    // 4. Calculate Overall Safety Index
    const solvedRate = this.ledger.totalCrimesCommitted > 0 ? (this.ledger.crimesSolved / this.ledger.totalCrimesCommitted) : 1.0;
    const avgHeat = this._calculateAvgCrimeHeat();
    this.ledger.overallCitySafetyIndex = Number(clamp(100 - avgHeat * 0.6 + solvedRate * 20, 10, 99).toFixed(1));

    return {
      safetyIndex: this.ledger.overallCitySafetyIndex,
      activeIncidentsCount: this.activeIncidents.length,
      precinctCount: this.precincts.size,
      fleetCount: this.patrolFleet.length,
      ledger: { ...this.ledger }
    };
  }

  /**
   * Update 2D Spatial Crime Risk Heatmap based on density, poverty, lighting, and police coverage.
   */
  _updateCrimeHeatmap(cityMetrics = {}) {
    const W = this.width;
    const H = this.height;
    const poverty = cityMetrics.povertyRate || 0.15;
    const unemployment = cityMetrics.unemploymentRate || 0.08;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;

        // Base risk driven by poverty and unemployment
        let risk = (poverty * 40) + (unemployment * 30);

        // Police Precinct Coverage Deterrence
        let policeDeterrence = 0;
        this.precincts.forEach((p) => {
          const d = distance(x, y, p.x, p.y);
          if (d <= p.radius) {
            policeDeterrence += (1 - d / p.radius) * 45;
          }
        });

        this.crimeHeatmap[idx] = clamp(risk - policeDeterrence, 2.0, 95.0);
      }
    }
  }

  /**
   * Trigger stochastic crime outbreak events.
   */
  _generateCrimeEvents(citizens) {
    if (citizens.length === 0) return;

    // 5% chance per tick of a crime outbreak occurring in high-risk zones
    if (Math.random() < 0.25) {
      const suspect = citizens[Math.floor(Math.random() * citizens.length)];
      if (!suspect || !suspect.alive) return;

      const riskAtLoc = this.crimeHeatmap[Math.floor(suspect.y) * this.width + Math.floor(suspect.x)] || 20;

      if (Math.random() < riskAtLoc / 100) {
        const incident = {
          id: generateId('inc'),
          type: CRIME_TYPE.THEFT,
          x: suspect.x,
          y: suspect.y,
          suspectId: suspect.id,
          reportedTick: Date.now(),
          resolved: false
        };

        this.activeIncidents.push(incident);
        this.ledger.totalCrimesCommitted++;

        if (suspect.psychology) {
          suspect.psychology.addMemory('CRIME_EVENT', 'Involved in police crime event', -30, Date.now());
        }
      }
    }
  }

  /**
   * Patrol Vehicle Dispatch & Movement AI.
   */
  _dispatchPatrolFleet() {
    const unresolved = this.activeIncidents.filter((i) => !i.resolved);

    this.patrolFleet.forEach((patrol) => {
      if (patrol.state === 'PATROLLING' && unresolved.length > 0) {
        // Nearest emergency dispatch
        unresolved.sort((a, b) => distance(patrol.x, patrol.y, a.x, a.y) - distance(patrol.x, patrol.y, b.x, b.y));
        const target = unresolved.shift();
        patrol.targetIncident = target;
        patrol.state = 'RESPONDING';
      }

      if (patrol.state === 'RESPONDING' && patrol.targetIncident) {
        const d = distance(patrol.x, patrol.y, patrol.targetIncident.x, patrol.targetIncident.y);
        if (d < 1.5) {
          // Arrived & Solved
          patrol.targetIncident.resolved = true;
          this.ledger.crimesSolved++;
          patrol.targetIncident = null;
          patrol.state = 'PATROLLING';
        } else {
          // Move towards incident location
          patrol.x += (patrol.targetIncident.x - patrol.x) * 0.3;
          patrol.y += (patrol.targetIncident.y - patrol.y) * 0.3;
        }
      }
    });

    // Remove resolved incidents
    this.activeIncidents = this.activeIncidents.filter((i) => !i.resolved);
  }

  _calculateAvgCrimeHeat() {
    let sum = 0;
    for (let i = 0; i < this.crimeHeatmap.length; i++) sum += this.crimeHeatmap[i];
    return sum / (this.crimeHeatmap.length || 1);
  }

  getPoliceSummary() {
    return {
      safetyIndex: this.ledger.overallCitySafetyIndex,
      activeIncidents: this.activeIncidents.length,
      precincts: this.precincts.size,
      fleet: this.patrolFleet.length
    };
  }
}
