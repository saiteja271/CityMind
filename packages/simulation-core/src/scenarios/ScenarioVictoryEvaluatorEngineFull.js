/**
 * CITYMIND Scenario Objective Progress & Win/Loss Condition Evaluator
 * Tracks mission step completion, time limits, subtask checklists, and reward payouts for 15 city scenarios.
 */

export class ScenarioObjectiveItem {
  constructor(id, labelText, targetValue = 100) {
    this.id = id;
    this.labelText = labelText;
    this.targetValue = targetValue;
    this.currentValue = 0;
    this.isCompleted = false;
  }

  updateProgress(val) {
    this.currentValue = val;
    this.isCompleted = this.currentValue >= this.targetValue;
    return this.isCompleted;
  }
}

export class ScenarioVictoryEvaluatorEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.objectivesMap = new Map();
  }

  loadObjectivesForScenario(scenarioId) {
    this.objectivesMap.clear();
    if (scenarioId === 'scen_hurricane') {
      this.objectivesMap.set('obj_power', new ScenarioObjectiveItem('obj_power', 'Rebuild Substation Power', 100));
      this.objectivesMap.set('obj_pop', new ScenarioObjectiveItem('obj_pop', 'Restore Population to 10,000', 10000));
    }
  }

  getScenarioProgress() {
    let completed = 0;
    this.objectivesMap.forEach((obj) => {
      if (obj.isCompleted) completed++;
    });

    return {
      totalObjectivesCount: this.objectivesMap.size,
      completedObjectivesCount: completed,
      isVictory: this.objectivesMap.size > 0 && completed === this.objectivesMap.size,
    };
  }
}

export default ScenarioVictoryEvaluatorEngineFull;
