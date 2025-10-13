/**
 * Loading Sequence Composable
 *
 * Orchestrates the application loading process and initial animations.
 * Ensures all critical resources are loaded before showing content
 * and manages the sequence of entrance animations.
 *
 * Works with:
 * - Loading store for state management
 * - ScrollSmoother for smooth scrolling readiness
 * - GSAP for animation capabilities
 * - Page transitions for non-conflicting integration
 */

import { useLoadingStore } from "~/stores/loading";

/**
 * @typedef {Object} LoadingSequenceOptions
 * @property {boolean} checkFonts - Whether to wait for fonts to load
 * @property {number} minLoadTime - Minimum loading time in ms (for UX consistency)
 * @property {boolean} animateOnReady - Auto-start animations when ready
 */

export const useLoadingSequence = () => {
  const loadingStore = useLoadingStore();
  const { $gsap } = useNuxtApp();

  /**
   * Initialize the loading sequence
   * Should be called in app.vue or main layout
   *
   * @param {LoadingSequenceOptions} options
   */
  const initializeLoading = async (options = {}) => {
    const {
      checkFonts = true,
      minLoadTime = 1200, // Increased to ensure loader is visible
      animateOnReady = true,
    } = options;

    // Start loading process
    loadingStore.startLoading();
    const startTime = Date.now();

    // CRITICAL: Ensure loader is visible before continuing
    // Wait for next frame to ensure loader is painted
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // Check GSAP availability
    if ($gsap) {
      loadingStore.setGsapReady();
    } else {
      console.warn("⚠️ GSAP not available during initialization");
      // Try again after a delay
      setTimeout(() => {
        if (useNuxtApp().$gsap) {
          loadingStore.setGsapReady();
        }
      }, 100);
    }

    // Check font loading if needed
    if (checkFonts && typeof document !== 'undefined') {
      try {
        await document.fonts.ready;
        loadingStore.setFontsReady();
      } catch (error) {
        console.warn("⚠️ Font loading check failed:", error);
        loadingStore.setFontsReady(); // Mark as ready anyway
      }
    } else {
      loadingStore.setFontsReady();
    }

    // CRITICAL: Always enforce minimum display time
    // This ensures the loader is visible even on fast connections
    // Note: Nuxt automatically removes the SPA loading template when the app is ready
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(minLoadTime - elapsed, 0);

    console.log(`⏱️ Loading took ${elapsed}ms, waiting ${remainingTime}ms more to reach minimum display time`);

    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    console.log('🎯 Minimum display time reached');
    console.log('ℹ️  Nuxt will automatically remove the SPA loading template');

    // Auto-start animations if configured
    if (animateOnReady && loadingStore.isReady) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        startInitialAnimations();
      }, 100);
    }
  };

  /**
   * Mark ScrollSmoother as initialized
   * Called from layout after ScrollSmoother is created
   */
  const markScrollSmootherReady = () => {
    loadingStore.setScrollSmootherReady();
  };

  /**
   * Mark page content as ready
   * Called when page component is mounted
   */
  const markPageReady = () => {
    loadingStore.setPageReady();
  };

  /**
   * Create the initial entrance timeline
   * This is different from page transitions - more elaborate
   *
   * @returns {Object} GSAP timeline
   */
  const createEntranceTimeline = () => {
    if (!$gsap) {
      console.warn("⚠️ GSAP not available for entrance timeline");
      return null;
    }

    const tl = $gsap.timeline({
      paused: true,
      onStart: () => {
        loadingStore.startAnimating();
        console.log("🎬 Entrance timeline started");
      },
      onComplete: () => {
        loadingStore.setAnimationsComplete();
        console.log("✨ Entrance timeline complete");
      },
    });

    return tl;
  };

  /**
   * Start the initial animations
   * Called when everything is ready
   */
  const startInitialAnimations = () => {
    if (!loadingStore.isReady) {
      console.warn("⚠️ Cannot start animations - app not ready");
      return;
    }

    // Dispatch event for components to start their animations
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:start-animations'));
    }

    loadingStore.startAnimating();
  };

  /**
   * Wait for app to be ready
   * Returns a promise that resolves when ready
   *
   * @returns {Promise<void>}
   */
  const waitForReady = () => {
    return new Promise((resolve) => {
      if (loadingStore.isReady) {
        resolve();
        return;
      }

      // Listen for ready event
      const handler = () => {
        window.removeEventListener('app:ready', handler);
        resolve();
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('app:ready', handler);

        // Timeout fallback
        setTimeout(() => {
          window.removeEventListener('app:ready', handler);
          loadingStore.forceReady();
          resolve();
        }, 5000);
      }
    });
  };

  /**
   * Create a staggered animation helper
   * Useful for animating multiple elements in sequence
   *
   * @param {HTMLElement[]} elements - Elements to animate
   * @param {Object} animationProps - GSAP animation properties
   * @param {Object} options - Stagger options
   * @returns {Object|null} GSAP timeline
   */
  const createStaggerAnimation = (elements, animationProps = {}, options = {}) => {
    if (!$gsap || !elements || elements.length === 0) return null;

    const {
      stagger = 0.1,
      duration = 0.8,
      ease = "power2.out",
      from = "start",
    } = options;

    const tl = $gsap.timeline();

    // Set initial state (hidden)
    $gsap.set(elements, {
      autoAlpha: 0,
      y: 20,
      ...animationProps.from,
    });

    // Animate in
    tl.to(elements, {
      autoAlpha: 1,
      y: 0,
      duration,
      ease,
      stagger: {
        each: stagger,
        from,
      },
      ...animationProps.to,
    });

    return tl;
  };

  /**
   * Helper to check if this is the first load
   * @returns {boolean}
   */
  const isFirstLoad = () => loadingStore.isFirstLoad;

  /**
   * Helper to check if app is ready
   * @returns {boolean}
   */
  const isAppReady = () => loadingStore.isReady;

  /**
   * Helper to check if animations are complete
   * @returns {boolean}
   */
  const isAnimationComplete = () => loadingStore.isComplete;

  return {
    // Main functions
    initializeLoading,
    markScrollSmootherReady,
    markPageReady,
    startInitialAnimations,
    waitForReady,

    // Timeline creators
    createEntranceTimeline,
    createStaggerAnimation,

    // State helpers
    isFirstLoad,
    isAppReady,
    isAnimationComplete,

    // Direct store access if needed
    loadingStore: readonly(loadingStore),
  };
};