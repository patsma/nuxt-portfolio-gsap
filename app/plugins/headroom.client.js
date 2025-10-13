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
  let isPaused = false; // Pause during page transitions to prevent flicker

  /**
   * Update header visibility based on scroll position and direction
   * Called by ScrollSmoother's onUpdate callback
   * @param {number} currentScroll - Current scroll position
   */
  const updateHeader = (currentScroll) => {
    // Skip updates when paused (during page transitions)
    if (isPaused) return;

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

  /**
   * Pause headroom updates (used during page transitions)
   * Pins header and stops reacting to scroll changes
   */
  const pause = () => {
    isPaused = true;
    // Ensure header is pinned during transitions
    if (!headerElement) {
      headerElement = document.querySelector(".header-grid");
    }
    if (headerElement) {
      // Disable CSS transitions FIRST to prevent animated slide
      headerElement.classList.add("headroom--no-transition");
      // Force browser reflow to apply no-transition immediately
      void headerElement.offsetHeight;
      // Now change state instantly (no animation)
      headerElement.classList.add("headroom--pinned");
      headerElement.classList.remove("headroom--unpinned");
    }
    // console.log("[Headroom] Paused - header pinned (no animation)");
  };

  /**
   * Resume headroom updates after page transitions
   */
  const resume = () => {
    isPaused = false;
    // Reset tracking state so headroom starts fresh
    lastScrollTop = 0;
    lastUpdateTime = 0;
    // Re-enable CSS transitions for smooth animations
    if (headerElement) {
      headerElement.classList.remove("headroom--no-transition");
    }
    // console.log("[Headroom] Resumed - transitions restored");
  };

  // Expose controller for ScrollSmoother plugin to call
  nuxtApp.provide("headroom", {
    updateHeader,
    reset,
    pause,
    resume,
  });

  // Pause headroom at start of page transition
  nuxtApp.hook("page:start", () => {
    // console.log("[Headroom] page:start - pausing headroom");
    pause();
  });

  // NOTE: Resume is now called from usePageTransition.js enter() onComplete
  // This ensures headroom only resumes after visual transition is fully done

  // Initialize on app mount
  nuxtApp.hook("app:mounted", () => {
    // console.log("[Headroom] Ready for ScrollSmoother integration");
    reset();
  });
});
