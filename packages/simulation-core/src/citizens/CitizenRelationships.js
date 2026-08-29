/**
 * CITYMIND Citizen Social Relationships & Network Graph Engine
 * Simulates citizen friendships, romantic partnerships, marriages, divorces,
 * rivalries/feuds, family bonds, and mutual support networks during city crises.
 */

export class RelationshipEdge {
  constructor(sourceId, targetId, relationType = 'friendship', affinity = 50) {
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.relationType = relationType; // 'friendship', 'romantic', 'spouse', 'parent', 'child', 'colleague', 'rival'
    this.affinity = affinity; // -100 to +100
    this.interactionHistory = [];
    this.establishedTick = Date.now();
  }

  interact(deltaAffinity, note) {
    this.affinity = Math.max(-100, Math.min(100, this.affinity + deltaAffinity));
    this.interactionHistory.push({ deltaAffinity, note, timestamp: Date.now() });
    if (this.interactionHistory.length > 50) {
      this.interactionHistory = this.interactionHistory.slice(-25);
    }
  }

  isStrongBond() {
    return this.affinity >= 75;
  }

  isHostile() {
    return this.affinity <= -50;
  }
}

export class CitizenRelationshipsGraph {
  constructor() {
    this.adjacencyMap = new Map(); // citizenId -> Map<targetId, RelationshipEdge>
  }

  addOrUpdateRelation(sourceId, targetId, relationType, deltaAffinity = 10, note = 'Social interaction') {
    if (!this.adjacencyMap.has(sourceId)) {
      this.adjacencyMap.set(sourceId, new Map());
    }

    const sourceMap = this.adjacencyMap.get(sourceId);
    if (sourceMap.has(targetId)) {
      const edge = sourceMap.get(targetId);
      edge.interact(deltaAffinity, note);
    } else {
      const edge = new RelationshipEdge(sourceId, targetId, relationType, 50 + deltaAffinity);
      sourceMap.set(targetId, edge);
    }

    // Mirror relationship
    if (!this.adjacencyMap.has(targetId)) {
      this.adjacencyMap.set(targetId, new Map());
    }
    const targetMap = this.adjacencyMap.get(targetId);
    if (!targetMap.has(sourceId)) {
      const mirrorEdge = new RelationshipEdge(targetId, sourceId, relationType, 50 + deltaAffinity);
      targetMap.set(sourceId, mirrorEdge);
    } else {
      targetMap.get(sourceId).interact(deltaAffinity, note);
    }
  }

  getFriends(citizenId) {
    const map = this.adjacencyMap.get(citizenId);
    if (!map) return [];
    const friends = [];
    map.forEach((edge) => {
      if (edge.affinity >= 40 && edge.relationType !== 'rival') {
        friends.push({ targetId: edge.targetId, relationType: edge.relationType, affinity: edge.affinity });
      }
    });
    return friends;
  }

  getFamily(citizenId) {
    const map = this.adjacencyMap.get(citizenId);
    if (!map) return [];
    const family = [];
    map.forEach((edge) => {
      if (['parent', 'child', 'spouse'].includes(edge.relationType)) {
        family.push({ targetId: edge.targetId, relationType: edge.relationType, affinity: edge.affinity });
      }
    });
    return family;
  }

  processMarriageMatchmaking(citizensList) {
    const singleAdults = citizensList.filter((c) => c.age >= 21 && c.age <= 45 && (!c.family || !c.family.some((f) => f.relation === 'Partner')));
    if (singleAdults.length < 2) return [];

    const newMarriages = [];
    for (let i = 0; i < singleAdults.length - 1; i += 2) {
      const c1 = singleAdults[i];
      const c2 = singleAdults[i + 1];

      this.addOrUpdateRelation(c1.id, c2.id, 'spouse', 40, 'Marriage union');
      newMarriages.push({ partner1: c1.id, partner2: c2.id });
    }
    return newMarriages;
  }

  getGraphSummary() {
    let totalNodes = this.adjacencyMap.size;
    let totalEdges = 0;
    this.adjacencyMap.forEach((map) => {
      totalEdges += map.size;
    });

    return {
      totalCitizensInGraph: totalNodes,
      totalSocialConnections: Math.round(totalEdges / 2),
      averageConnectionsPerCitizen: totalNodes > 0 ? (totalEdges / totalNodes).toFixed(1) : 0,
    };
  }
}

export default CitizenRelationshipsGraph;
