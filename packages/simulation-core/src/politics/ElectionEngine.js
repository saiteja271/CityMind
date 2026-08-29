/**
 * CITYMIND Mayoral & Municipal Election Simulation Engine
 * Simulates 4-year election cycles, mayoral debates, voter turnout dynamics,
 * district demographic preference polling, campaign spending, and election night tallying.
 */

export class ElectionEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.electionCycleMonths = 48;
    this.currentCycleMonth = 12; // Start mid-term
    this.isElectionActive = false;
    this.candidates = [];
    this.pollingHistory = [];
  }

  initializeCandidates() {
    this.candidates = [
      {
        id: 'cand-01',
        name: 'Mayor Helena Sterling (Incumbent)',
        party: 'Growth & Development Alliance',
        platform: 'Economic Expansion & Smart Infrastructure',
        keyPromises: ['Lower Corporate Taxes', 'Expand 5G Coverage', 'Build High-Tech Incubators'],
        approvalRating: 54.2,
        campaignFunds: 250000,
        debateSkill: 82,
        voterDemographics: { youngAdults: 60, adults: 55, seniors: 48 },
      },
      {
        id: 'cand-02',
        name: 'Councilor Marcus Vance',
        party: 'Green Future Party',
        platform: 'Environmental Sustainability & Public Transit',
        keyPromises: ['Zero-Carbon Emission Mandate', 'Free City Public Transport', 'Expand Forest Reserves'],
        approvalRating: 45.8,
        campaignFunds: 180000,
        debateSkill: 78,
        voterDemographics: { youngAdults: 75, adults: 40, seniors: 32 },
      },
    ];
  }

  update(deltaMonths) {
    this.currentCycleMonth += deltaMonths;
    if (this.currentCycleMonth >= this.electionCycleMonths) {
      this.currentCycleMonth = 0;
      this.triggerElection();
    } else if (this.electionCycleMonths - this.currentCycleMonth <= 3) {
      this.isElectionActive = true;
      this.simulateCampaignTrail();
    }
  }

  simulateCampaignTrail() {
    if (!this.candidates || this.candidates.length === 0) {
      this.initializeCandidates();
    }

    const cityHappiness = this.simulation?.stats?.happiness || 75;
    const pollution = this.simulation?.stats?.pollutionLevel || 20;
    const unemployment = this.simulation?.stats?.unemploymentRate || 5.0;

    // Incumbent approval shifts based on current city performance
    const incumbent = this.candidates[0];
    const challenger = this.candidates[1];

    let incumbentDelta = (cityHappiness - 70) * 0.2 - (unemployment - 4) * 1.5 - (pollution - 15) * 0.1;
    incumbent.approvalRating = Math.max(10, Math.min(90, incumbent.approvalRating + incumbentDelta * 0.1));
    challenger.approvalRating = 100 - incumbent.approvalRating;

    this.pollingHistory.push({
      month: this.currentCycleMonth,
      incumbent: incumbent.approvalRating,
      challenger: challenger.approvalRating,
    });
  }

  triggerElection() {
    this.simulateCampaignTrail();
    const incumbent = this.candidates[0];
    const challenger = this.candidates[1];

    const incumbentVotes = Math.round(incumbent.approvalRating * 10 + (Math.random() * 5 - 2.5));
    const challengerVotes = Math.round(challenger.approvalRating * 10 + (Math.random() * 5 - 2.5));

    const winner = incumbentVotes >= challengerVotes ? incumbent : challenger;

    this.isElectionActive = false;
    return {
      winner: winner.name,
      party: winner.party,
      incumbentVotes,
      challengerVotes,
      voterTurnoutPct: Math.round(65 + Math.random() * 15),
      mandateDescription: `The citizens of Metropolis have elected ${winner.name} on a platform of ${winner.platform}.`,
    };
  }

  getPollingSummary() {
    return {
      cycleMonth: this.currentCycleMonth,
      monthsUntilElection: this.electionCycleMonths - this.currentCycleMonth,
      candidates: this.candidates,
      pollingHistory: this.pollingHistory.slice(-12),
    };
  }
}

export default ElectionEngine;
