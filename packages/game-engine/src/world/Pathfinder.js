/**
 * Pathfinder - A* pathfinding on the road graph and tile grid.
 */

import { TRANSPORT } from '@citymind/constants';
import { PriorityQueue, tileKey, isInBounds, manhattanDistance } from '@citymind/utilities';

export class Pathfinder {
  constructor(mapGrid) {
    this.map = mapGrid;
  }

  /**
   * Find path using road graph preferentially, falling back to walkable tiles.
   */
  findPath(startX, startY, endX, endY, options = {}) {
    const {
      preferRoads = true,
      allowOffroad = true,
      maxLength = TRANSPORT.MAX_PATH_LENGTH
    } = options;

    if (!isInBounds(startX, startY, this.map.width, this.map.height)) return null;
    if (!isInBounds(endX, endY, this.map.width, this.map.height)) return null;

    if (startX === endX && startY === endY) {
      return [{ x: startX, y: startY }];
    }

    // Try road-only path first if both endpoints are near roads
    if (preferRoads) {
      const roadPath = this._astarRoad(startX, startY, endX, endY, maxLength);
      if (roadPath) return roadPath;
    }

    if (allowOffroad) {
      return this._astarGrid(startX, startY, endX, endY, maxLength, preferRoads);
    }

    return null;
  }

  _astarRoad(startX, startY, endX, endY, maxLength) {
    const startKey = this._nearestRoadNode(startX, startY);
    const endKey = this._nearestRoadNode(endX, endY);
    if (!startKey || !endKey) return null;

    const open = new PriorityQueue((a, b) => a.f - b.f);
    const cameFrom = new Map();
    const gScore = new Map();
    const closed = new Set();

    gScore.set(startKey, 0);
    open.push({ key: startKey, f: this._heuristicKey(startKey, endKey) });

    let iterations = 0;
    while (!open.isEmpty() && iterations < maxLength * 4) {
      iterations++;
      const current = open.pop();
      if (closed.has(current.key)) continue;
      closed.add(current.key);

      if (current.key === endKey) {
        const path = this._reconstruct(cameFrom, current.key);
        // Prepend/append actual start/end if different from road nodes
        const result = [];
        const startNode = this._parseKey(startKey);
        if (startX !== startNode.x || startY !== startNode.y) {
          result.push({ x: startX, y: startY });
        }
        result.push(...path);
        const endNode = this._parseKey(endKey);
        if (endX !== endNode.x || endY !== endNode.y) {
          result.push({ x: endX, y: endY });
        }
        return result;
      }

      const node = this.map.roadGraph.get(current.key);
      if (!node) continue;

      for (const edge of node.edges) {
        const neighborKey = tileKey(edge.x, edge.y);
        if (closed.has(neighborKey)) continue;
        const tentativeG = (gScore.get(current.key) || 0) + edge.cost;
        if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
          cameFrom.set(neighborKey, current.key);
          gScore.set(neighborKey, tentativeG);
          const f = tentativeG + this._heuristicKey(neighborKey, endKey);
          open.push({ key: neighborKey, f });
        }
      }
    }
    return null;
  }

  _astarGrid(startX, startY, endX, endY, maxLength, preferRoads) {
    const startKey = tileKey(startX, startY);
    const endKey = tileKey(endX, endY);
    const open = new PriorityQueue((a, b) => a.f - b.f);
    const cameFrom = new Map();
    const gScore = new Map();
    const closed = new Set();

    gScore.set(startKey, 0);
    open.push({
      key: startKey,
      x: startX,
      y: startY,
      f: manhattanDistance(startX, startY, endX, endY)
    });

    const dirs = [
      { dx: 0, dy: -1, cost: 1 },
      { dx: 1, dy: 0, cost: 1 },
      { dx: 0, dy: 1, cost: 1 },
      { dx: -1, dy: 0, cost: 1 },
      { dx: 1, dy: -1, cost: TRANSPORT.DIAGONAL_FACTOR },
      { dx: 1, dy: 1, cost: TRANSPORT.DIAGONAL_FACTOR },
      { dx: -1, dy: 1, cost: TRANSPORT.DIAGONAL_FACTOR },
      { dx: -1, dy: -1, cost: TRANSPORT.DIAGONAL_FACTOR }
    ];

    let iterations = 0;
    while (!open.isEmpty() && iterations < maxLength * 8) {
      iterations++;
      const current = open.pop();
      if (closed.has(current.key)) continue;
      closed.add(current.key);

      if (current.key === endKey) {
        return this._reconstructPoints(cameFrom, current.key);
      }

      for (const d of dirs) {
        const nx = current.x + d.dx;
        const ny = current.y + d.dy;
        if (!isInBounds(nx, ny, this.map.width, this.map.height)) continue;
        const tile = this.map.getTile(nx, ny);
        if (!tile || !tile.isWalkable) continue;

        const nKey = tileKey(nx, ny);
        if (closed.has(nKey)) continue;

        let moveCost = d.cost;
        if (tile.road) {
          moveCost *= preferRoads ? 0.5 : 1;
        } else {
          moveCost *= TRANSPORT.OFFROAD_COST;
        }
        if (tile.terrain === 'water' && !tile.road) continue;

        const tentativeG = (gScore.get(current.key) || 0) + moveCost;
        if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
          cameFrom.set(nKey, current.key);
          gScore.set(nKey, tentativeG);
          const f = tentativeG + manhattanDistance(nx, ny, endX, endY);
          open.push({ key: nKey, x: nx, y: ny, f });
        }
      }
    }
    return null;
  }

  _nearestRoadNode(x, y) {
    const key = tileKey(x, y);
    if (this.map.roadGraph.has(key)) return key;

    // Search nearby tiles for a road
    const maxR = 5;
    let best = null;
    let bestDist = Infinity;
    for (let r = 1; r <= maxR; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const nx = x + dx;
          const ny = y + dy;
          const nKey = tileKey(nx, ny);
          if (this.map.roadGraph.has(nKey)) {
            const dist = Math.abs(dx) + Math.abs(dy);
            if (dist < bestDist) {
              bestDist = dist;
              best = nKey;
            }
          }
        }
      }
      if (best) return best;
    }
    return null;
  }

  _heuristicKey(keyA, keyB) {
    const a = this._parseKey(keyA);
    const b = this._parseKey(keyB);
    return manhattanDistance(a.x, a.y, b.x, b.y);
  }

  _parseKey(key) {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  }

  _reconstruct(cameFrom, currentKey) {
    const path = [];
    let key = currentKey;
    while (key) {
      path.push(this._parseKey(key));
      key = cameFrom.get(key);
    }
    path.reverse();
    return path;
  }

  _reconstructPoints(cameFrom, currentKey) {
    const path = [];
    let key = currentKey;
    while (key) {
      path.push(this._parseKey(key));
      key = cameFrom.get(key);
    }
    path.reverse();
    return path;
  }

  /**
   * Estimate travel time in game hours.
   */
  estimateTravelTime(path, speed = 1.0) {
    if (!path || path.length < 2) return 0;
    let dist = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      dist += Math.sqrt(dx * dx + dy * dy);
    }
    // Assume ~1 tile per minute at base walk speed scaled
    return (dist / (speed * 60));
  }
}

export default Pathfinder;
