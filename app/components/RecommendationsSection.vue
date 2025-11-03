<template>
  <section
    ref="sectionRef"
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <!-- Recommendations label -->
    <h2
      ref="labelRef"
      class="breakout3 ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)] mb-[var(--space-m)] md:mb-[var(--space-l)]"
      v-page-split:lines="{ leaveOnly: true }"
    >
      <slot name="label">Recommendations</slot>
    </h2>

    <!-- Recommendations list container -->
    <div
      ref="listRef"
      class="recommendations-list full-width-content flex flex-col"
      v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
    >
      <!-- Recommendation items slot -->
      <slot />
    </div>
  </section>
</template>

<script setup>
/**
 * RecommendationsSection Component - Recommendations List Container
 *
 * Displays a list of recommendations with infinite marquee animations and accordion-style expansion.
 * Each recommendation item scrolls horizontally (alternating directions) and can be clicked to expand.
 *
 * Features:
 * - Scroll-triggered entrance animations (fade + y offset, staggered)
 * - Page transition support (exit animations)
 * - Accordion state management (only one item open at a time)
 * - Provide/inject pattern for child communication
 * - Theme-aware colors
 * - Responsive layout using content-grid system
 * - Similar pattern to BiographySection and ExperienceSection
 *
 * Props:
 * @param {boolean} animateOnScroll - Enable scroll-triggered animation (default: true)
 *
 * Pattern:
 * - Uses v-page-split and v-page-stagger directives for exit animations
 * - ScrollTrigger recreated after page transitions for fresh DOM queries
 * - Coordinates with loadingStore and pageTransitionStore
 * - Provides accordion state to child RecommendationItem components
 *
 * Usage:
 * <RecommendationsSection>
 *   <template #label>Recommendations</template>
 *   <RecommendationItem
 *     id="rec-1"
 *     :index="0"
 *     quote="An extraordinary individual"
 *     full-recommendation="..."
 *     author-name="Thomas Rømhild"
 *     author-title="CEO, Bærnholdt"
 *     author-image="/images/authors/thomas.jpg"
 *   />
 *   <RecommendationItem ... />
 * </RecommendationsSection>
 */

const props = defineProps({
  /**
   * Enable scroll-triggered animation when section enters viewport
   * @type {boolean}
   */
  animateOnScroll: {
    type: Boolean,
    default: true,
  },
});

const { $gsap, $ScrollTrigger } = useNuxtApp();
const loadingStore = useLoadingStore();
const pageTransitionStore = usePageTransitionStore();

const sectionRef = ref(null);
const labelRef = ref(null);
const listRef = ref(null);

let scrollTriggerInstance = null;

/**
 * Accordion state management
 * Track which recommendation item is currently expanded
 * Only one item can be open at a time
 */
const activeItemId = ref(null);

const setActiveItem = (id) => {
  // If clicking the same item, close it (toggle behavior)
  // If clicking a different item, open it and close the previous one
  activeItemId.value = activeItemId.value === id ? null : id;
};

// Provide accordion state to child RecommendationItem components
provide('activeItemId', activeItemId);
provide('setActiveItem', setActiveItem);

/**
 * Create reusable animation function for recommendations section
 * Animates label first, then staggers all recommendation items
 * Used by ScrollTrigger for scroll-linked animations
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline();

  // Animate label (fade + y offset)
  if (labelRef.value) {
    tl.fromTo(
      labelRef.value,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      }
    );
  }

  // Animate recommendation items (stagger fade + y offset)
  // Query all .recommendation-item children within the list
  if (listRef.value) {
    const items = listRef.value.querySelectorAll('.recommendation-item');
    if (items.length > 0) {
      tl.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08, // Stagger item reveals
          ease: 'power2.out',
        },
        '<+0.2' // Start 0.2s after label animation begins
      );
    }
  }

  return tl;
};

onMounted(() => {
  // SCROLL MODE: Animate when scrolling into view (default)
  // Timeline is linked to ScrollTrigger for smooth forward/reverse playback
  // Pattern: Kill and recreate ScrollTrigger after page transitions for fresh DOM queries
  if (props.animateOnScroll && $ScrollTrigger && sectionRef.value) {
    // Create/recreate ScrollTrigger with fresh element queries
    const createScrollTrigger = () => {
      // Kill existing ScrollTrigger if present
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
        scrollTriggerInstance = null;
      }

      // CRITICAL: Clear inline GSAP styles from page transitions
      // The v-page-stagger directive leaves inline styles (opacity, transform)
      // Clear them, then explicitly set initial hidden state before ScrollTrigger takes over
      if (labelRef.value) {
        $gsap.set(labelRef.value, { clearProps: 'all' });
        $gsap.set(labelRef.value, { opacity: 0, y: 40 });
      }
      if (listRef.value) {
        const items = listRef.value.querySelectorAll('.recommendation-item');
        if (items.length > 0) {
          $gsap.set(items, { clearProps: 'all' });
          $gsap.set(items, { opacity: 0, y: 40 });
        }
      }

      // Create timeline with fromTo() defining both start and end states
      // Initial state already set above, timeline will animate based on scroll position
      const scrollTimeline = createSectionAnimation();

      // Create ScrollTrigger with animation timeline
      scrollTriggerInstance = $ScrollTrigger.create({
        trigger: sectionRef.value,
        start: 'top 80%', // Animate when section is 80% down viewport
        end: 'bottom top+=25%', // Complete animation when bottom reaches top
        animation: scrollTimeline, // Link timeline to scroll position
        toggleActions: 'play pause resume reverse',
        invalidateOnRefresh: true, // Recalculate on window resize/refresh
      });
    };

    // Coordinate with page transition system
    // First load: Create immediately after mount
    // Navigation: Recreate after page transition completes
    if (loadingStore.isFirstLoad) {
      nextTick(() => {
        createScrollTrigger();
      });
    } else {
      // After page navigation, wait for page transition to complete
      // Watch pageTransitionStore.isTransitioning for proper timing
      const unwatch = watch(
        () => pageTransitionStore.isTransitioning,
        (isTransitioning) => {
          // When transition completes (isTransitioning becomes false), recreate ScrollTrigger
          if (!isTransitioning) {
            nextTick(() => {
              createScrollTrigger();
            });
            unwatch(); // Stop watching
          }
        },
        { immediate: true }
      );
    }
  }
});

// Cleanup ScrollTrigger on unmount
onUnmounted(() => {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
});
</script>

<style scoped>
/**
 * Recommendations section container styles
 * Minimal styling - most layout handled by Tailwind classes
 */
.recommendations-list {
  /* Flex column layout for vertical stacking */
  position: relative;
}
</style>
