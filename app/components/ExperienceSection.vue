<template>
  <section
    ref="sectionRef"
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <!-- Experience list container - full-width-content for nested sub-grid -->
    <div
      ref="listRef"
      v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
      class="experience-list full-width-content flex flex-col"
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
          <!-- Mobile/Tablet: Centered -->
          <NuxtLink
            :to="viewMoreTo"
            class="lg:hidden block body-mobile-p1 text-[var(--theme-text-100)] font-medium text-center hover:opacity-60 transition-opacity duration-[var(--duration-hover)]"
          >
            {{ viewMoreText }}
          </NuxtLink>

          <!-- Desktop: Aligned with items -->
          <NuxtLink
            :to="viewMoreTo"
            class="hidden lg:block body-mobile-p1 2xl:body-desktop-p1 text-[var(--theme-text-100)] font-medium hover:opacity-60 transition-opacity duration-[var(--duration-hover)]"
          >
            {{ viewMoreText }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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
    default: true
  },
  /**
   * Text for "View more" link (e.g., "View all", "View more")
   * If not provided, link will not be shown
   * @type {string}
   */
  viewMoreText: {
    type: String,
    default: ''
  },
  /**
   * URL for "View more" link
   * Required if viewMoreText is provided
   * @type {string}
   */
  viewMoreTo: {
    type: String,
    default: ''
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()

const sectionRef = ref(null)
const listRef = ref(null)

let scrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null

/**
 * Create reusable animation function for experience list items
 * Used by ScrollTrigger for scroll-linked animations
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline()

  // Animate experience items (stagger fade + y offset)
  if (listRef.value) {
    const items = listRef.value.querySelectorAll('.experience-item')
    if (items.length > 0) {
      tl.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out'
        }
      )
    }
  }

  return tl
}

/**
 * Initialize ScrollTrigger animation
 */
const initScrollTrigger = () => {
  // Skip if animation disabled or dependencies missing
  if (!props.animateOnScroll || !$ScrollTrigger || !sectionRef.value) return

  // Kill existing ScrollTrigger if present
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // Clear inline GSAP styles from page transitions, set initial state
  if (listRef.value) {
    const items = listRef.value.querySelectorAll('.experience-item')
    if (items.length > 0) {
      $gsap.set(items, { clearProps: 'all' })
      $gsap.set(items, { opacity: 0, y: 40 })
    }
  }

  // Create timeline and ScrollTrigger
  const scrollTimeline = createSectionAnimation()
  scrollTriggerInstance = $ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 80%',
    end: 'bottom top+=25%',
    animation: scrollTimeline,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true
  })
}

// Use abstraction composable for page transition coordination
useScrollTriggerInit(
  () => initScrollTrigger(),
  () => {
    scrollTriggerInstance?.kill()
    scrollTriggerInstance = null
  }
)
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
