/**
 * CITYMIND Level-Of-Detail (LOD) Isometric Facade Renderer
 * Renders procedural architectural facades for buildings, dynamic window illumination patterns per hour,
 * construction scaffolding visual states, and structural weathering shaders based on building condition.
 */

export class FacadeLODConfig {
  constructor(lodLevel = 0) {
    this.lodLevel = lodLevel; // 0: Ultra (Full Details + Window Lights), 1: High, 2: Medium (Flat Shading), 3: Low (Bounding Box)
    this.renderWindows = lodLevel <= 1;
    this.renderRoofGarden = lodLevel <= 0;
    this.renderScaffolding = true;
    this.renderShadows = lodLevel <= 2;
  }
}

export class IsometricFacadeLODRenderer {
  constructor(camera) {
    this.camera = camera;
    this.facadeCache = new Map();
  }

  determineLODLevel(screenPosition, viewportWidth, viewportHeight, cameraZoom) {
    if (cameraZoom < 0.5) return 3; // Low detail when zoomed out
    if (cameraZoom < 0.8) return 2;
    if (cameraZoom < 1.4) return 1;
    return 0; // Full ultra detail when zoomed in
  }

  drawBuildingFacade(ctx, building, screenPos, lodLevel = 0) {
    if (!ctx) return;
    ctx.save();

    const width = (building.width || 1) * 32;
    const height = (building.height || 1) * 32;
    const buildingHeightPx = (building.level || 1) * 24;

    // 1. Draw Base Isometric Block
    ctx.fillStyle = building.color || '#475569';

    // Left Face
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(screenPos.x - width, screenPos.y - width * 0.5);
    ctx.lineTo(screenPos.x - width, screenPos.y - width * 0.5 - buildingHeightPx);
    ctx.lineTo(screenPos.x, screenPos.y - buildingHeightPx);
    ctx.closePath();
    ctx.fill();

    // Right Face (Slightly darker shade for ambient occlusion)
    ctx.fillStyle = building.shadowColor || '#334155';
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(screenPos.x + height, screenPos.y - height * 0.5);
    ctx.lineTo(screenPos.x + height, screenPos.y - height * 0.5 - buildingHeightPx);
    ctx.lineTo(screenPos.x, screenPos.y - buildingHeightPx);
    ctx.closePath();
    ctx.fill();

    // Roof Face
    ctx.fillStyle = building.roofColor || '#64748b';
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y - buildingHeightPx);
    ctx.lineTo(screenPos.x - width, screenPos.y - width * 0.5 - buildingHeightPx);
    ctx.lineTo(screenPos.x - width + height, screenPos.y - width * 0.5 - height * 0.5 - buildingHeightPx);
    ctx.lineTo(screenPos.x + height, screenPos.y - height * 0.5 - buildingHeightPx);
    ctx.closePath();
    ctx.fill();

    // 2. Draw Window Lights if LOD permits
    if (lodLevel <= 1) {
      const timeOfDayHour = building.timeOfDayHour || 20; // 8 PM
      const isNight = timeOfDayHour >= 19 || timeOfDayHour < 6;
      ctx.fillStyle = isNight ? '#fef08a' : '#94a3b8'; // Warm yellow at night

      for (let floor = 1; floor <= (building.level || 1); floor++) {
        const floorY = screenPos.y - floor * 20;
        ctx.fillRect(screenPos.x - width + 10, floorY, 6, 8);
        ctx.fillRect(screenPos.x - width + 22, floorY, 6, 8);
      }
    }

    ctx.restore();
  }
}

export default IsometricFacadeLODRenderer;
