/**
 * v-page-fade directive
 *
 * Marks element for fade animation during page transitions.
 * DOES NOT animate - just stores config for usePageTransition to read.
 *
 * Usage:
 * <div v-page-fade>Fade in</div>
 * <div v-page-fade:up="{ distance: 30 }">Fade up</div>
 * <div v-page-fade:down>Fade down</div>
 * <div v-page-fade:left="{ duration: 0.8 }">Fade left</div>
 * <div v-page-fade:right>Fade right</div>
 *
 * Arguments:
 * - (none) or 'up': Fade with upward movement (default)
 * - down: Fade with downward movement
 * - left: Fade with leftward movement
 * - right: Fade with rightward movement
 */

export default {
  name: 'page-fade',

  // SSR support - skip during server rendering
  getSSRProps() {
    return {}
  },

  mounted(el, binding) {
    const direction = binding.arg || 'up'
    const config = binding.value || {}

    // Store config on element for page transitions to read
    el._pageAnimation = {
      type: 'fade',
      config: {
        direction,
        distance: config.distance !== undefined ? config.distance : 20,
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
