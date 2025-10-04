<template>
  <div
    ref="containerRef"
    class="fluid-gradient fixed left-0 top-0 z-0 w-full h-screen pointer-events-none"
    aria-hidden="true"
  >
    <!--
      TresJS scene with a fullscreen shader plane.
      Renders a fluid animated gradient background that responds to theme changes.
    -->
    <TresCanvas
      v-if="isMounted"
      class="w-full h-full opacity-40"
      clearColor="#0b0b10"
      :antialias="true"
      :renderMode="'always'"
    >
      <!-- Orthographic camera so a 2x2 plane fills the view nicely -->
      <TresOrthographicCamera
        :args="[-1, 1, 1, -1, 0.1, 10]"
        :position="{ z: 1 }"
      />

      <!-- Fullscreen plane with a custom fragment shader -->
      <TresMesh>
        <TresPlaneGeometry :args="[2, 2]" />
        <TresShaderMaterial
          :uniforms="uniforms"
          :vertexShader="vertexShader"
          :fragmentShader="fragmentShader"
          :transparent="false"
        />
      </TresMesh>
    </TresCanvas>
  </div>
</template>

<script setup>
/**
 * FluidGradient
 *
 * TresJS-based canvas background with fluid gradient shader.
 * - Uses a simple fluid-like gradient fragment shader
 * - Drives a single `time` uniform with GSAP for smooth animation
 * - Sits behind all content as a fullscreen background effect
 */

// Standard GSAP from Nuxt app
const { $gsap } = useNuxtApp();

// Core refs
const containerRef = ref(null);
const timeline = ref(null);
const isMounted = ref(false);
let gsapCtx = null;

/**
 * Shader uniforms (reactive so GSAP can tween nested .value)
 */
const uniforms = reactive({
  time: { value: 0 },
});

/**
 * Minimal passthrough vertex shader
 */
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`;

/**
 * Fluid gradient fragment shader
 */
const fragmentShader = `
precision mediump float;
uniform float time;
varying vec2 vUv;

float noise(vec2 uv, float t) {
  return (1.0 + sin(uv.x * 4.3 + t) + cos(uv.y * 4.3 + t)) * 0.5;
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

vec3 getColor(vec2 uv, float t) {
  vec3 topLeft = vec3(1.0, 0.5, 0.7);
  vec3 topRight = vec3(0.5, 1.0, 0.6);
  vec3 bottomLeft = vec3(0.6, 0.5, 1.0);
  vec3 bottomRight = vec3(0.8, 1.0, 0.5);

  vec2 center = vec2(0.5, 0.5);
  vec2 offset = vec2(0.5) - center;
  vec2 rotatedUV = rotate(uv - center, t * 0.05) + center;

  vec2 noiseUV = vec2(noise(rotatedUV, t * 0.5), noise(rotatedUV, t * 0.75));
  vec3 color = mix(mix(topLeft, topRight, noiseUV.x), mix(bottomLeft, bottomRight, noiseUV.x), noiseUV.y);
  return color;
}

void main() {
  vec3 color = getColor(vUv, time);
  gl_FragColor = vec4(color, 1.0);
}`;

/**
 * Build a GSAP timeline that advances time uniformly
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  if (!containerRef.value) return null;

  const tl = $gsap.timeline({ paused: false });
  // Advance time forever for continuous fluid motion
  tl.to(uniforms.time, {
    value: "+=1000",
    duration: 1000,
    ease: "none",
    repeat: -1,
  });

  timeline.value = tl;
  return tl;
};

// Lifecycle: mount and initialize fluid gradient animation
onMounted(() => {
  // Set mounted flag to allow TresCanvas to render
  isMounted.value = true;

  nextTick(() => {
    // Small delay to ensure TresCanvas is fully initialized
    setTimeout(() => {
      if (!containerRef.value) return;

      gsapCtx = $gsap.context(() => {
        const tl = createAnimation();
        if (!tl) return;

        // Auto-play the animation (no ScrollTrigger needed for background)
        tl.play();
      }, containerRef.value);
    }, 100);
  });
});

// Cleanup
onUnmounted(() => {
  // Pause and kill timeline
  if (timeline.value) {
    timeline.value.pause();
    timeline.value.kill();
    timeline.value = null;
  }

  // Revert GSAP context
  if (gsapCtx) {
    gsapCtx.revert();
    gsapCtx = null;
  }

  // Clear mounted flag
  isMounted.value = false;
});

// Public API for external control
defineExpose({
  containerRef,
  timeline,
  play: () => timeline.value?.play(),
  pause: () => timeline.value?.pause(),
  restart: () => timeline.value?.restart(),
  reverse: () => timeline.value?.reverse(),
  seek: (time) => timeline.value?.seek(time),
});
</script>

<style scoped>
.fluid-gradient {
  /* Fixed background layer behind all content */
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}
</style>
