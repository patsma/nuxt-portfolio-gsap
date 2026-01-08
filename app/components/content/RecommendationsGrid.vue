<template>
  <RecommendationsSection :animate-on-scroll="animateOnScroll">
    <template #label>
      <slot name="label">
        Recommendations
      </slot>
    </template>

    <RecommendationItem
      v-for="(item, index) in recommendations?.items"
      :id="item.id"
      :key="item.id"
      :index="index"
      :quote="item.quote"
      :full-recommendation="item.fullRecommendation"
      :author-first-name="item.authorFirstName"
      :author-last-name="item.authorLastName"
      :author-title="item.authorTitle"
      :author-image="item.authorImage"
    />
  </RecommendationsSection>
</template>

<script setup lang="ts">
/**
 * RecommendationsGrid - Content-driven recommendations section
 *
 * Fetches recommendation items from YAML data and renders them
 * using the existing RecommendationsSection + RecommendationItem components.
 *
 * Usage:
 * ```vue
 * <RecommendationsGrid />
 * ```
 */

interface Props {
  animateOnScroll?: boolean
}

withDefaults(defineProps<Props>(), {
  animateOnScroll: true
})

// Fetch recommendations from YAML data collection
const { data: recommendations } = await useAsyncData('recommendations', () =>
  queryCollection('recommendations').first()
)
</script>
