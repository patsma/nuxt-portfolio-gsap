<template>
  <!--
    Circle reveal page transition overlay
    - Covers FULL viewport to prevent glitches above header
    - Uses clip-path circle() for organic reveal animation
    - Circle origin calculated to account for header height
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
  /* Fixed overlay covering FULL viewport to prevent content glitches */
  position: fixed;
  top: 0; /* Cover full viewport including header area */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 55; /* above header (55)  */

  /* Theme-aware background - automatically syncs with theme toggle */
  background-color: var(--theme-100);

  /* Initially hidden - GSAP will control visibility and clip-path */
  opacity: 0;
  pointer-events: none;

  /* Start with circle at 0% (fully clipped)
     Circle origin is adjusted for header height using calc()
     The 100% bottom position needs to account for header offset */
  clip-path: circle(0% at 50% calc(100%));

  /* Full viewport dimensions */
  width: 100vw;
  height: 100vh;
}
</style>
