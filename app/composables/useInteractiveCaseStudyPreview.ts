/**
 * Interactive Case Study Preview Composable
 *
 * Manages state and animations for the cursor-following preview system.
 * Uses a 3-slot carousel for robust image transitions without glitches.
 *
 * Architecture:
 * - 3 image wrapper slots (A, B, C) that cycle
 * - Always animate INTO a fresh slot, never animate an active element
 * - Slot lifecycle: hidden → animating-in → active → animating-out → hidden
 * - This prevents race conditions when rapidly switching items
 *
 * Features:
 * - 3-slot carousel (no animation conflicts)
 * - Clip-path reveal/close animations
 * - Image preloading with caching
 * - Direction-aware animations (top/bottom based on list movement)
 * - Velocity-based settling for fast cursor movement
 */

import type { Ref } from 'vue'
import { ref, nextTick } from 'vue'
import { createPreviewLogger } from '~/utils/logger'
import { calculatePreviewPosition } from '~/utils/previewPosition'

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
  kill: () => void
}

interface GSAPTimeline {
  to: (targets: unknown, vars: Record<string, unknown>, position?: number | string) => GSAPTimeline
  fromTo: (targets: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown>, position?: number | string) => GSAPTimeline
  kill: () => void
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

// 3-slot system refs
interface TemplateRefs {
  previewContainerRef: HTMLElement | null
  sectionRef: HTMLElement | null
  slotARefs: HTMLElement | null
  slotBRefs: HTMLElement | null
  slotCRefs: HTMLElement | null
}

interface PreloadedImage {
  img: HTMLImageElement
  aspectRatio: number
}

type ClipDirection = 'top' | 'bottom'
type SlotId = 'A' | 'B' | 'C'

// Slot state tracking
interface SlotState {
  image: PreviewData | null
  status: 'hidden' | 'animating-in' | 'active' | 'animating-out'
}

interface AnimationConfig {
  clipReveal: { duration: number, ease: string }
  clipClose: { duration: number, ease: string }
  aspectRatio: { duration: number, ease: string }
  clipPath: Record<ClipDirection, { closed: string, open: string }>
  position: { offsetX: number, padding: number }
  debounce: { clearDelay: number }
}

export interface InteractiveCaseStudyPreviewReturn {
  // Slot images for template binding
  slotAImage: Ref<PreviewData | null>
  slotBImage: Ref<PreviewData | null>
  slotCImage: Ref<PreviewData | null>
  showPreview: Ref<boolean>
  previewMounted: Ref<boolean>
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
    duration: 450,
    ease: 'power2.out'
  },
  clipClose: {
    duration: 400,
    ease: 'power2.in'
  },
  aspectRatio: {
    duration: 500,
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
 */
let previousItemIndex: number | null = null

/**
 * Module-level velocity tracking state
 */
let lastCursorX = 0
let lastCursorY = 0
let lastCursorTime = 0
let currentVelocity = 0
let settleCheckInterval: ReturnType<typeof setInterval> | null = null
let pendingTarget: { preview: PreviewData, aspectRatio: number } | null = null

const VELOCITY_THRESHOLD = 8

/**
 * Resolve clip direction based on movement direction in list
 */
const resolveClipDirection = (currentIndex: number): ClipDirection => {
  const prev = previousItemIndex
  previousItemIndex = currentIndex
  if (prev === null || currentIndex >= prev) {
    return 'top'
  }
  return 'bottom'
}

const resetPreviousItemIndex = (): void => {
  previousItemIndex = null
}

/**
 * Track cursor velocity for settle detection
 */
const trackVelocity = (cursor: CursorPosition): number => {
  const now = performance.now()
  const dt = now - lastCursorTime

  if (dt > 0 && dt < 100) {
    const dx = cursor.x - lastCursorX
    const dy = cursor.y - lastCursorY
    currentVelocity = (Math.sqrt(dx * dx + dy * dy) / dt) * 16
  }
  else {
    currentVelocity = 0
  }

  lastCursorX = cursor.x
  lastCursorY = cursor.y
  lastCursorTime = now

  return currentVelocity
}

const stopSettleCheck = (): void => {
  if (settleCheckInterval) {
    clearInterval(settleCheckInterval)
    settleCheckInterval = null
  }
}

const resetVelocityState = (): void => {
  stopSettleCheck()
  pendingTarget = null
  currentVelocity = 0
}

interface ComposableOptions {
  gsap: GSAPInstance
  getRefs: () => TemplateRefs
  getCursor?: () => { x: number, y: number }
}

export const useInteractiveCaseStudyPreview = ({ gsap, getRefs, getCursor }: ComposableOptions): InteractiveCaseStudyPreviewReturn => {
  const log = createPreviewLogger()

  // 3-slot image state
  const slotAImage = ref<PreviewData | null>(null)
  const slotBImage = ref<PreviewData | null>(null)
  const slotCImage = ref<PreviewData | null>(null)

  // Slot status tracking
  const slotStates = ref<Record<SlotId, SlotState>>({
    A: { image: null, status: 'hidden' },
    B: { image: null, status: 'hidden' },
    C: { image: null, status: 'hidden' }
  })

  // Which slot is currently active (fully visible)
  const activeSlot = ref<SlotId | null>(null)

  // Track current clip direction for close animations
  const currentClipDirection = ref<ClipDirection>('top')

  // Active animation timeline (so we can kill it if needed)
  let activeTimeline: GSAPTimeline | null = null

  // Track aspect ratio tween separately to prevent race conditions
  let aspectRatioTween: GSAPTween | null = null

  const showPreview = ref(false)
  const previewMounted = ref(false)
  const preloadedImages = new Map<string, PreloadedImage>()
  const currentAspectRatio = ref(4 / 3)
  const isNavigating = ref(false)
  const forceHideUntil = ref(0)

  // Forward declaration for settle check
  let startSettleCheck: () => void

  /**
   * Get the image ref for a slot
   */
  const getSlotImageRef = (slot: SlotId): Ref<PreviewData | null> => {
    switch (slot) {
      case 'A': return slotAImage
      case 'B': return slotBImage
      case 'C': return slotCImage
    }
  }

  /**
   * Get the DOM element for a slot
   */
  const getSlotElement = (slot: SlotId): HTMLElement | null => {
    const refs = getRefs()
    switch (slot) {
      case 'A': return refs.slotARefs
      case 'B': return refs.slotBRefs
      case 'C': return refs.slotCRefs
    }
  }

  /**
   * Find the next available slot for animation
   * Priority: hidden > animating-out > oldest non-active
   */
  const findAvailableSlot = (): SlotId => {
    const slots: SlotId[] = ['A', 'B', 'C']

    // First: prefer completely hidden slots
    for (const slot of slots) {
      if (slotStates.value[slot].status === 'hidden') {
        return slot
      }
    }

    // Second: prefer slots that are animating out (they'll be hidden soon)
    for (const slot of slots) {
      if (slotStates.value[slot].status === 'animating-out') {
        return slot
      }
    }

    // Third: use any non-active slot
    for (const slot of slots) {
      if (slot !== activeSlot.value) {
        return slot
      }
    }

    // Fallback: cycle from current active
    const currentActive = activeSlot.value || 'A'
    const nextSlot: Record<SlotId, SlotId> = { A: 'B', B: 'C', C: 'A' }
    return nextSlot[currentActive]
  }

  /**
   * Reset a slot to hidden state
   */
  const resetSlot = (slot: SlotId): void => {
    // Guard: Don't reset if slot was reused for a new animation
    const status = slotStates.value[slot].status
    if (status === 'animating-in' || status === 'active') {
      return // Slot is in use, skip reset
    }

    const element = getSlotElement(slot)
    if (element) {
      gsap.killTweensOf(element)
      gsap.set(element, {
        opacity: 0,
        clipPath: 'inset(0% 0% 100% 0%)',
        zIndex: 0
      })
    }
    slotStates.value[slot] = { image: null, status: 'hidden' }
    getSlotImageRef(slot).value = null
  }

  /**
   * Force-reset a slot regardless of status (for cleanup)
   */
  const forceResetSlot = (slot: SlotId): void => {
    const element = getSlotElement(slot)
    if (element) {
      gsap.killTweensOf(element)
      gsap.set(element, {
        opacity: 0,
        clipPath: 'inset(0% 0% 100% 0%)',
        zIndex: 0
      })
    }
    slotStates.value[slot] = { image: null, status: 'hidden' }
    getSlotImageRef(slot).value = null
  }

  /**
   * Preload image for instant display on hover
   */
  const preloadImage = (src: string): Promise<number> => {
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
        const aspectRatio = img.naturalWidth / img.naturalHeight
        preloadedImages.set(src, { img, aspectRatio })
        log.preload('cached', src)
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
    return calculatePreviewPosition({
      cursorX: cursor.x,
      cursorY: cursor.y,
      sectionRect,
      previewRect,
      offsetX: ANIMATION_CONFIG.position.offsetX,
      padding: ANIMATION_CONFIG.position.padding,
      centerY: true
    })
  }

  /**
   * Set initial position without animation
   */
  const setInitialPosition = (refs: TemplateRefs, cursor: CursorPosition): void => {
    if (!refs.previewContainerRef || !refs.sectionRef) return

    const sectionRect = refs.sectionRef.getBoundingClientRect()
    const previewRect = refs.previewContainerRef.getBoundingClientRect()
    const position = calculatePosition(cursor, sectionRect, previewRect)

    gsap.set(refs.previewContainerRef, {
      x: position.x,
      y: position.y,
      xPercent: 0,
      yPercent: 0
    })
  }

  /**
   * Animate aspect ratio change
   */
  const animateAspectRatio = (newAspectRatio: number): void => {
    const oldRatio = currentAspectRatio.value
    if (Math.abs(oldRatio - newAspectRatio) < 0.01) return

    // Kill any existing aspect ratio animation
    if (aspectRatioTween) {
      aspectRatioTween.kill()
    }

    aspectRatioTween = gsap.to(currentAspectRatio, {
      value: newAspectRatio,
      duration: ANIMATION_CONFIG.aspectRatio.duration / 1000,
      ease: ANIMATION_CONFIG.aspectRatio.ease,
      overwrite: true,
      onComplete: () => {
        aspectRatioTween = null
      }
    })
  }

  /**
   * Handle first hover - reveal a slot
   */
  const handleFirstHover = async (
    preview: PreviewData,
    cursor: CursorPosition,
    aspectRatio: number
  ): Promise<void> => {
    log.route('FIRST_HOVER', { image: preview.image })

    const direction = resolveClipDirection(preview.itemIndex)
    currentClipDirection.value = direction

    // Use slot A for first hover
    const slot: SlotId = 'A'
    slotAImage.value = preview
    slotStates.value[slot] = { image: preview, status: 'animating-in' }
    activeSlot.value = slot

    previewMounted.value = true
    showPreview.value = true
    currentAspectRatio.value = aspectRatio

    await nextTick()

    const refs = getRefs()
    const element = getSlotElement(slot)

    if (!element || !refs.previewContainerRef) {
      log.error('Missing refs for first hover')
      return
    }

    setInitialPosition(refs, cursor)

    // Force reset all other slots
    forceResetSlot('B')
    forceResetSlot('C')

    const clipPaths = ANIMATION_CONFIG.clipPath[direction]
    gsap.set(element, {
      opacity: 1,
      clipPath: clipPaths.closed,
      zIndex: 1
    })

    activeTimeline = gsap.timeline({
      onComplete: () => {
        slotStates.value[slot].status = 'active'
        activeTimeline = null
        log.state('REVEALING', 'VISIBLE')
      }
    })

    activeTimeline.to(element, {
      clipPath: clipPaths.open,
      duration: ANIMATION_CONFIG.clipReveal.duration / 1000,
      ease: ANIMATION_CONFIG.clipReveal.ease
    })
  }

  /**
   * Handle image switch - animate new slot in, old slot out
   */
  const handleImageSwitch = async (preview: PreviewData, aspectRatio: number): Promise<void> => {
    log.route('IMAGE_SWITCH', { to: preview.image })

    const direction = resolveClipDirection(preview.itemIndex)
    const oldDirection = currentClipDirection.value
    currentClipDirection.value = direction

    // Kill any active animation
    if (activeTimeline) {
      activeTimeline.kill()
      activeTimeline = null
    }

    // Kill aspect ratio tween to ensure clean state for new animation
    if (aspectRatioTween) {
      aspectRatioTween.kill()
      aspectRatioTween = null
    }

    // Determine old slot BEFORE any cleanup
    const oldSlot = activeSlot.value

    // Clean up any slots in intermediate states (animating-in, animating-out)
    // This handles the case where a previous animation was killed mid-way
    const slots: SlotId[] = ['A', 'B', 'C']
    for (const slot of slots) {
      const status = slotStates.value[slot].status
      if (status === 'animating-in' || status === 'animating-out') {
        if (slot !== oldSlot) {
          // Not the current active slot, force reset it
          forceResetSlot(slot)
        }
      }
    }

    // Find available slot for new image
    const newSlot = findAvailableSlot()

    log.debug(`Switching: ${oldSlot} → ${newSlot}`)

    // IMMEDIATELY update activeSlot - don't wait for onComplete
    activeSlot.value = newSlot

    // Set up new slot
    const newImageRef = getSlotImageRef(newSlot)
    newImageRef.value = preview
    slotStates.value[newSlot] = { image: preview, status: 'animating-in' }

    // Mark old slot as animating out
    if (oldSlot && oldSlot !== newSlot) {
      slotStates.value[oldSlot].status = 'animating-out'
    }

    // Animate aspect ratio smoothly
    animateAspectRatio(aspectRatio)

    await nextTick()

    const newElement = getSlotElement(newSlot)
    const oldElement = (oldSlot && oldSlot !== newSlot) ? getSlotElement(oldSlot) : null

    if (!newElement) {
      log.error('Missing new slot element')
      return
    }

    // Kill any tweens on these elements
    gsap.killTweensOf(newElement)
    if (oldElement) {
      gsap.killTweensOf(oldElement)
    }

    // Reset z-index on ALL slots first, then set proper values
    for (const slot of slots) {
      const el = getSlotElement(slot)
      if (el && slot !== newSlot && slot !== oldSlot) {
        gsap.set(el, { zIndex: 0 })
      }
    }

    // Set up new element - ALWAYS start from closed state
    const clipPathsIn = ANIMATION_CONFIG.clipPath[direction]
    gsap.set(newElement, {
      opacity: 1,
      clipPath: clipPathsIn.closed,
      zIndex: 2 // New element on top
    })

    // Set old element z-index lower
    if (oldElement) {
      gsap.set(oldElement, { zIndex: 1 })
    }

    // Capture slots for onComplete (closure safety)
    const capturedNewSlot = newSlot
    const capturedOldSlot = oldSlot

    // Create timeline for synchronized animation
    activeTimeline = gsap.timeline({
      onComplete: () => {
        // Mark new slot as fully active
        slotStates.value[capturedNewSlot].status = 'active'

        // Reset old slot completely (guard will allow since status is animating-out)
        if (capturedOldSlot && capturedOldSlot !== capturedNewSlot) {
          forceResetSlot(capturedOldSlot)
        }

        activeTimeline = null
        log.state('TRANSITIONING', 'VISIBLE')
      }
    })

    // Animate new element in
    activeTimeline.to(newElement, {
      clipPath: clipPathsIn.open,
      duration: ANIMATION_CONFIG.clipReveal.duration / 1000,
      ease: ANIMATION_CONFIG.clipReveal.ease
    }, 0)

    // Animate old element out (if exists)
    if (oldElement) {
      const clipPathsOut = ANIMATION_CONFIG.clipPath[oldDirection]
      activeTimeline.to(oldElement, {
        clipPath: clipPathsOut.closed,
        duration: ANIMATION_CONFIG.clipClose.duration / 1000,
        ease: ANIMATION_CONFIG.clipClose.ease
      }, 0)
    }
  }

  /**
   * Handle re-entry after preview was hidden
   */
  const handleReentry = async (
    preview: PreviewData,
    aspectRatio: number
  ): Promise<void> => {
    log.route('RE_ENTRY', { image: preview.image })

    // Kill any active animation first
    if (activeTimeline) {
      activeTimeline.kill()
      activeTimeline = null
    }

    // Kill aspect ratio tween
    if (aspectRatioTween) {
      aspectRatioTween.kill()
      aspectRatioTween = null
    }

    const direction = resolveClipDirection(preview.itemIndex)
    currentClipDirection.value = direction

    showPreview.value = true

    // Clean up any slots in intermediate states
    const slots: SlotId[] = ['A', 'B', 'C']
    for (const slot of slots) {
      const status = slotStates.value[slot].status
      if (status === 'animating-in' || status === 'animating-out') {
        if (slot !== activeSlot.value) {
          forceResetSlot(slot)
        }
      }
    }

    // Check if we can reuse active slot (same image)
    if (activeSlot.value) {
      const activeImage = getSlotImageRef(activeSlot.value).value
      if (activeImage?.image === preview.image) {
        // Same image - just reveal the existing slot
        const element = getSlotElement(activeSlot.value)
        if (element) {
          slotStates.value[activeSlot.value].status = 'animating-in'

          // Animate aspect ratio smoothly
          animateAspectRatio(aspectRatio)

          const clipPaths = ANIMATION_CONFIG.clipPath[direction]
          gsap.set(element, {
            opacity: 1,
            clipPath: clipPaths.closed,
            zIndex: 1
          })

          const capturedSlot = activeSlot.value
          activeTimeline = gsap.timeline({
            onComplete: () => {
              slotStates.value[capturedSlot].status = 'active'
              activeTimeline = null
            }
          })

          activeTimeline.to(element, {
            clipPath: clipPaths.open,
            duration: ANIMATION_CONFIG.clipReveal.duration / 1000,
            ease: ANIMATION_CONFIG.clipReveal.ease
          })

          return
        }
      }
    }

    // Different image or no active slot - do full switch
    await handleImageSwitch(preview, aspectRatio)
  }

  /**
   * Start settle detection interval
   */
  startSettleCheck = (): void => {
    if (settleCheckInterval) return

    settleCheckInterval = setInterval(() => {
      const timeSinceMove = performance.now() - lastCursorTime
      if (timeSinceMove > 80) {
        currentVelocity = 0
      }

      if (currentVelocity < VELOCITY_THRESHOLD && pendingTarget) {
        const { preview, aspectRatio } = pendingTarget
        pendingTarget = null
        stopSettleCheck()

        log.debug(`🎯 [SETTLE] User settled, switching to: ${preview.image}`)
        handleImageSwitch(preview, aspectRatio)
      }
    }, 50)
  }

  /**
   * Core clear logic (executed after debounce delay)
   */
  const executeClear = (): void => {
    if (isNavigating.value) {
      log.debug('Skipping debounced clear - navigation in progress')
      return
    }

    // Check if cursor is still over a case study item
    if (getCursor) {
      const cursor = getCursor()
      const elementUnderCursor = document.elementFromPoint(cursor.x, cursor.y)
      const isOverItem = elementUnderCursor?.closest('.case-study-item')
      if (isOverItem) {
        log.debug('Skipping clear - cursor still over item (scroll scenario)')
        return
      }
    }

    log.debug('Executing debounced clear')
    resetPreviousItemIndex()
    resetVelocityState()

    if (!activeSlot.value) {
      showPreview.value = false
      return
    }

    const element = getSlotElement(activeSlot.value)
    if (!element) {
      showPreview.value = false
      return
    }

    slotStates.value[activeSlot.value].status = 'animating-out'

    const clipPaths = ANIMATION_CONFIG.clipPath[currentClipDirection.value]

    if (activeTimeline) {
      activeTimeline.kill()
    }

    activeTimeline = gsap.timeline({
      onComplete: () => {
        // Reset all slots
        resetSlot('A')
        resetSlot('B')
        resetSlot('C')
        activeSlot.value = null
        showPreview.value = false
        activeTimeline = null
        log.state('CLOSING', 'IDLE')
      }
    })

    activeTimeline.to(element, {
      clipPath: clipPaths.closed,
      duration: ANIMATION_CONFIG.clipClose.duration / 1000,
      ease: ANIMATION_CONFIG.clipClose.ease
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
    if (!preview) return

    if (isNavigating.value) {
      log.debug('Navigation in progress, skipping hover')
      return
    }

    if (Date.now() < forceHideUntil.value) {
      log.debug('Force-hide block active, skipping hover')
      return
    }

    const velocity = trackVelocity(cursor)

    log.separator(`HOVER: ${preview.image}`)
    cancelClearTimeout()

    let aspectRatio = 4 / 3
    try {
      aspectRatio = await preloadImage(preview.image)
    }
    catch (error) {
      log.error('Image preload failed', { image: preview.image })
    }

    // First hover - no active slot yet
    if (!activeSlot.value) {
      return handleFirstHover(preview, cursor, aspectRatio)
    }

    // Check if same image
    const currentActiveImage = getSlotImageRef(activeSlot.value).value
    const sameImage = currentActiveImage?.image === preview.image

    if (sameImage) {
      pendingTarget = null
      if (!showPreview.value) {
        return handleReentry(preview, aspectRatio)
      }
      log.route('SKIP', { reason: 'already showing', image: preview.image })
      return
    }

    // Re-entry from hidden state
    if (!showPreview.value) {
      return handleReentry(preview, aspectRatio)
    }

    // Velocity-based routing for switches
    if (velocity >= VELOCITY_THRESHOLD) {
      pendingTarget = { preview, aspectRatio }
      startSettleCheck()
      log.debug(`🎯 [SETTLE] Fast movement, queueing: ${preview.image}`)
      return
    }

    pendingTarget = null
    return handleImageSwitch(preview, aspectRatio)
  }

  /**
   * Clear active preview with debounce
   */
  const clearActivePreview = (): void => {
    if (isNavigating.value) {
      log.debug('Skipping clear - navigation in progress')
      return
    }

    log.separator('CLEAR')
    startClearTimeout()
  }

  /**
   * Clear active preview immediately (for navigation)
   */
  const clearActivePreviewImmediate = (onComplete?: () => void): void => {
    log.separator('CLEAR IMMEDIATE (Navigation)')

    isNavigating.value = true
    cancelClearTimeout()
    resetVelocityState()

    if (!showPreview.value || !activeSlot.value) {
      if (onComplete) onComplete()
      return
    }

    const element = getSlotElement(activeSlot.value)
    if (!element) {
      if (onComplete) onComplete()
      return
    }

    if (activeTimeline) {
      activeTimeline.kill()
    }

    const clipPaths = ANIMATION_CONFIG.clipPath[currentClipDirection.value]

    activeTimeline = gsap.timeline({
      onComplete: () => {
        activeTimeline = null
        if (onComplete) onComplete()
      }
    })

    activeTimeline.to(element, {
      clipPath: clipPaths.closed,
      duration: ANIMATION_CONFIG.clipClose.duration / 1000,
      ease: ANIMATION_CONFIG.clipClose.ease
    })
  }

  /**
   * Clear active preview instantly (for scroll triggers)
   */
  const clearActivePreviewInstant = (): void => {
    if (isNavigating.value) {
      log.debug('Skipping instant clear - navigation in progress')
      return
    }

    log.separator('CLEAR INSTANT (Scroll)')

    cancelClearTimeout()
    resetVelocityState()

    if (!showPreview.value || !activeSlot.value) return

    const element = getSlotElement(activeSlot.value)
    if (!element) {
      showPreview.value = false
      return
    }

    if (activeTimeline) {
      activeTimeline.kill()
    }

    const clipPaths = ANIMATION_CONFIG.clipPath[currentClipDirection.value]

    activeTimeline = gsap.timeline({
      onComplete: () => {
        resetSlot('A')
        resetSlot('B')
        resetSlot('C')
        activeSlot.value = null
        showPreview.value = false
        activeTimeline = null
      }
    })

    activeTimeline.to(element, {
      clipPath: clipPaths.closed,
      duration: ANIMATION_CONFIG.clipClose.duration / 1000,
      ease: ANIMATION_CONFIG.clipClose.ease
    })

    forceHideUntil.value = Date.now() + 100
  }

  return {
    slotAImage,
    slotBImage,
    slotCImage,
    showPreview,
    previewMounted,
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
