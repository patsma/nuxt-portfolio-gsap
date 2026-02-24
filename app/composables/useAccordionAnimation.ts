/**
 * Accordion Animation Composable
 *
 * Reusable GSAP-powered accordion animation logic for expand/collapse components.
 * Handles dynamic duration calculation, scroll-to-top behavior, and ScrollTrigger refresh.
 *
 * Features:
 * - Dynamic duration based on content height (larger content = longer animation)
 * - Automatic scroll-to-top when item is outside optimal viewport position
 * - Headroom pause/unpause coordination
 * - ScrollTrigger refresh after animation completes
 * - Page transition conflict detection (logs warning if animating during transition)
 *
 * Usage:
 * ```typescript
 * const itemRef = ref<HTMLElement | null>(null)
 * const contentRef = ref<HTMLElement | null>(null)
 * const isExpanded = computed(() => activeItemId?.value === props.id)
 *
 * useAccordionAnimation({
 *   contentRef,
 *   itemRef,
 *   isExpanded,
 *   componentName: 'MyAccordion'
 * })
 * ```
 */

import type { Ref, ComputedRef } from 'vue'
import { clampedNormalize } from '~/utils/math'

// Dynamic accordion timing constants
const ACCORDION_HEIGHT_MIN = 200 // Small content height (px)
const ACCORDION_HEIGHT_MAX = 800 // Large content height (px)
const ACCORDION_DURATION_MIN = 0.5 // Minimum duration (seconds)
const ACCORDION_DURATION_MAX = 0.9 // Maximum duration (seconds)
const ACCORDION_COLLAPSE_FACTOR = 0.8 // Collapse is 80% of expand duration
const SCROLL_DURATION = 0.6 // Scroll-to-top duration
const HEADER_OFFSET = 100 // Account for fixed header height

export interface AccordionAnimationOptions {
  /** Ref to expandable content element */
  contentRef: Ref<HTMLElement | null>
  /** Ref to accordion item container (for scroll targeting) */
  itemRef: Ref<HTMLElement | null>
  /** Reactive boolean for expanded state */
  isExpanded: Ref<boolean> | ComputedRef<boolean>
  /** Optional: Function called after refresh completes */
  onRefreshComplete?: () => void
  /** Optional: component name for debug logging */
  componentName?: string
}

/**
 * Accordion animation composable
 *
 * Watches the isExpanded ref and animates the content element accordingly.
 * Handles all the complexity of:
 * - Dynamic duration calculation
 * - Headroom pause/unpause
 * - Scroll-to-top after expansion
 * - ScrollTrigger refresh
 */
export const useAccordionAnimation = (options: AccordionAnimationOptions): void => {
  const {
    contentRef,
    itemRef,
    isExpanded,
    onRefreshComplete,
    componentName = 'Accordion'
  } = options

  const nuxtApp = useNuxtApp()
  const { $gsap } = nuxtApp

  // Inject refresh function from parent section
  const requestRefresh = inject<((callback?: () => void) => void) | undefined>('requestRefresh')

  /**
   * Scroll to accordion item if needed
   * Only scrolls if item top is above viewport or too far down
   */
  const scrollToItemIfNeeded = (
    itemEl: HTMLElement | null,
    onComplete: () => void
  ): void => {
    const { getSmoother } = useScrollSmootherManager()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const smoother = getSmoother() as any // Cast needed - scrollTop() exists at runtime

    if (!smoother || !itemEl) {
      onComplete()
      return
    }

    // Calculate scroll target (top of accordion item with header offset)
    const itemRect = itemEl.getBoundingClientRect()
    const currentScroll = smoother.scrollTop()
    const targetScroll = currentScroll + itemRect.top - HEADER_OFFSET

    // Only scroll if item top is above viewport or too far down (beyond top 30%)
    const shouldScroll = itemRect.top < 0 || itemRect.top > window.innerHeight * 0.3

    if (shouldScroll) {
      // GSAP tween to ScrollSmoother's scrollTop property
      $gsap.to(smoother, {
        scrollTop: targetScroll,
        duration: SCROLL_DURATION,
        ease: 'power2.inOut',
        onComplete
      })
    }
    else {
      // Item already in good position, just call complete
      onComplete()
    }
  }

  /**
   * Watch expanded state and animate height/opacity
   * Uses GSAP for smooth animations
   */
  watch(isExpanded, (expanded) => {
    if (!contentRef.value) return

    // Check if page transition is active (this should NOT be happening during accordion)
    const pageTransitionStore = usePageTransitionStore()
    if (pageTransitionStore?.isTransitioning) {
      /*
      console.error(`[${componentName}] WARNING: Page transition is ACTIVE during accordion animation!`, {
        isTransitioning: pageTransitionStore.isTransitioning
      })
      */
    }

    // Pause headroom before animation starts to prevent header from reacting to content height changes
    nuxtApp.$headroom?.pause()

    // Get actual content height for dynamic duration calculation
    const contentHeight = contentRef.value.scrollHeight

    // Calculate dynamic duration based on content size (larger content = longer duration)
    const baseDuration = clampedNormalize(
      contentHeight,
      ACCORDION_HEIGHT_MIN,
      ACCORDION_HEIGHT_MAX,
      ACCORDION_DURATION_MIN,
      ACCORDION_DURATION_MAX
    )

    if (expanded) {
      // Expand: Animate to auto height with opacity fade in
      $gsap.to(contentRef.value, {
        height: 'auto',
        opacity: 1,
        duration: baseDuration,
        ease: 'power2.out',
        onComplete: () => {
          if (!itemRef.value) {
            // Fallback: just refresh without scroll
            requestRefresh?.(() => {
              nuxtApp.$headroom?.unpause()
              onRefreshComplete?.()
            })
            return
          }

          // Scroll to item if needed, then refresh
          scrollToItemIfNeeded(itemRef.value, () => {
            requestRefresh?.(() => {
              nuxtApp.$headroom?.unpause()
              onRefreshComplete?.()
            })
          })
        }
      })
    }
    else {
      // Collapse: Animate to 0 height with opacity fade out (faster than expand, no scroll)
      const collapseDuration = baseDuration * ACCORDION_COLLAPSE_FACTOR

      $gsap.to(contentRef.value, {
        height: 0,
        opacity: 0,
        duration: collapseDuration,
        ease: 'power2.in',
        onComplete: () => {
          // Request refresh for pinned sections below (ImageScalingSection, etc.)
          requestRefresh?.(() => {
            nuxtApp.$headroom?.unpause()
            onRefreshComplete?.()
          })
        }
      })
    }
  })
}
