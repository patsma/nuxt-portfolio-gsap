/**
 * v-page-split directive
 *
 * Marks element for SplitText animation during page transitions.
 * DOES NOT animate - just stores config for usePageTransition to read.
 *
 * Usage:
 * <h1 v-page-split:chars="{ stagger: 0.025, duration: 0.7 }">Hello</h1>
 * <p v-page-split:words>Some text</p>
 * <div v-page-split:lines="{ ease: 'back.out(1.5)' }">Lines</div>
 *
 * Arguments:
 * - chars: Split into characters
 * - words: Split into words
 * - lines: Split into lines
 */

export default {
  name: 'page-split',

  // SSR support - skip during server rendering
  getSSRProps() {
    return {}
  },

  mounted(el, binding) {
    const splitType = binding.arg || 'chars'
    const config = binding.value || {}

    // Default values based on split type
    const defaults = {
      chars: { y: 35, stagger: 0.025 },
      words: { y: 15, stagger: 0.03 },
      lines: { y: 20, stagger: 0.04 }
    }

    const typeDefaults = defaults[splitType] || defaults.chars

    // Store config on element for page transitions to read
    el._pageAnimation = {
      type: 'split',
      config: {
        splitType,
        stagger: config.stagger !== undefined ? config.stagger : typeDefaults.stagger,
        duration: config.duration || 0.6,
        ease: config.ease || 'back.out(1.5)',
        y: config.y !== undefined ? config.y : typeDefaults.y
      }
    }
  },

  unmounted(el) {
    // Clean up config
    delete el._pageAnimation
  }
}
