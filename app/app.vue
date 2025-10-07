<template>
  <!-- Fluid gradient background (z-0, behind everything) -->
  <FluidGradient />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Smooth cursor trail effect (z-50, on top) -->
  <CursorTrail />
</template>

<script setup>
/**
 * Phase 1: Simple CSS-based page transitions
 * - Animates #smooth-content (not NuxtPage) to avoid ScrollSmoother conflicts
 * - Uses route-changing class for coordination
 * - Gentle opacity fade only (800ms)
 * - Will evolve to GSAP-powered transitions in Phase 3
 * - See: .claude/PAGE_TRANSITION_SYSTEM.md for full roadmap
 */

// Debug logging for transition lifecycle
if (import.meta.client) {
  console.log('[PageTransition] System initialized - Phase 1 (smooth-content fade)');
}
</script>

<style>
/**
 * Phase 1: Gentle Page Transitions via #smooth-content
 *
 * CRITICAL FIX: We don't animate <NuxtPage /> because it's inside #smooth-content
 * which has transforms applied by ScrollSmoother. Instead, we animate the container.
 *
 * How it works:
 * 1. page:start → html.route-changing added → #smooth-content fades out (800ms)
 * 2. ScrollSmoother killed after fade starts
 * 3. DOM swap happens (new page content)
 * 4. page:finish → ScrollSmoother reinit → #smooth-content fades in (800ms)
 * 5. html.route-changing removed after fade complete
 *
 * Why just opacity:
 * - No blur/scale/transform to avoid conflicts with ScrollSmoother
 * - Simple, elegant, performant
 * - Works reliably with transformed containers
 *
 * Duration: 800ms (visible but not too slow)
 */

#smooth-content {
  /* Enable smooth opacity transitions */
  transition: opacity 800ms var(--ease-power2);
  opacity: 1;
}

/**
 * Route changing state - fades out content during transition
 * Applied to HTML element by scrollsmoother.client.js
 */
html.route-changing #smooth-content {
  opacity: 0;
}

/**
 * Browser DevTools: Watch for these console logs during navigation
 *
 * [PageTransition] System initialized - Phase 1 (smooth-content fade)
 * [ScrollSmoother] page:start - killing smoother
 * [Headroom] page:start - resetting state
 * [ScrollSmoother] page:finish - reinitializing
 * [ScrollSmoother] init complete, refreshing ScrollTrigger
 * [ScrollSmoother] transition complete
 */
</style>
