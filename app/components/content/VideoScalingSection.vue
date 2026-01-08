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
 * Video container grows from small size (configurable corner) to full viewport (centered)
 * over first 72% of scroll, then remains pinned for remaining 28% for user interaction.
 * Uses dimension animation instead of scale with synchronized parallax animation.
 * Much slower animation (360vh = 3x image speed) provides natural, gradual reveal.
 *
 * Animation Timeline:
 * - 0-360vh (72%): Container grows from startWidth×startHeight to 100vw×100vh
 * - Simultaneous: Video moves UP (yPercent: 0 to -28.57) revealing bottom portion
 * - Section enters viewport: Play button fades in with magnetic effect
 * - 360-500vh (28%): Video pinned at 100% for comfortable viewing and interaction
 *
 * Props:
 * - videoSrc: Video path (default: '/assets/dummy/sample1.mp4')
 * - posterSrc: Poster image (native browser placeholder)
 * - startWidth: Initial width in vw (default: 25)
 * - startHeight: Initial height in vh (default: 25)
 * - scrollAmount: Pin duration (default: '500%' for gradual reveal + interaction time)
 * - startPosition: Starting corner - 'left' or 'right' (default: 'left')
 *
 * Features:
 * - Native video poster support (browser-managed loading state)
 * - Play button with magnetic hover effect (spring physics)
 * - Scroll-triggered play button entrance animation
 * - Manual parallax via ScrollTrigger timeline (works in pinned sections)
 * - Dimension-based animation (not scale) for consistent sizing
 * - Configurable start position (left or right corner)
 * - Scroll-triggered animations with pinning
 * - Grid-aware layout (breakout3)
 * - Performance-optimized (single timeline, play/reverse control)
 *
 * Technical Notes:
 * - Parallax is manual (not data-speed) because section is pinned
 * - Video is 140% height with overflow:hidden for parallax range (40% extra space)
 * - Container overflow:hidden prevents video cutoff issues
 * - Start position uses left/xPercent for consistent animation path
 * - Magnetic effect auto-disabled on mobile/touch devices
 *
 * Usage:
 * <VideoScalingSection
 *   video-src="/path/to/video.mp4"
 *   poster-src="/path/to/poster.jpg"
 *   :start-width="25"
 *   :start-height="25"
 *   start-position="left"
 * />
 *
 * <!-- Start from right corner -->
 * <VideoScalingSection
 *   video-src="/path/to/video2.mp4"
 *   poster-src="/path/to/poster2.jpg"
 *   start-position="right"
 * />
 */

import type { ScrollTriggerInstance, GSAPTimeline } from '~/types/nuxt-gsap'
import useMagnetic from '~/composables/useMagnetic'

