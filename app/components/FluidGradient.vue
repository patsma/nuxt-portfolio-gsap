<template>
  <div
    ref="containerRef"
    class="fluid-gradient fixed left-0 top-0 z-0 w-full h-screen pointer-events-none"
    aria-hidden="true"
    data-entrance-animate="true"
  >
    <!--
      TresJS scene with a fullscreen shader plane.
      Renders a fluid animated gradient background that responds to theme changes.
    -->
    <TresCanvas
      v-if="isMounted"
      class="w-full h-full opacity-100"
      clear-color="#0b0b10"
      :antialias="!isMobile"
      render-mode="manual"
    >
      <!--
        FluidGradientScene handles:
        - GSAP ticker integration for efficient rendering
        - Frame rate throttling (30fps mobile, 60fps desktop)
        - Manual advance() calls for render control
      -->
      <FluidGradientScene
        :uniforms="uniforms"
        :vertex-shader="vertexShader"
        :fragment-shader="activeFragmentShader"
        :is-mobile="isMobile"
      />
    </TresCanvas>

    <!-- Theme-aware overlay to add subtle neutral tones -->
    <div class="gradient-overlay" />
  </div>
</template>

<script setup lang="ts">
/**
 * FluidGradient
 *
 * TresJS-based canvas background with fluid gradient shader.
 * Always-visible site background with efficient rendering.
 *
 * Architecture:
 * - Uses manual render mode with GSAP ticker for optimal performance
 * - FluidGradientScene child handles tick updates and advance() calls
 * - Desktop: Full shader (60fps), Mobile: Simplified shader (30fps)
 * - Theme-aware: Colors animate smoothly on theme toggle
 */

// GSAP and ScrollTrigger from Nuxt app
const { $gsap, $ScrollTrigger } = useNuxtApp()

// Theme store for centralized theme state
const themeStore = useThemeStore()

// Page transition store for opacity masking during transitions
const pageTransitionStore = usePageTransitionStore()

// Mobile detection for performance optimization
const { isMobile } = useIsMobile()

// Core refs
const containerRef = ref(null)
const isMounted = ref(false)

// Mask rapid color changes during page transitions with opacity fade
watch(
  () => pageTransitionStore.isTransitioning,
  (transitioning) => {
    if (!containerRef.value || !$gsap) return

    if (transitioning) {
      // Fade out slightly during transition to hide color jumps
      $gsap.to(containerRef.value, { opacity: 0.5, duration: 0.3 })
    }
    else {
      // Fade back in after transition completes
      $gsap.to(containerRef.value, { opacity: 1, duration: 0.4, delay: 0.2 })
    }
  }
)

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
    br: [0.8, 1.0, 0.5] // Lime - energetic
  },
  dark: {
    tl: [0.25, 0.15, 0.4], // Rich purple (64, 38, 102)
    tr: [0.15, 0.25, 0.45], // Deep blue (38, 64, 115)
    bl: [0.35, 0.15, 0.25], // Deep magenta (89, 38, 64)
    br: [0.15, 0.35, 0.3] // Deep teal (38, 89, 76)
  }
}

/**
 * Shader uniforms (reactive so GSAP can tween nested .value)
 * Includes time, scroll-reactive values, and 4 corner colors
 * Start with light colors by default - will be set correctly in onMounted
 */
const uniforms = reactive({
  // Animation timing
  time: { value: 0 },

  // Scroll-reactive values
  scrollInfluence: { value: 0 }, // 0-1 global scroll progress
  sectionIntensity: { value: 1.0 }, // Section-specific brightness multiplier
  noiseScale: { value: 4.3 }, // Noise pattern tightness

  // Theme-aware corner colors (vec3)
  colorTL: { value: [...gradientColors.light.tl] }, // Top-left
  colorTR: { value: [...gradientColors.light.tr] }, // Top-right
  colorBL: { value: [...gradientColors.light.bl] }, // Bottom-left
  colorBR: { value: [...gradientColors.light.br] } // Bottom-right
})

