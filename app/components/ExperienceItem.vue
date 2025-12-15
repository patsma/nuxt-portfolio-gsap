<template>
  <!-- Experience item wrapper - uses full-width-content for nested sub-grid -->
  <div class="experience-item full-width-content">
    <!-- Full-width border line at top (15% opacity) -->
    <FullWidthBorder spacing="0" />

    <!-- Content wrapper - breakout3 for consistent content width -->
    <!-- On desktop: 4-column grid matching Figma specs -->
    <div
      class="experience-item-content breakout3 py-[var(--space-s)] md:py-[var(--space-s)] lg:py-[var(--space-m)] lg:grid lg:grid-cols-4 lg:gap-[var(--space-m)] xl:gap-[var(--space-l)] lg:items-start"
    >
      <!-- Mobile/Tablet: 2-column layout (hidden on desktop) -->
      <div class="grid grid-cols-2 gap-[var(--space-xs)] lg:hidden items-start">
        <!-- Left: Date Range -->
        <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)]">
          {{ dateRange }}
        </p>

        <!-- Right: Title, Company, Location stacked -->
        <div class="flex flex-col items-end text-right">
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)] whitespace-nowrap"
          >
            {{ title }}
          </p>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)] whitespace-nowrap"
          >
            {{ company }}
          </p>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)] whitespace-nowrap"
          >
            {{ location }}
          </p>
        </div>
      </div>

      <!-- Desktop/Laptop: 4-column grid items -->
      <!-- Date Range -->
      <p
        class="hidden lg:block ibm-plex-sans-jp-mobile-p1 2xl:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]"
      >
        {{ dateRange }}
      </p>

      <!-- Job Title -->
      <p
        class="hidden lg:block ibm-plex-sans-jp-mobile-p1 2xl:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]"
      >
        {{ title }}
      </p>

      <!-- Company Name -->
      <p
        class="hidden lg:block ibm-plex-sans-jp-mobile-p1 2xl:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]"
      >
        {{ company }}
      </p>

      <!-- Location (right-aligned) -->
      <p
        class="hidden lg:block ibm-plex-sans-jp-mobile-p1 2xl:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)] text-right whitespace-nowrap"
      >
        {{ location }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ExperienceItem Component - Individual Experience List Item
 *
 * Displays a single work experience entry with responsive layout.
 * Part of the ExperienceSection component.
 *
 * Layout Patterns:
 * - Desktop/Laptop (≥1024px): 4-column horizontal layout
 *   Date | Title | Company | Location
 * - Mobile/Tablet (<1024px): 2-column layout
 *   Date on left, Title/Company/Location stacked on right
 *
 * Props:
 * @param {string} dateRange - Date range (e.g., "2023 – Current")
 * @param {string} title - Job title (e.g., "Senior UX/UI Designer")
 * @param {string} company - Company name (e.g., "TCS")
 * @param {string} location - Location (e.g., "Tokyo")
 *
 * Features:
 * - Full-width border divider using FullWidthBorder component
 * - Theme-aware colors (--theme-text-60 for 60% opacity)
 * - Typography from design system (IBM Plex Sans JP P1)
 * - Responsive breakpoints for optimal layout
 * - Uses content-grid system (full-width-content + breakout3)
 *
 * Usage:
 * <ExperienceItem
 *   date-range="2023 – Current"
 *   title="Senior UX/UI Designer"
 *   company="TCS"
 *   location="Tokyo"
 * />
 */

defineProps({
  /**
   * Date range for the position
   * Format: "YYYY – YYYY" or "YYYY – Current"
   * @type {string}
   */
  dateRange: {
    type: String,
    required: true
  },
  /**
   * Job title or position
   * @type {string}
   */
  title: {
    type: String,
    required: true
  },
  /**
   * Company or organization name
   * @type {string}
   */
  company: {
    type: String,
    required: true
  },
  /**
   * Location (city, country, or both)
   * @type {string}
   */
  location: {
    type: String,
    required: true
  }
})
</script>
