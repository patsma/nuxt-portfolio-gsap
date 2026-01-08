<script setup lang="ts">
/**
 * Home Page - MDC Rendered
 *
 * Fetches and renders the home page content from content/index.md using ContentRenderer.
 * All page composition is done via MDC syntax in the markdown file.
 */

const { data: page } = await useAsyncData('index-page', () =>
  queryCollection('pages').path('/').first()
)

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </div>
</template>
