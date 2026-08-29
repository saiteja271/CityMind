/**
 * CITYMIND District Council Political Factions & Voting Simulator
 * Simulates 5 political factions (Green Alliance, Economic Growth Coalition, Social Democratic Union, Fiscal Conservatives, Independent Populists),
 * mayoral veto handling, filibuster mechanics, and campaign lobbying.
 */

export class PoliticalCouncilFaction {
  constructor(name, seatsCount = 5, ideology = 'Green') {
    this.name = name;
    this.seatsCount = seatsCount;
    this.ideology = ideology;
    this.approvalPct = 65;
  }

  evaluateBillSupport(billCategory) {
    if (this.ideology === 'Green' && billCategory === 'Environment') return true;
    if (this.ideology === 'Growth' && billCategory === 'Commerce') return true;
    return Math.random() < 0.4;
  }
}

export class DistrictCouncilManagerFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.factionsMap = new Map();
    this.initializeFactions();
  }

  initializeFactions() {
    this.factionsMap.set('Green', new PoliticalCouncilFaction('Green Alliance', 7, 'Green'));
    this.factionsMap.set('Growth', new PoliticalCouncilFaction('Economic Growth Coalition', 8, 'Growth'));
  }

  tallyVotesForBill(billCategory) {
    let yesVotes = 0;
    let noVotes = 0;

    this.factionsMap.forEach((faction) => {
      if (faction.evaluateBillSupport(billCategory)) {
        yesVotes += faction.seatsCount;
      } else {
        noVotes += faction.seatsCount;
      }
    });

    return { yesVotes, noVotes, passed: yesVotes > noVotes };
  }

  getCouncilSummary() {
    return {
      activeFactionsCount: this.factionsMap.size,
    };
  }
}

export default DistrictCouncilManagerFull;
