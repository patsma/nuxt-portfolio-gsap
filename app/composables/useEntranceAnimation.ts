/**
 * Entrance Animation System
 *
 * Manages entrance animations for components in the initial viewport.
 * Components queue their animations which play sequentially after the loading sequence.
 *
 * IMPORTANT: Hide elements with CSS BEFORE JavaScript loads to prevent flash:
 * - Add data-entrance-animate="true" attribute to element
 * - CSS in base.scss will hide it initially (opacity: 0, visibility: hidden)
 * - Then GSAP animates it to visible (autoAlpha: 1)
 *
 * Features:
 * - Full GSAP position parameter support ('<', '+=0.3', 'label+=0.5', etc.)
 * - Automatic viewport detection
 * - ScrollTrigger fallback for below-fold content
 * - Only runs on first page load
 * - CSS-first hiding prevents FOUC
 *
 * Usage:
 * ```vue
 * <template>
 *   <div ref="myElement" data-entrance-animate="true">
 *     Content
 *   </div>
 * </template>
 *
 * <script setup lang="ts">
 * const { setupEntrance } = useEntranceAnimation()
 * const myElement = ref<HTMLElement | null>(null)
 *
 * onMounted(() => {
 *   setupEntrance(myElement.value, {
 *     position: '<-0.3',  // Overlap previous by 0.3s
 *     animate: (el) => {
 *       const tl = $gsap.timeline()
 *       // Element already hidden by CSS, just set transform offset
 *       $gsap.set(el, { y: 30 })
 *       // Animate to visible with autoAlpha
 *       tl.to(el, { autoAlpha: 1, y: 0, duration: 0.6 })
 *       return tl
 *     },
 *     scrollTrigger: { ... } // Optional fallback
 *   })
 * })
 * </script>
 * ```
 */

// GSAP types
interface GSAPTimeline {
  add: (animation: unknown, position?: string | number) => GSAPTimeline
  play: () => GSAPTimeline
  kill: () => void
}

interface GSAPInstance {
  timeline: (config?: Record<string, unknown>) => GSAPTimeline
}

interface ScrollTriggerInstance {
  create: (config: Record<string, unknown>) => void
}

interface QueuedAnimation {
  element: HTMLElement
  animateFn: (el: HTMLElement) => GSAPTimeline | unknown
  position: string
}

export interface EntranceAnimationOptions {
  /** GSAP position parameter */
  position?: string
  /** Animation function (el) => tween/timeline */
  animate: (el: HTMLElement) => GSAPTimeline | unknown
  /** Optional ScrollTrigger config for fallback */
  scrollTrigger?: Record<string, unknown>
}

export interface EntranceAnimationReturn {
  setupEntrance: (element: HTMLElement | null, options?: EntranceAnimationOptions) => void
  getTimeline: () => GSAPTimeline | null
  reset: () => void
}

// Module-level state for master timeline and queue
let masterTimeline: GSAPTimeline | null = null
let animationQueue: QueuedAnimation[] = []
let isInitialized = false
let isPlaying = false

/**
 * Check if element is in viewport on page load
 */
const isInViewport = (el: HTMLElement | null): boolean => {
  if (!el) return false

  const rect = el.getBoundingClientRect()
  const windowHeight
    = window.innerHeight || document.documentElement.clientHeight

  // Element is in viewport if its top is above bottom of viewport
  // and its bottom is below top of viewport
  return rect.top < windowHeight && rect.bottom > 0
}

/**
 * Main composable for entrance animation system
 */
