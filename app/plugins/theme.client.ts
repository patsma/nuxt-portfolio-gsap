/**
 * SSR-Safe Theme Initialization Plugin
 *
 * Runs BEFORE Vue hydration to prevent FOUC (Flash of Unstyled Content)
 * - Reads theme preference from localStorage
 * - Confirms 'theme-dark' class on <html> is correct
 * - Nuxt plugin ensures this runs at the earliest possible moment
 *
 * NOTE: Blocking script in Nitro plugin already set the class,
 * this plugin confirms it's still correct before Vue hydrates
 */
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Read theme from localStorage or system preference
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;

    // Confirm HTML class is correct (blocking script should have already set it)
    // Using toggle() ensures class is added if dark, removed if light
    document.documentElement.classList.toggle('theme-dark', isDark);

    // Debug logging
    console.log('🎨 [Nuxt Plugin] Theme confirmed:', isDark ? 'DARK' : 'LIGHT',
      '| HTML class:', document.documentElement.classList.contains('theme-dark') ? 'theme-dark' : 'none');
  }
});
