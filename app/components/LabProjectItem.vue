<template>
  <div class="recommendation-item lab-project-item full-width-content">
    <!-- FullWidthBorder (top divider) -->
    <FullWidthBorder :opacity="10" />

    <!-- Clickable row wrapper (breakout3 within sub-grid) -->
    <button
      type="button"
      class="lab-project-row full-width w-full text-left cursor-pointer py-[var(--space-s)] md:py-[var(--space-m)] transition-opacity duration-[var(--duration-hover)] hover:opacity-80"
      @click="toggle"
    >
      <!-- Full-width marquee container with all elements -->
      <div
        ref="marqueeContainerRef"
        class="marquee-container breakout3"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div
          ref="marqueeTrackRef"
          class="marquee-track"
        >
          <!-- Unit 1: Title (italic) → Thumbnail Image -->
          <span class="marquee-text italic pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
            {{ shortTitle }}
          </span>
          <img
            v-if="thumbnail"
            :src="thumbnail"
            :alt="shortTitle"
            class="marquee-image"
          >

          <!-- Unit 2: Title (italic) → Thumbnail Image (duplicate) -->
          <span class="marquee-text italic pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
            {{ shortTitle }}
          </span>
          <img
            v-if="thumbnail"
            :src="thumbnail"
            :alt="shortTitle"
            class="marquee-image"
          >

          <!-- Unit 3: Title (italic) → Thumbnail Image (duplicate) -->
          <span class="marquee-text italic pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
            {{ shortTitle }}
          </span>
          <img
            v-if="thumbnail"
            :src="thumbnail"
            :alt="shortTitle"
            class="marquee-image"
          >
        </div>
      </div>
    </button>

    <!-- Expanded content (GSAP animated height, initially hidden) -->
    <div
      ref="expandedContentRef"
      class="expanded-content overflow-hidden breakout3"
      style="height: 0; opacity: 0;"
    >
      <div class="expanded-inner py-[var(--space-l)] flex flex-col gap-[var(--space-l)]">
        <!-- Title (big, full width) -->
        <h3 class="pp-eiko-mobile-h1 md:pp-eiko-laptop-h1 2xl:pp-eiko-desktop-h1 text-[var(--theme-text-100)]">
          {{ fullTitle }}
        </h3>

        <!-- Large image (full width, 1184:666 aspect ratio from design) -->
        <div class="overflow-hidden rounded-lg aspect-[1184/666]">
          <NuxtImg
            :src="cover || thumbnail"
            :alt="fullTitle"
            class="w-full h-full object-cover"
            loading="lazy"
            sizes="100vw md:90vw lg:80vw"
          />
        </div>

        <!-- Tags (below image) -->
        <div
          v-if="tags?.length"
          class="flex flex-wrap gap-[var(--space-xs)]"
        >
          <span
            v-for="tag in tags"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Description + Arrow row -->
        <div class="grid grid-cols-[1fr_auto] md:grid-cols-[10fr_1fr] gap-[var(--space-xl)] md:gap-[var(--space-2xl)] items-start">
          <!-- Left: Description -->
          <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2 text-[var(--theme-text-60)] leading-relaxed">
            {{ description }}
          </p>

          <!-- Right: Link button -->
          <NuxtLink
            :to="`/lab/${slug}`"
            class="inline-block justify-self-end"
            @click.stop
          >
            <ScrollButtonSVG direction="right" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LabProjectItem Component - Individual Lab Project Entry
 *
 * Displays a single lab project with infinite horizontal marquee animation
 * and accordion-style expand/collapse functionality.
 *
 * Features:
 * - Infinite horizontal marquee scrolling (pause on hover)
 * - Alternating scroll directions based on item index
 * - ScrollTrigger controls marquee start/stop based on visibility
 * - Accordion expansion (only one item open at a time via parent)
 * - GSAP height animations for smooth expand/collapse
 * - FullWidthBorder integration
 * - Theme-aware colors and responsive typography
 *
 * Props:
 * @param {string} id - Unique identifier for accordion state
 * @param {number} index - Item index for alternating scroll direction
 * @param {string} slug - URL slug for navigation
 * @param {string} shortTitle - Short title for marquee (italic)
 * @param {string} fullTitle - Full title shown when expanded
 * @param {string} thumbnail - Small image URL for marquee
 * @param {string} cover - Large image URL for expanded view (optional)
 * @param {string} description - Description text when expanded
 * @param {string[]} tags - Optional tags to display
 *
 * Accordion Pattern:
 * - Injects activeItemId and setActiveItem from parent LabSection
 * - isExpanded computed property checks if this item is active
 * - Watches isExpanded to animate height/opacity with GSAP
 * - Only one item can be expanded at a time
 *
 * Marquee Pattern:
 * - GSAP infinite animation with ScrollTrigger control
 * - Structure: title (italic) → thumbnail image (repeated 3x)
 * - Direction: Even index (0,2,4) scrolls left-to-right, odd index (1,3,5) scrolls right-to-left
 * - Uses 'reversed' config in horizontalLoop (NOT negative speed)
 * - Starts when item enters viewport, stops when leaves
 * - Pauses on hover, resumes on leave
 *
 * Usage:
 * <LabProjectItem
 *   id="project-1"
 *   :index="0"
 *   slug="design-system"
 *   short-title="Advanced design system"
 *   full-title="Advanced design system for websites"
 *   thumbnail="/assets/lab/thumb.jpg"
 *   description="A comprehensive design system..."
 *   :tags="['figma', 'ui']"
 * />
 */

