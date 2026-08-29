/**
 * @citymind/game-engine - CanvasUIManager.js
 * Canvas 2D In-Game HUD & Overlay Renderer.
 * 
 * Features:
 * - Floating Citizen Status & Thought Bubbles with speech tail anchors.
 * - Building Health Bars, Structural Integrity, Fire/Power/Water Status Icons.
 * - Construction Progress Rings & Upgrade Badges.
 * - Animated Zone Outline Highlights & Marching Ants Borders.
 * - Pathfinding Flow Field Directional Vector Arrows.
 * - Road Traffic Light & Direction Indicators.
 * - Heatmap Overlay Renderer with Multi-Stop Palette Interpolators.
 * - Interactive Hit Testing, Tooltip System, and Spring/Easing UI Animations.
 */

import { Vector2, BoundingBox2D } from '@citymind/shared';

// ---------------------------------------------------------------------------
// ENUMS & HEATMAP PALETTES
// ---------------------------------------------------------------------------

/** Heatmap category types */
export const HEATMAP_TYPE = {
  NONE: 'NONE',
  LAND_VALUE: 'LAND_VALUE',         // Land economic value ($)
  NOISE_POLLUTION: 'NOISE_POLLUTION', // Traffic & industrial noise (dB)
  AIR_POLLUTION: 'AIR_POLLUTION',   // Smog / AQI index
  CRIME_DENSITY: 'CRIME_DENSITY',   // Crime risk rating
  FIRE_HAZARD: 'FIRE_HAZARD',       // Fire risk score
  GARBAGE_ACCUMULATION: 'GARBAGE',  // Uncollected trash
  HEALTH_COVERAGE: 'HEALTH',       // Clinic & hospital access
  EDUCATION_COVERAGE: 'EDUCATION', // School reachability
  POWER_GRID_STRESS: 'POWER'       // Power grid usage load
};

/** Pre-defined Multi-Stop Palette Gradient stops */
export const PALETTES = {
  VIRIDIS: [
    { t: 0.0, color: [68, 1, 84] },
    { t: 0.25, color: [59, 82, 139] },
    { t: 0.5, color: [33, 145, 140] },
    { t: 0.75, color: [94, 201, 98] },
    { t: 1.0, color: [253, 231, 37] }
  ],
  PLASMA: [
    { t: 0.0, color: [13, 8, 135] },
    { t: 0.25, color: [126, 3, 168] },
    { t: 0.5, color: [204, 71, 120] },
    { t: 0.75, color: [248, 149, 64] },
    { t: 1.0, color: [240, 249, 33] }
  ],
  TRAFFIC_FLOW: [
    { t: 0.0, color: [46, 204, 113] },  // Green (Clear)
    { t: 0.4, color: [241, 196, 15] },  // Yellow (Moderate)
    { t: 0.7, color: [230, 126, 34] },  // Orange (Heavy)
    { t: 1.0, color: [192, 57, 43] }    // Red (Gridlock)
  ],
  HEAT_RISK: [
    { t: 0.0, color: [52, 152, 219, 0.0] }, // Transparent blue
    { t: 0.3, color: [241, 196, 15, 0.4] }, // Translucent yellow
    { t: 0.7, color: [230, 126, 34, 0.65] },// Orange
    { t: 1.0, color: [231, 76, 60, 0.85] }  // Solid Red
  ]
};

// ---------------------------------------------------------------------------
// EASING & SPRING ANIMATION ENGINE
// ---------------------------------------------------------------------------

/** Easing functions for UI transitions */
export const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  elasticOut: t => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  }
};

