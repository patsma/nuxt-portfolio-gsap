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
 * @see https://nitro.unjs.io/guide/plugins
 * @see https://nuxt.com/docs/guide/going-further/hooks#nitro-app-hooks
 */

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    // Inject blocking script BEFORE loader to detect theme instantly
    // This prevents FOUC by setting theme class before loader renders
    html.bodyAppend.unshift(`
      <script>
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

          // Debug logging (can be removed in production)
          console.log('🎨 [Blocking Script] Theme detected:', isDark ? 'DARK' : 'LIGHT',
            '| localStorage:', stored || 'null',
            '| system prefers:', prefersDark ? 'dark' : 'light');
        })();
      </script>
      <div id="app-initial-loader">
        <div class="app-loader-spinner"></div>
      </div>
    `);

    console.log('🎨 [Nitro] Theme detection script + Loader HTML injected into SSR response');
  });
});
