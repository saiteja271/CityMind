/**
 * @citymind/game-engine - IsometricProjection.js
 * Comprehensive Isometric & Orthographic Viewport Transformation Engine.
 * 
 * Includes:
 * - World 2D/3D tile to Isometric screen coordinates & vice versa.
 * - Multi-angle rotation (0°, 90°, 180°, 270°), zoom, tilt, and pan offset.
 * - Topological Depth Sorting using Painters Algorithm & Directed Acyclic Graph (DAG) sorting.
 * - Height elevation projection, sloped terrain height interpolation & normal vectors.
 * - Diamond tile bounds checking, isometric AABB/OBB bounding volumes.
 * - Screen-to-world picking via 3D terrain raycasting.
 * - Canvas 2D path generation helpers for isometric diamonds, 3D cubes, and sloped terrain.
 */

import { Vector2, Vector3, Matrix3x3, Matrix4x4, BoundingBox2D, Ray2D, RaycastResult } from '@citymind/shared';

// ---------------------------------------------------------------------------
// ENUMS & CONSTANTS
// ---------------------------------------------------------------------------

/** Supported projection modes */
export const PROJECTION_MODE = {
  DIMETRIC_2_1: 'DIMETRIC_2_1',    // Standard 2:1 dimetric ratio (approx 26.565° / 30° visual isometric)
  ISOMETRIC_TRUE: 'ISOMETRIC_TRUE',  // True 35.264° isometric projection
  CABINET_OBLIQUE: 'CABINET_OBLIQUE',// Cabinet oblique (0.5 scale on Z axis at 45°)
  CAVALIER_OBLIQUE: 'CAVALIER_OBLIQUE',// Cavalier oblique (1.0 scale on Z axis at 45°)
  TOP_DOWN_2D: 'TOP_DOWN_2D'       // Orthographic 2D top-down perspective
};

/** Camera rotation angles in degrees */
export const ROTATION_ANGLE = {
  DEG_0: 0,
  DEG_90: 90,
  DEG_180: 180,
  DEG_270: 270
};

/** Terrain slope types for 3D isometric tile rendering */
export const SLOPE_TYPE = {
  FLAT: 'FLAT',                     // Uniform flat height
  SLOPE_NORTH: 'SLOPE_NORTH',       // North side elevated
  SLOPE_EAST: 'SLOPE_EAST',         // East side elevated
  SLOPE_SOUTH: 'SLOPE_SOUTH',       // South side elevated
  SLOPE_WEST: 'SLOPE_WEST',         // West side elevated
  CORNER_NE: 'CORNER_NE',           // North-East corner elevated
  CORNER_SE: 'CORNER_SE',           // South-East corner elevated
  CORNER_SW: 'CORNER_SW',           // South-West corner elevated
  CORNER_NW: 'CORNER_NW',           // North-West corner elevated
  VALLEY_NS: 'VALLEY_NS',           // Valley dip north-south
  VALLEY_EW: 'VALLEY_EW',           // Valley dip east-west
  RIDGE_NS: 'RIDGE_NS',             // Ridge peak north-south
  RIDGE_EW: 'RIDGE_EW'              // Ridge peak east-west
};

/** Default tile metric settings */
export const DEFAULT_TILE_CONFIG = {
  tileWidth: 128,         // Horizontal diamond width in screen pixels
  tileHeight: 64,         // Vertical diamond height in screen pixels
  elevationHeight: 32,    // Screen pixel height per unit of Z elevation
  gridSizeX: 128,         // Default grid width in tiles
  gridSizeY: 128          // Default grid height in tiles
};

// ---------------------------------------------------------------------------
// ISOMETRIC CAMERA
// ---------------------------------------------------------------------------

/**
 * Camera model supporting pan, zoom, rotation, tilt, and frustum culling calculations.
 */
export class IsometricCamera {
  /**
   * @param {Object} options
   * @param {number} [options.viewportWidth=1920]
   * @param {number} [options.viewportHeight=1080]
   * @param {number} [options.zoom=1.0]
   * @param {number} [options.rotation=ROTATION_ANGLE.DEG_0]
   * @param {number} [options.pitchTilt=1.0]
   * @param {number} [options.x=0]
   * @param {number} [options.y=0]
   */
  constructor(options = {}) {
    this.viewportWidth = options.viewportWidth || 1920;
    this.viewportHeight = options.viewportHeight || 1080;
    this.position = new Vector2(options.x || 0, options.y || 0);
    this.zoom = options.zoom || 1.0;
    this.minZoom = options.minZoom || 0.15;
    this.maxZoom = options.maxZoom || 4.0;
    this.rotation = options.rotation || ROTATION_ANGLE.DEG_0;
    this.pitchTilt = options.pitchTilt || 1.0; // Vertical compression ratio multiplier

    // Smooth movement target vectors
    this.targetPosition = this.position.clone();
    this.targetZoom = this.zoom;
    this.lerpSpeed = 0.15;

    // Transformation matrices
    this.viewMatrix = new Matrix3x3();
    this.inverseViewMatrix = new Matrix3x3();
    this.projectionMatrix4x4 = new Matrix4x4();
    this._dirty = true;
  }

