<template>
  <!-- Fluid gradient background (z-0, behind everything) -->
  <FluidGradient />

  <NuxtLayout>
    <NuxtPage
      :transition="{
        mode: 'out-in',
        css: false,
        onEnter: handlePageEnter,
      }"
    />
  </NuxtLayout>

  <!-- Smooth cursor trail effect (z-50, on top) -->
  <CursorTrail />
</template>

<script setup>
// Initialize page transition composable
// Overlay element is accessed from Pinia store (set by PageTransitionOverlay component)
const { handlePageEnter } = usePageTransition();

// Intentionally minimal: all app-level structure is handled by layouts and pages
</script>
