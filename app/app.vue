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
 */

// Debug logging
if (import.meta.client) {
  console.log('[PageTransition] System initialized - Phase 1');
}
</script>

<style>
/**
 * Phase 1: Gentle Page Transitions via #smooth-content
 *
 * CRITICAL: We animate #smooth-content, not <NuxtPage />, because ScrollSmoother
 * applies transforms to #smooth-content which breaks standard page transitions.
 *
 * How it works:
 * 1. page:start → html.route-changing added → CSS fade out starts (800ms)
 * 2. After 400ms (halfway), ScrollSmoother killed (jump hidden by fading opacity)
 * 3. DOM swap happens (new page content)
 * 4. page:finish → ScrollSmoother reinit → html.route-changing removed
 * 5. CSS fade in starts (800ms) → transition complete
 *
 * Why just opacity:
 * - No blur/scale/transform to avoid conflicts with ScrollSmoother
 * - Simple, performant, reliable
 *
 * Duration: 800ms
 */

#smooth-content {
  transition: opacity 800ms var(--ease-power2);
  opacity: 1;
}

/**
 * Route changing state - managed by scrollsmoother.client.js
 */
html.route-changing #smooth-content {
  opacity: 0;
}
</style>
