/**
 * CITYMIND Multi-Criteria Scenario Victory & Star Rating Evaluator
 * Computes 1-star, 2-star, and 3-star victory grades based on completion speed, treasury surplus,
 * citizen happiness indices, pollution mitigation metrics, and casualty minimization.
 */

export class ScenarioGrade {
  constructor(scenarioId, starsCount, scorePoints, completionTimeMonths) {
    this.scenarioId = scenarioId;
    this.starsCount = starsCount; // 1, 2, or 3 stars
    this.scorePoints = scorePoints;
    this.completionTimeMonths = completionTimeMonths;
    this.evaluatedTimestamp = Date.now();
  }
}

export class ScenarioVictoryEvaluatorEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.gradeHistory = new Map();
  }

  evaluateScenarioGrade(scenarioId, completionTimeMonths) {
    const stats = this.simulation?.stats || {};
    const happiness = stats.happiness || 75;
    const treasury = stats.treasury || 250000;
    const crimeRate = stats.crimeRate || 10;
    const pollution = stats.pollutionLevel || 15;

    let points = 5000;
    points += happiness * 50;
    points += Math.min(50000, treasury * 0.1);
    points -= crimeRate * 100;
    points -= pollution * 100;
    points -= completionTimeMonths * 200;

    let stars = 1;
    if (points >= 12000 && happiness >= 85) stars = 3;
    else if (points >= 8000 && happiness >= 70) stars = 2;

    const grade = new ScenarioGrade(scenarioId, stars, Math.round(points), completionTimeMonths);
    this.gradeHistory.set(scenarioId, grade);
    return grade;
  }

  getScenarioGrade(scenarioId) {
    return this.gradeHistory.get(scenarioId) || null;
  }
}

export default ScenarioVictoryEvaluatorEngine;
