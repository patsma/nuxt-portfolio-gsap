/**
 * FluidGradient - Mobile Fragment Shader
 * Simplified for performance (~85% GPU reduction)
 * Removes rotation, uses simpler noise
 * Scroll-reactive: sectionIntensity affects brightness
 */
precision mediump float;

uniform float time;
uniform float sectionIntensity;
uniform vec3 colorTL;
uniform vec3 colorTR;
uniform vec3 colorBL;
uniform vec3 colorBR;

varying vec2 vUv;

float noise(vec2 uv, float t) {
  return (1.0 + sin(uv.x * 4.0 + uv.y * 3.0 + t)) * 0.5;
}

void main() {
  float n = noise(vUv, time * 0.5);
  vec3 top = mix(colorTL, colorTR, vUv.x);
  vec3 bottom = mix(colorBL, colorBR, vUv.x);
  vec3 color = mix(top, bottom, n) * sectionIntensity;
  gl_FragColor = vec4(color, 1.0);
}
