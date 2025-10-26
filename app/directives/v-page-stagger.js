/**
 * v-page-stagger directive
 *
 * Marks element's children for staggered animation during page transitions.
 * DOES NOT animate - just stores config for usePageTransition to read.
 *
 * Usage:
 * <ul v-page-stagger>
 *   <li>Item 1</li>
 *   <li>Item 2</li>
 * </ul>
 *
 * <div v-page-stagger="{ stagger: 0.1, duration: 0.5 }">
 *   <div>Card 1</div>
 *   <div>Card 2</div>
 * </div>
 *
 * <nav v-page-stagger="{ selector: 'a' }">
 *   <a href="#">Link 1</a>
 *   <a href="#">Link 2</a>
 * </nav>
 */

export default {
  name: 'page-stagger',

  // SSR support - skip during server rendering
  getSSRProps() {
    return {}
  },

  mounted(el, binding) {
    const config = binding.value || {}

    // Store config on element for page transitions to read
    el._pageAnimation = {
      type: 'stagger',
      config: {
        selector: config.selector || ':scope > *', // Default to direct children
        stagger: config.stagger !== undefined ? config.stagger : 0.1,
        duration: config.duration || 0.5,
        ease: config.ease || 'power2.out',
        leaveOnly: config.leaveOnly || false // Only animate on page leave, skip enter
      }
    }
  },

  unmounted(el) {
    // Clean up config
    delete el._pageAnimation
  }
}
