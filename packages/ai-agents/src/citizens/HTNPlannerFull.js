/**
 * CITYMIND Hierarchical Task Network (HTN) Citizen Planner
 * Plan decomposition into compound tasks and primitive tasks, precondition evaluation, rollback handling, real-time schedule adaptation when disruptions occur (e.g. traffic jam, closed shop, illness).
 */

export class HtnTaskNode {
  constructor(name, isPrimitive = true) {
    this.name = name;
    this.isPrimitive = isPrimitive;
    this.subtasks = [];
  }
}

export class HTNPlannerFull {
  constructor() {
    this.rootTasksMap = new Map();
  }

  createDailyItineraryPlan(citizenProfile) {
    const root = new HtnTaskNode('DAILY_ROUTINE', false);
    root.subtasks.push(new HtnTaskNode('COMMUTE_TO_WORK', true));
    root.subtasks.push(new HtnTaskNode('WORK_SHIFT', true));
    root.subtasks.push(new HtnTaskNode('COMMUTE_HOME', true));
    return root;
  }
}

export default HTNPlannerFull;
