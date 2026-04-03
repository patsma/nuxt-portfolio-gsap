<template>
  <section
    ref="sectionRef"
    class="scrolling-demo-section content-grid w-full -mt-[var(--size-header)]"
    data-entrance-animate="true"
  >
    <div class="breakout3 grid grid-cols-1 lg:grid-cols-2 lg:gap-[var(--space-l)]">
      <!-- Left column: scrolls naturally -->
      <div ref="leftColumnRef">
        <!-- Hero panel -->
        <div
          ref="heroPanelRef"
          class="lg:min-h-screen flex flex-col lg:justify-center pt-[calc(var(--size-header)+var(--space-xl))] lg:pt-[var(--size-header)] pb-[var(--space-l)] lg:pb-0"
        >
          <h1
            ref="headlineRef"
            v-page-split:lines="{ animateFrom: 'below' }"
            class="display-mobile-h1 md:display-laptop-h1 2xl:display-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]"
          >
            Redefine your workflow
          </h1>

          <p
            ref="descriptionRef"
            v-page-clip:bottom
            class="body-mobile-p1 md:body-desktop-p1 text-[var(--theme-text-60)] mb-[var(--space-l)] max-w-xl"
          >
            A next-generation platform that adapts to how you work.
            Seamlessly integrate your tools, automate repetitive tasks,
            and focus on what truly matters.
          </p>

          <!-- Mobile image placement -->
          <div
            ref="mobileImageRef"
            v-page-clip:bottom
            class="lg:hidden mb-[var(--space-l)]"
          >
            <AppImage
              src="/assets/dummy/placeholder3.jpg"
              alt="Product dashboard preview"
              class="w-full rounded-lg object-cover aspect-[4/3]"
              wrapper-class="w-full"
              loading="lazy"
            />
          </div>

          <div
            ref="buttonsRef"
            v-page-fade:up
            class="flex flex-wrap gap-[var(--space-s)]"
          >
            <button
              class="inline-flex items-center px-[var(--space-m)] py-[var(--space-xs)] border border-[var(--theme-text-100)] rounded-full body-mobile-p1 2xl:body-desktop-p1 text-[var(--theme-text-100)] opacity-60 hover:opacity-100 transition-opacity duration-[var(--duration-hover)] ease-[var(--ease-power2)] cursor-pointer"
            >
              Get started
            </button>
            <button
              class="inline-flex items-center px-[var(--space-m)] py-[var(--space-xs)] border border-[var(--theme-text-100)] rounded-full body-mobile-p1 2xl:body-desktop-p1 text-[var(--theme-text-100)] opacity-60 hover:opacity-100 transition-opacity duration-[var(--duration-hover)] ease-[var(--ease-power2)] cursor-pointer"
            >
              See how it works
            </button>
          </div>
        </div>

        <!-- Features panel -->
        <div
          id="features"
          class="lg:min-h-screen flex flex-col pt-[var(--space-l)] lg:pt-0 lg:justify-center"
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

        <!-- Height compensator: absorbs accordion height changes to keep pin stable -->
        <div
          ref="spacerRef"
          class="hidden lg:block"
          aria-hidden="true"
        />
      </div>

      <!-- Right column: pinned on desktop -->
      <div
        ref="rightColumnRef"
        class="hidden lg:flex h-screen items-center self-start"
      >
        <div
          ref="imageWrapperRef"
          v-page-clip:bottom
        >
          <AppImage
            src="/assets/dummy/placeholder3.jpg"
            alt="Product dashboard preview"
            class="w-full rounded-lg object-cover aspect-[4/3] max-h-[70vh]"
            wrapper-class="w-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ScrollTriggerInstance } from '~/types/nuxt-gsap'

const { $gsap, $ScrollTrigger, $SplitText } = useNuxtApp()
const { isDesktop } = useIsMobile()
const { setupEntrance } = useEntranceAnimation()

const sectionRef = ref<HTMLElement | null>(null)
const rightColumnRef = ref<HTMLElement | null>(null)
const leftColumnRef = ref<HTMLElement | null>(null)
const spacerRef = ref<HTMLElement | null>(null)
const heroPanelRef = ref<HTMLElement | null>(null)
const headlineRef = ref<HTMLElement | null>(null)
const descriptionRef = ref<HTMLElement | null>(null)
const buttonsRef = ref<HTMLElement | null>(null)
const imageWrapperRef = ref<HTMLElement | null>(null)
const mobileImageRef = ref<HTMLElement | null>(null)

let pinScrollTrigger: ScrollTriggerInstance | null = null
let baseLeftHeight = 0
let resizeObserver: ResizeObserver | null = null


/**
 * Adjust spacer height to keep total left column height constant.
 * Called every frame during accordion animation via ResizeObserver.
 */
