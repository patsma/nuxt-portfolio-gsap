<template>
  <div
    ref="marqueeContainerRef"
    class="marquee-container full-width overflow-hidden"
    data-footer-marquee
  >
    <div
      ref="marqueeTrackRef"
      class="marquee-track"
    >
      <!-- Unit 1: Japanese → Danish → English -->
      <span class="marquee-text display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]">
        お問い合わせ
      </span>
      <span class="marquee-text display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]">
        Kontakt mig
      </span>
      <span class="marquee-text display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]">
        Get in touch
      </span>

      <!-- Unit 2: Japanese → Danish → English (duplicate for seamless loop) -->
      <span class="marquee-text display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]">
        お問い合わせ
      </span>
      <span class="marquee-text display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]">
        Kontakt mig
      </span>
      <span class="marquee-text display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]">
        Get in touch
      </span>

      <!-- Unit 3: Japanese → Danish → English (duplicate for seamless loop) -->
      <span class="marquee-text display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]">
        お問い合わせ
      </span>
      <span class="marquee-text display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]">
        Kontakt mig
      </span>
      <span class="marquee-text display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]">
        Get in touch
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * FooterMarquee Component - Infinite Horizontal Marquee
 *
 * Displays an infinite right-to-left scrolling marquee with multilingual
 * "Get in touch" text in Japanese, Danish, and English.
 *
 * Features:
 * - Infinite right-to-left scroll (GSAP horizontalLoop)
 * - Multilingual text: "お問い合わせ" (JP) → "Kontakt mig" (DK) → "Get in touch" (EN)
 * - ScrollTrigger controls: Start/pause based on viewport visibility
 * - NO hover pause (unlike RecommendationItem)
 * - Page leave/enter animations handled by parent FooterSection component
 * - Theme-aware text color (40% opacity)
 * - Responsive typography (PP Eiko h2 - matches FooterSection links)
 * - Fully fluid responsive using design tokens
 *
 * Pattern:
 * - Uses useHorizontalLoop composable for seamless infinite animation
 * - 3 complete text sets duplicated 3 times (9 spans total) for seamless loop
 * - Gap: var(--space-l-xl) - dynamically read from computed style
 * - Padding: var(--space-s) for responsive height
 * - Direction: Right-to-left (reversed: true)
 * - Speed: 1 (matches RecommendationItem)
 * - Typography: PP Eiko h2 (regular, not enlarged) matching FooterSection link sizes
 *
 * Integration:
 * - Used in FooterSection component wrapped in marquee-wrapper div
 * - No props needed (static content)
 * - Border handled by FooterSection parent (FullWidthBorder top with 15% opacity)
 * - Wrapper div animated as a unit (border + marquee together)
 */

const { $gsap, $ScrollTrigger } = useNuxtApp()

// Horizontal loop composable for marquee animation (pass GSAP instance)
const { createLoop } = useHorizontalLoop($gsap)

// Refs for DOM elements
const marqueeContainerRef = ref(null)
const marqueeTrackRef = ref(null)

// Marquee animation instance
let marqueeAnimation = null
let scrollTriggerInstance = null

/**
 * Setup marquee animation with ScrollTrigger control
 * Right-to-left infinite scroll (reversed: true)
 * NOTE: Page transition animations handled by parent FooterSection
 */
onMounted(() => {
  if (!marqueeTrackRef.value || !marqueeContainerRef.value) return

  // Wait for next tick to ensure DOM is fully rendered
  nextTick(() => {
    // Get all text spans in the track (should be 9 elements: 3 sets of 3 languages)
    const items = marqueeTrackRef.value.querySelectorAll('.marquee-text')
    if (items.length === 0) return

    // Calculate gap size dynamically from CSS variable --space-l-xl
    // Read computed style to get the actual resolved fluid clamp() value
    const computedGap = window.getComputedStyle(marqueeTrackRef.value).gap
    const gapSize = parseFloat(computedGap) || 48 // Fallback to 48px if parsing fails

    // Create seamless loop using useHorizontalLoop composable
    // IMPORTANT: Direction is ALWAYS right-to-left for footer marquee (reversed: true)
    marqueeAnimation = createLoop(items, {
      repeat: -1, // Infinite repeat
      speed: 1, // Speed multiplier (always positive)
      reversed: true, // Right-to-left direction
      paddingRight: gapSize, // Gap between loop cycles for seamless connection
      paused: true // Start paused
    })

    // ScrollTrigger: Control marquee based on viewport visibility
    // IMPORTANT: Use resume() instead of play() to respect reversed state
    scrollTriggerInstance = $ScrollTrigger.create({
      trigger: marqueeContainerRef.value,
      start: 'top bottom', // Starts when top of element enters bottom of viewport
      end: 'bottom top', // Ends when bottom of element leaves top of viewport
      onEnter: () => {
        // Element entered viewport from below - start animation
        marqueeAnimation?.resume()
      },
      onLeave: () => {
        // Element left viewport from top - pause animation
        marqueeAnimation?.pause()
      },
      onEnterBack: () => {
        // Element re-entered viewport from above - resume animation
        marqueeAnimation?.resume()
      },
      onLeaveBack: () => {
        // Element left viewport from bottom - pause animation
        marqueeAnimation?.pause()
      }
    })
  })
})

// Cleanup animations on unmount
onUnmounted(() => {
  if (marqueeAnimation) {
    marqueeAnimation.kill()
    marqueeAnimation = null
  }
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }
})
</script>

<style scoped>
/**
 * Footer marquee styles
 * Simple infinite horizontal scroll with no hover interactions
 * Responsive padding instead of fixed height for fluid layout
 */

.marquee-container {
  /* Full-width container, hides overflow */
  width: 100%;
  /* Use padding for responsive height instead of fixed height */
  padding-top: var(--space-s);
  padding-bottom: var(--space-s);
  display: flex;
  align-items: center; /* Vertically center text */
}

/**
 * Marquee track
 * Contains repeating text spans with fluid spacing
 */
.marquee-track {
  display: inline-flex;
  gap: var(--space-l-xl); /* Fluid gap using design token */
  align-items: center; /* Vertically center all text */
  white-space: nowrap;
  will-change: transform; /* Performance optimization */
}

/**
 * Marquee text (multilingual "Get in touch")
 * PP Eiko typography from Figma with responsive sizing
 * Typography handled by utility classes (display-*-h2)
 */
.marquee-text {
  display: inline-block;
  white-space: nowrap;
}
</style>
