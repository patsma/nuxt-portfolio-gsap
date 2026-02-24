/**
 * Font Configuration Plugin
 *
 * NOTE: This plugin is currently disabled because Nuxt client plugins
 * were not executing reliably. Fonts are now set directly in theme.scss.
 *
 * To change fonts:
 * 1. Update app.config.ts fonts.display and fonts.body (for @nuxt/fonts loading)
 * 2. Update app/assets/css/tokens/theme.scss --font-display and --font-body values
 */
export default defineNuxtPlugin(() => {
  // Font configuration moved to theme.scss for reliability
  // See theme.scss @theme block for --font-display and --font-body
})
