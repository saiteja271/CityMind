/**
 * @citymind/game-engine - LightingEngine.js
 * 24-Hour Dynamic Day/Night Lighting Shader & Multi-Pass Canvas 2D Blend System.
 * 
 * Features:
 * - Celestial Solar/Lunar Mechanics (Zenith angle, solar azimuth, seasonal variations).
 * - Multi-stop ambient light gradients interpolated across time of day and seasons.
 * - Point Light Emitters (Street lamps, vehicle headlights/taillights, building windows, strobes, fire noise flicker).
 * - Dynamic Shadow Projection Engine (Building geometry footprint ground extrusion).
 * - Weather & Volumetric Integration (Fog density, rain attenuation, lightning flashes, god rays).
 * - Offscreen Light Map Render Engine (Multi-pass light accumulation, frustum culling, tonemapping).
 */

import { Vector2, Vector3, BoundingBox2D } from '@citymind/shared';

// ---------------------------------------------------------------------------
// ENUMS & CONSTANTS
// ---------------------------------------------------------------------------

/** Seasonal categories affecting sunlight spectrum and day length */
export const SEASON = {
  SPRING: 'SPRING',
  SUMMER: 'SUMMER',
  AUTUMN: 'AUTUMN',
  WINTER: 'WINTER'
};

/** Point light emitter categories */
export const LIGHT_TYPE = {
  STREET_LAMP: 'STREET_LAMP',         // Warm yellow/white street lamp spot light
  VEHICLE_HEADLIGHT: 'VEHICLE_HEADLIGHT', // Directional cone beam moving with vehicle
  VEHICLE_TAILLIGHT: 'VEHICLE_TAILLIGHT', // Red tail light indicator
  BUILDING_WINDOW: 'BUILDING_WINDOW',   // Indoor window glow with randomized power toggle
  EMERGENCY_STROBE: 'EMERGENCY_STROBE', // Alternating red/blue emergency vehicle pulse
  FIRE_FLICKER: 'FIRE_FLICKER',       // Noise-parameterized fire light (flashing radius & tint)
  NEON_SIGN: 'NEON_SIGN',             // Vibrant neon sign glow (cyan/magenta/lime)
  INDUSTRIAL_FLARE: 'INDUSTRIAL_FLARE', // Deep orange smokestack flare
  SUB_SURFACE_LIGHT: 'SUB_SURFACE_LIGHT'// Underwater / fountain glow
};

/** Attenuation falloff formulas */
export const ATTENUATION = {
  LINEAR: 'LINEAR',
  QUADRATIC: 'QUADRATIC',
  INVERSE_SQUARE: 'INVERSE_SQUARE',
  SMOOTHSTEP: 'SMOOTHSTEP'
};

// ---------------------------------------------------------------------------
// COLOR MATH & AMBIENT GRADIENTS
// ---------------------------------------------------------------------------

