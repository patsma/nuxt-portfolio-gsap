<template>
  <footer class="footer-section">
    <!-- Section 1: Hero CTA (Reusing HeroSection component) -->
    <FooterHeroSection>
      <h1 class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter">
        <span class="text-[var(--theme-text-60)]">Feel</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> free</span>
        <span class="text-[var(--theme-text-60)]"> to reach out if you want to</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> collaborate, hire,</em>
        <span class="text-[var(--theme-text-60)]"> or</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> simply</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> have a chat</em>
        <span class="text-[var(--theme-text-60)]"> with me</span>
      </h1>
      <template #button>
        <ScrollButtonSVG direction="up" />
      </template>
    </FooterHeroSection>

    <!-- Section 2: Marquee (Multilingual "Get in touch") -->
    <div
      ref="marqueeWrapperRef"
      class="marquee-wrapper full-width-content relative"
    >
      <FullWidthBorder :opacity="15" />
      <FooterMarquee ref="marqueeRef" />
    </div>

    <!-- Section 3: Links/Info List -->
    <div
      ref="linksListRef"
      class="links-list full-width-content flex flex-col"
    >
      <!-- Link Item 1: Email -->
      <div class="link-item full-width-content">
        <FullWidthBorder :opacity="15" />
        <div class="link-item-wrapper content-grid w-full">
          <div
            class="link-item-content breakout3 py-[var(--space-m)] flex flex-col gap-[var(--space-xs)] lg:flex-row lg:items-center lg:justify-between"
          >
            <a
              href="mailto:contact@mschristensen.com"
              class="pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 text-[var(--theme-text-100)] hover:opacity-80 transition-opacity duration-[var(--duration-hover)]"
            >
              <slot name="email">contact@mschristensen.com</slot>
            </a>
            <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-40)]">
              <slot name="email-desc">
                Got a project or something else?
              </slot>
            </p>
          </div>
        </div>
      </div>

      <!-- Link Item 2: LinkedIn -->
      <div class="link-item full-width-content">
        <FullWidthBorder :opacity="15" />
        <div class="link-item-wrapper content-grid w-full">
          <div
            class="link-item-content breakout3 py-[var(--space-m)] flex flex-col gap-[var(--space-xs)] lg:flex-row lg:items-center lg:justify-between"
          >
            <a
              href="https://www.linkedin.com/in/mortengust/"
              target="_blank"
              rel="noopener noreferrer"
              class="pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 text-[var(--theme-text-100)] hover:opacity-80 transition-opacity duration-[var(--duration-hover)]"
            >
              <slot name="linkedin">LinkedIn</slot>
            </a>
            <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-40)]">
              <slot name="linkedin-desc">
                Let's connect? Also, my online resumé
              </slot>
            </p>
          </div>
        </div>
      </div>

      <!-- Link Item 3: Behance -->
      <div class="link-item full-width-content">
        <FullWidthBorder :opacity="15" />
        <div class="link-item-wrapper content-grid w-full">
          <div
            class="link-item-content breakout3 py-[var(--space-m)] flex flex-col gap-[var(--space-xs)] lg:flex-row lg:items-center lg:justify-between"
          >
            <a
              href="https://www.behance.net/mschristensen"
              target="_blank"
              rel="noopener noreferrer"
              class="pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 text-[var(--theme-text-100)] hover:opacity-80 transition-opacity duration-[var(--duration-hover)]"
            >
              <slot name="behance">Behance</slot>
            </a>
            <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-40)]">
              <slot name="behance-desc">
                My latest projects
              </slot>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Socket (Copyright + Cookie Policy + Special Thanks) -->
    <div class="socket-section full-width-content relative">
      <FullWidthBorder :opacity="15" />
      <div class="socket-wrapper content-grid w-full">
        <div
          class="socket breakout3 py-[var(--space-s)] flex flex-col gap-[var(--space-s)] lg:flex-row lg:items-center lg:justify-between ibm-plex-sans-jp-mobile-custom-labels uppercase text-[var(--theme-text-30)]"
        >
          <!-- Copyright + Cookie Policy (left/top) -->
          <div class="copyright-policy flex gap-[var(--space-m)] items-center flex-wrap">
            <span><slot name="copyright">© Copyright, {{ currentYear }}</slot></span>
            <a
              href="/"
              class="hover:opacity-80 transition-opacity duration-[var(--duration-hover)]"
            >
              <slot name="cookie-policy">Cookie Policy</slot>
            </a>
          </div>

          <!-- Attribution (right/bottom) -->
          <div class="special-thanks lg:text-right">
            <p>
              <slot name="thanks">
                Template by <a
                  class="underline pb-1"
                  href="https://mschristensen.com"
                  target="_blank"
                >Morten Christensen</a> & <a
                  class="underline pb-1"
                  href="https://patryksmakosz.com/"
                  target="_blank"
                >Patryk Smakosz</a>
              </slot>
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * FooterSection Component - Complete Footer with Hero CTA, Marquee, Links, and Socket
 *
 * Features:
 * - Reuses FooterHeroSection component for hero CTA (scroll-triggered animation, NO entrance animation)
 * - FooterMarquee: Infinite right-to-left multilingual scroll
 * - Links section: Email, LinkedIn, Behance with link + description layout
 * - Socket: Copyright, Cookie Policy, Special Thanks
 * - All sections have scroll-triggered animations
 * - Manual page leave animations (since component is in layout, not page)
 * - Theme-aware colors and responsive typography
 * - Follows BiographySection/RecommendationsSection grid patterns
 *
 * Structure:
 * 1. Hero CTA (HeroSection) - "Feel free to reach out..."
 * 2. Marquee (FooterMarquee) - Infinite scroll with JP/DK/EN text, bordered top only
 * 3. Links List - Contact links with descriptions, FullWidthBorder dividers
 * 4. Socket - Copyright + Cookie Policy | Special Thanks
 *
 * Layout Pattern:
 * - Mobile: Link → Description (stacked vertically)
 * - Desktop: Link (left) | Description (right) with justify-between
 * - Uses content-grid + breakout3 for consistent spacing with other sections
 *
 * Props:
 * @param {boolean} animateOnScroll - Enable scroll-triggered animations (default: true)
 *
 * Slots:
 * - heading: Hero CTA text (default: "Feel free to reach out...")
 * - button: Scroll to top button slot (user adds ScrollToTopSVG later)
 * - email: Email address link text (default: "contact@mschristensen.com")
 * - email-desc: Email description (default: "Got a project or something else?")
 * - linkedin: LinkedIn link text (default: "LinkedIn")
 * - linkedin-desc: LinkedIn description (default: "Let's connect? Also, my online resumé")
 * - behance: Behance link text (default: "Behance")
 * - behance-desc: Behance description (default: "My latest projects")
 * - copyright: Copyright text (default: "© Copyright, {year}")
 * - cookie-policy: Cookie policy link text (default: "Cookie Policy")
 * - thanks: Special thanks text (default: Patryk Smakosz collaboration)
 *
 * Pattern:
 * - Follows COMPONENT_PATTERNS.md: content-grid + breakout3, FullWidthBorder, scroll animations
 * - Similar to BiographySection and RecommendationsSection grid patterns
 * - Manual page leave animations via page:start hook (since component is in layout)
 * - ScrollTrigger recreated after page transitions for fresh DOM queries
 * - Same approach as FooterHeroSection for handling layout-level animations
 *
 * Usage:
 * <FooterSection>
 *   <template #heading>Custom CTA text</template>
 *   <template #email>hello@mydomain.com</template>
 *   <template #email-desc>Let's work together!</template>
 *   <template #linkedin>linkedin.com/in/myprofile</template>
 *   <template #linkedin-desc>Connect with me</template>
 *   <template #behance>behance.net/myportfolio</template>
 *   <template #behance-desc">View my work</template>
 * </FooterSection>
 */

