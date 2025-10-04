// Pinia store to manage page transition state and coordinate with ScrollSmoother
import { defineStore } from 'pinia';

/**
 * @typedef {'idle' | 'leaving' | 'entering'} TransitionState
 *
 * @typedef {Object} PageTransitionState
 * @property {TransitionState} state - Current transition state
 * @property {boolean} scrollSmootherReady - Whether ScrollSmoother is initialized and ready
 */

export const usePageTransitionStore = defineStore('pageTransition', {
  state: () => /** @type {PageTransitionState} */ ({
    state: 'idle',
    scrollSmootherReady: false
  }),

  getters: {
    /**
     * Whether a transition is currently in progress
     * @returns {boolean}
     */
    isTransitioning: (state) => state.state !== 'idle',

    /**
     * Whether we're currently leaving a page
     * @returns {boolean}
     */
    isLeaving: (state) => state.state === 'leaving',

    /**
     * Whether we're currently entering a page
     * @returns {boolean}
     */
    isEntering: (state) => state.state === 'entering',

    /**
     * Whether it's safe to start a transition
     * @returns {boolean}
     */
    canTransition: (state) => state.state === 'idle'
  },

  actions: {
    /**
     * Start the leaving (exit) phase of page transition
     */
    startLeaving() {
      if (this.state !== 'idle') {
        console.warn('[PageTransition] Cannot start leaving - already transitioning:', this.state);
        return false;
      }
      this.state = 'leaving';
      console.log('[PageTransition] State: leaving');
      return true;
    },

    /**
     * Start the entering (reveal) phase of page transition
     * Allow transition from 'leaving' OR 'entering' (for duplicate Vue calls)
     */
    startEntering() {
      // Allow if we're in 'leaving' state (normal flow)
      if (this.state === 'leaving') {
        this.state = 'entering';
        console.log('[PageTransition] State: leaving → entering');
        return true;
      }

      // Also allow if already 'entering' (Vue calling twice) - just continue
      if (this.state === 'entering') {
        console.log('[PageTransition] Already entering, continuing...');
        return true;
      }

      console.warn('[PageTransition] Cannot start entering from state:', this.state);
      return false;
    },

    /**
     * Complete the transition and return to idle state
     */
    complete() {
      this.state = 'idle';
      console.log('[PageTransition] State: idle (complete)');
    },

    /**
     * Reset to idle state (emergency fallback)
     */
    reset() {
      this.state = 'idle';
      console.log('[PageTransition] State: idle (reset)');
    },

    /**
     * Mark ScrollSmoother as ready/not ready
     * @param {boolean} ready
     */
    setScrollSmootherReady(ready) {
      this.scrollSmootherReady = ready;
      console.log('[PageTransition] ScrollSmoother ready:', ready);
    }
  }
});
