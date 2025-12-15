<template>
  <section
    ref="sectionRef"
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <div
      class="breakout3 grid gap-[var(--space-m)] lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-3xl)] items-start"
    >
      <!-- Awards & Recognition label (left column on laptop+) -->
      <!-- Page transition OUT only, ScrollTrigger handles IN animation -->
      <h2
        ref="labelRef"
        v-page-split:lines="{ leaveOnly: true }"
        class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
      >
        <slot name="label">
          Awards &<br>Recognition
        </slot>
      </h2>

      <!-- Awards content wrapper (right column on laptop+) -->
      <!-- Two-column grid matching ServicesSection spacing pattern -->
      <div
        ref="contentRef"
        class="grid gap-[var(--space-m)] md:grid-cols-2 md:gap-[var(--space-3xl)]"
      >
        <!-- Left column: Awards with counts -->
        <div
          ref="contentLeftRef"
          v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
          class="space-y-[var(--space-m)] ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p1 2xl:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]"
        >
          <slot name="awards-column" />
        </div>

        <!-- Right column: Featured mentions -->
        <div
          ref="contentRightRef"
          v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
          class="space-y-[var(--space-m)] ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p1 2xl:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]"
        >
          <slot name="featured-column" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * AwardsRecognitionSection Component - Awards & Recognition List Container
 *
 * Displays awards and recognition entries with scroll-triggered animations.
 * Uses slot-based design for flexibility with awards and featured content.
 *
 * Features:
 * - Scroll-triggered entrance animations (fade + y offset, staggered)
 * - Page transition support (exit animations)
 * - Two-column layout for awards and featured mentions
 * - Theme-aware colors
 * - Responsive layout using content-grid system
 * - Similar pattern to BiographySection and ClientsSection
 *
 * Props:
 * @param {boolean} animateOnScroll - Enable scroll-triggered animation (default: true)
 *
 * Pattern:
 * - Similar to BiographySection with scroll animations
 * - Uses v-page-split and v-page-stagger directives for exit animations
 * - ScrollTrigger recreated after page transitions for fresh DOM queries
 * - Coordinates with loadingStore and pageTransitionStore
 *
 * Usage:
 * <AwardsRecognitionSection>
 *   <template #label>Awards & Recognition</template>
 *   <template #awards-column>
 *     <p>1 <span class="text-[var(--theme-text-60)]">x</span> Awwwards</p>
 *     <p>4 <span class="text-[var(--theme-text-60)]">x</span> Behance</p>
 *   </template>
 *   <template #featured-column>
 *     <p>Design Rush – Featured</p>
 *     <p>Web Design Pub – Featured</p>
 *   </template>
 * </AwardsRecognitionSection>
 */

const props = defineProps({
  /**
   * Enable scroll-triggered animation when section enters viewport
   * @type {boolean}
   */
  animateOnScroll: {
    type: Boolean,
    default: true
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()
const loadingStore = useLoadingStore()
const pageTransitionStore = usePageTransitionStore()

const sectionRef = ref(null)
const labelRef = ref(null)
const contentRef = ref(null)
const contentLeftRef = ref(null)
const contentRightRef = ref(null)

let scrollTriggerInstance = null

/**
 * Create reusable animation function for awards section
 * Animates label first, then staggers all award items from both columns
 * Used by ScrollTrigger for scroll-linked animations
 * Pattern matches ServicesSection for consistency
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline()

  // Animate label (fade + y offset)
  if (labelRef.value) {
    tl.fromTo(
      labelRef.value,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }
    )
  }

  // Collect all award items from both columns for unified stagger
  // Query direct children from both column containers
  const leftItems = contentLeftRef.value
    ? Array.from(contentLeftRef.value.children)
    : []
  const rightItems = contentRightRef.value
    ? Array.from(contentRightRef.value.children)
    : []

  // Combine items from both columns into single array for stagger sequence
  const allAwardItems = [...leftItems, ...rightItems]

  if (allAwardItems.length > 0) {
    tl.fromTo(
      allAwardItems,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08, // Stagger reveals across both columns
        ease: 'power2.out'
      },
      '<+0.2' // Start 0.2s after label animation begins
    )
  }

  return tl
}

onMounted(() => {
  // SCROLL MODE: Animate when scrolling into view (default)
  // Timeline is linked to ScrollTrigger for smooth forward/reverse playback
  // Pattern: Kill and recreate ScrollTrigger after page transitions for fresh DOM queries
  if (props.animateOnScroll && $ScrollTrigger && sectionRef.value) {
    // Create/recreate ScrollTrigger with fresh element queries
    const createScrollTrigger = () => {
      // Kill existing ScrollTrigger if present
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill()
        scrollTriggerInstance = null
      }

      // CRITICAL: Clear inline GSAP styles from page transitions
      // The v-page-stagger directive leaves inline styles (opacity, transform)
      // Clear them, then explicitly set initial hidden state before ScrollTrigger takes over
      if (labelRef.value) {
        $gsap.set(labelRef.value, { clearProps: 'all' })
        $gsap.set(labelRef.value, { opacity: 0, y: 40 })
      }

      // Query all award items from both column containers
      const leftItems = contentLeftRef.value ? Array.from(contentLeftRef.value.children) : []
      const rightItems = contentRightRef.value ? Array.from(contentRightRef.value.children) : []
      const allAwardItems = [...leftItems, ...rightItems]

      if (allAwardItems.length > 0) {
        $gsap.set(allAwardItems, { clearProps: 'all' })
        $gsap.set(allAwardItems, { opacity: 0, y: 40 })
      }

      // Create timeline with fromTo() defining both start and end states
      // Initial state already set above, timeline will animate based on scroll position
      const scrollTimeline = createSectionAnimation()

      // Create ScrollTrigger with animation timeline
      scrollTriggerInstance = $ScrollTrigger.create({
        trigger: sectionRef.value,
        start: 'top 80%', // Animate when section is 80% down viewport
        end: 'bottom top+=25%', // Complete animation when bottom reaches top
        animation: scrollTimeline, // Link timeline to scroll position
        toggleActions: 'play pause resume reverse',
        invalidateOnRefresh: true // Recalculate on window resize/refresh
      })
    }

    // Coordinate with page transition system
    // First load: Create immediately after mount
    // Navigation: Recreate after page transition completes
    if (loadingStore.isFirstLoad) {
      nextTick(() => {
        createScrollTrigger()
      })
    }
    else {
      // After page navigation, wait for page transition to complete
      // Watch pageTransitionStore.isTransitioning for proper timing
      const unwatch = watch(
        () => pageTransitionStore.isTransitioning,
        (isTransitioning) => {
          // When transition completes (isTransitioning becomes false), recreate ScrollTrigger
          if (!isTransitioning) {
            nextTick(() => {
              createScrollTrigger()
            })
            unwatch() // Stop watching
          }
        },
        { immediate: true }
      )
    }
  }
})

// Cleanup ScrollTrigger on unmount
onUnmounted(() => {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }
})
</script>

<style scoped>
/**
 * Awards & Recognition section container styles
 * Minimal styling - most layout handled by Tailwind classes
 */
</style>
