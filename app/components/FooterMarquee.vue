<template>
  <div
    ref="marqueeContainerRef"
    class="marquee-container full-width overflow-hidden"
    v-page-fade="{ leaveOnly: true }"
  >
    <div ref="marqueeTrackRef" class="marquee-track">
      <!-- Unit 1: Japanese → Danish → English -->
      <span class="marquee-text pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
        お問い合わせ
      </span>
      <span class="marquee-text pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
        Kontakt mig
      </span>
      <span class="marquee-text pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
        Get in touch
      </span>

      <!-- Unit 2: Japanese → Danish → English (duplicate for seamless loop) -->
      <span class="marquee-text pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
        お問い合わせ
      </span>
      <span class="marquee-text pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
        Kontakt mig
      </span>
      <span class="marquee-text pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
        Get in touch
      </span>

      <!-- Unit 3: Japanese → Danish → English (duplicate for seamless loop) -->
      <span class="marquee-text pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
        お問い合わせ
      </span>
      <span class="marquee-text pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
        Kontakt mig
      </span>
      <span class="marquee-text pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
        Get in touch
      </span>
    </div>
  </div>
</template>

<script setup>
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
 * - Page transition support: v-page-fade with leaveOnly: true
 * - Theme-aware text color
 * - Responsive typography (PP Eiko h2-enlarged)
 *
 * Pattern:
 * - Uses useHorizontalLoop composable for seamless infinite animation
 * - 3 complete text sets duplicated 3 times (9 spans total) for seamless loop
 * - Gap: var(--space-l-xl) fluid (36-66px, centered around 48px)
 * - Direction: Right-to-left (reversed: true)
 * - Speed: 1 (matches RecommendationItem)
 *
 * Integration:
 * - Used in FooterSection component
 * - No props needed (static content)
 */

const { $gsap, $ScrollTrigger } = useNuxtApp();

// Horizontal loop composable for marquee animation (pass GSAP instance)
const { createLoop } = useHorizontalLoop($gsap);

// Refs for DOM elements
const marqueeContainerRef = ref(null);
const marqueeTrackRef = ref(null);

// Marquee animation instance
let marqueeAnimation = null;
let scrollTriggerInstance = null;

/**
 * Setup marquee animation with ScrollTrigger control
 * Right-to-left infinite scroll (reversed: true)
 */
onMounted(() => {
  if (!marqueeTrackRef.value || !marqueeContainerRef.value) return;

  // Wait for next tick to ensure DOM is fully rendered
  nextTick(() => {
    // Get all text spans in the track (should be 9 elements: 3 sets of 3 languages)
    const items = marqueeTrackRef.value.querySelectorAll('.marquee-text');
    if (items.length === 0) return;

    // Calculate gap size to match CSS var(--space-l-xl) = clamp(36px, 48px, 66px)
    // Use middle value for consistent spacing between loop cycles
    const gapSize = 48; // Matches Figma spec, middle of fluid range

    // Create seamless loop using useHorizontalLoop composable
    // IMPORTANT: Direction is ALWAYS right-to-left for footer marquee (reversed: true)
    marqueeAnimation = createLoop(items, {
      repeat: -1, // Infinite repeat
      speed: 1, // Speed multiplier (always positive)
      reversed: true, // Right-to-left direction
      paddingRight: gapSize, // Gap between loop cycles for seamless connection
      paused: true, // Start paused
    });

    // ScrollTrigger: Control marquee based on viewport visibility
    // IMPORTANT: Use resume() instead of play() to respect reversed state
    scrollTriggerInstance = $ScrollTrigger.create({
      trigger: marqueeContainerRef.value,
      start: 'top bottom', // Starts when top of element enters bottom of viewport
      end: 'bottom top', // Ends when bottom of element leaves top of viewport
      onEnter: () => {
        // Element entered viewport from below - start animation
        marqueeAnimation?.resume();
      },
      onLeave: () => {
        // Element left viewport from top - pause animation
        marqueeAnimation?.pause();
      },
      onEnterBack: () => {
        // Element re-entered viewport from above - resume animation
        marqueeAnimation?.resume();
      },
      onLeaveBack: () => {
        // Element left viewport from bottom - pause animation
        marqueeAnimation?.pause();
      },
    });
  });
});

// Cleanup animations on unmount
onUnmounted(() => {
  if (marqueeAnimation) {
    marqueeAnimation.kill();
    marqueeAnimation = null;
  }
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
});
</script>

<style scoped>
/**
 * Footer marquee styles
 * Simple infinite horizontal scroll with no hover interactions
 */

.marquee-container {
  /* Full-width container, hides overflow */
  width: 100%;
  height: 66px; /* Fixed height from Figma */
  display: flex;
  align-items: center; /* Vertically center text */
}

/**
 * Marquee track
 * Contains repeating text spans with fluid spacing
 */
.marquee-track {
  display: inline-flex;
  gap: var(--space-l-xl); /* Fluid gap: 36px → 66px (Figma spec ~48px) */
  align-items: center; /* Vertically center all text */
  white-space: nowrap;
  will-change: transform; /* Performance optimization */
}

/**
 * Marquee text (multilingual "Get in touch")
 * PP Eiko typography from Figma with responsive sizing
 * Typography handled by utility classes (pp-eiko-*-h2-enlarged)
 */
.marquee-text {
  display: inline-block;
  white-space: nowrap;
}
</style>
