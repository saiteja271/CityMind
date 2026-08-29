/**
 * Camera - Viewport control for the game map (pan, zoom).
 */

import { MAP } from '@citymind/constants';
import { clamp } from '@citymind/utilities';

export class Camera {
  constructor(options = {}) {
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.zoom = options.zoom ?? MAP.DEFAULT_ZOOM;
    this.minZoom = options.minZoom ?? MAP.MIN_ZOOM;
    this.maxZoom = options.maxZoom ?? MAP.MAX_ZOOM;
    this.viewportWidth = options.viewportWidth ?? 800;
    this.viewportHeight = options.viewportHeight ?? 600;
    this.mapWidth = options.mapWidth ?? MAP.DEFAULT_WIDTH * MAP.TILE_SIZE;
    this.mapHeight = options.mapHeight ?? MAP.DEFAULT_HEIGHT * MAP.TILE_SIZE;
    this.tileSize = options.tileSize ?? MAP.TILE_SIZE;
    this._targetX = this.x;
    this._targetY = this.y;
    this._smoothing = options.smoothing ?? 0.15;
  }

  setViewport(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this._clampPosition();
  }

  setMapSize(mapWidthTiles, mapHeightTiles) {
    this.mapWidth = mapWidthTiles * this.tileSize;
    this.mapHeight = mapHeightTiles * this.tileSize;
    this._clampPosition();
  }

  setZoom(zoom) {
    this.zoom = clamp(zoom, this.minZoom, this.maxZoom);
    this._clampPosition();
  }

  zoomBy(delta) {
    this.setZoom(this.zoom + delta);
  }

  zoomAt(screenX, screenY, delta) {
    const worldBefore = this.screenToWorld(screenX, screenY);
    this.setZoom(this.zoom + delta);
    const worldAfter = this.screenToWorld(screenX, screenY);
    this.x += (worldBefore.x - worldAfter.x);
    this.y += (worldBefore.y - worldAfter.y);
    this._targetX = this.x;
    this._targetY = this.y;
    this._clampPosition();
  }

  pan(dx, dy) {
    this._targetX += dx / this.zoom;
    this._targetY += dy / this.zoom;
    this._clampPosition();
  }

  panImmediate(dx, dy) {
    this.x += dx / this.zoom;
    this.y += dy / this.zoom;
    this._targetX = this.x;
    this._targetY = this.y;
    this._clampPosition();
  }

  centerOn(worldX, worldY) {
    this._targetX = worldX - this.viewportWidth / (2 * this.zoom);
    this._targetY = worldY - this.viewportHeight / (2 * this.zoom);
    this._clampPosition();
  }

  centerOnTile(tileX, tileY) {
    this.centerOn(
      tileX * this.tileSize + this.tileSize / 2,
      tileY * this.tileSize + this.tileSize / 2
    );
  }

  update(dt = 1) {
    const factor = 1 - Math.pow(1 - this._smoothing, dt);
    this.x += (this._targetX - this.x) * factor;
    this.y += (this._targetY - this.y) * factor;
  }

  screenToWorld(screenX, screenY) {
    return {
      x: this.x + screenX / this.zoom,
      y: this.y + screenY / this.zoom
    };
  }

  worldToScreen(worldX, worldY) {
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
      minX: Math.max(0, topLeft.x - 1),
      minY: Math.max(0, topLeft.y - 1),
      maxX: bottomRight.x + 1,
      maxY: bottomRight.y + 1
    };
  }

  _clampPosition() {
    const maxX = Math.max(0, this.mapWidth - this.viewportWidth / this.zoom);
    const maxY = Math.max(0, this.mapHeight - this.viewportHeight / this.zoom);
    this._targetX = clamp(this._targetX, 0, maxX);
    this._targetY = clamp(this._targetY, 0, maxY);
    this.x = clamp(this.x, 0, maxX);
    this.y = clamp(this.y, 0, maxY);
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      zoom: this.zoom
    };
  }

  static fromJSON(data, options = {}) {
    const cam = new Camera(options);
    cam.x = data.x ?? 0;
    cam.y = data.y ?? 0;
    cam.zoom = data.zoom ?? MAP.DEFAULT_ZOOM;
    cam._targetX = cam.x;
    cam._targetY = cam.y;
    return cam;
  }
}

export default Camera;
