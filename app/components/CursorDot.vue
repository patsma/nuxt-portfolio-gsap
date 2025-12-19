<template>
  <div
    v-if="!shouldHide"
    ref="cursorRef"
    class="cursor-dot pointer-events-none fixed left-0 top-0 z-50"
  >
    <!-- Tooltip circle with text, offset to top-right -->
    <div
      ref="tooltipRef"
      class="cursor-dot__tooltip"
    >
      <span
        ref="textRef"
        class="cursor-dot__text"
      >{{ hoverText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * CursorDot Component - Cursor Tooltip for Interactive Elements
 *
 * A cursor follower tooltip that only appears when hovering elements with
 * `data-hover-text="Text"` attribute. Scales up from center, offset to
 * top-right to not obscure content.
 *
 * Features:
 * - Hidden by default, only appears on interactive element hover
 * - Smooth cursor following using GSAP quickTo
 * - Scales up with bouncy effect, offset to top-right
 * - Theme-aware colors (auto-updates on theme change)
 * - Completely hidden on mobile/touch devices (v-if, not just display:none)
 * - Works with ScrollSmoother (positioned outside smooth-content)
 *
 * Usage:
 * 1. Add component to layout (outside #smooth-content)
 * 2. Add data-hover-text="Your Text" to any element
 *
 * @example
 * <button data-hover-text="Click me">Button</button>
 */

import useIsMobile from '~/composables/useIsMobile'

const { $gsap } = useNuxtApp()
const { isMobile } = useIsMobile()

// Refs
const cursorRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)

// State
const hoverText = ref('')
const isVisible = ref(false)
const isTouchDevice = ref(false)

// Computed
const shouldHide = computed(() => isMobile.value || isTouchDevice.value)

// Animation instances (typed as any due to nuxt-gsap type limitations)
let xTo: ((value: number) => void) | null = null
let yTo: ((value: number) => void) | null = null
let tooltipTimeline: ReturnType<typeof $gsap.timeline> | null = null

// Offset for tooltip (bottom-right of cursor)
const TOOLTIP_OFFSET_X = 80
const TOOLTIP_OFFSET_Y = -10

/**
 * Walk up DOM tree to find element with data-hover-text attribute
 */
const getHoverText = (element: HTMLElement | null): string | null => {
  while (element && element !== document.body) {
    if (element.dataset?.hoverText) {
      return element.dataset.hoverText
    }
    element = element.parentElement
  }
  return null
}

/**
 * Handle mouse movement - update cursor position
 */
const handleMouseMove = (e: MouseEvent) => {
  if (xTo && yTo) {
    xTo(e.clientX)
    yTo(e.clientY)
  }
}

/**
 * Handle mouse over - show tooltip if hovering element with data-hover-text
 */
const handleMouseOver = (e: MouseEvent) => {
  const text = getHoverText(e.target as HTMLElement)

  if (text && !isVisible.value) {
    hoverText.value = text
    isVisible.value = true
    tooltipTimeline?.play()
  }
}

/**
 * Handle mouse out - hide tooltip if leaving hover area
 */
const handleMouseOut = (e: MouseEvent) => {
  const relatedTarget = e.relatedTarget as HTMLElement | null
  const text = getHoverText(relatedTarget)

  // Only hide if not moving to another hover element
  if (!text && isVisible.value) {
    isVisible.value = false
    tooltipTimeline?.reverse()
  }
}

/**
 * Set up GSAP animations and event listeners
 */
const setupAnimations = () => {
  if (!cursorRef.value || !tooltipRef.value || !textRef.value) return

  // Set initial states - tooltip hidden at cursor position (no offset)
  $gsap.set(tooltipRef.value, {
    scale: 0,
    autoAlpha: 0,
    x: 0,
    y: 0
  })

  $gsap.set(textRef.value, {
    autoAlpha: 0
  })

  // Create quickTo functions for smooth cursor following
  // Cast needed - quickTo exists at runtime but not in nuxt-gsap types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gsap = $gsap as any
  xTo = gsap.quickTo(cursorRef.value, 'x', {
    duration: 0.3,
    ease: 'power3.out'
  })

  yTo = gsap.quickTo(cursorRef.value, 'y', {
    duration: 0.3,
    ease: 'power3.out'
  })

  // Create show/hide timeline for tooltip (paused)
  tooltipTimeline = $gsap.timeline({ paused: true })

  // Scale up and move to offset position
  tooltipTimeline.to(tooltipRef.value, {
    scale: 1,
    autoAlpha: 1,
    x: TOOLTIP_OFFSET_X,
    y: TOOLTIP_OFFSET_Y,
    duration: 0.35,
    ease: 'back.out(1.5)'
  }, 0)

  // Fade in text (slightly delayed)
  tooltipTimeline.to(textRef.value, {
    autoAlpha: 1,
    duration: 0.25,
    ease: 'power2.out'
  }, 0.1)
}

/**
 * Set up event listeners for mouse tracking and hover detection
 */
const setupEventListeners = () => {
  window.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseover', handleMouseOver)
  document.addEventListener('mouseout', handleMouseOut)
}

/**
 * Clean up event listeners
 */
const cleanupEventListeners = () => {
  window.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseover', handleMouseOver)
  document.removeEventListener('mouseout', handleMouseOut)
}

// Lifecycle
onMounted(() => {
  // Touch detection
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  if (shouldHide.value) return

  setupAnimations()
  setupEventListeners()
})

onUnmounted(() => {
  cleanupEventListeners()

  if (tooltipTimeline) {
    tooltipTimeline.kill()
    tooltipTimeline = null
  }

  xTo = null
  yTo = null
})

// Watch for breakpoint changes
watch(shouldHide, (hidden) => {
  if (hidden) {
    cleanupEventListeners()
  }
  else if (!isTouchDevice.value) {
    // Wait for v-if to render DOM elements before setting up
    nextTick(() => {
      setupAnimations()
      setupEventListeners()
    })
  }
})
</script>

<style scoped>
.cursor-dot__tooltip {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--theme-text-100);
  display: grid;
  place-items: center;
  /* Offset from cursor position */
  transform: translate(-50%, -50%);
  /* Hidden by default - GSAP takes over */
  opacity: 0;
  visibility: hidden;
}

.cursor-dot__text {
  color: var(--theme-100);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  /* Hidden by default - GSAP takes over */
  opacity: 0;
  visibility: hidden;
}
</style>
