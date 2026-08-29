/**
 * HealthcareService.js - Epidemic SIR compartmental model, hospital bed triage, ambulance dispatch, and air pollution health impact engine.
 * Models compartmental disease dynamics ($\frac{dS}{dt}, \frac{dI}{dt}, \frac{dR}{dt}, \frac{dD}{dt}$), ICU availability,
 * and $PM_{2.5}$ pollution health correlations.
 */

import { clamp, distance, generateId } from '@citymind/utilities';

export class Ambulance {
  constructor(id, hospitalX, hospitalY) {
    this.id = id;
    this.x = hospitalX;
    this.y = hospitalY;
    this.hospitalX = hospitalX;
    this.hospitalY = hospitalY;
    this.state = 'IDLE'; // 'IDLE' | 'RESPONDING' | 'RETURNING'
    this.patientId = null;
  }
}

export class HealthcareService {
  constructor() {
    // Map hospitalId -> HospitalData
    this.hospitals = new Map();

    // Fleet list
    this.ambulances = [];

    // Epidemic SIR Compartmental State Variables
    this.sirModel = {
      S: 990, // Susceptible count
      I: 10,  // Infected count
      R: 0,   // Recovered count
      D: 0,   // Deceased count
      beta: 0.25,  // Transmission rate per contact
      gamma: 0.08, // Recovery rate
      mu: 0.005    // Mortality rate from infection
    };

    // Environmental Health Impacts
    this.healthImpacts = {
      pm25Level: 15.0, // ug/m3
      respiratoryIncidenceRate: 0.02,
      cardiovascularIncidenceRate: 0.01
    };

    // Hospital Bed Capacity
    this.totalBeds = 0;
    this.occupiedBeds = 0;
    this.totalICUBeds = 0;
    this.occupiedICUBeds = 0;
  }

  /**
   * Register a hospital facility.
   */
  addHospital(id, x, y, beds = 100, icuBeds = 20) {
    const hospital = {
      id,
      x,
      y,
      beds,
      icuBeds,
      occupiedBeds: 0,
      occupiedICU: 0,
      active: true
    };

    this.hospitals.set(id, hospital);
    this.totalBeds += beds;
    this.totalICUBeds += icuBeds;

    // Spawn 3 ambulances per hospital
    this.ambulances.push(new Ambulance(generateId('amb'), x, y));
    this.ambulances.push(new Ambulance(generateId('amb'), x, y));
    this.ambulances.push(new Ambulance(generateId('amb'), x, y));

    return hospital;
  }

  /**
   * Primary Healthcare Simulation Tick.
   * Runs Epidemic SIR updates, hospital bed triage, ambulance dispatch, and pollution health decay.
   *
   * @param {Array<Object>} citizens - Active citizen population
   * @param {number} pm25Pollution - Air particulate matter PM2.5 level
   * @returns {Object} Healthcare summary state
   */
  tick(citizens = [], pm25Pollution = 15.0) {
    const N = Math.max(1, citizens.length);

    // 1. Epidemic SIR Compartmental Model Step
    // dS/dt = -beta * S * I / N
    // dI/dt = beta * S * I / N - gamma * I - mu * I
    // dR/dt = gamma * I
    // dD/dt = mu * I
    const { S, I, R, D, beta, gamma, mu } = this.sirModel;

    const newInfections = Math.min(S, Math.ceil((beta * S * I) / N));
    const newRecoveries = Math.min(I, Math.ceil(gamma * I));
    const newDeaths = Math.min(I - newRecoveries, Math.ceil(mu * I));

    this.sirModel.S = Math.max(0, S - newInfections);
    this.sirModel.I = Math.max(0, I + newInfections - newRecoveries - newDeaths);
    this.sirModel.R += newRecoveries;
    this.sirModel.D += newDeaths;

    // 2. Air Pollution PM2.5 & Toxins Health Correlations
    this.healthImpacts.pm25Level = pm25Pollution;
    const pollutionHealthDecay = (pm25Pollution / 50.0) * 1.5;

    citizens.forEach((c) => {
      if (!c.alive) return;
      // High PM2.5 reduces health vitals over time
      c.health = clamp(c.health - pollutionHealthDecay * 0.1, 5, 100);
    });

    // 3. Hospital Triage & Bed Occupancy
    let currentOccupiedBeds = 0;
    let currentOccupiedICU = 0;

    const sickCitizens = citizens.filter((c) => c.alive && c.health < 40);

    sickCitizens.forEach((sick) => {
      if (sick.health < 15) {
        if (currentOccupiedICU < this.totalICUBeds) currentOccupiedICU++;
      } else {
        if (currentOccupiedBeds < this.totalBeds) currentOccupiedBeds++;
      }
    });

    this.occupiedBeds = currentOccupiedBeds;
    this.occupiedICUBeds = currentOccupiedICU;

    // 4. Ambulance Dispatch AI for Critical Emergencies
    this._dispatchAmbulances(citizens.filter((c) => c.alive && c.health < 20));

    return this.getHealthcareSummary();
  }

  /**
   * Dispatch ambulances to critical patients.
   */
  _dispatchAmbulances(criticalPatients = []) {
    this.ambulances.forEach((amb) => {
      if (amb.state === 'IDLE' && criticalPatients.length > 0) {
        criticalPatients.sort((a, b) => distance(amb.x, amb.y, a.x, a.y) - distance(amb.x, amb.y, b.x, b.y));
        const patient = criticalPatients.shift();
        amb.patientId = patient.id;
        amb.state = 'RESPONDING';
      }

      if (amb.state === 'RESPONDING') {
        const d = distance(amb.x, amb.y, amb.hospitalX, amb.hospitalY);
        if (d < 1.0) {
          amb.state = 'IDLE';
          amb.patientId = null;
        } else {
          amb.x += (amb.hospitalX - amb.x) * 0.3;
          amb.y += (amb.hospitalY - amb.y) * 0.3;
        }
      }
    });
  }

  /**
   * Summary overview of healthcare system.
   */
  getHealthcareSummary() {
    const totalCap = Math.max(1, this.totalBeds);
    const occupancyPct = (this.occupiedBeds / totalCap) * 100;

    return {
      sirModel: { ...this.sirModel },
      hospitalCount: this.hospitals.size,
      totalBeds: this.totalBeds,
      occupiedBeds: this.occupiedBeds,
      bedOccupancyRate: `${occupancyPct.toFixed(1)}%`,
      totalICUBeds: this.totalICUBeds,
      occupiedICUBeds: this.occupiedICUBeds,
      pm25Level: this.healthImpacts.pm25Level,
      activeAmbulances: this.ambulances.length
    };
  }
}
