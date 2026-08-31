/**
 * world.test.js
 * Unit tests for world/map tile system — terrain generation,
 * tile validity, road graph connectivity, and building placement rules.
 */
'use strict';

// ─── Inline tile helpers ──────────────────────────────────────────────────────

const TERRAIN_TYPES = ['grass', 'water', 'forest', 'rock'];

function isValidTerrain(type) {
  return TERRAIN_TYPES.includes(type);
}

function isBuildable(terrain) {
  return terrain === 'grass' || terrain === 'forest';
}

function tileKey(col, row) {
  return `${col},${row}`;
}

function getNeighbors(col, row, maxCols, maxRows) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  return dirs
    .map(([dc, dr]) => ({ col: col + dc, row: row + dr }))
    .filter(({ col: c, row: r }) => c >= 0 && c < maxCols && r >= 0 && r < maxRows);
}

function generateFlatMap(cols, rows, terrain = 'grass') {
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({ col: c, row: r, terrain, building: null, road: false });
    }
  }
  return tiles;
}

// ─── Road graph connectivity BFS ─────────────────────────────────────────────

function buildRoadGraph(tiles) {
  const roadSet = new Set(
    tiles.filter((t) => t.road).map((t) => tileKey(t.col, t.row))
  );
  const graph = {};
  const cols = Math.max(...tiles.map((t) => t.col)) + 1;
  const rows = Math.max(...tiles.map((t) => t.row)) + 1;

  for (const tile of tiles.filter((t) => t.road)) {
    const key = tileKey(tile.col, tile.row);
    graph[key] = getNeighbors(tile.col, tile.row, cols, rows)
      .map((n) => tileKey(n.col, n.row))
      .filter((k) => roadSet.has(k));
  }
  return graph;
}

function isRoadConnected(graph, fromKey, toKey) {
  if (fromKey === toKey) return true;
  const visited = new Set([fromKey]);
  const queue = [fromKey];
  while (queue.length) {
    const cur = queue.shift();
    for (const neighbor of graph[cur] ?? []) {
      if (neighbor === toKey) return true;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Tile terrain system', () => {
  test('all terrain types are valid', () => {
    for (const t of TERRAIN_TYPES) expect(isValidTerrain(t)).toBe(true);
  });

  test('unknown terrain is invalid', () => {
    expect(isValidTerrain('sand')).toBe(false);
    expect(isValidTerrain('')).toBe(false);
  });

  test('grass and forest are buildable', () => {
    expect(isBuildable('grass')).toBe(true);
    expect(isBuildable('forest')).toBe(true);
  });

  test('water and rock are not buildable', () => {
    expect(isBuildable('water')).toBe(false);
    expect(isBuildable('rock')).toBe(false);
  });
});

describe('Map generation', () => {
  test('flat map has correct tile count', () => {
    const map = generateFlatMap(10, 10);
    expect(map.length).toBe(100);
  });

  test('all tiles have valid col/row indices', () => {
    const map = generateFlatMap(5, 5);
    for (const tile of map) {
      expect(tile.col).toBeGreaterThanOrEqual(0);
      expect(tile.row).toBeGreaterThanOrEqual(0);
    }
  });

  test('tiles start with no buildings or roads', () => {
    const map = generateFlatMap(3, 3);
    for (const tile of map) {
      expect(tile.building).toBeNull();
      expect(tile.road).toBe(false);
    }
  });
});

describe('Tile neighbor calculation', () => {
  test('center tile has 4 neighbors', () => {
    expect(getNeighbors(5, 5, 10, 10)).toHaveLength(4);
  });

  test('corner tile has 2 neighbors', () => {
    expect(getNeighbors(0, 0, 10, 10)).toHaveLength(2);
  });

  test('edge tile has 3 neighbors', () => {
    expect(getNeighbors(0, 5, 10, 10)).toHaveLength(3);
  });

  test('neighbors are within bounds', () => {
    const neighbors = getNeighbors(9, 9, 10, 10);
    for (const { col, row } of neighbors) {
      expect(col).toBeGreaterThanOrEqual(0);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(10);
      expect(row).toBeLessThan(10);
    }
  });
});

describe('Road graph connectivity', () => {
  test('connected road path is detected', () => {
    const tiles = generateFlatMap(5, 1);
    // Make a horizontal road strip: (0,0)-(1,0)-(2,0)
    tiles[0].road = true;
    tiles[1].road = true;
    tiles[2].road = true;
    const graph = buildRoadGraph(tiles);
    expect(isRoadConnected(graph, '0,0', '2,0')).toBe(true);
  });

  test('disconnected roads are not connected', () => {
    const tiles = generateFlatMap(5, 1);
    tiles[0].road = true;
    tiles[4].road = true; // gap in between
    const graph = buildRoadGraph(tiles);
    expect(isRoadConnected(graph, '0,0', '4,0')).toBe(false);
  });

  test('single tile road is self-connected', () => {
    const tiles = generateFlatMap(3, 3);
    tiles[4].road = true; // center
    const graph = buildRoadGraph(tiles);
    expect(isRoadConnected(graph, '1,1', '1,1')).toBe(true);
  });
});
