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
      class="w-full h-full opacity-50"
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

// Theme store for centralized theme state
const themeStore = useThemeStore();

// Core refs
const containerRef = ref(null);
const timeline = ref(null);
const isMounted = ref(false);
let gsapCtx = null;

/**
 * Gradient color palettes - normalized RGB values for Three.js (0-1 range)
 * Light theme: bright pastels for light UI
 * Dark theme: deeper, more saturated colors with good contrast for visibility
 */
const gradientColors = {
  light: {
    tl: [1.0, 0.5, 0.7], // Rose/pink - warm
    tr: [0.5, 1.0, 0.6], // Mint green - fresh
    bl: [0.6, 0.5, 1.0], // Lavender - cool
    br: [0.8, 1.0, 0.5], // Lime - energetic
  },
  dark: {
    tl: [0.25, 0.15, 0.4], // Rich purple (64, 38, 102)
    tr: [0.15, 0.25, 0.45], // Deep blue (38, 64, 115)
    bl: [0.35, 0.15, 0.25], // Deep magenta (89, 38, 64)
    br: [0.15, 0.35, 0.3], // Deep teal (38, 89, 76)
  },
};

/**
 * Shader uniforms (reactive so GSAP can tween nested .value)
 * Includes time and 4 corner colors for theme-aware gradient
 * Start with light colors by default - will be set correctly in onMounted
 */
const uniforms = reactive({
  time: { value: 0 },
  colorTL: { value: [...gradientColors.light.tl] }, // Top-left (vec3)
  colorTR: { value: [...gradientColors.light.tr] }, // Top-right (vec3)
  colorBL: { value: [...gradientColors.light.bl] }, // Bottom-left (vec3)
  colorBR: { value: [...gradientColors.light.br] }, // Bottom-right (vec3)
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
 * Now uses uniform colors from theme system
 */
const fragmentShader = `
precision mediump float;
uniform float time;
uniform vec3 colorTL;
uniform vec3 colorTR;
uniform vec3 colorBL;
uniform vec3 colorBR;
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
  // Use uniform colors from theme system (animated by GSAP)
  vec3 topLeft = colorTL;
  vec3 topRight = colorTR;
  vec3 bottomLeft = colorBL;
  vec3 bottomRight = colorBR;

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
 * Animate gradient colors to match theme
 * Uses GSAP to smoothly transition between light/dark color palettes
 * @param {boolean} isDark - Whether dark theme is active
 */
function animateToTheme(isDark) {
  const targetColors = isDark ? gradientColors.dark : gradientColors.light;

  // Create a proxy object to animate, then update the uniform arrays
  // This ensures GSAP can properly interpolate the values
  const proxy = {
    tlR: uniforms.colorTL.value[0],
    tlG: uniforms.colorTL.value[1],
    tlB: uniforms.colorTL.value[2],
    trR: uniforms.colorTR.value[0],
    trG: uniforms.colorTR.value[1],
    trB: uniforms.colorTR.value[2],
    blR: uniforms.colorBL.value[0],
    blG: uniforms.colorBL.value[1],
    blB: uniforms.colorBL.value[2],
    brR: uniforms.colorBR.value[0],
    brG: uniforms.colorBR.value[1],
    brB: uniforms.colorBR.value[2],
  };

  $gsap.to(proxy, {
    tlR: targetColors.tl[0],
    tlG: targetColors.tl[1],
    tlB: targetColors.tl[2],
    trR: targetColors.tr[0],
    trG: targetColors.tr[1],
    trB: targetColors.tr[2],
    blR: targetColors.bl[0],
    blG: targetColors.bl[1],
    blB: targetColors.bl[2],
    brR: targetColors.br[0],
    brG: targetColors.br[1],
    brB: targetColors.br[2],
    duration: 0.6,
    ease: "power2.inOut",
    onUpdate: () => {
      // Update the actual uniform arrays on every frame
      uniforms.colorTL.value[0] = proxy.tlR;
      uniforms.colorTL.value[1] = proxy.tlG;
      uniforms.colorTL.value[2] = proxy.tlB;
      uniforms.colorTR.value[0] = proxy.trR;
      uniforms.colorTR.value[1] = proxy.trG;
      uniforms.colorTR.value[2] = proxy.trB;
      uniforms.colorBL.value[0] = proxy.blR;
      uniforms.colorBL.value[1] = proxy.blG;
      uniforms.colorBL.value[2] = proxy.blB;
      uniforms.colorBR.value[0] = proxy.brR;
      uniforms.colorBR.value[1] = proxy.brG;
      uniforms.colorBR.value[2] = proxy.brB;
    },
  });
}

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

// Watch theme store for changes and animate gradient colors
watch(
  () => themeStore.isDark,
  (isDark) => {
    animateToTheme(isDark);
  }
);

// Lifecycle: mount and initialize fluid gradient animation
onMounted(() => {
  // Set mounted flag to allow TresCanvas to render
  isMounted.value = true;

  nextTick(() => {
    // Small delay to ensure TresCanvas is fully initialized
    setTimeout(() => {
      if (!containerRef.value) return;

      // Set initial colors based on current theme from store (no animation)
      const initialColors = themeStore.isDark
        ? gradientColors.dark
        : gradientColors.light;
      uniforms.colorTL.value = [...initialColors.tl];
      uniforms.colorTR.value = [...initialColors.tr];
      uniforms.colorBL.value = [...initialColors.bl];
      uniforms.colorBR.value = [...initialColors.br];

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
