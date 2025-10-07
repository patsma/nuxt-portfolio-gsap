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
        // Integrate headroom behavior via onUpdate callback
        onUpdate: (self) => {
          // Call headroom's update function if available
          if (nuxtApp.$headroom && typeof nuxtApp.$headroom.updateHeader === "function") {
            const currentScroll = self.scrollTop();
            nuxtApp.$headroom.updateHeader(currentScroll);
          }
        },
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

  // Track if hooks are already processing to prevent double execution
  let isProcessingTransition = false;

  // Hooks: kill before navigation, init after
  nuxtApp.hook("page:start", () => {
    console.log('[ScrollSmoother] page:start - killing smoother');
    setRouteChanging(true);
    isProcessingTransition = true;
    kill();
  });

  nuxtApp.hook("page:finish", () => {
    // Prevent double execution
    if (!isProcessingTransition) {
      console.log('[ScrollSmoother] page:finish skipped - not in transition');
      return;
    }

    console.log('[ScrollSmoother] page:finish - reinitializing');
    setScrollerDefaultsEarly();

    // Wait a bit longer for DOM to settle
    setTimeout(() => {
      requestAnimationFrame(() => {
        init();
        console.log('[ScrollSmoother] init complete, refreshing ScrollTrigger');
        // Refresh ScrollTrigger to recalculate page height
        try {
          ScrollTrigger.refresh(true);
        } catch (e) {
          console.error('[ScrollSmoother] refresh error:', e);
        }
        // Clear transition flag on next frame after init
        requestAnimationFrame(() => {
          setRouteChanging(false);
          isProcessingTransition = false;
          console.log('[ScrollSmoother] transition complete');
        });
      });
    }, 100); // Small delay to let page transition start
  });

  // Initialize on app mount
  nuxtApp.hook("app:mounted", () => {
    console.log('[ScrollSmoother] app:mounted - initial setup');
    requestAnimationFrame(() => {
      setScrollerDefaultsEarly();
      init();
      console.log('[ScrollSmoother] initial setup complete');
    });
  });

  // Cleanup
  nuxtApp.hook("app:beforeUnmount", () => {
    kill();
  });
});