  /**
   * Update viewport dimensions.
   * @param {number} width 
   * @param {number} height 
   */
  setViewportSize(width, height) {
    this.viewportWidth = Math.max(1, width);
    this.viewportHeight = Math.max(1, height);
    this._dirty = true;
  }

  /**
   * Set target pan position.
   * @param {number} x 
   * @param {number} y 
   */
  setPosition(x, y) {
    this.position.set(x, y);
    this.targetPosition.set(x, y);
    this._dirty = true;
  }

  /**
   * Move camera by delta.
   * @param {number} dx 
   * @param {number} dy 
   */
  pan(dx, dy) {
    this.position.x += dx / this.zoom;
    this.position.y += dy / this.zoom;
    this.targetPosition.copy(this.position);
    this._dirty = true;
  }

  /**
   * Set target zoom level anchored at screen focus point.
   * @param {number} newZoom 
   * @param {number} [anchorScreenX] 
   * @param {number} [anchorScreenY] 
   */
  setZoom(newZoom, anchorScreenX = this.viewportWidth / 2, anchorScreenY = this.viewportHeight / 2) {
    const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
    if (clampedZoom === this.zoom) return;

    // World point under anchor before zoom change
    const worldBefore = this.screenToWorldSpace(anchorScreenX, anchorScreenY);
    this.zoom = clampedZoom;
    this.targetZoom = clampedZoom;
    this.updateMatrices();
    const worldAfter = this.screenToWorldSpace(anchorScreenX, anchorScreenY);

    // Adjust camera position so mouse anchor stays stationary
    this.position.x += (worldBefore.x - worldAfter.x);
    this.position.y += (worldBefore.y - worldAfter.y);
    this.targetPosition.copy(this.position);
    this._dirty = true;
  }

  /**
   * Rotate camera around 90-degree steps.
   * @param {number} deltaDegrees 
   */
  rotate(deltaDegrees) {
    let current = this.rotation;
    current = (current + deltaDegrees + 360) % 360;
    // Snap to nearest 90
    this.rotation = Math.round(current / 90) * 90 % 360;
    this._dirty = true;
  }

  /**
   * Frame tick smooth updates for camera pan and zoom lerps.
   * @param {number} dt 
   */
  update(dt = 0.016) {
    const factor = Math.min(1.0, dt * 60 * this.lerpSpeed);
    
    if (this.position.distanceToSquared(this.targetPosition) > 0.01) {
      this.position.lerp(this.targetPosition, factor);
      this._dirty = true;
    }
    
    if (Math.abs(this.zoom - this.targetZoom) > 0.001) {
      this.zoom += (this.targetZoom - this.zoom) * factor;
      this._dirty = true;
    }

    if (this._dirty) {
      this.updateMatrices();
    }
  }

  /**
   * Recompute transformation matrices.
   */
  updateMatrices() {
    // Construct 3x3 2D view transformation matrix
    const cosR = Math.cos((this.rotation * Math.PI) / 180);
    const sinR = Math.sin((this.rotation * Math.PI) / 180);
    const z = this.zoom;
    const halfW = this.viewportWidth / 2;
    const halfH = this.viewportHeight / 2;

    // View matrix: Translate(-camX, -camY) -> Rotate -> Scale(zoom) -> Translate(halfW, halfH)
    this.viewMatrix.set(
      z * cosR, -z * sinR * this.pitchTilt, halfW - z * (this.position.x * cosR - this.position.y * sinR * this.pitchTilt),
      z * sinR,  z * cosR * this.pitchTilt, halfH - z * (this.position.x * sinR + this.position.y * cosR * this.pitchTilt),
      0,         0,                         1
    );

    this.inverseViewMatrix.copy(this.viewMatrix).invert();
    this._dirty = false;
  }

