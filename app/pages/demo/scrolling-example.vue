<template>
  <div
    v-page-fade
    class="page-content"
  >
    <ScrollingDemoSection />

    <!-- Bottom spacer — gives the page breathing room after the pinned section -->
    <div class="min-h-screen" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  key: route => route.fullPath
})

useHead({ title: 'Scrolling Pin Demo' })

// Hide footer on this demo page (it lives in the layout)
onMounted(() => {
  const footer = document.querySelector('.footer-section')
  if (footer instanceof HTMLElement) footer.style.display = 'none'
})
onUnmounted(() => {
  const footer = document.querySelector('.footer-section')
  if (footer instanceof HTMLElement) footer.style.display = ''
})
</script>
