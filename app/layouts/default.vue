<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core'

/**
 * Default Layout - ScrollSmoother Integration with Headroom + Loading System
 *
 * Integrates loading sequence management with ScrollSmoother and page transitions.
 * Ensures proper initialization order and coordinates with the ready state.
 *
 * MOBILE/TABLET BEHAVIOR (< 1024px):
 * ScrollSmoother is disabled for native scroll experience. Headroom uses window scroll events.
 */

// Page transition composable for route changes
const { leave, enter, beforeEnter, afterLeave } = usePageTransition()

// ScrollSmoother manager for smooth scrolling
const { createSmoother, killSmoother, scrollToTop, isEnabled: _isEnabled }
  = useScrollSmootherManager()

// Loading sequence manager
const { markScrollSmootherReady, markPageReady, isFirstLoad: _isFirstLoad }
  = useLoadingSequence()

// Mobile/tablet detection
const { isDesktop } = useIsMobile()

// Access Nuxt app for $headroom plugin
const nuxtApp = useNuxtApp()

// Native scroll handler for headroom on mobile/tablet
let nativeScrollHandler: (() => void) | null = null

/**
 * Setup native scroll listener for headroom on mobile/tablet
 * Uses throttled scroll events instead of ScrollSmoother.onUpdate
 */
const setupNativeScrollHeadroom = () => {
  nativeScrollHandler = useThrottleFn(() => {
    if (nuxtApp.$headroom?.updateHeader) {
      nuxtApp.$headroom.updateHeader(window.scrollY)
    }
  }, 100)

  window.addEventListener('scroll', nativeScrollHandler, { passive: true })
}

/**
 * Cleanup native scroll listener
 */
const cleanupNativeScrollHeadroom = () => {
  if (nativeScrollHandler) {
    window.removeEventListener('scroll', nativeScrollHandler)
    nativeScrollHandler = null
  }
}

onMounted(() => {
  // Wait for next tick to ensure DOM elements are ready
  nextTick(() => {
    // Verify wrapper elements exist
    const wrapper = document.getElementById('smooth-wrapper')
    const content = document.getElementById('smooth-content')

    if (!wrapper || !content) {
      console.error('⚠️ ScrollSmoother wrapper elements not found in layout')
      // Mark as ready anyway to prevent blocking
      markScrollSmootherReady()
      return
    }

    if (isDesktop.value) {
      // Desktop (>= 1024px): Create ScrollSmoother with headroom integration
      createSmoother({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1, // Optimized for consistent 60fps across all browsers (higher values can drop to 14fps on Safari)
        effects: true, // Enable data-speed and data-lag attributes
        normalizeScroll: true, // Desktop: true for smooth scroll
        ignoreMobileResize: true, // Prevents janky resizing on mobile devices

        // Headroom integration: update header visibility on scroll
        onUpdate: (self: ScrollSmoother) => {
          if (nuxtApp.$headroom?.updateHeader) {
            const currentScroll = self.scrollTop()
            nuxtApp.$headroom.updateHeader(currentScroll)
          }
        }
      })
    }
    else {
      // Mobile/Tablet (< 1024px): Use native scroll with headroom
      setupNativeScrollHeadroom()
    }

    // CRITICAL: Scroll to top after setup
    // This ensures the page starts at scrollTop 0, not at some random offset
    nextTick(() => {
      scrollToTop()
      // console.log("✅ Page scroll position reset to top");
    })

    // Mark ScrollSmoother as ready in loading sequence
    markScrollSmootherReady()
  })

  // Mark page as ready (content is mounted)
  markPageReady()
})

onUnmounted(() => {
  // Cleanup ScrollSmoother when layout is destroyed
  killSmoother()
  // Cleanup native scroll handler
  cleanupNativeScrollHeadroom()
})
</script>

<template>
  <!-- ScrollSmoother wrapper - REQUIRED for smooth scrolling -->
  <div
    id="smooth-wrapper"
    class="min-h-screen text-[var(--color-ink)]"
  >
    <!-- Loading indicator at TOP (not bottom) - bottom fixed elements interfere with Safari iOS glass effect -->
    <NuxtLoadingIndicator
      :height="6"
      color="var(--theme-text-100)"
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

    <!-- Cursor dot follows mouse and expands on hover (desktop only) -->
    <!-- Wrapped in ClientOnly to prevent hydration mismatch from touch detection -->
    <ClientOnly>
      <CursorDot />
    </ClientOnly>

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
              onAfterLeave: afterLeave
            }"
          />
        </div>
      </div>
      <FooterSection>
        <template #linkedin>
          linkedin.com/in/mortengust
        </template>
        <template #behance>
          behance.net/mschristensen
        </template>
        <template #email>
          contact@mschristensen.com
        </template>
      </FooterSection>
    </div>
  </div>
</template>

<style></style>
