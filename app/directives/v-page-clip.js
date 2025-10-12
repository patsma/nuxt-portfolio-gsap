/**
 * v-page-clip directive
 *
 * Marks element for clip-path animation during page transitions.
 * DOES NOT animate - just stores config for usePageTransition to read.
 *
 * Usage:
 * <div v-page-clip>Reveal from top (default)</div>
 * <div v-page-clip:top>Reveal from top</div>
 * <div v-page-clip:bottom="{ duration: 0.8 }">Reveal from bottom</div>
 * <div v-page-clip:left>Reveal from left</div>
 * <div v-page-clip:right="{ ease: 'power3.out' }">Reveal from right</div>
 *
 * Arguments:
 * - (none) or 'top': Reveal from top (default)
 * - bottom: Reveal from bottom
 * - left: Reveal from left
 * - right: Reveal from right
 */

export default {
  name: 'page-clip',

  // SSR support - skip during server rendering
  getSSRProps() {
    return {}
  },

  mounted(el, binding) {
    const direction = binding.arg || 'top'
    const config = binding.value || {}

    // Store config on element for page transitions to read
    el._pageAnimation = {
      type: 'clip',
      config: {
        direction,
        duration: config.duration || 0.6,
        ease: config.ease || 'power2.out'
      }
    }
  },

  unmounted(el) {
    // Clean up config
    delete el._pageAnimation
  }
}
