// Pinia store to manage the hamburger menu open/close state
// We keep it minimal and framework-friendly for Nuxt 4
import { defineStore } from "pinia";

/**
 * @typedef {Object} MenuState
 * @property {boolean} isOpen - Whether the menu overlay is open
 */

export const useMenuStore = defineStore("menu", {
  state: () => /** @type {MenuState} */ ({ isOpen: false }),
  actions: {
    open() {
      if (this.isOpen) return;
      this.isOpen = true;
    },
    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
    },
    toggle() {
      this.isOpen = !this.isOpen;
    },
  },
});
