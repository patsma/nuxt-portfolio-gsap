<template>
  <section
    ref="sectionRef"
    class="scrolling-demo-section content-grid w-full"
  >
    <div class="breakout3 grid grid-cols-1 lg:grid-cols-2 lg:gap-[var(--space-l)]">
      <!-- Left column: scrolls naturally -->
      <div ref="leftColumnRef">
        <!-- Hero panel -->
        <div class="min-h-screen flex flex-col justify-center">
          <h1 class="heading-2 mb-[var(--space-m)]">
            Scroll pinning with GSAP ScrollTrigger
          </h1>

          <p class="body-desktop-p1 text-[var(--theme-text-60)] mb-[var(--space-l)] max-w-xl">
            A two-column layout where the right image stays pinned while you scroll
            through the content on the left. Built with ScrollTrigger and ScrollSmoother.
          </p>

          <!-- Mobile image placement -->
          <div class="lg:hidden mb-[var(--space-l)]">
            <AppImage
              src="/assets/dummy/placeholder3.jpg"
              alt="Scrolling demo showcase"
              class="w-full rounded-lg object-cover aspect-[4/3]"
              wrapper-class="w-full"
              loading="lazy"
            />
          </div>

          <div class="flex flex-wrap gap-[var(--space-s)]">
            <button
              class="inline-flex items-center px-[var(--space-m)] py-[var(--space-xs)] border border-[var(--theme-text-60)] rounded-full body-mobile-p1 2xl:body-desktop-p1 text-[var(--theme-text-60)] hover:text-[var(--theme-text-100)] hover:border-[var(--theme-text-100)] transition-colors duration-300 cursor-pointer"
              @click="handleScrollToFeatures"
            >
              Explore features
            </button>
            <button
              class="inline-flex items-center px-[var(--space-m)] py-[var(--space-xs)] border border-[var(--theme-text-60)] rounded-full body-mobile-p1 2xl:body-desktop-p1 text-[var(--theme-text-60)] hover:text-[var(--theme-text-100)] hover:border-[var(--theme-text-100)] transition-colors duration-300 cursor-pointer"
            >
              View source
            </button>
          </div>
        </div>

        <!-- Features panel -->
        <div
          id="features"
          class="min-h-screen flex flex-col justify-center"
        >
          <ScrollingDemoAccordionItem
            v-for="(feature, index) in features"
            :key="feature.title"
            :number="String(index + 1).padStart(2, '0')"
            :title="feature.title"
            :content="feature.content"
          />
          <!-- Bottom border for the last item -->
          <div class="full-width-content relative">
            <FullWidthBorder spacing="0" />
          </div>
        </div>
      </div>

      <!-- Right column: pinned on desktop -->
      <div
        ref="rightColumnRef"
        class="hidden lg:flex h-screen items-center self-start"
      >
        <AppImage
          src="/assets/dummy/placeholder3.jpg"
          alt="Scrolling demo showcase"
          class="w-full rounded-lg object-cover aspect-[4/3] max-h-[70vh]"
          wrapper-class="w-full"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ScrollTriggerInstance } from '~/types/nuxt-gsap'

const { $ScrollTrigger } = useNuxtApp()
const { isDesktop } = useIsMobile()

const sectionRef = ref<HTMLElement | null>(null)
const rightColumnRef = ref<HTMLElement | null>(null)
const leftColumnRef = ref<HTMLElement | null>(null)

let pinScrollTrigger: ScrollTriggerInstance | null = null

const { getSmoother } = useScrollSmootherManager()

const handleScrollToFeatures = () => {
  const smoother = getSmoother()
  const featuresEl = document.getElementById('features')
  if (smoother && featuresEl) {
    smoother.scrollTo(featuresEl, true)
  }
  else if (featuresEl) {
    featuresEl.scrollIntoView({ behavior: 'smooth' })
  }
}

// Provide requestRefresh so accordion height changes recalculate the pin end position
provide('requestRefresh', (callback?: () => void) => {
  $ScrollTrigger.refresh()
  callback?.()
})

const features = [
  {
    title: 'Intuitive user experience',
    content: 'Designed with simplicity in mind, every interaction feels natural and effortless.'
  },
  {
    title: 'Blazing fast performance',
    content: 'Optimized for speed with lazy loading, code splitting, and edge caching.'
  },
  {
    title: 'Accessible by default',
    content: 'Built to WCAG standards with keyboard navigation, screen reader support, and high contrast.'
  },
  {
    title: 'Seamless integrations',
    content: 'Connect with your favorite tools through our extensive API and plugin ecosystem.'
  }
]

const initScrollTrigger = () => {
  if (!sectionRef.value || !rightColumnRef.value || !leftColumnRef.value) return

  if (pinScrollTrigger) {
    pinScrollTrigger.kill()
    pinScrollTrigger = null
  }

  if (isDesktop.value) {
    const scrollDistance = Math.max(leftColumnRef.value.scrollHeight - window.innerHeight, 1)

    pinScrollTrigger = $ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top top',
      end: `+=${scrollDistance}`,
      pin: rightColumnRef.value,
      anticipatePin: 1,
      invalidateOnRefresh: true
    })
  }
}

useScrollTriggerInit(
  () => initScrollTrigger(),
  () => {
    pinScrollTrigger?.kill()
    pinScrollTrigger = null
  }
)
</script>
