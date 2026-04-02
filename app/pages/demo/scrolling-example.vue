<template>
  <div
    v-page-fade
    class="page-content"
  >
    <ScrollingDemoSection />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  key: route => route.fullPath
})

useHead({ title: 'Scrolling Pin Demo' })
</script>