/** Helper class for RGB color manipulation and blending */
export class RGBColor {
  constructor(r = 255, g = 255, b = 255, a = 1.0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  set(r, g, b, a = 1.0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    return this;
  }

  clone() {
    return new RGBColor(this.r, this.g, this.b, this.a);
  }

  lerp(target, t) {
    this.r += (target.r - this.r) * t;
    this.g += (target.g - this.g) * t;
    this.b += (target.b - this.b) * t;
    this.a += (target.a - this.a) * t;
    return this;
  }

  multiplyScalar(s) {
    this.r = Math.min(255, Math.max(0, this.r * s));
    this.g = Math.min(255, Math.max(0, this.g * s));
    this.b = Math.min(255, Math.max(0, this.b * s));
    return this;
  }

  toCSS() {
    return `rgba(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)}, ${this.a.toFixed(3)})`;
  }

  toHex() {
    const ir = Math.round(this.r).toString(16).padStart(2, '0');
    const ig = Math.round(this.g).toString(16).padStart(2, '0');
    const ib = Math.round(this.b).toString(16).padStart(2, '0');
    return `#${ir}${ig}${ib}`;
  }
}

/** 24-Hour Ambient Color Palette stops for city skylines */
export const DIURNAL_AMBIENT_STOPS = [
  { hour: 0.0,  color: new RGBColor(12, 16, 38, 0.88),  name: 'Midnight Deep' },
  { hour: 4.0,  color: new RGBColor(22, 24, 52, 0.85),  name: 'Pre-Dawn Purple' },
  { hour: 5.5,  color: new RGBColor(120, 60, 90, 0.70), name: 'Dawn Glow' },
  { hour: 6.5,  color: new RGBColor(245, 150, 90, 0.40), name: 'Golden Sunrise' },
  { hour: 8.0,  color: new RGBColor(255, 235, 190, 0.15), name: 'Morning Warmth' },
  { hour: 12.0, color: new RGBColor(255, 255, 255, 0.0),  name: 'High Noon Clear' },
  { hour: 16.5, color: new RGBColor(255, 240, 200, 0.12), name: 'Afternoon Sun' },
  { hour: 18.0, color: new RGBColor(245, 140, 70, 0.45), name: 'Sunset Golden' },
  { hour: 19.5, color: new RGBColor(140, 60, 110, 0.65), name: 'Dusk Twilight' },
  { hour: 21.0, color: new RGBColor(25, 30, 65, 0.82),  name: 'Nightfall' },
  { hour: 24.0, color: new RGBColor(12, 16, 38, 0.88),  name: 'Midnight Loop' }
];

// ---------------------------------------------------------------------------
// CELESTIAL SOLAR MECHANICS
// ---------------------------------------------------------------------------

/**
 * Solar position calculator computing solar zenith, azimuth, and sun direction vectors
 * based on time of day, day of year, and geographic latitude.
 */
export class SolarCalculator {
  /**
   * @param {number} [latitude=40.7128] City latitude in degrees (e.g. New York 40.7° N)
   */
  constructor(latitude = 40.7128) {
    this.latitude = latitude;
    this.latitudeRad = (latitude * Math.PI) / 180;
  }

  /**
   * Calculate solar metrics for given time.
   * 
   * @param {number} hourFloat Time of day [0.0 - 24.0]
   * @param {number} [dayOfYear=172] Day of year [1 - 365] (default Summer Solstice ~172)
   * @returns {{ zenith: number, azimuth: number, sunVector: Vector3, isDaylight: boolean, sunIntensity: number }}
   */
  calculateSolarPosition(hourFloat, dayOfYear = 172) {
    // Solar declination angle delta
    const declination = 23.45 * Math.sin(((284 + dayOfYear) * 360 / 365) * (Math.PI / 180));
    const decRad = (declination * Math.PI) / 180;

    // Hour angle (12.0 = solar noon = 0°)
    const hourAngleDeg = (hourFloat - 12.0) * 15.0;
    const hourAngleRad = (hourAngleDeg * Math.PI) / 180;

    // Elevation angle (solar altitude)
    const sinElevation = Math.sin(this.latitudeRad) * Math.sin(decRad) +
                         Math.cos(this.latitudeRad) * Math.cos(decRad) * Math.cos(hourAngleRad);
    const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinElevation)));
    const elevationDeg = (elevationRad * 180) / Math.PI;

    // Solar Zenith Angle (angle from overhead zenith: 0° zenith = high noon, 90° = horizon)
    const zenithDeg = 90.0 - elevationDeg;

    // Solar Azimuth Angle (bearing from North)
    const cosAzimuth = (Math.sin(decRad) * Math.cos(this.latitudeRad) -
                        Math.cos(decRad) * Math.sin(this.latitudeRad) * Math.cos(hourAngleRad)) /
                        (Math.cos(elevationRad) || 1e-5);
    let azimuthRad = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
    if (hourAngleDeg > 0) {
      azimuthRad = 2 * Math.PI - azimuthRad;
    }
    const azimuthDeg = (azimuthRad * 180) / Math.PI;

    // 3D Sun Direction Vector (pointing toward ground from sun)
    const sunVector = new Vector3(
      Math.cos(elevationRad) * Math.sin(azimuthRad),
      Math.cos(elevationRad) * Math.cos(azimuthRad),
      Math.sin(elevationRad)
    ).normalize();

    const isDaylight = elevationDeg > -2.0;
    const sunIntensity = Math.max(0, Math.sin(elevationRad));

    return {
      zenith: zenithDeg,
      azimuth: azimuthDeg,
      elevation: elevationDeg,
      sunVector,
      isDaylight,
      sunIntensity
    };
  }
}

