/**
 * Global Page Transition Middleware
 *
 * Uses abortNavigation + manual router push to avoid middleware loop.
 *
 * Flow:
 * 1. User clicks link → Middleware intercepts
 * 2. ABORT the navigation (blocks route change)
 * 3. Animate overlay to cover content
 * 4. Use direct router.push() (bypasses middleware)
 * 5. Vue transition hooks handle the reveal
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

  // This is a USER-initiated navigation - BLOCK IT
  console.log('[Middleware] 🚦 User navigation intercepted:', from.path, '→', to.path);

  const nuxtApp = useNuxtApp();
  const { $gsap } = nuxtApp;
  const overlay = document.querySelector('.page-transition-overlay') as HTMLElement;

  if (!overlay || !$gsap) {
    console.warn('[Middleware] ⚠️ No overlay/GSAP, allowing');
    return;
  }

  // Mark as leaving (sets flag so next middleware call knows it's us)
  store.startLeaving();

  // Get duration from CSS custom property
  const duration = parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--duration-page')
  ) / 1000 || 1;

  console.log('[Middleware] 🔒 BLOCKING user navigation, animating cover');

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
    // Use nextTick to ensure DOM is ready
    await nextTick();

    const router = useRouter();
    await router.push(to.fullPath);

    console.log('[Middleware] ✅ Route pushed programmatically');
  });

  // ABORT the original navigation
  return abortNavigation();
});
