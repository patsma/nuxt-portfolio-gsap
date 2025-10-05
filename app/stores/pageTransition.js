// Pinia store to manage page transition state and coordinate with ScrollSmoother
import { defineStore } from 'pinia';

/**
 * @typedef {'idle' | 'leaving' | 'entering' | 'locked'} TransitionState
 *
 * @typedef {Object} PageTransitionState
 * @property {TransitionState} state - Current transition state
 * @property {boolean} scrollSmootherReady - Whether ScrollSmoother is initialized and ready
 * @property {string|null} lockedPath - Path that's currently being navigated to (prevents duplicate navigation)
 * @property {HTMLElement|null} overlayElement - The overlay DOM element (set by PageTransitionOverlay component)
 */

export const usePageTransitionStore = defineStore('pageTransition', {
  state: () => /** @type {PageTransitionState} */ ({
    state: 'idle',
    scrollSmootherReady: false,
    lockedPath: null, // Track which path is being navigated to
    overlayElement: null // Overlay DOM element reference
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
     * Whether transitions are locked (prevents rapid clicks)
     * @returns {boolean}
     */
    isLocked: (state) => state.state === 'locked',

    /**
     * Whether it's safe to start a transition
     * @returns {boolean}
     */
    canTransition: (state) => state.state === 'idle'
  },

  actions: {
    /**
     * Lock transitions and set target path (prevents rapid clicks)
     * @param {string} path - Path being navigated to
     * @returns {boolean} - True if lock acquired, false if already locked
     */
    lock(path) {
      if (this.state !== 'idle') {
        console.warn('[PageTransition] 🔒 Cannot lock - already transitioning:', this.state);
        return false;
      }
      this.state = 'locked';
      this.lockedPath = path;
      console.log('[PageTransition] 🔒 LOCKED for:', path);
      return true;
    },

    /**
     * Start the leaving (exit) phase of page transition
     * Can only be called if locked (ensures proper flow)
     */
    startLeaving() {
      if (this.state !== 'locked') {
        console.warn('[PageTransition] Cannot start leaving - not locked:', this.state);
        return false;
      }
      this.state = 'leaving';
      console.log('[PageTransition] State: locked → leaving');
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
     * Clears the locked path
     */
    complete() {
      this.state = 'idle';
      this.lockedPath = null;
      console.log('[PageTransition] State: idle (complete) ✅');
    },

    /**
     * Reset to idle state (emergency fallback)
     * Clears the locked path
     */
    reset() {
      this.state = 'idle';
      this.lockedPath = null;
      console.log('[PageTransition] State: idle (reset) ⚠️');
    },

    /**
     * Mark ScrollSmoother as ready/not ready
     * @param {boolean} ready
     */
    setScrollSmootherReady(ready) {
      this.scrollSmootherReady = ready;
      console.log('[PageTransition] ScrollSmoother ready:', ready);
    },

    /**
     * Set the overlay element reference (called by PageTransitionOverlay component on mount)
     * @param {HTMLElement|null} element
     */
    setOverlayElement(element) {
      this.overlayElement = element;
      console.log('[PageTransition] Overlay element set:', !!element);
    }
  }
});
