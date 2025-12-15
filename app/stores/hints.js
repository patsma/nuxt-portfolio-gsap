/**
 * Pinia store for managing user interface hints and tooltips
 * Tracks which hints have been shown to avoid over-stimulating users
 */
import { defineStore } from 'pinia'

export const useHintsStore = defineStore('hints', () => {
  // Track which hints have been shown to the user
  const shownHints = ref(new Set())

  /**
   * Check if a specific hint has been shown
   * @param {string} hintKey - Unique identifier for the hint
   * @returns {boolean}
   */
  const hasShown = (hintKey) => {
    return shownHints.value.has(hintKey)
  }

  /**
   * Mark a hint as shown
   * @param {string} hintKey - Unique identifier for the hint
   */
  const markAsShown = (hintKey) => {
    shownHints.value.add(hintKey)
    // Persist to localStorage to survive page reloads
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('ui-hints') || '[]')
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
  const loadPersistedHints = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('ui-hints') || '[]')
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
  const resetHints = () => {
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
