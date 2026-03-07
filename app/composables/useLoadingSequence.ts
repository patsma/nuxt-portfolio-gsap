/**
 * Loading Sequence Composable
 *
 * NUXT PATTERN: Composable for reusable logic and coordination
 *
 * Why this exists:
 * - Orchestrates the loading process (timing, events, animations)
 * - Enforces minimum display time for consistent UX
 * - Fires 'app:ready' event AFTER minimum time is reached
 * - Provides reusable loading utilities for components
 *
 * Why it's separate from the store:
 * - Store = state (what's loaded)
 * - Composable = logic (timing, events, coordination)
 * - This follows Vue 3 Composition API best practices
 *
 * Works with:
 * - Loading store → State management
 * - ScrollSmoother → Smooth scrolling readiness
 * - GSAP → Animation capabilities
 * - Page transitions → Non-conflicting integration
 */

import { useLoadingStore } from '~/stores/loading'

export interface LoadingSequenceOptions {
  /** Whether to wait for fonts to load */
  checkFonts?: boolean
  /** Minimum loading time in ms (for UX consistency) */
  minLoadTime?: number
  /** Auto-start animations when ready */
  animateOnReady?: boolean
}

interface StaggerOptions {
  stagger?: number
  duration?: number
  ease?: string
  from?: string
}

interface AnimationProps {
  from?: Record<string, unknown>
  to?: Record<string, unknown>
}

// GSAP types
interface GSAPInstance {
  timeline: (config?: Record<string, unknown>) => GSAPTimeline
  set: (targets: unknown, vars: Record<string, unknown>) => void
  to: (targets: unknown, vars: Record<string, unknown>) => unknown
}

interface GSAPTimeline {
  to: (targets: unknown, vars: Record<string, unknown>) => GSAPTimeline
  play: () => GSAPTimeline
  pause: () => GSAPTimeline
}

export interface LoadingSequenceReturn {
  initializeLoading: (options?: LoadingSequenceOptions) => Promise<void>
  markScrollSmootherReady: () => void
  markPageReady: () => void
  startInitialAnimations: () => void
  waitForReady: () => Promise<void>
  createEntranceTimeline: () => GSAPTimeline | null
  createStaggerAnimation: (
    elements: HTMLElement[],
    animationProps?: AnimationProps,
    options?: StaggerOptions
  ) => GSAPTimeline | null
  isFirstLoad: () => boolean
  isAppReady: () => boolean
  isAnimationComplete: () => boolean
  loadingStore: Readonly<ReturnType<typeof useLoadingStore>>
}

