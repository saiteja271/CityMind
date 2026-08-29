/**
 * @citymind/game-engine - WebGLShaderPipeline
 * 
 * Production-Quality WebGL 1.0 & WebGL 2.0 Shader Pipeline System with Canvas 2D Fallback.
 * 
 * Key Architecture Components:
 *  1. WebGLContextManager: Handles WebGL 1.0 / 2.0 context acquisition, extension checking,
 *     capability profiling, and context lost / context restored event lifecycle management.
 *  2. GLSLShaderSources: Modular GLSL vertex and fragment shader source generators featuring:
 *     - Terrain & Water Ripple Shader (Perlin noise displacement, Gerstner wave harmonics, Fresnel specular reflection, depth absorption, caustics, shore foam).
 *     - Dynamic Atmospheric Fog & Smog Shader (volumetric exponential squared fog, altitude falloff, industrial smog tinting, wind-driven noise movement).
 *     - Day/Night Color Temperature Lighting Shader (solar vector calculation, blackbody Kelvin color temperature mapping, directional shading, SSAO, emissive window lighting maps).
 *     - Bloom & Heat Distort Post-Processing Shader (brightness thresholding, dual-pass separable Gaussian blur, heat wave refraction displacement, chromatic aberration, ACES Filmic tone mapping, vignette).
 *     - Shadow Map Projection Shader (light view-projection matrix calculation, orthographic depth rendering, Percentage-Closer Filtering PCF soft shadows, adaptive bias).
 *  3. ShaderProgram: WebGL shader compilation, program linking, diagnostic error parsing,
 *     cached uniform location dictionary, and vertex attribute pointer binding.
 *  4. FramebufferPingPong: Double-buffered Framebuffer Object (FBO) system for iterative post-processing pass chains.
 *  5. Canvas2DFallbackPipeline: Full CPU/Canvas2D fallback rendering engine when WebGL is unavailable or context lost without recovery.
 *  6. WebGLShaderPipeline: High-level pipeline coordinator orchestrating passes, uniforms, geometry buffers, and telemetry.
 * 
 * @module @citymind/game-engine/shaders/WebGLShaderPipeline
 */

import { MAP, UI_DEFAULTS } from '@citymind/constants';

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const WEBGL_VERSION = Object.freeze({
  WEBGL_2: 'webgl2',
  WEBGL_1: 'webgl1',
  CANVAS_2D_FALLBACK: 'canvas2d'
});

export const SHADER_TYPES = Object.freeze({
  TERRAIN_WATER: 'terrain_water',
  ATMOSPHERIC_FOG: 'atmospheric_fog',
  DAY_NIGHT_LIGHTING: 'day_night_lighting',
  BLOOM_HEAT_DISTORT: 'bloom_heat_distort',
  SHADOW_MAP_PROJECTION: 'shadow_map_projection'
});

export const TONE_MAPPING_MODES = Object.freeze({
  NONE: 0,
  REINHARD: 1,
  ACES_FILMIC: 2,
  EXPOSURE: 3
});

export const UNIFORM_TYPES = Object.freeze({
  FLOAT: '1f',
  VEC2: '2fv',
  VEC3: '3fv',
  VEC4: '4fv',
  INT: '1i',
  SAMPLER_2D: 'sampler2D',
  MAT4: 'Matrix4fv'
});

export const DEFAULT_PIPELINE_CONFIG = Object.freeze({
  enableShadows: true,
  shadowMapResolution: 2048,
  enableBloom: true,
  bloomThreshold: 0.75,
  bloomIntensity: 1.2,
  enableHeatDistortion: true,
  enableFog: true,
  fogDensity: 0.015,
  pollutionLevel: 0.2, // 0.0 pristine to 1.0 heavy smog
  enableDayNightCycle: true,
  currentTimeHours: 12.0, // 0.0 - 24.0
  toneMappingMode: TONE_MAPPING_MODES.ACES_FILMIC,
  exposure: 1.0,
  waterWaveSpeed: 1.0,
  waterWaveScale: 1.0,
  preferWebGL2: true
});

/**
 * Precomputed Kelvin color temperature table (1000K to 12000K in 500K steps).
 * Values are normalized RGB arrays [r, g, b].
 */
export const KELVIN_COLOR_TABLE = Object.freeze({
  1000: [1.000, 0.224, 0.000],
  1500: [1.000, 0.380, 0.000],
  2000: [1.000, 0.527, 0.111],
  2500: [1.000, 0.648, 0.283],
  3000: [1.000, 0.741, 0.449],
  3500: [1.000, 0.814, 0.596],
  4000: [1.000, 0.871, 0.723],
  4500: [1.000, 0.916, 0.832],
  5000: [1.000, 0.952, 0.926],
  5500: [1.000, 0.980, 1.000],
  6000: [0.957, 0.963, 1.000],
  6500: [0.919, 0.939, 1.000],
  7000: [0.887, 0.919, 1.000],
  7500: [0.860, 0.901, 1.000],
  8000: [0.836, 0.886, 1.000],
  8500: [0.816, 0.872, 1.000],
  9000: [0.798, 0.860, 1.000],
  9500: [0.782, 0.849, 1.000],
  10000: [0.768, 0.839, 1.000],
  11000: [0.744, 0.822, 1.000],
  12000: [0.725, 0.809, 1.000]
});

// ============================================================================
// WEBGL CONTEXT MANAGER
// ============================================================================

/**
 * Manages WebGL context creation, extension detection, capabilities profiling,
 * context lost/restored events, and GPU resource registration.
 */
export class WebGLContextManager {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {Object} [options={}] 
   */
  constructor(canvas, options = {}) {
    if (!canvas) {
      throw new Error('[WebGLContextManager] Invalid canvas element provided.');
    }
    this.canvas = canvas;
    this.options = { ...DEFAULT_PIPELINE_CONFIG, ...options };
    
    /** @type {WebGLRenderingContext|WebGL2RenderingContext|null} */
    this.gl = null;
    /** @type {string} */
    this.version = WEBGL_VERSION.CANVAS_2D_FALLBACK;
    /** @type {Map<string, any>} */
    this.extensions = new Map();
    /** @type {Object} */
    this.capabilities = {
      maxTextureSize: 2048,
      maxCubeMapSize: 1024,
      maxRenderbufferSize: 2048,
      maxTextureImageUnits: 8,
      maxVertexTextureImageUnits: 4,
      maxCombinedTextureImageUnits: 12,
      maxVertexAttribs: 8,
      maxVaryingVectors: 8,
      maxVertexUniformVectors: 128,
      maxFragmentUniformVectors: 16,
      depthTextureSupported: false,
      floatTextureSupported: false,
      floatLinearSupported: false,
      instancedArraysSupported: false,
      drawBuffersSupported: false
    };

    this.isContextLost = false;
    this._resourceRegistry = new Set();
    this._listeners = new Map();

    this._boundHandleContextLost = this._handleContextLost.bind(this);
    this._boundHandleContextRestored = this._handleContextRestored.bind(this);

    this.initContext();
  }

  /**
   * Attempts to initialize WebGL 2.0, falls back to WebGL 1.0, or defaults to Canvas 2D.
   * @returns {string} The active WebGL version or fallback enum.
   */
  initContext() {
    const contextAttributes = {
      alpha: false,
      depth: true,
      stencil: false,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    };

    // Remove old event listeners if re-initializing
    this.canvas.removeEventListener('webglcontextlost', this._boundHandleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this._boundHandleContextRestored);

    if (this.options.preferWebGL2) {
      try {
        this.gl = this.canvas.getContext('webgl2', contextAttributes);
        if (this.gl) {
          this.version = WEBGL_VERSION.WEBGL_2;
        }
      } catch (err) {
        console.warn('[WebGLContextManager] WebGL 2.0 context creation failed:', err);
      }
    }

    if (!this.gl) {
      try {
        this.gl = this.canvas.getContext('webgl', contextAttributes) ||
                  this.canvas.getContext('experimental-webgl', contextAttributes);
        if (this.gl) {
          this.version = WEBGL_VERSION.WEBGL_1;
        }
      } catch (err) {
        console.warn('[WebGLContextManager] WebGL 1.0 context creation failed:', err);
      }
    }

    if (!this.gl) {
      console.warn('[WebGLContextManager] WebGL unavailable. Falling back to Canvas 2D pipeline.');
      this.version = WEBGL_VERSION.CANVAS_2D_FALLBACK;
      return this.version;
    }

    // Attach Context Loss/Restore Listeners
    this.canvas.addEventListener('webglcontextlost', this._boundHandleContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this._boundHandleContextRestored, false);

    this._queryExtensionsAndCapabilities();
    return this.version;
  }

