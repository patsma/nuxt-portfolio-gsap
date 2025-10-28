<template>
  <section
    ref="sectionRef"
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <div
      class="breakout3 grid gap-[var(--space-m)] lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-3xl)] items-start"
    >
      <!-- Biography label (left column on laptop+) -->
      <!-- Page transition OUT only, ScrollTrigger handles IN animation -->
      <h2
        ref="labelRef"
        class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
        v-page-split:lines="{ leaveOnly: true }"
      >
        <slot name="label">Biography</slot>
      </h2>

      <!-- Biography content (right column on laptop+) -->
      <!-- Page transition OUT only, ScrollTrigger handles IN animation -->
      <div
        ref="contentRef"
        class="space-y-[var(--space-m)] ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2"
        v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
      >
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
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

let scrollTriggerInstance = null;

/**
 * Create reusable animation function for label + content
 * Used by ScrollTrigger for scroll-linked animations
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline();

  // Animate label (fade + y offset)
  // Using .fromTo() to explicitly define both start and end states
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

  // Animate content paragraphs (stagger fade + y offset)
  // Query all paragraphs in content slot
  if (contentRef.value) {
    const paragraphs = contentRef.value.querySelectorAll("p");
    if (paragraphs.length > 0) {
      tl.fromTo(
        paragraphs,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08, // Stagger paragraph reveals
          ease: "power2.out",
        },
        "<+0.2" // Start 0.2s after label animation begins
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
      // The v-page-split and v-page-stagger directives leave inline styles (opacity, transform)
      // Clear them, then explicitly set initial hidden state before ScrollTrigger takes over
      if (labelRef.value) {
        $gsap.set(labelRef.value, { clearProps: "all" });
        $gsap.set(labelRef.value, { opacity: 0, y: 40 });
      }
      if (contentRef.value) {
        const paragraphs = contentRef.value.querySelectorAll("p");
        if (paragraphs.length > 0) {
          $gsap.set(paragraphs, { clearProps: "all" });
          $gsap.set(paragraphs, { opacity: 0, y: 40 });
        }
      }

      // Create timeline with fromTo() defining both start and end states
      // Initial state already set above, timeline will animate based on scroll position
      const scrollTimeline = createSectionAnimation();

      // Create ScrollTrigger with animation timeline
      scrollTriggerInstance = $ScrollTrigger.create({
        trigger: sectionRef.value,
        start: "top 80%", // Animate when section is 80% down viewport
        end: "bottom top+=25%", // Complete animation when bottom reaches top
        animation: scrollTimeline, // Link timeline to scroll position
        scrub: 0.5, // Smooth scrubbing with 0.5s delay for organic feel
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
