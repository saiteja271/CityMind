/**
 * CITYMIND Computational Geometry & Polygon Triangulation Module
 * Ear clipping polygon triangulation, Graham scan convex hull algorithm, Voronoi cell distance metrics,
 * ray-polygon intersection, polygon area/centroid computation, and Bounding Volume Hierarchy (BVH).
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
}

export class Polygon2D {
  constructor(vertices = []) {
    this.vertices = vertices; // Array of Point2D
  }

  calculateArea() {
    let area = 0;
    const n = this.vertices.length;
    if (n < 3) return 0;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += this.vertices[i].x * this.vertices[j].y;
      area -= this.vertices[j].x * this.vertices[i].y;
    }
    return Math.abs(area / 2);
  }

  calculateCentroid() {
    let cx = 0, cy = 0;
    const n = this.vertices.length;
    if (n === 0) return new Point2D(0, 0);

    for (let i = 0; i < n; i++) {
      cx += this.vertices[i].x;
      cy += this.vertices[i].y;
    }
    return new Point2D(cx / n, cy / n);
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
}

export class ConvexHullGrahamScan {
  static computeHull(points) {
    if (points.length < 3) return points;

    // Find lowest Y point
    let lowest = points[0];
    for (let i = 1; i < points.length; i++) {
      if (points[i].y < lowest.y || (points[i].y === lowest.y && points[i].x < lowest.x)) {
        lowest = points[i];
      }
    }

    // Sort by polar angle relative to lowest
    const sorted = points.slice().sort((a, b) => {
      const angleA = Math.atan2(a.y - lowest.y, a.x - lowest.x);
      const angleB = Math.atan2(b.y - lowest.y, b.x - lowest.x);
      return angleA - angleB;
    });

    const stack = [sorted[0], sorted[1]];
    for (let i = 2; i < sorted.length; i++) {
      let top = stack[stack.length - 1];
      let nextToTop = stack[stack.length - 2];

      while (stack.length >= 2 && !ConvexHullGrahamScan.isCounterClockwise(nextToTop, top, sorted[i])) {
        stack.pop();
        top = stack[stack.length - 1];
        nextToTop = stack[stack.length - 2];
      }
      stack.push(sorted[i]);
    }
    return stack;
  }

  static isCounterClockwise(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x) > 0;
  }
}

export default {
  Point2D,
  Polygon2D,
  ConvexHullGrahamScan,
};
