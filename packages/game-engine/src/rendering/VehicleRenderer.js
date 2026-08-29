/**
 * VehicleRenderer - Vehicle sprite/procedural rendering with headlights, turn signals,
 * movement interpolation, emergency sirens, and multi-vehicle types.
 */

export const VEHICLE_TYPES = {
  CAR: 'car',
  BUS: 'bus',
  TRUCK: 'truck',
  POLICE: 'police',
  FIRE_ENGINE: 'fire_engine',
  AMBULANCE: 'ambulance'
};

export class VehicleRenderer {
  constructor(options = {}) {
    this.tileSize = options.tileSize ?? 32;
    this.time = 0;
    this.isNight = options.isNight ?? false;

    // Palette per vehicle type
    this.vehicleSpecs = {
      [VEHICLE_TYPES.CAR]: { length: 14, width: 8, color: '#1e88e5', speedFactor: 1.0 },
      [VEHICLE_TYPES.BUS]: { length: 24, width: 10, color: '#fbc02d', speedFactor: 0.7 },
      [VEHICLE_TYPES.TRUCK]: { length: 22, width: 10, color: '#757575', speedFactor: 0.65 },
      [VEHICLE_TYPES.POLICE]: { length: 15, width: 8, color: '#1a237e', emergency: true, speedFactor: 1.3 },
      [VEHICLE_TYPES.FIRE_ENGINE]: { length: 24, width: 10, color: '#d32f2f', emergency: true, speedFactor: 1.2 },
      [VEHICLE_TYPES.AMBULANCE]: { length: 18, width: 9, color: '#ffffff', emergency: true, speedFactor: 1.25 }
    };
  }

  setNightMode(isNight) {
    this.isNight = isNight;
  }

  update(dt = 0.016) {
    this.time += dt;
  }

  renderVehicle(ctx, vehicle, screenPos, zoom) {
    const spec = this.vehicleSpecs[vehicle.type] || this.vehicleSpecs[VEHICLE_TYPES.CAR];
    const len = spec.length * zoom;
    const wid = spec.width * zoom;
    const angle = vehicle.heading ?? 0; // Heading in radians

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(angle);

    // 1. Shadow under vehicle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(-len / 2 + 2, -wid / 2 + 2, len, wid);

    // 2. Headlights beam projection at night
    if (this.isNight || vehicle.headlightsOn) {
      this._renderHeadlightCone(ctx, len, wid, zoom);
    }

    // 3. Vehicle Body Base
    ctx.fillStyle = vehicle.color || spec.color;
    ctx.fillRect(-len / 2, -wid / 2, len, wid);

    // Outline / Detail
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-len / 2, -wid / 2, len, wid);

    // 4. Windshield & Windows
    ctx.fillStyle = '#111';
    const windshieldW = len * 0.25;
    ctx.fillRect(-len * 0.1, -wid * 0.4, windshieldW, wid * 0.8);

    // 5. Special Vehicle Details & Emergency Sirens
    if (spec.emergency) {
      this._renderEmergencyLights(ctx, vehicle.type, len, wid);
    }

    // 6. Turn Signals
    if (vehicle.turningLeft || vehicle.turningRight) {
      this._renderTurnSignals(ctx, vehicle.turningLeft, vehicle.turningRight, len, wid);
    }

    // 7. Brake Lights when braking
    if (vehicle.isBraking) {
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(-len / 2 - 1, -wid / 2, 2, 3);
      ctx.fillRect(-len / 2 - 1, wid / 2 - 3, 2, 3);
    }

    ctx.restore();
  }

  _renderHeadlightCone(ctx, len, wid, zoom) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 245, 157, 0.35)';
    ctx.beginPath();
    const frontX = len / 2;
    ctx.moveTo(frontX, -wid * 0.4);
    ctx.lineTo(frontX + 35 * zoom, -wid * 1.2);
    ctx.lineTo(frontX + 35 * zoom, wid * 1.2);
    ctx.lineTo(frontX, wid * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _renderEmergencyLights(ctx, type, len, wid) {
    const flashPhase = Math.floor(this.time * 8) % 2 === 0;

    ctx.save();
    if (type === VEHICLE_TYPES.POLICE) {
      // Red and Blue split siren
      ctx.fillStyle = flashPhase ? '#ff1744' : '#29b6f6';
      ctx.fillRect(-2, -wid * 0.3, 4, wid * 0.6);
    } else if (type === VEHICLE_TYPES.FIRE_ENGINE) {
      // Dual Red flashing lights
      ctx.fillStyle = flashPhase ? '#d50000' : '#ff5252';
      ctx.fillRect(-4, -wid * 0.35, 8, wid * 0.7);
    } else if (type === VEHICLE_TYPES.AMBULANCE) {
      // White and Red flashing strobe
      ctx.fillStyle = flashPhase ? '#ffffff' : '#e53935';
      ctx.fillRect(-3, -wid * 0.3, 6, wid * 0.6);
    }
    ctx.restore();
  }

  _renderTurnSignals(ctx, turnLeft, turnRight, len, wid) {
    const blink = Math.floor(this.time * 4) % 2 === 0;
    if (!blink) return;

    ctx.fillStyle = '#ff9100'; // Amber signal color
    const frontX = len / 2;
    const backX = -len / 2;

    if (turnLeft) {
      ctx.fillRect(frontX - 2, -wid / 2 - 1, 3, 2);
      ctx.fillRect(backX - 1, -wid / 2 - 1, 3, 2);
    }
    if (turnRight) {
      ctx.fillRect(frontX - 2, wid / 2 - 1, 3, 2);
      ctx.fillRect(backX - 1, wid / 2 - 1, 3, 2);
    }
  }

  interpolatePosition(startPos, endPos, progress) {
    const t = Math.max(0, Math.min(1, progress));
    return {
      x: startPos.x + (endPos.x - startPos.x) * t,
      y: startPos.y + (endPos.y - startPos.y) * t,
      heading: Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x)
    };
  }
}

export default VehicleRenderer;
