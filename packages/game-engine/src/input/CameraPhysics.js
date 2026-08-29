/**
 * CameraPhysics - Smooth camera physics engine with momentum inertia, zoom velocity,
 * spring-damper boundary clamping, entity target tracking, and isometric transformation matrices.
 */

import { MAP } from '@citymind/constants';

export class CameraPhysics {
  constructor(options = {}) {
    // Current state
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.zoom = options.zoom ?? MAP.DEFAULT_ZOOM;

    // Velocities
    this.vx = 0;
    this.vy = 0;
    this.vZoom = 0;

    // Direct targets
    this.targetX = this.x;
    this.targetY = this.y;
    this.targetZoom = this.zoom;

    // Limits
    this.minZoom = options.minZoom ?? MAP.MIN_ZOOM;
    this.maxZoom = options.maxZoom ?? MAP.MAX_ZOOM;
    this.viewportWidth = options.viewportWidth ?? 800;
    this.viewportHeight = options.viewportHeight ?? 600;
    this.mapWidth = options.mapWidth ?? MAP.DEFAULT_WIDTH * MAP.TILE_SIZE;
    this.mapHeight = options.mapHeight ?? MAP.DEFAULT_HEIGHT * MAP.TILE_SIZE;
    this.tileSize = options.tileSize ?? MAP.TILE_SIZE;

    // Physics parameters
    this.friction = options.friction ?? 0.88;
    this.zoomFriction = options.zoomFriction ?? 0.82;
    this.springStiffness = options.springStiffness ?? 0.15;
    this.enableIsometric = options.enableIsometric ?? false;

    // Entity tracking reference
    this.trackedEntity = null;
    this.trackingSmoothness = 0.1;
  }

  setViewport(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  setMapSize(mapWidthTiles, mapHeightTiles) {
    this.mapWidth = mapWidthTiles * this.tileSize;
    this.mapHeight = mapHeightTiles * this.tileSize;
  }

  applyImpulse(dx, dy) {
    this.vx += dx;
    this.vy += dy;
  }

  applyZoomImpulse(delta, cursorX = this.viewportWidth / 2, cursorY = this.viewportHeight / 2) {
    const worldBefore = this.screenToWorld(cursorX, cursorY);
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * (1 + delta)));

    // Adjust target position so zoom centers on cursor
    const worldAfter = this.screenToWorld(cursorX, cursorY);
    this.targetX += (worldBefore.x - worldAfter.x);
    this.targetY += (worldBefore.y - worldAfter.y);
  }

  trackEntity(entity) {
    this.trackedEntity = entity;
  }

  stopTracking() {
    this.trackedEntity = null;
  }

  update(dt = 0.016) {
    // 1. If tracking an entity, update target position to entity center
    if (this.trackedEntity) {
      this.targetX = this.trackedEntity.x - (this.viewportWidth / (2 * this.zoom));
      this.targetY = this.trackedEntity.y - (this.viewportHeight / (2 * this.zoom));
    }

    // 2. Spring-damper position interpolation
    this.vx += (this.targetX - this.x) * this.springStiffness;
    this.vy += (this.targetY - this.y) * this.springStiffness;

    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;

    // 3. Smooth zoom interpolation
    this.vZoom += (this.targetZoom - this.zoom) * 0.2;
    this.vZoom *= this.zoomFriction;
    this.zoom += this.vZoom;

    // 4. Soft boundary clamping with spring return
    const maxX = Math.max(0, this.mapWidth - this.viewportWidth / this.zoom);
    const maxY = Math.max(0, this.mapHeight - this.viewportHeight / this.zoom);

    if (this.x < 0) {
      this.x += (0 - this.x) * 0.2;
      this.vx *= 0.5;
    } else if (this.x > maxX) {
      this.x += (maxX - this.x) * 0.2;
      this.vx *= 0.5;
    }

    if (this.y < 0) {
      this.y += (0 - this.y) * 0.2;
      this.vy *= 0.5;
    } else if (this.y > maxY) {
      this.y += (maxY - this.y) * 0.2;
      this.vy *= 0.5;
    }
  }

  // ---------------------------------------------------------------------------
  // Coordinate Matrix Transformations
  // ---------------------------------------------------------------------------

  screenToWorld(screenX, screenY) {
    if (this.enableIsometric) {
      // Isometric to World projection math
      const isoX = (screenX - this.viewportWidth / 2) / this.zoom + this.x;
      const isoY = (screenY - this.viewportHeight / 4) / this.zoom + this.y;
      return {
        x: (2 * isoY + isoX) / 2,
        y: (2 * isoY - isoX) / 2
      };
    }

    // Orthographic projection math
    return {
      x: this.x + screenX / this.zoom,
      y: this.y + screenY / this.zoom
    };
  }

  worldToScreen(worldX, worldY) {
    if (this.enableIsometric) {
      // World to Isometric screen projection math
      const isoX = (worldX - worldY);
      const isoY = (worldX + worldY) / 2;
      return {
        x: (isoX - this.x) * this.zoom + this.viewportWidth / 2,
        y: (isoY - this.y) * this.zoom + this.viewportHeight / 4
      };
    }

    // Orthographic projection math
    return {
      x: (worldX - this.x) * this.zoom,
      y: (worldY - this.y) * this.zoom
    };
  }

  screenToTile(screenX, screenY) {
    const world = this.screenToWorld(screenX, screenY);
    return {
      x: Math.floor(world.x / this.tileSize),
      y: Math.floor(world.y / this.tileSize)
    };
  }

  tileToScreen(tileX, tileY) {
    return this.worldToScreen(tileX * this.tileSize, tileY * this.tileSize);
  }

  getVisibleTileBounds() {
    const topLeft = this.screenToTile(0, 0);
    const bottomRight = this.screenToTile(this.viewportWidth, this.viewportHeight);
    return {
      minX: Math.max(0, topLeft.x - 2),
      minY: Math.max(0, topLeft.y - 2),
      maxX: bottomRight.x + 2,
      maxY: bottomRight.y + 2
    };
  }
}

export default CameraPhysics;
