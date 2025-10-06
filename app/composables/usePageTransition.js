/**
 * Page Transition Composable
 *
 * NEW ARCHITECTURE with Middleware:
 * PHASE 1 (HIDE): Handled by middleware - blocks route change until overlay covers content
 * PHASE 2 (SWITCH): Route changes - Vue loads new page
 * PHASE 3 (REVEAL): Handled here - reveals new page by contracting overlay
 *
 * Usage in app.vue:
 * const { handlePageEnter } = usePageTransition();
 *
 * Uses proper Nuxt hooks and async patterns instead of polling
 * Overlay element is accessed from Pinia store (set by PageTransitionOverlay component)
 */

export const usePageTransition = () => {
  const { $gsap } = useNuxtApp();
  const store = usePageTransitionStore();

  /**
   * Get page transition duration from CSS custom property
   */
  const getTransitionDuration = () => {
    if (import.meta.server) return 1;

    const durationRaw = getComputedStyle(document.documentElement)
      .getPropertyValue('--duration-page').trim();

    let duration = 1; // Default fallback
    if (durationRaw.endsWith('ms')) {
      duration = parseFloat(durationRaw) / 1000; // Convert ms to seconds
    } else if (durationRaw.endsWith('s')) {
      duration = parseFloat(durationRaw); // Already in seconds
    }

    console.log('[PageTransition] 📏 Duration raw:', durationRaw, 'parsed:', duration, 'seconds');
    return duration;
  };

  /**
   * PHASE 3: REVEAL New Page
   *
   * Middleware has covered old page, route has changed.
   * Now reveal the new page by contracting the overlay.
   */
  const handlePageEnter = async (el, done) => {
    // Get overlay element from store (set by PageTransitionOverlay component on mount)
    const overlay = store.overlayElement;

    if (!overlay || !$gsap) {
      console.warn('[PageTransition] overlay or GSAP not available', { overlay, gsap: !!$gsap });
      done();
      return;
    }

    // Check if we can start entering (must be in 'leaving' state from middleware)
    if (!store.startEntering()) {
      console.warn('[PageTransition] ⚠️ Cannot enter - invalid state, resetting');
      store.reset();
      done();
      return;
    }

    const duration = getTransitionDuration();

    console.log('[PageTransition] PHASE 3: REVEAL - Revealing new page');

    /**
     * Start the reveal animation
     * Reverses the cover animation - contracts from bottom
     */
    const startReveal = async () => {
      try {
        // Wait for next tick to ensure DOM is ready
        await nextTick();

        // Create promise that resolves when animation completes
        const revealComplete = new Promise((resolve) => {
          $gsap.timeline({
            onComplete: () => {
              // Reset overlay for next transition
              $gsap.set(overlay, {
                opacity: 0,
                pointerEvents: 'none',
                clipPath: 'circle(0% at 50% 100%)'
              });

              store.complete();
              console.log('[PageTransition] ✅ Reveal complete');
              resolve();
            }
          })
            // Contract from bottom (reverse of expand)
            .to(overlay, {
              clipPath: 'circle(0% at 50% 100%)', // Contract to bottom
              duration,
              ease: 'power2.inOut'
            });
        });

        // Wait for animation to complete
        await revealComplete;

        // Signal Vue that transition is done
        done();
      } catch (error) {
        console.error('[PageTransition] ❌ Reveal error:', error);
        // Ensure we always complete and unlock, even on error
        store.complete();
        done();
      }
    };

    // Wait for ScrollSmoother to be ready
    if (store.scrollSmootherReady) {
      console.log('[PageTransition] ScrollSmoother ready, starting reveal');
      await startReveal();
    } else {
      console.log('[PageTransition] Waiting for ScrollSmoother...');

      // Use Promise instead of polling interval
      const waitForScrollSmoother = new Promise((resolve) => {
        // Watch for scrollSmootherReady to become true
        const unwatch = watch(
          () => store.scrollSmootherReady,
          (ready) => {
            if (ready) {
              console.log('[PageTransition] ScrollSmoother now ready');
              unwatch(); // Stop watching
              resolve();
            }
          },
          { immediate: true }
        );

        // Fallback timeout - reveal anyway after 2 seconds
        setTimeout(() => {
          console.warn('[PageTransition] ScrollSmoother timeout, revealing anyway');
          unwatch(); // Stop watching
          resolve();
        }, 2000);
      });

      await waitForScrollSmoother;
      await startReveal();
    }
  };

  return {
    handlePageEnter
  };
};
