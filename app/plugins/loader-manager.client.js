/**
 * Initial Loader Manager Plugin
 *
 * Manages the removal of the loader that's injected via Nitro plugin.
 * The loader HTML and CSS are already in the SSR response, so this plugin
 * only handles hiding/removing it when ready.
 *
 * Flow:
 * 1. Nitro plugin injects loader HTML into SSR response
 * 2. CSS in head styles the loader
 * 3. Browser receives HTML with loader already visible
 * 4. Vue hydrates → this plugin runs
 * 5. Wait for loading store to signal ready
 * 6. Fade out loader and show content
 */

export default defineNuxtPlugin((nuxtApp) => {
  const loadingStore = useLoadingStore();

  if (process.client) {
    console.log('🎨 Loader manager plugin initialized');

    /**
     * Remove the loader with fade animation
     */
    const removeLoader = () => {
      const loader = document.getElementById('app-initial-loader');
      const nuxtApp = document.getElementById('__nuxt');

      if (loader && nuxtApp) {
        console.log('🎭 Fading out loader...');

        // Start fade out
        loader.classList.add('fade-out');

        // Show main content
        nuxtApp.classList.add('loaded');

        // Remove loader from DOM after transition
        setTimeout(() => {
          loader.remove();
          console.log('✨ Loader removed from DOM');
        }, 600); // Match CSS transition duration
      }
    };

    /**
     * Listen for app ready event from loading store
     */
    const handleAppReady = (event) => {
      console.log('🚀 App ready event received:', event.detail);

      // Small delay to ensure everything is painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          removeLoader();
        });
      });
    };

    // Listen for ready event
    window.addEventListener('app:ready', handleAppReady, { once: true });

    // Fallback: Force remove after 5 seconds if something goes wrong
    const fallbackTimeout = setTimeout(() => {
      console.warn('⚠️ Loader fallback timeout triggered');
      removeLoader();
    }, 5000);

    // Cleanup
    nuxtApp.hook('app:mounted', () => {
      // If store is already ready (fast load), remove immediately
      if (loadingStore.isReady) {
        console.log('ℹ️  App already ready on mount');
        clearTimeout(fallbackTimeout);
        removeLoader();
      }
    });
  }
});
