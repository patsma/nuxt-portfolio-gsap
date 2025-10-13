/**
 * Nitro Plugin: Inject Initial Loader into SSR HTML
 *
 * This plugin hooks into the SSR rendering process and injects
 * the loader HTML directly into the response BEFORE it's sent to the browser.
 *
 * This ensures the loader is visible immediately, before Vue hydrates.
 */

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Inject loader HTML at the start of body
    html.bodyAppend.unshift(`
      <div id="app-initial-loader">
        <div class="app-loader-spinner"></div>
      </div>
    `);

    console.log('🎨 [Nitro] Loader HTML injected into SSR response');
  });
});
