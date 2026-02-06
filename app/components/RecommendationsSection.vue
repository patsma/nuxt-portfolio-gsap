<template>
  <section
    ref="sectionRef"
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <!-- Recommendations label -->
    <h2
      ref="labelRef"
      v-page-split:lines="{ leaveOnly: true }"
      class="breakout3 ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)] mb-[var(--space-m)] md:mb-[var(--space-l)]"
    >
      <slot name="label">
        Recommendations
      </slot>
    </h2>

    <!-- Recommendations list container -->
    <div
      ref="listRef"
      v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
      class="recommendations-list full-width-content flex flex-col"
    >
      <!-- Recommendation items slot -->
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
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
 * - ScrollTrigger recreated after page transitions via useScrollTriggerInit
 * - Uses once:true to prevent iOS Safari reversal during accordion animations
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
    default: true
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()

const sectionRef = ref(null)
const labelRef = ref(null)
const listRef = ref(null)

let scrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null

/**
 * Accordion state management
 * Track which recommendation item is currently expanded
 * Only one item can be open at a time
 */
const activeItemId = ref(null)

const setActiveItem = (id) => {
  // If clicking the same item, close it (toggle behavior)
  // If clicking a different item, open it and close the previous one
  activeItemId.value = activeItemId.value === id ? null : id
}

/**
 * Smart ScrollTrigger refresh for accordion animations
 * Ensures entrance ScrollTrigger is fully destroyed before refreshing
 * This prevents iOS Safari from triggering timeline reversal
 */
let pendingCallbacks = []

const executeRefresh = () => {
  // CRITICAL iOS Safari Fix: Ensure entrance ScrollTrigger is DEAD before refresh
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // TARGETED REFRESH: Refresh ScrollTriggers that care about scroll position thresholds
  // Includes:
  // - Pinned triggers (ImageScalingSection, etc.)
  // - Animation-based triggers (FooterSection, FooterHeroSection)
  // - Enter/leave callback triggers (ScrollButtonSVG - needs position recalc)
  // Excludes:
  // - Update-only triggers (marquees only use onUpdate, don't need position refresh)
  const triggersToRefresh = $ScrollTrigger.getAll().filter(
    st => st.pin || st.animation || st.vars?.onEnter || st.vars?.onLeave
  )

  triggersToRefresh.forEach((trigger) => {
    trigger.refresh()
  })

  // Execute queued callbacks
  const callbacks = [...pendingCallbacks]
  pendingCallbacks = []

  callbacks.forEach((cb) => {
    cb()
  })
}

// Debounce with 100ms delay to let once:true fully clean up
const debouncedRefresh = useDebounceFn(executeRefresh, 100)

/**
 * Public API for child components to request refresh
 * @param {Function} callback - Optional callback after refresh
 */
const requestRefresh = (callback) => {
  if (callback) {
    pendingCallbacks.push(callback)
  }
  debouncedRefresh()
}

// Provide accordion state to child RecommendationItem components
provide('activeItemId', activeItemId)
provide('setActiveItem', setActiveItem)
provide('requestRefresh', requestRefresh)

/**
 * Create reusable animation function for recommendations section
 * Animates label first, then staggers all recommendation items
 * Used by ScrollTrigger for scroll-linked animations
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

  // Animate recommendation items (stagger fade + y offset)
  // Query all .recommendation-item children within the list
  if (listRef.value) {
    const items = listRef.value.querySelectorAll('.recommendation-item')
    if (items.length > 0) {
      tl.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08, // Stagger item reveals
          ease: 'power2.out'
        },
        '<+0.2' // Start 0.2s after label animation begins
      )
    }
  }

  return tl
}

/**
 * Initialize ScrollTrigger animation
 */
const initScrollTrigger = () => {
  if (!props.animateOnScroll || !$ScrollTrigger || !sectionRef.value) return

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
  if (listRef.value) {
    const items = listRef.value.querySelectorAll('.recommendation-item')
    if (items.length > 0) {
      $gsap.set(items, { clearProps: 'all' })
      $gsap.set(items, { opacity: 0, y: 40 })
    }
  }

  // Create timeline with fromTo() defining both start and end states
  const scrollTimeline = createSectionAnimation()

  // Create ScrollTrigger with animation timeline
  // CRITICAL: Use 'once: true' to auto-destroy after entrance animation completes
  // This prevents iOS Safari from reversing the timeline during accordion animations
  scrollTriggerInstance = $ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 80%',
    end: 'bottom top+=25%',
    animation: scrollTimeline,
    once: true, // Auto-destroy after first trigger (prevents reversal on iOS Safari)
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
 * Recommendations section container styles
 * Minimal styling - most layout handled by Tailwind classes
 */
.recommendations-list {
  /* Flex column layout for vertical stacking */
  position: relative;
}
</style>
