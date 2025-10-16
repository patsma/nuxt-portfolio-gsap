<script setup>
/**
 * Default Layout - ScrollSmoother Integration with Headroom + Loading System
 *
 * Integrates loading sequence management with ScrollSmoother and page transitions.
 * Ensures proper initialization order and coordinates with the ready state.
 */

// Page transition composable for route changes
const { leave, enter, beforeEnter, afterLeave } = usePageTransition();

// ScrollSmoother manager for smooth scrolling
const { createSmoother, killSmoother, scrollToTop } =
  useScrollSmootherManager();

// Loading sequence manager
const { markScrollSmootherReady, markPageReady, isFirstLoad } =
  useLoadingSequence();

// Access Nuxt app for $headroom plugin
const nuxtApp = useNuxtApp();

onMounted(() => {
  // Wait for next tick to ensure DOM elements are ready
  nextTick(() => {
    // Verify wrapper elements exist
    const wrapper = document.getElementById("smooth-wrapper");
    const content = document.getElementById("smooth-content");

    if (!wrapper || !content) {
      console.error("⚠️ ScrollSmoother wrapper elements not found in layout");
      // Mark as ready anyway to prevent blocking
      markScrollSmootherReady();
      return;
    }

    // Create ScrollSmoother instance with headroom integration
    createSmoother({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1, // Optimized for consistent 60fps across all browsers (higher values can drop to 14fps on Safari)
      effects: true, // Enable data-speed and data-lag attributes
      normalizeScroll: true, // Significantly improves Safari performance and touch behavior
      ignoreMobileResize: true, // Prevents janky resizing on mobile devices

      // Headroom integration: update header visibility on scroll
      onUpdate: (self) => {
        if (nuxtApp.$headroom?.updateHeader) {
          const currentScroll = self.scrollTop();
          nuxtApp.$headroom.updateHeader(currentScroll);
        }
      },
    });

    // CRITICAL: Scroll to top after creating ScrollSmoother
    // This ensures the page starts at scrollTop 0, not at some random offset
    nextTick(() => {
      scrollToTop();
      // console.log("✅ Page scroll position reset to top");
    });

    // Mark ScrollSmoother as ready in loading sequence
    markScrollSmootherReady();
  });

  // Mark page as ready (content is mounted)
  markPageReady();
});

onUnmounted(() => {
  // Cleanup ScrollSmoother when layout is destroyed
  killSmoother();
});
</script>

<template>
  <!-- ScrollSmoother wrapper - REQUIRED for smooth scrolling -->
  <div id="smooth-wrapper" class="min-h-screen text-[var(--color-ink)]">
    <NuxtLoadingIndicator
      :height="6"
      color="#0089d0"
      style="top: auto; bottom: 0"
    />

    <!-- Accessible skip link: appears on focus to bypass repetitive content -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded"
    >
      Skip to main content
    </a>

    <!-- Header positioned outside smooth-content for proper fixed positioning -->
    <HeaderGrid />

    <!-- ScrollSmoother content wrapper -->
    <div id="smooth-content">
      <div class="layout-wrapper">
        <!-- Page content - transitions on route change with GSAP -->
        <div class="pt-[var(--size-header)]">
          <NuxtPage
            :transition="{
              name: 'page',
              mode: 'out-in',
              onBeforeEnter: beforeEnter,
              onEnter: enter,
              onLeave: leave,
              onAfterLeave: afterLeave,
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