import FooterMarquee from '~/components/FooterMarquee.vue'
import FullWidthBorder from '~/components/FullWidthBorder.vue'

const props = defineProps({
  /**
   * Enable scroll-triggered animation when section enters viewport
   * @type {boolean}
   */
  animateOnScroll: {
    type: Boolean,
    default: true
  }
})

const { $gsap, $ScrollTrigger } = useNuxtApp()

const linksListRef = ref(null)
const marqueeRef = ref(null)
const marqueeWrapperRef = ref(null)

let scrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null
let marqueeScrollTriggerInstance: ReturnType<typeof $ScrollTrigger.create> | null = null
let unhookPageStart: (() => void) | null = null

// Computed property for dynamic copyright year
const currentYear = computed(() => new Date().getFullYear())

/**
 * Create reusable animation function for links section
 * Animates all link items with stagger (fade + y offset)
 * Used by ScrollTrigger for scroll-linked animations
 */
const createLinksAnimation = () => {
  const tl = $gsap.timeline()

  // Animate link items (stagger fade + y offset)
  if (linksListRef.value) {
    const items = linksListRef.value.querySelectorAll('.link-item')
    if (items.length > 0) {
      tl.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08, // Stagger item reveals
          ease: 'power2.out'
        }
      )
    }
  }

  return tl
}

/**
 * Handle page leave animation
 * Simple fade out of marquee wrapper (includes border + marquee) and links when page navigation starts
 * ScrollTrigger will handle fade in when user scrolls to footer on new page
 */
