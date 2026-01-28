/**
 * Interactive Case Study Preview Composable
 *
 * Manages state and animations for the cursor-following preview system.
 * Extracted from InteractiveCaseStudySection.vue for better modularity,
 * testability, and maintainability.
 *
 * Features:
 * - Dual-image crossfade system
 * - Clip-path reveal/close animations
 * - Image preloading with caching
 * - Smart transition routing
 * - Comprehensive logging
 * - Race condition prevention
 */

import type { Ref } from 'vue'
import { ref, nextTick } from 'vue'
import { createPreviewLogger } from '~/utils/logger'
import {
  calculatePreviewPosition,
  validateElements
} from '~/utils/previewPosition'

// Types
interface GSAPInstance {
  set: (targets: unknown, vars: Record<string, unknown>) => void
  to: (targets: unknown, vars: Record<string, unknown>) => GSAPTween
  fromTo: (targets: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown>) => GSAPTween
  timeline: (config?: Record<string, unknown>) => GSAPTimeline
  killTweensOf: (targets: unknown) => void
}

interface GSAPTween {
  play: () => GSAPTween
}

interface GSAPTimeline {
  to: (targets: unknown, vars: Record<string, unknown>, position?: number | string) => GSAPTimeline
  fromTo: (targets: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown>, position?: number | string) => GSAPTimeline
}

export interface PreviewData {
  image: string
  imageAlt?: string
  itemIndex: number
}

interface CursorPosition {
  x: number
  y: number
}

interface TemplateRefs {
  previewContainerRef: HTMLElement | null
  sectionRef: HTMLElement | null
  currentImageWrapperRef: HTMLElement | null
  nextImageWrapperRef: HTMLElement | null
}

interface PreloadedImage {
  img: HTMLImageElement
  aspectRatio: number
}

type ClipDirection = 'top' | 'bottom'

interface AnimationConfig {
  clipReveal: { duration: number, ease: string }
  clipClose: { duration: number, ease: string }
  dualClip: { duration: number, ease: string }
  aspectRatio: { duration: number, ease: string }
  clipPath: Record<ClipDirection, { closed: string, open: string }>
  position: { offsetX: number, padding: number }
  debounce: { clearDelay: number }
}

export interface InteractiveCaseStudyPreviewReturn {
  currentImage: Ref<PreviewData | null>
  nextImage: Ref<PreviewData | null>
  showPreview: Ref<boolean>
  previewMounted: Ref<boolean>
  currentImageActive: Ref<boolean>
  currentAspectRatio: Ref<number>
  isNavigating: Ref<boolean>
  setActivePreview: (preview: PreviewData | null, cursor: CursorPosition) => Promise<void>
  clearActivePreview: () => void
  clearActivePreviewImmediate: (onComplete?: () => void) => void
  clearActivePreviewInstant: () => void
  calculatePosition: (cursor: CursorPosition, sectionRect: DOMRect, previewRect: DOMRect) => ReturnType<typeof calculatePreviewPosition>
  animationConfig: AnimationConfig
}

/**
 * Animation configuration constants
 */
const ANIMATION_CONFIG: AnimationConfig = {
  clipReveal: {
    duration: 350,
    ease: 'power2.out'
  },
  clipClose: {
    duration: 350,
    ease: 'power2.in'
  },
  dualClip: {
    duration: 350,
    ease: 'power2.inOut'
  },
  aspectRatio: {
    duration: 400,
    ease: 'power2.inOut'
  },
  clipPath: {
    top: {
      closed: 'inset(0% 0% 100% 0%)',
      open: 'inset(0% 0% 0% 0%)'
    },
    bottom: {
      closed: 'inset(100% 0% 0% 0%)',
      open: 'inset(0% 0% 0% 0%)'
    }
  },
  position: {
    offsetX: 30,
    padding: 20
  },
  debounce: {
    clearDelay: 100
  }
}

/**
 * Module-level previous index for direction calculation
 * Persists across composable instances within the same page
 */
let previousItemIndex: number | null = null

/**
 * Resolve clip direction based on movement direction in list
 * Moving DOWN (index increases) → reveal from top
 * Moving UP (index decreases) → reveal from bottom
 * First hover → reveal from top
 */
