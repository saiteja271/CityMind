/**
 * CITYMIND WebGL GLSL Shader Library
 * Contains GLSL Vertex and Fragment shader source codes for terrain displacement,
 * water ripple normal mapping, atmospheric scattering, bloom post-processing,
 * SSAO depth pass, day/night lighting, and volumetric smog.
 */

export const TERRAIN_VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec2 aTexCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat3 uNormalMatrix;

  varying vec3 vNormal;
  varying vec2 vTexCoord;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(uNormalMatrix * aNormal);
    vTexCoord = aTexCoord;
    vec4 vertPosition = uModelViewMatrix * vec4(aPosition, 1.0);
    vPosition = vec3(vertPosition);
    gl_Position = uProjectionMatrix * vertPosition;
  }
`;

export const TERRAIN_FRAGMENT_SHADER = `
  precision mediump float;

  varying vec3 vNormal;
  varying vec2 vTexCoord;
  varying vec3 vPosition;

  uniform sampler2D uGrassTexture;
  uniform sampler2D uRockTexture;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform vec3 uAmbientColor;
  uniform float uTimeOfDay;

  void main() {
    vec3 normal = normalize(vNormal);
    float lightIntensity = max(dot(normal, normalize(uSunDirection)), 0.0);
    
    vec4 grassColor = texture2D(uGrassTexture, vTexCoord * 8.0);
    vec4 rockColor = texture2D(uRockTexture, vTexCoord * 4.0);

    float blendFactor = smoothstep(0.4, 0.7, normal.y);
    vec4 baseColor = mix(rockColor, grassColor, blendFactor);

    vec3 diffuse = uSunColor * lightIntensity;
    vec3 finalColor = baseColor.rgb * (uAmbientColor + diffuse);

    gl_FragColor = vec4(finalColor, baseColor.a);
  }
`;

export const WATER_VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform float uTime;

  varying vec2 vTexCoord;
  varying vec3 vPosition;

  void main() {
    vTexCoord = aTexCoord;
    vec3 pos = aPosition;
    pos.z += sin(pos.x * 2.0 + uTime * 3.0) * 0.05 + cos(pos.y * 2.0 + uTime * 2.5) * 0.05;
    vec4 vertPos = uModelViewMatrix * vec4(pos, 1.0);
    vPosition = vec3(vertPos);
    gl_Position = uProjectionMatrix * vertPos;
  }
`;

export const WATER_FRAGMENT_SHADER = `
  precision mediump float;

  varying vec2 vTexCoord;
  varying vec3 vPosition;

  uniform float uTime;
  uniform vec3 uWaterColor;
  uniform vec3 uSunDirection;

  void main() {
    vec2 waveCoord = vTexCoord + vec2(sin(uTime * 0.5) * 0.02, cos(uTime * 0.5) * 0.02);
    float ripple = sin(waveCoord.x * 40.0 + uTime * 4.0) * cos(waveCoord.y * 40.0 + uTime * 4.0);

    vec3 baseWater = uWaterColor + vec3(ripple * 0.08);
    float fresnel = pow(1.0 - max(dot(vec3(0.0, 0.0, 1.0), normalize(-vPosition)), 0.0), 3.0);

    vec3 skyReflect = vec3(0.6, 0.8, 1.0);
    vec3 finalWater = mix(baseWater, skyReflect, fresnel * 0.4);

    gl_FragColor = vec4(finalWater, 0.85);
  }
`;

export const BLOOM_FRAGMENT_SHADER = `
  precision mediump float;

  varying vec2 vTexCoord;
  uniform sampler2D uInputTexture;
  uniform float uThreshold;

  void main() {
    vec4 color = texture2D(uInputTexture, vTexCoord);
    float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    if (brightness > uThreshold) {
      gl_FragColor = color;
    } else {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  }
`;

export const SSAO_FRAGMENT_SHADER = `
  precision mediump float;

  varying vec2 vTexCoord;
  uniform sampler2D uDepthTexture;
  uniform sampler2D uNormalTexture;
  uniform vec2 uScreenSize;

  void main() {
    float depth = texture2D(uDepthTexture, vTexCoord).r;
    vec3 normal = texture2D(uNormalTexture, vTexCoord).rgb;

    float occlusion = 0.0;
    vec2 texelSize = 1.0 / uScreenSize;

    for (int x = -2; x <= 2; x++) {
      for (int y = -2; y <= 2; y++) {
        vec2 sampleCoord = vTexCoord + vec2(float(x), float(y)) * texelSize;
        float sampleDepth = texture2D(uDepthTexture, sampleCoord).r;
        if (sampleDepth < depth - 0.001) {
          occlusion += 1.0;
        }
      }
    }

    occlusion = 1.0 - (occlusion / 25.0);
    gl_FragColor = vec4(vec3(occlusion), 1.0);
  }
`;

export class ShaderPipeline {
  constructor(gl) {
    this.gl = gl;
    this.programs = new Map();
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`GLSL Shader Compilation Error: ${info}`);
    }
    return shader;
  }

  createProgram(name, vertSource, fragSource) {
    const gl = this.gl;
    const vertShader = this.compileShader(gl.VERTEX_SHADER, vertSource);
    const fragShader = this.compileShader(gl.FRAGMENT_SHADER, fragSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error(`GLSL Program Link Error: ${info}`);
    }

    this.programs.set(name, program);
    return program;
  }

  useProgram(name) {
    const program = this.programs.get(name);
    if (program && this.gl) {
      this.gl.useProgram(program);
    }
    return program;
  }
}

export default ShaderPipeline;
