/**
 * ScrollSmoother Manager Composable
 *
 * Manages GSAP ScrollSmoother instance lifecycle and provides refresh capability.
 * Named "Manager" to avoid conflict with auto-generated useScrollSmoother from @hypernym/nuxt-gsap.
 *
 * MOBILE/TABLET BEHAVIOR:
 * ScrollSmoother is disabled on mobile/tablet (< 1024px) for better native scroll experience.
 * Use isEnabled() to check if ScrollSmoother is active before calling smoother-specific methods.
 *
 * USAGE:
 * const { createSmoother, killSmoother, getSmoother, refreshSmoother, isEnabled } = useScrollSmootherManager()
 * createSmoother({ smooth: 2, effects: true }) // Returns null on mobile/tablet
 * if (isEnabled()) refreshSmoother() // Only call when enabled
 * killSmoother()
 */

// ScrollSmoother instance type (from GSAP)
interface ScrollSmootherInstance {
  kill: () => void
  refresh: () => void
  scrollTo: (position: number | string | HTMLElement, smooth?: boolean) => void
  effects: (selector: string) => void
}

interface ScrollSmootherConfig {
  smooth?: number
  effects?: boolean
  normalizeScroll?: boolean
  smoothTouch?: number | boolean
  onUpdate?: (self: ScrollSmootherInstance) => void
  [key: string]: unknown
}

interface ScrollSmootherManagerReturn {
  createSmoother: (config?: ScrollSmootherConfig) => ScrollSmootherInstance | null
  killSmoother: () => void
  getSmoother: () => ScrollSmootherInstance | null
  refreshSmoother: () => void
  scrollToTop: () => void
  isEnabled: () => boolean
}

// Store the active smoother instance at module level so it's shared across all calls
let smootherInstance: ScrollSmootherInstance | null = null
// Track if ScrollSmoother is enabled (false on mobile/tablet)
let smootherEnabled = false

export const useScrollSmootherManager = (): ScrollSmootherManagerReturn => {
  /**
   * Create a new ScrollSmoother instance
   * Returns null on mobile/tablet (< 1024px) - ScrollSmoother disabled for native scroll
   */
  const createSmoother = (config: ScrollSmootherConfig = {}): ScrollSmootherInstance | null => {
    // Only run on client side
    if (typeof window === 'undefined') {
      // console.warn('⚠️ ScrollSmoother can only run on client side')
      return null
    }

    // Check if on desktop (>= 1024px) - skip ScrollSmoother on mobile/tablet
    const { isDesktop } = useIsMobile()
    if (!isDesktop.value) {
      smootherEnabled = false
      // console.log('📱 ScrollSmoother disabled on mobile/tablet')
      return null
    }

    // Kill existing instance before creating new one
    if (smootherInstance) {
      killSmoother()
    }

    // Default configuration - all config options are passed through to ScrollSmoother.create()
    const defaultConfig: ScrollSmootherConfig = {
      smooth: 2, // seconds it takes to "catch up" to native scroll position
      effects: true, // look for data-speed and data-lag attributes
      ...config // Includes onUpdate, smoothTouch, normalizeScroll, and any other ScrollSmoother options
    }

    // console.log('🔍 Checking for ScrollSmoother...')
    // console.log('window.ScrollSmoother:', typeof window.ScrollSmoother)

    // Try multiple methods to access ScrollSmoother
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ScrollSmootherClass: any = null

    // Method 1: Check window.ScrollSmoother
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).ScrollSmoother) {
      // console.log('✅ Found ScrollSmoother on window')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ScrollSmootherClass = (window as any).ScrollSmoother
    }

    // Method 2: Try useNuxtApp injection
    if (!ScrollSmootherClass) {
      const nuxtApp = useNuxtApp()
      // console.log('Available $injections:', Object.keys(nuxtApp).filter(k => k.startsWith('$')))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((nuxtApp as any).$ScrollSmoother) {
        // console.log('✅ Found $ScrollSmoother in Nuxt app')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ScrollSmootherClass = (nuxtApp as any).$ScrollSmoother
      }
    }

    if (!ScrollSmootherClass) {
      /*
      console.error(
        '❌ ScrollSmoother not found - check that scrollSmoother is enabled in nuxt.config.ts'
      )
      */
      return null
    }

    // Create ScrollSmoother instance
    try {
      smootherInstance = ScrollSmootherClass.create(defaultConfig)
      smootherEnabled = true
      // console.log('✅ ScrollSmoother created successfully')
      // console.log('Instance:', smootherInstance)
    }
    catch (error) {
      // console.error('❌ Failed to create ScrollSmoother:', error)
      smootherEnabled = false
      return null
    }

    return smootherInstance
  }

  /**
   * Kill the current ScrollSmoother instance
   */
  const killSmoother = (): void => {
    if (smootherInstance) {
      smootherInstance.kill()
      smootherInstance = null
      smootherEnabled = false
      // console.log('🗑️ ScrollSmoother killed')
    }
  }

  /**
   * Get the current ScrollSmoother instance
   */
  const getSmoother = (): ScrollSmootherInstance | null => {
    return smootherInstance
  }

  /**
   * Refresh ScrollSmoother to recalculate all data-speed and data-lag elements
   * Call this after page transitions or DOM changes
   * Always refreshes ScrollTrigger on both mobile and desktop
   */
  const refreshSmoother = (): void => {
    // Get ScrollTrigger from Nuxt app
    const nuxtApp = useNuxtApp()

    // If ScrollSmoother is enabled (desktop), refresh its effects too
    if (smootherEnabled && smootherInstance) {
      // IMPORTANT: Call effects() to recalculate data-speed and data-lag attributes
      // This re-scans the content for new elements with parallax effects
      if (typeof smootherInstance.effects === 'function') {
        smootherInstance.effects('[data-speed], [data-lag]')
        // console.log('🔄 ScrollSmoother effects recalculated')
      }

      // Refresh ScrollSmoother layout
      smootherInstance.refresh()
    }

    // ALWAYS refresh ScrollTrigger on both mobile and desktop
    // This ensures scroll-triggered animations work after page transitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((nuxtApp as any).$ScrollTrigger) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(nuxtApp as any).$ScrollTrigger.refresh()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if ((window as any).ScrollTrigger) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).ScrollTrigger.refresh()
    }

    // console.log('🔄 ScrollSmoother/ScrollTrigger refreshed')
  }

  /**
   * Scroll to top (0, 0) position
   * Use this to reset scroll position after loading
   */
  const scrollToTop = (): void => {
    if (!smootherInstance) {
      // Fallback to native scroll if smoother not available
      window.scrollTo(0, 0)
      return
    }

    // Use ScrollSmoother's scrollTo method for smooth scrolling
    smootherInstance.scrollTo(0, false) // false = instant, no animation
    // console.log('📍 ScrollSmoother scrolled to top');
  }

  /**
   * Check if ScrollSmoother is currently enabled
   * Returns false on mobile/tablet (< 1024px) where native scroll is used
   */
  const isEnabled = (): boolean => smootherEnabled

  return {
    createSmoother,
    killSmoother,
    getSmoother,
    refreshSmoother,
    scrollToTop,
    isEnabled
  }
}
