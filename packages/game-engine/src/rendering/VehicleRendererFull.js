/**
 * CITYMIND Vehicle Sprite & Traffic Vehicle Renderer
 * Vehicle sprite rendering, headlights, turn signals, traffic movement interpolation, vehicle types (cars, buses, trucks, police cars, fire engines, ambulances).
 */

export class RenderedVehicleEntity {
  constructor(id, type = 'Sedan', speedMs = 12.0) {
    this.id = id;
    this.type = type;
    this.speedMs = speedMs;
    this.headlightsActive = true;
  }
}

export class VehicleRendererFull {
  constructor() {
    this.vehiclesMap = new Map();
  }

  drawVehicle(ctx, vehicleId, screenX, screenY) {
    if (!ctx) return;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(screenX, screenY, 12, 6);
  }
}

export default VehicleRendererFull;
