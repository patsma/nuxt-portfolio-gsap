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

export const usePageTransition = () => {
  const { $gsap, $SplitText } = useNuxtApp()
  const splitInstances = []

  // ========================================
  // ANIMATION FUNCTIONS
  // ========================================

  /**
   * SPLIT TEXT ANIMATION
   * Animates text by splitting into chars/words/lines
   *
   * @param {HTMLElement} el - Element to animate
   * @param {Object} config - Animation config { splitType, stagger, duration, ease, y }
   * @param {string} direction - 'out' or 'in'
   * @param {Object} timeline - GSAP timeline to add animation to
   * @param {number} position - Timeline position
   */
  const animateSplit = (el, config, direction, timeline, position) => {
    if (!$SplitText) {
      console.warn('⚠️ SplitText not available, skipping split animation')
      return
    }

    const splitType = config.splitType || 'chars'
    const stagger = config.stagger || 0.025
    const duration = config.duration || 0.6
    const ease = config.ease || 'power2.out'
    const y = config.y || 35

    // Create split
    const split = $SplitText.create(el, {
      type: splitType,
      mask: splitType // Use masking for clean reveals
    })
    splitInstances.push(split)

    if (direction === 'out') {
      // Animate OUT: fade up and disappear
      timeline.to(split[splitType], {
        y: -y,
        opacity: 0,
        duration: duration * 0.7,
        stagger: stagger,
        ease: 'power2.in'
      }, position)
    } else {
      // Animate IN: bounce down and appear
      $gsap.set(split[splitType], { y: y, opacity: 0 })
      timeline.to(split[splitType], {
        y: 0,
        opacity: 1,
        duration: duration,
        stagger: stagger,
        ease: ease
      }, position)
    }
  }

  /**
   * FADE ANIMATION
   * Simple fade in/out with optional directional movement
   *
   * @param {HTMLElement} el - Element to animate
   * @param {Object} config - Animation config { direction, distance, duration, ease }
   * @param {string} animDirection - 'out' or 'in'
   * @param {Object} timeline - GSAP timeline
   * @param {number} position - Timeline position
   */
  const animateFade = (el, config, animDirection, timeline, position) => {
    const fadeDirection = config.direction || 'up'
    const distance = config.distance || 20
    const duration = config.duration || 0.6
    const ease = config.ease || 'power2.out'

    // Determine movement axis
    const axis = (fadeDirection === 'up' || fadeDirection === 'down') ? 'y' : 'x'
    const multiplier = (fadeDirection === 'up' || fadeDirection === 'left') ? -1 : 1

    if (animDirection === 'out') {
      // Animate OUT: fade and move away
      timeline.to(el, {
        [axis]: multiplier * distance,
        opacity: 0,
        duration: duration * 0.7,
        ease: 'power2.in'
      }, position)
    } else {
      // Animate IN: fade and move in from opposite
      $gsap.set(el, { [axis]: -multiplier * distance, opacity: 0 })
      timeline.to(el, {
        [axis]: 0,
        opacity: 1,
        duration: duration,
        ease: ease
      }, position)
    }
  }

  /**
   * CLIP-PATH ANIMATION
   * Modern clip-path reveals from any direction
   *
   * @param {HTMLElement} el - Element to animate
   * @param {Object} config - Animation config { direction, duration, ease }
   * @param {string} animDirection - 'out' or 'in'
   * @param {Object} timeline - GSAP timeline
   * @param {number} position - Timeline position
   */
  const animateClip = (el, config, animDirection, timeline, position) => {
    const direction = config.direction || 'top'
    const duration = config.duration || 0.6
    const ease = config.ease || 'power2.out'

    // Clip-path values for each direction
    const clips = {
      top: { out: 'inset(0% 0% 100% 0%)', in: 'inset(100% 0% 0% 0%)' },
      bottom: { out: 'inset(100% 0% 0% 0%)', in: 'inset(0% 0% 100% 0%)' },
      left: { out: 'inset(0% 100% 0% 0%)', in: 'inset(0% 0% 0% 100%)' },
      right: { out: 'inset(0% 0% 0% 100%)', in: 'inset(0% 100% 0% 0%)' }
    }

    if (animDirection === 'out') {
      // Animate OUT: clip away
      timeline.to(el, {
        clipPath: clips[direction].out,
        duration: duration * 0.7,
        ease: 'power2.in'
      }, position)
    } else {
      // Animate IN: clip reveal
      $gsap.set(el, { clipPath: clips[direction].in })
      timeline.to(el, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: duration,
        ease: ease
      }, position)
    }
  }

  /**
   * STAGGER ANIMATION
   * Stagger child elements with fade animation
   *
   * @param {HTMLElement} el - Container element
   * @param {Object} config - Animation config { selector, stagger, duration, ease }
   * @param {string} direction - 'out' or 'in'
   * @param {Object} timeline - GSAP timeline
   * @param {number} position - Timeline position
   */
  const animateStagger = (el, config, direction, timeline, position) => {
    const selector = config.selector || ':scope > *'
    const stagger = config.stagger || 0.1
    const duration = config.duration || 0.5
    const ease = config.ease || 'power2.out'

    const children = el.querySelectorAll(selector)

    if (direction === 'out') {
      // Animate OUT: fade up
      timeline.to(children, {
        y: -15,
        opacity: 0,
        duration: duration * 0.7,
        stagger: stagger * 0.8,
        ease: 'power2.in'
      }, position)
    } else {
      // Animate IN: fade down
      $gsap.set(children, { y: 15, opacity: 0 })
      timeline.to(children, {
        y: 0,
        opacity: 1,
        duration: duration,
        stagger: stagger,
        ease: ease
      }, position)
    }
  }

  /**
   * Cleanup function to revert all SplitText instances
   */
  const cleanup = () => {
    splitInstances.forEach(split => split.revert?.())
    splitInstances.length = 0
  }

  // ========================================
  // PAGE TRANSITION HOOKS
  // ========================================

  /**
   * Find all elements with page animation configs
   */
  const findAnimatedElements = (el) => {
    const elements = []

    console.log('🔍 Finding animated elements in:', el)
    console.log('🔍 Children count:', el.children.length)

    // Check direct children for _pageAnimation property
    Array.from(el.children).forEach(child => {
      console.log('🔍 Child:', child.tagName, 'has _pageAnimation:', !!child._pageAnimation)
      if (child._pageAnimation) {
        elements.push(child)
      }
    })

    console.log('🔍 Found elements with directives:', elements.length)
    return elements
  }

  /**
   * LEAVE Animation - Elements animate OUT
   */
  const leave = (el, done) => {
    console.log('🚀 Page LEAVE')

    const elements = findAnimatedElements(el)

    if (elements.length === 0) {
      console.warn('⚠️ No elements with page animation directives found')
      done()
      return
    }

    const tl = $gsap.timeline({ onComplete: done })

    elements.forEach((element, index) => {
      const { type, config } = element._pageAnimation
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
  const enter = (el, done) => {
    console.log('🎬 Page ENTER')

    // Wait for directives to mount and store their configs
    nextTick(() => {
      const elements = findAnimatedElements(el)

      if (elements.length === 0) {
        console.warn('⚠️ No elements with page animation directives found')
        done()
        return
      }

      const tl = $gsap.timeline({ onComplete: done })

      elements.forEach((element, index) => {
        const { type, config } = element._pageAnimation
        const position = index * 0.08 // Stagger start times (slightly slower than leave)

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
  }

  /**
   * Before enter hook
   */
  const beforeEnter = () => {
    // Initial states will be set by animation functions
  }

  /**
   * After leave hook - cleanup
   */
  const afterLeave = (el) => {
    // Cleanup SplitText instances and GSAP properties
    cleanup()

    if ($gsap && el) {
      $gsap.set(el, { clearProps: 'all' })
      $gsap.set(el.querySelectorAll('*'), { clearProps: 'all' })
    }
  }

  return { leave, enter, beforeEnter, afterLeave }
}