const handlePageLeave = () => {
  // Fade out marquee wrapper (includes border + marquee component)
  if (marqueeWrapperRef.value) {
    $gsap.to(marqueeWrapperRef.value, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in'
    })
  }

  // Fade out links
  if (linksListRef.value) {
    const items = linksListRef.value.querySelectorAll('.link-item')
    if (items.length > 0) {
      $gsap.to(items, {
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.in'
      })
    }
  }
}

/**
 * Create marquee scroll animation
 * Animates marquee wrapper (border + marquee) from opacity: 0 to 1 when entering viewport
 */
const createMarqueeAnimation = () => {
  const tl = $gsap.timeline()

  if (marqueeWrapperRef.value) {
    tl.fromTo(
      marqueeWrapperRef.value,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }
    )
  }

  return tl
}

/**
 * Create marquee ScrollTrigger
 * Animates marquee wrapper (border + marquee) from opacity: 0 to 1 when entering viewport
 */
const createMarqueeScrollTrigger = () => {
  if (!marqueeWrapperRef.value || !$ScrollTrigger) return

  // Kill existing ScrollTrigger
  if (marqueeScrollTriggerInstance) {
    marqueeScrollTriggerInstance.kill()
    marqueeScrollTriggerInstance = null
  }

  // Clear inline styles from page leave animation
  $gsap.set(marqueeWrapperRef.value, { clearProps: 'all' })
  $gsap.set(marqueeWrapperRef.value, { opacity: 0 })

  // Create ScrollTrigger animation
  const marqueeTimeline = createMarqueeAnimation()

  marqueeScrollTriggerInstance = $ScrollTrigger.create({
    trigger: marqueeWrapperRef.value,
    start: 'top 80%',
    animation: marqueeTimeline,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true
  })
}

/**
 * Create links ScrollTrigger
 * Animates link items with stagger when entering viewport
 */
const createLinksScrollTrigger = () => {
  if (!props.animateOnScroll || !$ScrollTrigger || !linksListRef.value) return

  // Kill existing ScrollTrigger if present
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // CRITICAL: Clear inline GSAP styles from page transitions on links
  // handlePageLeave() leaves inline styles (opacity, transform)
  const items = linksListRef.value.querySelectorAll('.link-item')
  if (items.length > 0) {
    $gsap.set(items, { clearProps: 'all' })
    $gsap.set(items, { opacity: 0, y: 40 })
  }

  // Create timeline with fromTo() defining both start and end states
  const scrollTimeline = createLinksAnimation()

  // Create ScrollTrigger with animation timeline
  scrollTriggerInstance = $ScrollTrigger.create({
    trigger: linksListRef.value,
    start: 'top 80%',
    end: 'bottom top+=25%',
    animation: scrollTimeline,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true
  })
}

/**
 * Initialize all ScrollTriggers
 * Called by useScrollTriggerInit for proper page transition coordination
 */
const initScrollTriggers = () => {
  createMarqueeScrollTrigger()
  createLinksScrollTrigger()
}

/**
 * Cleanup all resources
 */
const cleanup = () => {
  unhookPageStart?.()
  unhookPageStart = null

  marqueeScrollTriggerInstance?.kill()
  marqueeScrollTriggerInstance = null

  scrollTriggerInstance?.kill()
  scrollTriggerInstance = null
}

// Setup page leave hook on mount (separate from ScrollTrigger init)
onMounted(() => {
  const nuxtApp = useNuxtApp()
  unhookPageStart = nuxtApp.hook('page:start', handlePageLeave)
})

// Use abstraction composable for page transition coordination
useScrollTriggerInit(() => initScrollTriggers(), cleanup)
</script>

<style scoped>
/**
 * Footer section container styles
 * Minimal styling - most layout handled by Tailwind classes and content-grid system
 */

.footer-section {
  /* Footer wrapper */
  position: relative;
}

/**
 * Marquee wrapper styles
 * Full-width container for marquee with top/bottom borders
 */
.marquee-wrapper.full-width-content {
  grid-column: full-width;
}

/**
 * Links list styles
 * Follows BiographySection/RecommendationsSection pattern with full-width-content
 */
.links-list {
  position: relative;
}

/**
 * Nested full-width-content handling
 * Required for .link-item to span full-width
 * Each link-item contains its own content-grid + breakout3 structure
 * Same pattern as ExperienceSection and InteractiveCaseStudySection
 */
.full-width-content > .link-item.full-width-content {
  grid-column: full-width;
}

.link-item {
  position: relative;
}

/**
 * Socket section styles
 * Flexbox layout on desktop (justify-between), stacked on mobile
 * Uses same full-width-content pattern as links
 */
.socket-section.full-width-content {
  grid-column: full-width;
}

.socket {
  /* Flexbox layout handled by Tailwind utility classes */
}
</style>
