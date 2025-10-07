// Headroom-like behavior for header
// Inspired by headroom.js - hides header on scroll down, shows on scroll up
// Integrated with ScrollSmoother via onUpdate callback
export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return;

  // Headroom configuration
  const SCROLL_THRESHOLD = 100; // px before hiding header
  const THROTTLE_DELAY = 100; // ms between updates

  // State tracking
  let lastScrollTop = 0;
  let lastUpdateTime = 0;
  let headerElement = null;

  /**
   * Update header visibility based on scroll position and direction
   * Called by ScrollSmoother's onUpdate callback
   * @param {number} currentScroll - Current scroll position
   */
  const updateHeader = (currentScroll) => {
    // Throttle updates for performance
    const now = Date.now();
    if (now - lastUpdateTime < THROTTLE_DELAY) return;
    lastUpdateTime = now;

    // Ensure we have header reference
    if (!headerElement) {
      headerElement = document.querySelector(".header-grid");
      if (!headerElement) return;
    }

    // Calculate scroll direction
    const scrollDirection = currentScroll > lastScrollTop ? 1 : -1; // 1 = down, -1 = up

    // At the very top of the page, always show header
    if (currentScroll <= 0) {
      headerElement.classList.add("headroom--pinned");
      headerElement.classList.remove("headroom--unpinned");
      lastScrollTop = currentScroll;
      return;
    }

    // Only apply headroom behavior after scrolling past threshold
    if (currentScroll > SCROLL_THRESHOLD) {
      if (scrollDirection === 1) {
        // Scrolling down - hide header
        headerElement.classList.remove("headroom--pinned");
        headerElement.classList.add("headroom--unpinned");
      } else if (scrollDirection === -1) {
        // Scrolling up - show header
        headerElement.classList.add("headroom--pinned");
        headerElement.classList.remove("headroom--unpinned");
      }
    } else {
      // Below threshold - always show header
      headerElement.classList.add("headroom--pinned");
      headerElement.classList.remove("headroom--unpinned");
    }

    lastScrollTop = currentScroll;
  };

  /**
   * Reset headroom state (show header)
   */
  const reset = () => {
    lastScrollTop = 0;
    lastUpdateTime = 0;
    headerElement = document.querySelector(".header-grid");
    if (headerElement) {
      headerElement.classList.add("headroom--pinned");
      headerElement.classList.remove("headroom--unpinned");
    }
  };

  // Expose controller for ScrollSmoother plugin to call
  nuxtApp.provide("headroom", {
    updateHeader,
    reset,
  });

  // Reset on page transitions
  nuxtApp.hook("page:start", () => {
    console.log("[Headroom] page:start - resetting state");
    reset();
  });

  // Initialize on app mount
  nuxtApp.hook("app:mounted", () => {
    console.log("[Headroom] Ready for ScrollSmoother integration");
    reset();
  });
});
