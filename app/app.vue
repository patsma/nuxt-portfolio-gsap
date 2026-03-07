<script setup lang="ts">
/**
 * Main App Component
 *
 * Initializes the loading sequence and coordinates
 * the app-wide ready state for animations.
 */

import { useLoadingSequence } from '~/composables/useLoadingSequence'
import useIsMobile from '~/composables/useIsMobile'

// Mobile detection for cursor trail
const { isMobile } = useIsMobile()

// Global SEO defaults
useSeoMeta({
  ogSiteName: 'Morten Stig Christensen',
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

// Default OG image for all pages (can be overridden per-page)
defineOgImageComponent('Portfolio', {
  title: 'Morten Stig Christensen',
  description: 'Digital Designer in Tokyo · Shaping experiences rooted in purpose, function, and craft'
})

// Initialize loading sequence
const { initializeLoading } = useLoadingSequence()
onMounted(() => {
  // Start the loading sequence with options
  initializeLoading({
    checkFonts: true, // Wait for custom fonts to load
    minLoadTime: 300, // Minimum time to display loader (ensures visibility)
    animateOnReady: true // Auto-start entrance animations when ready
  })
})
</script>

<template>
  <!-- Fluid gradient background (z-0, behind everything) -->

  <FluidGradient />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Smooth cursor trail effect (z-50, on top) - hidden on mobile (no cursor) -->
  <CursorTrail v-if="!isMobile" />
</template>
