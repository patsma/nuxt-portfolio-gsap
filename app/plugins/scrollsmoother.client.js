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

  /**
   * Page Transition Coordination - SIMPLIFIED
   *
   * PROBLEM: Nuxt hooks don't wait for async/await - page:finish fires immediately
   * SOLUTION: Simple synchronous approach with careful timing
   *
   * Flow:
   * 1. page:start → Add route-changing immediately → Start fade (CSS) → Kill smoother after 400ms
   * 2. page:finish → Wait for DOM → Init smoother → Remove route-changing → Fade in (CSS)
   */

  let isTransitioning = false;
  let killTimeout = null;

  nuxtApp.hook("page:start", () => {
    console.log('[ScrollSmoother] page:start');

    // Prevent double execution
    if (isTransitioning) {
      console.warn('[ScrollSmoother] Already transitioning, clearing previous');
      if (killTimeout) clearTimeout(killTimeout);
    }

    isTransitioning = true;

    // Add route-changing class immediately → triggers CSS fade out
    document.documentElement.classList.add('route-changing');
    console.log('[ScrollSmoother] Fade out started');

    // Kill smoother after fade is halfway through (400ms of 800ms)
    // This gives time for fade to visually start, hiding the jump
    killTimeout = setTimeout(() => {
      kill();
      console.log('[ScrollSmoother] Smoother killed (during fade)');
    }, 400);
  });

  nuxtApp.hook("page:finish", () => {
    console.log('[ScrollSmoother] page:finish');

    if (!isTransitioning) {
      console.warn('[ScrollSmoother] page:finish but not transitioning');
      return;
    }

    // Clear kill timeout if it hasn't fired
    if (killTimeout) {
      clearTimeout(killTimeout);
      killTimeout = null;
    }

    // Set up scroller defaults
    setScrollerDefaultsEarly();

    // Wait a bit for DOM to settle, then init
    setTimeout(() => {
      requestAnimationFrame(() => {
        // Initialize ScrollSmoother with new page content
        init();
        console.log('[ScrollSmoother] Init complete');

        // Refresh ScrollTrigger to recalculate page height
        try {
          ScrollTrigger.refresh(true);
        } catch (e) {
          console.error('[ScrollSmoother] Refresh error:', e);
        }

        // Remove route-changing on next frame → triggers CSS fade in
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('route-changing');
          isTransitioning = false;
          console.log('[ScrollSmoother] Fade in started, transition complete');
        });
      });
    }, 100);
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
    if (killTimeout) clearTimeout(killTimeout);
    kill();
  });
});
