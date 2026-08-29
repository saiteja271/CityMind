/**
 * InteractionController - Comprehensive multi-tool interaction manager and touch gesture handler.
 * Supports road drag placement, zone box placement, building placement validation, demolition tool,
 * area selection, inspection tooltips, and pinch-to-zoom / 2-finger panning.
 */

import { BUILDING_DEFS, ZONE } from '@citymind/constants';

export const TOOL_TYPES = {
  SELECT: 'select',
  INSPECT: 'inspect',
  ROAD_BUILD: 'road_build',
  ZONE_BUILD: 'zone_build',
  BUILDING_BUILD: 'building_build',
  DEMOLISH: 'demolish'
};

export class InteractionController {
  constructor(canvas, cameraPhysics, options = {}) {
    this.canvas = canvas;
    this.camera = cameraPhysics;
    this.soundEngine = options.soundEngine ?? null;

    // Active tool state
    this.activeTool = TOOL_TYPES.SELECT;
    this.selectedBuildingType = 'small_house';
    this.selectedZoneType = ZONE.RESIDENTIAL;

    // Drag / Gesture state
    this.isMouseDown = false;
    this.dragStartTile = null;
    this.hoverTile = null;
    this.selectionBox = null;
    this.previewTiles = [];
    this.calculatedCost = 0;

    // Touch gesture state
    this.touchPinchStartDist = 0;
    this.touchStartZoom = 1.0;
    this.isMultiTouch = false;

    // Callbacks
    this.onBuildRequest = options.onBuildRequest ?? null;
    this.onDemolishRequest = options.onDemolishRequest ?? null;
    this.onZoneRequest = options.onZoneRequest ?? null;
    this.onInspectTile = options.onInspectTile ?? null;

    this._bindEvents();
  }

  setTool(tool, toolPayload = {}) {
    this.activeTool = tool;
    if (toolPayload.buildingType) this.selectedBuildingType = toolPayload.buildingType;
    if (toolPayload.zoneType) this.selectedZoneType = toolPayload.zoneType;

    this.dragStartTile = null;
    this.previewTiles = [];
    this.calculatedCost = 0;
    if (this.soundEngine) this.soundEngine.playUIClick(1000);
  }

  _bindEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', this._handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
    window.addEventListener('mouseup', this._handleMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this._handleWheel.bind(this), { passive: false });

