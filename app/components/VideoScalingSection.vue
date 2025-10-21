<template>
  <section
    ref="sectionRef"
    class="video-scaling-section content-grid w-full min-h-[100dvh] relative overflow-hidden"
  >
    <div
      ref="containerRef"
      v-page-clip:bottom="{ duration: 0.8 }"
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
      v-page-fade="{ duration: 0.6 }"
      class="play-button-wrapper absolute inset-0 grid place-items-center pointer-events-none"
    >
      <!-- Inner element for scroll-triggered animation -->
      <div
        ref="playButtonRef"
        class="play-button-overlay grid place-items-center pointer-events-none"
      >
        <div class="pointer-events-auto" @click="handlePlayPause">
          <CursorPlaySVG />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * VideoScalingSection Component - ScrollTrigger Video Reveal
 *
 * Scroll-driven video growth with manual parallax and pinned section for extended viewing.
 * Video container grows from small size (configurable corner) to full viewport (centered)
 * over first 40% of scroll, then remains pinned for remaining 60% for user interaction.
 * Uses dimension animation instead of scale with synchronized parallax animation.
 *
 * Animation Timeline:
 * - 0-120vh (40%): Container grows from startWidth×startHeight to 100vw×100vh
 * - Simultaneous: Video moves UP (yPercent: 0 to -28.57) revealing bottom portion
 * - ~105vh: Play button appears (triggered by scroll progress at 35%)
 * - 120-300vh (60%): Video pinned at 100% for viewing and interaction
 *
 * Props:
 * - videoSrc: Video path (default: '/assets/dummy/sample1.mp4')
 * - posterSrc: Poster image (native browser placeholder)
 * - startWidth: Initial width in vw (default: 25)
 * - startHeight: Initial height in vh (default: 25)
 * - scrollAmount: Pin duration (default: '300%')
 * - startPosition: Starting corner - 'left' or 'right' (default: 'left')
 *
 * Features:
 * - Native video poster support (browser-managed loading state)
 * - Custom play/pause button with replay
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

const props = defineProps({
  /**
   * Video source path
   * @type {string}
   */
  videoSrc: {
    type: String,
    default: "/assets/dummy/sample1.mp4",
  },
  /**
   * Poster image (native HTML5 placeholder shown while loading)
   * @type {string}
   */
  posterSrc: {
    type: String,
    default: "",
  },
  /**
   * Starting width in viewport units (vw)
   * @type {number}
   */
  startWidth: {
    type: Number,
    default: 25,
  },
  /**
   * Starting height in viewport units (vh)
   * @type {number}
   */
  startHeight: {
    type: Number,
    default: 25,
  },
  /**
   * Scroll distance for animation and pin duration
   * Video grows in first ~40%, stays pinned for remaining ~60%
   * @type {string}
   */
  scrollAmount: {
    type: String,
    default: "300%",
  },
  /**
   * Starting position of the video (left or right side)
   * @type {string}
   */
  startPosition: {
    type: String,
    default: "left",
    validator: (value) => ["left", "right"].includes(value),
  },
});

const { $gsap, $ScrollTrigger } = useNuxtApp();

const sectionRef = ref(null);
const containerRef = ref(null);
const videoRef = ref(null);
const playButtonRef = ref(null);

const isPlaying = ref(false);
const hasEnded = ref(false);

let videoScrollTrigger = null;
let buttonTimeline = null;
let buttonAnimated = false;

const handlePlayPause = () => {
  if (!videoRef.value) return;

  if (hasEnded.value) {
    videoRef.value.currentTime = 0;
    hasEnded.value = false;
  }

  if (videoRef.value.paused) {
    videoRef.value.play();
  } else {
    videoRef.value.pause();
  }
};

const handleVideoEnded = () => {
  hasEnded.value = true;
  isPlaying.value = false;
};

