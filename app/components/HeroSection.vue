<template>
  <section
    ref="heroRef"
    class="content-grid w-full min-h-screen flex items-center"
    data-entrance-animate="true"
  >
    <div class="breakout3 py-[var(--space-2xl)]">
      <!-- Default slot for main hero content (h1, p, etc.) -->
      <slot />

      <!-- Named slot for optional services list -->
      <slot name="services" />
    </div>
  </section>
</template>

<script setup>
/**
 * HeroSection Component - Reusable Layout Wrapper with Entrance Animation
 *
 * Provides consistent hero section layout and spacing with optional entrance animation.
 * Content is passed via slots for maximum flexibility.
 *
 * Slots:
 * - default: Main hero content (h1, p, etc.)
 * - services: Optional services list or additional content
 *
 * Props:
 * - animateEntrance: Enable entrance animation (default: true)
 * - position: GSAP position parameter for timing (default: '<-0.3' - overlap header by 0.3s)
 *
 * Features:
 * - Responsive content-grid layout
 * - Vertical centering (flex items-center)
 * - Theme-aware (inherits theme colors)
 * - Entrance animation system integration
 * - Works with page transition directives (add to slot content)
 *
 * Usage:
 * <HeroSection :animate-entrance="true" position="<-0.3">
 *   <h1 v-page-split:lines>Your headline</h1>
 *   <template #services>
 *     <nav>Your services</nav>
 *   </template>
 * </HeroSection>
 */

// Props
const props = defineProps({
  /**
   * Enable entrance animation on first load
   * @type {boolean}
   */
  animateEntrance: {
    type: Boolean,
    default: true,
  },
  /**
   * GSAP position parameter for animation timing
   * Examples:
   * - '<' - Start with header (overlap completely)
   * - '<-0.3' - Start 0.3s before header ends (default)
   * - '+=0.2' - Start 0.2s after previous animation
   * - 'start' - Start at timeline beginning
   * @type {string}
   */
  position: {
    type: String,
    default: '<-0.3', // Overlap header by 0.3s for smooth flow
  },
})

// Nuxt GSAP
const { $gsap } = useNuxtApp()

// Entrance animation system
const { setupEntrance } = useEntranceAnimation()

// Refs
const heroRef = ref(null)

onMounted(() => {
  if (!props.animateEntrance || !heroRef.value) return

  // Setup entrance animation
  setupEntrance(heroRef.value, {
    position: props.position,
    animate: (el) => {
      // Create timeline for hero entrance
      const tl = $gsap.timeline()

      // Element is already hidden by CSS (data-entrance-animate attribute)
      // Just set the y position offset before animating
      $gsap.set(el, { y: 40 })

      // Animate in with smooth fade and upward movement
      tl.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      })

      return tl
    },
  })
})
</script>

<style scoped>
/* Optional: Add gradient background like reference image */
/* .hero-section {
  background: linear-gradient(135deg, #fef5f1 0%, #fde5e0 100%);
} */
</style>
