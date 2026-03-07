/**
 * FluidGradient - Desktop Fragment Shader
 * Full quality with rotation and complex noise
 * Scroll-reactive: noiseScale affects pattern, sectionIntensity affects brightness
 */
precision mediump float;

uniform float time;
uniform float scrollInfluence;
uniform float sectionIntensity;
uniform float noiseScale;
uniform vec3 colorTL;
uniform vec3 colorTR;
uniform vec3 colorBL;
uniform vec3 colorBR;

varying vec2 vUv;

float noise(vec2 uv, float t, float scale) {
  return (1.0 + sin(uv.x * scale + t) + cos(uv.y * scale + t)) * 0.5;
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

vec3 getColor(vec2 uv, float t) {
  vec3 topLeft = colorTL;
  vec3 topRight = colorTR;
  vec3 bottomLeft = colorBL;
  vec3 bottomRight = colorBR;

  vec2 center = vec2(0.5, 0.5);
  vec2 rotatedUV = rotate(uv - center, t * 0.05) + center;

  // Use noiseScale uniform for dynamic pattern control
  vec2 noiseUV = vec2(noise(rotatedUV, t * 0.5, noiseScale), noise(rotatedUV, t * 0.75, noiseScale));
  vec3 color = mix(mix(topLeft, topRight, noiseUV.x), mix(bottomLeft, bottomRight, noiseUV.x), noiseUV.y);
  return color;
}

void main() {
  vec3 color = getColor(vUv, time);
  // Apply section intensity (brightness multiplier)
  color *= sectionIntensity;
  gl_FragColor = vec4(color, 1.0);
}
