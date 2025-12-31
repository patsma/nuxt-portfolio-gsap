<template>
  <svg
    ref="svgRef"
    class="full-width-border-svg full-width"
    :style="{ '--border-spacing': spacing || '0px' }"
  >
    <path
      ref="pathRef"
      :d="currentPath"
      :stroke="strokeColor"
      stroke-width="1"
      fill="none"
    />
  </svg>
</template>

<script setup lang="ts">
/**
 * FullWidthBorder Component - Physics-Based Wobbly Border Line
 *
 * A reusable component for rendering full-width horizontal border lines
 * with organic, physics-based wobble effect when the mouse is near.
 *
 * Uses spring physics simulation for natural movement:
 * - Velocity-sensitive: faster mouse movement = more dramatic bending
 * - Spring simulation: control point has position, velocity, target
 * - Natural overshoot and oscillation on fast movements
 *
 * Features:
 * - Single quadratic bezier for smooth rope-like bending
 * - Proximity-based wobble (triggers within ~120px of line)
 * - Physics spring simulation with velocity influence
 * - Natural momentum and spring-back on fast movements
 * - Disabled on mobile/touch devices
 *
 * Props:
 * @param {number} opacity - Opacity percentage for border (0-100, default: 15)
 * @param {string} spacing - Bottom margin spacing (CSS value, default: '0')
 */

import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'

const props = defineProps({
  opacity: {
    type: Number,
    default: 15,
    validator: (value: unknown) => typeof value === 'number' && value >= 0 && value <= 100
  },
  spacing: {
    type: String,
    default: '0'
  }
})

// Configuration - physics parameters
const PROXIMITY_THRESHOLD = 120 // pixels - detection range
const MAX_DISPLACEMENT = 40 // pixels - max bend amount
const SPRING_STIFFNESS = 0.08 // How quickly spring pulls toward target (lower = more lag)
const SPRING_DAMPING = 0.82 // How quickly oscillation dies down (higher = less bounce)
const VELOCITY_INFLUENCE = 3.0 // How much mouse velocity affects bending

// Refs
const svgRef = ref<SVGSVGElement | null>(null)
const pathRef = ref<SVGPathElement | null>(null)
const svgWidth = ref(1000)
// Initialize with a valid straight line path for SSR (y=50 is center of 100px tall SVG)
const currentPath = ref('M 0 50 L 1000 50')
const isMobile = ref(false)

// Physics state
const spring = reactive({
  position: 0, // Current displacement (Y)
  velocity: 0, // Current velocity
  target: 0, // Target displacement
  controlX: 500, // Control point X position
  targetX: 500, // Target X position
  isAnimating: false
})

// Velocity tracking
let lastMouseY = 0
let lastMouseTime = 0
let mouseVelocityY = 0

// Animation frame ID
let physicsFrame: number | null = null

// Stroke color computed from theme
const strokeColor = computed(() =>
  `color-mix(in srgb, var(--theme-text-100) ${props.opacity}%, transparent)`
)

// SVG center Y position (line sits in middle of 100px tall SVG)
const SVG_CENTER_Y = 50

// Generate a straight line path
const generateStraightPath = (width: number): string => {
  return `M 0 ${SVG_CENTER_Y} L ${width} ${SVG_CENTER_Y}`
}

/**
 * Generate a rope-like bent path using a single quadratic bezier curve
 */
const generateRopePath = (
  width: number,
  controlX: number,
  displacement: number
): string => {
  // Clamp control X to keep curve looking natural
  const clampedX = Math.max(width * 0.1, Math.min(width * 0.9, controlX))
  // Displacement is relative to center (positive = down, negative = up)
  const controlY = SVG_CENTER_Y + displacement
  return `M 0 ${SVG_CENTER_Y} Q ${clampedX} ${controlY} ${width} ${SVG_CENTER_Y}`
}

/**
 * Track mouse velocity for physics-based movement
 */
const trackVelocity = (e: MouseEvent) => {
  const now = performance.now()
  const dt = now - lastMouseTime

  if (dt > 0 && dt < 100) {
    // Calculate velocity, normalized to approximate frame time (~16ms)
    mouseVelocityY = ((e.clientY - lastMouseY) / dt) * 16
  }
  else {
    // Reset velocity if too much time passed
    mouseVelocityY = 0
  }

  lastMouseY = e.clientY
  lastMouseTime = now
}

/**
 * Physics simulation loop - runs at 60fps via requestAnimationFrame
 */
