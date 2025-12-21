/**
 * useMagnetic - Spring physics magnetic hover effect
 *
 * Applies an organic magnetic/gravity effect to elements that pulls them
 * toward the cursor when hovering nearby. Uses spring physics for natural
 * movement with overshoot and oscillation.
 *
 * Features:
 * - Spring physics simulation (configurable stiffness/damping)
 * - Proximity-based activation
 * - Auto-disabled on mobile/touch devices
 * - Automatic cleanup on unmount
 *
 * @example
 * ```vue
 * <script setup>
 * const buttonRef = ref<HTMLElement | null>(null)
 * const { isActive } = useMagnetic(buttonRef, {
 *   threshold: 150,
 *   maxDisplacement: 28
 * })
 * </script>
 *
 * <template>
 *   <button ref="buttonRef">Magnetic Button</button>
 * </template>
 * ```
 */
import type { Ref } from 'vue'
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import useIsMobile from '~/composables/useIsMobile'

export interface MagneticOptions {
  /** Detection radius in pixels (default: 150) */
  threshold?: number
  /** Maximum displacement in pixels (default: 28) */
  maxDisplacement?: number
  /** Pull strength from 0-1 (default: 0.5) */
  strength?: number
  /** Spring stiffness - higher = faster response (default: 0.08) */
  stiffness?: number
  /** Spring damping - higher = less bounce (default: 0.85) */
  damping?: number
  /** How much mouse velocity affects pull - higher = more dramatic on fast moves (default: 1.5) */
  velocityInfluence?: number
  /** Time scale - lower = slower animation, same spring character (default: 1.0) */
  timeScale?: number
}

export interface MagneticReturn {
  /** Whether the cursor is within the magnetic threshold */
  isActive: Ref<boolean>
  /** Current X offset */
  offsetX: Ref<number>
  /** Current Y offset */
  offsetY: Ref<number>
}

const defaults: Required<MagneticOptions> = {
  threshold: 150,
  maxDisplacement: 28,
  strength: 0.5,
  stiffness: 0.08,
  damping: 0.85,
  velocityInfluence: 1.5,
  timeScale: 1.0
}

