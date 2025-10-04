// ~/stores/theme.js
import { defineStore } from 'pinia';

/**
 * Theme store - centralized theme state management
 * Syncs with localStorage and HTML class for theme persistence
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
  }),

  actions: {
    /**
     * Initialize theme from localStorage or system preference
     */
    init() {
      if (process.client) {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.isDark = stored ? stored === 'dark' : prefersDark;

        // Sync with HTML class
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
