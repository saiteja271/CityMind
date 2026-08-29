/**
 * HTNPlanner - Hierarchical Task Network (HTN) Planner for Citizens.
 * Supports task decomposition into compound and primitive tasks, precondition validation,
 * rollback handling, goal evaluation, and real-time schedule adaptation on disruptions.
 */

export class HTNPrimitiveTask {
  constructor(name, executeFn, preconditionFn = () => true, cost = 1.0) {
    this.name = name;
    this.isPrimitive = true;
    this.executeFn = executeFn;
    this.preconditionFn = preconditionFn;
    this.cost = cost;
  }

  isValid(worldState, citizen) {
    return this.preconditionFn(worldState, citizen);
  }

  execute(worldState, citizen, dt) {
    return this.executeFn(worldState, citizen, dt);
  }
}

export class HTNMethod {
  constructor(name, subtasks = [], preconditionFn = () => true) {
    this.name = name;
    this.subtasks = subtasks; // Array of HTNPrimitiveTask or HTNCompoundTask
    this.preconditionFn = preconditionFn;
  }

  isValid(worldState, citizen) {
    return this.preconditionFn(worldState, citizen);
  }
}

export class HTNCompoundTask {
  constructor(name) {
    this.name = name;
    this.isPrimitive = false;
    this.methods = [];
  }

  addMethod(method) {
    this.methods.push(method);
  }

  getValidMethods(worldState, citizen) {
    return this.methods.filter(m => m.isValid(worldState, citizen));
  }
}

export class HTNPlanRunner {
  constructor(plan = [], compoundTaskName = '') {
    this.plan = plan; // Array of HTNPrimitiveTask
    this.currentIndex = 0;
    this.compoundTaskName = compoundTaskName;
    this.status = 'PENDING'; // 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
  }

  getCurrentTask() {
    return this.plan[this.currentIndex] || null;
  }

  step(worldState, citizen, dt) {
    if (this.currentIndex >= this.plan.length) {
      this.status = 'COMPLETED';
      return 'COMPLETED';
    }

    const currentTask = this.getCurrentTask();
    if (!currentTask || !currentTask.isValid(worldState, citizen)) {
      this.status = 'FAILED';
      return 'FAILED'; // Trigger rollback & replanning
    }

    this.status = 'RUNNING';
    const taskResult = currentTask.execute(worldState, citizen, dt);
    if (taskResult === 'DONE') {
      this.currentIndex++;
      if (this.currentIndex >= this.plan.length) {
        this.status = 'COMPLETED';
        return 'COMPLETED';
      }
    }

    return 'RUNNING';
  }
}

export class HTNPlanner {
  constructor() {
    this.taskLibrary = new Map();
    this._registerStandardTasks();
  }

  registerCompoundTask(task) {
    this.taskLibrary.set(task.name, task);
  }

  plan(rootTaskName, worldState, citizen) {
    const rootTask = this.taskLibrary.get(rootTaskName);
    if (!rootTask) return null;

    const planList = [];
    const success = this._decomposeTask(rootTask, worldState, citizen, planList, 0);

    if (success) {
      return new HTNPlanRunner(planList, rootTaskName);
    }
    return null;
  }

  _decomposeTask(task, worldState, citizen, planList, depth = 0) {
    if (depth > 15) return false; // Prevent infinite recursion

    if (task.isPrimitive) {
      if (task.isValid(worldState, citizen)) {
        planList.push(task);
        return true;
      }
      return false;
    }

    // Compound Task decomposition
    const validMethods = task.getValidMethods(worldState, citizen);
    for (const method of validMethods) {
      const backupPlanLength = planList.length;
      let methodSuccess = true;

      for (const subtask of method.subtasks) {
        const result = this._decomposeTask(subtask, worldState, citizen, planList, depth + 1);
        if (!result) {
          methodSuccess = false;
          break;
        }
      }

      if (methodSuccess) {
        return true;
      } else {
        // Rollback subtasks added by failed method
        planList.length = backupPlanLength;
      }
    }

    return false;
  }

  // ---------------------------------------------------------------------------
  // Standard Citizen HTN Task Domain Registration
  // ---------------------------------------------------------------------------

  _registerStandardTasks() {
    // 1. Primitive Tasks
    const walkTo = new HTNPrimitiveTask('WalkTo', (ws, cit, dt) => {
      // Movement toward target...
      return 'DONE';
    });

    const driveTo = new HTNPrimitiveTask('DriveTo', (ws, cit, dt) => {
      return 'DONE';
    }, (ws, cit) => cit.hasVehicle);

    const sleepInHome = new HTNPrimitiveTask('SleepIn', (ws, cit, dt) => {
      cit.energy = Math.min(100, (cit.energy || 50) + dt * 15);
      return cit.energy >= 95 ? 'DONE' : 'RUNNING';
    });

    const workAtJob = new HTNPrimitiveTask('WorkAt', (ws, cit, dt) => {
      cit.funds = (cit.funds || 100) + dt * 5;
      cit.energy = Math.max(0, (cit.energy || 100) - dt * 2);
      return 'DONE';
    });

    const eatAtShop = new HTNPrimitiveTask('EatAt', (ws, cit, dt) => {
      cit.hunger = Math.min(100, (cit.hunger || 50) + dt * 20);
      return cit.hunger >= 90 ? 'DONE' : 'RUNNING';
    });

    const seekDoctor = new HTNPrimitiveTask('SeekHospital', (ws, cit, dt) => {
      cit.health = Math.min(100, (cit.health || 50) + dt * 25);
      return cit.health >= 90 ? 'DONE' : 'RUNNING';
    });

    // 2. Compound Task: Daily Routine
    const dailyRoutine = new HTNCompoundTask('DailyRoutine');

    // Method A: Drive to work routine (if citizen has vehicle)
    const driveWorkMethod = new HTNMethod(
      'DriveWorkRoutine',
      [driveTo, workAtJob, driveTo, eatAtShop, sleepInHome],
      (ws, cit) => cit.hasVehicle && (cit.energy || 100) > 20
    );

    // Method B: Walking routine
    const walkWorkMethod = new HTNMethod(
      'WalkWorkRoutine',
      [walkTo, workAtJob, walkTo, eatAtShop, sleepInHome],
      (ws, cit) => (cit.energy || 100) > 20
    );

    // Method C: Emergency health routine when sick
    const emergencyHealthMethod = new HTNMethod(
      'EmergencyHealthRoutine',
      [walkTo, seekDoctor],
      (ws, cit) => (cit.health || 100) < 40
    );

    dailyRoutine.addMethod(emergencyHealthMethod);
    dailyRoutine.addMethod(driveWorkMethod);
    dailyRoutine.addMethod(walkWorkMethod);

    this.registerCompoundTask(dailyRoutine);
  }
}

export default HTNPlanner;