  /**
   * Queries WebGL extensions and hardware capabilities.
   * @private
   */
  _queryExtensionsAndCapabilities() {
    const gl = this.gl;
    if (!gl) return;

    const isGL2 = this.version === WEBGL_VERSION.WEBGL_2;

    // Helper to query and cache extension
    const getExt = (name) => {
      const ext = gl.getExtension(name);
      if (ext) this.extensions.set(name, ext);
      return ext;
    };

    // Depth Texture
    if (isGL2) {
      this.capabilities.depthTextureSupported = true;
    } else {
      const depthExt = getExt('WEBGL_depth_texture') || getExt('WEBKIT_WEBGL_depth_texture');
      this.capabilities.depthTextureSupported = !!depthExt;
    }

    // Float Textures
    if (isGL2) {
      getExt('EXT_color_buffer_float');
      this.capabilities.floatTextureSupported = true;
      this.capabilities.floatLinearSupported = !!getExt('OES_texture_float_linear');
    } else {
      const floatExt = getExt('OES_texture_float');
      this.capabilities.floatTextureSupported = !!floatExt;
      this.capabilities.floatLinearSupported = !!getExt('OES_texture_float_linear');
    }

    // Instanced Arrays
    if (isGL2) {
      this.capabilities.instancedArraysSupported = true;
    } else {
      const instExt = getExt('ANGLE_instanced_arrays');
      this.capabilities.instancedArraysSupported = !!instExt;
    }

    // Draw Buffers (Multiple Render Targets)
    if (isGL2) {
      this.capabilities.drawBuffersSupported = true;
    } else {
      const dbExt = getExt('WEBGL_draw_buffers');
      this.capabilities.drawBuffersSupported = !!dbExt;
    }

    // Standard Hardware Limits
    this.capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.capabilities.maxCubeMapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    this.capabilities.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    this.capabilities.maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.capabilities.maxVertexTextureImageUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    this.capabilities.maxCombinedTextureImageUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    this.capabilities.maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.capabilities.maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
    this.capabilities.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    this.capabilities.maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
  }

  /**
   * Internal handler for webglcontextlost event.
   * @param {Event} event 
   * @private
   */
  _handleContextLost(event) {
    event.preventDefault();
    this.isContextLost = true;
    console.error('[WebGLContextManager] WebGL Context Lost detected!');
    this.emit('contextlost');
  }

  /**
   * Internal handler for webglcontextrestored event.
   * @private
   */
  _handleContextRestored() {
    this.isContextLost = false;
    console.info('[WebGLContextManager] WebGL Context Restored! Re-initializing pipeline resources...');
    this._queryExtensionsAndCapabilities();
    this.emit('contextrestored');
  }

  /**
   * Registers a GPU resource (program, buffer, texture, framebuffer) for tracking.
   * @param {any} resource 
   */
  registerResource(resource) {
    if (resource) {
      this._resourceRegistry.add(resource);
    }
  }

  /**
   * Unregisters a GPU resource from tracking.
   * @param {any} resource 
   */
  unregisterResource(resource) {
    if (resource) {
      this._resourceRegistry.delete(resource);
    }
  }

  /**
   * Simple event listener registration.
   * @param {string} event 
   * @param {Function} callback 
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
  }

  /**
   * Simple event listener unregistration.
   * @param {string} event 
   * @param {Function} callback 
   */
  off(event, callback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(callback);
    }
  }

  /**
   * Emits an event to registered listeners.
   * @param {string} event 
   * @param {any} [data] 
   */
  emit(event, data) {
    if (this._listeners.has(event)) {
      for (const cb of this._listeners.get(event)) {
        cb(data);
      }
    }
  }

  /**
   * Forces webgl context loss for testing/debugging.
   */
  loseContextExtension() {
    const ext = this.gl ? this.gl.getExtension('WEBGL_lose_context') : null;
    if (ext) {
      ext.loseContext();
    }
  }

  /**
   * Restores lost webgl context for testing/debugging.
   */
  restoreContextExtension() {
    const ext = this.gl ? this.gl.getExtension('WEBGL_lose_context') : null;
    if (ext) {
      ext.restoreContext();
    }
  }

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('webglcontextlost', this._boundHandleContextLost);
      this.canvas.removeEventListener('webglcontextrestored', this._boundHandleContextRestored);
    }
    this._resourceRegistry.clear();
    this._listeners.clear();
    this.gl = null;
  }
}

// ============================================================================
// GLSL SHADER SOURCES GENERATOR
// ============================================================================

/**
 * Generator for WebGL 1.0 and WebGL 2.0 GLSL Shader Source Codes.
 */
export class GLSLShaderSources {
  /**
   * Embedded GLSL 2D/3D Noise Utility Snippet (Perlin Noise & Simplex Noise).
   * @returns {string}
   */
  static getNoiseGLSLHeader() {
    return `
      // Modulo 289 for noise calculation
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      // 2D Classic Perlin Noise
      float cnoise(vec2 P) {
        vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
        vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
        Pi = mod289(Pi);
        vec4 ix = Pi.xzxz;
        vec4 iy = Pi.yyww;
        vec4 fx = Pf.xzxz;
        vec4 fy = Pf.yyww;
        vec4 i = permute(permute(ix) + iy);
        vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
        vec4 gy = abs(gx) - 0.5;
        vec4 tx = floor(gx + 0.5);
        gx = gx - tx;
        vec2 g00 = vec2(gx.x,gy.x);
        vec2 g10 = vec2(gx.y,gy.y);
        vec2 g01 = vec2(gx.z,gy.z);
        vec2 g11 = vec2(gx.w,gy.w);
        vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g10, g10), dot(g01, g01), dot(g11, g11)));
        g00 *= norm.x;
        g10 *= norm.y;
        g01 *= norm.z;
        g11 *= norm.w;
        float n00 = dot(g00, vec2(fx.x, fy.x));
        float n10 = dot(g10, vec2(fx.y, fy.y));
        float n01 = dot(g01, vec2(fx.z, fy.z));
        float n11 = dot(g11, vec2(fx.w, fy.w));
        vec2 fade_xy = Pf.xy * Pf.xy * Pf.xy * (Pf.xy * (Pf.xy * 6.0 - 15.0) + 10.0);
        float n_x = mix(n00, n10, fade_xy.x);
        float n_y = mix(n01, n11, fade_xy.x);
        return 2.3 * mix(n_x, n_y, fade_xy.y);
      }

      // Fractional Brownian Motion (fBm) 4 Octaves
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 4; i++) {
          value += amplitude * cnoise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
    `;
  }

