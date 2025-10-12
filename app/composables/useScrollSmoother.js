/**
 * ScrollSmoother Composable
 *
 * Simple wrapper for GSAP ScrollSmoother to handle smooth scrolling
 * Integrates with Nuxt GSAP module
 *
 * USAGE:
 * const { createSmoother, killSmoother, getSmoother } = useScrollSmoother()
 * createSmoother({ smooth: 2, effects: true })
 * killSmoother()
 */

export const useScrollSmoother = () => {
  // Store the active smoother instance
  let smootherInstance = null

  /**
   * Create a new ScrollSmoother instance
   * @param {Object} config - ScrollSmoother configuration
   * @returns {Object} ScrollSmoother instance
   */
  const createSmoother = (config = {}) => {
    // Only run on client side
    if (typeof window === 'undefined') {
      console.warn('⚠️ ScrollSmoother can only run on client side')
      return null
    }

    // Get GSAP plugins from Nuxt app (same way as SplitText)
    const { $ScrollSmoother, $ScrollTrigger } = useNuxtApp()

    // Check if plugins are available
    if (!$ScrollSmoother || !$ScrollTrigger) {
      console.error('⚠️ ScrollSmoother or ScrollTrigger not available')
      return null
    }

    // Kill existing instance before creating new one
    if (smootherInstance) {
      killSmoother()
    }

    // Default configuration
    const defaultConfig = {
      smooth: 2, // seconds it takes to "catch up" to native scroll position
      effects: true, // look for data-speed and data-lag attributes
      ...config
    }

    // Create ScrollSmoother instance using the class directly
    smootherInstance = $ScrollSmoother.create(defaultConfig)

    console.log('✅ ScrollSmoother created')

    return smootherInstance
  }

  /**
   * Kill the current ScrollSmoother instance
   */
  const killSmoother = () => {
    if (smootherInstance) {
      smootherInstance.kill()
      smootherInstance = null
      console.log('🗑️ ScrollSmoother killed')
    }
  }

  /**
   * Get the current ScrollSmoother instance
   * @returns {Object|null} Current ScrollSmoother instance
   */
  const getSmoother = () => {
    return smootherInstance
  }

  return {
    createSmoother,
    killSmoother,
    getSmoother
  }
}
