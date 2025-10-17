/**
 * Simple resize reload plugin
 *
 * Reloads the page whenever the browser window is resized.
 * Prevents GSAP/ScrollSmoother bugs from viewport size changes.
 */
export default defineNuxtPlugin(() => {
  if (typeof window === "undefined") return;

  let resizeTimeout = null;
  let initialWidth = window.innerWidth;
  let initialHeight = window.innerHeight;

  // Handle resize with debounce
  const handleResize = () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
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
    }, 500); // Wait 500ms after user stops resizing
  };

  // Attach resize listener
  window.addEventListener("resize", handleResize, { passive: true });

  console.log(
    `✅ Resize reload active (${initialWidth}x${initialHeight})`
  );
});
