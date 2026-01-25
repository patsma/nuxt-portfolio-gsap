<script setup lang="ts">
/**
 * OG Image Template - Portfolio
 *
 * Custom Open Graph image template for social sharing.
 * Rendered server-side by nuxt-og-image.
 *
 * Supports Tailwind classes (subset) for styling.
 * Image dimensions: 1200x630 (standard OG ratio)
 */
defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Morten Christensen',
  description: 'Danish Designer in Tokyo'
})
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between bg-[#090925] p-16">
    <!-- Top section: Branding -->
    <div class="flex items-center justify-between">
      <div class="text-[#fffaf5] text-3xl tracking-wider uppercase opacity-60">
        mortenchristensen.com
      </div>
    </div>

    <!-- Center section: Title and description -->
    <div class="flex-1 flex flex-col justify-center">
      <h1 class="text-[#fffaf5] text-8xl font-light leading-tight mb-6">
        {{ title }}
      </h1>
      <p class="text-[#fffaf5] text-4xl opacity-70 leading-snug max-w-4xl">
        {{ description }}
      </p>
    </div>

    <!-- Bottom section: Tagline -->
    <div class="flex items-center justify-between">
      <div class="text-[#fffaf5] text-2xl opacity-50">
        UX/UI Design · Art Direction · Interactive Design
      </div>
      <div class="text-[#fffaf5] text-2xl opacity-50">
        Tokyo, Japan
      </div>
    </div>
  </div>
</template>
