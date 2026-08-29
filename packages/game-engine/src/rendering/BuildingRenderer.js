/**
 * BuildingRenderer - Procedural isometric building drawing engine.
 * Includes LOD management, architectural facade details, window illumination schedules,
 * construction scaffolding visual states, and shadow projection.
 */

import { BUILDING_DEFS, BUILDING_CATEGORY } from '@citymind/constants';

export class BuildingRenderer {
  constructor(options = {}) {
    this.tileSize = options.tileSize ?? 32;
    this.timeOfDay = options.timeOfDay ?? 12.0; // 0..24 hours float
    this.sunAngle = options.sunAngle ?? Math.PI / 4; // Shadow direction angle in radians
    this.shadowLengthScale = options.shadowLengthScale ?? 0.8;
    this.enableShadows = options.enableShadows ?? true;

    // Cache window light states per building instance
    this._windowIlluminationCache = new Map();
  }

  setTimeOfDay(hour) {
    this.timeOfDay = hour % 24;
    // Calculate sun angle: rises in east (morning), overhead (noon), sets in west (evening)
    const sunProgress = (this.timeOfDay / 24) * Math.PI * 2;
    this.sunAngle = sunProgress + Math.PI / 4;
  }

  getLOD(zoom) {
    if (zoom < 0.4) return 'LOD_LOW';
    if (zoom < 1.0) return 'LOD_MED';
    return 'LOD_HIGH';
  }

  renderBuilding(ctx, building, screenPos, zoom, options = {}) {
    const def = BUILDING_DEFS[building.type] || {
      name: 'Unknown',
      category: BUILDING_CATEGORY.RESIDENTIAL,
      size: { w: 1, h: 1 }
    };

    const lod = this.getLOD(zoom);
    const ts = this.tileSize * zoom;
    const w = def.size.w * ts;
    const h = def.size.h * ts;
    const heightLayers = building.heightLayers || this._getBuildingHeightLayers(def);
    const buildingPixelHeight = heightLayers * (ts * 0.4);

    ctx.save();

    // 1. Render Shadow Projection
    if (this.enableShadows && lod !== 'LOD_LOW') {
      this._renderBuildingShadow(ctx, screenPos.x, screenPos.y, w, h, buildingPixelHeight);
    }

    // 2. Render Construction Scaffolding if under construction
    if (building.isUnderConstruction || (building.constructionProgress !== undefined && building.constructionProgress < 1.0)) {
      this._renderConstructionSite(ctx, screenPos.x, screenPos.y, w, h, buildingPixelHeight, building.constructionProgress || 0.5, zoom);
      ctx.restore();
      return;
    }

    // 3. Render Building Base & Body according to LOD
    if (lod === 'LOD_LOW') {
      this._renderLODLow(ctx, building, def, screenPos.x, screenPos.y, w, h);
    } else if (lod === 'LOD_MED') {
      this._renderLODMedium(ctx, building, def, screenPos.x, screenPos.y, w, h, buildingPixelHeight);
    } else {
      this._renderLODHigh(ctx, building, def, screenPos.x, screenPos.y, w, h, buildingPixelHeight, zoom);
    }

    ctx.restore();
  }

  _getBuildingHeightLayers(def) {
    switch (def.id) {
      case 'high_rise': return 10;
      case 'business_center': return 12;
      case 'office': return 6;
      case 'hospital': return 5;
      case 'apartment': return 4;
      case 'factory': return 3;
      case 'power_plant': return 4;
      case 'school': return 2;
      default: return 1.5;
    }
  }

  _renderBuildingShadow(ctx, x, y, w, h, pixelHeight) {
    // Shadow vector based on sun angle
    const isNight = this.timeOfDay < 5.5 || this.timeOfDay > 19.5;
    if (isNight) return; // Ambient night light, faint shadows

    const shadowLength = pixelHeight * this.shadowLengthScale * Math.abs(Math.sin((this.timeOfDay / 24) * Math.PI));
    const dx = Math.cos(this.sunAngle) * shadowLength;
    const dy = Math.sin(this.sunAngle) * shadowLength;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w + dx, y + h + dy);
    ctx.lineTo(x + dx, y + h + dy - pixelHeight * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  _renderLODLow(ctx, building, def, x, y, w, h) {
    const color = this._getCategoryColor(def.category);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }

  _renderLODMedium(ctx, building, def, x, y, w, h, pixelHeight) {
    const baseColor = this._getCategoryColor(def.category);
    const roofY = y - pixelHeight;

    // Building Wall Body
    ctx.fillStyle = this._adjustColor(baseColor, -20);
    ctx.fillRect(x, roofY, w, pixelHeight + h);

    // Roof Top
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, roofY, w, h);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, roofY, w, h);

