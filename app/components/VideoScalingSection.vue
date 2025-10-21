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
      <video
        ref="videoRef"
        :src="videoSrc"
        :poster="posterSrc"
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
 * Scroll-driven video scaling with pinned section for extended viewing.
 * Video scales from 25% (top-left) to 100% (centered) over first 40% of scroll,
 * then remains pinned for remaining 60% for user interaction.
 *
 * Animation Timeline:
 * - 0-120vh (40%): Video scales and centers
 * - ~105vh: Play button appears (triggered by scroll progress)
 * - 120-300vh (60%): Video pinned at 100% for viewing
 *
 * Props:
 * - videoSrc: Video path (default: '/assets/dummy/sample1.mp4')
 * - posterSrc: Poster image (native browser placeholder)
 * - startScale: Initial scale (default: 0.25)
 * - endScale: Final scale (default: 1)
 * - scrollAmount: Pin duration (default: '300%')
 *
 * Features:
 * - Native video poster support (browser-managed loading state)
 * - Custom play/pause button with replay
 * - Scroll-triggered animations
 * - Grid-aware layout (breakout3)
 * - Performance-optimized (single timeline, play/reverse control)
 *
 * Usage:
 * <VideoScalingSection
 *   video-src="/path/to/video.mp4"
 *   poster-src="/path/to/poster.jpg"
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
   * Scroll distance for animation and pin duration
   * Video scales in first ~40%, stays pinned for remaining ~60%
   * @type {string}
   */
  scrollAmount: {
    type: String,
    default: "300%",
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
  if (!sectionRef.value || !containerRef.value || !$ScrollTrigger) return;

  // Calculate offset to position scaled video in top-left
  // Formula: -(100 - (100 * scale)) / 2
  const startOffset = -((100 - 100 * props.startScale) / 2);

  $gsap.set(containerRef.value, {
    scale: props.startScale,
    xPercent: startOffset,
    yPercent: startOffset,
    transformOrigin: "center center",
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

  // Phase 1: Video scales (1 unit = 40% of 2.5 total)
  tl.to(
    containerRef.value,
    {
      scale: props.endScale,
      xPercent: 0,
      yPercent: 0,
      ease: "power2.out",
      duration: 1,
    },
    0
  );

  // Phase 2: Extend timeline to keep pinned (1.5 units = 60%)
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
  width: 100%;
  height: 100vh;
  min-height: 100dvh;
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
