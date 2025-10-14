<template>
  <section class="content-grid w-full min-h-screen">
    <div class="breakout3 py-[var(--space-2xl)]">
      <!-- Main Hero Text with line-by-line reveal animation -->
      <h1
        v-page-split:lines
        data-speed="0.8"
        class="pp-eiko-desktop-h1 text-[var(--theme-text-100)] mb-[var(--space-xl)] max-w-[1400px]"
      >
        Welcome, I am <span class="pp-eiko-desktop-h1-bold">Morten</span> – a
        <em class="pp-eiko-desktop-h1-italic">Danish</em> designer based in
        <em class="pp-eiko-desktop-h1-italic">Tokyo</em> approaching today's
        challenges with a
        <em class="pp-eiko-desktop-h1-italic">digital-first</em> and
        <em class="pp-eiko-desktop-h1-italic">user-centred</em> mindset
      </h1>

      <!-- Services List with stagger animation -->
      <nav class="services-list" aria-label="Services">
        <ul
          v-page-stagger="{ stagger: 0.08, duration: 0.5 }"
          data-lag="0.2"
          class="flex flex-wrap gap-[var(--space-s)] items-center"
        >
          <li
            class="ibm-plex-sans-jp-desktop-custom-labels text-[var(--theme-text-60)] uppercase tracking-wider"
          >
            SERVICES
          </li>
          <li
            v-for="(service, index) in services"
            :key="service"
            class="flex items-center gap-[var(--space-s)]"
          >
            <span
              class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]"
            >
              {{ service }}
            </span>
            <span
              v-if="index < services.length - 1"
              class="text-[var(--theme-text-40)]"
            >
              •
            </span>
          </li>
        </ul>
      </nav>
    </div>
  </section>
</template>

<script setup>
/**
 * HeroSection Component
 *
 * Simple hero section with large headline and services list.
 * Uses typography system (PP Eiko + IBM Plex Sans JP) and theme colors.
 *
 * Features:
 * - Responsive typography that scales from mobile to desktop
 * - Theme-aware colors (dark/light mode support)
 * - Italic emphasis for key words
 * - Services list with bullet separators
 * - Page transition directives (v-page-split:lines, v-page-stagger)
 */

const services = [
  "ART DIRECTION",
  "CREATIVE DIRECTION",
  "CONCEPT DEVELOPMENT",
  "CONSULTING & GUIDANCE",
  "USER EXPERIENCE DESIGN (UX)",
  "DIGITAL DESIGN (UI)",
  "INTERACTIVE DESIGN",
  "DESIGN SYSTEMS & TOKENS",
];
</script>

<style scoped>
/* Optional: Add gradient background like reference image */
/* .hero-section {
  background: linear-gradient(135deg, #fef5f1 0%, #fde5e0 100%);
} */
</style>