    // Basic Window Grid overlay
    if (pixelHeight > 15) {
      this._renderWindowGrid(ctx, x, roofY + h, w, pixelHeight, false);
    }
  }

  _renderLODHigh(ctx, building, def, x, y, w, h, pixelHeight, zoom) {
    const baseColor = this._getCategoryColor(def.category);
    const roofY = y - pixelHeight;

    // Building Main Structure
    ctx.fillStyle = this._adjustColor(baseColor, -15);
    ctx.fillRect(x, roofY, w, pixelHeight + h);

    // Architectural Facade Trim / Cornice
    ctx.fillStyle = this._adjustColor(baseColor, 20);
    ctx.fillRect(x - 1, roofY, w + 2, 4); // Roof cornice
    ctx.fillRect(x - 1, y + h - 4, w + 2, 4); // Foundation trim

    // Roof Details
    ctx.fillStyle = this._adjustColor(baseColor, -5);
    ctx.fillRect(x, roofY, w, h);
    this._renderRoofEquipments(ctx, x, roofY, w, h, def);

    // Illuminated Windows based on Time-of-Day
    this._renderWindowGrid(ctx, x, roofY + h, w, pixelHeight, true, building.id);
  }

  _renderRoofEquipments(ctx, x, y, w, h, def) {
    // HVAC Units
    if (w > 20 && h > 20) {
      ctx.fillStyle = '#78909c';
      ctx.fillRect(x + 4, y + 4, 10, 8);
      ctx.fillStyle = '#455a64';
      ctx.fillRect(x + 6, y + 6, 6, 4);
    }

    // Antenna or Water Tower on high-rises / large public buildings
    if (def.id === 'high_rise' || def.id === 'business_center' || def.id === 'hospital') {
      ctx.strokeStyle = '#37474f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h / 2);
      ctx.lineTo(x + w / 2, y - 12);
      ctx.stroke();

      // Red blinking safety light at tip
      const blink = Math.floor(Date.now() / 600) % 2 === 0;
      ctx.fillStyle = blink ? '#ff1744' : '#880e4f';
      ctx.beginPath();
      ctx.arc(x + w / 2, y - 12, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _renderWindowGrid(ctx, x, wallStartY, w, wallHeight, detailed = false, buildingId = '') {
    const isNight = this.timeOfDay < 6.0 || this.timeOfDay > 19.0;
    const isDusk = (this.timeOfDay >= 18.0 && this.timeOfDay <= 19.0) || (this.timeOfDay >= 5.0 && this.timeOfDay <= 6.0);

    const columns = Math.max(1, Math.floor(w / 8));
    const rows = Math.max(1, Math.floor(wallHeight / 10));

    const winW = 4;
    const winH = 5;
    const gapX = (w - columns * winW) / (columns + 1);
    const gapY = (wallHeight - rows * winH) / (rows + 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const wx = x + gapX + c * (winW + gapX);
        const wy = wallStartY + gapY + r * (winH + gapY);

        let illuminated = false;
        if (isNight || isDusk) {
          // Deterministic illumination per window based on seed
          const seed = (r * 17 + c * 31 + (buildingId ? buildingId.charCodeAt(0) : 0)) % 100;
          illuminated = isNight ? seed > 35 : seed > 60;
        }

        ctx.fillStyle = illuminated ? '#ffee58' : '#263238';
        ctx.fillRect(wx, wy, winW, winH);

        if (detailed && illuminated) {
          // Window glow effect
          ctx.fillStyle = 'rgba(255, 238, 88, 0.3)';
          ctx.fillRect(wx - 1, wy - 1, winW + 2, winH + 2);
        }
      }
    }
  }

  _renderConstructionSite(ctx, x, y, w, h, pixelHeight, progress, zoom) {
    const currentH = Math.max(8, pixelHeight * progress);
    const roofY = y - currentH;

    // Unfinished concrete frame
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(x, roofY, w, currentH + h);

    // Scaffolding mesh grid
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 1.5;
    const step = 8 * zoom;
    for (let gx = x; gx <= x + w; gx += step) {
      ctx.beginPath();
      ctx.moveTo(gx, roofY);
      ctx.lineTo(gx, y + h);
      ctx.stroke();
    }
    for (let gy = roofY; gy <= y + h; gy += step) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      ctx.stroke();
    }

    // Construction Crane Arm
    ctx.strokeStyle = '#e65100';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, roofY);
    ctx.lineTo(x + w / 2, roofY - 20); // Tower
    ctx.lineTo(x + w / 2 + 25, roofY - 20); // Jib arm
    ctx.stroke();

    // Crane cable hanging down
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 + 18, roofY - 20);
    ctx.lineTo(x + w / 2 + 18, roofY - 5);
    ctx.stroke();

    // Progress Bar overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, y + h + 2, w, 5);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(x, y + h + 2, w * progress, 5);
  }

  _getCategoryColor(category) {
    switch (category) {
      case BUILDING_CATEGORY.RESIDENTIAL: return '#4caf50';
      case BUILDING_CATEGORY.COMMERCIAL: return '#2196f3';
      case BUILDING_CATEGORY.INDUSTRIAL: return '#ff9800';
      case BUILDING_CATEGORY.PUBLIC: return '#9c27b0';
      case BUILDING_CATEGORY.INFRASTRUCTURE: return '#607d8b';
      case BUILDING_CATEGORY.ENVIRONMENT: return '#8bc34a';
      default: return '#78909c';
    }
  }

  _adjustColor(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    if (isNaN(num)) return hex;
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    return `#${((1 << 24) + (Math.max(0, Math.min(255, r)) << 16) + (Math.max(0, Math.min(255, g)) << 8) + Math.max(0, Math.min(255, b))).toString(16).slice(1)}`;
  }
}

export default BuildingRenderer;
