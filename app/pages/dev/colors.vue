<template>
  <main class="p-6 md:p-8 lg:p-12">
    <header class="mb-8">
      <h1
        class="font-display text-step-3 md:text-step-4 font-semibold tracking-tight text-[var(--theme-text-100)]"
      >
        Theme Color System
      </h1>
      <p
        class="mt-2 text-[var(--theme-text-60)] font-body text-step-0 leading-[var(--leading-normal)]"
      >
        Toggle the theme in the header to see smooth color transitions across all variants.
      </p>
    </header>

    <!-- Text Variants Section -->
    <section aria-labelledby="text-heading" class="mb-12">
      <h2 id="text-heading" class="text-step-2 font-semibold mb-4 text-[var(--theme-text-100)]">
        Text Colors (--theme-text-*)
      </h2>
      <ul role="list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <li
          v-for="swatch in textSwatches"
          :key="swatch.name"
          class="rounded-lg overflow-hidden border border-[var(--theme-text-15)] bg-[var(--theme-5)] p-4"
        >
          <div class="mb-2 text-xs font-mono text-[var(--theme-text-40)]">
            {{ swatch.varName }}
          </div>
          <div :style="{ color: swatch.varName }" class="text-step-1 font-medium">
            {{ swatch.name }}
          </div>
          <div :style="{ color: swatch.varName }" class="text-sm mt-2">
            The quick brown fox jumps over the lazy dog
          </div>
        </li>
      </ul>
    </section>

    <!-- Background Variants Section -->
    <section aria-labelledby="bg-heading">
      <h2 id="bg-heading" class="text-step-2 font-semibold mb-4 text-[var(--theme-text-100)]">
        Background Colors (--theme-*)
      </h2>
      <ul role="list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <li
          v-for="swatch in bgSwatches"
          :key="swatch.name"
          class="rounded-lg overflow-hidden border border-[var(--theme-text-15)]"
          :style="{ backgroundColor: swatch.varName }"
        >
          <div class="p-4">
            <div class="mb-2 text-xs font-mono text-[var(--theme-text-60)]">
              {{ swatch.varName }}
            </div>
            <div class="text-step-1 font-medium text-[var(--theme-text-100)]">
              {{ swatch.name }}
            </div>
            <div class="text-sm mt-2 text-[var(--theme-text-100)]">
              Background with {{ swatch.opacity }} opacity
            </div>
          </div>
        </li>
      </ul>
    </section>
  </main>
  <!--
    Notes:
    - This page demonstrates how Tailwind v4 consumes @theme color tokens.
    - Each "bg-*-*" class maps to a CSS variable: var(--color-*-*).
    - We deliberately keep layout simple and semantic for quick visual QA.
  -->
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
