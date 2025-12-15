<template>
  <section
    ref="sectionRef"
    class="content-grid w-full min-h-[100dvh] grid items-center"
  >
    <div class="breakout3 translate-y-[var(--space-xl)]">
      <div ref="contentRef">
        <slot />
      </div>

      <div class="flex flex-col md:flex-row md:items-center gap-[var(--space-s)]">
        <div ref="servicesSlotRef">
          <slot name="services" />
        </div>
        <div ref="buttonSlotRef" class="md:ml-auto">
          <slot name="button" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * FooterHeroSection - Scroll-triggered hero with SplitText animation
 *
 * Key difference from HeroSection:
 * - HeroSection: Entrance animation on first load only
 * - FooterHeroSection: ScrollTrigger animation every time user scrolls to it
 *
 * Pattern follows BiographySection for proper page transition coordination
 */

const props = defineProps({
  animateOnScroll: {
    type: Boolean,
    default: true,
  },
});

const { $gsap, $SplitText, $ScrollTrigger } = useNuxtApp();
const loadingStore = useLoadingStore();
const pageTransitionStore = usePageTransitionStore();

const sectionRef = ref(null);
const contentRef = ref(null);
const servicesSlotRef = ref(null);
const buttonSlotRef = ref(null);
const splitInstance = ref(null);

let scrollTriggerInstance = null;

/**
 * Create animation - EXACT same animation as HeroSection
 * Uses fromTo() to explicitly define start and end states
 */
const createSectionAnimation = () => {
  const tl = $gsap.timeline();
  const textElement = contentRef.value?.querySelector("h1");

  if (!textElement || !$SplitText) {
    // Fallback: simple fade
    if (contentRef.value) {
      tl.fromTo(
        contentRef.value,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    }
    return tl;
  }

  // Lock height before SplitText to prevent layout shift
  const originalHeight = textElement.offsetHeight;
  $gsap.set(textElement, { height: originalHeight });

  // Create SplitText with masking
  const split = $SplitText.create(textElement, {
    type: "lines",
    mask: "lines",
  });
  splitInstance.value = split;

  // Animate lines with fromTo (defines both start and end states)
  tl.fromTo(
    split.lines,
    {
      yPercent: 100,
      rotate: 20,
      transformOrigin: "0% 0%",
    },
    {
      yPercent: 0,
      rotate: 0,
      duration: 1,
      stagger: 0.08,
      ease: "back.out(1.2)",
    }
  );

  // Services animation (if slot is filled)
  if (servicesSlotRef.value && servicesSlotRef.value.children.length > 0) {
    const tags = servicesSlotRef.value.querySelectorAll(".tag, .tag-label");
    if (tags.length > 0) {
      tl.fromTo(
        Array.from(tags),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        },
        "<+0.3"
      );
    }
  }

  // Button animation (if slot is filled)
  if (buttonSlotRef.value && buttonSlotRef.value.children.length > 0) {
    const button = buttonSlotRef.value.querySelector(".scroll-down, button, a");
    if (button) {
      tl.fromTo(
        button,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.5)",
        },
        "<+0.2"
      );
    }
  }

  return tl;
};

// Store hook cleanup function
let unhookPageStart = null;

onMounted(() => {
  // Listen for page transitions to animate OUT with existing SplitText
  const nuxtApp = useNuxtApp();
  const handlePageLeave = () => {
    // If we have an active SplitText instance, animate it OUT
    // EXACT same animation as page transition with animateFrom: 'below'
    if (splitInstance.value && splitInstance.value.lines) {
      $gsap.to(splitInstance.value.lines, {
        yPercent: -100,          // Slide up (opposite of entry which is 100)
        rotate: 20,              // Positive rotation (matching page transition)
        transformOrigin: "100% 0%", // Bottom-right origin for OUT
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.in",
      });
    }

    // Animate button OUT if exists
    if (buttonSlotRef.value) {
      const button = buttonSlotRef.value.querySelector(".scroll-down, button, a");
      if (button) {
        $gsap.to(button, {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: "power2.in",
        });
      }
    }
  };

  // Hook into page:start to trigger leave animation
  unhookPageStart = nuxtApp.hook('page:start', handlePageLeave);

  // EXACT pattern from BiographySection
  if (props.animateOnScroll && $ScrollTrigger && sectionRef.value) {
    const createScrollTrigger = async () => {
      // CRITICAL: Wait for fonts to load before creating SplitText
      if (document.fonts) {
        await document.fonts.ready;
      }
      // Kill existing ScrollTrigger
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
        scrollTriggerInstance = null;
      }

      // Revert existing SplitText to restore original HTML
      if (splitInstance.value) {
        splitInstance.value.revert?.();
        splitInstance.value = null;
      }

      // CRITICAL: Clear ALL inline GSAP styles from page transitions
      // Page transition directives (v-page-split, v-page-fade) leave inline styles
      // We must clear them before creating new animations

      // Clear section wrapper (v-page-fade on component sets styles here)
      if (sectionRef.value) {
        $gsap.set(sectionRef.value, { clearProps: "all" });
      }

      // Clear content wrapper
      if (contentRef.value) {
        $gsap.set(contentRef.value, { clearProps: "all" });
      }

      // Clear h1
      const textElement = contentRef.value?.querySelector("h1");
      if (textElement) {
        $gsap.set(textElement, { clearProps: "all" });
      }

      // Clear services
      if (servicesSlotRef.value) {
        const tags = servicesSlotRef.value.querySelectorAll(".tag, .tag-label");
        if (tags.length > 0) {
          $gsap.set(Array.from(tags), { clearProps: "all" });
        }
      }

      // Clear button
      if (buttonSlotRef.value) {
        const button = buttonSlotRef.value.querySelector(".scroll-down, button, a");
        if (button) {
          $gsap.set(button, { clearProps: "all" });
        }
      }

      // Create timeline (will create fresh SplitText inside)
      const scrollTimeline = createSectionAnimation();

      // Create ScrollTrigger
      scrollTriggerInstance = $ScrollTrigger.create({
        trigger: sectionRef.value,
        start: "top 80%",
        animation: scrollTimeline,
        toggleActions: "play pause resume reverse",
        invalidateOnRefresh: true,
      });
    };

    // Coordinate with page transition system
    if (loadingStore.isFirstLoad) {
      nextTick(() => {
        createScrollTrigger();
      });
    } else {
      // After page navigation, wait for transition to complete
      const unwatch = watch(
        () => pageTransitionStore.isTransitioning,
        (isTransitioning) => {
          if (!isTransitioning) {
            nextTick(() => {
              createScrollTrigger();
            });
            unwatch();
          }
        },
        { immediate: true }
      );
    }
  }
});

// Cleanup
onUnmounted(() => {
  // Unhook page:start listener
  if (unhookPageStart) {
    unhookPageStart();
    unhookPageStart = null;
  }

  // Kill ScrollTrigger
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }

  // Revert SplitText
  if (splitInstance.value) {
    splitInstance.value.revert?.();
    splitInstance.value = null;
  }
});
</script>
