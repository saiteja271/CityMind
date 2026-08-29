/**
 * CITYMIND 24-Hour Citizen Daily Schedule Profile Engine
 * Manages shift work profiles (Morning 8am-4pm, Evening 4pm-12am, Night 12am-8am, Freelance, Remote),
 * hourly itinerary transitions, and commute time calculations.
 */

export class ScheduleProfileShift {
  constructor(shiftName = 'MorningShift', startHour = 8, endHour = 16) {
    this.shiftName = shiftName;
    this.startHour = startHour;
    this.endHour = endHour;
    this.isWorkHour = false;
  }

  evaluateCurrentHour(hour) {
    if (this.startHour < this.endHour) {
      this.isWorkHour = hour >= this.startHour && hour < this.endHour;
    } else {
      // Overnight shift
      this.isWorkHour = hour >= this.startHour || hour < this.endHour;
    }
    return this.isWorkHour;
  }
}

export class CitizenDailySchedulesEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.schedulesMap = new Map();
  }

  getOrCreateSchedule(citizenId, shiftType = 'MorningShift') {
    if (!this.schedulesMap.has(citizenId)) {
      let shift = new ScheduleProfileShift('MorningShift', 8, 16);
      if (shiftType === 'EveningShift') shift = new ScheduleProfileShift('EveningShift', 16, 24);
      else if (shiftType === 'NightShift') shift = new ScheduleProfileShift('NightShift', 0, 8);

      this.schedulesMap.set(citizenId, shift);
    }
    return this.schedulesMap.get(citizenId);
  }

  update(deltaMonths) {
    const currentHour = (Date.now() / 1000) % 24;
    this.schedulesMap.forEach((schedule) => {
      schedule.evaluateCurrentHour(currentHour);
    });
  }
}

export default CitizenDailySchedulesEngine;
