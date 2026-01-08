<script setup lang="ts">
// Use the content-driven HeroSection
import HeroSection from '~/components/content/HeroSection.vue'
import RecommendationsSection from '~/components/RecommendationsSection.vue'
import LabProjectItem from '~/components/LabProjectItem.vue'

// Fetch all lab projects from content collection
const { data: labProjects } = await useAsyncData(
  'lab-index',
  () => queryCollection('lab').all()
)

// Sort by date (newest first)
const projectsSorted = computed(() => {
  const list = (labProjects.value || []).slice()
  list.sort((a, b) => {
    const timeA = new Date(a?.date || 0).getTime()
    const timeB = new Date(b?.date || 0).getTime()
    return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
  })
  return list
})

useHead({ title: 'Lab' })
</script>

<template>
  <div>
    <!-- Hero section - Content-driven from data/hero/lab.yml -->
    <HeroSection hero-id="lab" />

    <!-- Lab Projects Section -->
    <RecommendationsSection>
      <template #label>
        Lab projects
      </template>
      <LabProjectItem
        v-for="(project, index) in projectsSorted"
        :id="project.slug"
        :key="project.slug"
        :index="index"
        :slug="project.slug"
        :short-title="project.shortTitle"
        :full-title="project.title"
        :thumbnail="project.thumbnail"
        :cover="project.cover"
        :description="project.description"
        :tags="project.tags"
      />
    </RecommendationsSection>
  </div>
</template>
