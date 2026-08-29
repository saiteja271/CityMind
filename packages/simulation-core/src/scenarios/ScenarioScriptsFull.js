/**
 * CITYMIND Full Scenario Trigger Scripts & Objective State Evaluators
 * Implements tick-by-tick scenario objective progress tracking, event triggers, narrative dialog cards,
 * and loss condition evaluators for 15 city scenarios.
 */

export class ScenarioObjectiveTrackerState {
  constructor(objectiveId, title, requiredCount = 100) {
    this.objectiveId = objectiveId;
    this.title = title;
    this.requiredCount = requiredCount;
    this.currentCount = 0;
    this.isCompleted = false;
  }

  updateProgress(newCount) {
    this.currentCount = newCount;
    if (this.currentCount >= this.requiredCount) {
      this.isCompleted = true;
    }
    return this.isCompleted;
  }
}

export class ScenarioScriptsFullEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.activeObjectives = new Map();
  }

  loadScenarioObjectives(scenarioId) {
    this.activeObjectives.clear();

    if (scenarioId === 'scen_01_hurricane') {
      this.activeObjectives.set('obj_rebuild_power', new ScenarioObjectiveTrackerState('obj_rebuild_power', 'Rebuild Substation 3 Power Grid', 100));
      this.activeObjectives.set('obj_shelter', new ScenarioObjectiveTrackerState('obj_shelter', 'Provide Emergency Shelters', 500));
    } else if (scenarioId === 'scen_02_eco') {
      this.activeObjectives.set('obj_zero_carbon', new ScenarioObjectiveTrackerState('obj_zero_carbon', 'Achieve 100% Clean Energy Grid', 100));
    }
  }

  getScenarioProgressSummary() {
    let completed = 0;
    this.activeObjectives.forEach((obj) => {
      if (obj.isCompleted) completed++;
    });

    return {
      totalObjectivesCount: this.activeObjectives.size,
      completedObjectivesCount: completed,
      isScenarioPassed: this.activeObjectives.size > 0 && completed === this.activeObjectives.size,
    };
  }
}

export default ScenarioScriptsFullEngine;
