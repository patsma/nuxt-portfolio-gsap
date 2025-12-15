// ~/stores/pageTransition.js
import { defineStore } from 'pinia';

/**
 * Page Transition Store - Clean state management for transitions
 *
 * Manages the transition lifecycle without setTimeout hacks.
 * Uses state machine pattern for predictable transitions.
 *
 * States:
 * - idle: No transition happening
 * - fading-out: Content fading out (before smoother kill)
 * - swapping: Page content swapping (smoother killed)
 * - fading-in: New content fading in (after smoother init)
 *
 * Flow:
 * 1. idle → fading-out (route-changing class added)
 * 2. fading-out → swapping (on transitionend, kill smoother)
 * 3. swapping → fading-in (init smoother, route-changing class removed)
 * 4. fading-in → idle (on transitionend)
 */
export const usePageTransitionStore = defineStore('pageTransition', {
  state: () => ({
    /**
     * Current transition state
     * @type {'idle' | 'fading-out' | 'swapping' | 'fading-in'}
     */
    state: 'idle',

    /**
     * Whether currently in a transition
     * Prevents double-execution of hooks
     */
    isTransitioning: false,

    /**
     * Element being transitioned (#smooth-content)
     * Cached for transitionend listener
     * @type {HTMLElement | null}
     */
    contentElement: null,

    /**
     * Cleanup functions for event listeners
     * @type {Array<Function>}
     */
    cleanupFns: [],
  }),

  getters: {
    /**
     * Whether in fading out state
     */
    isFadingOut: (state) => state.state === 'fading-out',

    /**
     * Whether in fading in state
     */
    isFadingIn: (state) => state.state === 'fading-in',

    /**
     * Whether safe to kill ScrollSmoother (after fade out)
     */
    canKillSmoother: (state) => state.state === 'swapping',
  },

  actions: {
    /**
     * Initialize the store (called once on client)
     * Sets up content element reference
     */
    init() {
      if (!import.meta.client) return;

      // Cache #smooth-content element
      this.contentElement = document.getElementById('smooth-content');

      if (!this.contentElement) {
        console.warn('[PageTransition] #smooth-content not found');
      }

      console.log('[PageTransition] Store initialized');
    },

    /**
     * Start fade out transition
     * Called from page:start hook
     *
     * Returns a Promise that resolves when fade out completes
     * @returns {Promise<void>}
     */
    async startFadeOut() {
      if (this.isTransitioning) {
        console.warn('[PageTransition] Already transitioning, ignoring startFadeOut');
        return;
      }

      console.log('[PageTransition] Starting fade out');

      this.isTransitioning = true;
      this.state = 'fading-out';

      // Add route-changing class to trigger CSS fade out
      document.documentElement.classList.add('route-changing');

      // Wait for CSS transition to complete
      return new Promise((resolve) => {
        if (!this.contentElement) {
          console.warn('[PageTransition] No content element, resolving immediately');
          resolve();
          return;
        }

        /**
         * transitionend handler
         * Only fires for opacity transitions on #smooth-content
         */
        const handleTransitionEnd = (event) => {
          // Only listen to opacity transitions on the content element
          if (
            event.target === this.contentElement &&
            event.propertyName === 'opacity'
          ) {
            console.log('[PageTransition] Fade out complete');

            // Move to swapping state
            this.state = 'swapping';

            // Clean up listener
            this.contentElement.removeEventListener('transitionend', handleTransitionEnd);

            resolve();
          }
        };

        // Listen for transitionend
        this.contentElement.addEventListener('transitionend', handleTransitionEnd);

        // Fallback timeout in case transitionend doesn't fire
        const fallbackTimeout = setTimeout(() => {
          console.warn('[PageTransition] Fade out transitionend timeout, forcing resolve');
          this.contentElement?.removeEventListener('transitionend', handleTransitionEnd);
          this.state = 'swapping';
          resolve();
        }, 1000); // 800ms transition + 200ms buffer

        // Track cleanup
        this.cleanupFns.push(() => {
          clearTimeout(fallbackTimeout);
          this.contentElement?.removeEventListener('transitionend', handleTransitionEnd);
        });
      });
    },

    /**
     * Start fade in transition
     * Called from page:finish hook after smoother init
     *
     * Returns a Promise that resolves when fade in completes
     * @returns {Promise<void>}
     */
    async startFadeIn() {
      if (this.state !== 'swapping') {
        console.warn('[PageTransition] Not in swapping state, ignoring startFadeIn');
        return;
      }

      console.log('[PageTransition] Starting fade in');

      this.state = 'fading-in';

      // Remove route-changing class to trigger CSS fade in
      document.documentElement.classList.remove('route-changing');

      // Wait for CSS transition to complete
      return new Promise((resolve) => {
        if (!this.contentElement) {
          console.warn('[PageTransition] No content element, resolving immediately');
          this.reset();
          resolve();
          return;
        }

        /**
         * transitionend handler
         * Only fires for opacity transitions on #smooth-content
         */
        const handleTransitionEnd = (event) => {
          // Only listen to opacity transitions on the content element
          if (
            event.target === this.contentElement &&
            event.propertyName === 'opacity'
          ) {
            console.log('[PageTransition] Fade in complete');

            // Clean up listener
            this.contentElement.removeEventListener('transitionend', handleTransitionEnd);

            // Reset to idle state
            this.reset();

            resolve();
          }
        };

        // Listen for transitionend
        this.contentElement.addEventListener('transitionend', handleTransitionEnd);

        // Fallback timeout
        const fallbackTimeout = setTimeout(() => {
          console.warn('[PageTransition] Fade in transitionend timeout, forcing resolve');
          this.contentElement?.removeEventListener('transitionend', handleTransitionEnd);
          this.reset();
          resolve();
        }, 1000);

        // Track cleanup
        this.cleanupFns.push(() => {
          clearTimeout(fallbackTimeout);
          this.contentElement?.removeEventListener('transitionend', handleTransitionEnd);
        });
      });
    },

    /**
     * Reset transition state to idle
     */
    reset() {
      console.log('[PageTransition] Reset to idle');

      this.state = 'idle';
      this.isTransitioning = false;

      // Clean up any remaining listeners/timeouts
      this.cleanupFns.forEach((fn) => fn());
      this.cleanupFns = [];

      // Ensure route-changing class is removed
      if (import.meta.client) {
        document.documentElement.classList.remove('route-changing');
      }
    },

    /**
     * Emergency cleanup
     * Called on errors or when transition gets stuck
     */
    forceReset() {
      console.warn('[PageTransition] Force reset');
      this.reset();

      // Also update content element reference
      if (import.meta.client) {
        this.contentElement = document.getElementById('smooth-content');
      }
    },
  },
});
