<template>
  <!-- Canvas for smooth cursor trail effect with spring physics -->
  <canvas
    ref="canvasRef"
    class="cursor-trail pointer-events-none fixed left-0 top-0 z-50 h-screen w-screen mix-blend-overlay"
    data-entrance-animate="true"
  />
</template>

<script setup>
// Standard GSAP from Nuxt app
const { $gsap } = useNuxtApp()

// Canvas reference
const canvasRef = ref(null)

// Animation frame ID for cleanup
let animationFrameId = null
let gsapCtx = null

/**
 * Get cursor stroke color from theme system
 * Uses --theme-text-100 for proper visibility (inverted from background)
 * Higher opacity on light theme for better visibility
 * @returns {string} RGBA color string
 */
function getCursorColor() {
  if (!import.meta.client) return 'rgba(9, 9, 37, 0.8)'

  const html = document.documentElement
  const themeColor = getComputedStyle(html)
    .getPropertyValue('--theme-text-100')
    .trim()
  const bgColor = getComputedStyle(html).getPropertyValue('--theme-100').trim()

  // Detect if we're on light theme (background is light-colored)
  // Light theme has rgba(255, 250, 245, 1) as --theme-100
  const isLightTheme = bgColor.includes('255')

  // Parse rgba() or rgb() string and add opacity
  const rgbaMatch = themeColor.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  )
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch
    // Light theme: higher opacity (80%) for better visibility against light background
    // Dark theme: lower opacity (50%) for subtle effect against dark background
    const opacity = isLightTheme ? 0.8 : 0.5
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Fallback to dark color with high opacity
  return 'rgba(9, 9, 37, 0.8)'
}

// Lifecycle: mount and initialize cursor trail animation
onMounted(() => {
  // Setup entrance animation for first load
  const { isFirstLoad } = useLoadingSequence()
  if (isFirstLoad()) {
    const { setupEntrance } = useEntranceAnimation()

    setupEntrance(canvasRef.value, {
      position: '+=0.25',
      animate: (el) => {
        const tl = $gsap.timeline()

        tl.to(el, {
          delay: 1.6,
          autoAlpha: 0.4,
          duration: 2,
          ease: 'sine.out'
        })

        return tl
      }
    })
  }

  nextTick(() => {
    const canvas = canvasRef.value
    if (!canvas) return

    // Create GSAP context for proper cleanup
    gsapCtx = $gsap.context(() => {
      const ctx = canvas.getContext('2d')

      // Flag to track if mouse has moved (for intro motion)
      let mouseMoved = false

      // Mouse position tracking
      const mouse = {
        x: 0.5 * window.innerWidth, // Current position
        y: 0.5 * window.innerHeight,
        tX: 0, // Target position X
        tY: 0 // Target position Y
      }

      // Trail parameters - adjust these to customize the effect
      const params = {
        pointsNumber: 40, // Number of trail points (more = longer trail)
        widthFactor: 0.45, // Trail width multiplier
        mouseThreshold: 0.6, // Mouse smoothing (lower = smoother)
        spring: 0.4, // Spring force (higher = more responsive)
        friction: 0.5 // Friction/damping (lower = more fluid)
      }

      // Initialize trail points array
      const touchTrail = new Array(params.pointsNumber)
      for (let i = 0; i < params.pointsNumber; i++) {
        touchTrail[i] = {
          x: mouse.x,
          y: mouse.y,
          vx: 0, // Velocity X
          vy: 0 // Velocity Y
        }
      }

      /**
       * Update mouse target position from event
       * @param {MouseEvent} e - Mouse event
       */
      function updateMousePosition(e) {
        mouse.tX = e.clientX
        mouse.tY = e.clientY
      }

      /**
       * Handle mousemove event
       * @param {MouseEvent} e - Mouse event
       */
      function handleMouseMove(e) {
        mouseMoved = true
        updateMousePosition(e)
      }

      // Add mouse event listener
      window.addEventListener('mousemove', handleMouseMove)

      /**
       * Set up canvas dimensions
       */
      function setupCanvas() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      // Initial canvas setup
      setupCanvas()

      // Update canvas size on window resize
      window.addEventListener('resize', setupCanvas)

      /**
       * Update and render trail bubbles
       * @param {number} t - Timestamp for intro animation
       */
      function updateBubbles(t) {
        // Intro motion: create interesting movement before user moves mouse
        if (!mouseMoved) {
          mouse.tX
            = (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t))
              * window.innerWidth
          mouse.tY
            = (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t))
              * window.innerHeight
        }

        // Clear canvas for new frame
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.beginPath()

        // Set stroke color from theme system (updates on theme change)
        ctx.strokeStyle = getCursorColor()

        // Update trail point positions using spring physics
        touchTrail.forEach((p, pIdx) => {
          if (pIdx === 0) {
            // First point follows mouse directly
            p.x = mouse.x
            p.y = mouse.y
            ctx.moveTo(p.x, p.y)
          }
          else {
            // Apply spring force toward previous point
            p.vx += (touchTrail[pIdx - 1].x - p.x) * params.spring
            p.vy += (touchTrail[pIdx - 1].y - p.y) * params.spring

            // Apply friction to velocity
            p.vx *= params.friction
            p.vy *= params.friction

            // Update position based on velocity
            p.x += p.vx
            p.y += p.vy
          }
        })

        // Draw smooth curve through trail points using quadratic curves
        for (let i = 1; i < touchTrail.length - 1; i++) {
          const xc = 0.5 * (touchTrail[i].x + touchTrail[i + 1].x)
          const yc = 0.5 * (touchTrail[i].y + touchTrail[i + 1].y)
          ctx.quadraticCurveTo(touchTrail[i].x, touchTrail[i].y, xc, yc)

          // Taper the line width (thicker at front, thinner at back)
          ctx.lineWidth = params.widthFactor * (params.pointsNumber - i)
          ctx.stroke()
        }

        // Draw final point
        ctx.lineTo(
          touchTrail[touchTrail.length - 1].x,
          touchTrail[touchTrail.length - 1].y
        )
        ctx.stroke()

        // Smooth mouse movement toward target
        mouse.x += (mouse.tX - mouse.x) * params.mouseThreshold
        mouse.y += (mouse.tY - mouse.y) * params.mouseThreshold

        // Continue animation loop
        animationFrameId = window.requestAnimationFrame(updateBubbles)
      }

      // Start animation loop
      updateBubbles(0)
    }, canvasRef.value)
  })
})

// Cleanup
onUnmounted(() => {
  // Revert GSAP context (cleans up all GSAP-related effects)
  if (gsapCtx) gsapCtx.revert()

  // Clean up animation frame
  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped></style>