// ---------------------------------------------------------------------------
// POINT LIGHT EMITTER MODEL
// ---------------------------------------------------------------------------

/**
 * Individual point light emitter instance in world 3D space.
 */
export class PointLight {
  /**
   * @param {Object} options
   * @param {string|number} options.id
   * @param {string} [options.type=LIGHT_TYPE.STREET_LAMP]
   * @param {number} options.x Grid X position
   * @param {number} options.y Grid Y position
   * @param {number} [options.z=0] Grid Z elevation
   * @param {RGBColor} [options.color]
   * @param {number} [options.intensity=1.0]
   * @param {number} [options.radius=150] Pixel radius of light bloom
   * @param {string} [options.attenuation=ATTENUATION.SMOOTHSTEP]
   * @param {number} [options.spotAngle=360] Cone angle in degrees (360 = omni)
   * @param {Vector2} [options.direction] Direction vector for spotlights
   * @param {boolean} [options.castShadows=false]
   */
  constructor(options) {
    this.id = options.id;
    this.type = options.type || LIGHT_TYPE.STREET_LAMP;
    this.x = options.x;
    this.y = options.y;
    this.z = options.z || 0;
    this.color = options.color ? options.color.clone() : new RGBColor(255, 220, 150, 1.0);
    this.intensity = options.intensity !== undefined ? options.intensity : 1.0;
    this.radius = options.radius || 150;
    this.attenuation = options.attenuation || ATTENUATION.SMOOTHSTEP;
    this.spotAngle = options.spotAngle || 360;
    this.direction = options.direction ? options.direction.clone() : new Vector2(1, 0);
    this.castShadows = !!options.castShadows;
    this.enabled = true;

    // Noise/Flicker simulation parameters
    this.flickerSpeed = options.flickerSpeed || 0.0;
    this.flickerAmount = options.flickerAmount || 0.0;
    this._flickerPhase = Math.random() * 100;
    this._currentIntensity = this.intensity;

    // Pulse/Strobe timer for emergency lights
    this._strobeTimer = Math.random() * Math.PI * 2;
  }

  /**
   * Update internal light effects (flicker noise, emergency strobe pulses).
   * @param {number} dt Delta time in seconds
   * @param {number} gameTime Global clock
   */
  update(dt, gameTime) {
    if (!this.enabled) return;

    if (this.type === LIGHT_TYPE.FIRE_FLICKER || this.flickerAmount > 0) {
      this._flickerPhase += dt * (this.flickerSpeed || 8.0);
      const noise = (Math.sin(this._flickerPhase) * 0.5 + Math.sin(this._flickerPhase * 2.3) * 0.3 + Math.sin(this._flickerPhase * 5.7) * 0.2);
      this._currentIntensity = Math.max(0.1, this.intensity + noise * this.flickerAmount);
    } else if (this.type === LIGHT_TYPE.EMERGENCY_STROBE) {
      this._strobeTimer += dt * 12.0;
      const pulse = Math.sin(this._strobeTimer);
      if (pulse > 0) {
        this.color.set(255, 20, 20, 1.0); // Red strobe
      } else {
        this.color.set(20, 40, 255, 1.0); // Blue strobe
      }
      this._currentIntensity = Math.abs(pulse) > 0.3 ? this.intensity : 0.05;
    } else {
      this._currentIntensity = this.intensity;
    }
  }