  /**
   * Convert camera-relative world point to screen pixels.
   * @param {number} worldX 
   * @param {number} worldY 
   * @returns {Vector2}
   */
  worldSpaceToScreen(worldX, worldY) {
    const halfW = this.viewportWidth / 2;
    const halfH = this.viewportHeight / 2;
    const relX = (worldX - this.position.x) * this.zoom;
    const relY = (worldY - this.position.y) * this.zoom * this.pitchTilt;

    if (this.rotation === 0) {
      return new Vector2(halfW + relX, halfH + relY);
    }
    
    const rad = (this.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rotX = relX * cos - relY * sin;
    const rotY = relX * sin + relY * cos;

    return new Vector2(halfW + rotX, halfH + rotY);
  }

  /**
   * Convert screen pixel coordinate to unrotated world offset space.
   * @param {number} screenX 
   * @param {number} screenY 
   * @returns {Vector2}
   */
  screenToWorldSpace(screenX, screenY) {
    const halfW = this.viewportWidth / 2;
    const halfH = this.viewportHeight / 2;
    let dx = screenX - halfW;
    let dy = screenY - halfH;

    if (this.rotation !== 0) {
      const rad = (-this.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;
      dx = rx;
      dy = ry;
    }

    const wx = this.position.x + dx / this.zoom;
    const wy = this.position.y + dy / (this.zoom * this.pitchTilt);
    return new Vector2(wx, wy);
  }

  /**
   * Compute screen bounding rectangle in unprojected grid/world coordinates for frustum culling.
   * @param {number} marginPixels Extra padding around viewport edges
   * @returns {BoundingBox2D}
   */
  getViewportWorldBounds(marginPixels = 200) {
    const minX = -marginPixels;
    const minY = -marginPixels;
    const maxX = this.viewportWidth + marginPixels;
    const maxY = this.viewportHeight + marginPixels;

    const corners = [
      this.screenToWorldSpace(minX, minY),
      this.screenToWorldSpace(maxX, minY),
      this.screenToWorldSpace(maxX, maxY),
      this.screenToWorldSpace(minX, maxY)
    ];

    const box = new BoundingBox2D();
    box.setFromPoints(corners);
    return box;
  }
}

// ---------------------------------------------------------------------------
// ISOMETRIC PROJECTION ENGINE
// ---------------------------------------------------------------------------

/**
 * Main Isometric Projection Engine.
 * Handles coordinate transformations, topological sorting, elevation projection,
 * diamond tile math, mouse raycasting, and slope calculations.
 */
export class IsometricProjection {
  /**
   * @param {Object} [config] 
   * @param {number} [config.tileWidth=128]
   * @param {number} [config.tileHeight=64]
   * @param {number} [config.elevationHeight=32]
   * @param {string} [config.mode=PROJECTION_MODE.DIMETRIC_2_1]
   */
  constructor(config = {}) {
    this.tileWidth = config.tileWidth || DEFAULT_TILE_CONFIG.tileWidth;
    this.tileHeight = config.tileHeight || DEFAULT_TILE_CONFIG.tileHeight;
    this.elevationHeight = config.elevationHeight || DEFAULT_TILE_CONFIG.elevationHeight;
    this.mode = config.mode || PROJECTION_MODE.DIMETRIC_2_1;

    // Derived metrics
    this.halfTileWidth = this.tileWidth / 2;
    this.halfTileHeight = this.tileHeight / 2;
    this.aspectRatio = this.tileWidth / this.tileHeight; // Default 2.0 for 2:1 dimetric

    // Coordinate transformation cache vectors
    this._v2Cache = new Vector2();
    this._v3Cache = new Vector3();
  }

  /**
   * Set tile geometry dimensions.
   * @param {number} width 
   * @param {number} height 
   * @param {number} elevation 
   */
  setTileDimensions(width, height, elevation) {
    this.tileWidth = width;
    this.tileHeight = height;
    this.elevationHeight = elevation;
    this.halfTileWidth = width / 2;
    this.halfTileHeight = height / 2;
    this.aspectRatio = width / height;
  }

  /**
   * Rotate 3D grid tile coordinate according to camera rotation angle.
   * @param {number} x 
   * @param {number} y 
   * @param {number} gridSizeX 
   * @param {number} gridSizeY 
   * @param {number} rotation 0, 90, 180, or 270
   * @returns {{x: number, y: number}}
   */
  rotateGridCoordinates(x, y, gridSizeX, gridSizeY, rotation) {
    switch (rotation) {
      case ROTATION_ANGLE.DEG_90:
        return { x: y, y: gridSizeX - 1 - x };
      case ROTATION_ANGLE.DEG_180:
        return { x: gridSizeX - 1 - x, y: gridSizeY - 1 - y };
      case ROTATION_ANGLE.DEG_270:
        return { x: gridSizeY - 1 - y, y: x };
      case ROTATION_ANGLE.DEG_0:
      default:
        return { x, y };
    }
  }

  /**
   * Transform 3D world grid coordinate (x, y, z) into unscaled screen pixel coordinates.
   * Standard 2:1 Dimetric formula:
   * screenX = (x - y) * (tileWidth / 2)
   * screenY = (x + y) * (tileHeight / 2) - z * elevationHeight
   * 
   * @param {number} worldX Grid column index (float allowed)
   * @param {number} worldY Grid row index (float allowed)
   * @param {number} [worldZ=0] Height elevation level (float allowed)
   * @returns {Vector2} Unscaled screen coordinates relative to world origin (0,0,0)
   */
  worldToScreen(worldX, worldY, worldZ = 0) {
    let screenX = 0;
    let screenY = 0;

    switch (this.mode) {
      case PROJECTION_MODE.ISOMETRIC_TRUE: {
        // True 35.264° angle projection
        const cos30 = Math.cos(Math.PI / 6);
        const sin30 = Math.sin(Math.PI / 6);
        const unit = this.halfTileWidth / cos30;
        screenX = (worldX - worldY) * cos30 * unit;
        screenY = (worldX + worldY) * sin30 * unit - worldZ * this.elevationHeight;
        break;
      }
      case PROJECTION_MODE.CABINET_OBLIQUE: {
        // 45° angle, Z axis scaled 0.5
        screenX = worldX * this.tileWidth + worldZ * this.elevationHeight * 0.3535;
        screenY = worldY * this.tileHeight - worldZ * this.elevationHeight * 0.3535;
        break;
      }
      case PROJECTION_MODE.CAVALIER_OBLIQUE: {
        // 45° angle, Z axis scaled 1.0
        screenX = worldX * this.tileWidth + worldZ * this.elevationHeight * 0.7071;
        screenY = worldY * this.tileHeight - worldZ * this.elevationHeight * 0.7071;
        break;
      }
      case PROJECTION_MODE.TOP_DOWN_2D: {
        screenX = worldX * this.tileWidth;
        screenY = worldY * this.tileHeight;
        break;
      }
      case PROJECTION_MODE.DIMETRIC_2_1:
      default: {
        // Standard Dimetric 2:1
        screenX = (worldX - worldY) * this.halfTileWidth;
        screenY = (worldX + worldY) * this.halfTileHeight - worldZ * this.elevationHeight;
        break;
      }
    }

    return new Vector2(screenX, screenY);
  }

  /**
   * Transform camera-projected screen pixel coordinates back into flat world grid coordinates (z = 0).
   * Inverse Dimetric Formula:
   * worldX = (screenX / halfTileWidth + screenY / halfTileHeight) / 2
   * worldY = (screenY / halfTileHeight - screenX / halfTileWidth) / 2
   * 
   * @param {number} screenX Screen pixel X relative to world origin
   * @param {number} screenY Screen pixel Y relative to world origin
   * @param {number} [planeZ=0] Fixed Z elevation plane to intersect against
   * @returns {Vector2} World grid (x, y) coordinates
   */
  screenToWorldFlat(screenX, screenY, planeZ = 0) {
    // Offset screen Y by target Z plane elevation
    const adjustedY = screenY + planeZ * this.elevationHeight;

    let worldX = 0;
    let worldY = 0;

    switch (this.mode) {
      case PROJECTION_MODE.TOP_DOWN_2D: {
        worldX = screenX / this.tileWidth;
        worldY = adjustedY / this.tileHeight;
        break;
      }
      case PROJECTION_MODE.DIMETRIC_2_1:
      default: {
        const nx = screenX / this.halfTileWidth;
        const ny = adjustedY / this.halfTileHeight;
        worldX = (nx + ny) / 2;
        worldY = (ny - nx) / 2;
        break;
      }
    }

    return new Vector2(worldX, worldY);
  }

  /**
   * Precise 3D raycasting mouse pick for elevated & sloped terrain.
   * Steps down Z height layers from maxElevation down to minElevation to find
   * exact tile intersection accounting for heightmaps and terrain slopes.
   * 
   * @param {number} screenX Mouse screen X (world origin relative)
   * @param {number} screenY Mouse screen Y (world origin relative)
   * @param {Function} getElevationAt Function(gridX, gridY) => elevation (number)
   * @param {Object} [options]
   * @param {number} [options.maxElevation=32] Max elevation level in grid
   * @param {number} [options.minElevation=0] Min elevation level in grid
   * @param {number} [options.gridSizeX=128] Grid width limit
   * @param {number} [options.gridSizeY=128] Grid height limit
   * @returns {{gridX: number, gridY: number, elevation: number, hit: boolean, localU: number, localV: number}}
   */
  screenToWorldRaycast(screenX, screenY, getElevationAt, options = {}) {
    const maxElev = options.maxElevation !== undefined ? options.maxElevation : 32;
    const minElev = options.minElevation !== undefined ? options.minElevation : 0;
    const maxX = options.gridSizeX || 512;
    const maxY = options.gridSizeY || 512;

    // Step size in Z space (0.25 elevation resolution for high accuracy)
    const zStep = 0.25;

    for (let z = maxElev; z >= minElev; z -= zStep) {
      const candidateWorld = this.screenToWorldFlat(screenX, screenY, z);
      const gx = Math.floor(candidateWorld.x);
      const gy = Math.floor(candidateWorld.y);

      if (gx >= 0 && gx < maxX && gy >= 0 && gy < maxY) {
        const actualElevation = getElevationAt(gx, gy) || 0;
        
        // If ray height z matches actual ground elevation at this tile (within step threshold)
        if (Math.abs(z - actualElevation) <= zStep * 0.75) {
          // Calculate local u, v within the diamond tile (0.0 to 1.0)
          const localX = candidateWorld.x - gx;
          const localY = candidateWorld.y - gy;

          return {
            gridX: gx,
            gridY: gy,
            elevation: actualElevation,
            hit: true,
            localU: Math.max(0, Math.min(1, localX)),
            localV: Math.max(0, Math.min(1, localY))
          };
        }
      }
    }

    // Fallback: flat ground plane pick at Z = 0
    const flatPick = this.screenToWorldFlat(screenX, screenY, 0);
    const gx = Math.floor(flatPick.x);
    const gy = Math.floor(flatPick.y);
    const localU = Math.max(0, Math.min(1, flatPick.x - gx));
    const localV = Math.max(0, Math.min(1, flatPick.y - gy));

    return {
      gridX: Math.max(0, Math.min(maxX - 1, gx)),
      gridY: Math.max(0, Math.min(maxY - 1, gy)),
      elevation: 0,
      hit: gx >= 0 && gx < maxX && gy >= 0 && gy < maxY,
      localU,
      localV
    };
  }

  /**
   * Check if a 2D point (px, py) falls inside an isometric diamond tile bounds.
   * Diamond top corner: (centerX, centerY - halfHeight)
   * Right corner: (centerX + halfWidth, centerY)
   * Bottom corner: (centerX, centerY + halfHeight)
   * Left corner: (centerX - halfWidth, centerY)
   * 
   * @param {number} px Screen pixel X
   * @param {number} py Screen pixel Y
   * @param {number} tileScreenX Screen center/top X of tile diamond
   * @param {number} tileScreenY Screen center/top Y of tile diamond
   * @returns {boolean}
   */
  isPointInDiamond(px, py, tileScreenX, tileScreenY) {
    const dx = Math.abs(px - tileScreenX);
    const dy = Math.abs(py - tileScreenY);
    // Standard normalized diamond inequality: |dx|/halfW + |dy|/halfH <= 1
    return (dx / this.halfTileWidth) + (dy / this.halfTileHeight) <= 1.0;
  }

  /**
   * Get 4 diamond vertices for top face of tile at (worldX, worldY, worldZ) in screen coordinates.
   * Vertex order: Top (N), Right (E), Bottom (S), Left (W).
   * 
   * @param {number} worldX 
   * @param {number} worldY 
   * @param {number} [worldZ=0] 
   * @returns {{top: Vector2, right: Vector2, bottom: Vector2, left: Vector2, center: Vector2}}
   */
  getTileDiamondVertices(worldX, worldY, worldZ = 0) {
    const origin = this.worldToScreen(worldX, worldY, worldZ);
    
    // Origin represents top vertex of diamond (x, y)
    const top = new Vector2(origin.x, origin.y);
    const right = new Vector2(origin.x + this.halfTileWidth, origin.y + this.halfTileHeight);
    const bottom = new Vector2(origin.x, origin.y + this.tileHeight);
    const left = new Vector2(origin.x - this.halfTileWidth, origin.y + this.halfTileHeight);
    const center = new Vector2(origin.x, origin.y + this.halfTileHeight);

    return { top, right, bottom, left, center };
  }

  /**
   * Get complete 3D isometric block bounding polygon vertices (Top face, Left side face, Right side face).
   * 
   * @param {number} worldX 
   * @param {number} worldY 
   * @param {number} elevation Ground height level
   * @param {number} [blockHeight=1] Vertical wall height in Z units
   * @returns {Object} Vertices for rendering 3D isometric prism
   */
  get3DBlockGeometry(worldX, worldY, elevation, blockHeight = 1) {
    const topVertices = this.getTileDiamondVertices(worldX, worldY, elevation + blockHeight);
    const baseVertices = this.getTileDiamondVertices(worldX, worldY, elevation);

    return {
      topFace: [topVertices.top, topVertices.right, topVertices.bottom, topVertices.left],
      leftFace: [topVertices.left, topVertices.bottom, baseVertices.bottom, baseVertices.left],
      rightFace: [topVertices.bottom, topVertices.right, baseVertices.right, baseVertices.bottom],
      backLeftFace: [topVertices.top, topVertices.left, baseVertices.left, baseVertices.top],
      backRightFace: [topVertices.top, topVertices.right, baseVertices.right, baseVertices.top],
      bounds: {
        minX: topVertices.left.x,
        maxX: topVertices.right.x,
        minY: topVertices.top.y,
        maxY: baseVertices.bottom.y
      }
    };
  }

  // -------------------------------------------------------------------------
  // TERRAIN SLOPE MATH & HEIGHT INTERPOLATION
  // -------------------------------------------------------------------------

  /**
   * Calculate interpolated height elevation at internal tile point (u, v)
   * given corner elevations (NW, NE, SE, SW).
   * 
   * @param {number} u Normalized X inside cell [0, 1]
   * @param {number} v Normalized Y inside cell [0, 1]
   * @param {Object} cornerElevations {nw: number, ne: number, se: number, sw: number}
   * @returns {number} Interpolated Z elevation
   */
  getInterpolatedSlopeHeight(u, v, cornerElevations) {
    const nw = cornerElevations.nw || 0;
    const ne = cornerElevations.ne || 0;
    const se = cornerElevations.se || 0;
    const sw = cornerElevations.sw || 0;

    // Bilinear interpolation across corners:
    // (1-u)(1-v)*NW + u*(1-v)*NE + (1-u)*v*SW + u*v*SE
    const top = (1 - u) * nw + u * ne;
    const bottom = (1 - u) * sw + u * se;
    return (1 - v) * top + v * bottom;
  }

  /**
   * Compute 3D surface normal vector for a sloped terrain tile.
   * Useful for dynamic terrain lighting and slope shading.
   * 
   * @param {Object} cornerElevations {nw: number, ne: number, se: number, sw: number}
   * @returns {Vector3} Normalized surface normal
   */
  getSlopeSurfaceNormal(cornerElevations) {
    const nw = cornerElevations.nw || 0;
    const ne = cornerElevations.ne || 0;
    const se = cornerElevations.se || 0;
    const sw = cornerElevations.sw || 0;

    // Tangent vectors along U (east-west) and V (north-south)
    const dzdu = ((ne + se) - (nw + sw)) * 0.5;
    const dzdv = ((sw + se) - (nw + ne)) * 0.5;

    // Surface normal = Cross(TangentU, TangentV)
    const normal = new Vector3(-dzdu, -dzdv, 1.0);
    return normal.normalize();
  }

  /**
   * Determine slope category enum based on 4 corner heights.
   * @param {Object} cornerElevations {nw: number, ne: number, se: number, sw: number}
   * @returns {string} SLOPE_TYPE enum
   */
  classifySlopeType(cornerElevations) {
    const { nw, ne, se, sw } = cornerElevations;

    if (nw === ne && ne === se && se === sw) return SLOPE_TYPE.FLAT;

    const minH = Math.min(nw, ne, se, sw);
    const maxH = Math.max(nw, ne, se, sw);

    if (nw > minH && ne > minH && se === minH && sw === minH) return SLOPE_TYPE.SLOPE_NORTH;
    if (ne > minH && se > minH && nw === minH && sw === minH) return SLOPE_TYPE.SLOPE_EAST;
    if (se > minH && sw > minH && nw === minH && ne === minH) return SLOPE_TYPE.SLOPE_SOUTH;
    if (sw > minH && nw > minH && ne === minH && se === minH) return SLOPE_TYPE.SLOPE_WEST;

    if (ne > minH && nw === minH && se === minH && sw === minH) return SLOPE_TYPE.CORNER_NE;
    if (se > minH && nw === minH && ne === minH && sw === minH) return SLOPE_TYPE.CORNER_SE;
    if (sw > minH && nw === minH && ne === minH && se === minH) return SLOPE_TYPE.CORNER_SW;
    if (nw > minH && ne === minH && se === minH && sw === minH) return SLOPE_TYPE.CORNER_NW;

    return SLOPE_TYPE.FLAT;
  }
}

// ---------------------------------------------------------------------------
// TOPOLOGICAL DEPTH SORTING ENGINE (PAINTERS & DAG SORT)
// ---------------------------------------------------------------------------

/**
 * Entity structure for topological depth sorting.
 */
export class SortableIsometricEntity {
  /**
   * @param {Object} options
   * @param {string|number} options.id Unique entity identifier
   * @param {number} options.x Min grid X position
   * @param {number} options.y Min grid Y position
   * @param {number} options.z Min grid Z elevation
   * @param {number} [options.sizeX=1] Size along X grid axis
   * @param {number} [options.sizeY=1] Size along Y grid axis
   * @param {number} [options.sizeZ=1] Height along Z grid axis
   * @param {number} [options.layerPriority=0] Optional explicit layer rendering order offset
   * @param {any} [options.ref=null] User reference object (e.g. Building, Vehicle, Citizen instance)
   */
  constructor(options) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    this.z = options.z;
    this.sizeX = options.sizeX || 1;
    this.sizeY = options.sizeY || 1;
    this.sizeZ = options.sizeZ || 1;
    this.layerPriority = options.layerPriority || 0;
    this.ref = options.ref || null;

    // Derived 3D Bounding Box in Grid space
    this.maxX = this.x + this.sizeX;
    this.maxY = this.y + this.sizeY;
    this.maxZ = this.z + this.sizeZ;

    // Composite baseline depth score
    this.depthScore = 0;
    this.recalculateDepthScore();
  }

  /**
   * Compute quick Painter's Algorithm baseline key.
   */
  recalculateDepthScore() {
    // In isometric projection, entities with higher (x + y) are closer to screen front.
    // Higher Z elevation offsets render position upward.
    this.depthScore = (this.x + this.y) * 1000 + (this.z * 10) + this.layerPriority;
  }
}

/**
 * Advanced Topological Depth Sorter using Directed Acyclic Graph (DAG) sorting
 * and fallback Painter's Z-sorting.
 */
export class TopologicalDepthSorter {
  constructor() {
    this._spatialBuckets = new Map();
    this.bucketSize = 4; // 4x4 tile buckets for spatial hash optimization
  }

