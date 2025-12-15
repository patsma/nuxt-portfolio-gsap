/**
 * Page Transition System
 *
 * Complete page transition system with directive-based animation control.
 * Provides 4 animation types: split, fade, clip, and stagger.
 *
 * ARCHITECTURE:
 * 1. Directives (v-page-*) store animation config on elements: el._pageAnimation = { type, config }
 * 2. This composable reads configs during page transitions
 * 3. Animation functions execute GSAP timelines for OUT/IN animations
 *
 * NO auto-detection - full manual control via directives.
 */

import type { PageAnimationElement } from '~/types/directives'

// Generic config type for animation functions - all properties optional
interface AnimationConfigGeneric {
  splitType?: string
  stagger?: number
  duration?: number
  ease?: string
  y?: number
  animateFrom?: 'below' | 'above'
  direction?: string
  distance?: number
  selector?: string
  leaveOnly?: boolean
}

// GSAP types
interface GSAPInstance {
  timeline: (config?: Record<string, unknown>) => GSAPTimeline
  set: (targets: unknown, vars: Record<string, unknown>) => void
  to: (targets: unknown, vars: Record<string, unknown>, position?: number | string) => GSAPTimeline
}

interface GSAPTimeline {
  to: (targets: unknown, vars: Record<string, unknown>, position?: number | string) => GSAPTimeline
  play: () => GSAPTimeline
}

interface SplitTextInstance {
  create: (element: HTMLElement, config: Record<string, unknown>) => SplitResult
}

interface SplitResult {
  chars?: Element[]
  words?: Element[]
  lines?: Element[]
  revert?: () => void
  [key: string]: unknown
}

interface HeadroomController {
  resume?: () => void
}

export interface PageTransitionReturn {
  leave: (el: HTMLElement, done: () => void) => void
  enter: (el: HTMLElement, done: () => void) => void
  beforeEnter: (el: HTMLElement) => void
  afterLeave: (el: HTMLElement) => void
}

