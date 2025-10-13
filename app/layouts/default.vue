<script setup>
/**
 * Default Layout - ScrollSmoother Integration (Simplified)
 *
 * Matches reference implementation structure for reliable page transitions.
 * ScrollSmoother is managed simply: create on mount, kill on unmount.
 */

// Page transition composable for route changes
const { leave, enter, beforeEnter, afterLeave } = usePageTransition()

// ScrollSmoother manager for smooth scrolling
const { createSmoother, killSmoother } = useScrollSmootherManager()

onMounted(() => {
  // Wait for next tick to ensure DOM elements are ready
  nextTick(() => {
    // Verify wrapper elements exist
    const wrapper = document.getElementById('smooth-wrapper')
    const content = document.getElementById('smooth-content')

    if (!wrapper || !content) {
      console.error('⚠️ ScrollSmoother wrapper elements not found in layout')
      return
    }

    // Create ScrollSmoother instance using composable
    createSmoother({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 2,
      effects: true // Enable data-speed and data-lag attributes
    })
  })
})

onUnmounted(() => {
  // Cleanup ScrollSmoother when layout is destroyed
  killSmoother()
})
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
</template>

<style>
/* Layout wrapper for page content */
.layout-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
  padding-top: calc(var(--size-header) + 2rem);
}

/* Page content wrapper */
.page-content {
  width: 100%;
}
</style>
