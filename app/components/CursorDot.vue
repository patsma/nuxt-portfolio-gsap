<template>
  <div
    ref="cursorRef"
    class="cursor-dot pointer-events-none fixed left-0 top-0 z-50"
    :class="{ 'is-hidden': shouldHide }"
  >
    <!-- Small dot (default state) - 10px -->
    <div ref="dotRef" class="cursor-dot__dot" />

    <!-- Expanded circle with text (hover state) - 80px -->
    <div ref="expandedRef" class="cursor-dot__expanded">
      <span ref="textRef" class="cursor-dot__text">{{ hoverText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * CursorDot Component - Decorative Cursor Follower with Hover Expansion
 *
 * A small dot (10px) that smoothly follows the mouse cursor. When hovering
 * elements with `data-hover-text="Text"` attribute, the dot expands to an
 * 80px circle displaying the text inside.
 *
 * Features:
 * - Smooth cursor following using GSAP quickTo
 * - Expands on hover over elements with data-hover-text attribute
 * - Theme-aware colors (auto-updates on theme change)
 * - Hides on mobile/touch devices
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
const dotRef = ref<HTMLElement | null>(null)
const expandedRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)

// State
const hoverText = ref('')
const isExpanded = ref(false)
const isTouchDevice = ref(false)

// Computed
const shouldHide = computed(() => isMobile.value || isTouchDevice.value)

// Animation instances
let xTo: ((value: number) => void) | null = null
let yTo: ((value: number) => void) | null = null
let expandTimeline: gsap.core.Timeline | null = null

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
 * Handle mouse over - check for hover text and expand
 */
const handleMouseOver = (e: MouseEvent) => {
  const text = getHoverText(e.target as HTMLElement)

  if (text && !isExpanded.value) {
    hoverText.value = text
    isExpanded.value = true
    expandTimeline?.play()
  }
}

/**
 * Handle mouse out - collapse if leaving hover area
 */
const handleMouseOut = (e: MouseEvent) => {
  const relatedTarget = e.relatedTarget as HTMLElement | null
  const text = getHoverText(relatedTarget)

  // Only collapse if not moving to another hover element
  if (!text && isExpanded.value) {
    isExpanded.value = false
    expandTimeline?.reverse()
  }
}

/**
 * Set up GSAP animations and event listeners
 */
const setupAnimations = () => {
  if (!cursorRef.value || !dotRef.value || !expandedRef.value || !textRef.value) return

  // Set initial states
  $gsap.set(dotRef.value, {
    scale: 1,
    autoAlpha: 1
  })

  $gsap.set(expandedRef.value, {
    scale: 0,
    autoAlpha: 0
  })

  $gsap.set(textRef.value, {
    autoAlpha: 0
  })

  // Create quickTo functions for smooth cursor following
  xTo = $gsap.quickTo(cursorRef.value, 'x', {
    duration: 0.3,
    ease: 'power3.out'
  })

  yTo = $gsap.quickTo(cursorRef.value, 'y', {
    duration: 0.3,
    ease: 'power3.out'
  })

  // Create expand/collapse timeline (paused)
  expandTimeline = $gsap.timeline({ paused: true })

  // Shrink dot
  expandTimeline.to(dotRef.value, {
    scale: 0,
    autoAlpha: 0,
    duration: 0.2,
    ease: 'power2.in'
  }, 0)

  // Expand circle with bouncy effect
  expandTimeline.to(expandedRef.value, {
    scale: 1,
    autoAlpha: 1,
    duration: 0.4,
    ease: 'back.out(1.5)'
  }, 0)

  // Fade in text (slightly delayed)
  expandTimeline.to(textRef.value, {
    autoAlpha: 1,
    duration: 0.3,
    ease: 'power2.out'
  }, 0.15)
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

  if (expandTimeline) {
    expandTimeline.kill()
    expandTimeline = null
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
    setupAnimations()
    setupEventListeners()
  }
})
</script>

<style scoped>
.cursor-dot {
  /* Container - will be transformed by GSAP */
}

.cursor-dot__dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--theme-text-100);
  /* Center the dot on cursor position */
  transform: translate(-50%, -50%);
}

.cursor-dot__expanded {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--theme-text-100);
  opacity: 0.9;
  display: grid;
  place-items: center;
  /* Center on cursor position */
  transform: translate(-50%, -50%);
}

.cursor-dot__text {
  color: var(--theme-100);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cursor-dot.is-hidden {
  display: none;
}
</style>
