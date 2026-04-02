<script setup lang="ts">
/**
 * Main App Component
 *
 * Initializes the loading sequence and coordinates
 * the app-wide ready state for animations.
 */

import { useLoadingSequence } from '~/composables/useLoadingSequence'

const appConfig = useAppConfig()

// Global SEO defaults
useSeoMeta({
  ogSiteName: appConfig.identity.name,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

// Default OG image for all pages (can be overridden per-page)
defineOgImageComponent('Portfolio', {
  title: appConfig.identity.name,
  description: `${appConfig.identity.title} · ${appConfig.site.description}`
})

// Initialize loading sequence
const { initializeLoading } = useLoadingSequence()
onMounted(() => {
  initializeLoading({
    checkFonts: true,
    minLoadTime: 300,
    animateOnReady: true
  })
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
