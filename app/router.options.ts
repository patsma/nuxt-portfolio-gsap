import type { RouterConfig } from "@nuxt/schema";

// Disable automatic scroll behavior - we handle scroll manually in page transitions
// This prevents the visible "jump" during transitions by letting us control
// WHEN the scroll happens (after OUT animation, before IN animation)
export default <RouterConfig>{
  scrollBehavior(_to, _from, savedPosition) {
    // Return false to prevent automatic scrolling
    // usePageTransition composable will handle scroll timing manually
    return false;
  },
};
