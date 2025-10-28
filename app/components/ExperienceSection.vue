<template>
  <section
    ref="sectionRef"
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <!-- Experience list container - full-width-content for nested sub-grid -->
    <div
      ref="listRef"
      class="experience-list full-width-content flex flex-col"
      v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
    >
      <!-- Experience items slot -->
      <slot />

      <!-- Optional "View more" link -->
      <div
        v-if="viewMoreText && viewMoreTo"
        class="experience-item full-width-content"
      >
        <FullWidthBorder />

        <div class="experience-view-more breakout3 py-[var(--space-s)] md:py-[var(--space-s)] lg:py-[var(--space-m)]">
          <NuxtLink
            :to="viewMoreTo"
            class="ibm-plex-sans-jp-mobile-p1 2xl:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)] font-medium text-center md:text-left hover:opacity-60 transition-opacity duration-[var(--duration-hover)]"
          >
            {{ viewMoreText }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * ExperienceSection Component - Experience List Container
 *
 * Displays a list of work experience entries with scroll-triggered animations.
 * Uses slot-based design for flexibility with ExperienceItem children.
 *
 * Features:
 * - Scroll-triggered entrance animations (fade + y offset, staggered)
 * - Page transition support (exit animations)
 * - Optional "View more" link at bottom
 * - Full-width border dividers
 * - Theme-aware colors
 * - Responsive layout using content-grid system
 *
 * Props:
 * @param {boolean} animateOnScroll - Enable scroll-triggered animation (default: true)
 * @param {string} viewMoreText - Text for "View more" link (optional)
 * @param {string} viewMoreTo - URL for "View more" link (optional)
 *
 * Pattern:
 * - Similar to BiographySection with scroll animations
 * - Uses v-page-stagger directive for exit animations
 * - ScrollTrigger recreated after page transitions for fresh DOM queries
 * - Coordinates with loadingStore and pageTransitionStore
 *
 * Usage:
 * <ExperienceSection view-more-text="View all" view-more-to="/experience">
 *   <ExperienceItem
 *     date-range="2023 – Current"
 *     title="Senior UX/UI Designer"
 *     company="TCS"
 *     location="Tokyo"
 *   />
 *   <ExperienceItem ... />
 * </ExperienceSection>
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
  /**
   * Text for "View more" link (e.g., "View all", "View more")
   * If not provided, link will not be shown
   * @type {string}
   */
  viewMoreText: {
    type: String,
    default: '',
  },
  /**
   * URL for "View more" link
   * Required if viewMoreText is provided
   * @type {string}
   */
  viewMoreTo: {
    type: String,
    default: '',
  },
});

const { $gsap, $ScrollTrigger } = useNuxtApp();
const loadingStore = useLoadingStore();
const pageTransitionStore = usePageTransitionStore();

const sectionRef = ref(null);
const listRef = ref(null);

let scrollTriggerInstance = null;

/**
 * Create reusable animation function for experience list items
 * Used by ScrollTrigger for scroll-linked animations
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline();

  // Animate experience items (stagger fade + y offset)
  // Query all .experience-item children within the list
  if (listRef.value) {
    const items = listRef.value.querySelectorAll('.experience-item');
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
        }
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
      if (listRef.value) {
        const items = listRef.value.querySelectorAll('.experience-item');
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
 * Experience list container styles
 * Minimal styling - most layout handled by Tailwind classes
 */
.experience-list {
  /* Flex column layout for vertical stacking */
  position: relative;
}

/**
 * "View more" link wrapper
 * Centers text on mobile/tablet, left-aligns on desktop
 */
.experience-view-more {
  display: block;
  width: 100%;
}
</style>
