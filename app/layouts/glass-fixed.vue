<script setup lang="ts">
/**
 * Fixed Element Layout for Safari iOS Liquid Glass Testing
 *
 * Purpose: Test if fixed bottom element overrides body color
 * - Includes a fixed red element at bottom
 * - Body has white background
 * - Should Safari sample the fixed element or body?
 */
</script>

<template>
  <div class="min-h-screen bg-white">
    <slot />

    <!-- Fixed element at bottom - Safari 26.1+ should sample this color -->
    <div
      class="fixed bottom-0 left-0 right-0 h-12 bg-red-500 flex items-center justify-center text-white text-sm font-medium z-50"
    >
      Fixed element (red) - Does this override body color?
    </div>
  </div>
</template>
