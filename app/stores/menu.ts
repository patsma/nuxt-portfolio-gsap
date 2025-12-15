/**
 * Pinia store to manage the hamburger menu open/close state
 * We keep it minimal and framework-friendly for Nuxt 4
 */
import { defineStore } from 'pinia'
import type { MenuState } from '~/types'

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    isOpen: false
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
    }
  }
})
