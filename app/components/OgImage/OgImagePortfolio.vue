<script setup lang="ts">
/**
 * OG Image Template - Portfolio
 *
 * Custom Open Graph image template for social sharing.
 * Rendered server-side by nuxt-og-image.
 *
 * Image dimensions: 1200x630 (standard OG ratio)
 */
defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Portfolio Template',
  description: 'Digital Design & Development'
})
</script>

<template>
  <div
    class="w-full h-full flex flex-col"
    style="background: linear-gradient(145deg, #090925 0%, #12123a 100%); padding: 64px 80px;"
  >
    <!-- Top bar accent -->
    <div
      style="height: 4px; width: 120px; margin-bottom: 48px; background: linear-gradient(90deg, #ffc8c4 0%, #b4a0ff 100%); border-radius: 2px;"
    />

    <!-- Domain -->
    <div
      style="font-size: 16px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255, 250, 245, 0.4); margin-bottom: 40px;"
    >
      example.com
    </div>

    <!-- Title -->
    <h1
      style="font-size: 64px; font-weight: 300; color: #fffaf5; line-height: 1.1; margin: 0 0 24px 0; max-width: 900px;"
    >
      {{ title }}
    </h1>

    <!-- Description -->
    <p
      style="font-size: 24px; color: rgba(255, 250, 245, 0.55); line-height: 1.5; margin: 0; max-width: 700px;"
    >
      {{ description }}
    </p>

    <!-- Spacer -->
    <div style="flex: 1;" />

    <!-- Footer -->
    <div
      style="display: flex; justify-content: space-between; align-items: center; padding-top: 32px; border-top: 1px solid rgba(255, 250, 245, 0.1);"
    >
      <div style="display: flex; gap: 32px;">
        <span style="font-size: 14px; color: rgba(255, 250, 245, 0.35);">Digital Design</span>
        <span style="font-size: 14px; color: rgba(255, 250, 245, 0.35);">Development</span>
        <span style="font-size: 14px; color: rgba(255, 250, 245, 0.35);">Art Direction</span>
      </div>
      <span style="font-size: 14px; color: rgba(255, 250, 245, 0.35);">Your City</span>
    </div>
  </div>
</template>
