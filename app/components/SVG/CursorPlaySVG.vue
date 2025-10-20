<template>
  <div ref="containerRef" class="play-button grid place-items-center">
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="cursor-pointer transition-transform duration-300 hover:scale-110"
    >
      <!-- Background circle - theme-aware -->
      <circle
        cx="40"
        cy="40"
        r="40"
        :fill="circleColor"
        :fill-opacity="circleOpacity"
      />

      <!-- "PLAY" text - theme-aware contrasting color -->
      <path
        d="M28.04 44H26.91V36.67H30.04C30.7 36.67 31.2133 36.8667 31.58 37.26C31.9533 37.6533 32.14 38.1833 32.14 38.85C32.14 39.5233 31.9533 40.0567 31.58 40.45C31.2133 40.8433 30.7 41.04 30.04 41.04H28.04V44ZM28.04 37.66V40.06H29.96C30.2733 40.06 30.5167 39.9767 30.69 39.81C30.8633 39.6433 30.95 39.41 30.95 39.11V38.61C30.95 38.3033 30.8633 38.07 30.69 37.91C30.5167 37.7433 30.2733 37.66 29.96 37.66H28.04ZM38.6027 43V44H34.4727V36.67H35.6027V43H38.6027ZM41.4796 44H40.3296L42.8396 36.67H44.2596L46.7596 44H45.5796L44.9096 41.98H42.1396L41.4796 44ZM43.4996 37.7L42.4096 41.01H44.6396L43.5496 37.7H43.4996ZM51.1587 41.08V44H50.0187V41.11L47.4987 36.67H48.7787L50.6087 39.98H50.6387L52.4387 36.67H53.6987L51.1587 41.08Z"
        :fill="textColor"
      />
    </svg>
  </div>
</template>

<script setup>
/**
 * CursorPlaySVG Component - Theme-Aware Play Button
 *
 * A circular play button that adapts to the current theme (light/dark).
 * Uses CSS variables from the theme system for automatic color switching.
 *
 * Theme Integration:
 * - Circle background: Uses --theme-text-100 (primary text color)
 * - "PLAY" text: Uses --theme-100 (main background color) for contrast
 * - Opacity: 60% on circle for subtle appearance
 *
 * Features:
 * - Automatic theme adaptation (light/dark)
 * - Hover scale effect
 * - Smooth transitions
 * - Reusable across components
 *
 * Color Logic:
 * - Light mode: Dark circle (theme-text-100 is dark) + light text (theme-100 is light)
 * - Dark mode: Light circle (theme-text-100 is light) + dark text (theme-100 is dark)
 *
 * Usage:
 * <CursorPlaySVG />
 */

import { ref, computed } from 'vue';

// Compute theme-aware colors from CSS variables
const circleColor = computed(() => {
  if (import.meta.client) {
    const styles = getComputedStyle(document.documentElement);
    return styles.getPropertyValue('--theme-text-100').trim();
  }
  return '#000000'; // Fallback for SSR
});

const textColor = computed(() => {
  if (import.meta.client) {
    const styles = getComputedStyle(document.documentElement);
    return styles.getPropertyValue('--theme-100').trim();
  }
  return '#ffffff'; // Fallback for SSR
});

// Circle opacity for subtle appearance
const circleOpacity = ref(0.9);

// Ref
const containerRef = ref(null);
</script>

<style scoped>
.play-button {
  /* Ensure button is visible and centered */
  width: fit-content;
  height: fit-content;
}
</style>
