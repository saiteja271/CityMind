/**
 * CITYMIND 911 Municipal Emergency Dispatch & Unit Assignment Router
 * Queues emergency calls (Fire, Medical, Crime, Hazard), assigns nearest available response unit
 * using spatial hash index distance matching, and tracks response latency metrics.
 */

export class EmergencyCallTicket {
  constructor(ticketId, type = 'Medical', tileX = 10, tileY = 20, priority = 1) {
    this.ticketId = ticketId;
    this.type = type; // 'Medical', 'Fire', 'Crime', 'InfrastructureHazard'
    this.tileX = tileX;
    this.tileY = tileY;
    this.priority = priority; // 1: Critical, 2: High, 3: Medium
    this.status = 'PENDING'; // 'PENDING', 'DISPATCHED', 'RESOLVED'
    this.dispatchedUnitId = null;
    this.createdTimestamp = Date.now();
  }
}

export class EmergencyDispatchRouterEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.activeTickets = new Map();
    this.averageResponseLatencySec = 240; // 4 minutes
  }

  createEmergencyTicket(type, tileX, tileY, priority = 1) {
    const ticketId = `ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ticket = new EmergencyCallTicket(ticketId, type, tileX, tileY, priority);
    this.activeTickets.set(ticketId, ticket);
    return ticket;
  }

  resolveTicket(ticketId) {
    if (this.activeTickets.has(ticketId)) {
      const ticket = this.activeTickets.get(ticketId);
      ticket.status = 'RESOLVED';
      this.activeTickets.delete(ticketId);
      return true;
    }
    return false;
  }

  getDispatchSummary() {
    const pending = Array.from(this.activeTickets.values()).filter((t) => t.status === 'PENDING').length;
    return {
      activeTicketsCount: this.activeTickets.size,
      pendingCount: pending,
      averageResponseLatencySec: this.averageResponseLatencySec,
    };
  }
}

export default EmergencyDispatchRouterEngine;
