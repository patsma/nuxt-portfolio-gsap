<template>
  <!-- Desktop: List item with hover (full-width-content creates sub-grid) -->
  <NuxtLink
    :to="to"
    class="case-study-item full-width-content hidden md:block"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Animated border line (full-width within sub-grid) -->
    <div class="item-border-line full-width"></div>

    <!-- Content wrapper (breakout3 within sub-grid) -->
    <div class="item-content breakout3">
      <!-- Left: Title + Tag -->
      <div class="item-title-col">
        <h2 class="item-title pp-eiko-desktop-h2">
          {{ title }}
        </h2>
        <span
          v-if="tag"
          class="item-tag ibm-plex-sans-jp-desktop-custom-labels"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Right: Description -->
      <div class="item-description-col">
        <p class="item-description ibm-plex-sans-jp-desktop-p1">
          {{ description }}
        </p>
      </div>
    </div>
  </NuxtLink>

  <!-- Mobile: Card with image -->
  <NuxtLink
    :to="to"
    class="case-study-card flex md:hidden"
    v-page-clip:bottom="{ duration: 0.8 }"
  >
    <div class="card-image-container">
      <NuxtImg
        :src="image"
        :alt="imageAlt"
        class="card-image"
        loading="lazy"
      />
    </div>
    <div class="card-content">
      <div class="card-header">
        <h2 class="card-title pp-eiko-mobile-h2">
          {{ title }}
        </h2>
        <span
          v-if="tag"
          class="card-tag ibm-plex-sans-jp-mobile-custom-labels"
        >
          {{ tag }}
        </span>
      </div>
      <p class="card-description ibm-plex-sans-jp-mobile-p1">
        {{ description }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup>
/**
 * InteractiveCaseStudyItem Component - Individual Case Study Entry
 *
 * Represents a single case study in the gallery.
 * Responsive component with different layouts for desktop and mobile.
 *
 * Desktop (md and up):
 * - List item with two-column layout (title left, description right)
 * - Hover triggers clip-path preview in parent container
 * - Subtle theme-aware background on hover (8% opacity)
 *
 * Mobile:
 * - Card with image, title, and description
 * - Image scales on touch/active state
 * - Uses v-page-clip directive for page transitions
 *
 * Props:
 * - title: Project title (required)
 * - tag: Optional tag (e.g., "APP", "INTRANET", "REDESIGN")
 * - description: Project description/role (required)
 * - image: Image path (required)
 * - imageAlt: Alt text for image (required)
 * - to: Navigation path (required)
 *
 * Features:
 * - NuxtLink for navigation
 * - Theme-aware colors using CSS variables
 * - Typography from design system (PP Eiko + IBM Plex Sans JP)
 * - Responsive layout
 * - Page transition directives
 * - Hover preview integration with parent
 *
 * Usage:
 * <InteractiveCaseStudyItem
 *   title="Recommendating"
 *   tag="APP"
 *   description="Art direction & UI"
 *   image="/images/projects/recommendating.jpg"
 *   image-alt="Recommendating app preview"
 *   to="/work/recommendating"
 * />
 */

const props = defineProps({
  /**
   * Project title
   * @type {string}
   */
  title: {
    type: String,
    required: true,
  },
  /**
   * Optional tag (e.g., "APP", "REDESIGN", "INTRANET")
   * Displayed in uppercase with reduced opacity
   * @type {string}
   */
  tag: {
    type: String,
    default: '',
  },
  /**
   * Project description or role (e.g., "Art direction & UI")
   * @type {string}
   */
  description: {
    type: String,
    required: true,
  },
  /**
   * Image source path
   * @type {string}
   */
  image: {
    type: String,
    required: true,
  },
  /**
   * Alt text for image (accessibility)
   * @type {string}
   */
  imageAlt: {
    type: String,
    required: true,
  },
  /**
   * Navigation path (e.g., "/work/project-name")
   * Defaults to "/contact" for development to prevent hydration errors
   * @type {string}
   */
  to: {
    type: String,
    default: '/contact',
  },
});

// Inject context from parent InteractiveCaseStudySection
const setActivePreview = inject('setActivePreview');
const clearActivePreview = inject('clearActivePreview');

/**
 * Handle mouse enter (desktop only)
 * Updates parent's active preview to show this item's image
 */
const handleMouseEnter = () => {
  if (setActivePreview) {
    setActivePreview({
      image: props.image,
      imageAlt: props.imageAlt,
    });
  }
};

/**
 * Handle mouse leave (desktop only)
 * Clears parent's active preview
 */
const handleMouseLeave = () => {
  if (clearActivePreview) {
    clearActivePreview();
  }
};
</script>
