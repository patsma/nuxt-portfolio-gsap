// Simple ScrollSmoother that actually works
export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return;

  const { $gsap } = nuxtApp;
  if (!$gsap) return;

  let ScrollTrigger, ScrollSmoother;
  try {
    ScrollTrigger = $gsap.core.globals().ScrollTrigger;
    ScrollSmoother = $gsap.core.globals().ScrollSmoother;
  } catch (e) {
    return;
  }

  if (!ScrollTrigger || !ScrollSmoother) return;

  let instance = null;

  const setRouteChanging = (isChanging) => {
    try {
      const el = document.documentElement;
      if (!el) return;
      if (isChanging) el.classList.add("route-changing");
      else el.classList.remove("route-changing");
    } catch (e) {}
  };

  const setScrollerDefaultsEarly = () => {
    try {
      const content = document.getElementById("smooth-content");
      if (!content) return;
      ScrollTrigger.scrollerProxy(content, {
        scrollTop(value) {
          const inst = ScrollSmoother.get();
          if (!inst) return window.scrollY || 0;
          if (arguments.length) inst.scrollTop(value);
          return inst.scrollTop();
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        // Force transform pinning to avoid iOS Safari fixed-position glitches
        pinType: "transform",
      });
      ScrollTrigger.defaults({ scroller: content });
    } catch (e) {}
  };

  const kill = () => {
    try {
      const existing = ScrollSmoother.get();
      if (existing) existing.kill();
      instance = null;
    } catch (e) {}
    try {
      const content = document.getElementById("smooth-content");
      if (content) content.style.removeProperty("transform");
    } catch (e) {}
  };

  const init = () => {
    // Defensive cleanup
    kill();

    const wrapper = document.getElementById("smooth-wrapper");
    const content = document.getElementById("smooth-content");
    if (!wrapper || !content) return;

    setScrollerDefaultsEarly();

    try {
      instance = ScrollSmoother.create({
        wrapper,
        content,
        smooth: 0.8,
        effects: true,
        smoothTouch: 0.2,
        normalizeScroll: true,
        ignoreMobileResize: true,
      });
      try {
        instance.scrollTop(0, false);
      } catch (_) {}
    } catch (e) {
      instance = null;
      return;
    }

    // Finalize defaults/proxy and refresh measurements
    setScrollerDefaultsEarly();
    try {
      ScrollTrigger.refresh();
    } catch (_) {}
    try {
      requestAnimationFrame(() => {
        try {
          ScrollTrigger.refresh();
        } catch (_) {}
      });
    } catch (_) {}
    try {
      if (document && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          try {
            ScrollTrigger.refresh();
          } catch (_) {}
        });
      }
    } catch (_) {}
  };

  const refresh = () => {
    try {
      ScrollTrigger.refresh();
    } catch (_) {}
  };

  // Expose controller for middleware or components
  nuxtApp.provide("smoother", {
    get: () => instance,
    init,
    kill,
    refresh,
    setDefaults: setScrollerDefaultsEarly,
  });

  // Hooks: kill before navigation, init after
  // Coordinate with page transition store using proper async patterns
  nuxtApp.hook("page:start", async () => {
    setRouteChanging(true);

    // Get transition store to coordinate
    const transitionStore = usePageTransitionStore?.();

    // Mark ScrollSmoother as not ready immediately
    if (transitionStore) {
      transitionStore.setScrollSmootherReady(false);
    }

    // Use nextTick instead of setTimeout for better coordination
    // Wait for overlay to start covering before killing ScrollSmoother
    await nextTick();
    await nextTick(); // Double nextTick ensures overlay animation has started

    kill();
    console.log('[ScrollSmoother] Killed on page:start (after nextTick)');
  });

  nuxtApp.hook("page:finish", async () => {
    setScrollerDefaultsEarly();

    // Get transition store to coordinate
    const transitionStore = usePageTransitionStore?.();

    // Wait for next frame before initializing
    await new Promise(resolve => requestAnimationFrame(resolve));

    init();

    // Mark ScrollSmoother as ready after init
    if (transitionStore) {
      transitionStore.setScrollSmootherReady(true);
    }

    console.log('[ScrollSmoother] Initialized on page:finish');

    // Clear transition flag on next frame after init so CSS fades in
    await new Promise(resolve => requestAnimationFrame(resolve));
    setRouteChanging(false);
  });

  // Initialize on app mount
  nuxtApp.hook("app:mounted", async () => {
    const transitionStore = usePageTransitionStore?.();

    // Wait for next frame using Promise instead of callback
    await new Promise(resolve => requestAnimationFrame(resolve));

    setScrollerDefaultsEarly();
    init();

    // Mark as ready on initial mount
    if (transitionStore) {
      transitionStore.setScrollSmootherReady(true);
    }

    console.log('[ScrollSmoother] Initialized on app:mounted');
  });

  // Cleanup
  nuxtApp.hook("app:beforeUnmount", () => {
    kill();
  });
});
