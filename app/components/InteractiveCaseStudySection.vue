<template>
  <section
    ref="sectionRef"
    class="interactive-case-study-section content-grid w-full min-h-screen relative py-12 md:py-16 lg:py-20"
    :data-entrance-animate="animateEntrance ? 'true' : undefined"
    @mousemove="handleMouseMove"
  >
    <h2
      ref="titleRef"
      v-page-clip:top="{ duration: 0.5, leaveOnly: true }"
      class="section-title ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)] breakout3 mb-8 md:mb-12"
    >
      <slot name="title">
        Work
      </slot>
    </h2>

    <div
      ref="itemsListRef"
      v-page-stagger="{ selector: '.case-study-item, .case-study-card', stagger: 0.08, leaveOnly: true }"
      class="case-study-list full-width-content"
    >
      <slot />
    </div>

    <!-- Teleport to body for scroll support, visibility with smooth fade transition -->
    <!-- MOBILE OPTIMIZATION: Skip entire preview DOM on mobile (preview not used) -->
    <Teleport
      v-if="previewMounted && !isMobile"
      to="body"
    >
      <Transition
        name="preview-fade"
        @after-leave="handlePreviewAfterLeave"
      >
        <div
          v-show="showPreview"
          ref="previewContainerRef"
          class="preview-container hidden md:block"
          :class="{ 'active': showPreview, 'is-navigating': isNavigating }"
          :style="{ aspectRatio: currentAspectRatio }"
        >
          <!-- 3-slot carousel system: always animate INTO a fresh slot -->
          <div
            ref="slotARef"
            class="preview-image-wrapper"
          >
            <NuxtImg
              v-if="slotAImage"
              :src="slotAImage.image"
              :alt="slotAImage.imageAlt"
              class="preview-image"
              loading="lazy"
              data-speed="0.95"
            />
          </div>

          <div
            ref="slotBRef"
            class="preview-image-wrapper"
          >
            <NuxtImg
              v-if="slotBImage"
              :src="slotBImage.image"
              :alt="slotBImage.imageAlt"
              class="preview-image"
              loading="lazy"
              data-speed="0.95"
            />
          </div>

          <div
            ref="slotCRef"
            class="preview-image-wrapper"
          >
            <NuxtImg
              v-if="slotCImage"
              :src="slotCImage.image"
              :alt="slotCImage.imageAlt"
              class="preview-image"
              loading="lazy"
              data-speed="0.95"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
/**
 * Interactive case study gallery with cursor-following preview
 * Desktop: List layout with hover preview (dynamic aspect ratios, crossfade transitions)
 * Mobile: Card layout with images
 *
 * Entrance Animation System:
 * - animateEntrance: Use entrance animation system for first load (via setupEntrance)
 * - animateOnScroll: Use ScrollTrigger animation when scrolling into view (default)
 * - position: GSAP position parameter for entrance timeline timing
 */
import type { ScrollTriggerInstance } from '~/types/nuxt-gsap'
import { useInteractiveCaseStudyPreview } from '~/composables/useInteractiveCaseStudyPreview'
import { calculatePreviewPosition } from '~/utils/previewPosition'

