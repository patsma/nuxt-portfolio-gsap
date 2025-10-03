<template>
  <main class="p-[var(--space-l)] md:p-[var(--space-xl)]">
    <header class="max-w-7xl mx-auto mb-[var(--space-xl)]">
      <h1
        class="font-display text-step-4 md:text-step-6 font-medium tracking-[var(--tracking-display-2)] text-[var(--theme-text-100)]"
      >
        Theme Color System
      </h1>
      <p
        class="mt-[var(--space-xs)] text-[var(--theme-text-60)] font-body text-step-1 leading-[var(--leading-normal)]"
      >
        Toggle the theme in the header to see smooth color transitions across
        all variants.
      </p>
    </header>

    <!-- Text Variants Section -->
    <section
      aria-labelledby="text-heading"
      class="max-w-7xl mx-auto mb-[var(--space-2xl)]"
    >
      <h2
        id="text-heading"
        class="font-display text-step-3 font-medium mb-[var(--space-m)] text-[var(--theme-text-100)] tracking-[var(--tracking-display-1)]"
      >
        Text Colors
      </h2>
      <ul
        role="list"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--space-s)]"
      >
        <li
          v-for="swatch in textSwatches"
          :key="swatch.name"
          class="group relative rounded-xl overflow-hidden border border-[var(--theme-text-10)] bg-[var(--theme-5)] p-[var(--space-m)] transition-hover hover:border-[var(--theme-text-30)] hover:shadow-lg"
        >
          <div
            class="mb-[var(--space-xs)] text-xs font-mono text-[var(--theme-text-40)] tracking-tight"
          >
            {{ swatch.varName }}
          </div>
          <div
            :style="{ color: swatch.varName }"
            class="font-body text-step-2 font-semibold mb-[var(--space-2xs)]"
          >
            {{ swatch.opacity }}
          </div>
          <div
            :style="{ color: swatch.varName }"
            class="font-body text-step-0 leading-[var(--leading-normal)]"
          >
            The quick brown fox jumps over the lazy dog
          </div>
        </li>
      </ul>
    </section>

    <!-- Background Variants Section -->
    <section aria-labelledby="bg-heading" class="max-w-7xl mx-auto">
      <h2
        id="bg-heading"
        class="font-display text-step-3 font-medium mb-[var(--space-m)] text-[var(--theme-text-100)] tracking-[var(--tracking-display-1)]"
      >
        Background Colors
      </h2>
      <ul
        role="list"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--space-s)]"
      >
        <li
          v-for="swatch in bgSwatches"
          :key="swatch.name"
          class="group relative rounded-xl overflow-hidden border border-[var(--theme-text-10)] transition-hover hover:border-[var(--theme-text-30)] hover:shadow-lg"
          :style="{ backgroundColor: swatch.varName }"
        >
          <div class="p-[var(--space-m)]">
            <div
              class="mb-[var(--space-xs)] text-xs font-mono text-[var(--theme-text-60)] tracking-tight"
            >
              {{ swatch.varName }}
            </div>
            <div
              class="font-body text-step-2 font-semibold text-[var(--theme-text-100)] mb-[var(--space-2xs)]"
            >
              {{ swatch.opacity }}
            </div>
            <div
              class="font-body text-step-0 text-[var(--theme-text-100)] leading-[var(--leading-normal)]"
            >
              Background variant
            </div>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup>
// Text color swatches using the theme system
const textSwatches = [
  { name: "100% Text", varName: "var(--theme-text-100)", opacity: "100%" },
  { name: "60% Text", varName: "var(--theme-text-60)", opacity: "60%" },
  { name: "50% Text", varName: "var(--theme-text-50)", opacity: "50%" },
  { name: "40% Text", varName: "var(--theme-text-40)", opacity: "40%" },
  { name: "30% Text", varName: "var(--theme-text-30)", opacity: "30%" },
  { name: "15% Text", varName: "var(--theme-text-15)", opacity: "15%" },
  { name: "5% Text", varName: "var(--theme-text-5)", opacity: "5%" },
];

// Background color swatches using the theme system
const bgSwatches = [
  { name: "100% Background", varName: "var(--theme-100)", opacity: "100%" },
  { name: "60% Background", varName: "var(--theme-60)", opacity: "60%" },
  { name: "50% Background", varName: "var(--theme-50)", opacity: "50%" },
  { name: "40% Background", varName: "var(--theme-40)", opacity: "40%" },
  { name: "30% Background", varName: "var(--theme-30)", opacity: "30%" },
  { name: "15% Background", varName: "var(--theme-15)", opacity: "15%" },
  { name: "5% Background", varName: "var(--theme-5)", opacity: "5%" },
];
</script>
