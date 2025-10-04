<template>
  <!-- Canvas for smooth cursor trail effect with spring physics -->
  <canvas
    ref="canvasRef"
    class="cursor-trail pointer-events-none fixed left-0 top-0 z-50 h-screen w-screen mix-blend-overlay"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Canvas reference
const canvasRef = ref(null);

// Animation frame ID for cleanup
let animationFrameId = null;

onMounted(() => {
  // Only run on client side
  if (!process.client) return;

  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Flag to track if mouse has moved (for intro motion)
  let mouseMoved = false;

  // Mouse position tracking
  let mouse = {
    x: 0.5 * window.innerWidth,  // Current position
    y: 0.5 * window.innerHeight,
    tX: 0, // Target position X
    tY: 0, // Target position Y
  };

  // Trail parameters - adjust these to customize the effect
  let params = {
    pointsNumber: 40,      // Number of trail points (more = longer trail)
    widthFactor: 0.45,     // Trail width multiplier
    mouseThreshold: 0.6,   // Mouse smoothing (lower = smoother)
    spring: 0.4,           // Spring force (higher = more responsive)
    friction: 0.5,         // Friction/damping (lower = more fluid)
  };

  // Initialize trail points array
  const touchTrail = new Array(params.pointsNumber);
  for (let i = 0; i < params.pointsNumber; i++) {
    touchTrail[i] = {
      x: mouse.x,
      y: mouse.y,
      vx: 0, // Velocity X
      vy: 0, // Velocity Y
    };
  }

  /**
   * Update mouse target position from event
   * @param {MouseEvent} e - Mouse event
   */
  function updateMousePosition(e) {
    mouse.tX = e.clientX;
    mouse.tY = e.clientY;
  }

  /**
   * Handle mousemove event
   * @param {MouseEvent} e - Mouse event
   */
  function handleMouseMove(e) {
    mouseMoved = true;
    updateMousePosition(e);
  }

  // Add mouse event listener
  window.addEventListener('mousemove', handleMouseMove);

  /**
   * Set up canvas dimensions
   */
  function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Initial canvas setup
  setupCanvas();

  // Update canvas size on window resize
  window.addEventListener('resize', setupCanvas);

  /**
   * Update and render trail bubbles
   * @param {number} t - Timestamp for intro animation
   */
  function updateBubbles(t) {
    // Intro motion: create interesting movement before user moves mouse
    if (!mouseMoved) {
      mouse.tX = (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) * window.innerWidth;
      mouse.tY = (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) * window.innerHeight;
    }

    // Clear canvas for new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    // Update trail point positions using spring physics
    touchTrail.forEach((p, pIdx) => {
      if (pIdx === 0) {
        // First point follows mouse directly
        p.x = mouse.x;
        p.y = mouse.y;
        ctx.moveTo(p.x, p.y);
      } else {
        // Apply spring force toward previous point
        p.vx += (touchTrail[pIdx - 1].x - p.x) * params.spring;
        p.vy += (touchTrail[pIdx - 1].y - p.y) * params.spring;

        // Apply friction to velocity
        p.vx *= params.friction;
        p.vy *= params.friction;

        // Update position based on velocity
        p.x += p.vx;
        p.y += p.vy;
      }
    });

    // Draw smooth curve through trail points using quadratic curves
    for (let i = 1; i < touchTrail.length - 1; i++) {
      const xc = 0.5 * (touchTrail[i].x + touchTrail[i + 1].x);
      const yc = 0.5 * (touchTrail[i].y + touchTrail[i + 1].y);
      ctx.quadraticCurveTo(touchTrail[i].x, touchTrail[i].y, xc, yc);

      // Taper the line width (thicker at front, thinner at back)
      ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
      ctx.stroke();
    }

    // Draw final point
    ctx.lineTo(touchTrail[touchTrail.length - 1].x, touchTrail[touchTrail.length - 1].y);
    ctx.stroke();

    // Smooth mouse movement toward target
    mouse.x += (mouse.tX - mouse.x) * params.mouseThreshold;
    mouse.y += (mouse.tY - mouse.y) * params.mouseThreshold;

    // Continue animation loop
    animationFrameId = window.requestAnimationFrame(updateBubbles);
  }

  // Start animation loop
  updateBubbles(0);
});

onBeforeUnmount(() => {
  // Clean up animation frame on component unmount
  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.cursor-trail {
  /* Initial opacity set via GSAP in original - you can animate this if needed */
  opacity: 0.8;
}
</style>
