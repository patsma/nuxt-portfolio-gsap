/**
 * Pinia store for managing animated title rotation
 * Cycles through professional titles with GSAP character animations
 */
import { defineStore } from 'pinia'
import type { TitleRotationState } from '~/types'

export const useTitleRotationStore = defineStore('titleRotation', {
  state: (): TitleRotationState => ({
    textArray: [
      'UX/UI Designer',
      'Digital Designer',
      'Art Director',
      'Mentor',
      'Visual Designer',
      'Portfolio'
    ],
    currentIndex: 0
  }),

  getters: {
    /**
     * Get the current title text
     */
    currentText(): string {
      return this.textArray[this.currentIndex]
    }
  },

  actions: {
    /**
     * Advance to the next title in the rotation
     * Loops back to start when reaching the end
     */
    updateText(): void {
      this.currentIndex = (this.currentIndex + 1) % this.textArray.length
    }
  }
})
