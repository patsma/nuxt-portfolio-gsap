<script setup lang="ts">
/**
 * Glass Progressive Test Page
 *
 * Uses glass-progressive layout which has a STEP constant.
 * Change STEP in the layout file to test each component level.
 */

definePageMeta({
  layout: 'glass-progressive'
})
</script>

<template>
  <div class="min-h-[250vh] p-6">
    <h1 class="text-2xl font-bold mb-4">
      Glass Progressive Test
    </h1>
    <div class="mb-6 p-4 rounded-lg bg-black/10">
      <p class="font-bold text-lg mb-2">
        Test URL: /glass-test
      </p>
      <p class="text-sm opacity-80">
        Edit STEP in app/layouts/glass-progressive.vue, then rebuild
      </p>
    </div>
    <p
      v-for="i in 50"
      :key="i"
      class="mb-4"
    >
      Line {{ i }} - Scroll to see glass effect
    </p>
  </div>
</template>
