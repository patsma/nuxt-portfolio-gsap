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
 * ```typescript
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
 */

// GSAP types - using basic types since GSAP types are complex
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GSAPInstance = any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GSAPTimeline = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GSAPTween = any

export interface HorizontalLoopConfig {
  speed?: number
  reversed?: boolean
  repeat?: number
  paddingRight?: number
  paused?: boolean
  snap?: number | false
}

export interface HorizontalLoopReturn {
  createLoop: (
    items: Element[] | NodeList | string,
    config?: HorizontalLoopConfig
  ) => GSAPTimeline | null
}

export const useHorizontalLoop = (gsap: GSAPInstance): HorizontalLoopReturn => {
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
   */
  const createLoop = (
    items: Element[] | NodeList | string,
    config: HorizontalLoopConfig = {}
  ): GSAPTimeline | null => {
    // Convert items to array
    const itemsArray = $gsap.utils.toArray(items) as Element[]

    // Create timeline with infinite repeat and no easing
    const tl = $gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: 'none' },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
    }) as GSAPTimeline & {
      next: (vars?: Record<string, unknown>) => GSAPTween
      previous: (vars?: Record<string, unknown>) => GSAPTween
      current: () => number
      toIndex: (index: number, vars?: Record<string, unknown>) => GSAPTween
      times: number[]
    }

    const length = itemsArray.length
    const startX = (itemsArray[0] as HTMLElement).offsetLeft
    const times: number[] = []
    const widths: number[] = []
    const xPercents: number[] = []
    let curIndex = 0
    const pixelsPerSecond = (config.speed || 1) * 100
    const snap = config.snap === false
      ? (v: number) => v
      : $gsap.utils.snap(config.snap || 1)

    // Calculate initial xPercent positions
    $gsap.set(itemsArray, {
      xPercent: (i: number, el: Element) => {
        const w = (widths[i] = parseFloat(String($gsap.getProperty(el, 'width', 'px'))))
        xPercents[i] = snap(
          (parseFloat(String($gsap.getProperty(el, 'x', 'px'))) / w) * 100
          + $gsap.getProperty(el, 'xPercent')
        )
        return xPercents[i]
      }
    })

    // Reset x position
    $gsap.set(itemsArray, { x: 0 })

    // Calculate total width including padding
    const lastItem = itemsArray[length - 1] as HTMLElement
    const totalWidth
      = lastItem.offsetLeft
        + (xPercents[length - 1] / 100) * widths[length - 1]
        - startX
        + lastItem.offsetWidth * $gsap.getProperty(lastItem, 'scaleX')
        + (parseFloat(String(config.paddingRight)) || 0)

    // Create seamless loop animation for each item
    for (let i = 0; i < length; i++) {
      const item = itemsArray[i]
      const curX = (xPercents[i] / 100) * widths[i]
      const distanceToStart = (item as HTMLElement).offsetLeft + curX - startX
      const distanceToLoop
        = distanceToStart + widths[i] * $gsap.getProperty(item, 'scaleX')

      // Animate from current position to loop end
      tl.to(
        item,
        {
          xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
          duration: distanceToLoop / pixelsPerSecond
        },
        0
      )
        // Then animate from loop start back to current position
        .fromTo(
          item,
          {
            xPercent: snap(
              ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
            )
          },
          {
            xPercent: xPercents[i],
            duration:
              (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
            immediateRender: false
          },
          distanceToLoop / pixelsPerSecond
        )
        .add('label' + i, distanceToStart / pixelsPerSecond)

      times[i] = distanceToStart / pixelsPerSecond
    }

    /**
     * Jump to specific index in loop
     */
    function toIndex(index: number, vars: Record<string, unknown> = {}): GSAPTween {
      const adjustedVars = { ...vars }
      if (Math.abs(index - curIndex) > length / 2) {
        index += index > curIndex ? -length : length
      }
      const newIndex = $gsap.utils.wrap(0, length, index)
      let time = times[newIndex]
      if ((time > tl.time()) !== (index > curIndex)) {
        adjustedVars.modifiers = { time: $gsap.utils.wrap(0, tl.duration()) }
        time += tl.duration() * (index > curIndex ? 1 : -1)
      }
      curIndex = newIndex
      adjustedVars.overwrite = true
      return tl.tweenTo(time, adjustedVars)
    }

    // Add helper methods to timeline
    tl.next = (vars?: Record<string, unknown>) => toIndex(curIndex + 1, vars)
    tl.previous = (vars?: Record<string, unknown>) => toIndex(curIndex - 1, vars)
    tl.current = () => curIndex
    tl.toIndex = (index: number, vars?: Record<string, unknown>) => toIndex(index, vars)
    tl.times = times

    // Initialize timeline at start position
    tl.progress(1, true).progress(0, true)

    // If reversed, set up reverse playback
    if (config.reversed) {
      const onReverseComplete = tl.vars.onReverseComplete as () => void
      if (onReverseComplete) {
        onReverseComplete()
      }
      tl.reverse()
    }

    return tl
  }

  return {
    createLoop
  }
}
