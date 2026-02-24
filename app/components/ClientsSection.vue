<template>
  <section
    ref="sectionRef"
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <div
      class="breakout3 grid gap-[var(--space-m)] lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-3xl)] items-start"
    >
      <!-- Clients label (left column on laptop+) -->
      <!-- Page transition OUT only, ScrollTrigger handles IN animation -->
      <h2
        ref="labelRef"
        v-page-split:lines="{ leaveOnly: true }"
        class="body-mobile-caption text-[var(--theme-text-40)]"
      >
        <slot name="label">
          Clients
        </slot>
      </h2>

      <!-- Clients content wrapper (right column on laptop+) -->
      <!-- Page transition OUT only, ScrollTrigger handles IN animation -->
      <div
        ref="contentRef"
        v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
        class="space-y-[var(--space-m)] flex flex-col"
      >
        <!-- Primary clients list (larger text) -->
        <div
          ref="primaryRef"
          class="display-mobile-h2 md:display-laptop-h2 2xl:display-desktop-h2 text-[var(--theme-text-100)]"
        >
          <slot name="primary-clients" />
        </div>

        <!-- Secondary clients list (smaller text) -->
        <div
          ref="secondaryRef"
          class="body-mobile-p1 md:body-laptop-p1 2xl:body-desktop-p1 text-[var(--theme-text-60)]"
        >
          <slot name="secondary-clients" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * ClientsSection Component - Clients List Container
 *
 * Displays client lists with scroll-triggered animations.
 * Uses slot-based design for flexibility with primary and secondary client lists.
 *
 * Features:
 * - Scroll-triggered entrance animations (fade + y offset, staggered)
 * - Page transition support (exit animations)
 * - Two-tier client display (primary/secondary)
 * - Theme-aware colors
 * - Responsive layout using content-grid system
 * - Similar pattern to BiographySection
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
 * <ClientsSection>
 *   <template #label>Clients</template>
 *   <template #primary-clients>
 *     <p>Carlsberg, Coop, Lundbech Foundation...</p>
 *   </template>
 *   <template #secondary-clients>
 *     <p>Arkyn, Begravelse Danmark, Bibelselskabet...</p>
 *   </template>
 * </ClientsSection>
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

const { $gsap, $ScrollTrigger, $SplitText } = useNuxtApp()

const sectionRef = ref<HTMLElement | null>(null)
const labelRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const primaryRef = ref<HTMLElement | null>(null)
const secondaryRef = ref<HTMLElement | null>(null)

interface SplitResult {
  chars?: Element[]
  words?: Element[]
  lines?: Element[]
  revert?: () => void
  [key: string]: unknown
}

let scrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null
let wordScrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null
const splitInstances: SplitResult[] = []

/**
 * Create reusable animation function for label + content
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

  if (contentRef.value) {
    const children = contentRef.value.querySelectorAll(':scope > *')
    if (children.length > 0) {
      tl.fromTo(
        children,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' },
        '<+0.2'
      )
    }
  }

  return tl
}

/**
 * Create word-by-word opacity animation using SplitText
 */
const createWordAnimations = () => {
  if (wordScrollTriggerInstance) {
    wordScrollTriggerInstance.kill()
    wordScrollTriggerInstance = null
  }

  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0

  const masterTl = $gsap.timeline({ paused: true })

  const buildContainerTimeline = (
    container: HTMLElement | null,
    duration: number,
    staggerEach: number
  ): ReturnType<typeof $gsap.timeline> | null => {
    if (!container) return null

    const paragraphs = container.querySelectorAll('p')
    if (!paragraphs.length) return null

    const tl = $gsap.timeline()

    paragraphs.forEach((el, index) => {
      $gsap.set(el, { clearProps: 'all' })
      const split = $SplitText.create(el, { type: 'words' })
      splitInstances.push(split)
      $gsap.set(split.words, { opacity: 0.25 })

      tl.to(split.words, {
        opacity: 1,
        duration,
        stagger: { each: staggerEach, ease: 'sine.inOut' },
        ease: 'power2.out'
      }, index === 0 ? 0 : '<0.3')
    })

    return tl
  }

  const primaryTl = buildContainerTimeline(primaryRef.value, 1.8, 0.15)
  const secondaryTl = buildContainerTimeline(secondaryRef.value, 2.4, 0.10)

  if (primaryTl) masterTl.add(primaryTl)
  if (secondaryTl) masterTl.add(secondaryTl, '-=1.2')

  wordScrollTriggerInstance = $ScrollTrigger.create({
    trigger: contentRef.value,
    start: 'top 50%',
    end: 'bottom top+=25%',
    animation: masterTl,
    toggleActions: 'play reverse play reverse',
    invalidateOnRefresh: true
  })
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
  if (contentRef.value) {
    const children = contentRef.value.querySelectorAll(':scope > *')
    if (children.length > 0) {
      $gsap.set(children, { clearProps: 'all' })
      $gsap.set(children, { opacity: 0, y: 40 })
    }
  }

  const scrollTimeline = createSectionAnimation()
  scrollTriggerInstance = $ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 80%',
    end: 'bottom top+=25%',
    animation: scrollTimeline,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true
  })

  createWordAnimations()
}

/**
 * Cleanup all ScrollTriggers and SplitText instances
 */
const cleanup = () => {
  scrollTriggerInstance?.kill()
  scrollTriggerInstance = null

  wordScrollTriggerInstance?.kill()
  wordScrollTriggerInstance = null

  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0
}

// Use abstraction composable for page transition coordination
useScrollTriggerInit(() => initScrollTrigger(), cleanup)
</script>

<style scoped>
/**
 * Clients section container styles
 * Minimal styling - most layout handled by Tailwind classes
 */
</style>
