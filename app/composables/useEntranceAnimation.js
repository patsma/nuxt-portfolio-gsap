/**
 * Entrance Animation System
 *
 * Manages entrance animations for components in the initial viewport.
 * Components queue their animations which play sequentially after the loading sequence.
 *
 * IMPORTANT: Hide elements with CSS BEFORE JavaScript loads to prevent flash:
 * - Add data-entrance-animate="true" attribute to element
 * - CSS in base.scss will hide it initially (opacity: 0, visibility: hidden)
 * - Then GSAP animates it to visible (autoAlpha: 1)
 *
 * Features:
 * - Full GSAP position parameter support ('<', '+=0.3', 'label+=0.5', etc.)
 * - Automatic viewport detection
 * - ScrollTrigger fallback for below-fold content
 * - Only runs on first page load
 * - CSS-first hiding prevents FOUC
 *
 * Usage:
 * ```vue
 * <template>
 *   <div ref="myElement" data-entrance-animate="true">
 *     Content
 *   </div>
 * </template>
 *
 * <script setup>
 * const { setupEntrance } = useEntranceAnimation()
 * const myElement = ref(null)
 *
 * onMounted(() => {
 *   setupEntrance(myElement.value, {
 *     position: '<-0.3',  // Overlap previous by 0.3s
 *     animate: (el) => {
 *       const tl = $gsap.timeline()
 *       // Element already hidden by CSS, just set transform offset
 *       $gsap.set(el, { y: 30 })
 *       // Animate to visible with autoAlpha
 *       tl.to(el, { autoAlpha: 1, y: 0, duration: 0.6 })
 *       return tl
 *     },
 *     scrollTrigger: { ... } // Optional fallback
 *   })
 * })
 * </script>
 * ```
 */

// Module-level state for master timeline and queue
let masterTimeline = null;
let animationQueue = [];
let isInitialized = false;
let isPlaying = false;

/**
 * Check if element is in viewport on page load
 * @param {HTMLElement} el - Element to check
 * @returns {boolean} - True if element is in viewport
 */
const isInViewport = (el) => {
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;

  // Element is in viewport if its top is above bottom of viewport
  // and its bottom is below top of viewport
  return rect.top < windowHeight && rect.bottom > 0;
};

/**
 * Main composable for entrance animation system
 */
