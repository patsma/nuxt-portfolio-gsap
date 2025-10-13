/**
 * ScrollSmoother Manager Composable
 *
 * Manages GSAP ScrollSmoother instance lifecycle and provides refresh capability.
 * Named "Manager" to avoid conflict with auto-generated useScrollSmoother from @hypernym/nuxt-gsap.
 *
 * USAGE:
 * const { createSmoother, killSmoother, getSmoother, refreshSmoother } = useScrollSmootherManager()
 * createSmoother({ smooth: 2, effects: true })
 * refreshSmoother() // Call after DOM changes to recalculate data-speed/data-lag
 * killSmoother()
 */

// Store the active smoother instance at module level so it's shared across all calls
let smootherInstance = null;

export const useScrollSmootherManager = () => {
  /**
   * Create a new ScrollSmoother instance
   * @param {Object} config - ScrollSmoother configuration (supports all ScrollSmoother options including onUpdate)
   * @returns {Object} ScrollSmoother instance
   */
  const createSmoother = (config = {}) => {
    // Only run on client side
    if (typeof window === "undefined") {
      console.warn("⚠️ ScrollSmoother can only run on client side");
      return null;
    }

    // Kill existing instance before creating new one
    if (smootherInstance) {
      killSmoother();
    }

    // Default configuration - all config options are passed through to ScrollSmoother.create()
    const defaultConfig = {
      smooth: 2, // seconds it takes to "catch up" to native scroll position
      effects: true, // look for data-speed and data-lag attributes
      ...config, // Includes onUpdate, smoothTouch, normalizeScroll, and any other ScrollSmoother options
    };

    // console.log('🔍 Checking for ScrollSmoother...')
    // console.log('window.ScrollSmoother:', typeof window.ScrollSmoother)

    // Try multiple methods to access ScrollSmoother
    let ScrollSmootherClass = null;

    // Method 1: Check window.ScrollSmoother
    if (window.ScrollSmoother) {
      // console.log('✅ Found ScrollSmoother on window')
      ScrollSmootherClass = window.ScrollSmoother;
    }

    // Method 2: Try useNuxtApp injection
    if (!ScrollSmootherClass) {
      const nuxtApp = useNuxtApp();
      // console.log('Available $injections:', Object.keys(nuxtApp).filter(k => k.startsWith('$')))

      if (nuxtApp.$ScrollSmoother) {
        // console.log('✅ Found $ScrollSmoother in Nuxt app')
        ScrollSmootherClass = nuxtApp.$ScrollSmoother;
      }
    }

    if (!ScrollSmootherClass) {
      console.error(
        "❌ ScrollSmoother not found - check that scrollSmoother is enabled in nuxt.config.ts"
      );
      return null;
    }

    // Create ScrollSmoother instance
    try {
      smootherInstance = ScrollSmootherClass.create(defaultConfig);
      // console.log('✅ ScrollSmoother created successfully')
      // console.log('Instance:', smootherInstance)
    } catch (error) {
      console.error("❌ Failed to create ScrollSmoother:", error);
      return null;
    }

    return smootherInstance;
  };

  /**
   * Kill the current ScrollSmoother instance
   */
  const killSmoother = () => {
    if (smootherInstance) {
      smootherInstance.kill();
      smootherInstance = null;
      // console.log('🗑️ ScrollSmoother killed')
    }
  };

  /**
   * Get the current ScrollSmoother instance
   * @returns {Object|null} Current ScrollSmoother instance
   */
  const getSmoother = () => {
    return smootherInstance;
  };

  /**
   * Refresh ScrollSmoother to recalculate all data-speed and data-lag elements
   * Call this after page transitions or DOM changes
   */
  const refreshSmoother = () => {
    if (!smootherInstance) {
      console.warn("⚠️ ScrollSmoother instance not found, cannot refresh");
      return;
    }

    // Get ScrollTrigger from Nuxt app (same way we got ScrollSmoother)
    const nuxtApp = useNuxtApp();

    // IMPORTANT: Call effects() to recalculate data-speed and data-lag attributes
    // This re-scans the content for new elements with parallax effects
    if (typeof smootherInstance.effects === "function") {
      smootherInstance.effects("[data-speed], [data-lag]");
      // console.log('🔄 ScrollSmoother effects recalculated')
    }

    // Refresh ScrollSmoother layout
    smootherInstance.refresh();

    // Also refresh ScrollTrigger to ensure everything recalculates
    if (nuxtApp.$ScrollTrigger) {
      nuxtApp.$ScrollTrigger.refresh();
    } else if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }

    // console.log('🔄 ScrollSmoother refreshed')
  };

  /**
   * Scroll to top (0, 0) position
   * Use this to reset scroll position after loading
   */
  const scrollToTop = () => {
    if (!smootherInstance) {
      // Fallback to native scroll if smoother not available
      window.scrollTo(0, 0);
      return;
    }

    // Use ScrollSmoother's scrollTo method for smooth scrolling
    smootherInstance.scrollTo(0, false); // false = instant, no animation
    console.log('📍 ScrollSmoother scrolled to top');
  };

  return {
    createSmoother,
    killSmoother,
    getSmoother,
    refreshSmoother,
    scrollToTop,
  };
};
