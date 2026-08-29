/**
 * CITYMIND Multi-Stage Event Chain & Cascade Engine
 * Simulates cascading urban disasters and event chains (e.g., Earthquake -> Gas Pipe Rupture -> Industrial Explosion -> Power Blackout -> Hospital Crisis),
 * branching decision trees for mayors, citizen panic dynamics, and emergency news broadcasts.
 */

export class EventNode {
  constructor(id, title, category, severity, description) {
    this.id = id;
    this.title = title;
    this.category = category; // 'Disaster', 'Economic', 'Social', 'Technical', 'Environmental'
    this.severity = severity; // 'Minor', 'Moderate', 'Severe', 'Catastrophic'
    this.description = description;
    this.nextEvents = []; // Array of { eventId, probability, delayTicks }
    this.mayorChoices = []; // Array of { label, cost, approvalImpact, mitigationPct }
  }
}

export class EventChainEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.activeChains = [];
    this.eventHistory = [];
    this.newsHeadlines = [];
    this.initializeEventDatabase();
  }

  initializeEventDatabase() {
    this.eventNodes = new Map();

    const node1 = new EventNode(
      'evt_earthquake_7',
      'Magnitude 7.2 Earthquake Strike',
      'Disaster',
      'Catastrophic',
      'Seismic fault line rupture causes structural damage to roads, power substations, and aging water pipes.'
    );
    node1.nextEvents.push(
      { eventId: 'evt_gas_pipe_rupture', probability: 0.85, delayTicks: 10 },
      { eventId: 'evt_power_blackout_cascade', probability: 0.70, delayTicks: 20 }
    );
    node1.mayorChoices.push(
      { label: 'Declare State of Emergency (-$50,000)', cost: 50000, approvalImpact: 10, mitigationPct: 40 },
      { label: 'Standard Local Response', cost: 10000, approvalImpact: -5, mitigationPct: 15 }
    );
    this.eventNodes.set(node1.id, node1);

    const node2 = new EventNode(
      'evt_gas_pipe_rupture',
      'Industrial Gas Pipeline Breach',
      'Technical',
      'Severe',
      'Ruptured natural gas pipe ignites near South Heavy Industrial District.'
    );
    node2.nextEvents.push({ eventId: 'evt_chemical_firestorm', probability: 0.60, delayTicks: 15 });
    this.eventNodes.set(node2.id, node2);

    const node3 = new EventNode(
      'evt_chemical_firestorm',
      'Chemical Firestorm & Toxic Cloud',
      'Environmental',
      'Catastrophic',
      'Burning chemical tanks release toxic smog blowing toward Residential Sector 2.'
    );
    this.eventNodes.set(node3.id, node3);

    const node4 = new EventNode(
      'evt_power_blackout_cascade',
      'Substation 3 Overload & Citywide Blackout',
      'Technical',
      'Severe',
      'Damaged transmission lines cause tripping cascade across 80% of city grid.'
    );
    this.eventNodes.set(node4.id, node4);
  }

  triggerChain(rootEventId) {
    const rootNode = this.eventNodes.get(rootEventId);
    if (!rootNode) return null;

    const chain = {
      chainId: `chain-${Date.now()}`,
      rootEvent: rootNode,
      activeNodes: [rootNode],
      startTick: Date.now(),
      status: 'Active',
    };

    this.activeChains.push(chain);
    this.eventHistory.push(rootNode);

    const headline = `⚡ BREAKING NEWS: ${rootNode.title}! ${rootNode.description}`;
    this.newsHeadlines.unshift({ text: headline, time: Date.now() });
    if (this.newsHeadlines.length > 30) this.newsHeadlines.pop();

    if (this.simulation?.addNotification) {
      this.simulation.addNotification({
        type: 'error',
        title: rootNode.title,
        message: rootNode.description,
      });
    }

    return chain;
  }

  update(deltaTicks) {
    this.activeChains.forEach((chain) => {
      if (chain.status !== 'Active') return;

      chain.activeNodes.forEach((node) => {
        node.nextEvents.forEach((next) => {
          if (Math.random() < next.probability * 0.1) {
            const nextNode = this.eventNodes.get(next.eventId);
            if (nextNode && !chain.activeNodes.includes(nextNode)) {
              chain.activeNodes.push(nextNode);
              this.newsHeadlines.unshift({
                text: `⚠️ CASCADE ALERT: ${nextNode.title}! Triggered by ${node.title}.`,
                time: Date.now(),
              });
            }
          }
        });
      });
    });
  }

  getNewsTicker() {
    return this.newsHeadlines.slice(0, 10);
  }
}

export default EventChainEngine;
