// ~/stores/theme.js
import { defineStore } from 'pinia';

/**
 * Get initial theme state from localStorage or system preference
 * Must run synchronously during store creation
 */
function getInitialTheme() {
  if (process.client) {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return stored ? stored === 'dark' : prefersDark;
  }
  return false;
}

/**
 * Theme store - centralized theme state management
 * Syncs with localStorage and HTML class for theme persistence
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: getInitialTheme(), // Initialize from localStorage immediately
  }),

  actions: {
    /**
     * Initialize theme - sync HTML class with current state
     * Called after store is created to apply initial theme
     */
    init() {
      if (process.client) {
        // State is already set from getInitialTheme()
        // Just sync the HTML class
        document.documentElement.classList.toggle('theme-dark', this.isDark);
      }
    },

    /**
     * Toggle theme between light and dark
     */
    toggle() {
      this.isDark = !this.isDark;

      if (process.client) {
        // Persist to localStorage
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');

        // Sync with HTML class
        document.documentElement.classList.toggle('theme-dark', this.isDark);
      }
    },

    /**
     * Set theme explicitly
     * @param {boolean} isDark - Whether to set dark theme
     */
    setTheme(isDark) {
      this.isDark = isDark;

      if (process.client) {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('theme-dark', isDark);
      }
    }
  }
});
