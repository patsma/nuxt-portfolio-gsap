/**
 * Loader Manager Client Plugin
 *
 * NUXT PATTERN: Client-side plugin for DOM manipulation after hydration
 *
 * Why this exists:
 * - Nitro plugin injects loader HTML into SSR response (server/plugins/inject-loader.ts)
 * - CSS in nuxt.config.ts styles the loader immediately
 * - This plugin runs AFTER Vue hydrates to remove loader when ready
 *
 * Architecture (Nuxt 4 Best Practices):
 * 1. Server Plugin (Nitro) → Inject HTML before response sent
 * 2. Config CSS → Style loader immediately
 * 3. Client Plugin (this file) → Remove loader after resources loaded
 * 4. Composable → Orchestrate timing and fire events
 * 5. Store → Track loading state
 *
 * Flow:
 * 1. Browser receives SSR HTML with loader already visible
 * 2. Vue hydrates → this plugin runs
 * 3. Reset scroll position to prevent offset
 * 4. Listen for 'app:ready' event from loading sequence
 * 5. Fade out loader + fade in content
 * 6. Remove loader from DOM
 */

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // CRITICAL: Reset scroll position immediately
    // Prevents ~20px offset issue caused by early scroll state
    window.scrollTo(0, 0)

    // console.log('🎨 Loader manager plugin initialized');
    // console.log('📍 Initial scroll position reset to top');

    /**
     * Remove loader with smooth fade transition
     */
    const removeLoader = () => {
      const loader = document.getElementById('app-initial-loader')
      const nuxtApp = document.getElementById('__nuxt')

      if (loader && nuxtApp) {
        // console.log('🎭 Fading out loader...');

        // Start fade out transition
        loader.classList.add('fade-out')

        // Show main content with fade in
        nuxtApp.classList.add('loaded')

        // Remove from DOM after transition completes
        setTimeout(() => {
          loader.remove()
          // console.log('✨ Loader removed from DOM');
        }, 500) // Match CSS transition duration in nuxt.config.ts
      }
    }

    /**
     * Handle app:ready event from loading sequence
     */
    const handleAppReady = () => {
      // console.log('🚀 App ready event received:', event.detail);

      // Double RAF ensures Safari has painted DOM before we manipulate it
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          removeLoader()
        })
      })
    }

    // Listen for ready event (fired after minLoadTime in useLoadingSequence)
    window.addEventListener('app:ready', handleAppReady, { once: true })

    // Safety mechanism: Force remove after 10 seconds if event never fires
    // This prevents users from being stuck with loader if something breaks
    const FALLBACK_TIMEOUT = 10000
    setTimeout(() => {
      const loader = document.getElementById('app-initial-loader')
      if (loader) {
        console.warn('⚠️ Loader fallback timeout triggered - forcing removal')
        removeLoader()
      }
    }, FALLBACK_TIMEOUT)
  }
})