export const useEntranceAnimation = () => {
  const nuxtApp = useNuxtApp();
  const { $gsap } = nuxtApp;
  const { isFirstLoad } = useLoadingSequence();

  /**
   * Initialize the master timeline and event listeners
   */
  const initialize = () => {
    if (isInitialized) return;

    // Create master timeline (paused, will play after entrance-ready event)
    masterTimeline = $gsap.timeline({
      paused: true,
      onComplete: () => {
        // console.log("✨ All entrance animations complete");

        // Remove is-first-load class from html element
        // This stops CSS from hiding elements on subsequent navigations
        document.documentElement.classList.remove("is-first-load");
        // console.log(
        //   "🔓 Removed is-first-load class - page transitions can now handle visibility"
        // );

        // Fire completion event
        window.dispatchEvent(new CustomEvent("app:entrance-complete"));
      },
    });

    // Add initial label for positioning
    masterTimeline.add("start", 0);

    // Listen for app:start-animations event (fired by loading system)
    // This triggers after loader completes, starting all entrance animations together
    window.addEventListener(
      "app:start-animations",
      () => {
        if (!isPlaying && animationQueue.length > 0) {
          playEntranceAnimations();
        }
      },
      { once: true }
    );

    isInitialized = true;
    // console.log("🎬 Entrance animation system initialized");
  };

  /**
   * Play all queued entrance animations
   */
  const playEntranceAnimations = () => {
    if (isPlaying || !masterTimeline || animationQueue.length === 0) return;

    isPlaying = true;
    // console.log(`🎬 Playing ${animationQueue.length} entrance animations`);

    // Add all queued animations to master timeline
    animationQueue.forEach(({ element, animateFn, position }) => {
      try {
        // Call the animation function (returns tween or timeline)
        const animation = animateFn(element);

        // Add to master timeline at specified position
        if (animation) {
          masterTimeline.add(animation, position);
        }
      } catch (error) {
        console.error("❌ Error creating entrance animation:", error);
      }
    });

    // Clear queue after adding to timeline
    animationQueue = [];

    // Play the master timeline
    masterTimeline.play();
  };

  /**
   * Setup entrance animation for a component
   *
   * @param {HTMLElement} element - Element to animate
   * @param {Object} options - Animation options
   * @param {string} [options.position='+=0.15'] - GSAP position parameter
   * @param {Function} options.animate - Animation function (el) => tween/timeline
   * @param {Object} [options.scrollTrigger] - Optional ScrollTrigger config for fallback
   */
  const setupEntrance = (element, options = {}) => {
    if (!element) {
      console.warn("⚠️ setupEntrance: No element provided");
      return;
    }

    const {
      position = "+=0.15", // Default: 0.15s after previous animation
      animate,
      scrollTrigger,
    } = options;

    if (typeof animate !== "function") {
      console.warn("⚠️ setupEntrance: animate must be a function");
      return;
    }

    // Only run on first page load
    if (!isFirstLoad()) {
      // console.log("⏭️ Not first load, skipping entrance animation");

      // If ScrollTrigger config provided, set it up as fallback
      if (scrollTrigger) {
        setupScrollTriggerFallback(element, animate, scrollTrigger);
      }

      return;
    }

    // Initialize system if not already done
    initialize();

    // Check if element is in viewport
    const inViewport = isInViewport(element);

    if (inViewport) {
      // Queue for entrance animation
      // console.log("📝 Queued entrance animation for element:", element);
      animationQueue.push({
        element,
        animateFn: animate,
        position,
      });
    } else {
      // Element not in viewport, use ScrollTrigger if provided
      // console.log(
      //   "👁️ Element not in viewport, using ScrollTrigger fallback:",
      //   element
      // );

      if (scrollTrigger) {
        setupScrollTriggerFallback(element, animate, scrollTrigger);
      } else {
        // No ScrollTrigger config, just run animation immediately
        // (useful for elements that should be visible but not animated on scroll)
        try {
          animate(element);
        } catch (error) {
          console.error("❌ Error running immediate animation:", error);
        }
      }
    }
  };

  /**
   * Setup ScrollTrigger animation as fallback
   *
   * @param {HTMLElement} element - Element to animate
   * @param {Function} animateFn - Animation function
   * @param {Object} scrollTriggerConfig - ScrollTrigger configuration
   */
  const setupScrollTriggerFallback = (
    element,
    animateFn,
    scrollTriggerConfig
  ) => {
    const { $ScrollTrigger } = nuxtApp;

    if (!$ScrollTrigger) {
      console.warn("⚠️ ScrollTrigger not available for fallback");
      return;
    }

    try {
      // Create animation
      const animation = animateFn(element);

      if (!animation) return;

      // Attach ScrollTrigger
      $ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        ...scrollTriggerConfig,
        animation,
        once: true, // Only animate once
      });

      // console.log("✅ ScrollTrigger fallback setup for element:", element);
    } catch (error) {
      console.error("❌ Error setting up ScrollTrigger fallback:", error);
    }
  };

  /**
   * Get master timeline (useful for debugging)
   * @returns {gsap.core.Timeline|null}
   */
  const getTimeline = () => masterTimeline;

  /**
   * Reset system (useful for testing or cleanup)
   */
  const reset = () => {
    if (masterTimeline) {
      masterTimeline.kill();
      masterTimeline = null;
    }
    animationQueue = [];
    isInitialized = false;
    isPlaying = false;
    // console.log("🔄 Entrance animation system reset");
  };

  return {
    setupEntrance,
    getTimeline,
    reset,
  };
};
