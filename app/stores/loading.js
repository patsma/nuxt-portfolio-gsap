/**
 * Loading State Management Store
 *
 * NUXT PATTERN: Pinia store for centralized state management
 *
 * Why this exists:
 * - Tracks loading progress across different resources (GSAP, fonts, ScrollSmoother, page)
 * - Provides reactive state that components can watch
 * - Coordinates when app is ready to show content
 * - Manages animation sequence states
 *
 * States:
 * - initial: App just started, nothing loaded yet
 * - loading: Resources are being loaded
 * - ready: Everything loaded, can start animations
 * - animating: Initial animations are running
 * - complete: All initial animations finished
 *
 * This store does NOT fire the 'app:ready' event - that's done by
 * useLoadingSequence after enforcing minimum display time.
 */

import { defineStore } from 'pinia'

/**
 * @typedef {Object} LoadingState
 * @property {'initial'|'loading'|'ready'|'animating'|'complete'} status - Current loading status
 * @property {boolean} gsapReady - GSAP and plugins loaded
 * @property {boolean} scrollSmootherReady - ScrollSmoother initialized
 * @property {boolean} pageReady - Page content ready
 * @property {boolean} fontsReady - Fonts loaded
 * @property {boolean} isFirstLoad - Is this the first page load (not a navigation)
 * @property {number|null} startTime - Loading start timestamp
 * @property {number|null} readyTime - Ready state timestamp
 */

export const useLoadingStore = defineStore('loading', {
  state: () =>
    /** @type {LoadingState} */ ({
      status: 'initial',
      gsapReady: false,
      scrollSmootherReady: false,
      pageReady: false,
      fontsReady: false,
      isFirstLoad: true,
      startTime: null,
      readyTime: null
    }),

  getters: {
    /**
     * Check if app is fully ready for animations
     * @returns {boolean}
     */
    isReady: state =>
      state.status === 'ready'
      || state.status === 'animating'
      || state.status === 'complete',

    /**
     * Check if initial load animations are complete
     * @returns {boolean}
     */
    isComplete: state => state.status === 'complete',

    /**
     * Check if all critical resources are loaded
     * @returns {boolean}
     */
    allResourcesReady: state =>
      state.gsapReady
      && state.scrollSmootherReady
      && state.pageReady
      && state.fontsReady,

    /**
     * Get loading duration in ms
     * @returns {number|null}
     */
    loadingDuration: (state) => {
      if (state.startTime && state.readyTime) {
        return state.readyTime - state.startTime
      }
      return null
    }
  },

  actions: {
    /**
     * Start the loading process
     */
    startLoading() {
      this.status = 'loading'
      this.startTime = Date.now()
      // console.log("🔄 Loading started");
    },

    /**
     * Mark GSAP as ready
     */
    setGsapReady() {
      this.gsapReady = true
      // console.log("✅ GSAP ready");
      this.checkReadyState()
    },

    /**
     * Mark ScrollSmoother as ready
     */
    setScrollSmootherReady() {
      this.scrollSmootherReady = true
      // console.log("✅ ScrollSmoother ready");
      this.checkReadyState()
    },

    /**
     * Mark page content as ready
     */
    setPageReady() {
      this.pageReady = true
      // console.log("✅ Page content ready");
      this.checkReadyState()
    },

    /**
     * Mark fonts as ready
     */
    setFontsReady() {
      this.fontsReady = true
      // console.log("✅ Fonts ready");
      this.checkReadyState()
    },

    /**
     * Check if all resources are ready and update status
     * NOTE: This only marks as ready internally, event is fired later after minLoadTime
     */
    checkReadyState() {
      if (this.allResourcesReady && this.status === 'loading') {
        this.status = 'ready'
        this.readyTime = Date.now()

        // const duration = this.loadingDuration;
        // console.log(`✅ All resources loaded! Took ${duration}ms`);
        // console.log(`ℹ️  Waiting for minimum display time before showing content...`);

        // NOTE: Do NOT emit app:ready event here!
        // The loading sequence will emit it after enforcing minLoadTime
      }
    },

    /**
     * Start initial animations
     */
    startAnimating() {
      if (this.status === 'ready') {
        this.status = 'animating'
        // console.log("🎬 Initial animations started");
      }
    },

    /**
     * Mark initial animations as complete
     */
    setAnimationsComplete() {
      if (this.status === 'animating') {
        this.status = 'complete'
        this.isFirstLoad = false // Next loads won't be first
        // console.log("✨ Initial animations complete");

        // Emit complete event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:complete'))
        }
      }
    },

    /**
     * Reset loading state (useful for testing or manual reload)
     */
    reset() {
      this.status = 'initial'
      this.gsapReady = false
      this.scrollSmootherReady = false
      this.pageReady = false
      this.fontsReady = false
      this.startTime = null
      this.readyTime = null
      // console.log("🔄 Loading state reset");
    },

    /**
     * Force ready state (fallback for timeout scenarios)
     */
    forceReady() {
      console.warn('⚠️ Forcing ready state (fallback)')
      this.gsapReady = true
      this.scrollSmootherReady = true
      this.pageReady = true
      this.fontsReady = true
      this.checkReadyState()
    }
  }
})
