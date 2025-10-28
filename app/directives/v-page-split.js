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
 * Slide from mask effect:
 * <h1 v-page-split:lines="{ animateFrom: 'below' }">Slide from below</h1>
 * <h2 v-page-split:chars="{ animateFrom: 'above', stagger: 0.03 }">Slide from above</h2>
 *
 * Arguments:
 * - chars: Split into characters
 * - words: Split into words
 * - lines: Split into lines
 *
 * Config Options:
 * - animateFrom: 'below' | 'above' - Slide text from outside mask area (no opacity fade)
 * - stagger: Number - Delay between each element
 * - duration: Number - Animation duration in seconds
 * - ease: String - GSAP easing function
 * - y: Number - Y offset for default fade animation (ignored if animateFrom is set)
 */

export default {
  name: "page-split",

  // SSR support - skip during server rendering
  getSSRProps() {
    return {};
  },

  mounted(el, binding) {
    const splitType = binding.arg || "chars";
    const config = binding.value || {};

    // Default values based on split type
    const defaults = {
      chars: { y: 35, stagger: 0.025 },
      words: { y: 15, stagger: 0.03 },
      lines: { y: 20, stagger: 0.04 },
    };

    const typeDefaults = defaults[splitType] || defaults.chars;

    // Store config on element for page transitions to read
    el._pageAnimation = {
      type: "split",
      config: {
        splitType,
        stagger:
          config.stagger !== undefined ? config.stagger : typeDefaults.stagger,
        duration: config.duration || 0.9,
        ease: config.ease || "back.out(1.2)",
        y: config.y !== undefined ? config.y : typeDefaults.y,
        animateFrom: config.animateFrom, // 'below' | 'above' | undefined
        leaveOnly: config.leaveOnly || false, // Only animate on page leave, skip enter
      },
    };
  },

  unmounted(el) {
    // Clean up config
    delete el._pageAnimation;
  },
};
