<template>
  <section
    ref="sectionRef"
    class="video-scaling-section content-grid w-full min-h-[100dvh] relative overflow-hidden"
  >
    <div
      ref="containerRef"
      v-page-clip:bottom="{ duration: 0.8, leaveOnly: true }"
      class="video-container breakout3 relative will-change-transform"
    >
      <div class="parallax-container">
        <video
          ref="videoRef"
          :src="videoSrc"
          :poster="posterSrc"
          class="parallax-media w-full h-full object-cover cursor-pointer"
          playsinline
          preload="auto"
          muted
          @click="handlePlayPause"
          @play="isPlaying = true"
          @pause="isPlaying = false"
          @ended="handleVideoEnded"
        />
      </div>
    </div>

    <!-- Wrapper for page transitions (prevents animation conflicts) -->
    <div
      v-page-fade="{ duration: 0.6, leaveOnly: true }"
      class="play-button-wrapper absolute inset-0 grid place-items-center pointer-events-none"
    >
      <!-- Inner element for scroll-triggered animation -->
      <div
        ref="playButtonRef"
        class="play-button-overlay grid place-items-center pointer-events-none"
      >
        <div
          class="pointer-events-auto"
          @click="handlePlayPause"
        >
          <CursorPlaySVG />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * VideoScalingSection Component - ScrollTrigger Video Reveal
 *
 * Scroll-driven video growth with manual parallax and pinned section for extended viewing.
 *
 * DESKTOP (>= 1024px):
 * - 0-360vh (72%): Container grows from startWidth×startHeight to 100vw×100vh
 * - Simultaneous: Video moves UP (yPercent: 0 to -28.57) revealing bottom portion
 * - Section enters viewport: Play button fades in with magnetic effect
 * - 360-500vh (28%): Video PINNED at 100% for comfortable viewing and interaction
 *
 * MOBILE/TABLET (< 1024px):
 * - Same scaling animation, scrubbed to scroll
 * - NO pinning - section scrolls naturally
 * - Animation plays as section moves through viewport
 * - No parallax effect (simpler for native scroll)
 * - Play button still appears with entrance animation
 *
 * Props:
 * - videoSrc: Video path (default: '/assets/dummy/sample1.mp4')
 * - posterSrc: Poster image (native browser placeholder)
 * - startWidth: Initial width in vw (default: 25)
 * - startHeight: Initial height in vh (default: 25)
 * - scrollAmount: Pin duration (default: '500%' for gradual reveal + interaction time)
 * - startPosition: Starting corner - 'left' or 'right' (default: 'left')
 */

import type { ScrollTriggerInstance, GSAPTimeline } from '~/types/nuxt-gsap'
import useMagnetic from '~/composables/useMagnetic'

