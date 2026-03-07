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

// Force Vue to treat each route as a distinct component instance
// Without this, page transitions don't fire because Vue sees the same component
definePageMeta({
  key: route => route.fullPath
})

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

// Dynamic OG image - use page title/description if available
if (page.value) {
  defineOgImageComponent('Portfolio', {
    title: page.value?.seo?.title || page.value?.title || 'Morten Stig Christensen',
    description: page.value?.seo?.description || page.value?.description || 'Digital Designer in Tokyo'
  })
}
</script>

<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </div>
</template>
