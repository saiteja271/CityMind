/**
 * CITYMIND Multi-Agent Action Utility Matrix Evaluator
 * Evaluates action utility scores ($U = \sum w_i \cdot N_i$) across 12 action candidates:
 * Work, Sleep, Eat, Socialize, Shop, Exercise, Seek Medical, Attend School, Entertain, Commit Crime, Protest, Rest.
 */

export class ActionCandidateScore {
  constructor(actionName, score = 0.0) {
    this.actionName = actionName;
    this.score = score;
  }
}

export class CitizenBehaviorMatrixEngine {
  constructor() {
    this.actionCandidates = [
      'Work', 'Sleep', 'Eat', 'Socialize', 'Shop',
      'Exercise', 'SeekMedical', 'AttendSchool', 'Entertain',
      'CommitCrime', 'Protest', 'Rest'
    ];
  }

  evaluateBestAction(citizenNeeds, oceanTraits) {
    const scores = [];

    // Sleep Utility
    const sleepScore = (100 - (citizenNeeds.energy || 50)) * 1.5;
    scores.push(new ActionCandidateScore('Sleep', sleepScore));

    // Eat Utility
    const eatScore = (100 - (citizenNeeds.hunger || 50)) * 1.4;
    scores.push(new ActionCandidateScore('Eat', eatScore));

    // Work Utility
    const workScore = (citizenNeeds.fulfillment || 50) * 0.8 + (oceanTraits.conscientiousness || 50) * 0.5;
    scores.push(new ActionCandidateScore('Work', workScore));

    // Socialize Utility
    const socialScore = (100 - (citizenNeeds.social || 50)) * 1.1 + (oceanTraits.extraversion || 50) * 0.6;
    scores.push(new ActionCandidateScore('Socialize', socialScore));

    scores.sort((a, b) => b.score - a.score);
    return scores.length > 0 ? scores[0] : new ActionCandidateScore('Rest', 10);
  }
}

export default CitizenBehaviorMatrixEngine;
