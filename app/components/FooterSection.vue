<template>
  <footer class="footer-section">
    <!-- Section 1: Hero CTA (Reusing HeroSection component) -->
    <FooterHeroSection>
      <h1 class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter">
        <span class="text-[var(--theme-text-60)]">This is a</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> scroll-triggered</em>
        <span class="text-[var(--theme-text-60)]"> hero section for</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> testing</span>
      </h1>
      <template #button>
        <ScrollDownSVG />
      </template>
    </FooterHeroSection>

    <!-- Section 2: Marquee (Multilingual "Get in touch") -->
    <FooterMarquee ref="marqueeRef" />

    <!-- Section 3: Links/Info List -->
    <section
      ref="linksListRef"
      class="content-grid w-full py-[var(--space-m)] md:py-[var(--space-l)]"
    >
      <div
        class="links-list full-width-content flex flex-col"
      >
        <!-- Link Item 1: LinkedIn -->
        <div class="link-item full-width-content">
          <FullWidthBorder :opacity="10" />
          <div
            class="link-item-content breakout3 py-[var(--space-s)] grid gap-[var(--space-xs)] grid-cols-2 lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-m)]"
          >
            <p class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
              LinkedIn
            </p>
            <a
              href="/"
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-100)] hover:opacity-80 transition-opacity duration-[var(--duration-hover)] text-right lg:text-left"
            >
              <slot name="linkedin">linkedin.com/in/username</slot>
            </a>
          </div>
        </div>

        <!-- Link Item 2: Behance -->
        <div class="link-item full-width-content">
          <FullWidthBorder :opacity="10" />
          <div
            class="link-item-content breakout3 py-[var(--space-s)] grid gap-[var(--space-xs)] grid-cols-2 lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-m)]"
          >
            <p class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
              Behance
            </p>
            <a
              href="/"
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-100)] hover:opacity-80 transition-opacity duration-[var(--duration-hover)] text-right lg:text-left"
            >
              <slot name="behance">behance.net/username</slot>
            </a>
          </div>
        </div>

        <!-- Link Item 3: Email -->
        <div class="link-item full-width-content">
          <FullWidthBorder :opacity="10" />
          <div
            class="link-item-content breakout3 py-[var(--space-s)] grid gap-[var(--space-xs)] grid-cols-2 lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-m)]"
          >
            <p class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
              Email
            </p>
            <a
              href="/"
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-100)] hover:opacity-80 transition-opacity duration-[var(--duration-hover)] text-right lg:text-left"
            >
              <slot name="email">hello@example.com</slot>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: Socket (Copyright + Cookie Policy + Special Thanks) -->
    <div class="content-grid w-full pb-[var(--space-l)] md:pb-[var(--space-xl)]">
      <div
        class="socket breakout3 pt-[var(--space-m)] grid gap-[var(--space-m)] lg:grid-cols-2 lg:items-center ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
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

        <!-- Special Thanks (right/bottom) -->
        <div class="special-thanks lg:text-right">
          <p>
            <slot name="thanks">
              Special thanks to Patryk Smakosz for the collaboration
            </slot>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
/**
 * FooterSection Component - Complete Footer with Hero CTA, Marquee, Links, and Socket
 *
 * Features:
 * - Reuses FooterHeroSection component for hero CTA (scroll-triggered animation, NO entrance animation)
 * - FooterMarquee: Infinite right-to-left multilingual scroll
 * - Links section: LinkedIn, Behance, Email with 2-column layout
 * - Socket: Copyright, Cookie Policy, Special Thanks
 * - All sections have scroll-triggered animations
 * - Manual page leave animations (since component is in layout, not page)
 * - Theme-aware colors and responsive typography
 *
 * Structure:
 * 1. Hero CTA (HeroSection) - "Feel free to reach out..."
 * 2. Marquee (FooterMarquee) - Infinite scroll with JP/DK/EN text
 * 3. Links List - Social/contact links with FullWidthBorder dividers
 * 4. Socket - Copyright + Cookie Policy | Special Thanks
 *
 * Props:
 * @param {boolean} animateOnScroll - Enable scroll-triggered animations (default: true)
 *
 * Slots:
 * - heading: Hero CTA text (default: "Feel free to reach out...")
 * - button: Scroll to top button slot (user adds ScrollToTopSVG later)
 * - linkedin: LinkedIn URL (default: placeholder)
 * - behance: Behance URL (default: placeholder)
 * - email: Email address (default: placeholder)
 * - copyright: Copyright text (default: "© Copyright, {year}")
 * - cookie-policy: Cookie policy link text (default: "Cookie Policy")
 * - thanks: Special thanks text (default: Patryk Smakosz collaboration)
 *
 * Pattern:
 * - Follows COMPONENT_PATTERNS.md: content-grid + breakout3, FullWidthBorder, scroll animations
 * - Similar to ExperienceSection and InteractiveCaseStudySection patterns
 * - Manual page leave animations via page:start hook (since component is in layout)
 * - ScrollTrigger recreated after page transitions for fresh DOM queries
 * - Same approach as FooterHeroSection for handling layout-level animations
 *
 * Usage:
 * <FooterSection>
 *   <template #heading>Custom CTA text</template>
 *   <template #linkedin>linkedin.com/in/myprofile</template>
 *   <template #behance>behance.net/myportfolio</template>
 *   <template #email>contact@mydomain.com</template>
 * </FooterSection>
 */

