<template>
  <section
    ref="sectionRef"
    v-page-clip:bottom="{ duration: 0.8, leaveOnly: true }"
    class="image-section content-grid w-full py-[var(--space-m)]"
  >
    <div
      ref="containerRef"
      class="breakout3 overflow-hidden"
    >
      <div class="parallax-container">
        <AppImage
          ref="imageRef"
          :src="src"
          :alt="alt"
          class="parallax-media w-full object-cover"
          wrapper-class="w-full h-full"
          :data-speed="speed"
          :data-lag="lag"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * ImageSection MDC Component
 *
 * Simple image section with ScrollSmoother parallax (data-speed, data-lag).
 * Uses ScrollTrigger for scroll-linked clip reveal.
 *
 * Usage in MDC:
 * ```markdown
 * ::image-section
 * ---
 * src: /images/placeholder1.jpg
 * alt: Description of image
 * speed: 0.9
 * lag: 0.1
 * ---
 * ::
 * ```
 */

import type { ScrollTriggerInstance } from '~/types/nuxt-gsap'

defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  speed: {
    type: Number,
    default: 0.9
  },
  lag: {
    type: Number,
    default: 0.1
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()

const sectionRef = ref(null)
const containerRef = ref(null)
const imageRef = ref(null)

let scrollTriggerInstance: ScrollTriggerInstance | null = null

const initScrollTrigger = () => {
  if (!sectionRef.value || !containerRef.value || !$ScrollTrigger) return

  // Clear any clip-path from page transitions
  $gsap.set(containerRef.value, { clearProps: 'clipPath' })

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // Set initial state: clipped from bottom
  $gsap.set(containerRef.value, {
    clipPath: 'inset(0 0 100% 0)',
    autoAlpha: 1
  })

  // Reveal on scroll
  scrollTriggerInstance = $ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 75%',
    onEnter: () => {
      $gsap.to(containerRef.value, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1,
        ease: 'power2.out'
      })
    },
    once: true
  })
}

useScrollTriggerInit(
  () => initScrollTrigger(),
  () => {
    scrollTriggerInstance?.kill()
    scrollTriggerInstance = null
  }
)
</script>

<style scoped>
.parallax-container {
  overflow: hidden;
  position: relative;
  height: 60vh;
  width: 100%;
}

:deep(.parallax-media) {
  height: 140%;
}
</style>