const runPhysicsLoop = () => {
  // Spring physics for Y displacement
  const forceY = (spring.target - spring.position) * SPRING_STIFFNESS
  spring.velocity += forceY
  spring.velocity *= SPRING_DAMPING
  spring.position += spring.velocity

  // Smooth X position tracking (faster, less springy)
  spring.controlX += (spring.targetX - spring.controlX) * 0.15

  // Update the SVG path directly
  if (pathRef.value) {
    const newPath = generateRopePath(svgWidth.value, spring.controlX, spring.position)
    pathRef.value.setAttribute('d', newPath)
  }

  // Continue animation if still moving significantly
  const isMoving
    = Math.abs(spring.velocity) > 0.05
      || Math.abs(spring.target - spring.position) > 0.5
      || Math.abs(spring.targetX - spring.controlX) > 1

  if (isMoving) {
    physicsFrame = requestAnimationFrame(runPhysicsLoop)
  }
  else {
    spring.isAnimating = false
    physicsFrame = null

    // Snap to final position
    if (Math.abs(spring.target) < 0.1) {
      spring.position = 0
      spring.controlX = svgWidth.value / 2
      if (pathRef.value) {
        pathRef.value.setAttribute('d', generateStraightPath(svgWidth.value))
      }
    }
  }
}

/**
 * Start the physics animation loop if not already running
 */
const startPhysicsLoop = () => {
  if (!spring.isAnimating) {
    spring.isAnimating = true
    physicsFrame = requestAnimationFrame(runPhysicsLoop)
  }
}

// Handle mouse movement
const handleMouseMove = (e: MouseEvent) => {
  if (isMobile.value || !svgRef.value) return

  // Track velocity
  trackVelocity(e)

  const rect = svgRef.value.getBoundingClientRect()
  if (rect.width === 0) return

  // Calculate distance from mouse to line
  const lineY = rect.top + rect.height / 2
  const distanceY = e.clientY - lineY
  const proximity = Math.abs(distanceY)

  if (proximity < PROXIMITY_THRESHOLD) {
    // Calculate bend intensity based on proximity
    const intensity = 1 - proximity / PROXIMITY_THRESHOLD

    // Direction: bend toward cursor
    const direction = distanceY > 0 ? 1 : -1

    // Base displacement from proximity
    const baseDisplacement = direction * MAX_DISPLACEMENT * intensity

    // Add velocity influence - fast movement = more dramatic bend
    const velocityBoost = mouseVelocityY * VELOCITY_INFLUENCE * intensity

    // Set spring target (clamped to reasonable range)
    spring.target = Math.max(-MAX_DISPLACEMENT * 1.5, Math.min(MAX_DISPLACEMENT * 1.5, baseDisplacement + velocityBoost))

    // Update target X position
    spring.targetX = ((e.clientX - rect.left) / rect.width) * svgWidth.value

    // Start physics loop
    startPhysicsLoop()
  }
  else {
    // Mouse moved away - spring back to straight
    spring.target = 0
    spring.targetX = svgWidth.value / 2

    // Keep physics running if we have momentum
    if (Math.abs(spring.velocity) > 0.1 || Math.abs(spring.position) > 0.5) {
      startPhysicsLoop()
    }
  }
}

// Update SVG width on resize
const updateWidth = () => {
  if (!svgRef.value) return
  const rect = svgRef.value.getBoundingClientRect()
  // Only update if we have valid dimensions
  if (rect.width > 0) {
    svgWidth.value = rect.width
    currentPath.value = generateStraightPath(svgWidth.value)
    // Initialize spring X positions to center
    spring.controlX = svgWidth.value / 2
    spring.targetX = svgWidth.value / 2
  }
}

// Check if device is mobile/touch
const checkMobile = () => {
  isMobile.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

onMounted(() => {
  checkMobile()

  // Set initial path
  updateWidth()

  // Listen for mouse movement (desktop only)
  if (!isMobile.value) {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
  }

  // Update width on resize
  window.addEventListener('resize', updateWidth, { passive: true })

  // Use ResizeObserver for more accurate width tracking
  if (svgRef.value && typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(updateWidth)
    observer.observe(svgRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', updateWidth)

  // Cancel physics animation loop
  if (physicsFrame) {
    cancelAnimationFrame(physicsFrame)
    physicsFrame = null
  }
})
</script>

<style scoped>
/**
 * Full-width border SVG styles
 * - Uses grid-column: full-width to span entire content-grid
 * - Height includes space for bend effect (100px total, line at center)
 * - position: absolute + transform: translate(0, -50%) centers the line
 * - margin-bottom adds user spacing below
 * - pointer-events: none to not interfere with content below
 */
.full-width-border-svg {
  --border-spacing: 0px;
  grid-column: full-width;
  width: 100%;
  height: 100px;
  margin-bottom: calc(-50px + var(--border-spacing));
  pointer-events: none;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(0, -50%);
}
</style>