  /**
   * Baseline Painter's algorithm sort.
   * Simple, O(N log N) speed, suitable for small scenes or non-overlapping uniform tiles.
   * 
   * @param {SortableIsometricEntity[]} entities 
   * @returns {SortableIsometricEntity[]} Sorted entities array (back to front)
   */
  sortByPaintersAlgorithm(entities) {
    return entities.slice().sort((a, b) => {
      if (a.layerPriority !== b.layerPriority) {
        return a.layerPriority - b.layerPriority;
      }
      if (Math.abs(a.depthScore - b.depthScore) > 0.001) {
        return a.depthScore - b.depthScore;
      }
      // Tie-breaker: compare X then Y
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });
  }

  /**
   * Robust 3D spatial predicate: Checks if entity A is strictly BEHIND entity B
   * in isometric projection space.
   * 
   * Entity A is behind Entity B if:
   * 1. A's max grid boundaries in (X, Y, Z) are less than or equal to B's min grid boundaries.
   * 2. In isometric projection, screen overlap occurs, but A is further from camera view than B.
   * 
   * @param {SortableIsometricEntity} a 
   * @param {SortableIsometricEntity} b 
   * @returns {boolean} True if A is behind B (A should be rendered before B)
   */
  isBehind3D(a, b) {
    // 1. Grid AABB overlap check in 3D
    const overlapsX = a.x < b.maxX && a.maxX > b.x;
    const overlapsY = a.y < b.maxY && a.maxY > b.y;
    const overlapsZ = a.z < b.maxZ && a.maxZ > b.z;

    // If bounding boxes do not overlap in screen projection shadow, order is clear
    if (!overlapsX && !overlapsY) {
      // If A is fully to the North-West / top of B in grid space
      if (a.maxX <= b.x || a.maxY <= b.y) {
        return true;
      }
      if (a.x >= b.maxX || a.y >= b.maxY) {
        return false;
      }
    }

    // 2. Strict spatial precedence test:
    // In standard dimetric iso view, increasing X moves down-right, increasing Y moves down-left, increasing Z moves straight up.
    // Therefore, an object behind another must satisfy:
    // a.maxX <= b.x OR a.maxY <= b.y OR a.maxZ <= b.z (accounting for height overlap)
    if (a.maxX <= b.x) return true;
    if (a.maxY <= b.y) return true;
    if (a.maxZ <= b.z && (overlapsX || overlapsY)) return true;

    // Inverse check: If B is strictly behind A
    if (b.maxX <= a.x) return false;
    if (b.maxY <= a.y) return false;
    if (b.maxZ <= a.z && (overlapsX || overlapsY)) return false;

    // Fallback comparison based on depth score
    return a.depthScore < b.depthScore;
  }