export const useEntranceAnimation = (): EntranceAnimationReturn => {
  const nuxtApp = useNuxtApp() as unknown as {
    $gsap: GSAPInstance
    $ScrollTrigger?: ScrollTriggerInstance
  }
  const { $gsap } = nuxtApp
  const { isFirstLoad } = useLoadingSequence()

  /**
   * Initialize the master timeline and event listeners
   */
  const initialize = (): void => {
    if (isInitialized) return

    // Create master timeline (paused, will play after entrance-ready event)
    masterTimeline = $gsap.timeline({
      paused: true,
      onComplete: () => {
        // Remove is-first-load class from html element
        // This stops CSS from hiding elements on subsequent navigations
        document.documentElement.classList.remove('is-first-load')

        // Fire completion event
        window.dispatchEvent(new CustomEvent('app:entrance-complete'))
      }
    })

    // Add initial label for positioning
    masterTimeline.add('start', 0)

    // Listen for app:start-animations event (fired by loading system)
    // This triggers after loader completes, starting all entrance animations together
    window.addEventListener(
      'app:start-animations',
      () => {
        if (!isPlaying && animationQueue.length > 0) {
          playEntranceAnimations()
        }
      },
      { once: true }
    )

    isInitialized = true
  }

  /**
   * Play all queued entrance animations
   */
  const playEntranceAnimations = (): void => {
    if (isPlaying || !masterTimeline || animationQueue.length === 0) return

    isPlaying = true

    // Add all queued animations to master timeline
    animationQueue.forEach(({ element, animateFn, position }) => {
      try {
        // Call the animation function (returns tween or timeline)
        const animation = animateFn(element)

        // Add to master timeline at specified position
        if (animation) {
          masterTimeline!.add(animation, position)
        }
      }
      catch (error) {
        // console.error('❌ Error creating entrance animation:', error)
      }
    })

    // Clear queue after adding to timeline
    animationQueue = []

    // Play the master timeline
    masterTimeline.play()
  }

  /**
   * Setup entrance animation for a component
   */
  const setupEntrance = (
    element: HTMLElement | null,
    options: EntranceAnimationOptions = {} as EntranceAnimationOptions
  ): void => {
    if (!element) {
      // console.warn('⚠️ setupEntrance: No element provided')
      return
    }

    const {
      position = '+=0.15', // Default: 0.15s after previous animation
      animate,
      scrollTrigger
    } = options

    if (typeof animate !== 'function') {
      // console.warn('⚠️ setupEntrance: animate must be a function')
      return
    }

    // Only run on first page load
    if (!isFirstLoad()) {
      // If ScrollTrigger config provided, set it up as fallback
      if (scrollTrigger) {
        setupScrollTriggerFallback(element, animate, scrollTrigger)
      }

      return
    }

    // Initialize system if not already done
    initialize()

    // Check if element is in viewport
    const inViewport = isInViewport(element)

    if (inViewport) {
      // Queue for entrance animation
      animationQueue.push({
        element,
        animateFn: animate,
        position
      })
    }
    else {
      // Element not in viewport, use ScrollTrigger if provided
      if (scrollTrigger) {
        setupScrollTriggerFallback(element, animate, scrollTrigger)
      }
      else {
        // No ScrollTrigger config, just run animation immediately
        // (useful for elements that should be visible but not animated on scroll)
        try {
          animate(element)
        }
        catch (error) {
          // console.error('❌ Error running immediate animation:', error)
        }
      }
    }
  }

  /**
   * Setup ScrollTrigger animation as fallback
   */
  const setupScrollTriggerFallback = (
    element: HTMLElement,
    animateFn: (el: HTMLElement) => GSAPTimeline | unknown,
    scrollTriggerConfig: Record<string, unknown>
  ): void => {
    const { $ScrollTrigger } = nuxtApp

    if (!$ScrollTrigger) {
      // console.warn('⚠️ ScrollTrigger not available for fallback')
      return
    }

    try {
      // Create animation
      const animation = animateFn(element)

      if (!animation) return

      // Attach ScrollTrigger
      $ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        ...scrollTriggerConfig,
        animation,
        once: true // Only animate once
      })
    }
    catch (error) {
      // console.error('❌ Error setting up ScrollTrigger fallback:', error)
    }
  }

  /**
   * Get master timeline (useful for debugging)
   */
  const getTimeline = (): GSAPTimeline | null => masterTimeline

  /**
   * Reset system (useful for testing or cleanup)
   */
  const reset = (): void => {
    if (masterTimeline) {
      masterTimeline.kill()
      masterTimeline = null
    }
    animationQueue = []
    isInitialized = false
    isPlaying = false
  }

  return {
    setupEntrance,
    getTimeline,
    reset
  }
}