const props = defineProps({
  videoSrc: {
    type: String,
    default: '/assets/dummy/sample1.mp4'
  },
  posterSrc: {
    type: String,
    default: ''
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
    default: '500%'
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
const videoRef = ref(null)
const playButtonRef = ref(null)

const isPlaying = ref(false)
const hasEnded = ref(false)

let videoScrollTrigger: ScrollTriggerInstance | null = null
let entranceScrollTrigger: ScrollTriggerInstance | null = null
let buttonTimeline: GSAPTimeline | null = null

// Apply magnetic effect to play button (like ScrollButtonSVG)
// Must be called at top level - composable has its own onMounted
useMagnetic(playButtonRef, {
  threshold: 150,
  maxDisplacement: 28,
  strength: 0.5,
  stiffness: 0.08,
  damping: 0.82,
  velocityInfluence: 1.5,
  timeScale: 0.4
})

const handlePlayPause = () => {
  if (!videoRef.value) return

  if (hasEnded.value) {
    videoRef.value.currentTime = 0
    hasEnded.value = false
  }

  if (videoRef.value.paused) {
    videoRef.value.play()
  }
  else {
    videoRef.value.pause()
  }
}

const handleVideoEnded = () => {
  hasEnded.value = true
  isPlaying.value = false
}

// Update button visibility based on video playing state
const updateButtonVisibility = (playing: boolean) => {
  if (!buttonTimeline) return

  if (playing) {
    buttonTimeline.play()
  }
  else {
    buttonTimeline.reverse()
  }
}

// Pause video when leaving section (scrolling past in either direction)
const handleLeaveSection = () => {
  if (!videoRef.value) return

  if (!videoRef.value.paused) {
    videoRef.value.pause()
  }

  if (hasEnded.value) {
    hasEnded.value = false
  }
}

// Watch video playing state for smooth button transitions
watch(isPlaying, (playing) => {
  updateButtonVisibility(playing)
})

/**
 * Setup common elements (button entrance, button timeline)
 */
const setupButtonAnimations = () => {
  // Set initial button state for entrance animation
  $gsap.set(playButtonRef.value, {
    opacity: 0,
    scale: 0.8
  })

  // Scroll-triggered entrance animation for play button
  entranceScrollTrigger = $ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      $gsap.to(playButtonRef.value, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.5)'
      })
    }
  })

  // Button visibility timeline: hides button when video plays
  buttonTimeline = $gsap.timeline({ paused: true })
  buttonTimeline.to(playButtonRef.value, {
    opacity: 0,
    scale: 0.9,
    duration: 0.4,
    ease: 'power2.out'
  })
}

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

  // Set initial video position for parallax
  $gsap.set(videoRef.value, { yPercent: 0 })

  // Main timeline: Phase 1 (72% scale) + Phase 2 (28% hold) - PINNED
  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top top',
      end: `+=${props.scrollAmount}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onLeave: handleLeaveSection,
      onLeaveBack: handleLeaveSection
    }
  })

  // Phase 1: Container dimension animation (1.8 units = 72% of 2.5 total)
  tl.to(containerRef.value, {
    width: '100vw',
    height: '100vh',
    left: '50%',
    top: '50%',
    xPercent: -50,
    yPercent: -50,
    ease: 'power2.out',
    duration: 1.8
  }, 0)

  // Phase 1: Video parallax animation
  tl.to(videoRef.value, {
    yPercent: -28.57,
    ease: 'power2.out',
    duration: 1.8
  }, 0)

  // Phase 2: Extend timeline to keep pinned (0.7 units = 28% of 2.5 total)
  tl.to({}, { duration: 0.7 }, 1.8)

  videoScrollTrigger = tl.scrollTrigger
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

  // Video at 100% height on mobile (no parallax movement needed)
  $gsap.set(videoRef.value, { yPercent: 0 })

  // Main timeline: Grow container as section scrolls through viewport (NO PIN)
  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top bottom',
      end: 'top top',
      pin: false,
      scrub: 1,
      invalidateOnRefresh: true,
      onLeave: handleLeaveSection,
      onLeaveBack: handleLeaveSection
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

  videoScrollTrigger = tl.scrollTrigger
}

/**
 * Initialize ScrollTrigger animation
 * Called after page transition completes to avoid clip-path conflicts
 */
const initScrollTrigger = () => {
  if (!sectionRef.value || !containerRef.value || !videoRef.value || !$ScrollTrigger) return

  // CRITICAL: Clear any clip-path from page transitions before setting up ScrollTrigger
  $gsap.set(containerRef.value, { clearProps: 'clipPath' })

  // Kill existing ScrollTriggers/timelines if present (for page navigation back)
  if (videoScrollTrigger) {
    videoScrollTrigger.kill()
    videoScrollTrigger = null
  }
  if (entranceScrollTrigger) {
    entranceScrollTrigger.kill()
    entranceScrollTrigger = null
  }
  if (buttonTimeline) {
    buttonTimeline.kill()
    buttonTimeline = null
  }

  // Setup button animations (common to both desktop and mobile)
  setupButtonAnimations()

  // Choose animation mode based on device
  if (isDesktop.value) {
    initDesktopAnimation()
  }
  else {
    initMobileAnimation()
  }
}

/**
 * Cleanup all ScrollTriggers and timelines
 */
const cleanup = () => {
  videoScrollTrigger?.kill()
  videoScrollTrigger = null

  entranceScrollTrigger?.kill()
  entranceScrollTrigger = null

  buttonTimeline?.kill()
  buttonTimeline = null

  if (videoRef.value) {
    videoRef.value.pause()
  }
}

// Use abstraction composable for page transition coordination
useScrollTriggerInit(
  () => initScrollTrigger(),
  cleanup
)
</script>

<style scoped>
.video-container {
  /* Dimensions set via GSAP (starts small, grows to 100vw×100vh) */
  /* Position set via GSAP (starts at corner, centers on completion) */
  position: absolute;
  overflow: hidden; /* Prevent video overflow */
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

.play-button-overlay {
  /* Initial state set by GSAP (opacity: 0, scale: 0.8) */
  /* Entrance animation fades in when section enters viewport */
  z-index: 10;
}

video {
  display: block;
}
</style>
