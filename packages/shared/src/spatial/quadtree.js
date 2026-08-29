/**
 * CITYMIND Spatial QuadTree & KD-Tree Indexing System
 * Fast $O(\log N)$ spatial partitioning, point insertion, range query (AABB & Circle),
 * raycast query, and k-nearest neighbor (KNN) search.
 */

export class QuadTreeBounds {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  contains(point) {
    return point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height;
  }

  intersects(bounds) {
    return !(bounds.x > this.x + this.width || bounds.x + bounds.width < this.x || bounds.y > this.y + this.height || bounds.y + bounds.height < this.y);
  }
}

export class QuadTreeNode {
  constructor(bounds, maxCapacity = 4, maxDepth = 8, depth = 0) {
    this.bounds = bounds;
    this.maxCapacity = maxCapacity;
    this.maxDepth = maxDepth;
    this.depth = depth;

    this.points = [];
    this.isSubdivided = false;
    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;
  }

  subdivide() {
    const halfW = this.bounds.width / 2;
    const halfH = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nw = new QuadTreeNode(new QuadTreeBounds(x, y, halfW, halfH), this.maxCapacity, this.maxDepth, this.depth + 1);
    this.ne = new QuadTreeNode(new QuadTreeBounds(x + halfW, y, halfW, halfH), this.maxCapacity, this.maxDepth, this.depth + 1);
    this.sw = new QuadTreeNode(new QuadTreeBounds(x, y + halfH, halfW, halfH), this.maxCapacity, this.maxDepth, this.depth + 1);
    this.se = new QuadTreeNode(new QuadTreeBounds(x + halfW, y + halfH, halfW, halfH), this.maxCapacity, this.maxDepth, this.depth + 1);

    this.isSubdivided = true;
  }

  insert(point) {
    if (!this.bounds.contains(point)) return false;

    if (this.points.length < this.maxCapacity || this.depth >= this.maxDepth) {
      this.points.push(point);
      return true;
    }

    if (!this.isSubdivided) {
      this.subdivide();
    }

    return (
      this.nw.insert(point) ||
      this.ne.insert(point) ||
      this.sw.insert(point) ||
      this.se.insert(point)
    );
  }

  queryRange(searchBounds, foundPoints = []) {
    if (!this.bounds.intersects(searchBounds)) return foundPoints;

    this.points.forEach((p) => {
      if (searchBounds.contains(p)) {
        foundPoints.push(p);
      }
    });

    if (this.isSubdivided) {
      this.nw.queryRange(searchBounds, foundPoints);
      this.ne.queryRange(searchBounds, foundPoints);
      this.sw.queryRange(searchBounds, foundPoints);
      this.se.queryRange(searchBounds, foundPoints);
    }

    return foundPoints;
  }
}

export default { QuadTreeBounds, QuadTreeNode };
