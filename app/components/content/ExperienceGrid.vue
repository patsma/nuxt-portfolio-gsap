<template>
  <ExperienceSection
    :animate-on-scroll="animateOnScroll"
    :view-more-text="viewMoreText"
    :view-more-to="viewMoreTo"
  >
    <!-- Always visible items -->
    <ExperienceItem
      v-for="item in visibleItems"
      :key="item.company + item.dateRange"
      :date-range="item.dateRange"
      :title="item.title"
      :company="item.company"
      :location="item.location"
    />

    <!-- Hidden items wrapper (GSAP animates height) -->
    <div
      v-if="hasHiddenItems"
      ref="hiddenWrapperRef"
      class="hidden-items-wrapper full-width-content overflow-hidden"
      :style="{ height: 0 }"
    >
      <ExperienceItem
        v-for="item in hiddenItems"
        :key="item.company + item.dateRange"
        :date-range="item.dateRange"
        :title="item.title"
        :company="item.company"
        :location="item.location"
      />
    </div>

    <!-- Show more/less button -->
    <div
      v-if="hasHiddenItems"
      class="experience-item full-width-content"
    >
      <FullWidthBorder />

      <div class="experience-toggle breakout3 py-[var(--space-s)] md:py-[var(--space-s)] lg:py-[var(--space-m)]">
        <!-- Mobile/Tablet: Centered -->
        <button
          type="button"
          class="lg:hidden block w-full body-mobile-p1 text-[var(--theme-text-100)] font-medium text-center hover:opacity-60 transition-opacity duration-[var(--duration-hover)]"
          @click="toggleExpanded"
        >
          {{ isExpanded ? showLessText : showMoreText }}
        </button>

        <!-- Desktop: Aligned with items -->
        <button
          type="button"
          class="hidden lg:block body-mobile-p1 2xl:body-desktop-p1 text-[var(--theme-text-100)] font-medium hover:opacity-60 transition-opacity duration-[var(--duration-hover)]"
          @click="toggleExpanded"
        >
          {{ isExpanded ? showLessText : showMoreText }}
        </button>
      </div>
    </div>
  </ExperienceSection>
</template>

<script setup lang="ts">
/**
 * ExperienceGrid - Content-driven experience section
 *
 * Fetches experience items from YAML data and renders them
 * using the existing ExperienceSection + ExperienceItem components.
 *
 * Features:
 * - Optional show more/less toggle with GSAP height animation
 * - Configurable initial visible count
 * - ScrollTrigger refresh after expand/collapse
 *
 * Usage:
 * ```vue
 * <ExperienceGrid />
 * <ExperienceGrid :limit="3" view-more-text="View all" view-more-to="/about" />
 * <ExperienceGrid :initial-visible-count="3" show-more-text="Show more" show-less-text="Show less" />
 * ```
 */

interface Props {
  animateOnScroll?: boolean
  limit?: number
  viewMoreText?: string
  viewMoreTo?: string
  initialVisibleCount?: number
  showMoreText?: string
  showLessText?: string
}

const props = withDefaults(defineProps<Props>(), {
  animateOnScroll: true,
  limit: undefined,
  viewMoreText: '',
  viewMoreTo: '',
  initialVisibleCount: undefined,
  showMoreText: 'Show more',
  showLessText: 'Show less'
})

const nuxtApp = useNuxtApp()
const { $gsap, $ScrollTrigger } = nuxtApp

// State
const isExpanded = ref(false)
const hiddenWrapperRef = ref<HTMLElement | null>(null)

// Fetch experience from YAML data collection
const { data: experience } = await useAsyncData('experience', () =>
  queryCollection('experience').first()
)

// Apply limit if specified (for view more link pattern)
const displayedItems = computed(() => {
  const items = experience.value?.items || []
  return props.limit ? items.slice(0, props.limit) : items
})

// Items to show before expand (uses initialVisibleCount or shows all)
const visibleItems = computed(() => {
  const items = displayedItems.value
  if (!props.initialVisibleCount) return items
  return items.slice(0, props.initialVisibleCount)
})

// Items hidden until expanded
const hiddenItems = computed(() => {
  const items = displayedItems.value
  if (!props.initialVisibleCount) return []
  return items.slice(props.initialVisibleCount)
})

// Whether there are hidden items to toggle
const hasHiddenItems = computed(() => hiddenItems.value.length > 0)

/**
 * Toggle expand/collapse with GSAP height animation
 * Coordinates with headroom to prevent header flicker during animation
 */
const toggleExpanded = () => {
  if (!hiddenWrapperRef.value) return

  // Pause headroom BEFORE animation to prevent header flicker
  nuxtApp.$headroom?.pause()

  // Cast ScrollTrigger to access addEventListener/removeEventListener (exist at runtime but not typed)
  const st = $ScrollTrigger as typeof $ScrollTrigger & {
    addEventListener: (event: string, callback: () => void) => void
    removeEventListener: (event: string, callback: () => void) => void
  }

  if (isExpanded.value) {
    // Collapse: set overflow hidden BEFORE animating (needed for height: auto → 0)
    hiddenWrapperRef.value.style.overflow = 'hidden'

    $gsap.to(hiddenWrapperRef.value, {
      height: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        // Setup one-time listener BEFORE calling refresh
        const handleRefreshComplete = (): void => {
          nuxtApp.$headroom?.unpause()
          st?.removeEventListener('refresh', handleRefreshComplete)
        }
        st?.addEventListener('refresh', handleRefreshComplete)
        st?.refresh()
      }
    })
  }
  else {
    // Expand
    $gsap.to(hiddenWrapperRef.value, {
      height: 'auto',
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        // Set overflow visible AFTER animation completes (allows elastic border to bounce freely)
        if (hiddenWrapperRef.value) {
          hiddenWrapperRef.value.style.overflow = 'visible'
        }
        // Setup one-time listener BEFORE calling refresh
        const handleRefreshComplete = (): void => {
          nuxtApp.$headroom?.unpause()
          st?.removeEventListener('refresh', handleRefreshComplete)
        }
        st?.addEventListener('refresh', handleRefreshComplete)
        st?.refresh()
      }
    })
  }

  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.experience-toggle {
  display: block;
  width: 100%;
}

.hidden-items-wrapper {
  /* Inherit grid to allow children to use grid-column placement */
  grid-column: full-width;
  display: grid;
  grid-template-columns: inherit;
  /* Ensure content doesn't affect layout when collapsed */
  will-change: height;
}
</style>
