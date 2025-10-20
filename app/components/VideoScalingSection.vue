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
 * Animation Flow (Professional GSAP Pattern):
 * 1. Video starts at 25% scale in top-left corner
 * 2. As user scrolls, video scales up and moves to center (first ~40% of scroll)
 * 3. At ~35% scroll (~90% video scaled), play button smoothly fades in
 * 4. Video reaches 100% scale at ~40% scroll, centered in viewport
 * 5. Section STAYS PINNED for remaining ~60% of scroll (viewing time!)
 * 6. User can watch/interact with full-size video while pinned
 * 7. Play button visible when paused/ended, hidden when playing
 *
 * Scroll Distribution (default 300vh with 2.5 timeline units):
 * - 0-120vh (1 unit): Video scaling animation (25% → 100%)
 * - ~108vh: Button appears smoothly (when video ~90% scaled)
 * - 120-300vh (1.5 units): Video at 100%, pinned for viewing (180vh interaction time)
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
 * - Button timing: onUpdate callback monitors scroll progress (professional GSAP pattern)
 * - Triggers button at progress > 0.35 (35% through timeline = ~105vh = video ~90% scaled)
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
   * Scroll distance to complete animation and pin duration
   * Examples: "300%", "250%", "200%"
   * Video scales in first ~40%, stays pinned for remaining ~60%
   * Longer values = more viewing time at full size
   * @type {string}
   */
  scrollAmount: {
    type: String,
    default: "300%",
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
let videoScrollTrigger = null;

// Button timeline (created once, reused)
let buttonTimeline = null;

// Button animation state (for onUpdate callback)
let buttonAnimated = false;

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

  // Create button animation timeline ONCE (paused, reusable)
  // Button is already hidden by CSS - GSAP will take control
  buttonTimeline = $gsap.timeline({ paused: true });
  buttonTimeline.to(playButtonRef.value, {
    opacity: 1,
    visibility: "visible",
    scale: 1,
    duration: 0.6,
    ease: "back.out(1.5)",
  });

  // Create timeline with SEPARATED phases (professional GSAP pattern)
  // Phase 1 (0-40%): Video scales from 25% to 100%
  // Phase 2 (40-100%): Video stays at 100%, section pinned for viewing
  const tl = $gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: "top top", // Start when section top hits viewport top
      end: `+=${props.scrollAmount}`, // End after scrolling this amount (default: 300vh)
      pin: true, // Pin the section
      scrub: 1, // Smooth scrubbing (1 second smoothing)
      anticipatePin: 1, // Prevent jumpiness
      markers: false, // Set to true for debugging
      invalidateOnRefresh: true, // Recalculate on resize
      onUpdate: (self) => {
        // Professional pattern: control existing timeline based on scroll progress
        // self.progress ranges from 0 to 1 (0% to 100% through the timeline)
        // At 0.35 progress = ~105vh scrolled = video ~90% scaled
        // NO new animations created - just play/reverse existing timeline
        if (self.progress > 0.35 && !buttonAnimated) {
          // Play button timeline (animates to visible)
          buttonTimeline.play();
          buttonAnimated = true;
        } else if (self.progress < 0.35 && buttonAnimated) {
          // Reverse button timeline (animates to hidden)
          buttonTimeline.reverse();
          buttonAnimated = false;
        }
      },
    },
  });

  // PHASE 1: Video scales in FIRST 40% of scroll
  // Using absolute duration: 1 unit out of 2.5 total = 40%
  // With 300vh scroll: 1/2.5 * 300vh = 120vh of scrolling
  tl.to(
    containerRef.value,
    {
      scale: props.endScale,
      xPercent: 0, // Center horizontally
      yPercent: 0, // Center vertically
      ease: "power2.out", // Smooth easing (better than linear)
      duration: 1, // 1 "unit" of timeline (out of 2.5 total)
    },
    0 // Start at beginning
  );

  // PHASE 2: Extend timeline for remaining 60% (keeps section pinned)
  // This creates viewing time - video stays at 100% while pinned
  // Using absolute duration: 1.5 units = 60% of 2.5 total
  // With 300vh scroll: 1.5/2.5 * 300vh = 180vh of "hold" time
  tl.to({}, { duration: 1.5 }, 1); // Dummy animation extends timeline

  // Store video ScrollTrigger for cleanup
  videoScrollTrigger = tl.scrollTrigger;
});

onUnmounted(() => {
  // Clean up ScrollTrigger
  if (videoScrollTrigger) {
    videoScrollTrigger.kill();
    videoScrollTrigger = null;
  }

  // Clean up button timeline
  if (buttonTimeline) {
    buttonTimeline.kill();
    buttonTimeline = null;
  }

  // Reset button animation state
  buttonAnimated = false;

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
  /* Hidden by default - GSAP will take control and animate */
  opacity: 0;
  visibility: hidden;
  /* Ensure button is above video */
  z-index: 10;
}

/* Ensure video fills container properly */
video {
  display: block;
}
</style>
