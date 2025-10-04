/**
 * Page Transition Composable
 *
 * NEW ARCHITECTURE with Middleware:
 * PHASE 1 (HIDE): Handled by middleware - blocks route change until overlay covers content
 * PHASE 2 (SWITCH): Route changes - Vue loads new page
 * PHASE 3 (REVEAL): Handled here - reveals new page by contracting overlay
 *
 * Usage in app.vue:
 * const { handlePageEnter } = usePageTransition(overlayRef);
 *
 * Uses proper Nuxt hooks and async patterns instead of polling
 */

export const usePageTransition = (overlayRef) => {
  const { $gsap } = useNuxtApp();
  const store = usePageTransitionStore();

  /**
   * Get page transition duration from CSS custom property
   */
  const getTransitionDuration = () => {
    if (import.meta.server) return 1;

    const duration = parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--duration-page')
    ) / 1000;

    return duration || 1;
  };

  /**
   * PHASE 3: REVEAL New Page
   *
   * Middleware has covered old page, route has changed.
   * Now reveal the new page by contracting the overlay.
   */
  const handlePageEnter = async (el, done) => {
    const overlay = overlayRef.value;

    if (!overlay || !$gsap) {
      console.warn('[PageTransition] overlay or GSAP not available');
      done();
      return;
    }

    store.startEntering();
    const duration = getTransitionDuration();

    console.log('[PageTransition] PHASE 3: REVEAL - Revealing new page');

    /**
     * Start the reveal animation
     */
    const startReveal = async () => {
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
          // Flip to top position
          .set(overlay, {
            clipPath: 'circle(150% at 50% 0%)'
          })
          // Contract to reveal
          .to(overlay, {
            clipPath: 'circle(0% at 50% 0%)',
            duration,
            ease: 'sine.out'
          });
      });

      // Wait for animation to complete
      await revealComplete;

      // Signal Vue that transition is done
      done();
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
