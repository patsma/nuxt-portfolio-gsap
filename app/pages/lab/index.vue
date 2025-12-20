<script setup lang="ts">
import HeroSection from '~/components/HeroSection.vue'
import ScrollButtonSVG from '~/components/SVG/ScrollButtonSVG.vue'
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
    <!-- Hero section with lab-specific content -->
    <HeroSection>
      <h1
        v-page-split:lines="{ animateFrom: 'below' }"
        class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter"
      >
        <span class="text-[var(--theme-text-60)]">Feel</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> free</em>
        <span class="text-[var(--theme-text-60)]">
          to use my lab projects</span>
        <span class="text-[var(--theme-text-100)] font-body font-[300]">
          as your own.</span>
        <span class="text-[var(--theme-text-60)]"> They are</span>
        <span class="text-[var(--theme-text-100)] font-body font-[300]">
          based</span>
        <span class="text-[var(--theme-text-60)]"> on Morten</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> logic</em>
        <span class="text-[var(--theme-text-60)]"> and</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]">
          experience</em>
        <span class="text-[var(--theme-text-60)]">, but still experimental and always evolving</span>
      </h1>
      <template #button>
        <ScrollButtonSVG v-page-fade:left />
      </template>
    </HeroSection>

    <!-- Lab Projects Section -->
    <RecommendationsSection>
      <template #label>
        Lab projects
      </template>
      <LabProjectItem
        v-for="(project, index) in projectsSorted"
        :key="project.slug"
        :id="project.slug"
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
