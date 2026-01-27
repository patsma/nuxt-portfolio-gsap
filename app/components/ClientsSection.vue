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
        class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
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
          class="pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 2xl:pp-eiko-desktop-h2 text-[var(--theme-text-100)]"
        >
          <slot name="primary-clients" />
        </div>

        <!-- Secondary clients list (smaller text) -->
        <div
          ref="secondaryRef"
          class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p1 2xl:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]"
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
const loadingStore = useLoadingStore()
const pageTransitionStore = usePageTransitionStore()

const sectionRef = ref<HTMLElement | null>(null)
const labelRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const primaryRef = ref<HTMLElement | null>(null)
const secondaryRef = ref<HTMLElement | null>(null)

// Type for SplitText result (matches usePageTransition pattern)
interface SplitResult {
  chars?: Element[]
  words?: Element[]
  lines?: Element[]
  revert?: () => void
  [key: string]: unknown
}

let scrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null

// Module-level storage for word animations cleanup
let wordScrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null
const splitInstances: SplitResult[] = []

/**
 * Create reusable animation function for label + content
 * Used by ScrollTrigger for scroll-linked animations
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline()

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
        ease: 'power2.out'
      }
    )
  }

  // Animate content children (stagger fade + y offset)
  // Container animates to full opacity - words inside handle 0.5→1 effect
  // Query direct children using same selector as v-page-stagger directive
  if (contentRef.value) {
    const children = contentRef.value.querySelectorAll(':scope > *')
    if (children.length > 0) {
      tl.fromTo(
        children,
        { opacity: 0, y: 40 },
        {
          opacity: 1, // Container fully visible, word animation handles 0.5→1 effect
          y: 0,
          duration: 0.6,
          stagger: 0.08, // Stagger child element reveals
          ease: 'power2.out'
        },
        '<+0.2' // Start 0.2s after label animation begins
      )
    }
  }

  return tl
}

/**
 * Create word-by-word opacity animation using SplitText
 * Master timeline approach: Primary plays first, secondary plays after
 * Single ScrollTrigger controls the master timeline for proper sequencing
 * Reverse naturally plays backwards (secondary first, then primary)
 */
const createWordAnimations = () => {
  // Kill existing ScrollTrigger
  if (wordScrollTriggerInstance) {
    wordScrollTriggerInstance.kill()
    wordScrollTriggerInstance = null
  }

  // Revert existing SplitText instances (restores original DOM)
  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0

  // Create master timeline (paused - ScrollTrigger controls playback)
  const masterTl = $gsap.timeline({ paused: true })

  /**
   * Build timeline for a container's words
   * Returns the timeline (doesn't attach ScrollTrigger)
   */
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
      // Clear any leftover styles from previous animations
      $gsap.set(el, { clearProps: 'all' })

      // Split text into words using GSAP SplitText
      const split = $SplitText.create(el, { type: 'words' })
      splitInstances.push(split)

      // Set initial state (0.25 opacity for dramatic reveal)
      $gsap.set(split.words, { opacity: 0.25 })

      // Add to timeline (first paragraph at start, subsequent overlap slightly)
      tl.to(split.words, {
        opacity: 1,
        duration,
        stagger: { each: staggerEach, ease: 'sine.inOut' },
        ease: 'power2.out'
      }, index === 0 ? 0 : '<0.3') // Overlap paragraphs within same tier
    })

    return tl
  }

  // Build primary timeline (1.8s duration, 0.15s stagger)
  const primaryTl = buildContainerTimeline(primaryRef.value, 1.8, 0.15)

  // Build secondary timeline (slower: 2.4s duration, 0.10s stagger)
  const secondaryTl = buildContainerTimeline(secondaryRef.value, 2.4, 0.10)

  // Add to master: primary first, secondary after with small overlap
  if (primaryTl) {
    masterTl.add(primaryTl)
  }
  if (secondaryTl) {
    masterTl.add(secondaryTl, '-=1.2') // Overlap by 1.2s for smooth transition
  }

  // Single ScrollTrigger controls the master timeline
  wordScrollTriggerInstance = $ScrollTrigger.create({
    trigger: contentRef.value,
    start: 'top 50%',
    end: 'bottom top+=25%',
    animation: masterTl,
    toggleActions: 'play reverse play reverse',
    invalidateOnRefresh: true
  })
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
      // The v-page-split and v-page-stagger directives leave inline styles (opacity, transform)
      // Clear them, then explicitly set initial hidden state before ScrollTrigger takes over
      if (labelRef.value) {
        $gsap.set(labelRef.value, { clearProps: 'all' })
        $gsap.set(labelRef.value, { opacity: 0, y: 40 })
      }
      if (contentRef.value) {
        // Query direct children using same selector as v-page-stagger directive
        const children = contentRef.value.querySelectorAll(':scope > *')
        if (children.length > 0) {
          $gsap.set(children, { clearProps: 'all' })
          $gsap.set(children, { opacity: 0, y: 40 })
        }
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

      // Create word animations after section animation setup (Stage 2)
      createWordAnimations()
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

// Cleanup ScrollTrigger and word animations on unmount
onUnmounted(() => {
  // Kill section ScrollTrigger
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // Kill word ScrollTrigger (single instance now)
  if (wordScrollTriggerInstance) {
    wordScrollTriggerInstance.kill()
    wordScrollTriggerInstance = null
  }

  // Revert SplitText instances (restores original DOM)
  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0
})
</script>

<style scoped>
/**
 * Clients section container styles
 * Minimal styling - most layout handled by Tailwind classes
 */
</style>
