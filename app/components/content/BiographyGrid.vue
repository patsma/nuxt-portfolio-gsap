<template>
  <BiographySection :animate-on-scroll="animateOnScroll">
    <template #label>
      {{ biographyData?.label || 'Biography' }}
    </template>

    <p
      v-for="(paragraph, index) in biographyData?.paragraphs"
      :key="index"
    >
      {{ paragraph.text }}
    </p>
  </BiographySection>
</template>

<script setup lang="ts">
/**
 * BiographyGrid - Content-driven biography section
 *
 * Fetches biography content from YAML data and renders it
 * using the existing BiographySection component.
 *
 * Usage:
 * ```vue
 * <BiographyGrid biography-id="about" />
 * ```
 */

interface Props {
  biographyId?: string
  animateOnScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  biographyId: 'about',
  animateOnScroll: true
})

// Fetch biography from YAML data collection (like HeroSection pattern)
const { data: biographyData } = await useAsyncData(`biography-${props.biographyId}`, async () => {
  const allBiographies = await queryCollection('biography').all()
  return allBiographies.find(b => b.stem?.endsWith(props.biographyId)) || null
})
</script>
