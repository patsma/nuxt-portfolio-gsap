<script setup lang="ts">
/**
 * FluidGradient Layout for Safari iOS Liquid Glass Testing
 *
 * Purpose: Test if WebGL canvas affects glass sampling
 * - Includes FluidGradient component
 * - Similar to default layout but simplified
 * - No header, no ScrollSmoother, just the gradient
 */
</script>

<template>
  <div class="min-h-screen">
    <!-- FluidGradient WebGL background -->
    <FluidGradient />

    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>
