<template>
  <section
    ref="heroRef"
    class="content-grid w-full min-h-[100dvh] grid items-center"
    data-entrance-animate="true"
  >
    <div class="breakout3 translate-y-[var(--space-xl)]">
      <!-- Headline - rendered from structured data OR slot -->
      <h1
        ref="headlineRef"
        v-page-split:lines="{ animateFrom: 'below' }"
        class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter"
      >
        <!-- Structured headline from data -->
        <template v-if="heroData?.headline">
          <template
            v-for="(segment, index) in heroData.headline"
            :key="index"
          >
            <em
              v-if="segment.variant === 'italic'"
              class="text-[var(--theme-text-100)] italic font-[300]"
            >{{ segment.text }}</em>
            <span
              v-else
              :class="getSegmentClass(segment.variant)"
            >{{ segment.text }}</span>
          </template>
        </template>
        <!-- Fallback to slot content (for MDC prose or direct usage) -->
        <slot v-else />
      </h1>

      <!-- Horizontal layout container for services and button -->
      <div class="flex flex-col md:flex-row md:items-center gap-[var(--space-s)]">
        <!-- Services list - fetched from data collection -->
        <div
          v-if="shouldShowServices && services?.items"
          ref="servicesRef"
        >
          <nav
            class="services-list pt-10"
            aria-label="Services"
          >
            <div
              v-page-stagger="{ stagger: 0.08, duration: 0.5 }"
              data-speed="0.95"
              class="flex flex-wrap gap-2 max-w-3xl"
            >
              <div class="tag-label">
                Services
              </div>
              <div
                v-for="service in services.items"
                :key="service"
                class="tag"
              >
                {{ service }}
              </div>
            </div>
          </nav>
        </div>

        <!-- Scroll down button -->
        <div
          v-if="shouldShowScrollButton"
          ref="buttonRef"
          class="md:ml-auto"
        >
          <ScrollButtonSVG
            v-page-fade:left
            data-speed="1"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * HeroSection MDC Component
 *
 * Supports two modes:
 * 1. Data-driven: Fetches hero data from collection by heroId prop
 * 2. Slot-based: Uses slot content for simple MDC prose
 *
 * Usage (data-driven):
 * ```markdown
 * ::HeroSection{heroId="home"}
 * ::
 * ```
 *
 * Usage (slot-based):
 * ```markdown
 * ::HeroSection{showServices=false}
 * Welcome, I am **Morten** – a designer...
 * ::
 * ```
 */

import ScrollButtonSVG from '~/components/SVG/ScrollButtonSVG.vue'

// Types
type TextVariant = 'default' | 'emphasis' | 'body' | 'italic'

interface HeroTextSegment {
  text: string
  variant?: TextVariant
}

// HeroData interface available for type reference if needed
interface _HeroData {
  id: string
  headline: HeroTextSegment[]
  showServices?: boolean
  showScrollButton?: boolean
}

// Props
interface Props {
  heroId?: string // ID to fetch specific hero data (e.g., 'home', 'about')
  showServices?: boolean // Override from props
  showScrollButton?: boolean // Override from props
  animateEntrance?: boolean
  position?: string
}

const props = withDefaults(defineProps<Props>(), {
  heroId: 'home',
  showServices: undefined, // undefined = use data value
  showScrollButton: undefined, // undefined = use data value
  animateEntrance: true,
  position: '<-0.3'
})

// Fetch hero data from collection by ID
// Note: YAML fields are in meta.body, stem is the file path
const { data: heroData } = await useAsyncData(`hero-${props.heroId}`, async () => {
  const allHeroes = await queryCollection('hero').all()
  // Match by stem ending (filename without extension)
  return allHeroes.find(h => h.stem?.endsWith(props.heroId)) || null
})

// Fetch services from data collection
const { data: services } = await useAsyncData('hero-services', () =>
  queryCollection('services').first()
)

// Computed: resolve showServices (props override data)
const shouldShowServices = computed(() =>
  props.showServices ?? heroData.value?.showServices ?? true
)

// Computed: resolve showScrollButton (props override data)
const shouldShowScrollButton = computed(() =>
  props.showScrollButton ?? heroData.value?.showScrollButton ?? true
)

// Get CSS class for text segment based on variant
function getSegmentClass(variant?: TextVariant): string {
  switch (variant) {
    case 'emphasis':
      return 'text-[var(--theme-text-100)] font-[300]'
    case 'body':
      return 'text-[var(--theme-text-100)] font-body font-[300]'
    case 'italic':
      return 'text-[var(--theme-text-100)] italic font-[300]'
    default:
      return 'text-[var(--theme-text-60)]'
  }
}

// Nuxt GSAP
const { $gsap, $SplitText } = useNuxtApp()

// Entrance animation system
const { setupEntrance } = useEntranceAnimation()

// Refs
const heroRef = ref<HTMLElement | null>(null)
const headlineRef = ref<HTMLElement | null>(null)
const servicesRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
const splitInstance = shallowRef<ReturnType<typeof $SplitText.create> | null>(null)

onMounted(() => {
  if (!props.animateEntrance || !heroRef.value) return

  setupEntrance(heroRef.value, {
    position: props.position,
    animate: (el) => {
      const textElement = headlineRef.value

      if (!textElement || !$SplitText) {
        const tl = $gsap.timeline()
        $gsap.set(el, { y: 40 })
        tl.to(el, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' })
        return tl
      }

      // Lock height before SplitText
      const originalHeight = textElement.offsetHeight
      $gsap.set(textElement, { height: originalHeight })

      // Apply SplitText with masking
      const split = $SplitText.create(textElement, {
        type: 'lines',
        mask: 'lines'
      })
      splitInstance.value = split

      const tl = $gsap.timeline()

      // Set initial state
      $gsap.set(split.lines, {
        yPercent: 100,
        rotate: 20,
        transformOrigin: '0% 0%'
      })

      $gsap.set(el, { autoAlpha: 1 })

      // Animate headline
      tl.to(split.lines, {
        yPercent: 0,
        rotate: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'back.out(1.2)'
      })

      // Services animation
      if (servicesRef.value) {
        const tags = servicesRef.value.querySelectorAll('.tag, .tag-label')
        if (tags.length > 0) {
          $gsap.set(tags, { opacity: 0, y: 20 })
          tl.to(
            tags,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power2.out'
            },
            '<+0.3'
          )
        }
      }

      // Button animation
      if (buttonRef.value) {
        const button = buttonRef.value.querySelector('.scroll-button')
        if (button) {
          $gsap.set(button, { opacity: 0, scale: 0.9 })
          tl.to(
            button,
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: 'back.out(1.5)'
            },
            '<+1.5'
          )
        }
      }

      return tl
    }
  })
})

onUnmounted(() => {
  if (splitInstance.value) {
    splitInstance.value.revert?.()
    splitInstance.value = null
  }
})
</script>
