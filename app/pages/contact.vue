<script setup lang="ts">
/**
 * Contact Page - MDC Rendered
 *
 * Fetches and renders the contact page content from content/contact.md using ContentRenderer.
 * All page composition is done via MDC syntax in the markdown file.
 */

const { data: page } = await useAsyncData('contact-page', () =>
  queryCollection('pages').path('/contact').first()
)

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title || 'Contact',
  description: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <div>
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>
