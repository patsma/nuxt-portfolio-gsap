<template>
  <section
    ref="sectionRef"
    class="video-scaling-section content-grid w-full min-h-[100dvh] relative overflow-hidden"
  >
    <!-- Video container - scales and moves, respects grid -->
    <div
      ref="containerRef"
      class="video-container breakout3 relative will-change-transform"
    >
      <video
        ref="videoRef"
        :src="videoSrc"
        class="w-full h-full object-cover cursor-pointer"
        playsinline
        preload="auto"
        muted
        @click="handlePlayPause"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @ended="handleVideoEnded"
      />
    </div>

    <!-- Play/Replay button overlay - separate, doesn't scale with video -->
    <div
      v-show="!isPlaying"
      ref="playButtonRef"
      class="play-button-overlay absolute inset-0 grid place-items-center pointer-events-none"
    >
      <div class="pointer-events-auto" @click="handlePlayPause">
        <CursorPlaySVG />
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * VideoScalingSection Component - ScrollTrigger-based Video Reveal
 *
 * Animates a video from 25% scale (top-left) to 100% scale (centered) using
 * ScrollTrigger. Section pins during the animation and remains pinned until
 * user scrolls past the threshold.
 *
 * Animation Flow:
 * 1. Video starts at 25% scale in top-left corner
 * 2. As user scrolls, video scales up and moves to center
 * 3. At ~90% scaled, play button fades in (separate from video, doesn't scale)
 * 4. Video reaches 100% scale, centered in viewport
 * 5. Section stays pinned - user must scroll past threshold to unpin
 * 6. Play button visible when paused/ended, hidden when playing
 *
 * Features:
 * - Scroll-triggered scaling animation (25% → 100%)
 * - Section pins during and after animation
 * - Custom play/pause with CursorPlaySVG button
 * - Replay functionality when video ends
 * - Theme-aware background
 * - No native video controls
 * - Responsive (works on mobile with same animation)
 *
 * Props:
 * - videoSrc: Path to video file
 * - startScale: Initial scale (default: 0.25 = 25%)
 * - endScale: Final scale (default: 1 = 100%)
 * - scrollAmount: How much scroll to complete animation (default: "100%")
 *
 * Technical Details:
 * - Uses transform-origin: center for smooth scaling
 * - Initial position calculated: at 25% scale, translate to top-left
 * - Final position: scale 100%, centered (translate 0, 0)
 * - ScrollTrigger scrub: 1 for smooth scroll-tied animation
 * - Video muted by default (browsers require muted for autoplay)
 *
 * Usage:
 * <VideoScalingSection video-src="/assets/dummy/sample1.mp4" />
 */

// Props
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
   * Starting scale (0.25 = 25%)
   * @type {number}
   */
  startScale: {
    type: Number,
    default: 0.25,
  },
  /**
   * Ending scale (1 = 100%)
   * @type {number}
   */
  endScale: {
    type: Number,
    default: 1,
  },
  /**
   * Scroll distance to complete animation
   * Examples: "100%", "200%", "50%"
   * @type {string}
   */
  scrollAmount: {
    type: String,
    default: "100%",
  },
});

// GSAP
const { $gsap, $ScrollTrigger } = useNuxtApp();

// Refs
const sectionRef = ref(null);
const containerRef = ref(null);
const videoRef = ref(null);
const playButtonRef = ref(null);

// State
const isPlaying = ref(false);
const hasEnded = ref(false);

// ScrollTrigger instance (for cleanup)
let scrollTriggerInstance = null;

/**
 * Handle play/pause toggle
 * If video has ended, replay from beginning
 */
const handlePlayPause = () => {
  if (!videoRef.value) return;

  if (hasEnded.value) {
    // Replay from beginning
    videoRef.value.currentTime = 0;
    hasEnded.value = false;
  }

  if (videoRef.value.paused) {
    videoRef.value.play();
  } else {
    videoRef.value.pause();
  }
};

/**
 * Handle video ended event
 * Show play button again for replay
 */
const handleVideoEnded = () => {
  hasEnded.value = true;
  isPlaying.value = false;
};

onMounted(() => {
  if (!sectionRef.value || !containerRef.value || !$ScrollTrigger) return;

  /**
   * Scaling Math Explanation:
   *
   * Container is 100vw x 100vh with transform-origin: center
   * - At scale 1: video is centered (0, 0)
   * - At scale 0.25: video is 25% size, still centered
   *
   * To position 25% scaled video in top-left corner:
   * - Center is at (50vw, 50vh)
   * - At 0.25 scale, video spans 25vw x 25vh
   * - Top-left of scaled video is at: (50vw - 12.5vw, 50vh - 12.5vh) = (37.5vw, 37.5vh)
   * - To move top-left to (0, 0): translate (-37.5vw, -37.5vh)
   *
   * Calculation: -(100 - (100 * scale)) / 2 = -(100 - 25) / 2 = -37.5
   */

  const startOffset = -((100 - 100 * props.startScale) / 2);

  // Set initial state: 25% scale in top-left corner
  $gsap.set(containerRef.value, {
    scale: props.startScale,
    xPercent: startOffset,
    yPercent: startOffset,
    transformOrigin: "center center",
  });

  // Set initial state for play button (hidden, scaled down)
  $gsap.set(playButtonRef.value, {
    opacity: 0,
    scale: 0.8,
  });

  // Create timeline for scaling animation
  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: "top top", // Start when section top hits viewport top
      end: `+=${props.scrollAmount}`, // End after scrolling this amount
      pin: true, // Pin the section
      scrub: 1, // Smooth scrubbing (1 second smoothing)
      anticipatePin: 1, // Prevent jumpiness
      markers: false, // Set to true for debugging
      invalidateOnRefresh: true, // Recalculate on resize
    },
  });

  // Animate video to center (100% scale)
  tl.to(
    containerRef.value,
    {
      scale: props.endScale,
      xPercent: 0, // Center horizontally
      yPercent: 0, // Center vertically
      ease: "none", // Linear for scrubbing
    },
    0 // Start at beginning of timeline
  );

  // Animate play button in at 90% of video scaling
  // Button appears when video is almost fully scaled, indicating interactivity
  tl.to(
    playButtonRef.value,
    {
      opacity: 1,
      scale: 1,
      ease: "back.out(1.5)", // Bouncy entrance
      duration: 0.1, // Quick reveal (relative to timeline)
    },
    0.9 // Start at 90% of timeline (when video is almost 100%)
  );

  // Store instance for cleanup
  scrollTriggerInstance = tl.scrollTrigger;
});

onUnmounted(() => {
  // Clean up ScrollTrigger
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }

  // Pause video
  if (videoRef.value) {
    videoRef.value.pause();
  }
});
</script>

<style scoped>
.video-container {
  /* Container respects grid (breakout3) for width, full viewport height */
  width: 100%;
  height: 100vh;
  min-height: 100dvh;
}

.play-button-overlay {
  /* Ensure button is above video */
  z-index: 10;
}

/* Ensure video fills container properly */
video {
  display: block;
}
</style>
