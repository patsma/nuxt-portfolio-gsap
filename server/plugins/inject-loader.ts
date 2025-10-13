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
    // Inject loader HTML into body
    // bodyAppend.unshift() puts it at the START of body (before #__nuxt)
    html.bodyAppend.unshift(`
      <div id="app-initial-loader">
        <div class="app-loader-spinner"></div>
      </div>
    `);

    console.log('🎨 [Nitro] Loader HTML injected into SSR response');
  });
});
