/**
 * Font Configuration Plugin
 *
 * Applies font selections from app.config.ts to CSS variables at runtime.
 * This allows users to swap fonts by editing app.config.ts without touching CSS.
 *
 * How it works:
 * 1. nuxt.config.ts defines which fonts are AVAILABLE (downloaded/bundled)
 * 2. app.config.ts selects which fonts are USED (display/body roles)
 * 3. This plugin applies the selection to --font-display and --font-body CSS vars
 */
export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  const html = document.documentElement

  // Font fallback stacks for graceful degradation
  const serifStack = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
  const sansStack = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

  // Apply display font (headings)
  if (appConfig.fonts?.display) {
    html.style.setProperty('--font-display', `"${appConfig.fonts.display}", ${serifStack}`)
  }

  // Apply body font (paragraphs)
  if (appConfig.fonts?.body) {
    html.style.setProperty('--font-body', `"${appConfig.fonts.body}", ${sansStack}`)
    // Also update --font-sans since it references --font-body
    html.style.setProperty('--font-sans', `"${appConfig.fonts.body}", ${sansStack}`)
  }
})
