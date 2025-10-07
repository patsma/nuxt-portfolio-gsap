<template>
  <!-- Fluid gradient background (z-0, behind everything) -->
  <FluidGradient />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Smooth cursor trail effect (z-50, on top) -->
  <CursorTrail />
</template>

<script setup>
// Intentionally minimal: all app-level structure is handled by layouts and pages
// Page transitions configured in nuxt.config.ts and styled below
</script>

<style>
/**
 * Simple page transition styles
 * Uses Nuxt's built-in transition system with 'page' name
 * Works seamlessly with ScrollSmoother kill/init hooks
 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(4px);
}
</style>