  /**
   * Calculate light falloff multiplier at given pixel distance `d`.
   * @param {number} distance 
   * @returns {number} Intensity multiplier [0.0 - 1.0]
   */
  getAttenuationAtDistance(distance) {
    if (distance >= this.radius) return 0.0;
    const norm = distance / this.radius;

    switch (this.attenuation) {
      case ATTENUATION.LINEAR:
        return 1.0 - norm;
      case ATTENUATION.QUADRATIC:
        return Math.max(0, 1.0 - norm * norm);
      case ATTENUATION.INVERSE_SQUARE: {
        const dSquare = norm * norm * 4 + 1;
        return (1 / dSquare - 1 / 5) / (1 - 1 / 5);
      }
      case ATTENUATION.SMOOTHSTEP:
      default: {
        // Smoothstep 1 - (3x^2 - 2x^3)
        const t = 1.0 - norm;
        return t * t * (3 - 2 * t);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// DYNAMIC SHADOW PROJECTION SYSTEM
// ---------------------------------------------------------------------------

/**
 * Calculates ground shadow projection footprints extruded from 3D buildings.
 */
export class ShadowProjector {
  /**
   * Compute shadow polygon points on 2D ground plane projected from 3D isometric block.
   * 
   * @param {Vector2} screenOrigin Screen X, Y of top vertex of building base
   * @param {number} buildingHeightPixels Vertical building height on screen
   * @param {number} buildingWidthPixels Base diamond width
   * @param {number} buildingDepthPixels Base diamond height
   * @param {number} solarAzimuth Solar bearing angle in degrees
   * @param {number} solarZenith Solar zenith angle in degrees (90 = horizon = infinitely long shadow)
   * @returns {Vector2[]} Polygon points for shadow footprint
   */
  projectBuildingShadow(screenOrigin, buildingHeightPixels, buildingWidthPixels, buildingDepthPixels, solarAzimuth, solarZenith) {
    // Shadow length multiplier based on sun zenith angle (tan of zenith)
    const zenithRad = ((Math.min(88, Math.max(10, solarZenith))) * Math.PI) / 180;
    const shadowLengthFactor = Math.tan(zenithRad) * 0.4;
    const shadowLen = Math.min(400, buildingHeightPixels * shadowLengthFactor);

    // Shadow direction vector on screen plane
    const azRad = (solarAzimuth * Math.PI) / 180;
    const shadowDir = new Vector2(
      -Math.sin(azRad),
      Math.cos(azRad) * 0.5 // Compressed for isometric view
    ).normalize();

    // Offset vector from roof corners down to ground shadow tip
    const offset = shadowDir.scale(shadowLen);

    const halfW = buildingWidthPixels / 2;
    const halfH = buildingDepthPixels / 2;

    // Roof diamond vertices
    const rTop = new Vector2(screenOrigin.x, screenOrigin.y - buildingHeightPixels);
    const rRight = new Vector2(screenOrigin.x + halfW, screenOrigin.y - buildingHeightPixels + halfH);
    const rBottom = new Vector2(screenOrigin.x, screenOrigin.y - buildingHeightPixels + buildingDepthPixels);
    const rLeft = new Vector2(screenOrigin.x - halfW, screenOrigin.y - buildingHeightPixels + halfH);

    // Projected ground shadow tip vertices
    const sTop = rTop.clone().add(offset);
    const sRight = rRight.clone().add(offset);
    const sBottom = rBottom.clone().add(offset);
    const sLeft = rLeft.clone().add(offset);

    // Base ground diamond vertices
    const bRight = new Vector2(screenOrigin.x + halfW, screenOrigin.y + halfH);
    const bBottom = new Vector2(screenOrigin.x, screenOrigin.y + buildingDepthPixels);
    const bLeft = new Vector2(screenOrigin.x - halfW, screenOrigin.y + halfH);

    // Convex hull polygon enclosing ground base and extruded shadow tip
    return [
      bLeft, bBottom, bRight, sRight, sBottom, sLeft
    ];
  }
}

// ---------------------------------------------------------------------------
// WEATHER & VOLUMETRIC ATMOSPHERE SYSTEM
// ---------------------------------------------------------------------------

/**
 * Manages rain light dimming, fog density color blending, and lightning flash effects.
 */
export class AtmosphericEnvironment {
  constructor() {
    this.fogDensity = 0.0; // 0.0 (clear) to 1.0 (dense fog)
    this.fogColor = new RGBColor(180, 195, 210, 0.5);
    this.rainIntensity = 0.0; // 0.0 to 1.0
    this.lightningActive = false;
    this.lightningIntensity = 0.0;
    this._lightningTimer = 0.0;
    this._nextLightningDelay = 5.0 + Math.random() * 15.0;
  }

  /**
   * Trigger manual or random thunder lightning flash.
   * @param {number} [intensity=1.0] 
   */
  triggerLightning(intensity = 1.0) {
    this.lightningActive = true;
    this.lightningIntensity = intensity;
    this._lightningTimer = 0.25; // 250ms burst
  }

  /**
   * Update atmospheric effects timer.
   * @param {number} dt Delta time in seconds
   */
  update(dt) {
    if (this.rainIntensity > 0.4) {
      this._nextLightningDelay -= dt;
      if (this._nextLightningDelay <= 0) {
        this.triggerLightning(0.7 + Math.random() * 0.3);
        this._nextLightningDelay = 6.0 + Math.random() * 20.0;
      }
    }

    if (this.lightningActive) {
      this._lightningTimer -= dt;
      if (this._lightningTimer <= 0) {
        this.lightningIntensity *= 0.5; // Decay flash
        if (this.lightningIntensity < 0.05) {
          this.lightningActive = false;
          this.lightningIntensity = 0.0;
        }
      }
    }
  }

  /**
   * Get modified ambient lighting color accounting for fog, rain overcast, and lightning.
   * @param {RGBColor} baseAmbient 
   * @returns {RGBColor}
   */
  applyAtmosphericModulation(baseAmbient) {
    const result = baseAmbient.clone();

    // 1. Rain Overcast: darken ambient light
    if (this.rainIntensity > 0) {
      const rainDarkening = 1.0 - this.rainIntensity * 0.35;
      result.r *= rainDarkening;
      result.g *= rainDarkening;
      result.b *= rainDarkening;
      result.a = Math.min(0.95, result.a + this.rainIntensity * 0.25);
    }

    // 2. Lightning Flash: inject blinding white light
    if (this.lightningActive && this.lightningIntensity > 0) {
      const flash = this.lightningIntensity;
      result.r = result.r * (1 - flash) + 255 * flash;
      result.g = result.g * (1 - flash) + 255 * flash;
      result.b = result.b * (1 - flash) + 255 * flash;
      result.a = Math.max(0.0, result.a - flash * 0.8);
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// MAIN LIGHTING ENGINE & OFFSCREEN MULTI-PASS COMPOSITOR
// ---------------------------------------------------------------------------

/**
 * Main Lighting Engine managing point light list, celestial tracking,
 * offscreen light map rasterization, and final Canvas 2D compositing.
 */
export class LightingEngine {
  /**
   * @param {Object} [options]
   * @param {number} [options.viewportWidth=1920]
   * @param {number} [options.viewportHeight=1080]
   * @param {number} [options.latitude=40.7128]
   */
  constructor(options = {}) {
    this.viewportWidth = options.viewportWidth || 1920;
    this.viewportHeight = options.viewportHeight || 1080;

    this.solarCalc = new SolarCalculator(options.latitude || 40.7128);
    this.shadowProjector = new ShadowProjector();
    this.atmosphere = new AtmosphericEnvironment();

    // Dynamic light pool
    /** @type {Map<string|number, PointLight>} */
    this.pointLights = new Map();

    // Global time & season state
    this.gameHour = 12.0; // 0.0 - 24.0
    this.season = SEASON.SUMMER;
    this.dayOfYear = 172;

    // Offscreen lighting buffer canvas
    this._offscreenCanvas = null;
    this._offscreenCtx = null;
    this._initOffscreenBuffer();

    this.enabled = true;
  }

  /**
   * Initialize offscreen light map buffer.
   * @private
   */
  _initOffscreenBuffer() {
    if (typeof document !== 'undefined') {
      this._offscreenCanvas = document.createElement('canvas');
      this._offscreenCanvas.width = this.viewportWidth;
      this._offscreenCanvas.height = this.viewportHeight;
      this._offscreenCtx = this._offscreenCanvas.getContext('2d');
    }
  }

  /**
   * Resize viewport and offscreen buffer.
   * @param {number} width 
   * @param {number} height 
   */
  resize(width, height) {
    this.viewportWidth = Math.max(1, width);
    this.viewportHeight = Math.max(1, height);
    if (this._offscreenCanvas) {
      this._offscreenCanvas.width = this.viewportWidth;
      this._offscreenCanvas.height = this.viewportHeight;
    }
  }

  /**
   * Register a point light emitter.
   * @param {PointLight} light 
   */
  addLight(light) {
    this.pointLights.set(light.id, light);
  }

  /**
   * Remove a point light emitter by ID.
   * @param {string|number} id 
   */
  removeLight(id) {
    this.pointLights.delete(id);
  }

  /**
   * Clear all point light emitters.
   */
  clearLights() {
    this.pointLights.clear();
  }

  /**
   * Set global clock time.
   * @param {number} hourFloat [0.0 - 24.0]
   */
  setTimeOfDay(hourFloat) {
    this.gameHour = (hourFloat % 24.0 + 24.0) % 24.0;
  }

  /**
   * Interpolate ambient color from 24-hour diurnal stops table.
   * @param {number} hour 
   * @returns {RGBColor}
   */
  getCurrentAmbientColor(hour = this.gameHour) {
    const stops = DIURNAL_AMBIENT_STOPS;
    let lower = stops[0];
    let upper = stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
      if (hour >= stops[i].hour && hour <= stops[i + 1].hour) {
        lower = stops[i];
        upper = stops[i + 1];
        break;
      }
    }

    const range = upper.hour - lower.hour;
    const t = range > 0 ? (hour - lower.hour) / range : 0;
    const blended = lower.color.clone().lerp(upper.color, t);

    // Apply seasonal tint adjustments
    if (this.season === SEASON.WINTER) {
      blended.b = Math.min(255, blended.b * 1.12); // Cooler blue tint
      blended.a = Math.min(0.95, blended.a * 1.05);
    } else if (this.season === SEASON.AUTUMN) {
      blended.r = Math.min(255, blended.r * 1.08); // Warm amber tint
    }

    return this.atmosphere.applyAtmosphericModulation(blended);
  }

  /**
   * Frame update logic for lights, time, and weather.
   * @param {number} dt 
   */
  update(dt) {
    this.atmosphere.update(dt);

    for (const light of this.pointLights.values()) {
      light.update(dt, this.gameHour);
    }
  }

  /**
   * Execute Multi-Pass Offscreen Light Accumulation and composite onto main Canvas context.
   * 
   * @param {CanvasRenderingContext2D} mainCtx Output context
   * @param {IsometricProjection} projection Isometric coordinate transformer
   * @param {IsometricCamera} camera Camera instance
   * @param {Array} [shadowEntities] List of buildings casting ground shadows
   */
  renderLightMap(mainCtx, projection, camera, shadowEntities = []) {
    if (!this.enabled || !this._offscreenCtx) return;

    const ctx = this._offscreenCtx;
    const w = this.viewportWidth;
    const h = this.viewportHeight;

    // Solar state
    const solar = this.solarCalc.calculateSolarPosition(this.gameHour, this.dayOfYear);
    const ambient = this.getCurrentAmbientColor();

    // Clear offscreen light map buffer
    ctx.clearRect(0, 0, w, h);

    // -----------------------------------------------------------------------
    // PASS 1: AMBIENT DAY/NIGHT OVERLAY FILL
    // -----------------------------------------------------------------------
    ctx.fillStyle = ambient.toCSS();
    ctx.fillRect(0, 0, w, h);

    // -----------------------------------------------------------------------
    // PASS 2: BUILDING GROUND SHADOW MASK PASS (If daytime / twilight)
    // -----------------------------------------------------------------------
    if (solar.isDaylight && shadowEntities.length > 0 && ambient.a > 0.1) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 5, 20, ${(0.45 * Math.sin((solar.elevation * Math.PI) / 180)).toFixed(3)})`;

      for (const entity of shadowEntities) {
        const screenPos = projection.worldToScreen(entity.x, entity.y, entity.z || 0);
        const camScreen = camera.worldSpaceToScreen(screenPos.x, screenPos.y);

        const shadowPoly = this.shadowProjector.projectBuildingShadow(
          camScreen,
          (entity.sizeZ || 1) * projection.elevationHeight,
          entity.sizeX * projection.tileWidth,
          entity.sizeY * projection.tileHeight,
          solar.azimuth,
          solar.zenith
        );

        if (shadowPoly.length > 0) {
          ctx.beginPath();
          ctx.moveTo(shadowPoly[0].x, shadowPoly[0].y);
          for (let i = 1; i < shadowPoly.length; i++) {
            ctx.lineTo(shadowPoly[i].x, shadowPoly[i].y);
          }
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // PASS 3: DYNAMIC POINT LIGHT ACCUMULATION PASS
    // -----------------------------------------------------------------------
    // Set composite operation to punches holes out of the dark ambient overlay mask (`destination-out`)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    for (const light of this.pointLights.values()) {
      if (!light.enabled || light._currentIntensity <= 0.01) continue;

      // Transform light grid position to screen space
      const worldPos = projection.worldToScreen(light.x, light.y, light.z);
      const screenPos = camera.worldSpaceToScreen(worldPos.x, worldPos.y);

      // Frustum culling check for light bloom
      if (
        screenPos.x + light.radius < 0 ||
        screenPos.x - light.radius > w ||
        screenPos.y + light.radius < 0 ||
        screenPos.y - light.radius > h
      ) {
        continue; // Outside camera view
      }

      // Create radial radial gradient cutout
      const grad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, light.radius
      );

      const alpha = Math.min(1.0, light._currentIntensity);
      grad.addColorStop(0.0, `rgba(255, 255, 255, ${alpha.toFixed(3)})`);
      grad.addColorStop(0.4, `rgba(255, 255, 255, ${(alpha * 0.6).toFixed(3)})`);
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, light.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // -----------------------------------------------------------------------
    // PASS 4: COLOR GLOW BLEND PASS FOR LIGHT BULBS
    // -----------------------------------------------------------------------
    // Additive color glow pass using `lighter` blend mode
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const light of this.pointLights.values()) {
      if (!light.enabled || light._currentIntensity <= 0.01) continue;

      const worldPos = projection.worldToScreen(light.x, light.y, light.z);
      const screenPos = camera.worldSpaceToScreen(worldPos.x, worldPos.y);

      if (
        screenPos.x + light.radius < 0 ||
        screenPos.x - light.radius > w ||
        screenPos.y + light.radius < 0 ||
        screenPos.y - light.radius > h
      ) {
        continue;
      }

      const grad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, light.radius * 0.6
      );

      const lightColor = light.color.clone();
      lightColor.a = 0.35 * light._currentIntensity;

      grad.addColorStop(0.0, lightColor.toCSS());
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, light.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // -----------------------------------------------------------------------
    // PASS 5: COMPOSITE FINAL LIGHT MAP CANVAS OVER MAIN WORLD SCENE
    // -----------------------------------------------------------------------
    mainCtx.save();
    mainCtx.drawImage(this._offscreenCanvas, 0, 0);
    mainCtx.restore();
  }
}

export default {
  SEASON,
  LIGHT_TYPE,
  ATTENUATION,
  RGBColor,
  DIURNAL_AMBIENT_STOPS,
  SolarCalculator,
  PointLight,
  ShadowProjector,
  AtmosphericEnvironment,
  LightingEngine
};
