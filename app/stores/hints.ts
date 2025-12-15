/**
 * Pinia store for managing user interface hints and tooltips
 * Tracks which hints have been shown to avoid over-stimulating users
 */
import { defineStore } from 'pinia'

export const useHintsStore = defineStore('hints', () => {
  // Track which hints have been shown to the user
  const shownHints = ref<Set<string>>(new Set())

  /**
   * Check if a specific hint has been shown
   */
  const hasShown = (hintKey: string): boolean => {
    return shownHints.value.has(hintKey)
  }

  /**
   * Mark a hint as shown
   */
  const markAsShown = (hintKey: string): void => {
    shownHints.value.add(hintKey)
    // Persist to localStorage to survive page reloads
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('ui-hints') || '[]') as string[]
        if (!stored.includes(hintKey)) {
          stored.push(hintKey)
          localStorage.setItem('ui-hints', JSON.stringify(stored))
        }
      }
      catch {
        // Silently fail if localStorage is unavailable
      }
    }
  }

  /**
   * Load persisted hints from localStorage
   */
  const loadPersistedHints = (): void => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('ui-hints') || '[]') as string[]
        shownHints.value = new Set(stored)
      }
      catch {
        // Silently fail if localStorage is unavailable
        shownHints.value = new Set()
      }
    }
  }

  /**
   * Reset all hints (useful for testing or user preference)
   */
  const resetHints = (): void => {
    shownHints.value.clear()
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ui-hints')
      }
      catch {
        // Silently fail
      }
    }
  }

  return {
    hasShown,
    markAsShown,
    loadPersistedHints,
    resetHints
  }
})