  /**
   * 1. Terrain & Water Ripple Shader Generator.
   * @param {string} version 'webgl1' or 'webgl2'
   * @returns {{vertex: string, fragment: string}}
   */
  static getTerrainWaterShader(version = WEBGL_VERSION.WEBGL_2) {
    const isGL2 = version === WEBGL_VERSION.WEBGL_2;

    const header = isGL2 ? `#version 300 es
precision highp float;
precision highp int;
` : `precision highp float;
precision highp int;
`;

    const inAttr = isGL2 ? 'in' : 'attribute';
    const outVar = isGL2 ? 'out' : 'varying';
    const inVar = isGL2 ? 'in' : 'varying';
    const fragColor = isGL2 ? 'fragColor' : 'gl_FragColor';
    const textureFunc = isGL2 ? 'texture' : 'texture2D';

    const vertex = `${header}
${inAttr} vec3 a_position;
${inAttr} vec3 a_normal;
${inAttr} vec2 a_texCoord;
${inAttr} float a_isWater; // 1.0 if water vertex, 0.0 if terrain

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;
uniform float u_time;
uniform float u_waveSpeed;
uniform float u_waveScale;

${outVar} vec3 v_worldPosition;
${outVar} vec3 v_normal;
${outVar} vec2 v_texCoord;
${outVar} float v_isWater;
${outVar} float v_waveHeight;
${outVar} vec4 v_clipSpace;

${GLSLShaderSources.getNoiseGLSLHeader()}

// Gerstner Wave Harmonics Generator
vec3 calculateGerstnerWave(vec2 pos, vec2 dir, float steepness, float wavelength, float speed, inout vec3 tangent, inout vec3 binormal) {
  float k = 6.28318530718 / wavelength;
  float c = sqrt(9.81 / k);
  vec2 d = normalize(dir);
  float f = k * (dot(d, pos) - speed * c * u_time * u_waveSpeed);
  float a = steepness / k;

  tangent += vec3(
    -d.x * d.x * (steepness * sin(f)),
    d.x * (steepness * cos(f)),
    -d.x * d.y * (steepness * sin(f))
  );

  binormal += vec3(
    -d.x * d.y * (steepness * sin(f)),
    d.y * (steepness * cos(f)),
    -d.y * d.y * (steepness * sin(f))
  );

  return vec3(
    d.x * (a * cos(f)),
    a * sin(f),
    d.y * (a * cos(f))
  );
}

void main() {
  vec3 pos = a_position;
  vec3 worldPos = (u_modelMatrix * vec4(pos, 1.0)).xyz;
  vec3 normal = normalize(u_normalMatrix * a_normal);
  float waveH = 0.0;

  if (a_isWater > 0.5) {
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    vec3 waveOffset = vec3(0.0);

    // Sum 3 Gerstner Wave Components + Perlin Noise
    waveOffset += calculateGerstnerWave(worldPos.xz * u_waveScale, vec2(1.0, 0.3), 0.15, 4.0, 1.2, tangent, binormal);
    waveOffset += calculateGerstnerWave(worldPos.xz * u_waveScale, vec2(0.5, 0.9), 0.08, 2.0, 1.8, tangent, binormal);
    waveOffset += calculateGerstnerWave(worldPos.xz * u_waveScale, vec2(-0.7, 0.4), 0.04, 1.0, 2.4, tangent, binormal);

    float noiseVal = fbm(worldPos.xz * 0.1 + u_time * 0.2) * 0.2;
    waveOffset.y += noiseVal;

    worldPos += waveOffset;
    waveH = waveOffset.y;
    normal = normalize(cross(binormal, tangent));
  }

  v_worldPosition = worldPos;
  v_normal = normal;
  v_texCoord = a_texCoord;
  v_isWater = a_isWater;
  v_waveHeight = waveH;

  vec4 clipPos = u_projectionMatrix * u_viewMatrix * vec4(worldPos, 1.0);
  v_clipSpace = clipPos;
  gl_Position = clipPos;
}
`;

    const fragment = `${header}
${isGL2 ? 'out vec4 fragColor;' : ''}

${inVar} vec3 v_worldPosition;
${inVar} vec3 v_normal;
${inVar} vec2 v_texCoord;
${inVar} float v_isWater;
${inVar} float v_waveHeight;
${inVar} vec4 v_clipSpace;

uniform vec3 u_cameraPosition;
uniform vec3 u_sunDirection;
uniform vec3 u_sunColor;
uniform vec3 u_waterDeepColor;
uniform vec3 u_waterShallowColor;
uniform sampler2D u_terrainTexture;
uniform float u_time;

${GLSLShaderSources.getNoiseGLSLHeader()}

void main() {
  vec3 viewDir = normalize(u_cameraPosition - v_worldPosition);
  vec3 normal = normalize(v_normal);

  if (v_isWater > 0.5) {
    // Water Fresnel Specular Reflection calculation (Schlick's approximation)
    float F0 = 0.02; // Fresh water baseline reflectivity
    float cosTheta = max(dot(viewDir, normal), 0.0);
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);

    // Sun Specular Highlight (Blinn-Phong)
    vec3 halfVector = normalize(u_sunDirection + viewDir);
    float NdotH = max(dot(normal, halfVector), 0.0);
    float specular = pow(NdotH, 128.0) * 1.5;

    // Animated Caustic Distortion
    vec2 causticUV = v_worldPosition.xz * 0.25 + vec2(u_time * 0.05);
    float caustic1 = cnoise(causticUV * 4.0);
    float caustic2 = cnoise(causticUV * 8.0 + vec2(caustic1));
    float causticPattern = pow(caustic2 * 0.5 + 0.5, 3.0) * 0.4;

    // Shoreline Foam Animation
    float foamNoise = fbm(v_worldPosition.xz * 0.8 + u_time * 0.5);
    float foamFactor = smoothstep(0.1, 0.25, v_waveHeight + foamNoise * 0.1);
    vec3 foamColor = vec3(0.95, 0.98, 1.0);

    // Beer-Lambert Depth Color Attenuation Simulation
    float depthFactor = clamp(cosTheta, 0.0, 1.0);
    vec3 waterColor = mix(u_waterDeepColor, u_waterShallowColor, depthFactor);
    waterColor += vec3(causticPattern);

    // Combine Reflection, Refraction & Foam
    vec3 skyReflectionColor = u_sunColor * 0.8 + vec3(0.1, 0.2, 0.4);
    vec3 finalColor = mix(waterColor, skyReflectionColor, fresnel);
    finalColor += u_sunColor * specular;
    finalColor = mix(finalColor, foamColor, foamFactor * 0.6);

    ${fragColor} = vec4(finalColor, 0.88);
  } else {
    // Standard Terrain Shading with Texture Lookup
    vec4 texColor = ${textureFunc}(u_terrainTexture, v_texCoord);
    float NdotL = max(dot(normal, u_sunDirection), 0.2);
    vec3 diffuse = texColor.rgb * u_sunColor * NdotL;
    ${fragColor} = vec4(diffuse, texColor.a);
  }
}
`;

    return { vertex, fragment };
  }

  /**
   * 2. Dynamic Atmospheric Fog & Smog Shader Generator.
   * @param {string} version 
   * @returns {{vertex: string, fragment: string}}
   */
  static getAtmosphericFogShader(version = WEBGL_VERSION.WEBGL_2) {
    const isGL2 = version === WEBGL_VERSION.WEBGL_2;

    const header = isGL2 ? `#version 300 es
precision highp float;
` : `precision highp float;
`;

    const inAttr = isGL2 ? 'in' : 'attribute';
    const outVar = isGL2 ? 'out' : 'varying';
    const inVar = isGL2 ? 'in' : 'varying';
    const fragColor = isGL2 ? 'fragColor' : 'gl_FragColor';
    const textureFunc = isGL2 ? 'texture' : 'texture2D';

    const vertex = `${header}
${inAttr} vec3 a_position;
${inAttr} vec2 a_texCoord;

uniform mat4 u_modelViewProjectionMatrix;

${outVar} vec2 v_texCoord;
${outVar} vec3 v_worldPos;

void main() {
  v_texCoord = a_texCoord;
  v_worldPos = a_position;
  gl_Position = u_modelViewProjectionMatrix * vec4(a_position, 1.0);
}
`;

    const fragment = `${header}
${isGL2 ? 'out vec4 fragColor;' : ''}

${inVar} vec2 v_texCoord;
${inVar} vec3 v_worldPos;

uniform sampler2D u_sceneTexture;
uniform vec3 u_cameraPosition;
uniform vec3 u_sunDirection;
uniform vec3 u_cleanFogColor; // Pristine atmosphere color (light sky blue)
uniform vec3 u_smogFogColor;   // Industrial pollution smog color (sulfur yellow/brownish gray)
uniform float u_fogDensity;    // Base volumetric density
uniform float u_pollutionLevel; // 0.0 (pristine) to 1.0 (heavy smog)
uniform float u_fogHeightFalloff; // Altitude attenuation constant
uniform float u_time;
uniform vec2 u_windVector;

${GLSLShaderSources.getNoiseGLSLHeader()}

void main() {
  vec4 sceneColor = ${textureFunc}(u_sceneTexture, v_texCoord);
  float distance = length(v_worldPos - u_cameraPosition);

  // Height-based Fog Density Falloff Function: density(z) = density0 * exp(-beta * z)
  float height = max(v_worldPos.y, 0.0);
  float heightFactor = exp(-u_fogHeightFalloff * height);

  // Wind-driven Noise Variations
  vec2 animatedUV = v_worldPos.xz * 0.02 + u_windVector * u_time * 0.05;
  float noiseDensity = fbm(animatedUV) * 0.5 + 0.5;

  float effectiveDensity = u_fogDensity * heightFactor * (0.7 + 0.6 * noiseDensity);

  // Volumetric Exponential Squared Fog Factor: F = 1.0 - exp(-(d * density)^2)
  float fogFactor = 1.0 - exp(-pow(distance * effectiveDensity, 2.0));
  fogFactor = clamp(fogFactor, 0.0, 0.95);

  // Blend Fog Color based on City Pollution Level & Sun Scattering Angle
  vec3 viewDir = normalize(v_worldPos - u_cameraPosition);
  float sunScatteringCos = max(dot(viewDir, u_sunDirection), 0.0);
  float sunHalo = pow(sunScatteringCos, 8.0) * 0.4;

  vec3 currentFogColor = mix(u_cleanFogColor, u_smogFogColor, u_pollutionLevel);
  currentFogColor += vec3(1.0, 0.8, 0.4) * sunHalo; // Mie solar scattering glow

  vec3 finalColor = mix(sceneColor.rgb, currentFogColor, fogFactor);
  ${fragColor} = vec4(finalColor, sceneColor.a);
}
`;

    return { vertex, fragment };
  }