export const usePageTransition = (): PageTransitionReturn => {
  const nuxtApp = useNuxtApp() as unknown as {
    $gsap: GSAPInstance
    $SplitText: SplitTextInstance
    $headroom?: HeadroomController
  }
  const { $gsap, $SplitText } = nuxtApp
  const splitInstances: SplitResult[] = []

  // ========================================
  // ANIMATION FUNCTIONS
  // ========================================

  /**
   * SPLIT TEXT ANIMATION
   * Animates text by splitting into chars/words/lines
   */
  const animateSplit = (
    el: HTMLElement,
    config: AnimationConfigGeneric,
    direction: 'out' | 'in',
    timeline: GSAPTimeline,
    position: number
  ): void => {
    if (!$SplitText) {
      console.warn('⚠️ SplitText not available, skipping split animation')
      return
    }

    const splitType = config.splitType || 'chars'
    const stagger = config.stagger || 0.025
    const duration = config.duration || 0.6
    const ease = config.ease || 'sine.out'
    const y = config.y || 35
    const animateFrom = config.animateFrom as 'below' | 'above' | undefined

    // Lock height before SplitText to prevent Safari jump
    const originalHeight = el.offsetHeight
    $gsap.set(el, { height: originalHeight })

    // Create split
    const split = $SplitText.create(el, {
      type: splitType,
      mask: splitType
    })
    splitInstances.push(split)

    // SLIDE FROM MASK EFFECT
    if (animateFrom === 'below' || animateFrom === 'above') {
      const yPercent = animateFrom === 'below' ? 100 : -100

      if (direction === 'out') {
        timeline.to(
          split[splitType],
          {
            yPercent: -yPercent,
            duration: duration * 0.7,
            stagger: stagger,
            ease: 'power2.in',
            transformOrigin: '100% 0%',
            rotate: 20
          },
          position
        )
      }
      else {
        $gsap.set(split[splitType], {
          yPercent: yPercent,
          rotate: 20,
          transformOrigin: '0% 0%'
        })
        timeline.to(
          split[splitType],
          {
            yPercent: 0,
            duration: duration,
            stagger: stagger,
            ease: ease,
            rotate: 0
          },
          position
        )
      }
    }
    // DEFAULT FADE EFFECT
    else {
      if (direction === 'out') {
        timeline.to(
          split[splitType],
          {
            y: -y,
            opacity: 0,
            duration: duration * 0.7,
            stagger: stagger,
            ease: 'power2.in'
          },
          position
        )
      }
      else {
        $gsap.set(split[splitType], { y: y, opacity: 0 })
        timeline.to(
          split[splitType],
          {
            y: 0,
            opacity: 1,
            duration: duration,
            stagger: stagger,
            ease: ease
          },
          position
        )
      }
    }
  }

  /**
   * FADE ANIMATION
   * Simple fade in/out with optional directional movement
   */
  const animateFade = (
    el: HTMLElement,
    config: AnimationConfigGeneric,
    animDirection: 'out' | 'in',
    timeline: GSAPTimeline,
    position: number,
    skipInitialState = false
  ): void => {
    const fadeDirection = config.direction || 'up'
    const distance = config.distance || 20
    const duration = config.duration || 0.6
    const ease = config.ease || 'power2.out'

    // Determine movement axis
    const axis = fadeDirection === 'up' || fadeDirection === 'down' ? 'y' : 'x'
    const multiplier = fadeDirection === 'up' || fadeDirection === 'left' ? -1 : 1

    if (animDirection === 'out') {
      timeline.to(
        el,
        {
          [axis]: multiplier * distance,
          opacity: 0,
          duration: duration * 0.7,
          ease: 'power2.in'
        },
        position
      )
    }
    else {
      if (!skipInitialState) {
        $gsap.set(el, { [axis]: -multiplier * distance, opacity: 0 })
      }
      timeline.to(
        el,
        {
          [axis]: 0,
          opacity: 1,
          duration: duration,
          ease: ease
        },
        position
      )
    }
  }

  /**
   * CLIP-PATH ANIMATION
   * Modern clip-path reveals from any direction
   */
  const animateClip = (
    el: HTMLElement,
    config: AnimationConfigGeneric,
    animDirection: 'out' | 'in',
    timeline: GSAPTimeline,
    position: number,
    skipInitialState = false
  ): void => {
    const direction = config.direction || 'top'
    const duration = config.duration || 0.6
    const ease = config.ease || 'power2.out'

    // Clip-path values for each direction
    const clips: Record<string, { out: string, in: string }> = {
      top: { out: 'inset(0% 0% 100% 0%)', in: 'inset(100% 0% 0% 0%)' },
      bottom: { out: 'inset(100% 0% 0% 0%)', in: 'inset(0% 0% 100% 0%)' },
      left: { out: 'inset(0% 100% 0% 0%)', in: 'inset(0% 0% 0% 100%)' },
      right: { out: 'inset(0% 0% 0% 100%)', in: 'inset(0% 100% 0% 0%)' }
    }

    if (animDirection === 'out') {
      timeline.to(
        el,
        {
          clipPath: clips[direction].out,
          duration: duration * 0.7,
          ease: 'power2.in'
        },
        position
      )
    }
    else {
      if (!skipInitialState) {
        $gsap.set(el, { clipPath: clips[direction].in })
      }
      timeline.to(
        el,
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: duration,
          ease: ease
        },
        position
      )
    }
  }

  /**
   * STAGGER ANIMATION
   * Stagger child elements with fade animation
   */
  const animateStagger = (
    el: HTMLElement,
    config: AnimationConfigGeneric,
    direction: 'out' | 'in',
    timeline: GSAPTimeline,
    position: number,
    skipInitialState = false
  ): void => {
    const selector = config.selector || ':scope > *'
    const stagger = config.stagger || 0.1
    const duration = config.duration || 0.5
    const ease = config.ease || 'power2.out'

    const children = el.querySelectorAll(selector)

    if (direction === 'out') {
      timeline.to(
        children,
        {
          y: -15,
          opacity: 0,
          duration: duration * 0.7,
          stagger: stagger * 0.8,
          ease: 'power2.in'
        },
        position
      )
    }
    else {
      if (!skipInitialState) {
        $gsap.set(children, { y: 15, opacity: 0 })
      }
      timeline.to(
        children,
        {
          y: 0,
          opacity: 1,
          duration: duration,
          stagger: stagger,
          ease: ease
        },
        position
      )
    }
  }

  /**
   * Cleanup function to revert all SplitText instances
   */
  const cleanup = (): void => {
    splitInstances.forEach(split => split.revert?.())
    splitInstances.length = 0
  }

  // ========================================
  // PAGE TRANSITION HOOKS
  // ========================================

  /**
   * Find all elements with page animation configs
   */
  const findAnimatedElements = (el: HTMLElement): PageAnimationElement[] => {
    const elements: PageAnimationElement[] = []

    // Recursively walk the entire tree to find all elements with _pageAnimation
    const walk = (node: HTMLElement): void => {
      // Check if this node has animation config
      if ((node as PageAnimationElement)._pageAnimation) {
        elements.push(node as PageAnimationElement)
      }

      // Walk all children recursively
      Array.from(node.children).forEach((child) => {
        walk(child as HTMLElement)
      })
    }

    // Start walking from root element
    walk(el)

    return elements
  }

  /**
   * LEAVE Animation - Elements animate OUT
   */
  const leave = (el: HTMLElement, done: () => void): void => {
    console.error('🚨 PAGE LEAVE TRANSITION TRIGGERED! This should ONLY fire on navigation, NOT on accordion!', {
      path: window.location.pathname,
      timestamp: Date.now(),
      stackTrace: new Error().stack
    })

    const elements = findAnimatedElements(el)

    if (elements.length === 0) {
      console.warn('⚠️ No elements with page animation directives found')
      done()
      return
    }

    const tl = $gsap.timeline({ onComplete: done })

    elements.forEach((element, index) => {
      const { type, config } = element._pageAnimation!
      const position = index * 0.06 // Stagger start times

      // Call appropriate animation function
      switch (type) {
        case 'split':
          animateSplit(element, config, 'out', tl, position)
          break
        case 'fade':
          animateFade(element, config, 'out', tl, position)
          break
        case 'clip':
          animateClip(element, config, 'out', tl, position)
          break
        case 'stagger':
          animateStagger(element, config, 'out', tl, position)
          break
        default:
          console.warn(`⚠️ Unknown animation type: ${type}`)
      }
    })
  }

  /**
   * ENTER Animation - Elements animate IN
   */
  const enter = (el: HTMLElement, done: () => void): void => {
    console.error('🚨 PAGE ENTER TRANSITION TRIGGERED! This should ONLY fire on navigation, NOT on accordion!', {
      path: window.location.pathname,
      timestamp: Date.now()
    })

    // Wait for directives to mount and store their configs
    nextTick(() => {
      const elements = findAnimatedElements(el)

      if (elements.length === 0) {
        console.warn('⚠️ No elements with page animation directives found')
        $gsap.set(el, { visibility: 'visible' })
        done()
        return
      }

      // SAFARI FIX: Double requestAnimationFrame ensures Safari has fully painted DOM
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Now Safari is ready - make page visible
          $gsap.set(el, { visibility: 'visible' })

          // Refresh ScrollSmoother to recalculate data-speed/data-lag for new page
          const { refreshSmoother } = useScrollSmootherManager()
          refreshSmoother()

          // Create timeline - resume headroom when animation completes
          const tl = $gsap.timeline({
            onComplete: () => {
              done()
              // Resume headroom AFTER visual transition completes
              if (nuxtApp.$headroom?.resume) {
                nuxtApp.$headroom.resume()
              }
            }
          })

          elements.forEach((element, index) => {
            const { type, config } = element._pageAnimation!
            const position = index * 0.08 // Stagger start times

            // Check if element should skip enter animation (only animate on leave)
            if (config.leaveOnly) {
              if (type === 'stagger') {
                const selector = config.selector || ':scope > *'
                const children = element.querySelectorAll(selector)
                $gsap.set(children, { y: 15, opacity: 0 })
              }
              else if (type === 'fade') {
                const direction = config.direction || 'up'
                const distance = config.distance || 20
                const axis = direction === 'up' || direction === 'down' ? 'y' : 'x'
                const value = direction === 'up' || direction === 'left' ? distance : -distance
                $gsap.set(element, { [axis]: value, opacity: 0 })
              }
              else if (type === 'split') {
                $gsap.set(element, { opacity: 0, y: 40 })
              }
              return // Skip animation
            }

            // Call appropriate animation function
            switch (type) {
              case 'split':
                animateSplit(element, config, 'in', tl, position)
                break
              case 'fade':
                animateFade(element, config, 'in', tl, position)
                break
              case 'clip':
                animateClip(element, config, 'in', tl, position)
                break
              case 'stagger':
                animateStagger(element, config, 'in', tl, position)
                break
              default:
                console.warn(`⚠️ Unknown animation type: ${type}`)
            }
          })
        })
      })
    })
  }

  /**
   * Before enter hook - hide page to prevent flash of content
   */
  const beforeEnter = (el: HTMLElement): void => {
    $gsap.set(el, { visibility: 'hidden' })
  }

  /**
   * After leave hook - cleanup and scroll to top
   */
  const afterLeave = (el: HTMLElement): void => {
    // Cleanup SplitText instances and GSAP properties
    cleanup()

    if ($gsap && el) {
      $gsap.set(el, { clearProps: 'all' })
      $gsap.set(el.querySelectorAll('*'), { clearProps: 'all' })
    }

    // Manually scroll to top AFTER leave animation completes
    const { getSmoother } = useScrollSmootherManager()
    const smoother = getSmoother()

    if (smoother && typeof smoother.scrollTo === 'function') {
      smoother.scrollTo(0, false) // instant scroll to top
    }
    else {
      window.scrollTo(0, 0)
    }
  }

  return { leave, enter, beforeEnter, afterLeave }
}