export function useMagnetic(
  elementRef: Ref<HTMLElement | null>,
  options: MagneticOptions = {}
): MagneticReturn {
  const config = { ...defaults, ...options }

  // Mobile detection
  const { isMobile } = useIsMobile()
  const isTouchDevice = ref(false)

  // State
  const isActive = ref(false)
  const offsetX = ref(0)
  const offsetY = ref(0)

  // Physics state (internal)
  const spring = reactive({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    velocityX: 0,
    velocityY: 0
  })

  // Mouse velocity tracking (for organic feel - faster mouse = more dramatic pull)
  let lastMouseX = 0
  let lastMouseY = 0
  let lastMouseTime = 0
  let mouseVelocityX = 0
  let mouseVelocityY = 0

  // Animation frame ID
  let animationFrame: number | null = null

  /**
   * Track mouse velocity between frames (normalized to ~16ms)
   */
  const trackMouseVelocity = (e: MouseEvent) => {
    const now = performance.now()
    const dt = now - lastMouseTime

    if (dt > 0 && dt < 100) {
      // Normalize velocity to ~16ms (one frame) for consistent feel
      mouseVelocityX = ((e.clientX - lastMouseX) / dt) * 16
      mouseVelocityY = ((e.clientY - lastMouseY) / dt) * 16
    } else {
      // Reset if too much time passed (mouse was idle)
      mouseVelocityX = 0
      mouseVelocityY = 0
    }

    lastMouseX = e.clientX
    lastMouseY = e.clientY
    lastMouseTime = now
  }

  /**
   * Get element center position (accounting for current offset)
   */
  const getElementCenter = (): { x: number; y: number } | null => {
    if (!elementRef.value) return null

    const rect = elementRef.value.getBoundingClientRect()
    // Subtract current offset to get original center
    return {
      x: rect.left + rect.width / 2 - spring.x,
      y: rect.top + rect.height / 2 - spring.y
    }
  }

  /**
   * Calculate distance from cursor to element center
   */
  const getDistance = (cursorX: number, cursorY: number): number => {
    const center = getElementCenter()
    if (!center) return Infinity

    const dx = cursorX - center.x
    const dy = cursorY - center.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Run spring physics simulation
   * timeScale stretches the animation in time while keeping spring character
   */
  const runPhysics = () => {
    // Spring force calculation (scaled by timeScale for slow-motion effect)
    const forceX = (spring.targetX - spring.x) * config.stiffness * config.timeScale
    const forceY = (spring.targetY - spring.y) * config.stiffness * config.timeScale

    // Apply force to velocity
    spring.velocityX += forceX
    spring.velocityY += forceY

    // Apply damping (adjusted for timeScale to maintain spring character)
    // Higher timeScale = more damping per frame, lower = less
    const effectiveDamping = 1 - (1 - config.damping) * config.timeScale
    spring.velocityX *= effectiveDamping
    spring.velocityY *= effectiveDamping

    // Update position (scaled by timeScale)
    spring.x += spring.velocityX * config.timeScale
    spring.y += spring.velocityY * config.timeScale

    // Update reactive refs
    offsetX.value = spring.x
    offsetY.value = spring.y

    // Apply transform to element
    if (elementRef.value) {
      elementRef.value.style.transform = `translate(${spring.x}px, ${spring.y}px)`
    }

    // Check if animation should continue
    const isMoving =
      Math.abs(spring.velocityX) > 0.01 ||
      Math.abs(spring.velocityY) > 0.01 ||
      Math.abs(spring.targetX - spring.x) > 0.1 ||
      Math.abs(spring.targetY - spring.y) > 0.1

    if (isMoving) {
      animationFrame = requestAnimationFrame(runPhysics)
    } else {
      animationFrame = null
      // Snap to final position when settled
      if (!isActive.value) {
        spring.x = 0
        spring.y = 0
        offsetX.value = 0
        offsetY.value = 0
        if (elementRef.value) {
          elementRef.value.style.transform = ''
        }
      }
    }
  }

  /**
   * Start physics loop if not already running
   */
  const startPhysics = () => {
    if (animationFrame === null) {
      animationFrame = requestAnimationFrame(runPhysics)
    }
  }

  /**
   * Handle mouse movement
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (!elementRef.value) return

    // Track velocity for organic feel
    trackMouseVelocity(e)

    const distance = getDistance(e.clientX, e.clientY)
    const center = getElementCenter()
    if (!center) return

    if (distance < config.threshold) {
      isActive.value = true

      // Calculate direction from center to cursor
      const dx = e.clientX - center.x
      const dy = e.clientY - center.y

      // Calculate pull amount based on proximity (closer = stronger pull)
      const proximity = 1 - distance / config.threshold
      const pullStrength = proximity * config.strength

      // Base target from cursor direction
      let targetX = dx * pullStrength
      let targetY = dy * pullStrength

      // Add velocity boost for organic feel (faster mouse = more dramatic pull)
      const velocityBoostX = mouseVelocityX * config.velocityInfluence * proximity * 0.1
      const velocityBoostY = mouseVelocityY * config.velocityInfluence * proximity * 0.1
      targetX += velocityBoostX
      targetY += velocityBoostY

      // Clamp to max displacement
      const magnitude = Math.sqrt(targetX * targetX + targetY * targetY)
      if (magnitude > config.maxDisplacement) {
        const scale = config.maxDisplacement / magnitude
        spring.targetX = targetX * scale
        spring.targetY = targetY * scale
      } else {
        spring.targetX = targetX
        spring.targetY = targetY
      }

      startPhysics()
    } else {
      // Outside threshold - return to origin
      if (isActive.value) {
        isActive.value = false
        spring.targetX = 0
        spring.targetY = 0
        startPhysics()
      }
    }
  }

  /**
   * Handle mouse leaving the window
   */
  const handleMouseLeave = () => {
    if (isActive.value) {
      isActive.value = false
      spring.targetX = 0
      spring.targetY = 0
      startPhysics()
    }
  }

  // Setup and cleanup
  onMounted(() => {
    // Touch detection
    isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Skip setup on mobile/touch
    if (isMobile.value || isTouchDevice.value) return

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseleave', handleMouseLeave)

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  })

  // Watch for breakpoint changes
  watch(isMobile, (mobile) => {
    if (mobile || isTouchDevice.value) {
      // Clean up when switching to mobile
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)

      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
      }

      // Reset position
      spring.x = 0
      spring.y = 0
      spring.targetX = 0
      spring.targetY = 0
      spring.velocityX = 0
      spring.velocityY = 0
      offsetX.value = 0
      offsetY.value = 0
      isActive.value = false

      if (elementRef.value) {
        elementRef.value.style.transform = ''
      }
    } else if (!isTouchDevice.value) {
      // Re-enable when switching to desktop
      window.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseleave', handleMouseLeave)
    }
  })

  return {
    isActive,
    offsetX,
    offsetY
  }
}

export default useMagnetic
