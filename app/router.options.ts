import type { RouterConfig } from "@nuxt/schema";

// Force every navigation to land at the very top instantly.
// This works in tandem with ScrollSmoother plugin which also
// resets scroll to 0 and re-initializes smoother after page load.
export default <RouterConfig>{
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return {
        left: savedPosition.left || 0,
        top: savedPosition.top || 0,
        behavior: "instant",
      } as any;
    }
    return { left: 0, top: 0, behavior: "instant" } as any;
  },
};
