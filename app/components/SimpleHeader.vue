<template>
  <!-- Token-driven header using content-grid and spacing variables -->
  <div
    class="bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur border-b relative z-50 border-gray-200"
  >
    <div class="content-grid">
      <div class="content py-[calc(var(--space-s))]">
        <nav class="flex items-center justify-between" aria-label="Primary">
          <div class="flex items-center gap-[var(--space-s)]">
            <NuxtLink
              to="/"
              class="font-agrandir text-step-0 text-[var(--color-ink)] hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="font-agrandir text-step-0 text-[var(--color-ink)]/80 hover:text-[var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              About
            </NuxtLink>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
// Simple nav only. Renders links to Home and About.
// Styling uses Tailwind utilities exclusively.
</script>

<!-- No scoped styles; Tailwind only. -->