const resolveClipDirection = (currentIndex: number): ClipDirection => {
  const prev = previousItemIndex
  previousItemIndex = currentIndex

  // First hover or moving down → reveal from top
  // Moving up → reveal from bottom
  if (prev === null || currentIndex >= prev) {
    return 'top'
  }
  return 'bottom'
}

/**
 * Reset previous item index (called when preview is cleared)
 */
const resetPreviousItemIndex = (): void => {
  previousItemIndex = null
}

interface ComposableOptions {
  gsap: GSAPInstance
  getRefs: () => TemplateRefs
}

export const useInteractiveCaseStudyPreview = ({ gsap, getRefs }: ComposableOptions): InteractiveCaseStudyPreviewReturn => {
  const log = createPreviewLogger()

  const currentImage = ref<PreviewData | null>(null)
  const nextImage = ref<PreviewData | null>(null)
  const currentImageActive = ref(true)
  const showPreview = ref(false)
  const previewMounted = ref(false)
  const isTransitioning = ref(false)
  const preloadedImages = new Map<string, PreloadedImage>()
  const currentAspectRatio = ref(4 / 3)
  const isNavigating = ref(false)
  const currentClipDirection = ref<ClipDirection>('top')
  const forceHideUntil = ref(0)

  /**
   * Preload image for instant display on hover
   */
  const preloadImage = (src: string): Promise<number> => {
    const startTime = performance.now()

    return new Promise((resolve, reject) => {
      if (preloadedImages.has(src)) {
        const cached = preloadedImages.get(src)!
        log.preload('cached', src)
        resolve(cached.aspectRatio)
        return
      }

      log.preload('loading', src)

      const img = new Image()
      img.onload = () => {
        const duration = Math.round(performance.now() - startTime)
        const aspectRatio = img.naturalWidth / img.naturalHeight

        preloadedImages.set(src, { img, aspectRatio })
        log.preload('cached', src, duration)
        log.debug(`Aspect ratio detected: ${aspectRatio.toFixed(2)} (${img.naturalWidth}x${img.naturalHeight})`)
        resolve(aspectRatio)
      }
      img.onerror = () => {
        log.preload('failed', src)
        reject(new Error(`Failed to preload image: ${src}`))
      }
      img.src = src
    })
  }

  /**
   * Calculate preview position using utility
   */
  const calculatePosition = (
    cursor: CursorPosition,
    sectionRect: DOMRect,
    previewRect: DOMRect
  ): ReturnType<typeof calculatePreviewPosition> => {
    const position = calculatePreviewPosition({
      cursorX: cursor.x,
      cursorY: cursor.y,
      sectionRect,
      previewRect,
      offsetX: ANIMATION_CONFIG.position.offsetX,
      padding: ANIMATION_CONFIG.position.padding,
      centerY: true
    })

    if (position.clamped) {
      log.position(position.original, position, position.clampReason)
    }

    return position
  }

  /**
   * Set initial position without animation
   */
  const setInitialPosition = (refs: TemplateRefs, cursor: CursorPosition): void => {
    if (!refs.previewContainerRef || !refs.sectionRef) {
      log.warn('Missing refs for initial position', {
        hasPreview: !!refs.previewContainerRef,
        hasSection: !!refs.sectionRef
      })
      return
    }

    const sectionRect = refs.sectionRef.getBoundingClientRect()
    const previewRect = refs.previewContainerRef.getBoundingClientRect()
    const position = calculatePosition(cursor, sectionRect, previewRect)

    gsap.set(refs.previewContainerRef, {
      x: position.x,
      y: position.y,
      xPercent: 100,
      yPercent: 15
    })

    log.position({ x: position.x, y: position.y })
  }

  /**
   * Animate clip-path reveal
   */
  const animateClipReveal = (
    target: HTMLElement | null,
    direction: ClipDirection,
    onComplete?: () => void
  ): void => {
    if (!target) {
      log.error('animateClipReveal: target is null')
      return
    }

    const clipPaths = ANIMATION_CONFIG.clipPath[direction]
    log.animationStart('clip-reveal', ANIMATION_CONFIG.clipReveal.duration, { direction })

    gsap.fromTo(
      target,
      { clipPath: clipPaths.closed },
      {
        clipPath: clipPaths.open,
        duration: ANIMATION_CONFIG.clipReveal.duration / 1000,
        ease: ANIMATION_CONFIG.clipReveal.ease,
        overwrite: true,
        onComplete: () => {
          log.animationComplete('clip-reveal', ANIMATION_CONFIG.clipReveal.duration)
          if (onComplete) onComplete()
        }
      }
    )
  }

  /**
   * Animate clip-path close
   */
  const animateClipClose = (
    target: HTMLElement | null,
    direction: ClipDirection,
    onComplete?: () => void
  ): void => {
    if (!target) {
      log.error('animateClipClose: target is null')
      return
    }

    const clipPaths = ANIMATION_CONFIG.clipPath[direction]
    log.animationStart('clip-close', ANIMATION_CONFIG.clipClose.duration, { direction })

    gsap.to(target, {
      clipPath: clipPaths.closed,
      duration: ANIMATION_CONFIG.clipClose.duration / 1000,
      ease: ANIMATION_CONFIG.clipClose.ease,
      overwrite: true,
      onComplete: () => {
        log.animationComplete('clip-close', ANIMATION_CONFIG.clipClose.duration)
        if (onComplete) onComplete()
      }
    })
  }

  /**
   * Animate dual clip-path transition
   */
  const animateDualClip = (
    clipOutTarget: HTMLElement | null,
    clipInTarget: HTMLElement | null,
    outDirection: ClipDirection,
    inDirection: ClipDirection,
    onComplete?: () => void
  ): void => {
    if (!clipOutTarget || !clipInTarget) {
      log.error('animateDualClip: missing targets', {
        clipOut: !!clipOutTarget,
        clipIn: !!clipInTarget
      })
      return
    }

    const clipPathOut = ANIMATION_CONFIG.clipPath[outDirection]
    const clipPathIn = ANIMATION_CONFIG.clipPath[inDirection]

    log.animationStart('dual-clip', ANIMATION_CONFIG.dualClip.duration, { outDirection, inDirection })

    gsap.set(clipInTarget, { opacity: 1 })

    const tl = gsap.timeline({
      onComplete: () => {
        log.animationComplete('dual-clip', ANIMATION_CONFIG.dualClip.duration)
        gsap.set(clipOutTarget, { opacity: 0 })
        if (onComplete) onComplete()
      }
    })

    tl.to(
      clipOutTarget,
      {
        clipPath: clipPathOut.closed,
        duration: ANIMATION_CONFIG.dualClip.duration / 1000,
        ease: ANIMATION_CONFIG.dualClip.ease,
        overwrite: true
      },
      0
    )

    tl.fromTo(
      clipInTarget,
      { clipPath: clipPathIn.closed },
      {
        clipPath: clipPathIn.open,
        duration: ANIMATION_CONFIG.dualClip.duration / 1000,
        ease: ANIMATION_CONFIG.dualClip.ease,
        overwrite: true
      },
      0
    )
  }

  /**
   * Animate aspect ratio change
   */
  const animateAspectRatio = (newAspectRatio: number): void => {
    const oldRatio = currentAspectRatio.value

    if (Math.abs(oldRatio - newAspectRatio) < 0.01) {
      log.debug('Aspect ratio unchanged, skipping animation')
      return
    }

    log.animationStart('aspect-ratio', ANIMATION_CONFIG.aspectRatio.duration, {
      from: oldRatio.toFixed(2),
      to: newAspectRatio.toFixed(2)
    })

    gsap.to(currentAspectRatio, {
      value: newAspectRatio,
      duration: ANIMATION_CONFIG.aspectRatio.duration / 1000,
      ease: ANIMATION_CONFIG.aspectRatio.ease,
      overwrite: true,
      onComplete: () => {
        log.animationComplete('aspect-ratio', ANIMATION_CONFIG.aspectRatio.duration)
      }
    })
  }

  /**
   * Handle first hover
   */
  const handleFirstHover = async (
    preview: PreviewData,
    cursor: CursorPosition,
    aspectRatio: number
  ): Promise<void> => {
    log.route('FIRST_HOVER', { image: preview.image })
    log.state('IDLE', 'REVEALING', { image: preview.image })

    const direction = resolveClipDirection(preview.itemIndex)
    currentClipDirection.value = direction

    currentImage.value = preview
    nextImage.value = preview
    currentImageActive.value = true
    previewMounted.value = true
    showPreview.value = true

    currentAspectRatio.value = aspectRatio

    await nextTick()

    const refs = getRefs()
    const validation = validateElements({
      currentImageWrapperRef: refs.currentImageWrapperRef,
      nextImageWrapperRef: refs.nextImageWrapperRef,
      previewContainerRef: refs.previewContainerRef,
      sectionRef: refs.sectionRef
    })

    log.refs({
      currentWrapper: !!refs.currentImageWrapperRef,
      nextWrapper: !!refs.nextImageWrapperRef,
      previewContainer: !!refs.previewContainerRef,
      section: !!refs.sectionRef
    })

    if (!validation.valid) {
      log.error('Missing refs after mount, aborting animation', { missing: validation.missing })
      return
    }

    setInitialPosition(refs, cursor)

    const clipPaths = ANIMATION_CONFIG.clipPath[direction]
    gsap.set(refs.currentImageWrapperRef, {
      opacity: 1,
      clipPath: clipPaths.closed
    })
    gsap.set(refs.nextImageWrapperRef, { opacity: 0 })

    animateClipReveal(refs.currentImageWrapperRef, direction, () => {
      log.state('REVEALING', 'VISIBLE')
    })
  }

  /**
   * Handle re-entry after leaving section
   */
  const handleReentry = async (
    preview: PreviewData,
    sameImage: boolean,
    aspectRatio: number
  ): Promise<void> => {
    log.route('RE_ENTRY', { image: preview.image, sameImage })
    log.state('IDLE', 'REVEALING', { image: preview.image, reentry: true })

    const direction = resolveClipDirection(preview.itemIndex)
    currentClipDirection.value = direction

    showPreview.value = true
    isTransitioning.value = true

    if (!sameImage) {
      if (currentImageActive.value) {
        nextImage.value = preview
      }
      else {
        currentImage.value = preview
      }
      animateAspectRatio(aspectRatio)
    }

    await nextTick()

    const refs = getRefs()
    const validation = validateElements({
      currentImageWrapperRef: refs.currentImageWrapperRef,
      nextImageWrapperRef: refs.nextImageWrapperRef
    })

    if (!validation.valid) {
      log.error('Missing refs on re-entry', { missing: validation.missing })
      isTransitioning.value = false
      return
    }

    const revealTarget = sameImage
      ? currentImageActive.value
        ? refs.currentImageWrapperRef
        : refs.nextImageWrapperRef
      : currentImageActive.value
        ? refs.nextImageWrapperRef
        : refs.currentImageWrapperRef

    const hideTarget = sameImage
      ? currentImageActive.value
        ? refs.nextImageWrapperRef
        : refs.currentImageWrapperRef
      : currentImageActive.value
        ? refs.currentImageWrapperRef
        : refs.nextImageWrapperRef

    gsap.set(hideTarget, { opacity: 0 })
    gsap.set(revealTarget, { opacity: 1 })

    animateClipReveal(revealTarget, direction, () => {
      if (!sameImage) {
        currentImageActive.value = !currentImageActive.value
        log.debug('Toggled active image', { newActive: currentImageActive.value })
      }
      isTransitioning.value = false
      log.state('REVEALING', 'VISIBLE')
    })
  }

  /**
   * Handle item switch with dual clip-path transition
   */
  const handleItemSwitch = async (preview: PreviewData, aspectRatio: number): Promise<void> => {
    log.route('ITEM_SWITCH', {
      from: currentImageActive.value
        ? currentImage.value?.image
        : nextImage.value?.image,
      to: preview.image
    })
    log.state('VISIBLE', 'TRANSITIONING', { image: preview.image })

    const newDirection = resolveClipDirection(preview.itemIndex)
    const oldDirection = currentClipDirection.value
    currentClipDirection.value = newDirection

    let refs = getRefs()

    if (refs.currentImageWrapperRef && refs.nextImageWrapperRef) {
      log.debug('Killing active tweens')
      gsap.killTweensOf([refs.currentImageWrapperRef, refs.nextImageWrapperRef])
    }

    if (isTransitioning.value) {
      log.raceCondition('Transition already in progress, forcing reset', {
        currentState: isTransitioning.value
      })
      isTransitioning.value = false
    }

    isTransitioning.value = true

    if (currentImageActive.value) {
      nextImage.value = preview
    }
    else {
      currentImage.value = preview
    }

    animateAspectRatio(aspectRatio)

    await nextTick()

    refs = getRefs()

    const validation = validateElements({
      currentImageWrapperRef: refs.currentImageWrapperRef,
      nextImageWrapperRef: refs.nextImageWrapperRef
    })

    if (!validation.valid) {
      log.error('Missing refs for item switch', { missing: validation.missing })
      isTransitioning.value = false
      return
    }

    const clipOutTarget = currentImageActive.value
      ? refs.currentImageWrapperRef
      : refs.nextImageWrapperRef

    const clipInTarget = currentImageActive.value
      ? refs.nextImageWrapperRef
      : refs.currentImageWrapperRef

    animateDualClip(clipOutTarget, clipInTarget, oldDirection, newDirection, () => {
      currentImageActive.value = !currentImageActive.value
      isTransitioning.value = false
      log.debug('Toggled active image', { newActive: currentImageActive.value })
      log.state('TRANSITIONING', 'VISIBLE')
    })
  }

  /**
   * Core clear logic (executed after debounce delay)
   */
  const executeClear = (): void => {
    // Don't execute if navigation is in progress - navigation handles its own clip animation
    if (isNavigating.value) {
      log.debug('Skipping debounced clear - navigation in progress')
      return
    }

    log.debug('Executing debounced clear', { delay: ANIMATION_CONFIG.debounce.clearDelay })
    resetPreviousItemIndex()

    isTransitioning.value = true
    log.state('VISIBLE', 'CLOSING')

    const refs = getRefs()
    const activeWrapper = currentImageActive.value
      ? refs.currentImageWrapperRef
      : refs.nextImageWrapperRef

    if (!activeWrapper) {
      log.warn('No active wrapper for clear, instant hide')
      showPreview.value = false
      isTransitioning.value = false
      log.state('CLOSING', 'IDLE')
      return
    }

    animateClipClose(activeWrapper, currentClipDirection.value, () => {
      showPreview.value = false
      isTransitioning.value = false
      log.state('CLOSING', 'IDLE')
    })
  }

  /**
   * Debounced clear using VueUse useTimeoutFn
   */
  const { start: startClearTimeout, stop: cancelClearTimeout } = useTimeoutFn(
    executeClear,
    ANIMATION_CONFIG.debounce.clearDelay,
    { immediate: false }
  )

  /**
   * Set active preview with smart routing
   */
  const setActivePreview = async (preview: PreviewData | null, cursor: CursorPosition): Promise<void> => {
    if (!preview) {
      log.warn('setActivePreview called with null preview')
      return
    }

    if (isNavigating.value) {
      log.debug('Navigation in progress, skipping hover')
      return
    }

    if (Date.now() < forceHideUntil.value) {
      log.debug('Force-hide block active, skipping hover', {
        blockedFor: forceHideUntil.value - Date.now() + 'ms'
      })
      return
    }

    log.separator(`HOVER: ${preview.image}`)
    cancelClearTimeout()
    log.debug('Cancelled pending clear timer', { wasScheduled: true })

    let aspectRatio = 4 / 3
    try {
      aspectRatio = await preloadImage(preview.image)
    }
    catch (error) {
      log.error('Image preload failed', {
        image: preview.image,
        error: error instanceof Error ? error.message : String(error)
      })
    }

    if (!currentImage.value && !nextImage.value) {
      return handleFirstHover(preview, cursor, aspectRatio)
    }

    const currentActiveImage = currentImageActive.value
      ? currentImage.value
      : nextImage.value
    const sameImage = currentActiveImage?.image === preview.image

    if (sameImage) {
      if (!showPreview.value) {
        log.route('SKIP', { reason: 'same image, re-entry', image: preview.image })
        return handleReentry(preview, true, aspectRatio)
      }
      log.route('SKIP', { reason: 'already showing', image: preview.image })
      return
    }

    if (!showPreview.value) {
      return handleReentry(preview, false, aspectRatio)
    }

    return handleItemSwitch(preview, aspectRatio)
  }

  /**
   * Clear active preview with debounce
   */
  const clearActivePreview = (): void => {
    // Don't start debounced clear if navigation is in progress
    if (isNavigating.value) {
      log.debug('Skipping clear - navigation in progress')
      return
    }

    log.separator('CLEAR')
    startClearTimeout()
    log.debug('Clear scheduled', { delay: ANIMATION_CONFIG.debounce.clearDelay })
  }

  /**
   * Clear active preview immediately (for navigation)
   * Animates the INNER wrapper with clip-path (same as hover mode)
   * Does NOT set showPreview = false to avoid Vue Transition opacity fade
   * Component unmounts naturally via navigation
   * @param onComplete - Optional callback when animation finishes (for navigation timing)
   */
  const clearActivePreviewImmediate = (onComplete?: () => void): void => {
    log.separator('CLEAR IMMEDIATE (Navigation)')

    isNavigating.value = true
    cancelClearTimeout()

    if (!showPreview.value) {
      log.debug('Preview already hidden, skipping')
      if (onComplete) onComplete()
      return
    }

    isTransitioning.value = true
    log.state('VISIBLE', 'CLOSING', { immediate: true })

    const refs = getRefs()

    // Animate the INNER wrapper (not container) - same pattern as executeClear
    // This keeps container opacity at 1, making clip animation visible
    // Vue Transition won't interfere because we don't set showPreview = false
    const activeWrapper = currentImageActive.value
      ? refs.currentImageWrapperRef
      : refs.nextImageWrapperRef

    if (!activeWrapper) {
      log.warn('No active wrapper for immediate clear')
      // Don't set showPreview = false - let navigation unmount naturally
      isTransitioning.value = false
      if (onComplete) onComplete()
      return
    }

    animateClipClose(activeWrapper, currentClipDirection.value, () => {
      // DON'T set showPreview = false here!
      // Let navigation unmount the component naturally
      // This prevents Vue Transition from fading and masking our clip animation
      isTransitioning.value = false
      log.state('CLOSING', 'IDLE')
      if (onComplete) onComplete()
    })
  }

  /**
   * Clear active preview instantly (for scroll triggers)
   */
  const clearActivePreviewInstant = (): void => {
    // Don't execute if navigation is in progress
    if (isNavigating.value) {
      log.debug('Skipping instant clear - navigation in progress')
      return
    }

    log.separator('CLEAR INSTANT (Scroll)')

    cancelClearTimeout()

    if (!showPreview.value) {
      log.debug('Preview already hidden, skipping')
      return
    }

    isTransitioning.value = true
    log.state('VISIBLE', 'CLOSING', { scroll: true })

    const refs = getRefs()
    const activeWrapper = currentImageActive.value
      ? refs.currentImageWrapperRef
      : refs.nextImageWrapperRef

    if (!activeWrapper) {
      log.warn('No active wrapper for scroll clear, immediate hide')
      showPreview.value = false
      isTransitioning.value = false
      log.state('CLOSING', 'IDLE')
      return
    }

    animateClipClose(activeWrapper, currentClipDirection.value, () => {
      showPreview.value = false
      isTransitioning.value = false
      log.state('CLOSING', 'IDLE')
    })

    forceHideUntil.value = Date.now() + 100
  }

  return {
    currentImage,
    nextImage,
    showPreview,
    previewMounted,
    currentImageActive,
    currentAspectRatio,
    isNavigating,
    setActivePreview,
    clearActivePreview,
    clearActivePreviewImmediate,
    clearActivePreviewInstant,
    calculatePosition,
    animationConfig: ANIMATION_CONFIG
  }
}
