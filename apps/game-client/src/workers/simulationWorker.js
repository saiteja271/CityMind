/**
 * simulationWorker.js
 * Web Worker for offloading heavy simulation batch processing off the main thread.
 *
 * Handles computationally intensive tasks:
 *  - Citizen batch AI updates (utility scoring, need resolution)
 *  - Pathfinding batches (A* for citizen routing)
 *  - Economy tick (tax collection, budget calculations)
 *  - Pollution diffusion (cellular automata step)
 *
 * Communication protocol:
 *   Main → Worker: { type: string, payload: object, requestId: string }
 *   Worker → Main: { type: 'result' | 'error', requestId: string, result?: any, error?: string }
 */

// ─── Message dispatcher ───────────────────────────────────────────────────────

self.onmessage = function (event) {
  const { type, payload, requestId } = event.data ?? {};

  try {
    switch (type) {
      case 'CITIZEN_BATCH_UPDATE':
        handleCitizenBatch(payload, requestId);
        break;
      case 'ECONOMY_TICK':
        handleEconomyTick(payload, requestId);
        break;
      case 'POLLUTION_DIFFUSION':
        handlePollutionDiffusion(payload, requestId);
        break;
      case 'PATHFIND_BATCH':
        handlePathfindBatch(payload, requestId);
        break;
      case 'PING':
        self.postMessage({ type: 'result', requestId, result: { pong: true } });
        break;
      default:
        self.postMessage({ type: 'error', requestId, error: `Unknown message type: "${type}"` });
    }
  } catch (err) {
    self.postMessage({ type: 'error', requestId, error: err.message });
  }
};

// ─── Citizen batch update ─────────────────────────────────────────────────────

/**
 * Process a batch of citizens: update needs, resolve actions, age.
 * @param {{ citizens: object[], deltaMs: number, worldSnapshot: object }} payload
 */
function handleCitizenBatch({ citizens = [], deltaMs = 0, worldSnapshot = {} }) {
  const results = citizens.map((citizen) => updateCitizen(citizen, deltaMs, worldSnapshot));
  self.postMessage({ type: 'result', requestId: arguments[1], result: { citizens: results } });
}

function handleCitizenBatch(payload, requestId) {
  const { citizens = [], deltaMs = 0, worldSnapshot = {} } = payload;
  const results = citizens.map((c) => updateCitizen(c, deltaMs, worldSnapshot));
  self.postMessage({ type: 'result', requestId, result: { citizens: results } });
}

/**
 * Simplified citizen update — mirrors the main-thread CitizenAgent logic.
 * @param {object} citizen
 * @param {number} deltaMs
 * @param {object} world
 * @returns {object} Updated citizen snapshot
 */
function updateCitizen(citizen, deltaMs, world) {
  const c = { ...citizen };
  const dtSeconds = deltaMs / 1000;

  // ─── Need decay ───────────────────────────────────────────────────────────
  c.needs = { ...c.needs };
  c.needs.hunger = Math.min(100, (c.needs.hunger ?? 0) + dtSeconds * 0.5);
  c.needs.rest = Math.min(100, (c.needs.rest ?? 0) + dtSeconds * 0.3);
  c.needs.social = Math.min(100, (c.needs.social ?? 0) + dtSeconds * 0.1);
  c.needs.safety = Math.max(0, (c.needs.safety ?? 100) - dtSeconds * 0.05);

  // ─── Critical need handling ───────────────────────────────────────────────
  if (c.needs.hunger >= 80 && c.currentAction !== 'eating') {
    c.currentAction = 'seeking_food';
    c.actionSince = Date.now();
  } else if (c.needs.rest >= 85 && c.currentAction !== 'sleeping') {
    c.currentAction = 'going_home';
    c.actionSince = Date.now();
  }

  // ─── Happiness recalc (simplified) ───────────────────────────────────────
  const needSatisfaction = 100 - (c.needs.hunger * 0.3 + c.needs.rest * 0.3 + c.needs.social * 0.2 + (100 - c.needs.safety) * 0.2);
  const envFactor = world.pollution ? Math.max(0, 1 - world.pollution / 200) : 1;
  c.happiness = Math.round(Math.min(100, Math.max(0, needSatisfaction * envFactor)));

  // ─── Aging ────────────────────────────────────────────────────────────────
  c._ageTick = (c._ageTick ?? 0) + deltaMs;
  if (c._ageTick > 86_400_000) { // once per simulated day
    c.age = (c.age ?? 25) + (1 / 365);
    c._ageTick = 0;
  }

  return c;
}

