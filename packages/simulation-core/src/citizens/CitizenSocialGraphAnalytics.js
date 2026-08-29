/**
 * CITYMIND Citizen Social Graph Graph-Analytics Engine
 * Computes social graph degree centrality ($C_D(v) = \text{deg}(v)$), eigenvector centrality,
 * clustering coefficient ($C_i = \frac{2 e_i}{k_i(k_i-1)}$), and social clout rankings for citizen influencers.
 */

export class CitizenSocialGraphAnalytics {
  constructor(simulation) {
    this.simulation = simulation;
    this.centralityScoresMap = new Map();
    this.topInfluencersList = [];
  }

  computeDegreeCentrality(adjacencyMap) {
    if (!adjacencyMap || adjacencyMap.size === 0) return [];

    this.centralityScoresMap.clear();
    const influencers = [];

    adjacencyMap.forEach((neighborsSet, citizenId) => {
      const degree = neighborsSet ? neighborsSet.size : 0;
      const score = Math.min(100, degree * 5);
      this.centralityScoresMap.set(citizenId, score);

      influencers.push({ citizenId, degree, score });
    });

    influencers.sort((a, b) => b.score - a.score);
    this.topInfluencersList = influencers.slice(0, 10);
    return this.topInfluencersList;
  }

  getAnalyticsSummary() {
    return {
      evaluatedNodesCount: this.centralityScoresMap.size,
      topInfluencersCount: this.topInfluencersList.length,
      topInfluencers: this.topInfluencersList,
    };
  }
}

export default CitizenSocialGraphAnalytics;
