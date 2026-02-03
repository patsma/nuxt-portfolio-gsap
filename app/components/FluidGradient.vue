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
        ref="sceneRef"
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
 * Simple animated background that responds only to theme changes.
 *
 * Architecture:
 * - Uses manual render mode with GSAP ticker for optimal performance
 * - FluidGradientScene child handles tick updates and advance() calls
 * - Desktop: Full shader (60fps), Mobile: Simplified shader (30fps)
 * - Theme-aware: Colors animate smoothly on theme toggle
 * - No scroll effects: Avoids visual glitches during page transitions
 *
 * @see .claude/FLUID_GRADIENT.md for full documentation
 */

// Import shaders from external files for cleaner component
import vertexShader from '~/shaders/fluid-gradient/vertex.glsl?raw'
import fragmentShaderDesktop from '~/shaders/fluid-gradient/fragment-desktop.glsl?raw'
import fragmentShaderMobile from '~/shaders/fluid-gradient/fragment-mobile.glsl?raw'

// GSAP from Nuxt app
const { $gsap } = useNuxtApp()

// Theme store for centralized theme state
const themeStore = useThemeStore()

// Mobile detection for performance optimization
const { isMobile } = useIsMobile()

// Core refs
const containerRef = ref(null)
const isMounted = ref(false)
interface SceneRef {
  updateColors: (tl: number[], tr: number[], bl: number[], br: number[]) => void
  internalUniforms?: {
    colorTL: { value: number[] }
    colorTR: { value: number[] }
    colorBL: { value: number[] }
    colorBR: { value: number[] }
  }
}
const sceneRef = ref<SceneRef | null>(null)

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
 * Includes time, fixed effect values, and 4 corner colors
 * Start with light colors by default - will be set correctly in onMounted
 */
const uniforms = reactive({
  // Animation timing
  time: { value: 0 },

  // Fixed effect values (shader expects these uniforms)
  scrollInfluence: { value: 0 }, // Fixed at 0 (no scroll effects)
  sectionIntensity: { value: 1.0 }, // Fixed at 1.0 (neutral brightness)
  noiseScale: { value: 4.3 }, // Fixed noise pattern scale

  // Theme-aware corner colors (vec3)
  colorTL: { value: [...gradientColors.light.tl] }, // Top-left
  colorTR: { value: [...gradientColors.light.tr] }, // Top-right
  colorBL: { value: [...gradientColors.light.bl] }, // Bottom-left
  colorBR: { value: [...gradientColors.light.br] } // Bottom-right
})

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
function animateToTheme(isDark: boolean) {
  const targetColors = isDark ? gradientColors.dark : gradientColors.light

  // Get current colors from scene's internal uniforms (the actual values Three.js uses)
  const currentTL = sceneRef.value?.internalUniforms?.colorTL?.value || uniforms.colorTL.value
  const currentTR = sceneRef.value?.internalUniforms?.colorTR?.value || uniforms.colorTR.value
  const currentBL = sceneRef.value?.internalUniforms?.colorBL?.value || uniforms.colorBL.value
  const currentBR = sceneRef.value?.internalUniforms?.colorBR?.value || uniforms.colorBR.value

  // Create a proxy object to animate
  const proxy = {
    tlR: currentTL[0],
    tlG: currentTL[1],
    tlB: currentTL[2],
    trR: currentTR[0],
    trG: currentTR[1],
    trB: currentTR[2],
    blR: currentBL[0],
    blG: currentBL[1],
    blB: currentBL[2],
    brR: currentBR[0],
    brG: currentBR[1],
    brB: currentBR[2]
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
      // Call the scene's updateColors method directly
      // This updates the plain JS uniforms that Three.js actually uses
      if (sceneRef.value?.updateColors) {
        sceneRef.value.updateColors(
          [proxy.tlR, proxy.tlG, proxy.tlB],
          [proxy.trR, proxy.trG, proxy.trB],
          [proxy.blR, proxy.blG, proxy.blB],
          [proxy.brR, proxy.brG, proxy.brB]
        )
      }
    },
onComplete: () => {
      // Animation complete - colors now match target theme
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
  // Wait for scene to be mounted, then update its internal uniforms
  nextTick(() => {
    const initialColors = themeStore.isDark
      ? gradientColors.dark
      : gradientColors.light

    // Update the reactive uniforms (for props)
    uniforms.colorTL.value = [...initialColors.tl]
    uniforms.colorTR.value = [...initialColors.tr]
    uniforms.colorBL.value = [...initialColors.bl]
    uniforms.colorBR.value = [...initialColors.br]

    // Also update the scene's internal uniforms directly
    if (sceneRef.value?.updateColors) {
      sceneRef.value.updateColors(
        [...initialColors.tl],
        [...initialColors.tr],
        [...initialColors.bl],
        [...initialColors.br]
      )
    }
  })
})

// Cleanup
onUnmounted(() => {
  isMounted.value = false
})

// Public API for external control
// Note: Animation is now controlled by FluidGradientScene via GSAP ticker
defineExpose({
  containerRef,
  uniforms, // Expose uniforms for external color control
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
  /* No CSS transition - GSAP handles theme animation via CSS variable updates */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--theme-100);
  opacity: 0.4;
  pointer-events: none;
}
</style>