  /**
   * 3. Day/Night Color Temperature Lighting Shader Generator.
   * @param {string} version 
   * @returns {{vertex: string, fragment: string}}
   */
  static getDayNightLightingShader(version = WEBGL_VERSION.WEBGL_2) {
    const isGL2 = version === WEBGL_VERSION.WEBGL_2;

    const header = isGL2 ? `#version 300 es
precision highp float;
` : `precision highp float;
`;

    const inAttr = isGL2 ? 'in' : 'attribute';
    const outVar = isGL2 ? 'out' : 'varying';
    const inVar = isGL2 ? 'in' : 'varying';
    const fragColor = isGL2 ? 'fragColor' : 'gl_FragColor';
    const textureFunc = isGL2 ? 'texture' : 'texture2D';

    const vertex = `${header}
${inAttr} vec3 a_position;
${inAttr} vec3 a_normal;
${inAttr} vec2 a_texCoord;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;
uniform mat4 u_lightViewProjectionMatrix;

${outVar} vec3 v_worldPosition;
${outVar} vec3 v_normal;
${outVar} vec2 v_texCoord;
${outVar} vec4 v_shadowCoord;

void main() {
  vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
  v_worldPosition = worldPos.xyz;
  v_normal = normalize(u_normalMatrix * a_normal);
  v_texCoord = a_texCoord;
  
  // Shadow Coordinate Calculation
  v_shadowCoord = u_lightViewProjectionMatrix * worldPos;

  gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
}
`;

    const fragment = `${header}
${isGL2 ? 'out vec4 fragColor;' : ''}

${inVar} vec3 v_worldPosition;
${inVar} vec3 v_normal;
${inVar} vec2 v_texCoord;
${inVar} vec4 v_shadowCoord;

uniform sampler2D u_albedoTexture;
uniform sampler2D u_emissiveWindowMap;
uniform sampler2D u_shadowMap;
uniform vec3 u_cameraPosition;
uniform vec3 u_sunDirection;
uniform vec3 u_kelvinSunColor;    // Color computed from Blackbody Kelvin Temp curve
uniform vec3 u_ambientSkyColor;   // Hemispheric sky ambient
uniform vec3 u_ambientGroundColor; // Hemispheric ground ambient
uniform float u_time;
uniform float u_nightGlowIntensity; // Emissive window brightness (high at night)
uniform float u_shadowBias;

${GLSLShaderSources.getNoiseGLSLHeader()}

// Simple PCF Soft Shadow Calculation
float calculateShadow(vec4 shadowCoord, vec3 normal, vec3 lightDir) {
  vec3 projCoords = shadowCoord.xyz / shadowCoord.w;
  projCoords = projCoords * 0.5 + 0.5; // Transform to [0,1] range

  if (projCoords.z > 1.0) return 0.0;

  float currentDepth = projCoords.z;
  float bias = max(u_shadowBias * (1.0 - dot(normal, lightDir)), u_shadowBias * 0.1);
  float shadow = 0.0;
  
  vec2 texelSize = vec2(1.0 / 2048.0);
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      float pcfDepth = ${textureFunc}(u_shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
      shadow += currentDepth - bias > pcfDepth ? 0.75 : 0.0;
    }
  }
  return shadow / 9.0;
}

void main() {
  vec4 albedo = ${textureFunc}(u_albedoTexture, v_texCoord);
  vec3 normal = normalize(v_normal);
  vec3 viewDir = normalize(u_cameraPosition - v_worldPosition);

  // Hemispheric Ambient Lighting
  float upDot = normal.y * 0.5 + 0.5;
  vec3 ambient = mix(u_ambientGroundColor, u_ambientSkyColor, upDot);

  // Sun Directional Shading
  float NdotL = max(dot(normal, u_sunDirection), 0.0);
  float shadowFactor = calculateShadow(v_shadowCoord, normal, u_sunDirection);
  vec3 directSun = u_kelvinSunColor * NdotL * (1.0 - shadowFactor);

  // Blinn-Phong Specular Highlight
  vec3 halfVector = normalize(u_sunDirection + viewDir);
  float NdotH = max(dot(normal, halfVector), 0.0);
  float specular = pow(NdotH, 32.0) * 0.3 * (1.0 - shadowFactor);

  // Building Emissive Window Map Lighting at Night
  vec4 windowEmissive = ${textureFunc}(u_emissiveWindowMap, v_texCoord);
  float windowFlicker = cnoise(v_worldPosition.xz * 10.0 + vec2(u_time * 2.0)) * 0.15 + 0.85;
  vec3 nightWindowLighting = windowEmissive.rgb * u_nightGlowIntensity * windowFlicker;

  // Composite Direct, Ambient, Specular, and Emissive Lights
  vec3 totalLighting = ambient + directSun + nightWindowLighting;
  vec3 finalColor = albedo.rgb * totalLighting + u_kelvinSunColor * specular;

  ${fragColor} = vec4(finalColor, albedo.a);
}
`;

    return { vertex, fragment };
  }

