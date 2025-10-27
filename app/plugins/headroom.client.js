// Headroom-like behavior for header
// Inspired by headroom.js - hides header on scroll down, shows on scroll up
// Integrated with ScrollSmoother via onUpdate callback
export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return;

  // Headroom configuration
  const AT_TOP_THRESHOLD = 10; // px to be considered "at top" (triggers full header)
  const SCROLL_THRESHOLD = 100; // px before hiding header on scroll down
  const THROTTLE_DELAY = 100; // ms between updates (using VueUse throttle)

  // State tracking
  let lastScrollTop = 0;
  let headerElement = null;
  let isPaused = false; // Pause during page transitions to prevent flicker

  /**
   * Core header update logic (without throttle)
   * @param {number} currentScroll - Current scroll position
   */
  const updateHeaderCore = (currentScroll) => {
    // Skip updates when paused (during page transitions)
    if (isPaused) return;

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
   * Throttled update header function (using VueUse)
   * Limits updates to once per THROTTLE_DELAY for performance
   */
  const updateHeader = useThrottleFn(updateHeaderCore, THROTTLE_DELAY);

  /**
   * Reset headroom state (show header at top)
   * Called in afterLeave when content is hidden - uses instant state change (no animation)
   */
  const reset = () => {
    lastScrollTop = 0;
    headerElement = document.querySelector(".header-grid");
    if (headerElement) {
      // Disable transitions for instant state change
      headerElement.classList.add("headroom--no-transition");
      // Force browser reflow to apply no-transition immediately
      void headerElement.offsetHeight;
      // Now change state instantly (no animation)
      headerElement.classList.add("headroom--top");
      headerElement.classList.remove("headroom--not-top", "headroom--unpinned");
    }
  };

  /**
   * Pause headroom updates (used during page transitions)
   * Freezes header in current state - no animation, no class changes
   * This prevents visual jumps when user clicks a navigation link
   */
  const pause = () => {
    // Stop scroll updates immediately
    // Header stays frozen in current visual state (unpinned/not-top/top)
    isPaused = true;
    // console.log("[Headroom] Paused - header frozen in current state");
  };

  /**
   * Resume headroom updates after page transitions
   * Smoothly animates header to top state with slow, dramatic transition
   */
  const resume = () => {
    isPaused = false;
    // Reset tracking state so headroom starts fresh
    lastScrollTop = 0;

    if (!headerElement) {
      headerElement = document.querySelector(".header-grid");
    }

    if (headerElement) {
      // Remove no-transition class and add smooth-transition for slow animation
      headerElement.classList.remove("headroom--no-transition");
      headerElement.classList.add("headroom--smooth-transition");

      // Smoothly animate to top state (800ms duration from --duration-slow)
      // This animates from whatever state it was frozen in (unpinned/not-top/top)
      headerElement.classList.add("headroom--top");
      headerElement.classList.remove("headroom--not-top", "headroom--unpinned");

      // Remove smooth-transition class after animation completes
      // This restores normal fast transitions (300ms) for scroll behavior
      setTimeout(() => {
        if (headerElement) {
          headerElement.classList.remove("headroom--smooth-transition");
        }
      }, 800); // Match --duration-slow
    }
    // console.log("[Headroom] Resumed - smoothly animating to top state (800ms)");
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
