<script setup lang="ts">
/**
 * About Page - MDC Rendered
 *
 * Fetches and renders the about page content from content/about.md using ContentRenderer.
 * All page composition is done via MDC syntax in the markdown file.
 */

const { data: page } = await useAsyncData('about-page', () =>
  queryCollection('pages').path('/about').first()
)

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title || 'About',
  description: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <div>
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>
