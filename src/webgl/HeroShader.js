import * as THREE from 'three';

export const HeroVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uAudio;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    vec3 pos = position;

    // Interactive mouse wave
    float dist = distance(uv, uMouse);
    float ripple = sin(dist * 22.0 - uTime * 3.5) * exp(-dist * 3.8);
    
    // Cyber slice glitch displacement on vertices
    float glitchTrigger = step(0.92, sin(uTime * 4.0 + uv.y * 30.0));
    pos.x += glitchTrigger * (sin(uTime * 20.0) * 0.08);

    // Wave displacement
    pos.z += ripple * (0.2 + uHover * 0.35 + uAudio * 0.4);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const HeroFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uAudio;
  uniform vec2 uResolution;

  // Pseudo-random noise
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;

    // Interactive mouse distortion
    vec2 mouseDir = uv - uMouse;
    float dist = length(mouseDir);
    float strength = exp(-dist * 3.2) * (0.05 + uHover * 0.08 + uAudio * 0.08);
    vec2 displacedUv = uv + normalize(mouseDir + 0.0001) * strength * sin(uTime * 3.0 + dist * 12.0);

    // Dynamic horizontal glitch bands (Active Theory style)
    float glitchSlice = step(0.95, sin(uTime * 5.0 + uv.y * 40.0));
    displacedUv.x += glitchSlice * (sin(uTime * 25.0) * 0.035);

    // Chromatic Aberration / RGB Split in Neon Rose & Mauve
    float shift = (0.009 + glitchSlice * 0.02) * (1.0 + uHover * 2.0 + uAudio * 3.0);
    float r = texture2D(uTexture, displacedUv + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, displacedUv).g;
    float b = texture2D(uTexture, displacedUv - vec2(shift, 0.0)).b;
    vec3 baseColor = vec3(r, g, b);

    // Palette Infusion: Mauve shadows and Hot Pink rim highlights
    vec3 mauveTint = vec3(0.61, 0.24, 0.95);
    vec3 pinkGlow = vec3(1.0, 0.16, 0.52);

    // Vignette
    float vig = smoothstep(0.85, 0.2, length(uv - 0.5));
    baseColor *= vig;

    // Edge Rim Glow
    float edge = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.2);
    vec3 edgeGlow = mix(mauveTint, pinkGlow, sin(uTime * 1.5 + uv.y * 4.0) * 0.5 + 0.5) * edge * 0.9;

    // Scanlines
    float scanline = sin(uv.y * 700.0) * 0.035;
    baseColor -= scanline;

    // Contrast adjustment
    baseColor = mix(baseColor, baseColor * baseColor * 1.25, 0.35);
    baseColor += edgeGlow;

    gl_FragColor = vec4(baseColor, 1.0);
  }
`;
