<template>
  <main class="p-6 md:p-8 lg:p-12">
    <header class="mb-8">
      <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">
        Color Board
      </h1>
      <p class="mt-2 text-stone-600">
        Visual test page for <code>@theme</code> <code>--color-*</code> tokens.
      </p>
    </header>

    <section aria-labelledby="palette-heading">
      <h2 id="palette-heading" class="sr-only">Palette</h2>
      <ul
        role="list"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <li
          v-for="swatch in swatches"
          :key="swatch.name"
          class="rounded-lg overflow-hidden border border-black/10 bg-white"
        >
          <!-- Big color tile -->
          <div
            class="aspect-[16/9] flex items-end p-4"
            :class="[swatch.bg, swatch.text]"
          >
            <div class="w-full flex items-center justify-between">
              <span class="text-sm font-medium">{{ swatch.name }}</span>
              <span class="text-xs opacity-80">{{ swatch.bg }}</span>
            </div>
          </div>

          <!-- Mini samples -->
          <div class="p-4 grid grid-cols-2 gap-3">
            <div
              class="rounded-md p-3 text-center border"
              :class="[swatch.bg, swatch.text, swatch.border]"
            >
              Text
            </div>
            <div
              class="rounded-md p-3 text-center"
              :class="[swatch.textBg, swatch.textOnAlt]"
            >
              On Light
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
/**
 * Swatch definition for the board.
 * We pair each background with a high-contrast text color.
 * For light backgrounds we display an alternate sample labeled "On Light".
 * @typedef {Object} Swatch
 * @property {string} name   Human-readable token name (without --color- prefix)
 * @property {string} bg     Tailwind background class (e.g. bg-dark-100)
 * @property {string} text   Tailwind text color class for contrast on bg
 * @property {string} border Tailwind border color to outline the sample
 * @property {string} textBg Alternate surface background (usually light)
 * @property {string} textOnAlt Text color used on the alternate surface
 */

/** @type {Swatch[]} */
const swatches = [
  // Dark scale
  {
    name: "dark-100",
    bg: "bg-dark-100",
    text: "text-light-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "dark-60",
    bg: "bg-dark-60",
    text: "text-light-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "dark-50",
    bg: "bg-dark-50",
    text: "text-light-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "dark-40",
    bg: "bg-dark-40",
    text: "text-light-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "dark-30",
    bg: "bg-dark-30",
    text: "text-light-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "dark-15",
    bg: "bg-dark-15",
    text: "text-light-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "dark-5",
    bg: "bg-dark-5",
    text: "text-dark-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },

  // Light scale
  {
    name: "light-100",
    bg: "bg-light-100",
    text: "text-dark-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "light-60",
    bg: "bg-light-60",
    text: "text-dark-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "light-50",
    bg: "bg-light-50",
    text: "text-dark-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "light-40",
    bg: "bg-light-40",
    text: "text-dark-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
  {
    name: "light-15",
    bg: "bg-light-15",
    text: "text-dark-100",
    border: "border-dark-15",
    textBg: "bg-light-100",
    textOnAlt: "text-dark-100",
  },
];
</script>
