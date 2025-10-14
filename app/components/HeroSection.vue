<template>
  <section class="content-grid w-full min-h-screen flex items-center">
    <div class="breakout3 py-[var(--space-2xl)]">
      <!-- Default slot for main hero content (h1, p, etc.) -->
      <slot />

      <!-- Named slot for optional services list -->
      <slot name="services" />
    </div>
  </section>
</template>

<script setup>
/**
 * HeroSection Component - Reusable Layout Wrapper
 *
 * Provides consistent hero section layout and spacing.
 * Content is passed via slots for maximum flexibility.
 *
 * Slots:
 * - default: Main hero content (h1, p, etc.)
 * - services: Optional services list or additional content
 *
 * Features:
 * - Responsive content-grid layout
 * - Vertical centering (flex items-center)
 * - Theme-aware (inherits theme colors)
 * - Works with page transition directives (add to slot content)
 *
 * Usage:
 * <HeroSection>
 *   <h1 v-page-split:lines>Your headline</h1>
 *   <template #services>
 *     <nav>Your services</nav>
 *   </template>
 * </HeroSection>
 */
</script>

<style scoped>
/* Optional: Add gradient background like reference image */
/* .hero-section {
  background: linear-gradient(135deg, #fef5f1 0%, #fde5e0 100%);
} */
</style>
