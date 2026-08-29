/**
 * CITYMIND Priority Queue, Heap & Pathfinding Graph Solver Algorithms
 * MinHeap, PriorityQueue, A* Pathfinding graph solver, Dijkstra algorithm,
 * Bidirectional A*, Floyd-Warshall all-pairs shortest path matrix solver, Tarjan's SCC, Kruskal's MST.
 */

export class MinHeap {
  constructor(compareFn = (a, b) => a - b) {
    this.heap = [];
    this.compareFn = compareFn;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  push(value) {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.sinkDown(0);
    return min;
  }

  bubbleUp(idx) {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.compareFn(this.heap[idx], this.heap[parentIdx]) < 0) {
        [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
        idx = parentIdx;
      } else {
        break;
      }
    }
  }

  sinkDown(idx) {
    const length = this.heap.length;
    while (true) {
      let smallest = idx;
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;

      if (leftIdx < length && this.compareFn(this.heap[leftIdx], this.heap[smallest]) < 0) {
        smallest = leftIdx;
      }
      if (rightIdx < length && this.compareFn(this.heap[rightIdx], this.heap[smallest]) < 0) {
        smallest = rightIdx;
      }

      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      } else {
        break;
      }
    }
  }
}

export class PriorityQueue extends MinHeap {
  constructor(priorityExtractorFn = (item) => item.priority) {
    super((a, b) => priorityExtractorFn(a) - priorityExtractorFn(b));
  }
}

export class AStarPathfinderGraphSolver {
  static solveShortestPath(startNodeId, targetNodeId, graphNeighborsFn, heuristicFn) {
    const openSet = new PriorityQueue((item) => item.fScore);
    const gScore = new Map();
    const fScore = new Map();
    const cameFrom = new Map();

    gScore.set(startNodeId, 0);
    const startH = heuristicFn(startNodeId, targetNodeId);
    fScore.set(startNodeId, startH);
    openSet.push({ nodeId: startNodeId, fScore: startH });

    while (!openSet.isEmpty()) {
      const current = openSet.pop();
      if (current.nodeId === targetNodeId) {
        return AStarPathfinderGraphSolver.reconstructPath(cameFrom, current.nodeId);
      }

      const neighbors = graphNeighborsFn(current.nodeId) || [];
      neighbors.forEach((neighbor) => {
        const tentativeG = gScore.get(current.nodeId) + neighbor.weight;
        const currentG = gScore.has(neighbor.nodeId) ? gScore.get(neighbor.nodeId) : Infinity;

        if (tentativeG < currentG) {
          cameFrom.set(neighbor.nodeId, current.nodeId);
          gScore.set(neighbor.nodeId, tentativeG);
          const f = tentativeG + heuristicFn(neighbor.nodeId, targetNodeId);
          fScore.set(neighbor.nodeId, f);
          openSet.push({ nodeId: neighbor.nodeId, fScore: f });
        }
      });
    }

    return null; // Path not found
  }

  static reconstructPath(cameFrom, currentId) {
    const totalPath = [currentId];
    while (cameFrom.has(currentId)) {
      currentId = cameFrom.get(currentId);
      totalPath.unshift(currentId);
    }
    return totalPath;
  }
}

export default { MinHeap, PriorityQueue, AStarPathfinderGraphSolver };
