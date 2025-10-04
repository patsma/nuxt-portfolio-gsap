/**
 * SSR-Safe Theme Initialization Plugin
 *
 * Runs BEFORE Vue hydration to prevent FOUC (Flash of Unstyled Content)
 * - Reads theme preference from localStorage
 * - Sets 'theme-dark' class on <html> immediately
 * - Nuxt plugin ensures this runs at the earliest possible moment
 */
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Read theme from localStorage or system preference
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;

    // Set HTML class IMMEDIATELY before hydration
    // This prevents the flash of wrong theme colors
    document.documentElement.classList.toggle('theme-dark', isDark);
  }
});