export const useLoadingSequence = (): LoadingSequenceReturn => {
  const loadingStore = useLoadingStore()
  const { $gsap } = useNuxtApp() as unknown as { $gsap: GSAPInstance }

  /**
   * Set --loader-progress CSS variable to advance the loading bar.
   * Called at each real app lifecycle milestone so the bar reflects
   * actual initialization state, not just asset download bytes.
   */
  const setProgress = (v: number): void => {
    if (typeof document !== 'undefined')
      document.documentElement.style.setProperty('--loader-progress', String(v))
  }

  /**
   * Trickle: slowly creep toward `cap` so the bar never looks frozen between milestones.
   * Each tick moves 8% of the remaining distance — asymptotic, so it naturally decelerates
   * without ever reaching the cap. Stops when the next real milestone fires.
   */
  let trickleTimer: ReturnType<typeof setInterval> | null = null

  const stopTrickle = (): void => {
    if (trickleTimer !== null) {
      clearInterval(trickleTimer)
      trickleTimer = null
    }
  }

  const startTrickle = (cap: number): void => {
    stopTrickle()
    trickleTimer = setInterval(() => {
      if (typeof document === 'undefined') return
      const current = parseFloat(
        document.documentElement.style.getPropertyValue('--loader-progress') || '0'
      )
      const remaining = cap - current
      if (remaining <= 0.003) return
      setProgress(current + remaining * 0.08)
    }, 160)
  }

  /**
   * Initialize the loading sequence
   * Should be called in app.vue or main layout
   */
  const initializeLoading = async (options: LoadingSequenceOptions = {}): Promise<void> => {
    const {
      checkFonts = true,
      minLoadTime = 800, // Default minimum display time (can be overridden in app.vue)
      animateOnReady = true
    } = options

    loadingStore.startLoading()
    const startTime = Date.now()

    // CRITICAL: Ensure loader is visible before continuing
    // Wait for next frame to ensure loader is painted
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    )

    // Trickle toward GSAP milestone while we wait for it to initialize
    startTrickle(0.48)

    if ($gsap) {
      stopTrickle()
      loadingStore.setGsapReady()
      setProgress(0.50)
    }
    else {
      // console.warn('⚠️ GSAP not available during initialization')
      // Try again after a delay
      setTimeout(() => {
        const nuxtApp = useNuxtApp() as { $gsap?: GSAPInstance }
        if (nuxtApp.$gsap) {
          stopTrickle()
          loadingStore.setGsapReady()
          setProgress(0.50)
        }
      }, 100)
    }

    // Trickle toward fonts milestone while document.fonts.ready resolves
    startTrickle(0.63)

    if (checkFonts && typeof document !== 'undefined') {
      try {
        await document.fonts.ready
        stopTrickle()
        loadingStore.setFontsReady()
        setProgress(0.65)
      }
      catch {
        // console.warn('⚠️ Font loading check failed:', error)
        stopTrickle()
        loadingStore.setFontsReady() // Mark as ready anyway
        setProgress(0.65)
      }
    }
    else {
      stopTrickle()
      loadingStore.setFontsReady()
      setProgress(0.65)
    }

    // Trickle toward the end during minLoadTime — this is the longest visible gap
    startTrickle(0.88)

    // CRITICAL: Always enforce minimum display time
    // This ensures the loader is visible even on fast connections
    // Provides consistent UX and prevents jarring flashes
    const elapsed = Date.now() - startTime
    const remainingTime = Math.max(minLoadTime - elapsed, 0)

    if (remainingTime > 0) {
      await new Promise<void>(resolve => setTimeout(resolve, remainingTime))
    }

    stopTrickle()

    // CRITICAL: Fire app:ready event AFTER minimum time is enforced
    // This ensures loader stays visible for the full duration
    if (typeof window !== 'undefined') {
      setProgress(0.90) // About to fire — app fully ready, just about to hand off
      const totalDuration = Date.now() - startTime
      window.dispatchEvent(
        new CustomEvent('app:ready', {
          detail: {
            duration: totalDuration,
            isFirstLoad: loadingStore.isFirstLoad
          }
        })
      )
      // console.log(`🚀 Fired 'app:ready' event after ${totalDuration}ms`)
    }

    // Auto-start animations if configured
    if (animateOnReady && loadingStore.isReady) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        startInitialAnimations()
      }, 100)
    }
  }

  /**
   * Mark ScrollSmoother as initialized
   * Called from layout after ScrollSmoother is created
   */
  const markScrollSmootherReady = (): void => {
    loadingStore.setScrollSmootherReady()
  }

  /**
   * Mark page content as ready
   * Called when page component is mounted
   */
  const markPageReady = (): void => {
    loadingStore.setPageReady()
  }

  /**
   * Create the initial entrance timeline
   * This is different from page transitions - more elaborate
   */
  const createEntranceTimeline = (): GSAPTimeline | null => {
    if (!$gsap) {
      // console.warn('⚠️ GSAP not available for entrance timeline')
      return null
    }

    const tl = $gsap.timeline({
      paused: true,
      onStart: () => {
        loadingStore.startAnimating()
        // console.log('🎬 Entrance timeline started')
      },
      onComplete: () => {
        loadingStore.setAnimationsComplete()
        // console.log('✨ Entrance timeline complete')
      }
    })

    return tl
  }

  /**
   * Start the initial animations
   * Called when everything is ready
   */
  const startInitialAnimations = (): void => {
    if (!loadingStore.isReady) {
      // console.warn('⚠️ Cannot start animations - app not ready')
      return
    }

    // Dispatch event for components to start their animations
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:start-animations'))
    }

    loadingStore.startAnimating()
  }

  /**
   * Wait for app to be ready
   * Returns a promise that resolves when ready
   */
  const waitForReady = (): Promise<void> => {
    return new Promise((resolve) => {
      if (loadingStore.isReady) {
        resolve()
        return
      }

      // Listen for ready event
      const handler = (): void => {
        window.removeEventListener('app:ready', handler)
        resolve()
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('app:ready', handler)

        // Timeout fallback
        setTimeout(() => {
          window.removeEventListener('app:ready', handler)
          loadingStore.forceReady()
          resolve()
        }, 5000)
      }
    })
  }

  /**
   * Create a staggered animation helper
   * Useful for animating multiple elements in sequence
   */
  const createStaggerAnimation = (
    elements: HTMLElement[],
    animationProps: AnimationProps = {},
    options: StaggerOptions = {}
  ): GSAPTimeline | null => {
    if (!$gsap || !elements || elements.length === 0) return null

    const {
      stagger = 0.1,
      duration = 0.8,
      ease = 'power2.out',
      from = 'start'
    } = options

    const tl = $gsap.timeline()

    $gsap.set(elements, {
      autoAlpha: 0,
      y: 20,
      ...animationProps.from
    })

    tl.to(elements, {
      autoAlpha: 1,
      y: 0,
      duration,
      ease,
      stagger: {
        each: stagger,
        from
      },
      ...animationProps.to
    })

    return tl
  }

  /**
   * Helper to check if this is the first load
   */
  const isFirstLoad = (): boolean => loadingStore.isFirstLoad

  /**
   * Helper to check if app is ready
   */
  const isAppReady = (): boolean => loadingStore.isReady

  /**
   * Helper to check if animations are complete
   */
  const isAnimationComplete = (): boolean => loadingStore.isComplete

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
    loadingStore: readonly(loadingStore) as Readonly<ReturnType<typeof useLoadingStore>>
  }
}
