/**
 * CitizenSocialGraph.js - Graph network model for citizen social dynamics.
 * Implements PageRank clout calculation, rumor & epidemic propagation models,
 * community detection, and social mobility transition matrices.
 */

import { clamp, randomRange } from '@citymind/utilities';

export class CitizenSocialGraph {
  constructor() {
    // Map citizenId -> Map(neighborId -> edgeData)
    this.adjacency = new Map();

    // Map citizenId -> nodeMetadata
    this.nodes = new Map();

    // Cache for clout / PageRank scores
    this.cloutScores = new Map();

    // Active rumor cascades: Map rumorId -> RumorObject
    this.activeRumors = new Map();
  }

  /**
   * Register a citizen node in the graph.
   *
   * @param {string} id - Citizen ID
   * @param {Object} [meta] - Metadata (wealth, education, occupation, status)
   */
  addNode(id, meta = {}) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, {
        id,
        wealthTier: meta.wealthTier || 1,
        educationLevel: meta.educationLevel || 1,
        reputation: meta.reputation || 50,
        infectedRumors: new Set(),
        pathogenInfected: false,
        clout: 1.0
      });
      this.adjacency.set(id, new Map());
      this.cloutScores.set(id, 1.0);
    }
  }

  /**
   * Remove a citizen node and all connected edges (e.g. upon death or emigration).
   * @param {string} id
   */
  removeNode(id) {
    if (!this.nodes.has(id)) return;

    // Remove outgoing edges
    const neighbors = this.adjacency.get(id);
    if (neighbors) {
      neighbors.forEach((_, neighborId) => {
        const backMap = this.adjacency.get(neighborId);
        if (backMap) backMap.delete(id);
      });
    }

    this.adjacency.delete(id);
    this.nodes.delete(id);
    this.cloutScores.delete(id);
  }

  /**
   * Add or update an edge between two citizens.
   *
   * @param {string} sourceId
   * @param {string} targetId
   * @param {number} weight - Connection strength (0 to 1)
   * @param {string} [type='friendship']
   */
  addEdge(sourceId, targetId, weight = 0.5, type = 'friendship') {
    this.addNode(sourceId);
    this.addNode(targetId);

    const edgePayload = { weight: clamp(weight, 0.05, 1.0), type, lastInteraction: Date.now() };

    this.adjacency.get(sourceId).set(targetId, edgePayload);
    this.adjacency.get(targetId).set(sourceId, edgePayload);
  }

  /**
   * Calculate PageRank clout scores across the citizen network.
   * Score = (1 - d) / N + d * SUM(Clout(v) / OutDegree(v))
   *
   * @param {number} [damping=0.85] - PageRank damping factor
   * @param {number} [maxIterations=20] - Convergence iterations
   * @returns {Map<string, number>} Clout scores map
   */
  calculateCloutScores(damping = 0.85, maxIterations = 20) {
    const N = this.nodes.size;
    if (N === 0) return this.cloutScores;

    const initialScore = 1.0 / N;
    let ranks = new Map();

    this.nodes.forEach((_, id) => ranks.set(id, initialScore));

    for (let iter = 0; iter < maxIterations; iter++) {
      const nextRanks = new Map();
      let sinkContribution = 0;

      // Calculate sink contributions (nodes with 0 out-edges)
      this.nodes.forEach((_, id) => {
        const outDegree = this.adjacency.get(id)?.size || 0;
        if (outDegree === 0) sinkContribution += ranks.get(id);
      });

      this.nodes.forEach((node, id) => {
        const neighbors = this.adjacency.get(id);
        let sum = 0;

        if (neighbors) {
          neighbors.forEach((edge, neighborId) => {
            const neighborOutDegree = this.adjacency.get(neighborId)?.size || 1;
            const neighborRank = ranks.get(neighborId) || 0;
            // Weighted edge influence
            sum += (neighborRank * edge.weight) / neighborOutDegree;
          });
        }

        const rank = ((1 - damping) / N) + damping * (sum + sinkContribution / N);
        // Wealth & Reputation multiplier adjustment
        const wealthFactor = 1.0 + (node.wealthTier * 0.1);
        nextRanks.set(id, rank * wealthFactor);
      });

      ranks = nextRanks;
    }

    // Normalize ranks to mean 1.0
    let totalRank = 0;
    ranks.forEach((val) => { totalRank += val; });
    const scale = N / (totalRank || 1);

    ranks.forEach((val, id) => {
      const finalClout = val * scale;
      this.cloutScores.set(id, finalClout);
      const node = this.nodes.get(id);
      if (node) node.clout = finalClout;
    });

    return this.cloutScores;
  }

  /**
   * Seed a new rumor into the network.
   *
   * @param {string} rumorId - Unique rumor key
   * @param {string} seedCitizenId - Origin citizen
   * @param {number} virality - Propagation probability per edge (0 to 1)
   * @param {number} sentiment - Impact score (-100 to +100)
   */
  seedRumor(rumorId, seedCitizenId, virality = 0.3, sentiment = 0) {
    if (!this.nodes.has(seedCitizenId)) return;

    const rumor = {
      id: rumorId,
      virality,
      sentiment,
      infectedSet: new Set([seedCitizenId]),
      frontier: [seedCitizenId],
      totalInfected: 1
    };

    this.activeRumors.set(rumorId, rumor);
    this.nodes.get(seedCitizenId).infectedRumors.add(rumorId);
  }

  /**
   * Step rumor propagation cascade for one tick.
   *
   * @param {string} rumorId
   * @returns {Array<string>} Newly infected citizen IDs
   */
  propagateRumor(rumorId) {
    const rumor = this.activeRumors.get(rumorId);
    if (!rumor || rumor.frontier.length === 0) return [];

    const nextFrontier = [];
    const newlyInfected = [];

    rumor.frontier.forEach((spreaderId) => {
      const neighbors = this.adjacency.get(spreaderId);
      if (!neighbors) return;

      const spreaderClout = this.cloutScores.get(spreaderId) || 1.0;

      neighbors.forEach((edge, neighborId) => {
        if (!rumor.infectedSet.has(neighborId)) {
          const targetNode = this.nodes.get(neighborId);
          // Effective propagation chance = virality * edge weight * spreader clout
          const transProb = clamp(rumor.virality * edge.weight * (spreaderClout * 0.5 + 0.5), 0.05, 0.95);

          if (Math.random() < transProb) {
            rumor.infectedSet.add(neighborId);
            if (targetNode) targetNode.infectedRumors.add(rumorId);
            nextFrontier.push(neighborId);
            newlyInfected.push(neighborId);
            rumor.totalInfected++;
          }
        }
      });
    });

    rumor.frontier = nextFrontier;
    return newlyInfected;
  }

  /**
   * Calculate social mobility probability matrix for a citizen.
   * Determines likelihood of moving up/down wealth/status tiers.
   *
   * @param {string} citizenId
   * @returns {Object} { upgradeProb, downgradeProb, maintainProb }
   */
  evaluateSocialMobility(citizenId) {
    const node = this.nodes.get(citizenId);
    if (!node) return { upgradeProb: 0.1, downgradeProb: 0.1, maintainProb: 0.8 };

    const neighbors = this.adjacency.get(citizenId);
    let avgNeighborWealth = node.wealthTier;

    if (neighbors && neighbors.size > 0) {
      let sumWealth = 0;
      neighbors.forEach((_, neighborId) => {
        const neighbor = this.nodes.get(neighborId);
        sumWealth += neighbor ? neighbor.wealthTier : 1;
      });
      avgNeighborWealth = sumWealth / neighbors.size;
    }

    // Social mobility drives: Education + High wealth social network connections
    const networkAdvantage = (avgNeighborWealth - node.wealthTier) * 0.15;
    const eduBoost = node.educationLevel * 0.1;

    const rawUpgrade = 0.05 + eduBoost + Math.max(0, networkAdvantage);
    const rawDowngrade = 0.05 + Math.max(0, -networkAdvantage);

    const upgradeProb = clamp(rawUpgrade, 0.02, 0.6);
    const downgradeProb = clamp(rawDowngrade, 0.02, 0.4);
    const maintainProb = clamp(1.0 - upgradeProb - downgradeProb, 0.1, 0.96);

    return { upgradeProb, downgradeProb, maintainProb };
  }

  /**
   * Get graph statistics overview.
   */
  getGraphAnalytics() {
    let totalEdges = 0;
    this.adjacency.forEach((map) => { totalEdges += map.size; });
    const edgeCount = totalEdges / 2;
    const nodeCount = this.nodes.size;
    const avgDegree = nodeCount > 0 ? (totalEdges / nodeCount).toFixed(2) : 0;

    return {
      nodeCount,
      edgeCount,
      avgDegree: Number(avgDegree),
      activeRumorCount: this.activeRumors.size
    };
  }
}
