/**
 * Global Page Transition Middleware
 *
 * Uses locking + abortNavigation + manual router push to prevent rapid clicks.
 *
 * Flow:
 * 1. User clicks link → Middleware intercepts
 * 2. Try to LOCK the transition (prevents duplicate clicks)
 * 3. If locked, ABORT this navigation
 * 4. Animate overlay to cover content
 * 5. Use direct router.push() (bypasses middleware)
 * 6. Vue transition hooks handle the reveal
 *
 * Uses proper async patterns with nextTick() instead of timeouts
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server
  if (import.meta.server) return;

  // Skip on initial load
  if (!from || !from.path) return;

  // Skip if same route
  if (to.path === from.path) return;

  const store = usePageTransitionStore();

  // Check if this navigation was triggered by US (the direct router push)
  // If so, allow it through
  if (store.isTransitioning && store.state === 'leaving') {
    console.log('[Middleware] ✅ Allowing programmatic navigation');
    return; // Let it through
  }

  // Try to acquire lock - if already locked, REJECT this navigation
  if (!store.lock(to.path)) {
    console.warn('[Middleware] 🚫 BLOCKED - transition already in progress');
    return abortNavigation(); // Block rapid clicks
  }

  // This is a USER-initiated navigation - BLOCK IT and animate
  console.log('[Middleware] 🚦 User navigation intercepted:', from.path, '→', to.path);

  const nuxtApp = useNuxtApp();
  const { $gsap } = nuxtApp;
  const overlay = document.querySelector('.page-transition-overlay') as HTMLElement;

  if (!overlay || !$gsap) {
    console.warn('[Middleware] ⚠️ No overlay/GSAP, allowing');
    store.reset(); // Release lock
    return;
  }

  // Mark as leaving (can only be called after lock)
  if (!store.startLeaving()) {
    console.error('[Middleware] ❌ Failed to start leaving - resetting');
    store.reset();
    return abortNavigation();
  }

  // Get duration from CSS custom property
  const duration = parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--duration-page')
  ) / 1000 || 1;

  console.log('[Middleware] 🔒 BLOCKING user navigation, animating cover');

  // Safety timeout - auto-unlock if something goes wrong
  const safetyTimeout = setTimeout(() => {
    console.error('[Middleware] ⚠️ Safety timeout - resetting store');
    store.reset();
  }, (duration + 2) * 1000); // Extra 2 seconds buffer

  // Create a promise that resolves when animation completes
  const animationComplete = new Promise<void>((resolve) => {
    $gsap.timeline({
      onComplete: () => {
        console.log('[Middleware] ✅ Cover animation complete');
        resolve();
      }
    })
      .set(overlay, {
        opacity: 1,
        pointerEvents: 'auto'
      })
      .to(overlay, {
        clipPath: 'circle(150% at 50% 100%)',
        duration,
        ease: 'sine.out'
      });
  });

  // Wait for animation to complete, then navigate
  animationComplete.then(async () => {
    // Clear safety timeout - animation completed successfully
    clearTimeout(safetyTimeout);

    // Use nextTick to ensure DOM is ready
    await nextTick();

    const router = useRouter();
    await router.push(to.fullPath);

    console.log('[Middleware] ✅ Route pushed programmatically');
  }).catch((error) => {
    // Handle animation errors
    console.error('[Middleware] ❌ Animation error:', error);
    clearTimeout(safetyTimeout);
    store.reset();
  });

  // ABORT the original navigation
  return abortNavigation();
});
