<template>
  <InteractiveCaseStudySection
    :animate-entrance="animateEntrance"
    :animate-on-scroll="animateOnScroll"
    :position="position"
  >
    <template #title>
      <slot name="title">
        Work
      </slot>
    </template>

    <InteractiveCaseStudyItem
      v-for="(item, index) in caseStudies?.items"
      :key="item.title + index"
      :title="item.title"
      :tag="item.tag"
      :description="item.description"
      :image="item.image"
      :image-alt="item.imageAlt"
      :to="item.to"
    />
  </InteractiveCaseStudySection>
</template>

<script setup lang="ts">
/**
 * CaseStudyGrid - Content-driven case study section
 *
 * Fetches case study items from YAML data and renders them
 * using the existing InteractiveCaseStudySection + InteractiveCaseStudyItem components.
 *
 * Usage in pages:
 * ```vue
 * <CaseStudyGrid />
 * ```
 *
 * Usage in MDC:
 * ```markdown
 * ::CaseStudyGrid
 * #title
 * Selected Work
 * ::
 * ```
 */

// Props - pass through to InteractiveCaseStudySection
interface Props {
  animateEntrance?: boolean
  animateOnScroll?: boolean
  position?: string
}

withDefaults(defineProps<Props>(), {
  animateEntrance: false,
  animateOnScroll: true,
  position: '<-0.5'
})

// Fetch case studies from YAML data collection
const { data: caseStudies } = await useAsyncData('case-studies', () =>
  queryCollection('caseStudies').first()
)
</script>
