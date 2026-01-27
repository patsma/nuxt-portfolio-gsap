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
        v-page-split:lines="{ leaveOnly: true }"
        class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
      >
        <slot name="label">
          Biography
        </slot>
      </h2>

      <!-- Biography content (right column on laptop+) -->
      <!-- Page transition OUT only, ScrollTrigger handles IN animation -->
      <div
        ref="contentRef"
        v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
        class="space-y-[var(--space-m)] ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2"
      >
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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

// Type for SplitText result (matches usePageTransition pattern)
interface SplitResult {
  chars?: Element[]
  words?: Element[]
  lines?: Element[]
  revert?: () => void
  [key: string]: unknown
}

let scrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null

// Module-level storage for line animations cleanup
let lineScrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null
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
  // Query direct children using same selector as v-page-stagger directive
  if (contentRef.value) {
    const children = contentRef.value.querySelectorAll(':scope > *')
    if (children.length > 0) {
      tl.fromTo(
        children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
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
 * Create masked line reveal animation using SplitText
 * Lines slide up from behind mask with subtle rotation - organic "typewriter meets cinema" feel
 * Paragraphs play sequentially - first paragraph completes before second begins
 */
const createLineAnimations = () => {
  // Kill existing ScrollTrigger
  if (lineScrollTriggerInstance) {
    lineScrollTriggerInstance.kill()
    lineScrollTriggerInstance = null
  }

  // Revert existing SplitText instances (restores original DOM)
  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0

  // Create master timeline (paused - ScrollTrigger controls playback)
  const masterTl = $gsap.timeline({ paused: true })

  // Split paragraphs and animate lines with mask reveal
  const paragraphs = contentRef.value?.querySelectorAll('p')
  if (!paragraphs?.length) return

  paragraphs.forEach((el, pIndex) => {
    // Clear any leftover styles from previous animations
    $gsap.set(el, { clearProps: 'all' })

    // Lock height before split to prevent layout shift
    const originalHeight = el.offsetHeight
    $gsap.set(el, { height: originalHeight, overflow: 'hidden' })

    // Split text into lines with mask for clean reveal effect
    const split = $SplitText.create(el, {
      type: 'lines',
      mask: 'lines'
    })
    splitInstances.push(split)

    // Initial state: hidden below mask with subtle rotation
    $gsap.set(split.lines, {
      yPercent: 100,
      rotate: 8,
      transformOrigin: '0% 100%' // Pivot from bottom-left for natural rotation
    })

    // Build paragraph timeline
    const paragraphTl = $gsap.timeline()
    paragraphTl.to(split.lines, {
      yPercent: 0,
      rotate: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out'
    })

    // Add to master timeline: first at 0, subsequent overlap with previous
    if (pIndex === 0) {
      masterTl.add(paragraphTl, 0)
    }
    else {
      masterTl.add(paragraphTl, '>-0.4') // Start 0.4s before previous ends for smooth overlap
    }
  })

  // Single ScrollTrigger controls master timeline
  lineScrollTriggerInstance = $ScrollTrigger.create({
    trigger: contentRef.value,
    start: 'top 65%',
    end: 'bottom top+=20%',
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
        // scrub: 0.5, // Smooth scrubbing with 0.5s delay for organic feel
        invalidateOnRefresh: true // Recalculate on window resize/refresh
      })

      // Create line animations after section animation setup
      createLineAnimations()
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

// Cleanup ScrollTrigger and line animations on unmount
onUnmounted(() => {
  // Kill section ScrollTrigger
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // Kill line ScrollTrigger
  if (lineScrollTriggerInstance) {
    lineScrollTriggerInstance.kill()
    lineScrollTriggerInstance = null
  }

  // Revert SplitText instances (restores original DOM)
  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0
})
</script>
