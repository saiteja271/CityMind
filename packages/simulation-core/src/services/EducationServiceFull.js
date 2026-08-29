/**
 * CITYMIND School District Coverage & Higher Education Innovation Engine
 * School district coverage, literacy rates, higher education research output, technological innovation unlock rate.
 */

export class EducationalInstitutionFacility {
  constructor(id, type = 'UNIVERSITY', capacityStudents = 2500) {
    this.id = id;
    this.type = type; // 'PRIMARY', 'HIGH_SCHOOL', 'VOCATIONAL', 'UNIVERSITY'
    this.capacityStudents = capacityStudents;
    this.enrolledStudentsCount = 1850;
  }
}

export class EducationServiceFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.schoolsMap = new Map();
    this.initializeSchools();
  }

  initializeSchools() {
    this.schoolsMap.set('uni_metropolis_01', new EducationalInstitutionFacility('uni_metropolis_01', 'UNIVERSITY', 5000));
  }

  getEducationSummary() {
    return {
      schoolsCount: this.schoolsMap.size,
    };
  }
}

export default EducationServiceFull;
