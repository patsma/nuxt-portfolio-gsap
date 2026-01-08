<template>
  <AwardsRecognitionSection :animate-on-scroll="animateOnScroll">
    <template #label>
      <slot name="label">
        Awards &amp;<br>Recognition
      </slot>
    </template>

    <template #awards-column>
      <p v-for="award in awards?.awards" :key="award.name">
        {{ award.count }} <span class="text-[var(--theme-text-60)]">x</span> {{ award.name }}
      </p>
    </template>

    <template #featured-column>
      <p v-for="item in awards?.featured" :key="item.name">
        {{ item.name }}
      </p>
    </template>
  </AwardsRecognitionSection>
</template>

<script setup lang="ts">
/**
 * AwardsGrid - Content-driven awards & recognition section
 *
 * Fetches awards data from YAML and renders them
 * using the existing AwardsRecognitionSection component.
 *
 * Usage:
 * ```vue
 * <AwardsGrid />
 * ```
 */

interface Props {
  animateOnScroll?: boolean
}

withDefaults(defineProps<Props>(), {
  animateOnScroll: true
})

// Fetch awards from YAML data collection
const { data: awards } = await useAsyncData('awards', () =>
  queryCollection('awards').first()
)
</script>