  /**
   * Directed Acyclic Graph (DAG) Topological Sort using Kahn's Algorithm.
   * Resolves complex tall building / overlapping entity sorting artifacts cleanly.
   * 
   * @param {SortableIsometricEntity[]} entities 
   * @returns {SortableIsometricEntity[]} Sorted entities (rendered from back to front)
   */
  sortByDAG(entities) {
    const n = entities.length;
    if (n <= 1) return entities.slice();

    // 1. Group entities into spatial buckets to limit dependency checks
    const buckets = this._buildSpatialBuckets(entities);

    // 2. Build adjacency list & in-degree counters
    // Edge A -> B means A must be rendered BEFORE B (A is behind B)
    const inDegree = new Array(n).fill(0);
    const adj = Array.from({ length: n }, () => []);

    // Track tested pairs to avoid redundant edges
    const testedPairs = new Set();

    for (const bucketList of buckets.values()) {
      const bLen = bucketList.length;
      for (let i = 0; i < bLen; i++) {
        for (let j = i + 1; j < bLen; j++) {
          const idxA = bucketList[i];
          const idxB = bucketList[j];

          const pairKey = idxA < idxB ? `${idxA}_${idxB}` : `${idxB}_${idxA}`;
          if (testedPairs.has(pairKey)) continue;
          testedPairs.add(pairKey);

          const entityA = entities[idxA];
          const entityB = entities[idxB];

          // Priority layer overrides spatial checks
          if (entityA.layerPriority !== entityB.layerPriority) {
            if (entityA.layerPriority < entityB.layerPriority) {
              adj[idxA].push(idxB);
              inDegree[idxB]++;
            } else {
              adj[idxB].push(idxA);
              inDegree[idxA]++;
            }
            continue;
          }

          if (this.isBehind3D(entityA, entityB)) {
            adj[idxA].push(idxB);
            inDegree[idxB]++;
          } else if (this.isBehind3D(entityB, entityA)) {
            adj[idxB].push(idxA);
            inDegree[idxA]++;
          }
        }
      }
    }

    // 3. Kahn's Topological Sort Queue
    const queue = [];
    for (let i = 0; i < n; i++) {
      if (inDegree[i] === 0) {
        queue.push(i);
      }
    }

    // Sort initial queue by baseline painter depth to keep stable order
    queue.sort((a, b) => entities[a].depthScore - entities[b].depthScore);

    const sortedResult = [];
    while (queue.length > 0) {
      // Pick node with lowest in-degree & lowest depth score
      const current = queue.shift();
      sortedResult.push(entities[current]);

      for (const neighbor of adj[current]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
      
      // Keep queue sorted for deterministic rendering
      if (queue.length > 1) {
        queue.sort((a, b) => entities[a].depthScore - entities[b].depthScore);
      }
    }

    // 4. Cycle resolution fallback: If graph contained cycles (unresolved dependencies), append remaining
    if (sortedResult.length < n) {
      const addedSet = new Set(sortedResult);
      const remaining = [];
      for (let i = 0; i < n; i++) {
        if (!addedSet.has(entities[i])) {
          remaining.push(entities[i]);
        }
      }
      remaining.sort((a, b) => a.depthScore - b.depthScore);
      sortedResult.push(...remaining);
    }

    return sortedResult;
  }

  /**
   * Spatial Hash Bucket builder to optimize O(N^2) dependency checks.
   * @private
   */
  _buildSpatialBuckets(entities) {
    this._spatialBuckets.clear();
    const bSize = this.bucketSize;

    for (let i = 0; i < entities.length; i++) {
      const e = entities[i];
      const minBx = Math.floor(e.x / bSize);
      const maxBx = Math.floor(e.maxX / bSize);
      const minBy = Math.floor(e.y / bSize);
      const maxBy = Math.floor(e.maxY / bSize);

      for (let bx = minBx; bx <= maxBx; bx++) {
        for (let by = minBy; by <= maxBy; by++) {
          const key = `${bx}:${by}`;
          let list = this._spatialBuckets.get(key);
          if (!list) {
            list = [];
            this._spatialBuckets.set(key, list);
          }
          list.push(i);
        }
      }
    }

    return this._spatialBuckets;
  }
}

// ---------------------------------------------------------------------------
// CANVAS 2D ISOMETRIC PATH GENERATORS & UTILITIES
// ---------------------------------------------------------------------------

/**
 * Canvas 2D drawing helpers for rendered isometric primitives.
 */
export const IsometricPathGenerator = {
  /**
   * Draw isometric diamond tile path on Canvas2D context.
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} screenX Top vertex X
   * @param {number} screenY Top vertex Y
   * @param {number} width Tile diamond width
   * @param {number} height Tile diamond height
   */
  drawDiamondPath(ctx, screenX, screenY, width = 128, height = 64) {
    const halfW = width / 2;
    const halfH = height / 2;

    ctx.beginPath();
    ctx.moveTo(screenX, screenY);                     // Top vertex (N)
    ctx.lineTo(screenX + halfW, screenY + halfH);     // Right vertex (E)
    ctx.lineTo(screenX, screenY + height);            // Bottom vertex (S)
    ctx.lineTo(screenX - halfW, screenY + halfH);     // Left vertex (W)
    ctx.closePath();
  },

  /**
   * Draw complete 3D isometric cube block (Top, Left, Right faces).
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} screenX Top vertex X of upper face
   * @param {number} screenY Top vertex Y of upper face
   * @param {number} width Diamond width
   * @param {number} height Diamond height
   * @param {number} depthPixelHeight Vertical extrusion height in pixels
   * @param {Object} colors { top: string, left: string, right: string, stroke: string }
   */
  draw3DCubeBlock(ctx, screenX, screenY, width = 128, height = 64, depthPixelHeight = 32, colors = {}) {
    const halfW = width / 2;
    const halfH = height / 2;

    const topFill = colors.top || '#88cc88';
    const leftFill = colors.left || '#559955';
    const rightFill = colors.right || '#336633';
    const strokeColor = colors.stroke || '#224422';

    // 1. Top Face
    ctx.fillStyle = topFill;
    this.drawDiamondPath(ctx, screenX, screenY, width, height);
    ctx.fill();
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Left Face (S -> W down to depth)
    ctx.fillStyle = leftFill;
    ctx.beginPath();
    ctx.moveTo(screenX - halfW, screenY + halfH);
    ctx.lineTo(screenX, screenY + height);
    ctx.lineTo(screenX, screenY + height + depthPixelHeight);
    ctx.lineTo(screenX - halfW, screenY + halfH + depthPixelHeight);
    ctx.closePath();
    ctx.fill();
    if (strokeColor) ctx.stroke();

    // 3. Right Face (S -> E down to depth)
    ctx.fillStyle = rightFill;
    ctx.beginPath();
    ctx.moveTo(screenX + halfW, screenY + halfH);
    ctx.lineTo(screenX, screenY + height);
    ctx.lineTo(screenX, screenY + height + depthPixelHeight);
    ctx.lineTo(screenX + halfW, screenY + halfH + depthPixelHeight);
    ctx.closePath();
    ctx.fill();
    if (strokeColor) ctx.stroke();
  },

  /**
   * Draw isometric sloped terrain geometry on Canvas2D.
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} screenX Top vertex X of base diamond
   * @param {number} screenY Top vertex Y of base diamond
   * @param {number} width Diamond width
   * @param {number} height Diamond height
   * @param {number} elevationStep Height step in pixels per elevation level
   * @param {Object} corners Corner elevations { nw, ne, se, sw }
   * @param {Object} colors { top: string, left: string, right: string }
   */
  drawSlopeBlock(ctx, screenX, screenY, width, height, elevationStep, corners, colors = {}) {
    const halfW = width / 2;
    const halfH = height / 2;

    const nwY = screenY - (corners.nw || 0) * elevationStep;
    const neY = screenY + halfH - (corners.ne || 0) * elevationStep;
    const seY = screenY + height - (corners.se || 0) * elevationStep;
    const swY = screenY + halfH - (corners.sw || 0) * elevationStep;

    // Sloped Top Face
    ctx.fillStyle = colors.top || '#7cb342';
    ctx.beginPath();
    ctx.moveTo(screenX, nwY);                 // NW (Top vertex)
    ctx.lineTo(screenX + halfW, neY);         // NE (Right vertex)
    ctx.lineTo(screenX, seY);                 // SE (Bottom vertex)
    ctx.lineTo(screenX - halfW, swY);         // SW (Left vertex)
    ctx.closePath();
    ctx.fill();
    if (colors.stroke) {
      ctx.strokeStyle = colors.stroke;
      ctx.stroke();
    }
  }
};

// ---------------------------------------------------------------------------
// DISTANCE METRICS & VECTOR MATH HELPERS
// ---------------------------------------------------------------------------

/**
 * Grid distance metrics tailored for isometric diamond maps.
 */
export const IsometricDistance = {
  /**
   * Manhattan distance along grid axes.
   */
  manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  },

  /**
   * Chebyshev distance (8-way movement metric).
   */
  chebyshev(x1, y1, x2, y2) {
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
  },

  /**
   * Screen Euclidean distance between two projected tile centers.
   */
  screenEuclidean(x1, y1, x2, y2, engine) {
    const p1 = engine.worldToScreen(x1, y1);
    const p2 = engine.worldToScreen(x2, y2);
    return p1.distanceTo(p2);
  }
};

export default {
  PROJECTION_MODE,
  ROTATION_ANGLE,
  SLOPE_TYPE,
  DEFAULT_TILE_CONFIG,
  IsometricCamera,
  IsometricProjection,
  SortableIsometricEntity,
  TopologicalDepthSorter,
  IsometricPathGenerator,
  IsometricDistance
};
