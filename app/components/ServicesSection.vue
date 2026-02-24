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
        v-page-split:lines="{ leaveOnly: true }"
        class="body-mobile-caption 2xl:body-desktop-caption text-[var(--theme-text-40)]"
      >
        <slot name="label">
          Services
        </slot>
      </h2>

      <!-- Services content area:
           Mobile: 1 column (default)
           Tablet (md): 2 columns
           Desktop (lg): 2 columns (within right side of main grid) -->
      <div
        ref="contentRef"
        class="grid gap-[var(--space-m)] md:grid-cols-2 md:gap-[var(--space-3xl)]"
      >
        <!-- Left services column -->
        <div
          ref="contentLeftRef"
          v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
          class="space-y-[var(--space-m)] display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]"
        >
          <slot name="column-left" />
        </div>

        <!-- Right services column -->
        <div
          ref="contentRightRef"
          v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
          class="space-y-[var(--space-m)] display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-60)]"
        >
          <slot name="column-right" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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
    default: true
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()

const sectionRef = ref(null)
const labelRef = ref(null)
const contentRef = ref(null)
const contentLeftRef = ref(null)
const contentRightRef = ref(null)

let scrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null

/**
 * Create reusable animation function for services section
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline()

  if (labelRef.value) {
    tl.fromTo(
      labelRef.value,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
  }

  const leftItems = contentLeftRef.value ? Array.from(contentLeftRef.value.children) : []
  const rightItems = contentRightRef.value ? Array.from(contentRightRef.value.children) : []
  const allServiceItems = [...leftItems, ...rightItems]

  if (allServiceItems.length > 0) {
    tl.fromTo(
      allServiceItems,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' },
      '<+0.2'
    )
  }

  return tl
}

/**
 * Initialize ScrollTrigger animation
 */
const initScrollTrigger = () => {
  if (!props.animateOnScroll || !$ScrollTrigger || !sectionRef.value) return

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // Clear inline GSAP styles from page transitions, set initial state
  if (labelRef.value) {
    $gsap.set(labelRef.value, { clearProps: 'all' })
    $gsap.set(labelRef.value, { opacity: 0, y: 40 })
  }

  const leftItems = contentLeftRef.value ? Array.from(contentLeftRef.value.children) : []
  const rightItems = contentRightRef.value ? Array.from(contentRightRef.value.children) : []
  const allServiceItems = [...leftItems, ...rightItems]

  if (allServiceItems.length > 0) {
    $gsap.set(allServiceItems, { clearProps: 'all' })
    $gsap.set(allServiceItems, { opacity: 0, y: 40 })
  }

  const scrollTimeline = createSectionAnimation()
  scrollTriggerInstance = $ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 80%',
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