/**
 * Minimal passthrough vertex shader
 */
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`

/**
 * Desktop fragment shader - full quality
 * Uses rotation and complex noise for fluid effect
 * Scroll-reactive: noiseScale affects pattern, sectionIntensity affects brightness
 */
const fragmentShaderDesktop = `
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
}`

/**
 * Mobile fragment shader - simplified for performance
 * Removes rotation, uses simpler noise (single sin instead of sin+cos)
 * ~85% GPU reduction compared to desktop shader
 * Scroll-reactive: sectionIntensity affects brightness
 */
const fragmentShaderMobile = `
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
}`

/**
 * Select shader based on device capability
 * Desktop: Full quality with rotation and complex noise
 * Mobile: Simplified for better performance
 */
const activeFragmentShader = computed(() =>
  isMobile.value ? fragmentShaderMobile : fragmentShaderDesktop
)

/**
 * Animate gradient colors to match theme
 * Uses GSAP to smoothly transition between light/dark color palettes
 * @param {boolean} isDark - Whether dark theme is active
 */
function animateToTheme(isDark) {
  const targetColors = isDark ? gradientColors.dark : gradientColors.light

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
    brB: uniforms.colorBR.value[2]
  }

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
    ease: 'power2.inOut',
    onUpdate: () => {
      // Update the actual uniform arrays on every frame
      uniforms.colorTL.value[0] = proxy.tlR
      uniforms.colorTL.value[1] = proxy.tlG
      uniforms.colorTL.value[2] = proxy.tlB
      uniforms.colorTR.value[0] = proxy.trR
      uniforms.colorTR.value[1] = proxy.trG
      uniforms.colorTR.value[2] = proxy.trB
      uniforms.colorBL.value[0] = proxy.blR
      uniforms.colorBL.value[1] = proxy.blG
      uniforms.colorBL.value[2] = proxy.blB
      uniforms.colorBR.value[0] = proxy.brR
      uniforms.colorBR.value[1] = proxy.brG
      uniforms.colorBR.value[2] = proxy.brB
    }
  })
}

// Watch theme store for changes and animate gradient colors
watch(
  () => themeStore.isDark,
  (isDark) => {
    animateToTheme(isDark)
  }
)

// Store ScrollTrigger instances for cleanup
let scrollTriggers: ReturnType<typeof $ScrollTrigger.create>[] = []

/**
 * Setup scroll-based gradient effects
 * Creates ScrollTriggers that modify gradient parameters based on scroll position
 */
function setupScrollTracking() {
  if (!$ScrollTrigger) return

  // Get smooth-content for ScrollSmoother compatibility
  const smoothContent = document.getElementById('smooth-content')
  if (!smoothContent) {
    console.warn('[FluidGradient] No smooth-content found, scroll tracking disabled')
    return
  }

  // Global scroll progress tracker using smooth-content
  const globalTracker = $ScrollTrigger.create({
    trigger: smoothContent,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate: (self: { progress: number }) => {
      const progress = self.progress

      uniforms.scrollInfluence.value = progress

      // Organic noise scale - oscillates between 3.0 and 5.5 with multiple waves
      // Creates a "breathing" pattern as you scroll
      const wave1 = Math.sin(progress * Math.PI * 4) * 0.8 // Fast wave
      const wave2 = Math.sin(progress * Math.PI * 1.5) * 0.4 // Slow wave
      uniforms.noiseScale.value = 4.3 + wave1 + wave2

      // Gentle intensity variation - subtle breathing, not linear increase
      // Oscillates around 1.0 (neutral) with gentle waves
      const breathe = Math.sin(progress * Math.PI * 3) * 0.08
      uniforms.sectionIntensity.value = 1.0 + breathe
    }
  })

  scrollTriggers.push(globalTracker)
}

/**
 * Cleanup ScrollTrigger instances
 */
function cleanupScrollTracking() {
  scrollTriggers.forEach(trigger => trigger.kill())
  scrollTriggers = []
}

// Lifecycle: mount and initialize fluid gradient
onMounted(() => {
  // Setup entrance animation for first load
  const { isFirstLoad } = useLoadingSequence()
  if (isFirstLoad()) {
    const { setupEntrance } = useEntranceAnimation()

    setupEntrance(containerRef.value, {
      position: '<-0.2', // Overlap header by 0.2s
      animate: (el) => {
        const tl = $gsap.timeline()
        tl.to(el, {
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power2.out'
        })
        return tl
      }
    })
  }

  // Set mounted flag to allow TresCanvas to render
  isMounted.value = true

  // Set initial colors based on current theme (no animation on first load)
  nextTick(() => {
    const initialColors = themeStore.isDark
      ? gradientColors.dark
      : gradientColors.light
    uniforms.colorTL.value = [...initialColors.tl]
    uniforms.colorTR.value = [...initialColors.tr]
    uniforms.colorBL.value = [...initialColors.bl]
    uniforms.colorBR.value = [...initialColors.br]

    // Setup scroll tracking after initial colors are set
    setupScrollTracking()
  })
})

// Cleanup
onUnmounted(() => {
  cleanupScrollTracking()
  isMounted.value = false
})

// Public API for external control
// Note: Animation is now controlled by FluidGradientScene via GSAP ticker
defineExpose({
  containerRef,
  uniforms, // Expose uniforms for external color control (future scroll effects)
  animateToTheme // Allow external theme animation trigger
})
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

.gradient-overlay {
  /* Theme-aware overlay to neutralize colorful gradient */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--theme-100);
  opacity: 0.4;
  pointer-events: none;
  transition: opacity var(--duration-theme) var(--ease-power2);
}
</style>
