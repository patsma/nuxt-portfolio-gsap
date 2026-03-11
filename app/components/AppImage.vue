<template>
  <div
    class="img-wrapper"
    :class="[{ 'img-wrapper--loaded': isLoaded }, wrapperClass]"
  >
    <NuxtImg
      ref="imgRef"
      v-bind="$attrs"
      @load="handleLoad"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * AppImage — Reusable image wrapper with shimmer skeleton loader.
 *
 * Drop-in replacement for NuxtImg. Adds a theme-aware shimmer overlay while
 * the image loads, then fades it out and reveals the image on load.
 *
 * Usage: same props as NuxtImg — all attrs forwarded via v-bind="$attrs".
 * The wrapper div (.img-wrapper) is not interactive and does not receive attrs.
 *
 * Cached image handling: browsers sometimes fire @load before onMounted,
 * so we check img.complete in nextTick to avoid a phantom shimmer on repeat visits.
 * NuxtImg renders to <img> — access underlying element via $el.
 */
defineOptions({ inheritAttrs: false })

defineProps({
  /** Extra classes applied to the wrapper div (e.g. 'w-full h-full' for fixed-height containers) */
  wrapperClass: {
    type: String,
    default: ''
  }
})

const isLoaded = ref(false)
const imgRef = useTemplateRef<{ $el: HTMLImageElement }>('imgRef')

function handleLoad() {
  isLoaded.value = true
}

onMounted(() => {
  // Fallback: nextTick for edge cases where $el isn't immediately accessible,
  // or when @load fires before onMounted on repeat visits.
  nextTick(() => {
    const img = imgRef.value?.$el as HTMLImageElement | undefined
    if (img?.complete && img.naturalWidth > 0) {
      isLoaded.value = true
    }
  })
})

// Expose inner img element so GSAP consumers can access it via ref.value.$el
// Plain getter (no computed wrapper) ensures GSAP gets the raw HTMLElement, not a reactive ref
defineExpose({
  get $el() { return imgRef.value?.$el as HTMLElement | undefined }
})
</script>
