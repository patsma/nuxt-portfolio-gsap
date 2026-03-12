/**
 * Nitro Plugin: Inject Initial Loader into SSR HTML
 *
 * NUXT PATTERN: Nitro plugin for SSR HTML manipulation
 *
 * Why this is needed:
 * - In SSR mode, we need loader visible BEFORE Vue loads
 * - Nitro's 'render:html' hook is the ONLY way to inject HTML into SSR response
 * - This runs on the server, modifying HTML before it's sent to browser
 *
 * Alternative approaches that DON'T work:
 * - app.html → Ignored in dev mode, only works in production
 * - spa-loading-template.html → Only works when ssr: false
 * - Client plugin → Runs too late (after Vue hydrates)
 *
 * This is the correct Nuxt 4 approach for SSR apps.
 *
 * Progress bar strategy:
 * - Theme detection + PerformanceObserver are injected into <head> via unshift()
 *   so they run BEFORE any assets start loading — this allows the observer to
 *   catch each /_nuxt/ asset completing in real-time, not in a buffered batch
 * - Loader HTML is injected into bodyPrepend so it appears as early as possible
 *
 * @see https://nitro.unjs.io/guide/plugins
 * @see https://nuxt.com/docs/guide/going-further/hooks#nitro-app-hooks
 */

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    // Extract /_nuxt/ asset URLs from the rendered head (JS chunks + CSS files)
    // Nuxt/Vite injects these as <link rel="modulepreload"> and <script> tags
    const headContent = (html.head || []).join('')
    const assetMatches = headContent.match(/\/_nuxt\/[^"'\s]+/g) || []
    const nuxtAssets = JSON.stringify([...new Set(assetMatches)])

    // Inject theme detection + observer into <head> as the FIRST element (via unshift)
    // This runs BEFORE any asset tags, so the observer registers before assets start loading
    // Then each asset fires the observer in real-time as it completes — true incremental progress
    html.head.unshift(`
      <script>
        window.__NUXT_ASSETS__ = ${nuxtAssets};
        (function() {
          // Check localStorage for manual theme toggle (priority)
          var stored = localStorage.getItem('theme');
          // Check system preference as fallback
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          // Determine theme: manual toggle > system preference
          var isDark = stored ? stored === 'dark' : prefersDark;

          // Set OR remove theme class IMMEDIATELY before loader appears
          // Using toggle() ensures class is added if dark, removed if light
          document.documentElement.classList.toggle('theme-dark', isDark);

          // Set --loader-bg CSS variable so the loader background is theme-aware
          // without depending on any external CSS file loading first
          document.documentElement.style.setProperty('--loader-bg', isDark ? '#090925' : '#fffaf5');

          // Add is-first-load class to enable entrance animation hiding
          // This class will be removed after entrance animations complete
          // It scopes CSS hiding to first load only (subsequent navigations won't hide elements)
          document.documentElement.classList.add('is-first-load');
        })();
        ;(function() {
          // True progress tracking: registers BEFORE assets load (script is first in <head>)
          // Each /_nuxt/ asset completes → observer fires → progress increments in real-time
          // No buffered:true needed — we're early enough to catch everything live
          var assets = window.__NUXT_ASSETS__ || [];
          var total = assets.length;
          if (!total) return; // No assets found — bar stays hidden, timer-based removal takes over
          var loaded = 0;
          var root = document.documentElement;
          function setProgress(v) {
            root.style.setProperty('--loader-progress', v);
          }
          try {
            var observer = new PerformanceObserver(function(list) {
              list.getEntries().forEach(function(entry) {
                var path = entry.name.replace(location.origin, '');
                if (assets.indexOf(path) !== -1) {
                  loaded = Math.min(loaded + 1, total);
                  // Cap at 0.12 — assets are just downloads, not app initialization.
                  // The remaining 88% tracks real Vue/GSAP/font milestones via
                  // loader-manager.client.ts and useLoadingSequence.ts
                  setProgress((loaded / total) * 0.12);
                  if (loaded >= total) observer.disconnect();
                }
              });
            });
            observer.observe({ type: 'resource' });
          } catch (e) {
            // PerformanceObserver not supported — bar stays at 0, timer-based removal still works
          }
        })();
      </script>
    `)

    // Inject loader HTML early in body so it appears before Vue's content.
    // Inline styles are used so the loader renders immediately on first byte
    // without waiting for any external CSS file to download and parse.
    // --loader-bg is set by the theme IIFE above, falling back to light theme color.
    html.bodyPrepend.push(`
      <div id="app-initial-loader" style="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:var(--loader-bg,#fffaf5);transition:opacity 0.5s ease-out;">
        <div id="loader-bar"></div>
        <div class="app-loader-gradient"></div>
      </div>
    `)

    // Convert render-blocking CSS links to non-blocking preload+swap pattern.
    // This allows the browser to render the body (and the loader above) immediately
    // without waiting for all CSS files to download and parse first.
    // Once each CSS file loads, the onload handler swaps it back to rel="stylesheet".
    // The loader covers the full viewport (z-index: 99999) so there's no FOUC —
    // by the time the loader fades out (300ms+), all CSS has long since applied.
    html.head = html.head.map(fragment =>
      fragment.replace(
        /<link rel="stylesheet"([^>]+)>/g,
        (_match, attrs) => {
          return [
            `<link rel="preload" as="style"${attrs} onload="this.onload=null;this.rel='stylesheet'">`,
            `<noscript><link rel="stylesheet"${attrs}></noscript>`
          ].join('')
        }
      )
    )

    // console.log(
    //   "🎨 [Nitro] Theme detection script + Loader HTML injected into SSR response"
    // );
  })
})
