<template>
  <ExperienceSection
    :animate-on-scroll="animateOnScroll"
    :view-more-text="viewMoreText"
    :view-more-to="viewMoreTo"
  >
    <ExperienceItem
      v-for="item in displayedItems"
      :key="item.company + item.dateRange"
      :date-range="item.dateRange"
      :title="item.title"
      :company="item.company"
      :location="item.location"
    />
  </ExperienceSection>
</template>

<script setup lang="ts">
/**
 * ExperienceGrid - Content-driven experience section
 *
 * Fetches experience items from YAML data and renders them
 * using the existing ExperienceSection + ExperienceItem components.
 *
 * Usage:
 * ```vue
 * <ExperienceGrid />
 * <ExperienceGrid :limit="3" view-more-text="View all" view-more-to="/about" />
 * ```
 */

interface Props {
  animateOnScroll?: boolean
  limit?: number
  viewMoreText?: string
  viewMoreTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  animateOnScroll: true,
  limit: undefined,
  viewMoreText: '',
  viewMoreTo: ''
})

// Fetch experience from YAML data collection
const { data: experience } = await useAsyncData('experience', () =>
  queryCollection('experience').first()
)

// Apply limit if specified
const displayedItems = computed(() => {
  const items = experience.value?.items || []
  return props.limit ? items.slice(0, props.limit) : items
})
</script>
