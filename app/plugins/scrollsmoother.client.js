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
  nuxtApp.hook("page:start", () => {
    setRouteChanging(true);
    kill();
  });

  nuxtApp.hook("page:finish", () => {
    setScrollerDefaultsEarly();
    requestAnimationFrame(() => {
      init();
      // Clear transition flag on next frame after init so CSS fades in
      requestAnimationFrame(() => setRouteChanging(false));
    });
  });

  // Initialize on app mount
  nuxtApp.hook("app:mounted", () => {
    requestAnimationFrame(() => {
      setScrollerDefaultsEarly();
      init();
    });
  });

  // Cleanup
  nuxtApp.hook("app:beforeUnmount", () => {
    kill();
  });
});
