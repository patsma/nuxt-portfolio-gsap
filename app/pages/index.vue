<script setup lang="ts">
import HeroSection from "~/components/HeroSection.vue";

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

<template>
  <div>
    <HeroSection>
      <!-- Main hero text with line-by-line reveal animation -->
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

      <!-- Services list with stagger animation -->
      <template #services>
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
      </template>
    </HeroSection>
  </div>
</template>
