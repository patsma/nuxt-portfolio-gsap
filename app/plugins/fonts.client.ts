/**
 * Font Configuration Plugin
 *
 * Applies font CSS variables from app.config.ts to the document root.
 * Uses app:mounted hook to ensure DOM is ready and CSS has loaded.
 *
 * Single source of truth: Change fonts in app.config.ts only.
 */
export default defineNuxtPlugin({
  name: 'fonts',
  hooks: {
    'app:mounted'() {
      const appConfig = useAppConfig()
      const html = document.documentElement

      // Apply display font from app.config.ts
      if (appConfig.fonts?.display) {
        html.style.setProperty(
          '--font-display',
          `"${appConfig.fonts.display}", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif`
        )
      }

      // Apply body font from app.config.ts
      if (appConfig.fonts?.body) {
        const bodyFontStack = `"${appConfig.fonts.body}", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
        html.style.setProperty('--font-body', bodyFontStack)
        html.style.setProperty('--font-sans', bodyFontStack)
      }
    }
  }
})