const props = defineProps({
  /**
   * Video source path
   * @type {string}
   */
  videoSrc: {
    type: String,
    default: '/assets/dummy/sample1.mp4'
  },
  /**
   * Poster image (native HTML5 placeholder shown while loading)
   * @type {string}
   */
  posterSrc: {
    type: String,
    default: ''
  },
  /**
   * Starting width in viewport units (vw)
   * @type {number}
   */
  startWidth: {
    type: Number,
    default: 25
  },
  /**
   * Starting height in viewport units (vh)
   * @type {number}
   */
  startHeight: {
    type: Number,
    default: 25
  },
  /**
   * Scroll distance for animation and pin duration
   * Video grows in first ~72%, stays pinned for remaining ~28%
   * Much slower animation (360vh = 3x image speed) for natural, gradual reveal
   * @type {string}
   */
  scrollAmount: {
    type: String,
    default: '500%'
  },
  /**
   * Starting position of the video (left or right side)
   * @type {string}
   */
  startPosition: {
    type: String,
    default: 'left',
    validator: (value: unknown) => typeof value === 'string' && ['left', 'right'].includes(value)
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()
const loadingStore = useLoadingStore()
const pageTransitionStore = usePageTransitionStore()

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
// Button hides when video plays, shows when paused/ended
const updateButtonVisibility = (playing: boolean) => {
  if (!buttonTimeline) return

  if (playing) {
    buttonTimeline.play() // Fade out when playing
  }
  else {
    buttonTimeline.reverse() // Fade back in when paused
  }
}

// Pause video when leaving section (scrolling past in either direction)
const handleLeaveSection = () => {
  if (!videoRef.value) return

  if (!videoRef.value.paused) {
    videoRef.value.pause() // Triggers @pause → isPlaying = false → watch → updateButtonVisibility
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
 * Initialize ScrollTrigger animation
 * Called after page transition completes to avoid clip-path conflicts
 */
const initScrollTrigger = () => {
  if (!sectionRef.value || !containerRef.value || !videoRef.value || !$ScrollTrigger) return

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

  // CRITICAL: Clear any clip-path from page transitions before setting up ScrollTrigger
  $gsap.set(containerRef.value, { clearProps: 'clipPath' })

  // Calculate initial position based on startPosition prop
  const initialPosition = props.startPosition === 'right'
    ? { left: '100%', top: 0, xPercent: -100 } // Align to right edge
    : { left: 0, top: 0 } // Align to left edge

  // Set initial state: small size positioned at chosen corner
  $gsap.set(containerRef.value, {
    width: `${props.startWidth}vw`,
    height: `${props.startHeight}vh`,
    ...initialPosition,
    position: 'absolute'
  })

  // Set initial video position for parallax
  // Start at 0 (top aligned) to prevent clipping
  $gsap.set(videoRef.value, {
    yPercent: 0
  })

  // Set initial button state for entrance animation
  $gsap.set(playButtonRef.value, {
    opacity: 0,
    scale: 0.8
  })

  // Scroll-triggered entrance animation for play button
  // Fades in when section enters viewport
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
  // Starts from visible state, plays to hide, reverses to show
  buttonTimeline = $gsap.timeline({ paused: true })
  buttonTimeline.to(playButtonRef.value, {
    opacity: 0,
    scale: 0.9,
    duration: 0.4,
    ease: 'power2.out'
  })

  // Main timeline: Phase 1 (72% scale) + Phase 2 (28% hold)
  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top top',
      end: `+=${props.scrollAmount}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      markers: false,
      invalidateOnRefresh: true,
      onLeave: handleLeaveSection,
      onLeaveBack: handleLeaveSection
    }
  })

  // Phase 1: Container dimension animation (1.8 units = 72% of 2.5 total)
  // This takes 360vh of scroll (3x slower than ImageScalingSection for gradual reveal)
  tl.to(
    containerRef.value,
    {
      width: '100vw',
      height: '100vh',
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      ease: 'power2.out',
      duration: 1.8
    },
    0
  )

  // Phase 1: Video parallax animation (synchronized with container growth)
  // Video is 140% tall, so 40% extra space = 28.57% of video height
  // Move UP (negative) to reveal bottom portion of video
  tl.to(
    videoRef.value,
    {
      yPercent: -28.57, // Move UP to show bottom portion (40% extra / 140% video = 28.57%)
      ease: 'power2.out',
      duration: 1.8
    },
    0
  )

  // Phase 2: Extend timeline to keep pinned (0.7 units = 28% of 2.5 total)
  // This ensures Phase 1 (duration 1.8) takes 72% of scroll (360vh of 500vh)
  // and Phase 2 (duration 0.7) takes 28% of scroll (140vh of 500vh)
  // Much slower animation provides natural, gradual reveal matching image feel
  tl.to({}, { duration: 0.7 }, 1.8)

  videoScrollTrigger = tl.scrollTrigger
}

// Initialize on mount, coordinating with page transitions
onMounted(() => {
  // First load: Create immediately after mount
  if (loadingStore.isFirstLoad) {
    nextTick(() => {
      initScrollTrigger()
    })
  }
  else {
    // After page navigation, wait for page transition to complete
    // Watch pageTransitionStore.isTransitioning for proper timing
    const unwatch = watch(
      () => pageTransitionStore.isTransitioning,
      (isTransitioning) => {
        // When transition completes (isTransitioning becomes false), initialize
        if (!isTransitioning) {
          nextTick(() => {
            initScrollTrigger()
          })
          unwatch()
        }
      },
      { immediate: true }
    )
  }
})

onUnmounted(() => {
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

  if (videoRef.value) {
    videoRef.value.pause()
  }
})
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
