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
 *
 * Page Transition Flow:
 * 1. Page leaves → Kill ScrollSmoother (prevents conflicts)
 * 2. afterLeave → Cleanup GSAP properties
 * 3. New page enters → Animations run
 * 4. After enter completes → Reinitialize ScrollSmoother (picks up new effects)
 */

const route = useRoute()
const nuxtApp = useNuxtApp()

// ScrollSmoother instance reference
let ctx
let smoother

/**
 * Initialize ScrollSmoother
 */
const initSmoother = () => {
  if (typeof window === 'undefined') return

  const { $gsap, $ScrollSmoother, $ScrollTrigger } = nuxtApp

  if (!$gsap || !$ScrollSmoother) {
    console.warn('⚠️ GSAP or ScrollSmoother not available')
    return
  }

  // Verify wrapper elements exist
  const wrapper = document.getElementById('smooth-wrapper')
  const content = document.getElementById('smooth-content')

  if (!wrapper || !content) {
    console.error('⚠️ ScrollSmoother wrapper elements not found')
    return
  }

  // Kill existing instance before creating new one
  killSmoother()

  // Create ScrollSmoother with explicit selectors
  ctx = $gsap.context(() => {
    smoother = $ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 2,
      effects: true,
      smoothTouch: 0.2,
      normalizeScroll: true
    })
    console.log('✅ ScrollSmoother created')
  })

  // Refresh ScrollTrigger to recalculate after initialization
  if ($ScrollTrigger) {
    $ScrollTrigger.refresh()
  }
}

/**
 * Kill ScrollSmoother
 */
const killSmoother = () => {
  if (smoother) {
    smoother.kill()
    smoother = null
  }
  if (ctx) {
    ctx.revert()
    ctx = null
  }
}

// Page transition hooks from usePageTransition composable
const { leave, enter, beforeEnter, afterLeave } = usePageTransition()

/**
 * Custom leave handler - kills ScrollSmoother before page animations
 */
const handleLeave = (el, done) => {
  console.log('🔄 Page leaving - killing ScrollSmoother')
  killSmoother()
  // Run page transition animations
  leave(el, done)
}

/**
 * Custom after leave handler - cleanup
 */
const handleAfterLeave = (el) => {
  console.log('🧹 After leave cleanup')
  afterLeave(el)
}

/**
 * Custom enter handler - runs animations
 */
const handleEnter = (el, done) => {
  console.log('🎬 Page entering')
  // Run page transition animations
  enter(el, () => {
    // After animations complete, reinitialize ScrollSmoother
    nextTick(() => {
      console.log('🔄 Reinitializing ScrollSmoother after page enter')
      initSmoother()
      done()
    })
  })
}

// Initialize on mount
onMounted(() => {
  nextTick(() => {
    initSmoother()
  })
})

// Cleanup on unmount
onUnmounted(() => {
  killSmoother()
  console.log('🗑️ ScrollSmoother destroyed')
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
            onEnter: handleEnter,
            onLeave: handleLeave,
            onAfterLeave: handleAfterLeave,
          }"
        />
      </main>

      <footer role="contentinfo" class="sr-only">
        <p class="sr-only">© TastySites</p>
      </footer>
    </div>
  </div>
</template>
