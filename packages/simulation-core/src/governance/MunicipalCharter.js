/**
 * CITYMIND Municipal Charter & Civic Governance Engine
 * Simulates city constitution parameters, mayoral executive decrees, council voting quorums,
 * public citizen referendums, judicial review of local ordinances, and civil rights index evaluations.
 */

export class ExecutiveDecree {
  constructor(id, title, category, emergencyCost, durationMonths, effectSummary) {
    this.id = id;
    this.title = title;
    this.category = category; // 'Emergency', 'Economic', 'PublicSafety', 'Environment'
    this.emergencyCost = emergencyCost;
    this.durationMonths = durationMonths;
    this.effectSummary = effectSummary;
    this.enactedTick = Date.now();
    this.isActive = true;
  }
}

export class PublicReferendum {
  constructor(id, questionText, minVoterTurnoutPct = 50, requiredPassPct = 60) {
    this.id = id;
    this.questionText = questionText;
    this.minVoterTurnoutPct = minVoterTurnoutPct;
    this.requiredPassPct = requiredPassPct;
    this.votesFor = 0;
    this.votesAgainst = 0;
    this.isPassed = false;
    this.isTallied = false;
  }

  tallyVotes(citizensList) {
    if (this.isTallied || !citizensList || citizensList.length === 0) return;

    let totalVoters = 0;
    let yesVotes = 0;

    citizensList.forEach((citizen) => {
      if (citizen.age >= 18) {
        totalVoters++;
        const happiness = citizen.happiness || 75;
        const ocean = citizen.ocean || { agreeableness: 50, openness: 50 };

        // Voting decision model
        const probabilityYes = (happiness / 100) * 0.6 + (ocean.openness / 100) * 0.4;
        if (Math.random() < probabilityYes) {
          yesVotes++;
        }
      }
    });

    this.votesFor = yesVotes;
    this.votesAgainst = totalVoters - yesVotes;

    const turnoutPct = (totalVoters / citizensList.length) * 100;
    const passPct = totalVoters > 0 ? (yesVotes / totalVoters) * 100 : 0;

    if (turnoutPct >= this.minVoterTurnoutPct && passPct >= this.requiredPassPct) {
      this.isPassed = true;
    }
    this.isTallied = true;
  }
}

export class MunicipalCharterEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.activeDecrees = [];
    this.referendumsHistory = [];
    this.civilRightsIndex = 88; // 0 to 100
    this.charterAmendmentCount = 0;
  }

  issueExecutiveDecree(title, category, cost, durationMonths, summary) {
    const id = `decree-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const decree = new ExecutiveDecree(id, title, category, cost, durationMonths, summary);

    if (this.simulation?.stats && this.simulation.stats.treasury >= cost) {
      this.simulation.stats.treasury -= cost;
      this.activeDecrees.push(decree);
      return { success: true, decree };
    }
    return { success: false, reason: 'Insufficient treasury funds' };
  }

  launchPublicReferendum(questionText) {
    const id = `ref-${Date.now()}`;
    const ref = new PublicReferendum(id, questionText);

    const citizens = this.simulation?.citizens?.citizensList || [];
    ref.tallyVotes(citizens);
    this.referendumsHistory.push(ref);
    return ref;
  }

  update(deltaMonths) {
    // Decay expired executive decrees
    this.activeDecrees = this.activeDecrees.filter((decree) => {
      const ageMonths = (Date.now() - decree.enactedTick) / (1000 * 60 * 60 * 24 * 30);
      return ageMonths < decree.durationMonths;
    });

    // Evaluate civil rights index based on active ordinances & happiness
    const happiness = this.simulation?.stats?.happiness || 78;
    this.civilRightsIndex = Math.min(100, Math.max(40, Math.round(happiness * 0.9 + 10)));
  }

  getGovernanceSummary() {
    return {
      civilRightsIndex: this.civilRightsIndex,
      activeDecreesCount: this.activeDecrees.length,
      passedReferendumsCount: this.referendumsHistory.filter((r) => r.isPassed).length,
      activeDecrees: this.activeDecrees,
    };
  }
}

export default MunicipalCharterEngine;
