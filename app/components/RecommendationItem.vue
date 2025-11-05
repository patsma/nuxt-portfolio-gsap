<template>
  <div class="recommendation-item full-width-content">
    <!-- FullWidthBorder (top divider) -->
    <FullWidthBorder :opacity="10" />

    <!-- Clickable row wrapper (breakout3 within sub-grid) -->
    <button
      @click="toggle"
      class="recommendation-row full-width w-full text-left cursor-pointer py-[var(--space-s)] md:py-[var(--space-m)] transition-opacity duration-[var(--duration-hover)] hover:opacity-80"
    >
      <!-- Full-width marquee container with all elements -->
      <div
        ref="marqueeContainerRef"
        class="marquee-container breakout3"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div ref="marqueeTrackRef" class="marquee-track">
          <!-- Unit 1: Quote → Image → Name -->
          <span class="marquee-text italic pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
            {{ quote }}
          </span>
          <img
            v-if="authorImage"
            :src="authorImage"
            :alt="`${authorFirstName} ${authorLastName}`"
            class="marquee-image"
          />
          <span class="marquee-author-name text-[var(--theme-text-100)]">
            <span class="author-first-name ibm-plex-sans-jp-mobile-h2-enlarged md:ibm-plex-sans-jp-laptop-h2-enlarged 2xl:ibm-plex-sans-jp-desktop-h2-enlarged">{{ authorFirstName }}</span><span class="author-last-name pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged">{{ authorLastName }}</span>
          </span>

          <!-- Unit 2: Quote → Image → Name (duplicate) -->
          <span class="marquee-text italic pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
            {{ quote }}
          </span>
          <img
            v-if="authorImage"
            :src="authorImage"
            :alt="`${authorFirstName} ${authorLastName}`"
            class="marquee-image"
          />
          <span class="marquee-author-name text-[var(--theme-text-100)]">
            <span class="author-first-name ibm-plex-sans-jp-mobile-h2-enlarged md:ibm-plex-sans-jp-laptop-h2-enlarged 2xl:ibm-plex-sans-jp-desktop-h2-enlarged">{{ authorFirstName }}</span><span class="author-last-name pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged">{{ authorLastName }}</span>
          </span>

          <!-- Unit 3: Quote → Image → Name (duplicate) -->
          <span class="marquee-text italic pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged text-[var(--theme-text-60)]">
            {{ quote }}
          </span>
          <img
            v-if="authorImage"
            :src="authorImage"
            :alt="`${authorFirstName} ${authorLastName}`"
            class="marquee-image"
          />
          <span class="marquee-author-name text-[var(--theme-text-100)]">
            <span class="author-first-name ibm-plex-sans-jp-mobile-h2-enlarged md:ibm-plex-sans-jp-laptop-h2-enlarged 2xl:ibm-plex-sans-jp-desktop-h2-enlarged">{{ authorFirstName }}</span><span class="author-last-name pp-eiko-mobile-h2-enlarged md:pp-eiko-laptop-h2-enlarged 2xl:pp-eiko-desktop-h2-enlarged">{{ authorLastName }}</span>
          </span>
        </div>
      </div>
    </button>

    <!-- Expanded content (GSAP animated height, initially hidden) -->
    <div
      ref="expandedContentRef"
      class="expanded-content overflow-hidden breakout3"
      style="height: 0; opacity: 0;"
    >
      <div class="expanded-inner py-[var(--space-l)] grid gap-[var(--space-m)] lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-3xl)] items-start">
        <!-- Left column: Author title (matches BiographySection label pattern) -->
        <p class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
          {{ authorTitle }}
        </p>

        <!-- Right column: Full recommendation text (ready for future markdown support) -->
        <div class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2 text-[var(--theme-text-100)] leading-relaxed space-y-[var(--space-m)]">
          <p>{{ fullRecommendation }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * RecommendationItem Component - Individual Recommendation Entry
 *
 * Displays a single recommendation with infinite horizontal marquee animation
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
 * @param {string} quote - Short quote text for marquee
 * @param {string} fullRecommendation - Full recommendation text when expanded
 * @param {string} authorFirstName - Recommender's first name (styled with IBM Plex Sans JP)
 * @param {string} authorLastName - Recommender's last name (styled with PP Eiko)
 * @param {string} authorTitle - Recommender's title/company
 * @param {string} authorImage - Recommender's profile image URL
 *
 * Accordion Pattern:
 * - Injects activeItemId and setActiveItem from parent RecommendationsSection
 * - isExpanded computed property checks if this item is active
 * - Watches isExpanded to animate height/opacity with GSAP
 * - Only one item can be expanded at a time
 *
 * Marquee Pattern:
 * - GSAP infinite animation with ScrollTrigger control
 * - Structure: Each unit contains quote (italic) → author image → author name (mixed typography)
 * - Direction: Even index (0,2,4) scrolls left-to-right (forward), odd index (1,3,5) scrolls right-to-left (reversed)
 * - Uses 'reversed' config in horizontalLoop (NOT negative speed which breaks GSAP durations)
 * - Starts when item enters viewport, stops when leaves
 * - Pauses on hover, resumes on leave (if still in viewport)
 * - Duplicates complete unit (quote + image + name) 3 times for seamless loop
 * - Typography: Quote is italic PP Eiko, first name is IBM Plex JP, last name is PP Eiko
 *
 * Usage:
 * <RecommendationItem
 *   id="rec-1"
 *   :index="0"
 *   quote="An extraordinary individual"
 *   full-recommendation="I worked closely with Morten..."
 *   author-first-name="Thomas"
 *   author-last-name="Rømhild"
 *   author-title="CEO, Bærnholdt"
 *   author-image="/images/authors/thomas.jpg"
 * />
 */

const props = defineProps({
  /**
   * Unique identifier for this recommendation (used for accordion state)
   * @type {string}
   */
  id: {
    type: String,
    required: true,
  },
  /**
   * Item index (0-based) for determining scroll direction
   * Even index (0,2,4) = scroll left-to-right, Odd index (1,3,5) = scroll right-to-left
   * @type {number}
   */
  index: {
    type: Number,
    required: true,
  },
  /**
   * Short quote text to display in the marquee
   * @type {string}
   */
  quote: {
    type: String,
    required: true,
  },
  /**
   * Full recommendation text shown when expanded
   * @type {string}
   */
  fullRecommendation: {
    type: String,
    required: true,
  },
  /**
   * Recommender's first name (styled with IBM Plex Sans JP)
   * @type {string}
   */
  authorFirstName: {
    type: String,
    required: true,
  },
  /**
   * Recommender's last name (styled with PP Eiko)
   * @type {string}
   */
  authorLastName: {
    type: String,
    required: true,
  },
  /**
   * Recommender's title and/or company
   * @type {string}
   */
  authorTitle: {
    type: String,
    required: true,
  },
  /**
   * Recommender's profile image URL
   * @type {string}
   */
  authorImage: {
    type: String,
    default: '',
  },
});

const nuxtApp = useNuxtApp();
const { $gsap, $ScrollTrigger } = nuxtApp;

// Horizontal loop composable for marquee animation (pass GSAP instance)
const { createLoop } = useHorizontalLoop($gsap);

// Inject accordion state from parent RecommendationsSection
const activeItemId = inject('activeItemId');
const setActiveItem = inject('setActiveItem');

// Refs for DOM elements
const marqueeContainerRef = ref(null);
const marqueeTrackRef = ref(null);
const expandedContentRef = ref(null);

// Marquee animation instances
let marqueeAnimation = null;
let scrollTriggerInstance = null;

// Computed property to check if this item is currently expanded
const isExpanded = computed(() => activeItemId.value === props.id);

/**
 * Toggle accordion expansion
 * If already expanded, collapse it
 * If collapsed, expand it and close others
 */
const toggle = () => {
  setActiveItem(isExpanded.value ? null : props.id);
};


/**
 * Setup marquee animation with ScrollTrigger control
 * Uses horizontalLoop helper for seamless infinite scrolling
 * Alternating directions: even index (0,2,4) left-to-right, odd index (1,3,5) right-to-left
 */
onMounted(() => {
  if (!marqueeTrackRef.value || !marqueeContainerRef.value) return;

  // Wait for next tick to ensure DOM is fully rendered
  nextTick(() => {
    // Get all children in the track (should be 9 elements: 3 quotes + 3 images + 3 names)
    const items = marqueeTrackRef.value.querySelectorAll('.marquee-text, .marquee-image, .marquee-author-name');
    if (items.length === 0) return;

    // Create seamless loop using useHorizontalLoop composable
    // Alternate directions: even index (0,2,4) = left-to-right, odd index (1,3,5) = right-to-left
    // IMPORTANT: Use 'reversed' config, NOT negative speed (negative speed breaks GSAP durations)
    const shouldReverse = props.index % 2 !== 0;

    // Calculate gap size to match CSS var(--space-l-xl) = clamp(36px, 48px, 66px)
    // Use middle value for consistent spacing between loop cycles
    const gapSize = 48; // Matches Figma spec, middle of fluid range

    marqueeAnimation = createLoop(items, {
      repeat: -1, // Infinite repeat
      speed: 1, // Always positive - direction controlled by 'reversed' config
      reversed: shouldReverse, // true = right-to-left, false = left-to-right
      paddingRight: gapSize, // Add gap between loop cycles for seamless connection
      paused: true, // Start paused
    });

    // Debug: Uncomment to verify marquee direction setup
    // console.log(`🎬 Marquee ${props.index}: ${shouldReverse ? 'REVERSED (right-to-left)' : 'FORWARD (left-to-right)'}, tl.reversed()=${marqueeAnimation.reversed()}, timeScale=${marqueeAnimation.timeScale()}`);

    // ScrollTrigger: Control marquee based on viewport visibility
    // IMPORTANT: Use resume() instead of play() to respect reversed state
    // play() resets direction to forward, resume() continues in current direction
    scrollTriggerInstance = $ScrollTrigger.create({
      trigger: marqueeContainerRef.value,
      start: 'top bottom', // Starts when top of element enters bottom of viewport
      end: 'bottom top', // Ends when bottom of element leaves top of viewport
      onEnter: () => {
        // Element entered viewport from below - start animation
        marqueeAnimation?.resume();
      },
      onLeave: () => {
        // Element left viewport from top - pause animation
        marqueeAnimation?.pause();
      },
      onEnterBack: () => {
        // Element re-entered viewport from above - resume animation
        marqueeAnimation?.resume();
      },
      onLeaveBack: () => {
        // Element left viewport from bottom - pause animation
        marqueeAnimation?.pause();
      },
    });
  });
});

/**
 * Pause marquee on hover
 */
const handleMouseEnter = () => {
  marqueeAnimation?.pause();
};

/**
 * Resume marquee on mouse leave
 * Only if element is still in viewport (ScrollTrigger is active)
 * IMPORTANT: Use resume() to respect reversed state
 */
const handleMouseLeave = () => {
  if (scrollTriggerInstance?.isActive) {
    marqueeAnimation?.resume();
  }
};

/**
 * Watch expanded state and animate height/opacity
 * Uses GSAP for smooth animations
 * IMPORTANT: Pauses headroom during animation to prevent header from reacting to height changes
 * IMPORTANT: Refreshes ScrollTrigger after animation to recalculate positions
 * This prevents pinning issues in subsequent scroll-based sections (ImageScalingSection, VideoScalingSection)
 */
watch(isExpanded, (expanded) => {
  if (!expandedContentRef.value) return;

  console.log('[Accordion] Starting animation, expanded:', expanded);

  // Pause headroom before animation starts to prevent header from reacting to content height changes
  nuxtApp.$headroom?.pause();

  if (expanded) {
    // Expand: Animate to auto height with opacity fade in
    $gsap.to(expandedContentRef.value, {
      height: 'auto',
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        console.log('[Accordion] Expand complete, refreshing ScrollTrigger');
        // Refresh ScrollTrigger after expansion completes
        // This recalculates all ScrollTrigger positions affected by height change
        $ScrollTrigger.refresh();

        console.log('[Accordion] Waiting for ScrollSmoother to settle (300ms)');
        // Wait longer (300ms) for ScrollSmoother to fully settle after refresh
        // ScrollTrigger.refresh() causes scroll position recalculations that take time to stabilize
        setTimeout(() => {
          console.log('[Accordion] Calling unpause now');
          nuxtApp.$headroom?.unpause();
        }, 300);
      },
    });
  } else {
    // Collapse: Animate to 0 height with opacity fade out
    $gsap.to(expandedContentRef.value, {
      height: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        console.log('[Accordion] Collapse complete, refreshing ScrollTrigger');
        // Refresh ScrollTrigger after collapse completes
        $ScrollTrigger.refresh();

        console.log('[Accordion] Waiting for ScrollSmoother to settle (300ms)');
        // Wait longer (300ms) for ScrollSmoother to fully settle after refresh
        // ScrollTrigger.refresh() causes scroll position recalculations that take time to stabilize
        setTimeout(() => {
          console.log('[Accordion] Calling unpause now');
          nuxtApp.$headroom?.unpause();
        }, 300);
      },
    });
  }
});