// Props
const props = defineProps({
  /**
   * Enable entrance animation on first load (uses setupEntrance system)
   * @type {boolean}
   */
  animateEntrance: {
    type: Boolean,
    default: false
  },
  /**
   * Enable scroll-triggered animation when section enters viewport
   * @type {boolean}
   */
  animateOnScroll: {
    type: Boolean,
    default: true
  },
  /**
   * GSAP position parameter for entrance animation timing
   * Examples:
   * - '<' - Start with previous animation (overlap completely)
   * - '<-0.5' - Start 0.5s before previous ends (default)
   * - '+=0.2' - Start 0.2s after previous animation
   * @type {string}
   */
  position: {
    type: String,
    default: '<-0.5'
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()
const { isMobile } = useIsMobile()

const sectionRef = ref(null)
const titleRef = ref(null)
const itemsListRef = ref(null)
const previewContainerRef = ref(null)

// 3-slot carousel refs
const slotARef = ref(null)
const slotBRef = ref(null)
const slotCRef = ref(null)

const cursorX = ref(0)
const cursorY = ref(0)

let titleScrollTriggerInstance: ScrollTriggerInstance | null = null
let itemScrollTriggerInstances: ScrollTriggerInstance[] = []

const getRefs = () => ({
  sectionRef: sectionRef.value,
  previewContainerRef: previewContainerRef.value,
  slotARefs: slotARef.value,
  slotBRefs: slotBRef.value,
  slotCRefs: slotCRef.value
})

/**
 * MOBILE OPTIMIZATION: Only initialize full preview system on desktop
 * On mobile, we return no-op functions to avoid:
 * - Velocity tracking overhead
 * - Spring physics calculations
 * - Slideshow timer management
 * - Image preloading (135+ images wasted)
 */
const mobileNoOpPreview = {
  slotAImage: ref(null),
  slotBImage: ref(null),
  slotCImage: ref(null),
  showPreview: ref(false),
  previewMounted: ref(false),
  currentAspectRatio: ref(4 / 3),
  isNavigating: ref(false),
  setActivePreview: async () => {},
  clearActivePreview: () => {},
  clearActivePreviewImmediate: (cb?: () => void) => cb?.(),
  clearActivePreviewInstant: () => {},
  cleanupAfterFade: () => {},
  animationConfig: {
    position: { offsetX: 30, padding: 20 },
    debounce: { clearDelay: 100 }
  }
}

// Conditionally initialize preview system based on device
const desktopPreview = isMobile.value
  ? null
  : useInteractiveCaseStudyPreview({
      gsap: $gsap,
      getRefs,
      getCursor: () => ({ x: cursorX.value, y: cursorY.value })
    })

// Use desktop preview if available, otherwise mobile no-op
const {
  slotAImage,
  slotBImage,
  slotCImage,
  showPreview,
  previewMounted,
  currentAspectRatio,
  isNavigating,
  setActivePreview: setActivePreviewComposable,
  clearActivePreview: clearActivePreviewComposable,
  clearActivePreviewImmediate,
  clearActivePreviewInstant,
  cleanupAfterFade,
  animationConfig
} = desktopPreview || mobileNoOpPreview

/**
 * Handle Vue Transition @after-leave hook
 * Cleans up slot state after fade animation completes
 */
const handlePreviewAfterLeave = (): void => {
  cleanupAfterFade()
}

// Track cursor and animate preview position (getBoundingClientRect accounts for ScrollSmoother)
// GSAP's overwrite: 'auto' handles conflicting animations gracefully
// MOBILE OPTIMIZATION: Skip on mobile - preview system not used
const handleMouseMove = (event: MouseEvent) => {
  // Skip cursor tracking on mobile (no preview system)
  if (isMobile.value) return

  cursorX.value = event.clientX
  cursorY.value = event.clientY

  if (!showPreview.value || !previewContainerRef.value || !sectionRef.value)
    return

  const sectionRect = sectionRef.value.getBoundingClientRect()
  const previewRect = previewContainerRef.value.getBoundingClientRect()

  const position = calculatePreviewPosition({
    cursorX: cursorX.value,
    cursorY: cursorY.value,
    sectionRect,
    previewRect,
    offsetX: animationConfig.position.offsetX,
    padding: animationConfig.position.padding,
    centerY: true
  })

  $gsap.to(previewContainerRef.value, {
    x: position.x,
    y: position.y,
    xPercent: 0,
    yPercent: 0,
    duration: 0.6,
    ease: 'power2.out',
    overwrite: 'auto'
  })
}

// Navigation is now handled via click interception in child items
// This ensures the clip-out animation completes before route change

// Provide preview control to child items (uses cursor from event, falls back to tracked position)
const setActivePreview = (preview) => {
  if (!preview) return
  setActivePreviewComposable(preview, {
    x: preview.cursorX ?? cursorX.value,
    y: preview.cursorY ?? cursorY.value
  })
}

const clearActivePreview = () => {
  clearActivePreviewComposable()
}

const router = useRouter()

/**
 * Navigate with clip-out animation
 * Intercepts navigation to ensure preview closes smoothly before route change
 */
const navigateWithAnimation = (to: string) => {
  /*
  console.log('🔴 navigateWithAnimation called', {
    showPreview: showPreview.value,
    isNavigating: isNavigating.value,
    to
  })
  */

  if (showPreview.value) {
    // Run clip-out animation, then navigate
    clearActivePreviewImmediate(() => {
      // console.log('✅ Animation complete, navigating to:', to)
      router.push(to)
    })
  }
  else {
    // No preview showing, navigate immediately
    // console.log('⏭️ No preview, navigating immediately to:', to)
    router.push(to)
  }
}

provide('setActivePreview', setActivePreview)
provide('clearActivePreview', clearActivePreview)
provide('navigateWithAnimation', navigateWithAnimation)

/**
 * Navigation guard to catch ALL navigation (not just NuxtLink clicks)
 * Handles: browser back/forward, programmatic navigation, keyboard navigation
 * Ensures clip-out animation completes before route change
 */
onBeforeRouteLeave((_to, _from, next) => {
  // If preview is showing and we haven't started navigation animation yet
  if (showPreview.value && !isNavigating.value) {
    // console.log('🛡️ onBeforeRouteLeave: Preview visible, running clip-out animation')
    // Run clip-out animation, then proceed with navigation
    clearActivePreviewImmediate(() => {
      // console.log('🛡️ onBeforeRouteLeave: Animation complete, proceeding')
      next()
    })
    return // Don't call next() yet - wait for animation
  }
  // Otherwise proceed immediately
  next()
})

// Entrance animation system (optional, for consistency with HeroSection)
const { setupEntrance } = useEntranceAnimation()

/**
 * Create reusable animation function for title + items
 * Used by both entrance animation and scroll animation
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline()

  // Animate title (fade + y offset)
  // Using .fromTo() to explicitly define both start and end states
  if (titleRef.value) {
    tl.fromTo(
      titleRef.value,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }
    )
  }

  // Animate items (stagger fade + y offset)
  // Query responsive items based on breakpoint:
  // - Mobile: .case-study-card (visible on mobile only)
  // - Desktop: .case-study-item (visible on desktop only)
  // Using .fromTo() to explicitly define both start and end states
  if (itemsListRef.value) {
    const selector = isMobile.value ? '.case-study-card' : '.case-study-item'
    const items = itemsListRef.value.querySelectorAll(selector)
    if (items.length > 0) {
      tl.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out'
        },
        '<+0.2' // Start 0.2s after title animation begins
      )
    }
  }

  return tl
}

/**
 * Create ScrollTrigger for title (separate from items)
 */
const createTitleScrollTrigger = (): void => {
  if (titleScrollTriggerInstance) {
    titleScrollTriggerInstance.kill()
    titleScrollTriggerInstance = null
  }

  if (!titleRef.value) return

  $gsap.set(titleRef.value, { clearProps: 'all' })
  $gsap.set(titleRef.value, { opacity: 0, y: 40 })

  const tl = $gsap.timeline()
  tl.fromTo(
    titleRef.value,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
  )

  titleScrollTriggerInstance = $ScrollTrigger.create({
    trigger: titleRef.value,
    start: 'top 85%',
    animation: tl,
    once: true
  })
}

/**
 * Create per-item ScrollTriggers
 * Each item animates independently when it enters viewport
 * Includes DrawSVG animation for FullWidthBorder (desktop only)
 */
const createItemScrollTriggers = (): void => {
  // Kill existing
  itemScrollTriggerInstances.forEach(st => st.kill())
  itemScrollTriggerInstances = []

  if (!itemsListRef.value) return

  const selector = isMobile.value ? '.case-study-card' : '.case-study-item'
  const items = itemsListRef.value.querySelectorAll(selector)

  if (items.length === 0) return

  // Clear and set initial state for items
  $gsap.set(items, { clearProps: 'all' })
  $gsap.set(items, { opacity: 0, y: 40 })

  // Create per-item triggers
  items.forEach((item, index) => {
    const tl = $gsap.timeline()

    // Find the SVG path inside this item's FullWidthBorder (desktop only)
    const borderPath = item.querySelector('.full-width-border-svg path')

    // Set initial DrawSVG state (hidden - 0% drawn)
    if (borderPath) {
      $gsap.set(borderPath, { drawSVG: '0%' })
    }

    // Animate item content (fade + y)
    tl.fromTo(
      item,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: index * 0.03 // Subtle stagger for items already in viewport
      }
    )

    // Animate border draw (left to right) - organic, unhurried feel
    if (borderPath) {
      tl.to(
        borderPath,
        {
          drawSVG: '0% 100%', // Draw from left (0%) to right (100%)
          duration: 1.6,
          ease: 'linear' // Fast start, gentle finish - feels natural
        },
        '<0.15' // Start slightly after content begins
      )
    }

    const st = $ScrollTrigger.create({
      trigger: item,
      start: 'top 85%',
      animation: tl,
      once: true
    })

    itemScrollTriggerInstances.push(st)
  })
}

/**
 * Create all scroll triggers (title + items)
 */
const createAllScrollTriggers = (): void => {
  createTitleScrollTrigger()
  createItemScrollTriggers()
}

/**
 * Cleanup all scroll triggers
 */
const cleanupAllScrollTriggers = (): void => {
  if (titleScrollTriggerInstance) {
    titleScrollTriggerInstance.kill()
    titleScrollTriggerInstance = null
  }
  itemScrollTriggerInstances.forEach(st => st.kill())
  itemScrollTriggerInstances = []
}

/**
 * Initialize scroll-triggered animations
 * Called by useScrollTriggerInit for proper page transition coordination
 */
const initScrollTriggers = () => {
  // Only run for scroll mode (entrance mode uses separate system)
  if (!props.animateOnScroll || props.animateEntrance) return
  if (!$ScrollTrigger || !sectionRef.value) return

  createAllScrollTriggers()
}

// Use abstraction composable for page transition coordination (scroll mode only)
useScrollTriggerInit(
  () => initScrollTriggers(),
  () => cleanupAllScrollTriggers()
)

// Hide preview smoothly when scrolling out of section (prevents stuck previews)
// Monitors cursor position continuously and hides with animation if outside section
onMounted(() => {
  // Setup entrance animation (separate from scroll mode)
  if (props.animateEntrance) {
    // ENTRANCE MODE: Use entrance animation system (first load only)
    // CSS will hide elements via html.is-first-load scoping
    if (sectionRef.value) {
      setupEntrance(sectionRef.value, {
        position: props.position,
        animate: () => createSectionAnimation()
      })
    }
  }

  // Recreate scroll triggers on breakpoint change (scroll mode only)
  if (props.animateOnScroll && !props.animateEntrance && $ScrollTrigger) {
    watch(isMobile, () => {
      if (itemScrollTriggerInstances.length > 0) {
        nextTick(() => {
          createAllScrollTriggers()
        })
      }
    })
  }

  // Scroll trigger for hiding preview (separate from entrance animation)
  // MOBILE OPTIMIZATION: Skip on mobile - preview system not used
  if ($ScrollTrigger && !isMobile.value) {
    $ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top top',
      end: 'bottom bottom',
      onLeave: () => {
        // User scrolled past section (down) - hide with smooth animation
        // Skip if navigation is in progress (clip animation running)
        if (showPreview.value && !isNavigating.value) {
          clearActivePreviewInstant()
        }
      },
      onLeaveBack: () => {
        // User scrolled past section (up) - hide with smooth animation
        // Skip if navigation is in progress (clip animation running)
        if (showPreview.value && !isNavigating.value) {
          clearActivePreviewInstant()
        }
      }
      // Note: No onUpdate callback - it caused preview to hide during scroll
      // because cursor position doesn't update while scrolling (no mousemove events).
      // Rely on mouseleave events and onLeave/onLeaveBack instead.
    })
  }
})
</script>