const adjustSpacer = () => {
  if (!leftColumnRef.value || !spacerRef.value || !baseLeftHeight) return

  const currentSpacerHeight = spacerRef.value.offsetHeight
  const contentHeight = leftColumnRef.value.scrollHeight - currentSpacerHeight
  const newSpacerHeight = Math.max(baseLeftHeight - contentHeight, 0)
  spacerRef.value.style.height = `${newSpacerHeight}px`
}

// requestRefresh still needed for headroom unpause callback chain
provide('requestRefresh', (callback?: () => void) => {
  adjustSpacer()
  callback?.()
})

const features = [
  {
    title: 'Smart automation',
    content: 'Set up workflows that run on autopilot. Connect triggers, conditions, and actions - no code required.'
  },
  {
    title: 'Real-time collaboration',
    content: 'Work together in shared spaces with live cursors, inline comments, and instant sync across devices.'
  },
  {
    title: 'Advanced analytics',
    content: 'Track what matters with custom dashboards. Surface trends, spot bottlenecks, and make decisions backed by data.'
  },
  {
    title: 'Enterprise-grade security',
    content: 'End-to-end encryption, SSO integration, and granular permissions. Your data stays yours.'
  }
]

// Entrance animation -SplitText headline + staggered description/buttons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let splitInstance: any = null

onMounted(() => {
  setupEntrance(sectionRef.value, {
    position: '<-0.3',
    animate: (el: HTMLElement) => {
      const tl = $gsap.timeline({ delay: 0.2 })

      // Set all child initial states BEFORE revealing the section (no flash)
      if (headlineRef.value) {
        const originalHeight = headlineRef.value.offsetHeight
        $gsap.set(headlineRef.value, { height: originalHeight })

        splitInstance = $SplitText.create(headlineRef.value, {
          type: 'lines',
          mask: 'lines'
        })

        $gsap.set(splitInstance.lines, {
          yPercent: 100,
          rotate: 15,
          transformOrigin: '0% 0%'
        })
      }
      if (descriptionRef.value) $gsap.set(descriptionRef.value, { opacity: 0, y: 25 })
      if (imageWrapperRef.value) $gsap.set(imageWrapperRef.value, { clipPath: 'inset(100% 0% 0% 0%)' })
      if (mobileImageRef.value) $gsap.set(mobileImageRef.value, { clipPath: 'inset(100% 0% 0% 0%)' })
      if (buttonsRef.value) {
        $gsap.set(buttonsRef.value, { autoAlpha: 0 })
        const buttons = buttonsRef.value.querySelectorAll('button')
        $gsap.set(buttons, { y: 15 })
      }

      // NOW reveal the section -children are in their hidden initial states
      $gsap.set(el, { autoAlpha: 1 })

      // 1. Title -SplitText line reveal (first, slow stagger)
      if (splitInstance) {
        tl.to(splitInstance.lines, {
          yPercent: 0,
          rotate: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'back.out(1.2)'
        })
      }

      // 2. Description -fade up after title
      if (descriptionRef.value) {
        tl.to(descriptionRef.value, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out'
        }, '-=0.4')
      }

      // 3. Image -clip reveal from bottom (like InteractiveCaseStudy pattern)
      const activeImageRef = isDesktop.value ? imageWrapperRef.value : mobileImageRef.value
      if (activeImageRef) {
        tl.to(activeImageRef, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1,
          ease: 'power2.out'
        }, '-=0.5')
      }

      // 4. Buttons -reveal wrapper then stagger individual buttons
      if (buttonsRef.value) {
        tl.to(buttonsRef.value, { autoAlpha: 1, duration: 0 }, '-=0.6')
        const buttons = buttonsRef.value.querySelectorAll('button')
        tl.fromTo(buttons, { autoAlpha: 0, y: 15 }, {
          autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out'
        }, '-=0.6')
      }

      return tl
    }
  })
})

onUnmounted(() => {
  splitInstance?.revert?.()
  splitInstance = null
})

const initScrollTrigger = () => {
  if (!sectionRef.value || !leftColumnRef.value) return

  if (pinScrollTrigger) {
    pinScrollTrigger.kill()
    pinScrollTrigger = null
  }

  if (isDesktop.value && rightColumnRef.value) {
    baseLeftHeight = leftColumnRef.value.scrollHeight
    const scrollDistance = Math.max(baseLeftHeight - window.innerHeight, 1)

    pinScrollTrigger = $ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top top',
      end: `+=${scrollDistance}`,
      pin: rightColumnRef.value,
      anticipatePin: 1,
      invalidateOnRefresh: true
    })

    // Watch for height changes in real-time (fires every frame during GSAP accordion animation)
    resizeObserver = new ResizeObserver(() => adjustSpacer())
    resizeObserver.observe(leftColumnRef.value)
  }
}

useScrollTriggerInit(
  () => initScrollTrigger(),
  () => {
    pinScrollTrigger?.kill()
    pinScrollTrigger = null
    resizeObserver?.disconnect()
    resizeObserver = null
  }
)
</script>
