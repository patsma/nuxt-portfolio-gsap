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
  progress: (value?: number) => GSAPTimeline | number
}

export interface PreviewData {
  image: string
  imageAlt?: string
  itemIndex: number
  slideshowImages?: string[]
  slideshowImageAlts?: string[]
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

type ClipDirection = 'top' | 'bottom' | 'left'
type SlotId = 'A' | 'B' | 'C'

// Slot state tracking
interface SlotState {
  image: PreviewData | null
  status: 'hidden' | 'animating-in' | 'active' | 'animating-out'
}

interface AnimationConfig {
  clipReveal: { duration: number, ease: string }
  clipClose: { duration: number, ease: string }
  clipPath: Record<ClipDirection, { closed: string, open: string }>
  position: { offsetX: number, padding: number }
  debounce: { clearDelay: number }
  slideshow: { delay: number, interval: number, revealDuration: number }
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
  cleanupAfterFade: () => void
  calculatePosition: (cursor: CursorPosition, sectionRect: DOMRect, previewRect: DOMRect) => ReturnType<typeof calculatePreviewPosition>
  animationConfig: AnimationConfig
}

/**
 * Animation configuration constants
 */
const ANIMATION_CONFIG: AnimationConfig = {
  clipReveal: {
    duration: 600,
    ease: 'power2.out'
  },
  clipClose: {
    duration: 500,
    ease: 'power2.in'
  },
  clipPath: {
    top: {
      closed: 'inset(0% 0% 100% 0%)',
      open: 'inset(0% 0% 0% 0%)'
    },
    bottom: {
      closed: 'inset(100% 0% 0% 0%)',
      open: 'inset(0% 0% 0% 0%)'
    },
    left: {
      closed: 'inset(0% 100% 0% 0%)',
      open: 'inset(0% 0% 0% 0%)'
    }
  },
  position: {
    offsetX: 30,
    padding: 20
  },
  debounce: {
    clearDelay: 100
  },
  slideshow: {
    delay: 500, // 0.5s before starting
    interval: 2000, // 2s between images
    revealDuration: 600 // Clip animation duration
  }
}

/**
 * Module-level previous index for direction calculation
 */
let previousItemIndex: number | null = null

/**
 * Spring physics state for aspect ratio animation
 * Uses same model as CursorTrail and useMagnetic
 */
const aspectSpring = {
  position: 4 / 3,
  velocity: 0,
  target: 4 / 3
}

let aspectSpringFrame: number | null = null

const ASPECT_SPRING_CONFIG = {
  stiffness: 0.08, // Floaty, relaxed response
  friction: 0.68 // Pronounced overshoot/bounce
}

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
 * Module-level slideshow state
 * Manages timed cycling through additional images
 */
let slideshowDelayTimer: ReturnType<typeof setTimeout> | null = null
let slideshowIntervalTimer: ReturnType<typeof setInterval> | null = null
let currentSlideshowImages: PreviewData[] = []
let currentSlideshowIndex = 0
let isSlideshowActive = false

/**
 * Clear all slideshow timers and reset state
 */
const clearSlideshowTimers = (): void => {
  if (slideshowDelayTimer) {
    clearTimeout(slideshowDelayTimer)
    slideshowDelayTimer = null
  }
  if (slideshowIntervalTimer) {
    clearInterval(slideshowIntervalTimer)
    slideshowIntervalTimer = null
  }
  isSlideshowActive = false
  currentSlideshowIndex = 0
  currentSlideshowImages = []
}

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

  const showPreview = ref(false)
  const previewMounted = ref(false)
  const preloadedImages = new Map<string, PreloadedImage>()
  const currentAspectRatio = ref(4 / 3)
  const isNavigating = ref(false)
  const forceHideUntil = ref(0)

  // startSettleCheck is defined later - see line 746

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
   * Cancel aspect ratio spring animation
   */
  const cancelAspectSpring = (): void => {
    if (aspectSpringFrame !== null) {
      cancelAnimationFrame(aspectSpringFrame)
      aspectSpringFrame = null
    }
  }