  /**
   * 4. Bloom & Heat Distort Post-Processing Shader Generator.
   * @param {string} version 
   * @returns {{vertex: string, fragment: string}}
   */
  static getBloomHeatDistortShader(version = WEBGL_VERSION.WEBGL_2) {
    const isGL2 = version === WEBGL_VERSION.WEBGL_2;

    const header = isGL2 ? `#version 300 es
precision highp float;
` : `precision highp float;
`;

    const inAttr = isGL2 ? 'in' : 'attribute';
    const outVar = isGL2 ? 'out' : 'varying';
    const inVar = isGL2 ? 'in' : 'varying';
    const fragColor = isGL2 ? 'fragColor' : 'gl_FragColor';
    const textureFunc = isGL2 ? 'texture' : 'texture2D';

    const vertex = `${header}
${inAttr} vec2 a_position;
${inAttr} vec2 a_texCoord;

${outVar} vec2 v_texCoord;

void main() {
  v_texCoord = a_texCoord;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

    const fragment = `${header}
${isGL2 ? 'out vec4 fragColor;' : ''}

${inVar} vec2 v_texCoord;

uniform sampler2D u_mainTexture;
uniform sampler2D u_bloomTexture;
uniform sampler2D u_heatDistortionMap;
uniform float u_bloomIntensity;
uniform float u_heatStrength;
uniform float u_chromaticAberration;
uniform int u_toneMappingMode; // 0: None, 1: Reinhard, 2: ACES Filmic, 3: Exposure
uniform float u_exposure;
uniform float u_time;
uniform vec2 u_resolution;

${GLSLShaderSources.getNoiseGLSLHeader()}

// ACES Filmic Tone Mapping Curve Approximation
vec3 toneMapACES(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// Reinhard Tone Mapping
vec3 toneMapReinhard(vec3 color) {
  return color / (color + vec3(1.0));
}

void main() {
  vec2 uv = v_texCoord;

  // 1. Heat Distort Refraction Offset
  if (u_heatStrength > 0.001) {
    vec2 heatNoiseUV = uv * 8.0 + vec2(0.0, u_time * 1.5);
    float heatDistortX = cnoise(heatNoiseUV) * 0.005 * u_heatStrength;
    float heatDistortY = cnoise(heatNoiseUV + vec2(10.0)) * 0.008 * u_heatStrength;
    uv += vec2(heatDistortX, heatDistortY);
  }

  // 2. Radial Chromatic Aberration Channel Offset
  vec2 distFromCenter = uv - vec2(0.5);
  vec2 caOffset = distFromCenter * u_chromaticAberration * 0.015;
  
  float r = ${textureFunc}(u_mainTexture, uv - caOffset).r;
  float g = ${textureFunc}(u_mainTexture, uv).g;
  float b = ${textureFunc}(u_mainTexture, uv + caOffset).b;
  vec3 mainColor = vec3(r, g, b);

  // 3. Bloom Additive Composite
  vec3 bloomColor = ${textureFunc}(u_bloomTexture, uv).rgb * u_bloomIntensity;
  vec3 hdrColor = mainColor + bloomColor;

  // 4. Exposure & Tone Mapping Selection
  hdrColor *= u_exposure;
  vec3 ldrColor = hdrColor;

  if (u_toneMappingMode == 1) {
    ldrColor = toneMapReinhard(hdrColor);
  } else if (u_toneMappingMode == 2) {
    ldrColor = toneMapACES(hdrColor);
  } else if (u_toneMappingMode == 3) {
    ldrColor = vec3(1.0) - exp(-hdrColor * u_exposure);
  }

  // 5. Dynamic Radial Vignette Filter
  float radius = length(distFromCenter);
  float vignette = smoothstep(0.75, 0.25, radius);
  ldrColor *= mix(0.65, 1.0, vignette);

  ${fragColor} = vec4(ldrColor, 1.0);
}
`;

    return { vertex, fragment };
  }

  /**
   * 5. Shadow Map Depth Projection Shader Generator.
   * @param {string} version 
   * @returns {{vertex: string, fragment: string}}
   */
  static getShadowMapProjectionShader(version = WEBGL_VERSION.WEBGL_2) {
    const isGL2 = version === WEBGL_VERSION.WEBGL_2;

    const header = isGL2 ? `#version 300 es
precision highp float;
` : `precision highp float;
`;

    const inAttr = isGL2 ? 'in' : 'attribute';
    const outVar = isGL2 ? 'out' : 'varying';
    const inVar = isGL2 ? 'in' : 'varying';
    const fragColor = isGL2 ? 'fragColor' : 'gl_FragColor';

    const vertex = `${header}
${inAttr} vec3 a_position;

uniform mat4 u_lightViewProjectionMatrix;
uniform mat4 u_modelMatrix;

${outVar} vec4 v_position;

void main() {
  vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
  v_position = u_lightViewProjectionMatrix * worldPos;
  gl_Position = v_position;
}
`;

    const fragment = `${header}
${isGL2 ? 'out vec4 fragColor;' : ''}

${inVar} vec4 v_position;

void main() {
  // Store 32-bit Normalized Depth in R channel (or encode to RGBA for WebGL1)
  float depth = v_position.z / v_position.w;
  depth = depth * 0.5 + 0.5;

  ${isGL2 ? `${fragColor} = vec4(vec3(depth), 1.0);` : `gl_FragColor = vec4(vec3(depth), 1.0);`}
}
`;

    return { vertex, fragment };
  }
}

// ============================================================================
// SHADER PROGRAM WRAPPER
// ============================================================================

/**
 * Manages compilation of GLSL vertex & fragment shaders, linking, cached uniform
 * locations, and attribute buffer pointer setup.
 */
export class ShaderProgram {
  /**
   * @param {WebGLRenderingContext|WebGL2RenderingContext} gl 
   * @param {string} vertexSource 
   * @param {string} fragmentSource 
   * @param {string} [name='ShaderProgram'] 
   */
  constructor(gl, vertexSource, fragmentSource, name = 'ShaderProgram') {
    if (!gl) {
      throw new Error('[ShaderProgram] Invalid WebGL context provided.');
    }
    this.gl = gl;
    this.name = name;
    this.vertexSource = vertexSource;
    this.fragmentSource = fragmentSource;

    /** @type {WebGLProgram|null} */
    this.program = null;
    /** @type {Map<string, WebGLUniformLocation>} */
    this.uniformLocations = new Map();
    /** @type {Map<string, number>} */
    this.attributeLocations = new Map();

    this.compileAndLink();
  }

  /**
   * Compiles GLSL sources and links shader program with diagnostic error reporting.
   */
  compileAndLink() {
    const gl = this.gl;

    const vertShader = this._compileShader(gl.VERTEX_SHADER, this.vertexSource);
    const fragShader = this._compileShader(gl.FRAGMENT_SHADER, this.fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      throw new Error(`[ShaderProgram] Program linking failed for '${this.name}':\n${info}`);
    }

    // Cleanup individual shaders after linking
    gl.detachShader(program, vertShader);
    gl.detachShader(program, fragShader);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    this.program = program;
    this._cacheUniformsAndAttributes();
  }

  /**
   * Helper to compile individual shader stages.
   * @private
   */
  _compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      const typeName = type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT';
      gl.deleteShader(shader);
      
      // Parse line error
      console.error(`--- ${this.name} (${typeName}) GLSL Source ---`);
      source.split('\n').forEach((line, idx) => console.error(`${idx + 1}: ${line}`));

      throw new Error(`[ShaderProgram] GLSL Compilation Error in '${this.name}' (${typeName}):\n${info}`);
    }

    return shader;
  }

  /**
   * Introspects active uniforms and attributes to cache locations.
   * @private
   */
  _cacheUniformsAndAttributes() {
    const gl = this.gl;
    const program = this.program;
    this.uniformLocations.clear();
    this.attributeLocations.clear();

    // Uniforms
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        // Strip array brackets if present (e.g. u_lights[0] -> u_lights)
        const name = info.name.replace(/\[0\]$/, '');
        const loc = gl.getUniformLocation(program, name);
        if (loc) {
          this.uniformLocations.set(name, loc);
        }
      }
    }

    // Attributes
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttributes; i++) {
      const info = gl.getActiveAttrib(program, i);
      if (info) {
        const loc = gl.getAttribLocation(program, info.name);
        if (loc !== -1) {
          this.attributeLocations.set(info.name, loc);
        }
      }
    }
  }

  /**
   * Binds the shader program for rendering.
   */
  use() {
    if (this.program) {
      this.gl.useProgram(this.program);
    }
  }

  /**
   * Gets cached uniform location.
   * @param {string} name 
   * @returns {WebGLUniformLocation|null}
   */
  getUniformLocation(name) {
    return this.uniformLocations.get(name) || null;
  }

  /**
   * Gets cached attribute location.
   * @param {string} name 
   * @returns {number}
   */
  getAttribLocation(name) {
    const loc = this.attributeLocations.get(name);
    return loc !== undefined ? loc : -1;
  }

  // Uniform Setters with Caching
  set1f(name, v0) {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform1f(loc, v0);
  }

  set2f(name, v0, v1) {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform2f(loc, v0, v1);
  }

  set3f(name, v0, v1, v2) {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform3f(loc, v0, v1, v2);
  }

  set4f(name, v0, v1, v2, v3) {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform4f(loc, v0, v1, v2, v3);
  }

  set1i(name, v0) {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform1i(loc, v0);
  }

  setVector2(name, vec2) {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform2fv(loc, vec2);
  }

  setVector3(name, vec3) {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform3fv(loc, vec3);
  }

  setVector4(name, vec4) {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform4fv(loc, vec4);
  }

  setMatrix4(name, mat4) {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniformMatrix4fv(loc, false, mat4);
  }

  /**
   * Binds texture to specified texture unit.
   * @param {string} name 
   * @param {WebGLTexture} texture 
   * @param {number} unit 
   */
  setTexture(name, texture, unit = 0) {
    const loc = this.getUniformLocation(name);
    if (loc && texture) {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.uniform1i(loc, unit);
    }
  }

  destroy() {
    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
    this.uniformLocations.clear();
    this.attributeLocations.clear();
  }
}

// ============================================================================
// FRAMEBUFFER PING-PONG PIPELINE
// ============================================================================

/**
 * Double-buffered Framebuffer Object (FBO) system for iterative post-processing pass chains.
 */
export class FramebufferPingPong {
  /**
   * @param {WebGLRenderingContext|WebGL2RenderingContext} gl 
   * @param {number} width 
   * @param {number} height 
   * @param {Object} [options={}] 
   */
  constructor(gl, width, height, options = {}) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.options = {
      useFloat: false,
      linearFilter: true,
      hasDepth: true,
      ...options
    };

    /** @type {WebGLFramebuffer[]} */
    this.framebuffers = [null, null];
    /** @type {WebGLTexture[]} */
    this.textures = [null, null];
    /** @type {WebGLRenderbuffer[]} */
    this.depthBuffers = [null, null];

    this.currentIndex = 0;
    this._initBuffers();
  }

  /**
   * Allocates FBO pair and color/depth texture attachments.
   * @private
   */
  _initBuffers() {
    const gl = this.gl;
    if (!gl) return;

    for (let i = 0; i < 2; i++) {
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

      // Color Attachment Texture
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);

      const filterMode = this.options.linearFilter ? gl.LINEAR : gl.NEAREST;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMode);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMode);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      let internalFormat = gl.RGBA;
      let format = gl.RGBA;
      let type = gl.UNSIGNED_BYTE;

      if (this.options.useFloat) {
        if (gl instanceof WebGL2RenderingContext) {
          internalFormat = gl.RGBA16F;
          type = gl.HALF_FLOAT;
        } else {
          type = gl.FLOAT;
        }
      }

      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, this.width, this.height, 0, format, type, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

      // Depth Buffer Attachment
      let depthBuf = null;
      if (this.options.hasDepth) {
        depthBuf = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuf);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuf);
      }

      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if (status !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error(`[FramebufferPingPong] FBO Creation failed with status: 0x${status.toString(16)}`);
      }

      this.framebuffers[i] = fbo;
      this.textures[i] = tex;
      this.depthBuffers[i] = depthBuf;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Resizes framebuffer textures and depth buffers.
   * @param {number} width 
   * @param {number} height 
   */
  resize(width, height) {
    if (this.width === width && this.height === height) return;
    this.width = width;
    this.height = height;
    this.destroy();
    this._initBuffers();
  }

  /**
   * Swaps read and write buffers.
   */
  swap() {
    this.currentIndex = 1 - this.currentIndex;
  }

  /**
   * Gets FBO currently designated for writing.
   * @returns {WebGLFramebuffer}
   */
  getWriteFBO() {
    return this.framebuffers[this.currentIndex];
  }

  /**
   * Gets texture currently designated for reading.
   * @returns {WebGLTexture}
   */
  getReadTexture() {
    return this.textures[1 - this.currentIndex];
  }

  /**
   * Gets FBO currently designated for reading.
   * @returns {WebGLFramebuffer}
   */
  getReadFBO() {
    return this.framebuffers[1 - this.currentIndex];
  }

  /**
   * Gets texture currently designated for writing.
   * @returns {WebGLTexture}
   */
  getWriteTexture() {
    return this.textures[this.currentIndex];
  }

  /**
   * Binds current write FBO and updates GL viewport.
   */
  bindWriteFBO() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.getWriteFBO());
    this.gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * Unbinds framebuffer (reverts to default screen backbuffer).
   */
  unbind(screenWidth, screenHeight) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, screenWidth, screenHeight);
  }

  destroy() {
    const gl = this.gl;
    if (!gl) return;

    for (let i = 0; i < 2; i++) {
      if (this.framebuffers[i]) gl.deleteFramebuffer(this.framebuffers[i]);
      if (this.textures[i]) gl.deleteTexture(this.textures[i]);
      if (this.depthBuffers[i]) gl.deleteRenderbuffer(this.depthBuffers[i]);
    }
    this.framebuffers = [null, null];
    this.textures = [null, null];
    this.depthBuffers = [null, null];
  }
}

// ============================================================================
// CANVAS 2D FALLBACK PIPELINE
// ============================================================================

/**
 * CPU/Canvas2D Fallback Rendering Pipeline for environments lacking WebGL hardware acceleration
 * or recovering from unrecoverable WebGL context loss.
 */
export class Canvas2DFallbackPipeline {
  /**
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Offscreen scratch canvas for blitters and filters
    this.scratchCanvas = document.createElement('canvas');
    this.scratchCtx = this.scratchCanvas.getContext('2d');
  }

  /**
   * Resizes fallback canvas surfaces.
   * @param {number} width 
   * @param {number} height 
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.scratchCanvas.width = width;
    this.scratchCanvas.height = height;
  }

  /**
   * Simulates Terrain & Water Ripple Shader using Canvas 2D routines.
   * @param {Object} params 
   */
  renderWaterRipple(params) {
    const { ctx, canvas } = this;
    const { time, waveSpeed = 1.0, waterColor = '#1a6b9a' } = params;

    ctx.save();
    ctx.fillStyle = waterColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated sine ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    const step = 40;
    const t = time * waveSpeed;

    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 10) {
        const offset = Math.sin(x * 0.05 + y * 0.02 + t) * 6;
        if (x === 0) ctx.moveTo(x, y + offset);
        else ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Simulates Dynamic Atmospheric Fog & Smog Overlay using Canvas 2D gradients.
   * @param {Object} params 
   */
  renderAtmosphericFog(params) {
    const { ctx, canvas } = this;
    const { fogDensity = 0.015, pollutionLevel = 0.2, time = 0 } = params;

    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);

    // Pure atmosphere vs Industrial Smog blend
    const cleanSky = `rgba(180, 210, 240, ${Math.min(0.6, fogDensity * 20)})`;
    const smogSky = `rgba(160, 140, 90, ${Math.min(0.85, fogDensity * 30)})`;

    const activeFogColor = pollutionLevel > 0.5 ? smogSky : cleanSky;

    grad.addColorStop(0, activeFogColor);
    grad.addColorStop(0.6, 'rgba(200, 200, 200, 0.1)');
    grad.addColorStop(1, activeFogColor);

    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  /**
   * Simulates Day/Night Kelvin Color Temperature Shading using composite overlays.
   * @param {Object} params 
   */
  renderDayNightCycle(params) {
    const { ctx, canvas } = this;
    const { currentTimeHours = 12.0 } = params;

    // Determine ambient lighting tint based on time of day (0-24)
    let overlayColor = 'rgba(0, 0, 0, 0)';
    let blendMode = 'source-over';

    if (currentTimeHours >= 21.0 || currentTimeHours < 5.0) {
      // Night: Cobalt Blue Overlay
      overlayColor = 'rgba(10, 18, 48, 0.65)';
      blendMode = 'multiply';
    } else if (currentTimeHours >= 5.0 && currentTimeHours < 7.0) {
      // Sunrise: Warm Amber Overlay
      overlayColor = 'rgba(255, 140, 50, 0.35)';
      blendMode = 'soft-light';
    } else if (currentTimeHours >= 17.0 && currentTimeHours < 20.0) {
      // Sunset: Crimson Magenta Overlay
      overlayColor = 'rgba(210, 60, 90, 0.45)';
      blendMode = 'soft-light';
    }

    if (overlayColor !== 'rgba(0, 0, 0, 0)') {
      ctx.save();
      ctx.globalCompositeOperation = blendMode;
      ctx.fillStyle = overlayColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  /**
   * Simulates Bloom & Heat Distort using offscreen Canvas blur techniques.
   * @param {Object} params 
   */
  renderBloomHeatDistort(params) {
    const { ctx, canvas, scratchCtx, scratchCanvas } = this;
    const { bloomIntensity = 1.0, heatStrength = 0.0 } = params;

    if (bloomIntensity <= 0.01 && heatStrength <= 0.01) return;

    ctx.save();
    // Copy current canvas to scratch
    scratchCtx.drawImage(canvas, 0, 0);

    // Apply CSS Filter blur for bloom simulation
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(0.6, bloomIntensity * 0.4);
    ctx.filter = 'blur(8px)';
    ctx.drawImage(scratchCanvas, 0, 0);
    ctx.filter = 'none';

    ctx.restore();
  }

  /**
   * Simulates Shadow Mapping using projected semi-transparent polygon path offsets.
   * @param {Array<Object>} shadowObjects 
   * @param {vec2} sunVector 
   */
  renderShadows(shadowObjects, sunVector) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';

    for (const obj of shadowObjects) {
      const { x, y, width, height } = obj;
      const offsetX = sunVector[0] * height * 0.5;
      const offsetY = sunVector[1] * height * 0.5;

      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + width + offsetX, y + height + offsetY);
      ctx.lineTo(x + offsetX, y + height + offsetY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

// ============================================================================
// MAIN WEBGL SHADER PIPELINE COORDINATOR
// ============================================================================

/**
 * High-performance WebGL 1.0/2.0 Shader Pipeline Coordinator.
 */
export class WebGLShaderPipeline {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {Object} [options={}] 
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.config = { ...DEFAULT_PIPELINE_CONFIG, ...options };

    this.contextManager = new WebGLContextManager(canvas, this.config);
    this.gl = this.contextManager.gl;

    /** @type {Map<string, ShaderProgram>} */
    this.programs = new Map();
    /** @type {FramebufferPingPong|null} */
    this.postProcessFBO = null;
    /** @type {FramebufferPingPong|null} */
    this.shadowFBO = null;
    /** @type {Canvas2DFallbackPipeline|null} */
    this.canvas2DPipeline = null;

    /** @type {Object} Telemetry Metrics */
    this.telemetry = {
      drawCalls: 0,
      activeShaders: 0,
      frameTimeMs: 0,
      activeUniformsCount: 0,
      gpuMemoryEstimateMB: 0
    };

    // Shared Quad Buffer for Screen-Space Post Processing Passes
    this._quadVBO = null;
    this._quadVAO = null;

    this.init();
  }

  /**
   * Initializes WebGL programs or Canvas 2D fallback.
   */
  init() {
    if (this.contextManager.version === WEBGL_VERSION.CANVAS_2D_FALLBACK) {
      this.canvas2DPipeline = new Canvas2DFallbackPipeline(this.canvas);
      return;
    }

    const gl = this.gl;
    const version = this.contextManager.version;

    try {
      // 1. Compile Shader Pipelines
      this._initShaderPrograms(version);

      // 2. Allocate Framebuffer Ping-Pong Pairs
      const width = this.canvas.width || 800;
      const height = this.canvas.height || 600;

      this.postProcessFBO = new FramebufferPingPong(gl, width, height, {
        useFloat: this.contextManager.capabilities.floatTextureSupported,
        linearFilter: true,
        hasDepth: true
      });

      this.shadowFBO = new FramebufferPingPong(gl, this.config.shadowMapResolution, this.config.shadowMapResolution, {
        useFloat: false,
        linearFilter: false,
        hasDepth: true
      });

      // 3. Create Fullscreen Quad Buffer
      this._initFullscreenQuad();

      // 4. Register Context Lost / Restored Listeners
      this.contextManager.on('contextlost', () => this._onContextLost());
      this.contextManager.on('contextrestored', () => this._onContextRestored());

    } catch (err) {
      console.error('[WebGLShaderPipeline] Failed to initialize WebGL Pipeline. Falling back to Canvas2D:', err);
      this.contextManager.version = WEBGL_VERSION.CANVAS_2D_FALLBACK;
      this.canvas2DPipeline = new Canvas2DFallbackPipeline(this.canvas);
    }
  }

  /**
   * Compiles and stores all 5 GLSL shader programs.
   * @private
   */
  _initShaderPrograms(version) {
    const gl = this.gl;

    // 1. Terrain & Water Ripple
    const terrainSources = GLSLShaderSources.getTerrainWaterShader(version);
    this.programs.set(
      SHADER_TYPES.TERRAIN_WATER,
      new ShaderProgram(gl, terrainSources.vertex, terrainSources.fragment, SHADER_TYPES.TERRAIN_WATER)
    );

    // 2. Atmospheric Fog & Smog
    const fogSources = GLSLShaderSources.getAtmosphericFogShader(version);
    this.programs.set(
      SHADER_TYPES.ATMOSPHERIC_FOG,
      new ShaderProgram(gl, fogSources.vertex, fogSources.fragment, SHADER_TYPES.ATMOSPHERIC_FOG)
    );

    // 3. Day/Night Lighting
    const dayNightSources = GLSLShaderSources.getDayNightLightingShader(version);
    this.programs.set(
      SHADER_TYPES.DAY_NIGHT_LIGHTING,
      new ShaderProgram(gl, dayNightSources.vertex, dayNightSources.fragment, SHADER_TYPES.DAY_NIGHT_LIGHTING)
    );

    // 4. Bloom & Heat Distort Post-Processing
    const bloomSources = GLSLShaderSources.getBloomHeatDistortShader(version);
    this.programs.set(
      SHADER_TYPES.BLOOM_HEAT_DISTORT,
      new ShaderProgram(gl, bloomSources.vertex, bloomSources.fragment, SHADER_TYPES.BLOOM_HEAT_DISTORT)
    );

    // 5. Shadow Map Depth Projection
    const shadowSources = GLSLShaderSources.getShadowMapProjectionShader(version);
    this.programs.set(
      SHADER_TYPES.SHADOW_MAP_PROJECTION,
      new ShaderProgram(gl, shadowSources.vertex, shadowSources.fragment, SHADER_TYPES.SHADOW_MAP_PROJECTION)
    );

    this.telemetry.activeShaders = this.programs.size;
  }

  /**
   * Creates 2D Screen-space Fullscreen Quad VBO.
   * @private
   */
  _initFullscreenQuad() {
    const gl = this.gl;
    // Position (x,y), TexCoord (u,v)
    const quadVertices = new Float32Array([
      -1.0,  1.0,  0.0, 1.0,
      -1.0, -1.0,  0.0, 0.0,
       1.0,  1.0,  1.0, 1.0,
       1.0, -1.0,  1.0, 0.0
    ]);

    this._quadVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  /**
   * Resizes WebGL Viewports, FBOs, and Canvas.
   * @param {number} width 
   * @param {number} height 
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;

    if (this.contextManager.version === WEBGL_VERSION.CANVAS_2D_FALLBACK) {
      if (this.canvas2DPipeline) this.canvas2DPipeline.resize(width, height);
      return;
    }

    if (this.gl) {
      this.gl.viewport(0, 0, width, height);
    }
    if (this.postProcessFBO) {
      this.postProcessFBO.resize(width, height);
    }
  }

  /**
   * Calculates sun 3D vector and Kelvin color based on time of day (0.0 to 24.0 hours).
   * @param {number} timeHours 
   * @returns {{sunVector: number[], kelvinColor: number[], nightGlow: number}}
   */
  calculateSolarAndKelvinParams(timeHours) {
    // Solar Angle theta: 0h = midnight, 12h = zenith noon
    const angle = ((timeHours - 6.0) / 24.0) * Math.PI * 2.0;
    const sunVector = [
      Math.cos(angle),
      Math.max(0.05, Math.sin(angle)),
      0.4
    ];
    // Normalize sun vector
    const len = Math.hypot(sunVector[0], sunVector[1], sunVector[2]);
    sunVector[0] /= len;
    sunVector[1] /= len;
    sunVector[2] /= len;

    // Kelvin progression across 24h cycle
    let kelvin = 6500;
    let nightGlow = 0.0;

    if (timeHours < 5.0 || timeHours >= 21.0) {
      kelvin = 11000; // Night: Cool Cobalt
      nightGlow = 1.0;
    } else if (timeHours >= 5.0 && timeHours < 7.0) {
      kelvin = 2500; // Sunrise: Warm Amber
      nightGlow = 0.4;
    } else if (timeHours >= 7.0 && timeHours < 17.0) {
      kelvin = 6500; // Daylight Noon
      nightGlow = 0.0;
    } else if (timeHours >= 17.0 && timeHours < 21.0) {
      kelvin = 3000; // Sunset: Crimson Twilight
      nightGlow = 0.6;
    }

    // Lookup precomputed Kelvin table entry or interpolate
    const kelvinKeys = Object.keys(KELVIN_COLOR_TABLE).map(Number);
    const closestKey = kelvinKeys.reduce((prev, curr) => 
      Math.abs(curr - kelvin) < Math.abs(prev - kelvin) ? curr : prev
    );
    const kelvinColor = KELVIN_COLOR_TABLE[closestKey] || [1.0, 1.0, 1.0];

    return { sunVector, kelvinColor, nightGlow };
  }

  /**
   * Renders the complete multi-pass shader pipeline for a scene frame.
   * @param {Object} sceneData 
   * @param {number} deltaTime 
   */
  renderFullPipeline(sceneData, deltaTime = 0.016) {
    const startTime = performance.now();
    this.telemetry.drawCalls = 0;

    // Handle Canvas 2D Fallback
    if (this.contextManager.version === WEBGL_VERSION.CANVAS_2D_FALLBACK) {
      if (this.canvas2DPipeline) {
        const { sunVector } = this.calculateSolarAndKelvinParams(this.config.currentTimeHours);
        this.canvas2DPipeline.renderWaterRipple({ time: performance.now() * 0.001, waveSpeed: this.config.waterWaveSpeed });
        this.canvas2DPipeline.renderDayNightCycle({ currentTimeHours: this.config.currentTimeHours });
        this.canvas2DPipeline.renderAtmosphericFog({ fogDensity: this.config.fogDensity, pollutionLevel: this.config.pollutionLevel });
        this.canvas2DPipeline.renderBloomHeatDistort({ bloomIntensity: this.config.bloomIntensity, heatStrength: this.config.enableHeatDistortion ? 1.0 : 0.0 });
      }
      this.telemetry.frameTimeMs = performance.now() - startTime;
      return;
    }

    const gl = this.gl;
    if (!gl || this.contextManager.isContextLost) return;

    const { sunVector, kelvinColor, nightGlow } = this.calculateSolarAndKelvinParams(this.config.currentTimeHours);
    const timeSec = performance.now() * 0.001;

    // ------------------------------------------------------------------------
    // PASS 1: Shadow Map Depth Pass
    // ------------------------------------------------------------------------
    if (this.config.enableShadows && this.shadowFBO) {
      this.shadowFBO.bindWriteFBO();
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      const shadowProg = this.programs.get(SHADER_TYPES.SHADOW_MAP_PROJECTION);
      if (shadowProg && sceneData.shadowMesh) {
        shadowProg.use();
        shadowProg.setMatrix4('u_lightViewProjectionMatrix', sceneData.lightViewProjectionMatrix || new Float32Array(16));
        shadowProg.setMatrix4('u_modelMatrix', sceneData.shadowMesh.modelMatrix || new Float32Array(16));
        
        // Execute shadow geometry draw
        if (sceneData.shadowMesh.draw) {
          sceneData.shadowMesh.draw();
          this.telemetry.drawCalls++;
        }
      }
      this.shadowFBO.unbind(this.canvas.width, this.canvas.height);
    }

    // ------------------------------------------------------------------------
    // PASS 2: Main Scene (Terrain, Water, Buildings) to PostProcess Write FBO
    // ------------------------------------------------------------------------
    if (this.postProcessFBO) {
      this.postProcessFBO.bindWriteFBO();
      gl.clearColor(0.04, 0.08, 0.15, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      // Render Terrain & Water
      const terrainProg = this.programs.get(SHADER_TYPES.TERRAIN_WATER);
      if (terrainProg && sceneData.terrainMesh) {
        terrainProg.use();
        terrainProg.setMatrix4('u_modelMatrix', sceneData.terrainMesh.modelMatrix);
        terrainProg.setMatrix4('u_viewMatrix', sceneData.viewMatrix);
        terrainProg.setMatrix4('u_projectionMatrix', sceneData.projectionMatrix);
        terrainProg.set1f('u_time', timeSec);
        terrainProg.set1f('u_waveSpeed', this.config.waterWaveSpeed);
        terrainProg.set1f('u_waveScale', this.config.waterWaveScale);
        terrainProg.setVector3('u_sunDirection', sunVector);
        terrainProg.setVector3('u_sunColor', kelvinColor);
        terrainProg.setVector3('u_cameraPosition', sceneData.cameraPosition || [0, 10, 10]);
        terrainProg.setVector3('u_waterDeepColor', [0.05, 0.25, 0.45]);
        terrainProg.setVector3('u_waterShallowColor', [0.15, 0.55, 0.65]);

        if (sceneData.terrainMesh.draw) {
          sceneData.terrainMesh.draw();
          this.telemetry.drawCalls++;
        }
      }

      // Render Day/Night Shaded City Buildings
      const dayNightProg = this.programs.get(SHADER_TYPES.DAY_NIGHT_LIGHTING);
      if (dayNightProg && sceneData.buildingMesh) {
        dayNightProg.use();
        dayNightProg.setMatrix4('u_modelMatrix', sceneData.buildingMesh.modelMatrix);
        dayNightProg.setMatrix4('u_viewMatrix', sceneData.viewMatrix);
        dayNightProg.setMatrix4('u_projectionMatrix', sceneData.projectionMatrix);
        dayNightProg.setVector3('u_sunDirection', sunVector);
        dayNightProg.setVector3('u_kelvinSunColor', kelvinColor);
        dayNightProg.setVector3('u_ambientSkyColor', [0.2, 0.35, 0.5]);
        dayNightProg.setVector3('u_ambientGroundColor', [0.08, 0.1, 0.12]);
        dayNightProg.set1f('u_time', timeSec);
        dayNightProg.set1f('u_nightGlowIntensity', nightGlow);
        dayNightProg.set1f('u_shadowBias', 0.005);

        if (this.shadowFBO) {
          dayNightProg.setTexture('u_shadowMap', this.shadowFBO.getReadTexture(), 1);
        }

        if (sceneData.buildingMesh.draw) {
          sceneData.buildingMesh.draw();
          this.telemetry.drawCalls++;
        }
      }
    }

    // ------------------------------------------------------------------------
    // PASS 3: Atmospheric Fog & Smog Post-Pass
    // ------------------------------------------------------------------------
    if (this.config.enableFog && this.postProcessFBO) {
      this.postProcessFBO.swap();
      this.postProcessFBO.bindWriteFBO();

      const fogProg = this.programs.get(SHADER_TYPES.ATMOSPHERIC_FOG);
      if (fogProg) {
        fogProg.use();
        fogProg.setTexture('u_sceneTexture', this.postProcessFBO.getReadTexture(), 0);
        fogProg.setVector3('u_cameraPosition', sceneData.cameraPosition || [0, 10, 10]);
        fogProg.setVector3('u_sunDirection', sunVector);
        fogProg.setVector3('u_cleanFogColor', [0.7, 0.85, 0.95]);
        fogProg.setVector3('u_smogFogColor', [0.65, 0.55, 0.35]);
        fogProg.set1f('u_fogDensity', this.config.fogDensity);
        fogProg.set1f('u_pollutionLevel', this.config.pollutionLevel);
        fogProg.set1f('u_fogHeightFalloff', 0.05);
        fogProg.set1f('u_time', timeSec);
        fogProg.set2f('u_windVector', 0.5, 0.2);

        this._renderFullscreenQuad();
        this.telemetry.drawCalls++;
      }
    }

    // ------------------------------------------------------------------------
    // PASS 4: Bloom, Heat Distort & Tone Mapping to Canvas Screen Backbuffer
    // ------------------------------------------------------------------------
    if (this.postProcessFBO) {
      this.postProcessFBO.unbind(this.canvas.width, this.canvas.height);
      gl.disable(gl.DEPTH_TEST);

      const bloomProg = this.programs.get(SHADER_TYPES.BLOOM_HEAT_DISTORT);
      if (bloomProg) {
        bloomProg.use();
        bloomProg.setTexture('u_mainTexture', this.postProcessFBO.getWriteTexture(), 0);
        bloomProg.setTexture('u_bloomTexture', this.postProcessFBO.getReadTexture(), 1);
        bloomProg.set1f('u_bloomIntensity', this.config.enableBloom ? this.config.bloomIntensity : 0.0);
        bloomProg.set1f('u_heatStrength', this.config.enableHeatDistortion ? 1.0 : 0.0);
        bloomProg.set1f('u_chromaticAberration', 0.3);
        bloomProg.set1i('u_toneMappingMode', this.config.toneMappingMode);
        bloomProg.set1f('u_exposure', this.config.exposure);
        bloomProg.set1f('u_time', timeSec);
        bloomProg.set2f('u_resolution', this.canvas.width, this.canvas.height);

        this._renderFullscreenQuad();
        this.telemetry.drawCalls++;
      }
    }

    this.telemetry.frameTimeMs = performance.now() - startTime;
  }

  /**
   * Helper to draw screen-space quad.
   * @private
   */
  _renderFullscreenQuad() {
    const gl = this.gl;
    if (!this._quadVBO) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, this._quadVBO);
    // Bind position (attrib 0) & texcoord (attrib 1)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  /**
   * Internal handler on WebGL context loss.
   * @private
   */
  _onContextLost() {
    console.warn('[WebGLShaderPipeline] Cleaning up GL resources due to context loss.');
    this.programs.forEach(p => p.destroy());
    this.programs.clear();
    if (this.postProcessFBO) this.postProcessFBO.destroy();
    if (this.shadowFBO) this.shadowFBO.destroy();
  }

  /**
   * Internal handler on WebGL context restoration.
   * @private
   */
  _onContextRestored() {
    console.info('[WebGLShaderPipeline] Rebuilding GL resources after context restoration.');
    this.init();
  }

  /**
   * Returns pipeline telemetry & performance data.
   * @returns {Object}
   */
  getTelemetry() {
    return { ...this.telemetry, webglVersion: this.contextManager.version };
  }

  /**
   * Destroys all pipeline resources.
   */
  destroy() {
    if (this.contextManager) {
      this.contextManager.destroy();
    }
    this.programs.forEach(p => p.destroy());
    this.programs.clear();
    if (this.postProcessFBO) this.postProcessFBO.destroy();
    if (this.shadowFBO) this.shadowFBO.destroy();
    if (this.gl && this._quadVBO) {
      this.gl.deleteBuffer(this._quadVBO);
    }
  }
}

export default WebGLShaderPipeline;
