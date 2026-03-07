/**
 * Pinia store to manage the hamburger menu open/close state
 * Includes animation coordination for synchronized page transitions
 */
import { defineStore } from 'pinia'
import type { MenuState } from '~/types'

// Promise resolver stored outside state (not serializable)
let closeResolver: (() => void) | null = null

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    isOpen: false,
    isClosing: false
  }),

  actions: {
    open(): void {
      if (this.isOpen) return
      this.isOpen = true
    },

    close(): void {
      if (!this.isOpen) return
      this.isOpen = false
    },

    toggle(): void {
      this.isOpen = !this.isOpen
    },

    /**
     * Close menu with animation coordination
     * Returns a Promise that resolves when the close animation completes
     * Used by mobile nav links to wait for menu close before navigation
     */
    closeWithAnimation(): Promise<void> {
      if (!this.isOpen) return Promise.resolve()

      this.isClosing = true
      this.isOpen = false

      return new Promise((resolve) => {
        closeResolver = resolve
      })
    },

    /**
     * Called when menu close animation completes
     * Resolves the Promise from closeWithAnimation()
     */
    notifyAnimationComplete(): void {
      this.isClosing = false
      if (closeResolver) {
        closeResolver()
        closeResolver = null
      }
    }
  }
})