// Update button visibility based on scroll progress and video state
const updateButtonVisibility = () => {
  if (!buttonTimeline) return;

  // Show button if: scroll reached threshold AND video not playing
  const shouldShow = buttonAnimated && !isPlaying.value;

  if (shouldShow && buttonTimeline.progress() < 1) {
    buttonTimeline.play();
  } else if (!shouldShow && buttonTimeline.progress() > 0) {
    buttonTimeline.reverse();
  }
};

// Pause video when leaving section (scrolling past in either direction)
const handleLeaveSection = () => {
  if (!videoRef.value) return;

  if (!videoRef.value.paused) {
    videoRef.value.pause(); // Triggers @pause → isPlaying = false → watch → updateButtonVisibility
  }

  if (hasEnded.value) {
    hasEnded.value = false;
  }
};

// Watch video playing state for smooth button transitions
watch(isPlaying, () => {
  updateButtonVisibility();
});

onMounted(() => {
  if (!sectionRef.value || !containerRef.value || !videoRef.value || !$ScrollTrigger) return;

  // Calculate initial position based on startPosition prop
  const initialPosition = props.startPosition === "right"
    ? { left: "100%", top: 0, xPercent: -100 } // Align to right edge
    : { left: 0, top: 0 }; // Align to left edge

  // Set initial state: small size positioned at chosen corner
  $gsap.set(containerRef.value, {
    width: `${props.startWidth}vw`,
    height: `${props.startHeight}vh`,
    ...initialPosition,
    position: "absolute",
  });

  // Set initial video position for parallax
  // Start at 0 (top aligned) to prevent clipping
  $gsap.set(videoRef.value, {
    yPercent: 0,
  });

  // Button timeline: created once, controlled via play/reverse
  buttonTimeline = $gsap.timeline({ paused: true });
  buttonTimeline.to(playButtonRef.value, {
    opacity: 1,
    visibility: "visible",
    scale: 1,
    duration: 0.6,
    ease: "back.out(1.5)",
  });

  // Main timeline: Phase 1 (40% scale) + Phase 2 (60% hold)
  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: "top top",
      end: `+=${props.scrollAmount}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      markers: false,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Update button animation threshold at 35% scroll progress
        const wasAnimated = buttonAnimated;

        if (self.progress > 0.35) {
          buttonAnimated = true;
        } else {
          buttonAnimated = false;
        }

        // Trigger smooth transition if threshold crossed
        if (wasAnimated !== buttonAnimated) {
          updateButtonVisibility();
        }
      },
      onLeave: handleLeaveSection,
      onLeaveBack: handleLeaveSection,
    },
  });

  // Phase 1: Container dimension animation (1 unit = 40% of 2.5 total)
  tl.to(
    containerRef.value,
    {
      width: "100vw",
      height: "100vh",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      ease: "power2.out",
      duration: 1,
    },
    0
  );

  // Phase 1: Video parallax animation (synchronized with container growth)
  // Video is 140% tall, so 40% extra space = 28.57% of video height
  // Move UP (negative) to reveal bottom portion of video
  tl.to(
    videoRef.value,
    {
      yPercent: -28.57, // Move UP to show bottom portion (40% extra / 140% video = 28.57%)
      ease: "power2.out",
      duration: 1,
    },
    0
  );

  // Phase 2: Extend timeline to keep pinned (1.5 units = 60% of 2.5 total)
  // This ensures Phase 1 (duration 1) takes 40% of scroll (120vh of 300vh)
  // and Phase 2 (duration 1.5) takes 60% of scroll (180vh of 300vh)
  tl.to({}, { duration: 1.5 }, 1);

  videoScrollTrigger = tl.scrollTrigger;
});

onUnmounted(() => {
  if (videoScrollTrigger) {
    videoScrollTrigger.kill();
    videoScrollTrigger = null;
  }

  if (buttonTimeline) {
    buttonTimeline.kill();
    buttonTimeline = null;
  }

  buttonAnimated = false;

  if (videoRef.value) {
    videoRef.value.pause();
  }
});
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
  /* Hidden by CSS - GSAP animates to visible */
  opacity: 0;
  visibility: hidden;
  z-index: 10;
}

video {
  display: block;
}
</style>
