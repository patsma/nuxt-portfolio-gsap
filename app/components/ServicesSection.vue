<template>
  <section
    ref="sectionRef"
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <!-- Responsive layout structure:
         Mobile: Label top, services stack in 1 column
         Tablet: Label top, services in 2 columns
         Desktop: Label left, services in 2 columns on right -->
    <div
      class="breakout3 grid gap-[var(--space-m)] lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-3xl)] items-start"
    >
      <!-- Label: Top on mobile/tablet, left on desktop -->
      <h2
        ref="labelRef"
        class="ibm-plex-sans-jp-mobile-caption 2xl:ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-40)]"
        v-page-split:lines="{ leaveOnly: true }"
      >
        <slot name="label">Services</slot>
      </h2>

      <!-- Services content area:
           Mobile: 1 column (default)
           Tablet (md): 2 columns
           Desktop (lg): 2 columns (within right side of main grid) -->
      <div
        ref="contentRef"
        class="grid gap-[var(--space-m)] md:grid-cols-2 md:gap-[var(--space-3xl)]"
        v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
      >
        <!-- Left services column -->
        <div
          ref="contentLeftRef"
          class="space-y-[var(--space-m)] pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 2xl:pp-eiko-desktop-h2 text-[var(--theme-text-60)]"
        >
          <slot name="column-left" />
        </div>

        <!-- Right services column -->
        <div
          ref="contentRightRef"
          class="space-y-[var(--space-m)] pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 2xl:pp-eiko-desktop-h2 text-[var(--theme-text-60)]"
        >
          <slot name="column-right" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * ServicesSection Component - Services List Display
 *
 * Displays a list of services in a 2-column layout with scroll-triggered animations.
 * Uses slot-based design for maximum flexibility.
 *
 * Features:
 * - Scroll-triggered entrance animations (fade + y offset, staggered)
 * - Page transition support (exit animations)
 * - 2-column layout on desktop, single column on mobile
 * - Theme-aware colors
 * - Responsive typography using PP Eiko (services) and IBM Plex Sans JP (label)
 *
 * Props:
 * @param {boolean} animateOnScroll - Enable scroll-triggered animation (default: true)
 *
 * Slots:
 * @slot label - Label text (default: "Services")
 * @slot column-left - Left column service items
 * @slot column-right - Right column service items
 *
 * Pattern:
 * - Follows BiographySection 2-column layout pattern
 * - Uses v-page-stagger directive for exit animations
 * - ScrollTrigger recreated after page transitions for fresh DOM queries
 * - Coordinates with loadingStore and pageTransitionStore
 *
 * Usage:
 * <ServicesSection>
 *   <template #column-left>
 *     <p>Art Direction</p>
 *     <p>Creative Direction</p>
 *     <p>Concept Development</p>
 *     <p>Consulting & Guidance</p>
 *   </template>
 *   <template #column-right>
 *     <p>User Experience Design (UX)</p>
 *     <p>Digital Design (UI)</p>
 *     <p>Interactive Design</p>
 *     <p>Design Systems & Tokens</p>
 *   </template>
 * </ServicesSection>
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
const contentRef = ref(null);
const contentLeftRef = ref(null);
const contentRightRef = ref(null);

let scrollTriggerInstance = null;

/**
 * Create reusable animation function for services section
 * Animates label first, then staggers all service items from both columns
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
        ease: "power2.out",
      }
    );
  }

  // Collect all service items from both columns for unified stagger
  const leftItems = contentLeftRef.value
    ? contentLeftRef.value.querySelectorAll(":scope > *")
    : [];
  const rightItems = contentRightRef.value
    ? contentRightRef.value.querySelectorAll(":scope > *")
    : [];

  // Combine items from both columns into single array for stagger sequence
  const allServiceItems = [...leftItems, ...rightItems];

  if (allServiceItems.length > 0) {
    tl.fromTo(
      allServiceItems,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08, // Stagger reveals across both columns
        ease: "power2.out",
      },
      "<+0.2" // Start 0.2s after label animation begins
    );
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
        $gsap.set(labelRef.value, { clearProps: "all" });
        $gsap.set(labelRef.value, { opacity: 0, y: 40 });
      }

      if (contentLeftRef.value) {
        const leftItems = contentLeftRef.value.querySelectorAll(":scope > *");
        if (leftItems.length > 0) {
          $gsap.set(leftItems, { clearProps: "all" });
          $gsap.set(leftItems, { opacity: 0, y: 40 });
        }
      }

      if (contentRightRef.value) {
        const rightItems = contentRightRef.value.querySelectorAll(":scope > *");
        if (rightItems.length > 0) {
          $gsap.set(rightItems, { clearProps: "all" });
          $gsap.set(rightItems, { opacity: 0, y: 40 });
        }
      }

      // Create timeline with fromTo() defining both start and end states
      // Initial state already set above, timeline will animate based on scroll position
      const scrollTimeline = createSectionAnimation();

      // Create ScrollTrigger with animation timeline
      scrollTriggerInstance = $ScrollTrigger.create({
        trigger: sectionRef.value,
        start: "top 80%", // Animate when section is 80% down viewport
        animation: scrollTimeline, // Link timeline to scroll position
        toggleActions: "play pause resume reverse",
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
