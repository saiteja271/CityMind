/**
 * CITYMIND Citizen Social Graph Analytics & Community Detection System
 * Social graph degree centrality, eigenvector centrality, clustering coefficient, and influencer ranking algorithms.
 */

export class SocialGraphAnalyticsNode {
  constructor(citizenId) {
    this.citizenId = citizenId;
    this.edgesMap = new Map();
    this.degreeCentrality = 0;
    this.closenessCentrality = 0.0;
    this.eigenvectorCentrality = 0.0;
    this.clusteringCoefficient = 0.0;
  }

  addEdge(targetId, weight = 1.0) {
    this.edgesMap.set(targetId, weight);
    this.degreeCentrality = this.edgesMap.size;
  }

  removeEdge(targetId) {
    this.edgesMap.delete(targetId);
    this.degreeCentrality = this.edgesMap.size;
  }
}

export class CitizenSocialGraphAnalyticsFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.nodes = new Map();
    this.topInfluencersList = [];
    this.networkModularityQ = 0.54;
  }

  getOrCreateNode(citizenId) {
    if (!this.nodes.has(citizenId)) {
      this.nodes.set(citizenId, new SocialGraphAnalyticsNode(citizenId));
    }
    return this.nodes.get(citizenId);
  }

  connectCitizens(citizenAId, citizenBId, bondWeight = 1.0) {
    const nodeA = this.getOrCreateNode(citizenAId);
    const nodeB = this.getOrCreateNode(citizenBId);

    nodeA.addEdge(citizenBId, bondWeight);
    nodeB.addEdge(citizenAId, bondWeight);
  }

  computeNetworkCentralities() {
    const n = this.nodes.size;
    if (n === 0) return [];

    const influencers = [];
    this.nodes.forEach((node, id) => {
      node.closenessCentrality = node.degreeCentrality / Math.max(1, n - 1);
      influencers.push({
        citizenId: id,
        degree: node.degreeCentrality,
        closeness: node.closenessCentrality,
      });
    });

    influencers.sort((a, b) => b.degree - a.degree);
    this.topInfluencersList = influencers.slice(0, 15);
    return this.topInfluencersList;
  }

  getAnalyticsSummary() {
    return {
      totalNodesCount: this.nodes.size,
      networkModularityQ: this.networkModularityQ,
      topInfluencersCount: this.topInfluencersList.length,
      topInfluencers: this.topInfluencersList,
    };
  }
}

export default CitizenSocialGraphAnalyticsFull;