import HeroSection from '~/components/HeroSection.vue';
import FooterMarquee from '~/components/FooterMarquee.vue';
import FullWidthBorder from '~/components/FullWidthBorder.vue';

const props = defineProps({
  /**
   * Enable scroll-triggered animation when section enters viewport
   * @type {boolean}
   */
  animateOnScroll: {
    type: Boolean,
    default: true,
  },
});

const { $gsap, $ScrollTrigger } = useNuxtApp();
const loadingStore = useLoadingStore();
const pageTransitionStore = usePageTransitionStore();

const linksListRef = ref(null);
const marqueeRef = ref(null);

let scrollTriggerInstance = null;
let marqueeScrollTriggerInstance = null;
let unhookPageStart = null;

// Computed property for dynamic copyright year
const currentYear = computed(() => new Date().getFullYear());

/**
 * Create reusable animation function for links section
 * Animates all link items with stagger (fade + y offset)
 * Used by ScrollTrigger for scroll-linked animations
 */
const createLinksAnimation = () => {
  const tl = $gsap.timeline();

  // Animate link items (stagger fade + y offset)
  if (linksListRef.value) {
    const items = linksListRef.value.querySelectorAll('.link-item');
    if (items.length > 0) {
      tl.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08, // Stagger item reveals
          ease: 'power2.out',
        }
      );
    }
  }

  return tl;
};

/**
 * Handle page leave animation
 * Simple fade out of marquee and links when page navigation starts
 * ScrollTrigger will handle fade in when user scrolls to footer on new page
 */
const handlePageLeave = () => {
  // Fade out marquee
  if (marqueeRef.value && marqueeRef.value.$el) {
    $gsap.to(marqueeRef.value.$el, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    });
  }

  // Fade out links
  if (linksListRef.value) {
    const items = linksListRef.value.querySelectorAll('.link-item');
    if (items.length > 0) {
      $gsap.to(items, {
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.in',
      });
    }
  }
};

/**
 * Create marquee scroll animation
 * Animates marquee from opacity: 0 to 1 when entering viewport
 */
const createMarqueeAnimation = () => {
  const tl = $gsap.timeline();

  if (marqueeRef.value && marqueeRef.value.$el) {
    tl.fromTo(
      marqueeRef.value.$el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }
    );
  }

  return tl;
};

