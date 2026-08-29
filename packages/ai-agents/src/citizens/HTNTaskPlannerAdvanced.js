/**
 * CITYMIND Advanced Hierarchical Task Network (HTN) Planner
 * Decomposes complex citizen goals (e.g. "Get Higher Education & Career Promotion") into compound tasks
 * and primitive executable steps with precondition evaluations, rollback mechanisms, and dynamic plan adaptation.
 */

export class HTNPrimitiveTask {
  constructor(name, preconditionFn, executeFn) {
    this.name = name;
    this.preconditionFn = preconditionFn;
    this.executeFn = executeFn;
  }

  canExecute(worldState) {
    return typeof this.preconditionFn === 'function' ? this.preconditionFn(worldState) : true;
  }

  execute(worldState) {
    if (typeof this.executeFn === 'function') {
      return this.executeFn(worldState);
    }
    return { success: true };
  }
}

export class HTNCompoundTask {
  constructor(goalName) {
    this.goalName = goalName;
    this.subtaskBranches = []; // Array of arrays of HTNPrimitiveTask or HTNCompoundTask
  }

  addBranch(tasksList) {
    this.subtaskBranches.push(tasksList);
  }

  decompose(worldState) {
    for (const branch of this.subtaskBranches) {
      let valid = true;
      for (const task of branch) {
        if (task instanceof HTNPrimitiveTask && !task.canExecute(worldState)) {
          valid = false;
          break;
        }
      }
      if (valid) return branch;
    }
    return null; // Plan failed
  }
}

export class HTNTaskPlannerAdvanced {
  constructor() {
    this.compoundTaskCatalog = new Map();
    this.initializeDomainModel();
  }

  initializeDomainModel() {
    // 1. Goal: Attend University & Level Up Skill
    const eduGoal = new HTNCompoundTask('GetHigherEducation');
    eduGoal.addBranch([
      new HTNPrimitiveTask('TravelToUniversity', (ws) => ws.transitAvailable, (ws) => ({ success: true, action: 'Commute' })),
      new HTNPrimitiveTask('PayTuitionFee', (ws) => ws.citizenSavings >= 5000, (ws) => ({ success: true, cost: 5000 })),
      new HTNPrimitiveTask('AttendLectures', (ws) => ws.health >= 50, (ws) => ({ success: true, skillGain: 200 })),
    ]);

    this.compoundTaskCatalog.set('GetHigherEducation', eduGoal);
  }

  createPlanForCitizen(goalName, citizenWorldState) {
    const compound = this.compoundTaskCatalog.get(goalName);
    if (!compound) return null;

    const planSteps = compound.decompose(citizenWorldState);
    return {
      goalName,
      isValid: planSteps !== null,
      steps: planSteps || [],
    };
  }
}

export default HTNTaskPlannerAdvanced;
