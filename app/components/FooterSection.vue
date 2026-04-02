<template>
  <footer
    ref="footerRef"
    class="footer-section content-grid w-full"
  >
    <FullWidthBorder :opacity="15" />

    <div class="breakout3 py-[var(--space-l)] flex flex-col gap-[var(--space-m)]">
      <!-- Social links -->
      <div
        v-if="socialLinks.length"
        ref="linksRef"
        class="flex flex-wrap gap-[var(--space-s)]"
      >
        <a
          v-for="link in socialLinks"
          :key="link.label"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="display-mobile-h2 md:display-laptop-h2 text-[var(--theme-text-100)] hover:opacity-80 transition-opacity duration-[var(--duration-hover)]"
        >
          {{ link.label }}
        </a>
      </div>

      <!-- Email -->
      <div v-if="appConfig.identity?.email">
        <a
          :href="`mailto:${appConfig.identity.email}`"
          class="body-mobile-p1 text-[var(--theme-text-60)] hover:text-[var(--theme-text-100)] transition-colors duration-[var(--duration-hover)]"
        >
          {{ appConfig.identity.email }}
        </a>
      </div>

      <!-- Bottom bar: copyright + attribution -->
      <div class="flex flex-col gap-[var(--space-xs)] lg:flex-row lg:items-center lg:justify-between body-mobile-custom-labels uppercase text-[var(--theme-text-30)] pt-[var(--space-m)]">
        <span>&copy; {{ currentYear }}. All rights reserved.</span>
        <span v-if="appConfig.footer?.showAttribution">
          Template by
          <a
            class="underline"
            href="https://mschristensen.com"
            target="_blank"
          >Morten Christensen</a> &amp;
          <a
            class="underline"
            href="https://patryksmakosz.com/"
            target="_blank"
          >Patryk Smakosz</a>
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * FooterSection — Minimal footer with social links, email, and copyright.
 * Uses scroll-triggered fade-in animation via useScrollTriggerInit.
 */

import FullWidthBorder from '~/components/FullWidthBorder.vue'
import type { ScrollTriggerInstance } from '~/types/nuxt-gsap'

const appConfig = useAppConfig()
const { $gsap, $ScrollTrigger } = useNuxtApp()

const footerRef = ref(null)
const linksRef = ref(null)

const currentYear = computed(() => new Date().getFullYear())

// Build social links from app.config
const socialLinks = computed(() => {
  const social = appConfig.social || {}
  const links: { label: string, href: string }[] = []

  if (social.linkedin) links.push({ label: 'LinkedIn', href: social.linkedin })
  if (social.github) links.push({ label: 'GitHub', href: social.github })
  if (social.dribbble) links.push({ label: 'Dribbble', href: social.dribbble })
  if (social.behance) links.push({ label: 'Behance', href: social.behance })
  if (social.twitter) links.push({ label: 'Twitter', href: social.twitter })

  return links
})

let scrollTriggerInstance: ScrollTriggerInstance | null = null
let unhookPageStart: (() => void) | null = null

const handlePageLeave = () => {
  if (linksRef.value) {
    $gsap.to(linksRef.value, { opacity: 0, duration: 0.4, ease: 'power2.in' })
  }
}

const initScrollTrigger = () => {
  if (!footerRef.value || !$ScrollTrigger) return

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // Set initial state
  if (linksRef.value) {
    $gsap.set(linksRef.value, { clearProps: 'all' })
    $gsap.set(linksRef.value, { opacity: 0, y: 30 })
  }

  scrollTriggerInstance = $ScrollTrigger.create({
    trigger: footerRef.value,
    start: 'top 85%',
    onEnter: () => {
      if (linksRef.value) {
        $gsap.to(linksRef.value, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        })
      }
    },
    once: true
  })
}

const cleanup = () => {
  unhookPageStart?.()
  unhookPageStart = null
  scrollTriggerInstance?.kill()
  scrollTriggerInstance = null
}

onMounted(() => {
  const nuxtApp = useNuxtApp()
  unhookPageStart = nuxtApp.hook('page:start', handlePageLeave)
})

useScrollTriggerInit(() => initScrollTrigger(), cleanup)
</script>

<style scoped>
.footer-section {
  position: relative;
}
</style>