// ─── Economy tick ─────────────────────────────────────────────────────────────

function handleEconomyTick(payload, requestId) {
  const { budget, buildings = [], citizens = [], taxRates = {}, deltaMonths = 0 } = payload;

  let taxRevenue = 0;
  let maintenanceCosts = 0;

  for (const building of buildings) {
    if (building.taxable) {
      const rate = taxRates[building.zone] ?? taxRates.default ?? 0.08;
      taxRevenue += (building.propertyValue ?? 0) * rate * deltaMonths;
    }
    maintenanceCosts += (building.maintenanceCost ?? 0) * deltaMonths;
  }

  // Income tax from employed citizens
  const incomeTaxRate = taxRates.income ?? 0.2;
  for (const citizen of citizens) {
    if (citizen.employed && citizen.income > 0) {
      taxRevenue += citizen.income * incomeTaxRate * deltaMonths;
    }
  }

  const netChange = taxRevenue - maintenanceCosts;
  const newBalance = (budget.balance ?? 0) + netChange;

  self.postMessage({
    type: 'result',
    requestId,
    result: {
      taxRevenue: Math.round(taxRevenue),
      maintenanceCosts: Math.round(maintenanceCosts),
      netChange: Math.round(netChange),
      newBalance: Math.round(newBalance),
    },
  });
}

// ─── Pollution diffusion (cellular automata) ──────────────────────────────────

/**
 * Advance pollution grid by one diffusion step using a simple 5-point stencil.
 * @param {{ grid: number[][], decayRate: number, diffusionRate: number }} payload
 */
function handlePollutionDiffusion(payload, requestId) {
  const { grid, decayRate = 0.02, diffusionRate = 0.1 } = payload;

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const next = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const v = grid[r][c];
      // Decay
      let newV = v * (1 - decayRate);
      // Diffuse from neighbors
      if (r > 0) newV += grid[r - 1][c] * diffusionRate * 0.25;
      if (r < rows - 1) newV += grid[r + 1][c] * diffusionRate * 0.25;
      if (c > 0) newV += grid[r][c - 1] * diffusionRate * 0.25;
      if (c < cols - 1) newV += grid[r][c + 1] * diffusionRate * 0.25;
      return Math.max(0, Math.min(100, newV));
    })
  );

  self.postMessage({ type: 'result', requestId, result: { grid: next } });
}

// ─── Pathfinding batch (simplified BFS) ──────────────────────────────────────

/**
 * Process multiple pathfinding requests using BFS on a road adjacency map.
 * @param {{ requests: Array<{id, startCol, startRow, endCol, endRow}>, roadGraph: object }} payload
 */
function handlePathfindBatch(payload, requestId) {
  const { requests = [], roadGraph = {} } = payload;

  const results = requests.map((req) => {
    const path = bfsFindPath(roadGraph, req.startCol, req.startRow, req.endCol, req.endRow);
    return { id: req.id, path };
  });

  self.postMessage({ type: 'result', requestId, result: { paths: results } });
}

function bfsFindPath(graph, sc, sr, ec, er) {
  const startKey = `${sc},${sr}`;
  const endKey = `${ec},${er}`;
  if (startKey === endKey) return [{ col: sc, row: sr }];

  const visited = new Set([startKey]);
  const queue = [[startKey, [{ col: sc, row: sr }]]];

  while (queue.length > 0) {
    const [key, path] = queue.shift();
    const neighbors = graph[key] ?? [];
    for (const neighborKey of neighbors) {
      if (!visited.has(neighborKey)) {
        const [nc, nr] = neighborKey.split(',').map(Number);
        const newPath = [...path, { col: nc, row: nr }];
        if (neighborKey === endKey) return newPath;
        visited.add(neighborKey);
        queue.push([neighborKey, newPath]);
      }
    }
  }

  return null; // No path found
}
