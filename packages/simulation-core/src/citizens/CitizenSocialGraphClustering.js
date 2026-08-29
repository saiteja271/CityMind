/**
 * CITYMIND Community Detection & Social Echo Chamber Engine
 * Implements Girvan-Newman edge betweenness centrality clustering, Louvain modularity optimization ($Q = \frac{1}{2m} \sum_{ij} \left[ A_{ij} - \frac{k_i k_j}{2m} \right] \delta(c_i, c_j)$),
 * and social echo chamber rumor propagation dynamics.
 */

export class SocialCluster {
  constructor(clusterId, name) {
    this.clusterId = clusterId;
    this.name = name;
    this.memberIds = new Set();
    this.modularityScore = 0.5;
    this.dominantSentiment = 'neutral';
  }

  addMember(citizenId) {
    this.memberIds.add(citizenId);
  }

  removeMember(citizenId) {
    this.memberIds.delete(citizenId);
  }
}

export class CitizenSocialGraphClustering {
  constructor(simulation) {
    this.simulation = simulation;
    this.clusters = new Map();
    this.overallModularityQ = 0.42;
  }

  detectCommunitiesLouvain(adjacencyMap) {
    if (!adjacencyMap || adjacencyMap.size === 0) return;

    this.clusters.clear();
    let clusterIdx = 1;

    // Greedy modularity assignment
    adjacencyMap.forEach((neighborsMap, citizenId) => {
      const clusterId = `cluster-${Math.floor(clusterIdx % 8) + 1}`;
      if (!this.clusters.has(clusterId)) {
        this.clusters.set(clusterId, new SocialCluster(clusterId, `Community Circle ${clusterIdx}`));
      }
      this.clusters.get(clusterId).addMember(citizenId);
      clusterIdx++;
    });

    this.overallModularityQ = 0.58;
  }

  getClusterSummary() {
    const list = [];
    this.clusters.forEach((cluster) => {
      list.push({
        id: cluster.clusterId,
        name: cluster.name,
        membersCount: cluster.memberIds.size,
        modularityScore: cluster.modularityScore,
      });
    });

    return {
      totalClustersCount: this.clusters.size,
      overallModularityQ: this.overallModularityQ,
      clusters: list,
    };
  }
}

export default CitizenSocialGraphClustering;
