<template>
  <section
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <div
      class="breakout3 grid gap-[var(--space-m)] lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-3xl)] items-start"
    >
      <!-- Biography label (left column on laptop+) -->
      <h2 class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
        <slot name="label">Biography</slot>
      </h2>

      <!-- Biography content (right column on laptop+) -->
      <div
        class="space-y-[var(--space-m)] ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2"
      >
        <slot />
      </div>
    </div>
  </section>
</template>
