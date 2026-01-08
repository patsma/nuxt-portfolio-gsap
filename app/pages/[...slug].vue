<script setup lang="ts">
/**
 * Catch-All Page - Dynamic MDC Rendering
 *
 * Single page that handles ALL routes dynamically by fetching content
 * based on the current route path. Add new pages by just creating .md files.
 *
 * Examples:
 * - `/` → content/index.md
 * - `/about` → content/about.md
 * - `/contact` → content/contact.md
 */

const route = useRoute()

const { data: page } = await useAsyncData('page-' + route.path, () => {
  return queryCollection('pages').path(route.path).first()
})

// 404 handling - only on client to avoid hydration issues
if (!page.value && import.meta.client) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

// SEO
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
