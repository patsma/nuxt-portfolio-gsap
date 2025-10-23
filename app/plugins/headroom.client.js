// Headroom-like behavior for header
// Inspired by headroom.js - hides header on scroll down, shows on scroll up
// Integrated with ScrollSmoother via onUpdate callback
export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return;

  // Headroom configuration
  const AT_TOP_THRESHOLD = 10; // px to be considered "at top" (triggers full header)
  const SCROLL_THRESHOLD = 100; // px before hiding header on scroll down
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

    // Three-state system:
    // 1. headroom--top: At viewport top (full height, transparent)
    // 2. headroom--not-top: Scrolled but visible (compact, backdrop blur)
    // 3. headroom--unpinned: Hidden (scrolled down past threshold)

    // STATE 1: At the very top of the page
    if (currentScroll <= AT_TOP_THRESHOLD) {
      headerElement.classList.add("headroom--top");
      headerElement.classList.remove("headroom--not-top", "headroom--unpinned");
      lastScrollTop = currentScroll;
      return;
    }

    // STATE 2 & 3: Past the "at top" threshold
    // Only apply hide/show behavior after scrolling past scroll threshold
    if (currentScroll > SCROLL_THRESHOLD) {
      if (scrollDirection === 1) {
        // Scrolling down - hide header (STATE 3)
        headerElement.classList.remove("headroom--top", "headroom--not-top");
        headerElement.classList.add("headroom--unpinned");
      } else if (scrollDirection === -1) {
        // Scrolling up - show compact header (STATE 2)
        headerElement.classList.remove("headroom--top", "headroom--unpinned");
        headerElement.classList.add("headroom--not-top");
      }
    } else {
      // Between AT_TOP_THRESHOLD and SCROLL_THRESHOLD - show compact header (STATE 2)
      headerElement.classList.remove("headroom--top", "headroom--unpinned");
      headerElement.classList.add("headroom--not-top");
    }

    lastScrollTop = currentScroll;
  };

  /**
   * Reset headroom state (show header at top)
   */
  const reset = () => {
    lastScrollTop = 0;
    lastUpdateTime = 0;
    headerElement = document.querySelector(".header-grid");
    if (headerElement) {
      headerElement.classList.add("headroom--top");
      headerElement.classList.remove("headroom--not-top", "headroom--unpinned");
    }
  };

  /**
   * Pause headroom updates (used during page transitions)
   * Smoothly animates header to top state, then locks it in place
   */
  const pause = () => {
    // Stop scroll updates immediately
    isPaused = true;

    if (!headerElement) {
      headerElement = document.querySelector(".header-grid");
    }

    if (headerElement) {
      // Smoothly animate header to top state with transitions enabled
      // This prevents visual jumps when navigating with header hidden
      headerElement.classList.remove("headroom--unpinned", "headroom--not-top");
      headerElement.classList.add("headroom--top");

      // Read transition duration from CSS variable (same as hover animations)
      const durationRaw = getComputedStyle(document.documentElement)
        .getPropertyValue("--duration-hover")
        .trim();

      let duration = 300; // Default fallback (ms)
      if (durationRaw.endsWith("ms")) {
        duration = parseFloat(durationRaw);
      } else if (durationRaw.endsWith("s")) {
        duration = parseFloat(durationRaw) * 1000;
      }

      // After animation completes, disable transitions for scroll reset
      setTimeout(() => {
        if (headerElement) {
          headerElement.classList.add("headroom--no-transition");
          // Force browser reflow to apply no-transition immediately
          void headerElement.offsetHeight;
        }
      }, duration);
    }
    // console.log("[Headroom] Paused - header animating to top state");
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