  /**
   * Animate aspect ratio using spring physics
   * Matches CursorTrail.vue / useMagnetic.ts pattern
   */
  const animateAspectRatio = (newAspectRatio: number): void => {
    aspectSpring.target = newAspectRatio

    // Don't restart if already running
    if (aspectSpringFrame !== null) return

    const runSpring = () => {
      // Spring force toward target
      const force = (aspectSpring.target - aspectSpring.position) * ASPECT_SPRING_CONFIG.stiffness
      aspectSpring.velocity += force

      // Friction/damping
      aspectSpring.velocity *= ASPECT_SPRING_CONFIG.friction

      // Update position
      aspectSpring.position += aspectSpring.velocity

      // Apply to ref
      currentAspectRatio.value = aspectSpring.position

      // Continue if still moving (threshold for settling)
      const isMoving = Math.abs(aspectSpring.velocity) > 0.0001
        || Math.abs(aspectSpring.target - aspectSpring.position) > 0.001

      if (isMoving) {
        aspectSpringFrame = requestAnimationFrame(runSpring)
      }
      else {
        // Snap to target when settled
        aspectSpring.position = aspectSpring.target
        currentAspectRatio.value = aspectSpring.target
        aspectSpringFrame = null
      }
    }

    aspectSpringFrame = requestAnimationFrame(runSpring)
  }

  /**
   * Handle slideshow image transition
   * Uses LEFT clip direction for left-to-right reveal effect
   */
  const handleSlideshowTransition = async (): Promise<void> => {
    if (!isSlideshowActive || currentSlideshowImages.length === 0) return

    // Increment index (loops back to 0)
    currentSlideshowIndex = (currentSlideshowIndex + 1) % currentSlideshowImages.length
    const nextImage = currentSlideshowImages[currentSlideshowIndex]

    log.debug(`🎬 [SLIDESHOW] Transitioning to image ${currentSlideshowIndex}: ${nextImage.image}`)

    // Preload image and get aspect ratio
    let aspectRatio = 4 / 3
    try {
      aspectRatio = await preloadImage(nextImage.image)
    }
    catch {
      log.error('Slideshow image preload failed', { image: nextImage.image })
    }

    // Kill any active animation
    if (activeTimeline) {
      activeTimeline.kill()
      activeTimeline = null
    }

    // Determine old slot BEFORE cleanup
    const oldSlot = activeSlot.value

    // Clean up any slots in intermediate states
    const slots: SlotId[] = ['A', 'B', 'C']
    for (const slot of slots) {
      const status = slotStates.value[slot].status
      if (status === 'animating-in' || status === 'animating-out') {
        if (slot !== oldSlot) {
          forceResetSlot(slot)
        }
      }
    }

    // Find available slot for new image
    const newSlot = findAvailableSlot()

    log.debug(`[SLIDESHOW] Switching: ${oldSlot} → ${newSlot}`)

    // IMMEDIATELY update activeSlot
    activeSlot.value = newSlot

    // Set up new slot with slideshow image
    const newImageRef = getSlotImageRef(newSlot)
    newImageRef.value = nextImage
    slotStates.value[newSlot] = { image: nextImage, status: 'animating-in' }

    // Mark old slot as animating out
    if (oldSlot && oldSlot !== newSlot) {
      slotStates.value[oldSlot].status = 'animating-out'
    }

    // Animate aspect ratio smoothly (spring physics)
    animateAspectRatio(aspectRatio)

    await nextTick()

    const newElement = getSlotElement(newSlot)
    const oldElement = (oldSlot && oldSlot !== newSlot) ? getSlotElement(oldSlot) : null

    if (!newElement) {
      log.error('Missing new slot element for slideshow')
      return
    }

    // Kill any tweens on these elements
    gsap.killTweensOf(newElement)
    if (oldElement) {
      gsap.killTweensOf(oldElement)
    }

    // Reset z-index on ALL slots first
    for (const slot of slots) {
      const el = getSlotElement(slot)
      if (el && slot !== newSlot && slot !== oldSlot) {
        gsap.set(el, { zIndex: 0 })
      }
    }

    // Use LEFT clip direction for slideshow (left-to-right reveal)
    const clipPathsIn = ANIMATION_CONFIG.clipPath.left
    gsap.set(newElement, {
      opacity: 1,
      clipPath: clipPathsIn.closed,
      zIndex: 2
    })

    // Set old element z-index lower
    if (oldElement) {
      gsap.set(oldElement, { zIndex: 1 })
    }

    // Capture slots for onComplete closure
    const capturedNewSlot = newSlot
    const capturedOldSlot = oldSlot

    // Create timeline for synchronized animation
    activeTimeline = gsap.timeline({
      onComplete: () => {
        slotStates.value[capturedNewSlot].status = 'active'
        if (capturedOldSlot && capturedOldSlot !== capturedNewSlot) {
          forceResetSlot(capturedOldSlot)
        }
        activeTimeline = null
      }
    })

    // Animate new element in with slideshow duration
    activeTimeline.to(newElement, {
      clipPath: clipPathsIn.open,
      duration: ANIMATION_CONFIG.slideshow.revealDuration / 1000,
      ease: ANIMATION_CONFIG.clipReveal.ease
    }, 0)

    // Animate old element out (same direction for consistency)
    if (oldElement) {
      const clipPathsOut = ANIMATION_CONFIG.clipPath.left
      activeTimeline.to(oldElement, {
        clipPath: clipPathsOut.closed,
        duration: ANIMATION_CONFIG.clipClose.duration / 1000,
        ease: ANIMATION_CONFIG.clipClose.ease
      }, 0)
    }
  }

