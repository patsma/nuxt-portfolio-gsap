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
let lineScrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null
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
 * Create masked line reveal animation using SplitText
 */
const createLineAnimations = () => {
  if (lineScrollTriggerInstance) {
    lineScrollTriggerInstance.kill()
    lineScrollTriggerInstance = null
  }

  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0

  const masterTl = $gsap.timeline({ paused: true })
  const paragraphs = contentRef.value?.querySelectorAll('p')
  if (!paragraphs?.length) return

  paragraphs.forEach((el, pIndex) => {
    $gsap.set(el, { clearProps: 'all' })
    const originalHeight = el.offsetHeight
    $gsap.set(el, { height: originalHeight, overflow: 'hidden' })

    const split = $SplitText.create(el, { type: 'lines', mask: 'lines' })
    splitInstances.push(split)

    $gsap.set(split.lines, {
      yPercent: 100,
      rotate: 8,
      transformOrigin: '0% 100%'
    })

    const paragraphTl = $gsap.timeline()
    paragraphTl.to(split.lines, {
      yPercent: 0,
      rotate: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out'
    })

    if (pIndex === 0) {
      masterTl.add(paragraphTl, 0)
    }
    else {
      masterTl.add(paragraphTl, '>-0.4')
    }
  })

  lineScrollTriggerInstance = $ScrollTrigger.create({
    trigger: contentRef.value,
    start: 'top 65%',
    end: 'bottom top',
    animation: masterTl,
    toggleActions: 'play reverse play reverse',
    invalidateOnRefresh: true
  })
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

  // Create line animations after section animation setup
  createLineAnimations()
}

/**
 * Cleanup all ScrollTriggers and SplitText instances
 */
const cleanup = () => {
  scrollTriggerInstance?.kill()
  scrollTriggerInstance = null

  lineScrollTriggerInstance?.kill()
  lineScrollTriggerInstance = null

  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0
}

// Use abstraction composable for page transition coordination
useScrollTriggerInit(() => initScrollTrigger(), cleanup)
</script>
