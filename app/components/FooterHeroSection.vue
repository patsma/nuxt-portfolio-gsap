<template>
  <section
    ref="sectionRef"
    class="content-grid w-full min-h-[80dvh] md:min-h-[65dvh] grid items-center"
  >
    <div class="breakout3 translate-y-[var(--space-xl)]">
      <div ref="contentRef">
        <slot />
      </div>

      <div class="flex flex-col md:flex-row md:items-center gap-[var(--space-s)]">
        <div ref="servicesSlotRef">
          <slot name="services" />
        </div>
        <div
          ref="buttonSlotRef"
          class="md:ml-auto"
        >
          <slot name="button" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * FooterHeroSection - Scroll-triggered hero with SplitText animation
 *
 * Key difference from HeroSection:
 * - HeroSection: Entrance animation on first load only
 * - FooterHeroSection: ScrollTrigger animation every time user scrolls to it
 *
 * Pattern follows BiographySection for proper page transition coordination
 */

const props = defineProps({
  animateOnScroll: {
    type: Boolean,
    default: true
  }
})

const { $gsap, $SplitText, $ScrollTrigger } = useNuxtApp()

const sectionRef = ref(null)
const contentRef = ref(null)
const servicesSlotRef = ref(null)
const buttonSlotRef = ref(null)
const splitInstance = ref(null)

let scrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null
let unhookPageStart: (() => void) | null = null

/**
 * Create animation - same animation as HeroSection
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline()
  const textElement = contentRef.value?.querySelector('h1')

  if (!textElement || !$SplitText) {
    if (contentRef.value) {
      tl.fromTo(
        contentRef.value,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )
    }
    return tl
  }

  const originalHeight = textElement.offsetHeight
  $gsap.set(textElement, { height: originalHeight })

  const split = $SplitText.create(textElement, { type: 'lines', mask: 'lines' })
  splitInstance.value = split

  tl.fromTo(
    split.lines,
    { yPercent: 100, rotate: 20, transformOrigin: '0% 0%' },
    { yPercent: 0, rotate: 0, duration: 1, stagger: 0.08, ease: 'back.out(1.2)' }
  )

  if (servicesSlotRef.value && servicesSlotRef.value.children.length > 0) {
    const tags = servicesSlotRef.value.querySelectorAll('.tag, .tag-label')
    if (tags.length > 0) {
      tl.fromTo(
        Array.from(tags),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
        '<+0.3'
      )
    }
  }

  if (buttonSlotRef.value && buttonSlotRef.value.children.length > 0) {
    const button = buttonSlotRef.value.querySelector('.scroll-down, button, a')
    if (button) {
      tl.fromTo(
        button,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
        '<+0.2'
      )
    }
  }

  return tl
}

/**
 * Handle page leave animation
 */
const handlePageLeave = () => {
  if (splitInstance.value && splitInstance.value.lines) {
    $gsap.to(splitInstance.value.lines, {
      yPercent: -100,
      rotate: 20,
      transformOrigin: '100% 0%',
      duration: 0.7,
      stagger: 0.08,
      ease: 'power2.in'
    })
  }

  if (buttonSlotRef.value) {
    const button = buttonSlotRef.value.querySelector('.scroll-down, button, a')
    if (button) {
      $gsap.to(button, { opacity: 0, scale: 0.9, duration: 0.5, ease: 'power2.in' })
    }
  }
}

/**
 * Initialize ScrollTrigger animation
 */
const initScrollTrigger = async () => {
  if (!props.animateOnScroll || !$ScrollTrigger || !sectionRef.value) return

  // Wait for fonts to load before creating SplitText
  if (document.fonts) {
    await document.fonts.ready
  }

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  if (splitInstance.value) {
    splitInstance.value.revert?.()
    splitInstance.value = null
  }

  // Clear inline GSAP styles from page transitions
  if (sectionRef.value) $gsap.set(sectionRef.value, { clearProps: 'all' })
  if (contentRef.value) $gsap.set(contentRef.value, { clearProps: 'all' })

  const textElement = contentRef.value?.querySelector('h1')
  if (textElement) $gsap.set(textElement, { clearProps: 'all' })

  if (servicesSlotRef.value) {
    const tags = servicesSlotRef.value.querySelectorAll('.tag, .tag-label')
    if (tags.length > 0) $gsap.set(Array.from(tags), { clearProps: 'all' })
  }

  if (buttonSlotRef.value) {
    const button = buttonSlotRef.value.querySelector('.scroll-down, button, a')
    if (button) $gsap.set(button, { clearProps: 'all' })
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

/**
 * Cleanup all resources
 */
const cleanup = () => {
  unhookPageStart?.()
  unhookPageStart = null

  scrollTriggerInstance?.kill()
  scrollTriggerInstance = null

  if (splitInstance.value) {
    splitInstance.value.revert?.()
    splitInstance.value = null
  }
}

// Setup page leave hook on mount (separate from ScrollTrigger init)
onMounted(() => {
  const nuxtApp = useNuxtApp()
  unhookPageStart = nuxtApp.hook('page:start', handlePageLeave)
})

// Use abstraction composable for page transition coordination
useScrollTriggerInit(() => initScrollTrigger(), cleanup)
</script>
