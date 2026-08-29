/**
 * CITYMIND Biological Citizen Life-Cycle & Demographic Transition Simulation Engine
 * Life Stages: Infancy (0-4), Primary School (5-12), High School (13-17), Higher Education (18-22),
 * Early Career (23-35), Mid Career (36-50), Senior Leadership (51-65), Retirement (66-79), Elderly Care (80+).
 */

export class CitizenLifeStage {
  static getStageName(ageYears) {
    if (ageYears <= 4) return 'INFANT';
    if (ageYears <= 12) return 'PRIMARY_STUDENT';
    if (ageYears <= 17) return 'HIGH_SCHOOL_STUDENT';
    if (ageYears <= 22) return 'COLLEGE_STUDENT';
    if (ageYears <= 35) return 'EARLY_CAREER';
    if (ageYears <= 50) return 'MID_CAREER';
    if (ageYears <= 65) return 'SENIOR_LEADERSHIP';
    if (ageYears <= 79) return 'RETIRED';
    return 'ELDERLY_CARE';
  }

  static getBaseMortalityRate(ageYears) {
    if (ageYears <= 1) return 0.004;
    if (ageYears <= 45) return 0.001;
    if (ageYears <= 65) return 0.008;
    if (ageYears <= 75) return 0.025;
    if (ageYears <= 85) return 0.075;
    return 0.180; // High elderly mortality rate per year
  }
}

export class CitizenLifeCycleProfile {
  constructor(id, initialAgeYears = 25, gender = 'Female') {
    this.id = id;
    this.ageYears = initialAgeYears;
    this.ageMonths = initialAgeYears * 12;
    this.gender = gender;
    this.lifeStage = CitizenLifeStage.getStageName(initialAgeYears);

    this.educationLevel = 'HIGH_SCHOOL'; // 'NONE', 'PRIMARY', 'HIGH_SCHOOL', 'VOCATIONAL', 'BACHELOR', 'MASTER', 'PHD'
    this.careerTrack = 'UNEMPLOYED';
    this.wageSalaryDollars = 0;
    this.savingsAccountDollars = 5000;
    this.pensionFundDollars = 0;
    this.healthInsuranceActive = true;
    this.isDeceased = false;
  }

  incrementAgeMonth(healthcareQualityIndex = 80, pollutionLevelPpm = 15) {
    if (this.isDeceased) return;

    this.ageMonths += 1;
    this.ageYears = Math.floor(this.ageMonths / 12);
    this.lifeStage = CitizenLifeStage.getStageName(this.ageYears);

    // Annual biological health & mortality evaluation
    if (this.ageMonths % 12 === 0) {
      const baseMortality = CitizenLifeStage.getBaseMortalityRate(this.ageYears);
      const pollutionMultiplier = 1.0 + (pollutionLevelPpm / 100.0);
      const healthcareBuffer = 1.0 - (healthcareQualityIndex / 200.0);

      const netMortalityRisk = baseMortality * pollutionMultiplier * healthcareBuffer;
      if (Math.random() < netMortalityRisk) {
        this.isDeceased = true;
      }
    }

    // Accumulate pension contributions during working age
    if (this.lifeStage === 'EARLY_CAREER' || this.lifeStage === 'MID_CAREER' || this.lifeStage === 'SENIOR_LEADERSHIP') {
      const monthlyPensionContrib = this.wageSalaryDollars * 0.08 / 12;
      this.pensionFundDollars += monthlyPensionContrib;
    }
  }

  evaluateCareerPromotion(cityEducationIndex = 75, jobDemand = 1.2) {
    if (this.lifeStage === 'EARLY_CAREER' && this.educationLevel === 'BACHELOR') {
      if (Math.random() < 0.15 * jobDemand) {
        this.careerTrack = 'MID_MANAGEMENT';
        this.wageSalaryDollars = 75000;
      }
    } else if (this.lifeStage === 'MID_CAREER' && this.careerTrack === 'MID_MANAGEMENT') {
      if (Math.random() < 0.08 * jobDemand) {
        this.careerTrack = 'EXECUTIVE';
        this.wageSalaryDollars = 140000;
      }
    }
  }
}

export class CitizenLifeCyclesEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.citizenProfiles = new Map();
    this.totalBirthsCount = 0;
    this.totalDeathsCount = 0;
  }

  registerCitizen(id, initialAge = 25, gender = 'Female') {
    const profile = new CitizenLifeCycleProfile(id, initialAge, gender);
    this.citizenProfiles.set(id, profile);
    return profile;
  }

  processMonthlyTick(healthcareQuality = 80, pollutionLevel = 15) {
    let monthlyBirths = 0;
    let monthlyDeaths = 0;

    this.citizenProfiles.forEach((profile, id) => {
      if (profile.isDeceased) return;

      profile.incrementAgeMonth(healthcareQuality, pollutionLevel);
      if (profile.isDeceased) {
        monthlyDeaths += 1;
        this.totalDeathsCount += 1;
      } else {
        // Evaluate fertility for young adult females
        if (profile.gender === 'Female' && profile.ageYears >= 20 && profile.ageYears <= 38) {
          if (Math.random() < 0.008) {
            // 0.8% monthly pregnancy probability
            monthlyBirths += 1;
            this.totalBirthsCount += 1;
            const babyId = `cit_baby_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            this.registerCitizen(babyId, 0, Math.random() < 0.5 ? 'Male' : 'Female');
          }
        }
      }
    });

    return {
      monthlyBirths,
      monthlyDeaths,
      activePopulation: this.getLivingPopulationCount(),
    };
  }

  getLivingPopulationCount() {
    let count = 0;
    this.citizenProfiles.forEach((p) => {
      if (!p.isDeceased) count++;
    });
    return count;
  }

  getDemographicSummary() {
    const breakdown = {
      INFANT: 0,
      PRIMARY_STUDENT: 0,
      HIGH_SCHOOL_STUDENT: 0,
      COLLEGE_STUDENT: 0,
      EARLY_CAREER: 0,
      MID_CAREER: 0,
      SENIOR_LEADERSHIP: 0,
      RETIRED: 0,
      ELDERLY_CARE: 0,
    };

    this.citizenProfiles.forEach((p) => {
      if (!p.isDeceased && breakdown[p.lifeStage] !== undefined) {
        breakdown[p.lifeStage] += 1;
      }
    });

    return {
      totalTrackedCitizens: this.citizenProfiles.size,
      livingPopulation: this.getLivingPopulationCount(),
      totalBirthsCount: this.totalBirthsCount,
      totalDeathsCount: this.totalDeathsCount,
      demographicBreakdown: breakdown,
    };
  }
}

export default CitizenLifeCyclesEngine;
