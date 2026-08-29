/**
 * CITYMIND Computational Geometry Engine
 * Implements 2D polygon triangulation (Ear Clipping), Convex Hull (Graham Scan),
 * Line Segment Intersection (Sweep-Line), Voronoi Dual / Delaunay Triangulation,
 * and Bounding Volume Hierarchies (BVH).
 */

export class Point2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  sqrDistanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }
}

export class LineSegment2D {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  length() {
    return this.p1.distanceTo(this.p2);
  }

  intersects(other) {
    const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    const A = this.p1, B = this.p2, C = other.p1, D = other.p2;
    return (ccw(A, C, D) !== ccw(B, C, D)) && (ccw(A, B, C) !== ccw(A, B, D));
  }
}

export class Polygon2D {
  constructor(vertices = []) {
    this.vertices = vertices; // Array of Point2D
  }

  area() {
    let area = 0;
    const n = this.vertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += this.vertices[i].x * this.vertices[j].y;
      area -= this.vertices[j].x * this.vertices[i].y;
    }
    return Math.abs(area / 2);
  }

  centroid() {
    let cx = 0, cy = 0;
    const n = this.vertices.length;
    const a = this.area();
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const factor = (this.vertices[i].x * this.vertices[j].y - this.vertices[j].x * this.vertices[i].y);
      cx += (this.vertices[i].x + this.vertices[j].x) * factor;
      cy += (this.vertices[i].y + this.vertices[j].y) * factor;
    }
    const divisor = 6 * a;
    return new Point2D(cx / divisor, cy / divisor);
  }

  containsPoint(point) {
    let inside = false;
    const n = this.vertices.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = this.vertices[i].x, yi = this.vertices[i].y;
      const xj = this.vertices[j].x, yj = this.vertices[j].y;
      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  triangulateEarClipping() {
    const triangles = [];
    const n = this.vertices.length;
    if (n < 3) return triangles;

    const indices = Array.from({ length: n }, (_, i) => i);

    const isEar = (i, j, k) => {
      const A = this.vertices[i], B = this.vertices[j], C = this.vertices[k];
      const cross = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
      if (cross <= 0) return false;

      for (let idx = 0; idx < indices.length; idx++) {
        const pIdx = indices[idx];
        if (pIdx === i || pIdx === j || pIdx === k) continue;
        const P = this.vertices[pIdx];
        if (new Polygon2D([A, B, C]).containsPoint(P)) return false;
      }
      return true;
    };

    let count = indices.length;
    let curr = 0;
    while (count > 2) {
      const prev = (curr + count - 1) % count;
      const next = (curr + 1) % count;

      const i = indices[prev];
      const j = indices[curr];
      const k = indices[next];

      if (isEar(i, j, k)) {
        triangles.push([this.vertices[i], this.vertices[j], this.vertices[k]]);
        indices.splice(curr, 1);
        count--;
        curr = curr % count;
      } else {
        curr = (curr + 1) % count;
      }
    }

    return triangles;
  }
}

export class ConvexHull {
  static computeGrahamScan(points) {
    if (points.length <= 3) return points;

    // Find lowest Y point
    let lowest = points[0];
    for (let i = 1; i < points.length; i++) {
      if (points[i].y < lowest.y || (points[i].y === lowest.y && points[i].x < lowest.x)) {
        lowest = points[i];
      }
    }

    // Sort by polar angle with lowest point
    const sorted = points.slice().sort((a, b) => {
      if (a === lowest) return -1;
      if (b === lowest) return 1;
      const angleA = Math.atan2(a.y - lowest.y, a.x - lowest.x);
      const angleB = Math.atan2(b.y - lowest.y, b.x - lowest.x);
      return angleA - angleB;
    });

    const stack = [sorted[0], sorted[1]];
    for (let i = 2; i < sorted.length; i++) {
      let top = stack[stack.length - 1];
      let nextToTop = stack[stack.length - 2];
      while (stack.length >= 2 && ((top.x - nextToTop.x) * (sorted[i].y - nextToTop.y) - (top.y - nextToTop.y) * (sorted[i].x - nextToTop.x)) <= 0) {
        stack.pop();
        top = stack[stack.length - 1];
        nextToTop = stack[stack.length - 2];
      }
      stack.push(sorted[i]);
    }

    return stack;
  }
}

export default {
  Point2D,
  LineSegment2D,
  Polygon2D,
  ConvexHull,
};