// Cleanup animations on unmount
onUnmounted(() => {
  if (marqueeAnimation) {
    marqueeAnimation.kill();
    marqueeAnimation = null;
  }
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
});
</script>

<style scoped>
/**
 * Recommendation item styles
 * Similar to InteractiveCaseStudySection pattern with marquee and accordion
 */

.recommendation-item {
  position: relative;
}

/**
 * Clickable row (replaces separate button)
 * Entire row is clickable to expand/collapse
 */
.recommendation-row {
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
 * Contains repeating units of quote → image → name
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
 * Marquee text (quote)
 * PP Eiko Italic Thin typography from Figma
 * Typography handled by utility classes (pp-eiko-*-h2-enlarged)
 */
.marquee-text {
  display: inline-block;
  white-space: nowrap;
}

/**
 * Marquee image (author photo within marquee)
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
 * Marquee author name container
 * Contains first name (IBM Plex) + last name (PP Eiko)
 * Uses inline-flex with gap for proper spacing between names
 * Baseline alignment ensures both names sit on the same baseline despite different fonts
 */
.marquee-author-name {
  display: inline-flex;
  align-items: baseline; /* Align different fonts to same baseline */
  gap: var(--space-s); /* Fluid spacing: 5-6px between first and last name */
  white-space: nowrap;
}

/**
 * Author name typography from Figma
 * First name: IBM Plex Sans JP ExtraLight (200) - utility class has weight 400, override needed
 * Last name: PP Eiko Thin (100) with tracking - handled by utility classes
 * Gap between names: var(--space-3xs) fluid token from parent flex container
 */
.author-first-name {
  font-weight: 200; /* ExtraLight weight from Figma - override utility default */
  white-space: nowrap; /* Prevent name from breaking */
}

.author-last-name {
  white-space: nowrap; /* Prevent name from breaking */
}

/**
 * Expanded content
 * Initially hidden, animated by GSAP
 * Uses BiographySection-style 2-column grid pattern
 */
.expanded-content {
  /* margin-top: var(--space-s); */
}

.expanded-inner {
  /* Grid layout handled by Tailwind utility classes */
  /* Ready for future markdown content rendering */
}
</style>