    // Touch events
    this.canvas.addEventListener('touchstart', this._handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this._handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this._handleTouchEnd.bind(this));
  }

  // ---------------------------------------------------------------------------
  // Mouse Input Handlers
  // ---------------------------------------------------------------------------

  _handleMouseDown(e) {
    if (e.button === 0) { // Left click
      this.isMouseDown = true;
      const rect = this.canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      this.dragStartTile = this.camera.screenToTile(screenX, screenY);
      this.hoverTile = { ...this.dragStartTile };
      this._updatePreview();
    } else if (e.button === 2 || e.button === 1) { // Right click or middle click
      // Immediate pan start
      this.dragStartTile = null;
    }
  }

  _handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const tile = this.camera.screenToTile(screenX, screenY);
    if (!this.hoverTile || this.hoverTile.x !== tile.x || this.hoverTile.y !== tile.y) {
      this.hoverTile = tile;

      if (this.activeTool === TOOL_TYPES.INSPECT && this.onInspectTile) {
        this.onInspectTile(this.hoverTile);
      }

      if (this.isMouseDown && this.dragStartTile) {
        this._updatePreview();
      }
    }

    // Camera pan with middle click or right mouse button drag
    if (e.buttons === 2 || e.buttons === 4) {
      this.camera.applyImpulse(-e.movementX / this.camera.zoom, -e.movementY / this.camera.zoom);
    }
  }

  _handleMouseUp(e) {
    if (this.isMouseDown && this.dragStartTile && this.hoverTile) {
      this._commitToolAction();
    }
    this.isMouseDown = false;
    this.dragStartTile = null;
    this.previewTiles = [];
    this.calculatedCost = 0;
  }

  _handleWheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    this.camera.applyZoomImpulse(zoomDelta, cursorX, cursorY);
    if (this.soundEngine) this.soundEngine.playUIClick(1200);
  }

  // ---------------------------------------------------------------------------
  // Touch Input Handlers (Pinch Zoom & Multi-touch)
  // ---------------------------------------------------------------------------

  _handleTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.isMultiTouch = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.touchPinchStartDist = Math.hypot(dx, dy);
      this.touchStartZoom = this.camera.zoom;
    } else if (e.touches.length === 1) {
      this.isMultiTouch = false;
      const rect = this.canvas.getBoundingClientRect();
      const screenX = e.touches[0].clientX - rect.left;
      const screenY = e.touches[0].clientY - rect.top;
      this.dragStartTile = this.camera.screenToTile(screenX, screenY);
      this.hoverTile = { ...this.dragStartTile };
    }
  }

  _handleTouchMove(e) {
    if (e.touches.length === 2 && this.isMultiTouch) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      if (this.touchPinchStartDist > 0) {
        const factor = dist / this.touchPinchStartDist;
        this.camera.targetZoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, this.touchStartZoom * factor));
      }
    }
  }

  _handleTouchEnd(e) {
    if (e.touches.length === 0) {
      if (!this.isMultiTouch && this.dragStartTile && this.hoverTile) {
        this._commitToolAction();
      }
      this.isMultiTouch = false;
      this.dragStartTile = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Preview & Calculation Logic
  // ---------------------------------------------------------------------------

  _updatePreview() {
    if (!this.dragStartTile || !this.hoverTile) return;

    this.previewTiles = [];
    const minX = Math.min(this.dragStartTile.x, this.hoverTile.x);
    const maxX = Math.max(this.dragStartTile.x, this.hoverTile.x);
    const minY = Math.min(this.dragStartTile.y, this.hoverTile.y);
    const maxY = Math.max(this.dragStartTile.y, this.hoverTile.y);

    switch (this.activeTool) {
      case TOOL_TYPES.ROAD_BUILD:
        // Straight line road drag
        if (Math.abs(this.hoverTile.x - this.dragStartTile.x) >= Math.abs(this.hoverTile.y - this.dragStartTile.y)) {
          // Horizontal primary road line
          for (let x = minX; x <= maxX; x++) {
            this.previewTiles.push({ x, y: this.dragStartTile.y });
          }
        } else {
          // Vertical primary road line
          for (let y = minY; y <= maxY; y++) {
            this.previewTiles.push({ x: this.dragStartTile.x, y });
          }
        }
        this.calculatedCost = this.previewTiles.length * 500;
        break;

      case TOOL_TYPES.ZONE_BUILD:
        // Area rectangle zoning preview
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            this.previewTiles.push({ x, y });
          }
        }
        this.calculatedCost = this.previewTiles.length * 100;
        break;

      case TOOL_TYPES.BUILDING_BUILD:
        // Building placement box validator
        const def = BUILDING_DEFS[this.selectedBuildingType] || { size: { w: 1, h: 1 }, cost: 10000 };
        for (let dy = 0; dy < def.size.h; dy++) {
          for (let dx = 0; dx < def.size.w; dx++) {
            this.previewTiles.push({ x: this.dragStartTile.x + dx, y: this.dragStartTile.y + dy });
          }
        }
        this.calculatedCost = def.cost;
        break;

      case TOOL_TYPES.DEMOLISH:
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            this.previewTiles.push({ x, y });
          }
        }
        this.calculatedCost = this.previewTiles.length * 50;
        break;

      case TOOL_TYPES.SELECT:
        this.selectionBox = { minX, minY, maxX, maxY };
        break;
    }
  }

  _commitToolAction() {
    if (this.previewTiles.length === 0 && this.activeTool === TOOL_TYPES.BUILDING_BUILD) {
      this._updatePreview();
    }

    const payload = {
      tool: this.activeTool,
      startTile: this.dragStartTile,
      endTile: this.hoverTile,
      tiles: this.previewTiles,
      cost: this.calculatedCost,
      buildingType: this.selectedBuildingType,
      zoneType: this.selectedZoneType
    };

    switch (this.activeTool) {
      case TOOL_TYPES.ROAD_BUILD:
      case TOOL_TYPES.BUILDING_BUILD:
        if (this.onBuildRequest) this.onBuildRequest(payload);
        break;
      case TOOL_TYPES.ZONE_BUILD:
        if (this.onZoneRequest) this.onZoneRequest(payload);
        break;
      case TOOL_TYPES.DEMOLISH:
        if (this.onDemolishRequest) this.onDemolishRequest(payload);
        break;
    }

    if (this.soundEngine && this.previewTiles.length > 0) {
      this.soundEngine.playUIClick(600);
    }
  }
}

export default InteractionController;