const props = defineProps({
  /**
   * Unique identifier for this lab project (used for accordion state)
   * @type {string}
   */
  id: {
    type: String,
    required: true
  },
  /**
   * Item index (0-based) for determining scroll direction
   * Even index (0,2,4) = scroll left-to-right, Odd index (1,3,5) = scroll right-to-left
   * @type {number}
   */
  index: {
    type: Number,
    required: true
  },
  /**
   * URL slug for navigation to detail page
   * @type {string}
   */
  slug: {
    type: String,
    required: true
  },
  /**
   * Short title text to display in the marquee (italic)
   * @type {string}
   */
  shortTitle: {
    type: String,
    required: true
  },
  /**
   * Full title shown when expanded
   * @type {string}
   */
  fullTitle: {
    type: String,
    required: true
  },
  /**
   * Thumbnail image URL for marquee
   * @type {string}
   */
  thumbnail: {
    type: String,
    required: true
  },
  /**
   * Large cover image URL for expanded view (falls back to thumbnail)
   * @type {string}
   */
  cover: {
    type: String,
    default: ''
  },
  /**
   * Description text shown when expanded
   * @type {string}
   */
  description: {
    type: String,
    required: true
  },
  /**
   * Optional tags to display
   * @type {string[]}
   */
  tags: {
    type: Array,
    default: () => []
  }
})

const nuxtApp = useNuxtApp()
const { $gsap, $ScrollTrigger } = nuxtApp

// Horizontal loop composable for marquee animation (pass GSAP instance)
const { createLoop } = useHorizontalLoop($gsap)

// Inject accordion state from parent LabSection
const activeItemId = inject<Ref<string | null>>('activeItemId')
const setActiveItem = inject<((id: string | null) => void) | undefined>('setActiveItem')
const requestRefresh = inject<((callback?: () => void) => void) | undefined>('requestRefresh')

// Refs for DOM elements
const marqueeContainerRef = ref(null)
const marqueeTrackRef = ref(null)
const expandedContentRef = ref(null)

// Marquee animation instances
let marqueeAnimation = null
let scrollTriggerInstance = null

// Computed property to check if this item is currently expanded
const isExpanded = computed(() => activeItemId?.value === props.id)

/**
 * Toggle accordion expansion
 * If already expanded, collapse it
 * If collapsed, expand it and close others
 */
const toggle = (event: Event | undefined) => {
  // Prevent any default behavior
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  setActiveItem?.(isExpanded.value ? null : props.id)
}

/**
 * Setup marquee animation with ScrollTrigger control
 * Uses horizontalLoop helper for seamless infinite scrolling
 * Alternating directions: even index (0,2,4) left-to-right, odd index (1,3,5) right-to-left
 */
onMounted(() => {
  if (!marqueeTrackRef.value || !marqueeContainerRef.value) return

  // Wait for next tick to ensure DOM is fully rendered
  nextTick(() => {
    // Get all children in the track (should be 6 elements: 3 titles + 3 images)
    const items = marqueeTrackRef.value.querySelectorAll('.marquee-text, .marquee-image')
    if (items.length === 0) return

    // Create seamless loop using useHorizontalLoop composable
    // Alternate directions: even index (0,2,4) = left-to-right, odd index (1,3,5) = right-to-left
    // IMPORTANT: Use 'reversed' config, NOT negative speed (negative speed breaks GSAP durations)
    const shouldReverse = props.index % 2 !== 0

    // Calculate gap size to match CSS var(--space-l-xl) = clamp(36px, 48px, 66px)
    // Use middle value for consistent spacing between loop cycles
    const gapSize = 48 // Matches Figma spec, middle of fluid range

    marqueeAnimation = createLoop(items, {
      repeat: -1, // Infinite repeat
      speed: 1, // Always positive - direction controlled by 'reversed' config
      reversed: shouldReverse, // true = right-to-left, false = left-to-right
      paddingRight: gapSize, // Add gap between loop cycles for seamless connection
      paused: true // Start paused
    })

    // ScrollTrigger: Control marquee based on viewport visibility
    // IMPORTANT: Use resume() instead of play() to respect reversed state
    // play() resets direction to forward, resume() continues in current direction
    scrollTriggerInstance = $ScrollTrigger.create({
      trigger: marqueeContainerRef.value,
      start: 'top bottom', // Starts when top of element enters bottom of viewport
      end: 'bottom top', // Ends when bottom of element leaves top of viewport
      onEnter: () => {
        // Element entered viewport from below - start animation
        marqueeAnimation?.resume()
      },
      onLeave: () => {
        // Element left viewport from top - pause animation
        marqueeAnimation?.pause()
      },
      onEnterBack: () => {
        // Element re-entered viewport from above - resume animation
        marqueeAnimation?.resume()
      },
      onLeaveBack: () => {
        // Element left viewport from bottom - pause animation
        marqueeAnimation?.pause()
      }
    })
  })
})

