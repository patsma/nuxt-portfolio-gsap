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
      v-page-stagger="{ selector: '.case-study-item', stagger: 0.08, leaveOnly: true }"
      class="case-study-list full-width-content"
    >
      <slot />
    </div>

    <!-- Teleport to body for scroll support, visibility with smooth fade transition -->
    <Teleport
      v-if="previewMounted"
      to="body"
    >
      <Transition name="preview-fade">
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
              loading="eager"
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
              loading="eager"
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
              loading="eager"
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
const loadingStore = useLoadingStore()
const pageTransitionStore = usePageTransitionStore()
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

let scrollTriggerInstance = null

const getRefs = () => ({
  sectionRef: sectionRef.value,
  previewContainerRef: previewContainerRef.value,
  slotARefs: slotARef.value,
  slotBRefs: slotBRef.value,
  slotCRefs: slotCRef.value
})

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
  animationConfig
} = useInteractiveCaseStudyPreview({
  gsap: $gsap,
  getRefs,
  getCursor: () => ({ x: cursorX.value, y: cursorY.value })
})

// Track cursor and animate preview position (getBoundingClientRect accounts for ScrollSmoother)
// GSAP's overwrite: 'auto' handles conflicting animations gracefully
const handleMouseMove = (event: MouseEvent) => {
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
  console.log('🔴 navigateWithAnimation called', {
    showPreview: showPreview.value,
    isNavigating: isNavigating.value,
    to
  })

  if (showPreview.value) {
    // Run clip-out animation, then navigate
    clearActivePreviewImmediate(() => {
      console.log('✅ Animation complete, navigating to:', to)
      router.push(to)
    })
  }
  else {
    // No preview showing, navigate immediately
    console.log('⏭️ No preview, navigating immediately to:', to)
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
    console.log('🛡️ onBeforeRouteLeave: Preview visible, running clip-out animation')
    // Run clip-out animation, then proceed with navigation
    clearActivePreviewImmediate(() => {
      console.log('🛡️ onBeforeRouteLeave: Animation complete, proceeding')
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

// Hide preview smoothly when scrolling out of section (prevents stuck previews)
// Monitors cursor position continuously and hides with animation if outside section
onMounted(() => {
  // Setup entrance or scroll animation
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
  else if (props.animateOnScroll) {
    // SCROLL MODE: Animate when scrolling into view (default)
    // Timeline is linked to ScrollTrigger for smooth forward/reverse playback
    // Pattern: Kill and recreate ScrollTrigger after page transitions for fresh DOM queries
    if ($ScrollTrigger && sectionRef.value) {
      // Create/recreate ScrollTrigger with fresh element queries
      const createScrollTrigger = () => {
        // Kill existing ScrollTrigger if present
        if (scrollTriggerInstance) {
          scrollTriggerInstance.kill()
          scrollTriggerInstance = null
        }

        // CRITICAL: Clear inline GSAP styles from page transitions
        // The v-page-stagger directive leaves inline styles (opacity, transform) on elements
        // Clear them, then explicitly set initial hidden state before ScrollTrigger takes over
        if (titleRef.value) {
          $gsap.set(titleRef.value, { clearProps: 'all' })
          $gsap.set(titleRef.value, { opacity: 0, y: 40 })
        }
        if (itemsListRef.value) {
          const selector = isMobile.value
            ? '.case-study-card'
            : '.case-study-item'
          const items = itemsListRef.value.querySelectorAll(selector)
          if (items.length > 0) {
            $gsap.set(items, { clearProps: 'all' })
            $gsap.set(items, { opacity: 0, y: 40 })
          }
        }

        // Create timeline with fromTo() defining both start and end states
        // Initial state already set above, timeline will animate based on scroll position
        const scrollTimeline = createSectionAnimation()

        // Create ScrollTrigger with animation timeline
        scrollTriggerInstance = $ScrollTrigger.create({
          trigger: sectionRef.value,
          start: 'top center', // Animate when section is 80% down viewport
          end: 'bottom top+=25%', // Complete animation when bottom of section reaches top of viewport
          animation: scrollTimeline, // Link timeline to scroll position
          toggleActions: 'play pause resume reverse',
          // scrub: 0.5, // Smooth scrubbing with 0.5s delay for organic feel
          invalidateOnRefresh: true // Recalculate on window resize/refresh
        })
      }

      // Coordinate with page transition system
      // First load: Create immediately after mount
      // Navigation: Recreate after page transition completes
      if (loadingStore.isFirstLoad) {
        nextTick(() => {
          createScrollTrigger()
        })
      }
      else {
        // After page navigation, wait for page transition to complete
        // Watch pageTransitionStore.isTransitioning for proper timing
        const unwatch = watch(
          () => pageTransitionStore.isTransitioning,
          (isTransitioning) => {
            // When transition completes (isTransitioning becomes false), recreate ScrollTrigger
            if (!isTransitioning) {
              nextTick(() => {
                createScrollTrigger()
              })
              unwatch() // Stop watching
            }
          },
          { immediate: true }
        )
      }

      // Watch for breakpoint changes to recreate ScrollTrigger with correct selector
      // This handles viewport resize between mobile and desktop breakpoints
      watch(isMobile, () => {
        if (scrollTriggerInstance) {
          nextTick(() => {
            createScrollTrigger()
          })
        }
      })
    }
  }

  // Scroll trigger for hiding preview (separate from entrance animation)
  if ($ScrollTrigger) {
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

// Cleanup ScrollTrigger on unmount
onUnmounted(() => {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }
})
</script>
