<template>
  <section
    ref="heroRef"
    class="content-grid w-full h-screen grid content-end"
    data-entrance-animate="true"
  >
    <div class="breakout3 pb-24">
      <!-- Default slot for main hero content (h1, p, etc.) -->
      <slot />

      <!-- Named slot for optional services list -->
      <slot name="services" />
    </div>
  </section>
</template>

<script setup>
/**
 * HeroSection Component - Reusable Layout Wrapper with Entrance Animation
 *
 * Provides consistent hero section layout and spacing with optional entrance animation.
 * Content is passed via slots for maximum flexibility.
 *
 * Slots:
 * - default: Main hero content (h1, p, etc.)
 * - services: Optional services list or additional content
 *
 * Props:
 * - animateEntrance: Enable entrance animation (default: true)
 * - position: GSAP position parameter for timing (default: '<-0.3' - overlap header by 0.3s)
 *
 * Features:
 * - Responsive content-grid layout
 * - Vertical centering (flex items-center)
 * - Theme-aware (inherits theme colors)
 * - Entrance animation system integration
 * - Works with page transition directives (add to slot content)
 *
 * Usage:
 * <HeroSection :animate-entrance="true" position="<-0.3">
 *   <h1 v-page-split:lines>Your headline</h1>
 *   <template #services>
 *     <nav>Your services</nav>
 *   </template>
 * </HeroSection>
 */

// Props
const props = defineProps({
  /**
   * Enable entrance animation on first load
   * @type {boolean}
   */
  animateEntrance: {
    type: Boolean,
    default: true,
  },
  /**
   * GSAP position parameter for animation timing
   * Examples:
   * - '<' - Start with header (overlap completely)
   * - '<-0.3' - Start 0.3s before header ends (default)
   * - '+=0.2' - Start 0.2s after previous animation
   * - 'start' - Start at timeline beginning
   * @type {string}
   */
  position: {
    type: String,
    default: "<-0.3", // Overlap header by 0.3s for smooth flow
  },
});

// Nuxt GSAP
const { $gsap, $SplitText } = useNuxtApp();

// Entrance animation system
const { setupEntrance } = useEntranceAnimation();

// Refs
const heroRef = ref(null);
const splitInstance = ref(null);

onMounted(() => {
  if (!props.animateEntrance || !heroRef.value) return;

  // Setup entrance animation with SplitText
  setupEntrance(heroRef.value, {
    position: props.position,
    animate: (el) => {
      // Find element to animate (e.g., h1 with text content)
      const textElement = el.querySelector("h1");

      if (!textElement || !$SplitText) {
        // Fallback to simple fade if no text element or SplitText not available
        const tl = $gsap.timeline();
        $gsap.set(el, { y: 40 });
        tl.to(el, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" });
        return tl;
      }

      // Lock height before SplitText to prevent layout shift
      const originalHeight = textElement.offsetHeight;
      $gsap.set(textElement, { height: originalHeight });

      // Apply SplitText with masking (split by lines)
      const split = $SplitText.create(textElement, {
        type: "lines",
        mask: "lines", // Use masking for clean reveals
      });
      splitInstance.value = split;

      // Create timeline
      const tl = $gsap.timeline();

      // Element is already hidden by CSS (data-entrance-animate attribute)
      // Set initial state: text positioned below mask with rotation
      $gsap.set(split.lines, {
        yPercent: 100,
        rotate: 20,
        transformOrigin: "0% 0%",
      });

      // Make container visible
      $gsap.set(el, { autoAlpha: 1 });

      // Animate: slide up from below mask with rotation straightening
      tl.to(split.lines, {
        yPercent: 0,
        rotate: 0,
        duration: 1,
        stagger: 0.08,
        ease: "back.out(1.2)",
      });

      return tl;
    },
  });
});

onUnmounted(() => {
  // Clean up SplitText instance
  if (splitInstance.value) {
    splitInstance.value.revert?.();
    splitInstance.value = null;
  }
});
</script>

<style scoped>
/* Optional: Add gradient background like reference image */
/* .hero-section {
  background: linear-gradient(135deg, #fef5f1 0%, #fde5e0 100%);
} */
</style>
