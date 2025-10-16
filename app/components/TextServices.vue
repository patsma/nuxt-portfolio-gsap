<template>
  <section class="text-services">
    <div class="col-span-12 col-start-1 col-end-13 grid grid-flow-col grid-cols-12 gap-4 md:gap-0">
      <!-- Left label column (cols 2-4) -->
      <div
        class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] col-start-2 col-end-12 grid text-base leading-[150%] md:col-start-2 md:col-end-4"
      >
        Services
      </div>

      <!-- Right services grid (cols 4-12, two columns on desktop) -->
      <div
        class="col-start-2 col-end-12 grid gap-8 text-2xl leading-[150%] tracking-[-1px] md:col-start-4 md:col-end-12 md:grid-flow-col md:gap-[3.75rem] md:text-[2.5rem]"
      >
        <!-- Column 1 -->
        <div class="grid gap-3 md:gap-6">
          <div
            v-for="service in servicesColumn1"
            :key="service"
            class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] grid"
          >
            {{ service }}
          </div>
        </div>

        <!-- Column 2 -->
        <div class="grid gap-3 md:gap-6">
          <div
            v-for="service in servicesColumn2"
            :key="service"
            class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] grid"
          >
            {{ service }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * TextServices Component
 * Standalone services section with grid layout
 * Matches old portfolio design with label + two-column service list
 */

// Services split into two columns
const servicesColumn1 = [
  "Art Direction",
  "Creative Direction",
  "Concept Development",
  "Consulting & Guidance",
];

const servicesColumn2 = [
  "User Experience Design (UX)",
  "Digital Design (UI)",
  "Interactive Design",
  "Design Systems & Tokens",
];
</script>

<style scoped lang="scss">
// Component-specific styles if needed
// Currently using utility classes and theme variables
</style>
