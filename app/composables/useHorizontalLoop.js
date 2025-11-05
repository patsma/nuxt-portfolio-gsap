/**
 * useHorizontalLoop Composable - GSAP Horizontal Infinite Loop Helper
 *
 * Provides a reusable horizontalLoop helper function for creating seamless
 * infinite horizontal scrolling animations using GSAP.
 *
 * Originally extracted from RecommendationItem.vue for reusability across
 * marquee components (FooterMarquee, RecommendationItem, etc.)
 *
 * Features:
 * - Seamless infinite looping
 * - Configurable speed and direction
 * - Automatic positioning and spacing calculations
 * - Support for reversed (right-to-left) animations
 * - Padding right for seamless loop cycles
 *
 * Usage:
 * ```javascript
 * const { $gsap } = useNuxtApp()
 * const { createLoop } = useHorizontalLoop($gsap)
 *
 * const items = containerRef.value.querySelectorAll('.item')
 * const loopAnimation = createLoop(items, {
 *   speed: 1,              // Speed multiplier (always positive)
 *   reversed: false,       // true = right-to-left, false = left-to-right
 *   repeat: -1,            // Infinite repeat
 *   paddingRight: 48,      // Gap between loop cycles (px)
 *   paused: true           // Start paused
 * })
 *
 * // Control animation
 * loopAnimation.play()
 * loopAnimation.pause()
 * loopAnimation.resume()  // Respects reversed state
 * ```
 *
 * IMPORTANT: Always use resume() instead of play() to respect reversed state.
 * play() resets direction to forward, resume() continues in current direction.
 *
 * @param {Object} gsap - GSAP instance from useNuxtApp().$gsap
 * @returns {Object} { createLoop: Function }
 */
export const useHorizontalLoop = (gsap) => {
  // Use provided GSAP instance instead of calling useNuxtApp() at module level
  const $gsap = gsap

  // Safety check: ensure GSAP is available
  if (!$gsap) {
    console.error('[useHorizontalLoop] GSAP instance is not available')
    return {
      createLoop: () => {
        console.error('[useHorizontalLoop] Cannot create loop - GSAP not initialized')
        return null
      }
    }
  }

  /**
   * Create seamless horizontal infinite loop animation
   *
   * @param {Array|NodeList|string} items - Elements to animate
   * @param {Object} config - Configuration options
   * @param {number} [config.speed=1] - Speed multiplier (pixels per second, always positive)
   * @param {boolean} [config.reversed=false] - Direction (true = right-to-left, false = left-to-right)
   * @param {number} [config.repeat=-1] - Repeat count (-1 = infinite)
   * @param {number} [config.paddingRight=0] - Gap between loop cycles (pixels)
   * @param {boolean} [config.paused=false] - Start paused
   * @param {boolean|number} [config.snap=1] - Snap positions
   * @returns {gsap.core.Timeline} Timeline with loop control methods
   */
  const createLoop = (items, config) => {
    // Convert items to array
    items = $gsap.utils.toArray(items)
    config = config || {}

    // Create timeline with infinite repeat and no easing
    let tl = $gsap.timeline({
        repeat: config.repeat,
        paused: config.paused,
        defaults: { ease: 'none' },
        onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
      }),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      xPercents = [],
      curIndex = 0,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap =
        config.snap === false ? (v) => v : $gsap.utils.snap(config.snap || 1),
      totalWidth,
      curX,
      distanceToStart,
      distanceToLoop,
      item,
      i

    // Calculate initial xPercent positions
    $gsap.set(items, {
      xPercent: (i, el) => {
        let w = (widths[i] = parseFloat($gsap.getProperty(el, 'width', 'px')))
        xPercents[i] = snap(
          (parseFloat($gsap.getProperty(el, 'x', 'px')) / w) * 100 +
            $gsap.getProperty(el, 'xPercent')
        )
        return xPercents[i]
      },
    })

    // Reset x position
    $gsap.set(items, { x: 0 })

    // Calculate total width including padding
    totalWidth =
      items[length - 1].offsetLeft +
      (xPercents[length - 1] / 100) * widths[length - 1] -
      startX +
      items[length - 1].offsetWidth *
        $gsap.getProperty(items[length - 1], 'scaleX') +
      (parseFloat(config.paddingRight) || 0)

    // Create seamless loop animation for each item
    for (i = 0; i < length; i++) {
      item = items[i]
      curX = (xPercents[i] / 100) * widths[i]
      distanceToStart = item.offsetLeft + curX - startX
      distanceToLoop =
        distanceToStart + widths[i] * $gsap.getProperty(item, 'scaleX')

      // Animate from current position to loop end
      tl.to(
        item,
        {
          xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
          duration: distanceToLoop / pixelsPerSecond,
        },
        0
      )
        // Then animate from loop start back to current position
        .fromTo(
          item,
          {
            xPercent: snap(
              ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
            ),
          },
          {
            xPercent: xPercents[i],
            duration:
              (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
            immediateRender: false,
          },
          distanceToLoop / pixelsPerSecond
        )
        .add('label' + i, distanceToStart / pixelsPerSecond)

      times[i] = distanceToStart / pixelsPerSecond
    }

    /**
     * Jump to specific index in loop
     * @param {number} index - Target index
     * @param {Object} vars - GSAP tween vars
     * @returns {gsap.core.Tween}
     */
    function toIndex(index, vars) {
      vars = vars || {}
      Math.abs(index - curIndex) > length / 2 &&
        (index += index > curIndex ? -length : length)
      let newIndex = $gsap.utils.wrap(0, length, index),
        time = times[newIndex]
      if (time > tl.time() !== index > curIndex) {
        vars.modifiers = { time: $gsap.utils.wrap(0, tl.duration()) }
        time += tl.duration() * (index > curIndex ? 1 : -1)
      }
      curIndex = newIndex
      vars.overwrite = true
      return tl.tweenTo(time, vars)
    }

    // Add helper methods to timeline
    tl.next = (vars) => toIndex(curIndex + 1, vars)
    tl.previous = (vars) => toIndex(curIndex - 1, vars)
    tl.current = () => curIndex
    tl.toIndex = (index, vars) => toIndex(index, vars)
    tl.times = times

    // Initialize timeline at start position
    tl.progress(1, true).progress(0, true)

    // If reversed, set up reverse playback
    if (config.reversed) {
      tl.vars.onReverseComplete()
      tl.reverse()
    }

    return tl
  }

  return {
    createLoop,
  }
}
