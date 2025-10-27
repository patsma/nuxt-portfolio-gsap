/**
 * Simple resize reload plugin
 *
 * Reloads the page whenever the browser window is resized.
 * Prevents GSAP/ScrollSmoother bugs from viewport size changes.
 * Uses VueUse useDebounceFn for proper debounce implementation.
 */
export default defineNuxtPlugin(() => {
  if (typeof window === "undefined") return;

  let initialWidth = window.innerWidth;
  let initialHeight = window.innerHeight;

  /**
   * Check and reload if window size changed
   */
  const checkAndReload = () => {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    // Check if size actually changed (not just a scroll event)
    if (currentWidth !== initialWidth || currentHeight !== initialHeight) {
      console.log(
        `📐 Window resized: ${initialWidth}x${initialHeight} → ${currentWidth}x${currentHeight}. Reloading...`
      );

      // Use Nuxt's built-in reload function with loop protection
      reloadNuxtApp({
        ttl: 1000, // Prevent reload loops (ignore requests within 1 second)
        persistState: false, // Don't save state - we want a fresh start
      });
    }
  };

  // Create debounced resize handler using VueUse
  // Wait 500ms after user stops resizing before checking/reloading
  const handleResize = useDebounceFn(checkAndReload, 500);

  // Attach resize listener
  window.addEventListener("resize", handleResize, { passive: true });

  console.log(
    `✅ Resize reload active (${initialWidth}x${initialHeight})`
  );
});
