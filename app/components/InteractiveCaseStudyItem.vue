<template>
  <!-- Desktop: List item with hover (full-width-content creates sub-grid) -->
  <!-- Wrapper captures click in capture phase to intercept before NuxtLink navigates -->
  <div
    class="case-study-item-wrapper hidden md:block"
    @click.capture="handleClickCapture"
  >
    <NuxtLink
      ref="itemRef"
      :to="to"
      class="case-study-item full-width-content"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
    <!-- Multiple root elements (Vue 3 fragments) - intentional for grid layout -->
    <!-- FullWidthBorder must be a direct child to use grid-column: full-width -->
    <!-- <FullWidthBorder
      class="hidden md:grid"
      spacing="var(--space-m)"
      :opacity="10"
    /> -->
    <!-- Animated border line (full-width within sub-grid) -->

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
  </div>

  <!-- Mobile: Card with image -->
  <NuxtLink
    :to="to"
    class="case-study-card flex md:hidden"
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

<script setup lang="ts">
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
    required: true
  },
  /**
   * Optional tag (e.g., "APP", "REDESIGN", "INTRANET")
   * Displayed in uppercase with reduced opacity
   * @type {string}
   */
  tag: {
    type: String,
    default: ''
  },
  /**
   * Project description or role (e.g., "Art direction & UI")
   * @type {string}
   */
  description: {
    type: String,
    required: true
  },
  /**
   * Image source path
   * @type {string}
   */
  image: {
    type: String,
    required: true
  },
  /**
   * Alt text for image (accessibility)
   * @type {string}
   */
  imageAlt: {
    type: String,
    required: true
  },
  /**
   * Navigation path (e.g., "/work/project-name")
   * Defaults to "/contact" for development to prevent hydration errors
   * @type {string}
   */
  to: {
    type: String,
    default: '/contact'
  }
})

// Type for preview data passed to parent
interface PreviewData {
  image: string
  imageAlt: string
  itemIndex: number
}

// Template ref for DOM-based index detection (NuxtLink component instance)
const itemRef = ref<{ $el: HTMLElement } | null>(null)

// Inject context from parent InteractiveCaseStudySection
const setActivePreview = inject<((data: PreviewData) => void) | undefined>('setActivePreview')
const clearActivePreview = inject<(() => void) | undefined>('clearActivePreview')
const navigateWithAnimation = inject<((to: string) => void) | undefined>('navigateWithAnimation')

// Fallback router for direct navigation if injection fails
const router = useRouter()

/**
 * Get item index from DOM position in parent list
 * Simpler than provide/inject for index tracking
 */
const getItemIndex = (): number => {
  // itemRef is a Vue component (NuxtLink), access underlying DOM element via $el
  const el = itemRef.value?.$el as HTMLElement | undefined
  if (!el) return 0

  const parent = el.closest('.case-study-list')
  if (!parent) return 0

  const items = parent.querySelectorAll('.case-study-item')
  return Array.from(items).indexOf(el)
}

/**
 * Handle mouse enter (desktop only)
 * Updates parent's active preview to show this item's image
 */
const handleMouseEnter = () => {
  if (setActivePreview) {
    setActivePreview({
      image: props.image,
      imageAlt: props.imageAlt,
      itemIndex: getItemIndex()
    })
  }
}

/**
 * Handle mouse leave (desktop only)
 * Clears parent's active preview
 */
const handleMouseLeave = () => {
  if (clearActivePreview) {
    clearActivePreview()
  }
}

/**
 * Handle click on wrapper in capture phase
 * Intercepts navigation BEFORE NuxtLink processes it
 * This ensures the clip-out animation runs before navigation
 *
 * CRITICAL: Always prevent default to ensure we control navigation timing.
 * If navigateWithAnimation injection fails, fallback to direct router.push()
 */
const handleClickCapture = (event: MouseEvent) => {
  console.log('🟡 handleClickCapture fired', {
    hasNavigateWithAnimation: !!navigateWithAnimation,
    to: props.to
  })

  // ALWAYS prevent default on desktop - we handle navigation manually
  // This ensures NuxtLink never processes the click directly
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  if (navigateWithAnimation) {
    navigateWithAnimation(props.to)
  }
  else {
    // Fallback if injection failed - navigate immediately
    console.warn('⚠️ navigateWithAnimation not available, using direct navigation')
    router.push(props.to)
  }
}
</script>