  /**
   * Start slideshow timer after initial reveal completes
   * Builds array of all images and starts cycling after delay
   */
  const startSlideshowTimer = (preview: PreviewData): void => {
    // Clear any existing slideshow timers
    clearSlideshowTimers()

    // Check if there are slideshow images
    if (!preview.slideshowImages || preview.slideshowImages.length === 0) {
      return
    }

    // Build array of all images (main image + slideshow images)
    currentSlideshowImages = [
      { image: preview.image, imageAlt: preview.imageAlt, itemIndex: preview.itemIndex },
      ...preview.slideshowImages.map((img, i) => ({
        image: img,
        imageAlt: preview.slideshowImageAlts?.[i] || '',
        itemIndex: preview.itemIndex
      }))
    ]

    log.debug(`🎬 [SLIDESHOW] Starting with ${currentSlideshowImages.length} images`)

    // Preload slideshow images in background
    preview.slideshowImages.forEach((img) => {
      preloadImage(img).catch(() => {
        log.error('Failed to preload slideshow image', { image: img })
      })
    })

    // Start delay timer (1 second before first transition)
    slideshowDelayTimer = setTimeout(() => {
      isSlideshowActive = true
      currentSlideshowIndex = 0

      // Start the interval for cycling
      slideshowIntervalTimer = setInterval(() => {
        handleSlideshowTransition()
      }, ANIMATION_CONFIG.slideshow.interval)

      // Trigger first slideshow transition immediately after delay
      handleSlideshowTransition()
    }, ANIMATION_CONFIG.slideshow.delay)
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

    // Initialize spring to target (no animation needed for first appearance)
    aspectSpring.position = aspectRatio
    aspectSpring.velocity = 0
    aspectSpring.target = aspectRatio
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

    // Capture preview for closure
    const capturedPreview = preview

    activeTimeline = gsap.timeline({
      onComplete: () => {
        slotStates.value[slot].status = 'active'
        activeTimeline = null
        log.state('REVEALING', 'VISIBLE')

        // Start slideshow timer after reveal completes
        startSlideshowTimer(capturedPreview)
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

    // Clear slideshow timers when switching items
    clearSlideshowTimers()

    const direction = resolveClipDirection(preview.itemIndex)
    const oldDirection = currentClipDirection.value
    currentClipDirection.value = direction

    // Kill any active animation
    if (activeTimeline) {
      activeTimeline.kill()
      activeTimeline = null
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

    // Capture slots and preview for onComplete (closure safety)
    const capturedNewSlot = newSlot
    const capturedOldSlot = oldSlot
    const capturedPreview = preview

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

        // Start slideshow timer for new item
        startSlideshowTimer(capturedPreview)
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

    // Clear slideshow timers on re-entry
    clearSlideshowTimers()

    // Kill any active animation first
    if (activeTimeline) {
      activeTimeline.kill()
      activeTimeline = null
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
          const capturedPreview = preview
          activeTimeline = gsap.timeline({
            onComplete: () => {
              slotStates.value[capturedSlot].status = 'active'
              activeTimeline = null

              // Restart slideshow timer on re-entry
              startSlideshowTimer(capturedPreview)
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
  const startSettleCheck = (): void => {
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
    cancelAspectSpring()
    clearSlideshowTimers()

    if (!activeSlot.value) {
      showPreview.value = false
      return
    }

    // Kill any active timeline first
    if (activeTimeline) {
      activeTimeline.kill()
      activeTimeline = null
    }

    // Kill tweens on ALL slots and hide non-active ones immediately
    // This handles mid-slideshow/transition states where multiple slots are visible
    const currentActive = activeSlot.value
    const slots: SlotId[] = ['A', 'B', 'C']
    slots.forEach((slot) => {
      const element = getSlotElement(slot)
      if (element) {
        gsap.killTweensOf(element)
        if (slot !== currentActive) {
          // Non-active slots: hide instantly (they might be mid-transition)
          gsap.set(element, { opacity: 0 })
        }
        else {
          // Active slot: ensure fully visible before clip animation
          gsap.set(element, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' })
        }
      }
    })

    const element = getSlotElement(currentActive)
    if (!element) {
      showPreview.value = false
      return
    }

    slotStates.value[currentActive].status = 'animating-out'

    const clipPaths = ANIMATION_CONFIG.clipPath[currentClipDirection.value]

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
    catch {
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
    cancelAspectSpring()
    clearSlideshowTimers()

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
   *
   * Strategy: Kill any active GSAP animation, reset all slots to fully visible,
   * then let Vue Transition handle the fade out. This avoids competing animations
   * (GSAP clip vs Vue fade) that can cause glitches, especially mid-slideshow.
   *
   * IMPORTANT: Don't call resetSlot() here - it sets opacity:0 which cuts short the fade.
   * Slot cleanup happens in cleanupAfterFade() called from @after-leave.
   */
  const clearActivePreviewInstant = (): void => {
    if (isNavigating.value) {
      log.debug('Skipping instant clear - navigation in progress')
      return
    }

    log.separator('CLEAR INSTANT (Scroll)')

    cancelClearTimeout()
    resetVelocityState()
    cancelAspectSpring()
    clearSlideshowTimers()

    if (!showPreview.value || !activeSlot.value) return

    // Kill any active timeline
    if (activeTimeline) {
      activeTimeline.kill()
      activeTimeline = null
    }

    // Kill tweens on non-active slots and hide them immediately
    const slots: SlotId[] = ['A', 'B', 'C']
    const currentActive = activeSlot.value
    slots.forEach((slot) => {
      const element = getSlotElement(slot)
      if (element) {
        gsap.killTweensOf(element)
        if (slot !== currentActive) {
          // Non-active slots: hide instantly
          gsap.set(element, { opacity: 0 })
        }
        else {
          // Active slot: ensure fully visible before clip animation
          gsap.set(element, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' })
        }
      }
    })

    // Animate active slot with clip from top (clean exit)
    const activeElement = getSlotElement(currentActive)
    if (activeElement) {
      activeTimeline = gsap.timeline({
        onComplete: () => {
          showPreview.value = false
          activeTimeline = null
        }
      })

      activeTimeline.to(activeElement, {
        clipPath: 'inset(0% 0% 100% 0%)', // Clip to top (disappears upward)
        duration: 0.35,
        ease: 'power2.in'
      })
    }
    else {
      // Fallback if no active element
      showPreview.value = false
    }

    forceHideUntil.value = Date.now() + 100
  }

  /**
   * Cleanup after Vue fade transition completes
   * Called from @after-leave hook in component
   */
  const cleanupAfterFade = (): void => {
    log.debug('Cleanup after fade')
    resetSlot('A')
    resetSlot('B')
    resetSlot('C')
    activeSlot.value = null
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
    cleanupAfterFade,
    calculatePosition,
    animationConfig: ANIMATION_CONFIG
  }
}
