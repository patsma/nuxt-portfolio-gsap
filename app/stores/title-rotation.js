/**
 * Pinia store for managing animated title rotation
 * Cycles through professional titles with GSAP character animations
 */
import { defineStore } from 'pinia';

export const useTitleRotationStore = defineStore('titleRotation', {
  state: () => ({
    /**
     * Array of professional titles to cycle through
     * @type {string[]}
     */
    textArray: [
      'UX/UI Designer',
      'Digital Designer',
      'Art Director',
      'Mentor',
      'Visual Designer',
      'Portfolio'
    ],

    /**
     * Current index in the textArray
     * @type {number}
     */
    currentIndex: 0,
  }),

  getters: {
    /**
     * Get the current title text
     * @param {Object} state - Store state
     * @returns {string} Current title text
     */
    currentText: (state) => state.textArray[state.currentIndex]
  },

  actions: {
    /**
     * Advance to the next title in the rotation
     * Loops back to start when reaching the end
     */
    updateText() {
      this.currentIndex = (this.currentIndex + 1) % this.textArray.length;
    }
  }
});
