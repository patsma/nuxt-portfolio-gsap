<script setup>
/**
 * Default Layout - ScrollSmoother Integration
 *
 * Manages ScrollSmoother lifecycle and page transitions.
 * ScrollSmoother is initialized in layout (not plugin) for better control.
 *
 * Structure:
 * - Header is OUTSIDE smooth-content (per ScrollSmoother docs for fixed positioning)
 * - Page content inside #smooth-content with NuxtPage transition hooks
 */

const route = useRoute()

// Page transition hooks from usePageTransition composable
const { leave, enter, beforeEnter, afterLeave } = usePageTransition()

// ScrollSmoother setup - centralized in layout
let ctx
let smoother

onMounted(() => {
  // Wait for next tick to ensure DOM elements are ready
  nextTick(() => {
    const { $gsap, $ScrollSmoother } = useNuxtApp()

    if ($gsap && $ScrollSmoother) {
      // Verify wrapper elements exist
      const wrapper = document.getElementById('smooth-wrapper')
      const content = document.getElementById('smooth-content')

      if (!wrapper || !content) {
        console.error('⚠️ ScrollSmoother wrapper elements not found in layout')
        return
      }

      // Create ScrollSmoother with explicit selectors
      ctx = $gsap.context(() => {
        smoother = $ScrollSmoother.create({
          wrapper: '#smooth-wrapper',
          content: '#smooth-content',
          smooth: 2,
          effects: true
        })
        console.log('✅ ScrollSmoother created in default layout')
      })
    } else {
      console.warn('⚠️ GSAP or ScrollSmoother not available')
    }
  })
})

onUnmounted(() => {
  // Cleanup ScrollSmoother when layout is destroyed
  ctx && ctx.revert()
  console.log('🗑️ ScrollSmoother killed in default layout')
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
    <header role="banner" aria-label="Site header">
      <HeaderGrid />
    </header>

    <!-- ScrollSmoother content wrapper -->
    <div id="smooth-content">
      <!-- Page content - transitions on route change with GSAP -->
      <main id="main-content" class="header-safe-top" role="main" tabindex="-1">
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
      </main>

      <footer role="contentinfo" class="sr-only">
        <p class="sr-only">© TastySites</p>
      </footer>
    </div>
  </div>
</template>
