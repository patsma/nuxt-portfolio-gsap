<template>
  <section
    ref="sectionRef"
    class="image-scaling-section content-grid w-full min-h-[100dvh] relative overflow-hidden"
  >
    <div
      ref="containerRef"
      v-page-clip:bottom="{ duration: 0.8 }"
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

<script setup>
/**
 * ImageScalingSection Component - ScrollTrigger Image Reveal
 *
 * Scroll-driven image growth with manual parallax effect.
 * Image container grows from small size (top-left) to full viewport (centered) as user scrolls.
 * Uses dimension animation instead of scale with synchronized parallax animation.
 *
 * Animation Timeline:
 * - 0-120vh: Container grows from startWidth×startHeight to 100vw×100vh
 * - Simultaneous: Image moves UP (yPercent: 0 to -28.57) revealing bottom portion
 * - Section is pinned during animation
 *
 * Props:
 * - imageSrc: Image path (required)
 * - imageAlt: Alt text for accessibility (required)
 * - startWidth: Initial width in vw (default: 25)
 * - startHeight: Initial height in vh (default: 25)
 * - scrollAmount: Scroll distance for animation (default: '120%')
 *
 * Features:
 * - NuxtImg for optimized image loading
 * - Manual parallax via ScrollTrigger timeline (works in pinned sections)
 * - Dimension-based animation (not scale) for consistent sizing
 * - Grid-aware layout (breakout3)
 * - Performance-optimized (single timeline, scrubbed)
 *
 * Technical Notes:
 * - Parallax is manual (not data-speed) because section is pinned
 * - Image is 140% height with overflow:hidden for parallax range (40% extra space)
 * - Container overflow:hidden prevents image cutoff issues
 *
 * Usage:
 * <ImageScalingSection
 *   image-src="/path/to/image.jpg"
 *   image-alt="Description of image"
 *   :start-width="25"
 *   :start-height="25"
 * />
 */

const props = defineProps({
  /**
   * Image source path (required)
   * @type {string}
   */
  imageSrc: {
    type: String,
    required: true,
  },
  /**
   * Alt text for accessibility (required)
   * @type {string}
   */
  imageAlt: {
    type: String,
    required: true,
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
   * Scroll distance for animation
   * Container grows throughout this distance, no pinning
   * @type {string}
   */
  scrollAmount: {
    type: String,
    default: "120%",
  },
});

const { $gsap, $ScrollTrigger } = useNuxtApp();

const sectionRef = ref(null);
const containerRef = ref(null);
const imageRef = ref(null);

let imageScrollTrigger = null;

onMounted(() => {
  if (!sectionRef.value || !containerRef.value || !imageRef.value || !$ScrollTrigger) return;

  // Set initial state: small size positioned in top-left
  $gsap.set(containerRef.value, {
    width: `${props.startWidth}vw`,
    height: `${props.startHeight}vh`,
    left: 0,
    top: 0,
    position: "absolute",
  });

  // Set initial image position for parallax
  // Start at 0 (top aligned) to prevent clipping
  $gsap.set(imageRef.value.$el, {
    yPercent: 0,
  });

  // Main timeline: Grow container dimensions as user scrolls
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
    },
  });

  // Dimension animation: grow from small to full viewport, center position
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

  // Parallax animation: move image vertically for parallax effect
  // Synced with container growth (runs at same time, position 0)
  // Image is 140% tall, so 40% extra space = 28.57% of image height
  // Move UP (negative) to reveal bottom portion of image
  tl.to(
    imageRef.value.$el,
    {
      yPercent: -28.57, // Move UP to show bottom portion (40% extra / 140% image = 28.57%)
      ease: "power2.out",
      duration: 1,
    },
    0
  );

  imageScrollTrigger = tl.scrollTrigger;
});

onUnmounted(() => {
  if (imageScrollTrigger) {
    imageScrollTrigger.kill();
    imageScrollTrigger = null;
  }
});
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