/** Spring physics motion controller */
export class SpringValue {
  constructor(initialValue = 0, stiffness = 170, damping = 26) {
    this.current = initialValue;
    this.target = initialValue;
    this.velocity = 0;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  setTarget(target) {
    this.target = target;
  }

  update(dt = 0.016) {
    const force = -this.stiffness * (this.current - this.target);
    const dampingForce = -this.damping * this.velocity;
    const acceleration = force + dampingForce;

    this.velocity += acceleration * dt;
    this.current += this.velocity * dt;
    return this.current;
  }
}

// ---------------------------------------------------------------------------
// FLOATING CITIZEN BUBBLE & OVERLAY ELEMENTS
// ---------------------------------------------------------------------------

/**
 * Floating Citizen Speech/Thought Bubble UI Element.
 */
export class FloatingBubble {
  /**
   * @param {Object} options
   * @param {string|number} options.id
   * @param {number} options.worldX Grid X
   * @param {number} options.worldY Grid Y
   * @param {number} [options.worldZ=0] Grid Z
   * @param {string} options.text Text message
   * @param {string} [options.emoji="💬"] Emoji icon
   * @param {string} [options.type="speech"] "speech", "thought", "warning", "happiness"
   * @param {number} [options.duration=4.0] Lifetime in seconds
   */
  constructor(options) {
    this.id = options.id;
    this.worldX = options.worldX;
    this.worldY = options.worldY;
    this.worldZ = options.worldZ || 0;
    this.text = options.text || '';
    this.emoji = options.emoji || '💬';
    this.type = options.type || 'speech';
    this.duration = options.duration || 4.0;
    this.age = 0.0;
    this.alive = true;

    // Animation springs
    this.scaleSpring = new SpringValue(0, 220, 20);
    this.scaleSpring.setTarget(1.0);
    this.opacity = 1.0;
  }

  update(dt) {
    this.age += dt;
    this.scaleSpring.update(dt);

    if (this.age > this.duration - 0.5) {
      // Fade out near end of life
      this.opacity = Math.max(0, (this.duration - this.age) / 0.5);
    }

    if (this.age >= this.duration) {
      this.alive = false;
    }
  }

