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
import type { LoadingState } from '~/types'

export const useLoadingStore = defineStore('loading', {
  state: (): LoadingState => ({
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
     */
    isReady(): boolean {
      return (
        this.status === 'ready'
        || this.status === 'animating'
        || this.status === 'complete'
      )
    },

    /**
     * Check if initial load animations are complete
     */
    isComplete(): boolean {
      return this.status === 'complete'
    },

    /**
     * Check if all critical resources are loaded
     */
    allResourcesReady(): boolean {
      return (
        this.gsapReady
        && this.scrollSmootherReady
        && this.pageReady
        && this.fontsReady
      )
    },

    /**
     * Get loading duration in ms
     */
    loadingDuration(): number | null {
      if (this.startTime && this.readyTime) {
        return this.readyTime - this.startTime
      }
      return null
    }
  },

  actions: {
    /**
     * Start the loading process
     */
    startLoading(): void {
      this.status = 'loading'
      this.startTime = Date.now()
      // console.log("🔄 Loading started");
    },

    /**
     * Mark GSAP as ready
     */
    setGsapReady(): void {
      this.gsapReady = true
      // console.log("✅ GSAP ready");
      this.checkReadyState()
    },

    /**
     * Mark ScrollSmoother as ready
     */
    setScrollSmootherReady(): void {
      this.scrollSmootherReady = true
      // console.log("✅ ScrollSmoother ready");
      this.checkReadyState()
    },

    /**
     * Mark page content as ready
     */
    setPageReady(): void {
      this.pageReady = true
      // console.log("✅ Page content ready");
      this.checkReadyState()
    },

    /**
     * Mark fonts as ready
     */
    setFontsReady(): void {
      this.fontsReady = true
      // console.log("✅ Fonts ready");
      this.checkReadyState()
    },

    /**
     * Check if all resources are ready and update status
     * NOTE: This only marks as ready internally, event is fired later after minLoadTime
     */
    checkReadyState(): void {
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
    startAnimating(): void {
      if (this.status === 'ready') {
        this.status = 'animating'
        // console.log("🎬 Initial animations started");
      }
    },

    /**
     * Mark initial animations as complete
     */
    setAnimationsComplete(): void {
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
    reset(): void {
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
    forceReady(): void {
      console.warn('⚠️ Forcing ready state (fallback)')
      this.gsapReady = true
      this.scrollSmootherReady = true
      this.pageReady = true
      this.fontsReady = true
      this.checkReadyState()
    }
  }
})
