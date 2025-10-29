<template>
  <div
    class="full-width-border-line full-width"
    :style="{
      marginBottom: spacing,
    }"
  ></div>
</template>

<script setup>
/**
 * FullWidthBorder Component - Reusable Full-Width Border Line
 *
 * A reusable component for rendering full-width horizontal border lines
 * that span the entire content-grid width. Used across sections like
 * InteractiveCaseStudySection and ExperienceSection for consistent dividers.
 *
 * Pattern:
 * - Spans full-width of parent content-grid via 'full-width' class
 * - 1px height border line
 * - Theme-aware color with configurable opacity
 * - Configurable bottom margin for spacing
 *
 * Props:
 * @param {number} opacity - Opacity percentage for border (0-100, default: 15)
 * @param {string} spacing - Bottom margin spacing (CSS value, default: '0')
 *
 * Usage:
 * <FullWidthBorder /> <!-- Default: 15% opacity, no margin -->
 * <FullWidthBorder :opacity="10" spacing="var(--space-m)" /> <!-- Custom spacing if needed -->
 */

const props = defineProps({
  /**
   * Opacity percentage for the border line (0-100)
   * Uses color-mix() to blend theme text color with transparency
   * @type {number}
   */
  opacity: {
    type: Number,
    default: 15,
    validator: (value) => value >= 0 && value <= 100,
  },
  /**
   * Bottom margin spacing (CSS variable or value)
   * Default is '0' - parent elements should handle their own padding
   * Use this prop only when you need the border to provide spacing
   * @type {string}
   */
  spacing: {
    type: String,
    default: '0',
  },
});
</script>

<style scoped>
/**
 * Full-width border line styles
 * - Uses grid-column: full-width to span entire content-grid
 * - 1px height for thin divider line
 * - Theme-aware color via CSS custom property
 * - Opacity controlled via inline style with v-bind
 */
.full-width-border-line {
  grid-column: full-width;
  height: 1px;
  background-color: color-mix(
    in srgb,
    var(--theme-text-100) v-bind(opacity + '%'),
    transparent
  );
}
</style>
