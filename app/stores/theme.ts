/**
 * Theme store - centralized theme state management
 * Uses Pinia hydration for SSR-safe initialization
 * Plugin handles HTML class, store only manages state
 */
import { defineStore } from 'pinia'
import type { ThemeState } from '~/types'

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    isDark: false // Default state, will be hydrated from localStorage
  }),

  /**
   * Pinia hydration method for SSR compatibility
   * Reads from localStorage during client-side hydration
   * Plugin already set HTML class, we just sync the state
   */
  hydrate(state: ThemeState): void {
    if (import.meta.client) {
      const stored = localStorage.getItem('theme')
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      state.isDark = stored ? stored === 'dark' : prefersDark

      // Debug logging
      // console.log('🍍 [Pinia Store] Theme hydrated:', state.isDark ? 'DARK' : 'LIGHT',
      //   '| localStorage:', stored || 'null',
      //   '| system prefers:', prefersDark ? 'dark' : 'light');
    }
  },

  actions: {
    /**
     * Toggle theme between light and dark
     */
    toggle(): void {
      this.isDark = !this.isDark

      if (import.meta.client) {
        // Persist to localStorage
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light')

        // Sync with HTML class
        document.documentElement.classList.toggle('theme-dark', this.isDark)

        // Debug logging
        // console.log(
        //   "🔄 [Pinia Store] Theme toggled to:",
        //   this.isDark ? "DARK" : "LIGHT",
        //   "| Saved to localStorage"
        // );
      }
    },

    /**
     * Set theme explicitly
     */
    setTheme(isDark: boolean): void {
      this.isDark = isDark

      if (import.meta.client) {
        localStorage.setItem('theme', isDark ? 'dark' : 'light')
        document.documentElement.classList.toggle('theme-dark', isDark)
      }
    }
  }
})