  /**
   * Render speech balloon on canvas.
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} screenX Anchor pixel X
   * @param {number} screenY Anchor pixel Y
   */
  render(ctx, screenX, screenY) {
    if (!this.alive || this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    const scale = this.scaleSpring.current;
    const bubbleY = screenY - 50;

    ctx.translate(screenX, bubbleY);
    ctx.scale(scale, scale);

    // Measure text width
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    const textWidth = ctx.measureText(this.text).width;
    const padding = 12;
    const bubbleW = Math.max(80, textWidth + padding * 2 + 24);
    const bubbleH = 34;

    const halfW = bubbleW / 2;

    // Draw speech bubble rounded rect
    ctx.fillStyle = this.type === 'warning' ? '#ffebee' : '#ffffff';
    ctx.strokeStyle = this.type === 'warning' ? '#e53935' : '#42a5f5';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(-halfW, -bubbleH, bubbleW, bubbleH, 10);
    ctx.fill();
    ctx.stroke();

    // Draw tail pointing down to citizen
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fillStyle = ctx.fillStyle;
    ctx.fill();
    ctx.stroke();

    // Draw Emoji & Text
    ctx.fillStyle = '#212121';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, -halfW + 8, -bubbleH / 2);
    ctx.fillText(this.text, -halfW + 30, -bubbleH / 2);

    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// BUILDING STATUS OVERLAYS (HEALTH BARS, PROGRESS RINGS)
// ---------------------------------------------------------------------------

/**
 * Renders status bars (Health, Construction Ring, Power/Water Icons) for buildings.
 */
export class BuildingStatusRenderer {
  /**
   * Draw building health / integrity bar.
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} screenX 
   * @param {number} screenY 
   * @param {number} healthPercent 0.0 to 1.0
   * @param {number} [barWidth=60]
   */
  drawHealthBar(ctx, screenX, screenY, healthPercent, barWidth = 60) {
    const barHeight = 8;
    const x = screenX - barWidth / 2;
    const y = screenY - 40;

    ctx.save();
    // Background bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 4);
    ctx.fill();

    // Health color fill
    let color = '#4caf50'; // Green
    if (healthPercent < 0.3) color = '#f44336'; // Red
    else if (healthPercent < 0.6) color = '#ff9800'; // Orange

    const fillW = Math.max(0, (barWidth - 2) * healthPercent);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, fillW, barHeight - 2, 3);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw circular construction progress pie-ring overlay.
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} screenX 
   * @param {number} screenY 
   * @param {number} progress 0.0 to 1.0
   * @param {number} [radius=20]
   */
  drawConstructionProgressRing(ctx, screenX, screenY, progress, radius = 20) {
    ctx.save();

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + progress * Math.PI * 2;

    // Outer background circle
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fill();

    // Progress arc
    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.arc(screenX, screenY, radius - 3, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = '#00e676';
    ctx.fill();

    // Percentage text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(progress * 100)}%`, screenX, screenY);

    ctx.restore();
  }

  /**
   * Render missing service warning icon badge (No Power / No Water / Fire).
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} screenX 
   * @param {number} screenY 
   * @param {string} iconType "NO_POWER", "NO_WATER", "FIRE", "GARBAGE"
   */
  drawWarningBadge(ctx, screenX, screenY, iconType) {
    ctx.save();

    let symbol = '⚠️';
    let bgColor = '#ff9800';

    if (iconType === 'NO_POWER') {
      symbol = '⚡';
      bgColor = '#f57c00';
    } else if (iconType === 'NO_WATER') {
      symbol = '💧';
      bgColor = '#0288d1';
    } else if (iconType === 'FIRE') {
      symbol = '🔥';
      bgColor = '#d32f2f';
    } else if (iconType === 'GARBAGE') {
      symbol = '🗑️';
      bgColor = '#757575';
    }

    // Badge circle
    ctx.beginPath();
    ctx.arc(screenX, screenY - 30, 14, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon text
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, screenX, screenY - 29);

    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// PATHFINDING FLOW FIELD & VECTOR ARROW OVERLAYS
// ---------------------------------------------------------------------------

/**
 * Visualizer for traffic pathfinding flow fields and velocity vectors.
 */
export class FlowFieldRenderer {
  /**
   * Draw directional vector arrows across a tile grid.
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {IsometricProjection} projection 
   * @param {IsometricCamera} camera 
   * @param {Array<Array<{dirX: number, dirY: number, congestion: number}>>} flowGrid 2D grid matrix
   * @param {number} gridSizeX 
   * @param {number} gridSizeY 
   */
  renderFlowField(ctx, projection, camera, flowGrid, gridSizeX, gridSizeY) {
    if (!flowGrid) return;

    ctx.save();
    ctx.lineWidth = 2;

    const bounds = camera.getViewportWorldBounds(100);
    const minX = Math.max(0, Math.floor(bounds.min.x));
    const maxX = Math.min(gridSizeX - 1, Math.ceil(bounds.max.x));
    const minY = Math.max(0, Math.floor(bounds.min.y));
    const maxY = Math.min(gridSizeY - 1, Math.ceil(bounds.max.y));

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const cell = flowGrid[x]?.[y];
        if (!cell || (cell.dirX === 0 && cell.dirY === 0)) continue;

        const worldPos = projection.worldToScreen(x + 0.5, y + 0.5);
        const screenPos = camera.worldSpaceToScreen(worldPos.x, worldPos.y);

        // Color based on congestion (0.0 clear -> 1.0 gridlock)
        const congestion = Math.max(0, Math.min(1, cell.congestion || 0));
        let strokeColor = '#2ecc71'; // Green
        if (congestion > 0.7) strokeColor = '#e74c3c'; // Red
        else if (congestion > 0.4) strokeColor = '#f39c12'; // Yellow

        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = strokeColor;

        // Draw directional arrow
        const angle = Math.atan2(cell.dirY, cell.dirX);
        const arrowLen = 16;

        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        const tipX = screenPos.x + Math.cos(angle) * arrowLen;
        const tipY = screenPos.y + Math.sin(angle) * arrowLen * 0.5; // Iso pitch scale
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Arrow tip head
        const headLen = 5;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - headLen * Math.cos(angle - Math.PI / 6), tipY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(tipX - headLen * Math.cos(angle + Math.PI / 6), tipY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// HEATMAP OVERLAY RENDER ENGINE
// ---------------------------------------------------------------------------

/**
 * Smooth spatial bilinear heatmap renderer with multi-stop palettes.
 */
export class HeatmapOverlayRenderer {
  /**
   * Interpolate color from multi-stop palette array at scalar position `t` [0.0 - 1.0].
   * 
   * @param {Array<{t: number, color: number[]}>} paletteStops 
   * @param {number} t 
   * @returns {string} rgba(...) CSS color string
   */
  getPaletteColor(paletteStops, t) {
    const clampedT = Math.max(0, Math.min(1, t));

    let lower = paletteStops[0];
    let upper = paletteStops[paletteStops.length - 1];

    for (let i = 0; i < paletteStops.length - 1; i++) {
      if (clampedT >= paletteStops[i].t && clampedT <= paletteStops[i + 1].t) {
        lower = paletteStops[i];
        upper = paletteStops[i + 1];
        break;
      }
    }

    const range = upper.t - lower.t;
    const factor = range > 0 ? (clampedT - lower.t) / range : 0;

    const r = Math.round(lower.color[0] + (upper.color[0] - lower.color[0]) * factor);
    const g = Math.round(lower.color[1] + (upper.color[1] - lower.color[1]) * factor);
    const b = Math.round(lower.color[2] + (upper.color[2] - lower.color[2]) * factor);
    const a = lower.color[3] !== undefined ? lower.color[3] + ((upper.color[3] || 1) - lower.color[3]) * factor : 0.6;

    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
  }

  /**
   * Render continuous spatial heatmap overlay on tile grid.
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {IsometricProjection} projection 
   * @param {IsometricCamera} camera 
   * @param {number[][]} dataMatrix 2D grid of normalized metric values [0.0 - 1.0]
   * @param {number} gridSizeX 
   * @param {number} gridSizeY 
   * @param {Array} palette Palette stop array
   */
  renderHeatmap(ctx, projection, camera, dataMatrix, gridSizeX, gridSizeY, palette = PALETTES.VIRIDIS) {
    if (!dataMatrix) return;

    ctx.save();

    const bounds = camera.getViewportWorldBounds(100);
    const minX = Math.max(0, Math.floor(bounds.min.x));
    const maxX = Math.min(gridSizeX - 1, Math.ceil(bounds.max.x));
    const minY = Math.max(0, Math.floor(bounds.min.y));
    const maxY = Math.min(gridSizeY - 1, Math.ceil(bounds.max.y));

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const val = dataMatrix[x]?.[y] || 0.0;
        if (val <= 0.01) continue; // Skip zero metric tiles

        const worldPos = projection.worldToScreen(x, y, 0);
        const screenPos = camera.worldSpaceToScreen(worldPos.x, worldPos.y);

        ctx.fillStyle = this.getPaletteColor(palette, val);

        // Draw diamond tile highlight fill
        const halfW = (projection.tileWidth * camera.zoom) / 2;
        const halfH = (projection.tileHeight * camera.zoom) / 2;

        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(screenPos.x + halfW, screenPos.y + halfH);
        ctx.lineTo(screenPos.x, screenPos.y + halfH * 2);
        ctx.lineTo(screenPos.x - halfW, screenPos.y + halfH);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// TOOLTIP & INTERACTIVE HIT TESTING MANAGER
// ---------------------------------------------------------------------------

/**
 * Interactive UI Tooltip manager with edge collision detection and flip positioning.
 */
export class TooltipManager {
  constructor() {
    this.visible = false;
    this.title = '';
    this.lines = [];
    this.targetScreenX = 0;
    this.targetScreenY = 0;
  }

  show(title, lines = [], screenX, screenY) {
    this.title = title;
    this.lines = lines;
    this.targetScreenX = screenX;
    this.targetScreenY = screenY;
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  render(ctx, viewportWidth, viewportHeight) {
    if (!this.visible) return;

    ctx.save();
    ctx.font = '12px system-ui, -apple-system, sans-serif';

    const padding = 10;
    let maxW = ctx.measureText(this.title).width + 10;
    for (const line of this.lines) {
      maxW = Math.max(maxW, ctx.measureText(line).width);
    }
    const boxWidth = Math.max(120, maxW + padding * 2);
    const boxHeight = 24 + this.lines.length * 16;

    // Viewport edge collision & auto-flip
    let x = this.targetScreenX + 15;
    let y = this.targetScreenY + 15;

    if (x + boxWidth > viewportWidth - 10) {
      x = this.targetScreenX - boxWidth - 15;
    }
    if (y + boxHeight > viewportHeight - 10) {
      y = this.targetScreenY - boxHeight - 15;
    }

    // Background rect
    ctx.fillStyle = 'rgba(20, 25, 40, 0.92)';
    ctx.strokeStyle = '#455a64';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, 6);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(this.title, x + padding, y + padding);

    // Body lines
    ctx.fillStyle = '#eceff1';
    ctx.font = '11px system-ui';
    let lineY = y + padding + 18;
    for (const line of this.lines) {
      ctx.fillText(line, x + padding, lineY);
      lineY += 16;
    }

    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// CANVAS UI MANAGER CENTRAL COORDINATOR
// ---------------------------------------------------------------------------

/**
 * Main Canvas UI Manager coordinating all in-game HUD layers.
 */
export class CanvasUIManager {
  constructor() {
    /** @type {Map<string|number, FloatingBubble>} */
    this.bubbles = new Map();
    this.statusRenderer = new BuildingStatusRenderer();
    this.flowFieldRenderer = new FlowFieldRenderer();
    this.heatmapRenderer = new HeatmapOverlayRenderer();
    this.tooltipManager = new TooltipManager();

    this.activeHeatmap = HEATMAP_TYPE.NONE;
    this.marchingAntsOffset = 0;
  }

  /**
   * Spawn a new floating speech bubble.
   * @param {FloatingBubble} bubble 
   */
  addBubble(bubble) {
    this.bubbles.set(bubble.id, bubble);
  }

  /**
   * Set active heatmap layer.
   * @param {string} type HEATMAP_TYPE enum
   */
  setActiveHeatmap(type) {
    this.activeHeatmap = type;
  }

  /**
   * Frame update logic for UI animations and lifetime timers.
   * @param {number} dt 
   */
  update(dt) {
    // Marching ants dash animation step
    this.marchingAntsOffset = (this.marchingAntsOffset + dt * 20) % 12;

    // Update floating bubbles
    for (const [id, bubble] of this.bubbles.entries()) {
      bubble.update(dt);
      if (!bubble.alive) {
        this.bubbles.delete(id);
      }
    }
  }

  /**
   * Render all canvas UI overlays over game world.
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {IsometricProjection} projection 
   * @param {IsometricCamera} camera 
   * @param {Object} worldData Reference to active map grid & simulation state
   */
  renderUI(ctx, projection, camera, worldData = {}) {
    // 1. Render Active Heatmap Overlay (if selected)
    if (this.activeHeatmap !== HEATMAP_TYPE.NONE && worldData.heatmaps) {
      const matrix = worldData.heatmaps[this.activeHeatmap];
      this.heatmapRenderer.renderHeatmap(
        ctx, projection, camera, matrix, worldData.gridSizeX || 128, worldData.gridSizeY || 128
      );
    }

    // 2. Render Pathfinding Flow Fields (if enabled)
    if (worldData.showFlowField && worldData.flowGrid) {
      this.flowFieldRenderer.renderFlowField(
        ctx, projection, camera, worldData.flowGrid, worldData.gridSizeX || 128, worldData.gridSizeY || 128
      );
    }

    // 3. Render Floating Citizen Bubbles
    for (const bubble of this.bubbles.values()) {
      const worldPos = projection.worldToScreen(bubble.worldX, bubble.worldY, bubble.worldZ);
      const screenPos = camera.worldSpaceToScreen(worldPos.x, worldPos.y);
      bubble.render(ctx, screenPos.x, screenPos.y);
    }

    // 4. Render Active Tooltip
    this.tooltipManager.render(ctx, camera.viewportWidth, camera.viewportHeight);
  }
}

export default {
  HEATMAP_TYPE,
  PALETTES,
  Easing,
  SpringValue,
  FloatingBubble,
  BuildingStatusRenderer,
  FlowFieldRenderer,
  HeatmapOverlayRenderer,
  TooltipManager,
  CanvasUIManager
};
