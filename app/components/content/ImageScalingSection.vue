<template>
  <section
    ref="sectionRef"
    class="image-scaling-section content-grid w-full min-h-[100dvh] relative overflow-hidden"
  >
    <div
      ref="containerRef"
      v-page-clip:bottom="{ duration: 0.8, leaveOnly: true }"
      class="image-container breakout3 relative will-change-transform"
    >
      <div class="parallax-container">
        <NuxtImg
          ref="imageRef"
          :src="imageSrc"
          :alt="imageAlt"
          class="parallax-media w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * ImageScalingSection Component - ScrollTrigger Image Reveal
 *
 * Scroll-driven image growth with manual parallax effect.
 * Image container grows from small size (configurable corner) to full viewport (centered) as user scrolls.
 * Uses dimension animation instead of scale with synchronized parallax animation.
 *
 * DESKTOP (>= 1024px):
 * - 0-120vh: Container grows from startWidth×startHeight to 100vw×100vh
 * - Simultaneous: Image moves UP (yPercent: 0 to -28.57) revealing bottom portion
 * - Section is PINNED during animation
 *
 * MOBILE/TABLET (< 1024px):
 * - Same scaling animation, scrubbed to scroll
 * - NO pinning - section scrolls naturally
 * - Animation plays as section moves through viewport
 * - No parallax effect (simpler for native scroll)
 *
 * Props:
 * - imageSrc: Image path (required)
 * - imageAlt: Alt text for accessibility (required)
 * - startWidth: Initial width in vw (default: 25)
 * - startHeight: Initial height in vh (default: 25)
 * - scrollAmount: Scroll distance for animation (default: '120%')
 * - startPosition: Starting corner - 'left' or 'right' (default: 'left')
 */

import type { ScrollTriggerInstance } from '~/types/nuxt-gsap'

const props = defineProps({
  imageSrc: {
    type: String,
    required: true
  },
  imageAlt: {
    type: String,
    required: true
  },
  startWidth: {
    type: Number,
    default: 25
  },
  startHeight: {
    type: Number,
    default: 25
  },
  scrollAmount: {
    type: String,
    default: '120%'
  },
  startPosition: {
    type: String,
    default: 'left',
    validator: (value: unknown) => typeof value === 'string' && ['left', 'right'].includes(value)
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()
const { isDesktop } = useIsMobile()

const sectionRef = ref(null)
const containerRef = ref(null)
const imageRef = ref(null)

let imageScrollTrigger: ScrollTriggerInstance | null = null

/**
 * Initialize desktop animation (pinned, with parallax)
 */
const initDesktopAnimation = () => {
  // Calculate initial position based on startPosition prop
  const initialPosition = props.startPosition === 'right'
    ? { left: '100%', top: 0, xPercent: -100 }
    : { left: 0, top: 0 }

  // Set initial state: small size positioned at chosen corner
  $gsap.set(containerRef.value, {
    width: `${props.startWidth}vw`,
    height: `${props.startHeight}vh`,
    ...initialPosition,
    position: 'absolute'
  })

  // Set initial image position for parallax
  $gsap.set(imageRef.value.$el, { yPercent: 0 })

  // Main timeline: Grow container dimensions as user scrolls (PINNED)
  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top top',
      end: `+=${props.scrollAmount}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  })

  // Dimension animation: grow from small to full viewport, center position
  tl.to(containerRef.value, {
    width: '100vw',
    height: '100vh',
    left: '50%',
    top: '50%',
    xPercent: -50,
    yPercent: -50,
    ease: 'power2.out',
    duration: 1
  }, 0)

  // Parallax animation: move image vertically
  tl.to(imageRef.value.$el, {
    yPercent: -28.57,
    ease: 'power2.out',
    duration: 1
  }, 0)

  imageScrollTrigger = tl.scrollTrigger
}

/**
 * Initialize mobile/tablet animation (non-pinned, scrubbed to scroll)
 */
const initMobileAnimation = () => {
  // Calculate initial position based on startPosition prop
  const initialPosition = props.startPosition === 'right'
    ? { left: '100%', top: 0, xPercent: -100 }
    : { left: 0, top: 0 }

  // Set initial state: small size positioned at chosen corner
  $gsap.set(containerRef.value, {
    width: `${props.startWidth}vw`,
    height: `${props.startHeight}vh`,
    ...initialPosition,
    position: 'absolute'
  })

  // Image at 100% height on mobile (no parallax movement needed)
  $gsap.set(imageRef.value.$el, { yPercent: 0 })

  // Main timeline: Grow container as section scrolls through viewport (NO PIN)
  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top bottom',
      end: 'top top',
      pin: false,
      scrub: 1,
      invalidateOnRefresh: true
    }
  })

  // Dimension animation: grow from small to full viewport, center position
  tl.to(containerRef.value, {
    width: '100vw',
    height: '100vh',
    left: '50%',
    top: '50%',
    xPercent: -50,
    yPercent: -50,
    ease: 'power2.out',
    duration: 1
  }, 0)

  imageScrollTrigger = tl.scrollTrigger
}

/**
 * Initialize ScrollTrigger animation
 * Called after page transition completes to avoid clip-path conflicts
 */
const initScrollTrigger = () => {
  if (!sectionRef.value || !containerRef.value || !imageRef.value || !$ScrollTrigger) return

  // CRITICAL: Clear any clip-path from page transitions before setting up ScrollTrigger
  $gsap.set(containerRef.value, { clearProps: 'clipPath' })

  // Kill existing ScrollTrigger if present (for page navigation back)
  if (imageScrollTrigger) {
    imageScrollTrigger.kill()
    imageScrollTrigger = null
  }

  // Choose animation mode based on device
  if (isDesktop.value) {
    initDesktopAnimation()
  }
  else {
    initMobileAnimation()
  }
}

// Use abstraction composable for page transition coordination
useScrollTriggerInit(
  () => initScrollTrigger(),
  () => {
    imageScrollTrigger?.kill()
    imageScrollTrigger = null
  }
)
</script>

<style scoped>
.image-container {
  /* Dimensions set via GSAP (starts small, grows to 100vw×100vh) */
  /* Position set via GSAP (starts top-left, centers on completion) */
  position: absolute;
  overflow: hidden; /* Prevent image overflow */
}

/* Parallax container structure (from SCROLL_SYSTEM.md) */
.parallax-container {
  overflow: hidden;
  position: relative;
  height: 100%;
  width: 100%;
}

.parallax-media {
  width: 100%;
  height: 140%; /* 40% larger for parallax movement */
  object-fit: cover;
  display: block;
}
</style>