onMounted(() => {
  // Hook into page:start to trigger leave animation
  const nuxtApp = useNuxtApp();
  unhookPageStart = nuxtApp.hook('page:start', handlePageLeave);

  // MARQUEE ScrollTrigger: Fade in when entering viewport
  if (marqueeRef.value && marqueeRef.value.$el && $ScrollTrigger) {
    const createMarqueeScrollTrigger = () => {
      // Kill existing ScrollTrigger
      if (marqueeScrollTriggerInstance) {
        marqueeScrollTriggerInstance.kill();
        marqueeScrollTriggerInstance = null;
      }

      // Clear inline styles from page leave animation
      $gsap.set(marqueeRef.value.$el, { clearProps: 'all' });
      $gsap.set(marqueeRef.value.$el, { opacity: 0 });

      // Create ScrollTrigger animation
      const marqueeTimeline = createMarqueeAnimation();

      marqueeScrollTriggerInstance = $ScrollTrigger.create({
        trigger: marqueeRef.value.$el,
        start: 'top 80%',
        animation: marqueeTimeline,
        toggleActions: 'play pause resume reverse',
        invalidateOnRefresh: true,
      });
    };

    // Coordinate with page transitions (same pattern as links)
    if (loadingStore.isFirstLoad) {
      nextTick(() => {
        createMarqueeScrollTrigger();
      });
    } else {
      const unwatch = watch(
        () => pageTransitionStore.isTransitioning,
        (isTransitioning) => {
          if (!isTransitioning) {
            nextTick(() => {
              createMarqueeScrollTrigger();
            });
            unwatch();
          }
        },
        { immediate: true }
      );
    }
  }

  // SCROLL MODE: Animate links section when scrolling into view (default)
  // Timeline is linked to ScrollTrigger for smooth forward/reverse playback
  // Pattern: Kill and recreate ScrollTrigger after page transitions for fresh DOM queries
  if (props.animateOnScroll && $ScrollTrigger && linksListRef.value) {
    // Create/recreate ScrollTrigger with fresh element queries
    const createScrollTrigger = () => {
      // Kill existing ScrollTrigger if present
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
        scrollTriggerInstance = null;
      }

      // CRITICAL: Clear inline GSAP styles from page transitions on links
      // handlePageLeave() leaves inline styles (opacity, transform)
      // Clear them, then explicitly set initial hidden state before ScrollTrigger takes over
      if (linksListRef.value) {
        const items = linksListRef.value.querySelectorAll('.link-item');
        if (items.length > 0) {
          $gsap.set(items, { clearProps: 'all' });
          $gsap.set(items, { opacity: 0, y: 40 });
        }
      }

      // Create timeline with fromTo() defining both start and end states
      // Initial state already set above, timeline will animate based on scroll position
      const scrollTimeline = createLinksAnimation();

      // Create ScrollTrigger with animation timeline
      scrollTriggerInstance = $ScrollTrigger.create({
        trigger: linksListRef.value,
        start: 'top 80%', // Animate when section is 80% down viewport
        end: 'bottom top+=25%', // Complete animation when bottom reaches top
        animation: scrollTimeline, // Link timeline to scroll position
        toggleActions: 'play pause resume reverse',
        invalidateOnRefresh: true, // Recalculate on window resize/refresh
      });
    };

    // Coordinate with page transition system
    // First load: Create immediately after mount
    // Navigation: Recreate after page transition completes
    if (loadingStore.isFirstLoad) {
      nextTick(() => {
        createScrollTrigger();
      });
    } else {
      // After page navigation, wait for page transition to complete
      // Watch pageTransitionStore.isTransitioning for proper timing
      const unwatch = watch(
        () => pageTransitionStore.isTransitioning,
        (isTransitioning) => {
          // When transition completes (isTransitioning becomes false), recreate ScrollTrigger
          if (!isTransitioning) {
            nextTick(() => {
              createScrollTrigger();
            });
            unwatch(); // Stop watching
          }
        },
        { immediate: true }
      );
    }
  }
});

// Cleanup ScrollTriggers and hooks on unmount
onUnmounted(() => {
  // Unhook page:start listener
  if (unhookPageStart) {
    unhookPageStart();
    unhookPageStart = null;
  }

  // Kill marquee ScrollTrigger
  if (marqueeScrollTriggerInstance) {
    marqueeScrollTriggerInstance.kill();
    marqueeScrollTriggerInstance = null;
  }

  // Kill links ScrollTrigger
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
});
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
 * Links list styles
 * Follows ExperienceSection pattern with full-width-content nested grid
 */
.links-list {
  position: relative;
}

/**
 * Nested full-width-content grid handling
 * Required for .link-item to span full-width and inherit parent grid
 * Same pattern as ExperienceSection and InteractiveCaseStudySection
 */
.full-width-content > .link-item.full-width-content {
  grid-column: full-width;
  display: grid;
  grid-template-columns: inherit;
}

.link-item {
  position: relative;
}

/**
 * Socket styles
 * Simple 2-column layout on desktop, stacked on mobile
 */
.socket {
  /* Grid layout handled by Tailwind utility classes */
}
</style>
