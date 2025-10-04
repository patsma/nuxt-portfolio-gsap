<template>
  <!--
    Circle reveal page transition overlay
    - Positioned BELOW header to keep header visible during transition
    - Uses clip-path circle() for organic reveal animation
    - Theme-aware: background syncs with current theme via --theme-100
    - Controlled by GSAP in usePageTransition composable
  -->
  <div ref="overlayRef" class="page-transition-overlay" aria-hidden="true" />
</template>

<script setup>
import { ref } from "vue";

// Expose overlay element ref to parent (app.vue will pass this to usePageTransition)
const overlayRef = ref(null);

defineExpose({
  overlayRef,
});
</script>

<style scoped>
.page-transition-overlay {
  /* Fixed overlay positioned BELOW header (header z-index is 50) */
  position: fixed;
  top: var(--size-header); /* Start below header */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40; /* Below header (50), above content */

  /* Theme-aware background - automatically syncs with theme toggle */
  background-color: var(--theme-100);

  /* Initially hidden - GSAP will control visibility and clip-path */
  opacity: 0;
  pointer-events: none;

  /* Start with circle at 0% (fully clipped)
     Circle origin is at bottom-center of the content area (not viewport) */
  clip-path: circle(0% at 50% 100%);

  /* Prevent any layout shift */
  width: 100vw;
  /* Height calculated from header height */
  height: calc(100vh - var(--size-header));
}
</style>
