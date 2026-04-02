<template>
  <section
    ref="sectionRef"
    v-page-fade:up="{ duration: 0.6 }"
    class="text-section content-grid w-full py-[var(--space-xl)]"
    data-entrance-animate="true"
  >
    <div
      ref="contentRef"
      class="breakout3"
    >
      <h2
        v-if="title"
        class="font-display font-[100] text-3xl md:text-5xl leading-[131%] tracking-tighter text-[var(--theme-text-100)] mb-[var(--space-s)]"
      >
        {{ title }}
      </h2>
      <p
        v-if="body"
        class="font-body text-base md:text-lg leading-relaxed text-[var(--theme-text-60)] max-w-3xl"
      >
        {{ body }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * TextSection MDC Component
 *
 * Simple text-heavy section with scroll animation.
 * Uses entrance animations on first load and ScrollTrigger for scroll reveals.
 *
 * Usage in MDC:
 * ```markdown
 * ::text-section
 * ---
 * title: Section Title
 * body: Section body text goes here.
 * ---
 * ::
 * ```
 */

import type { ScrollTriggerInstance } from '~/types/nuxt-gsap'

defineProps({
  title: {
    type: String,
    default: ''
  },
  body: {
    type: String,
    default: ''
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()

const sectionRef = ref(null)
const contentRef = ref(null)

let scrollTriggerInstance: ScrollTriggerInstance | null = null

const initScrollTrigger = () => {
  if (!sectionRef.value || !contentRef.value || !$ScrollTrigger) return

  // Clear any clip-path from page transitions
  $gsap.set(sectionRef.value, { clearProps: 'clipPath' })

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // Set initial state
  $gsap.set(contentRef.value, { autoAlpha: 0, y: 40 })

  // Fade in on scroll
  scrollTriggerInstance = $ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 80%',
    onEnter: () => {
      $gsap.to(contentRef.value, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
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