/**
 * Pause marquee on hover
 */
const handleMouseEnter = () => {
  marqueeAnimation?.pause()
}

/**
 * Resume marquee on mouse leave
 * Only if element is still in viewport (ScrollTrigger is active)
 * IMPORTANT: Use resume() to respect reversed state
 */
const handleMouseLeave = () => {
  if (scrollTriggerInstance?.isActive) {
    marqueeAnimation?.resume()
  }
}

/**
 * Watch expanded state and animate height/opacity
 * Uses GSAP for smooth animations
 * IMPORTANT: Pauses headroom during animation to prevent header from reacting to height changes
 * IMPORTANT: Refreshes ScrollTrigger after animation to recalculate positions
 */
watch(isExpanded, (expanded) => {
  if (!expandedContentRef.value) return

  // Check if page transition is active (this should NOT be happening during accordion)
  const pageTransitionStore = usePageTransitionStore()
  if (pageTransitionStore?.isTransitioning) {
    console.error('[LabProjectItem] WARNING: Page transition is ACTIVE during accordion animation!', {
      id: props.id,
      isTransitioning: pageTransitionStore.isTransitioning
    })
  }

  // Pause headroom before animation starts to prevent header from reacting to content height changes
  nuxtApp.$headroom?.pause()

  if (expanded) {
    // Expand: Animate to auto height with opacity fade in
    $gsap.to(expandedContentRef.value, {
      height: 'auto',
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        // Request refresh for pinned sections below (ImageScalingSection, etc.)
        requestRefresh?.(() => {
          nuxtApp.$headroom?.unpause()
        })
      }
    })
  }
  else {
    // Collapse: Animate to 0 height with opacity fade out
    $gsap.to(expandedContentRef.value, {
      height: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        // Request refresh for pinned sections below (ImageScalingSection, etc.)
        requestRefresh?.(() => {
          nuxtApp.$headroom?.unpause()
        })
      }
    })
  }
})

// Cleanup animations on unmount
onUnmounted(() => {
  if (marqueeAnimation) {
    marqueeAnimation.kill()
    marqueeAnimation = null
  }
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }
})
</script>

<style scoped>
/**
 * Lab project item styles
 * Similar to RecommendationItem pattern with marquee and accordion
 */

.lab-project-item {
  position: relative;
}

/**
 * Clickable row (replaces separate button)
 * Entire row is clickable to expand/collapse
 */
.lab-project-row {
  background: transparent;
  border: none;
}

/**
 * Marquee container
 * Hides overflow for infinite scroll effect
 */
.marquee-container {
  overflow: hidden;
  width: 100%;
  cursor: pointer;
}

/**
 * Marquee track
 * Contains repeating units of title → image
 * Uses fluid spacing that scales from 36-66px (centered around Figma's 48px spec)
 */
.marquee-track {
  display: inline-flex;
  gap: var(--space-l-xl); /* Fluid gap: 36px → 66px (Figma spec ~48px) */
  align-items: center; /* Vertically center all elements */
  white-space: nowrap;
  will-change: transform; /* Performance optimization */
}

/**
 * Marquee text (project title)
 * PP Eiko Italic Thin typography from Figma
 * Typography handled by utility classes (pp-eiko-*-h2-enlarged)
 */
.marquee-text {
  display: inline-block;
  white-space: nowrap;
}

/**
 * Marquee image (project thumbnail within marquee)
 * Fluid responsive dimensions maintaining ~1.775:1 aspect ratio
 * Figma base: 213×120px, scales fluidly across viewports
 * Border scales from 1px → 2px for high-res displays
 */
.marquee-image {
  width: clamp(10.625rem, 10rem + 2.6vw, 13.3125rem); /* 170px → 213px → 213px */
  height: clamp(6rem, 5.65rem + 1.5vw, 7.5rem); /* 96px → 120px → 120px */
  border-radius: clamp(0.25rem, 0.2rem + 0.2vw, 0.375rem); /* 4px → 6px fluid */
  object-fit: cover;
  flex-shrink: 0;
  flex-grow: 0;
  border: clamp(0.0625rem, 0.05rem + 0.05vw, 0.125rem) solid var(--theme-15); /* 1px → 2px fluid */
}

/**
 * Expanded content
 * Initially hidden, animated by GSAP
 * Uses 2-column grid pattern
 */
.expanded-content {
  /* Height and opacity controlled by GSAP */
}

.expanded-inner {
  /* Grid layout handled by Tailwind utility classes */
}
</style>
