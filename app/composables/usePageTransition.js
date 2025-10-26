/**
 * Page Transition System
 *
 * Complete page transition system with directive-based animation control.
 * Provides 4 animation types: split, fade, clip, and stagger.
 *
 * ARCHITECTURE:
 * 1. Directives (v-page-*) store animation config on elements: el._pageAnimation = { type, config }
 * 2. This composable reads configs during page transitions
 * 3. Animation functions execute GSAP timelines for OUT/IN animations
 *
 * NO auto-detection - full manual control via directives.
 */

export const usePageTransition = () => {
  const { $gsap, $SplitText } = useNuxtApp();
  const splitInstances = [];

  // ========================================
  // ANIMATION FUNCTIONS
  // ========================================

  /**
   * SPLIT TEXT ANIMATION
   * Animates text by splitting into chars/words/lines
   *
   * Two animation modes:
   * 1. Default (no animateFrom): Fade in/out with y offset (opacity-based)
   * 2. Slide from mask (animateFrom: 'below'|'above'): Slide from outside mask area (position-based)
   *
   * @param {HTMLElement} el - Element to animate
   * @param {Object} config - Animation config { splitType, stagger, duration, ease, y, animateFrom }
   * @param {string} direction - 'out' or 'in'
   * @param {Object} timeline - GSAP timeline to add animation to
   * @param {number} position - Timeline position
   */
  const animateSplit = (el, config, direction, timeline, position) => {
    if (!$SplitText) {
      console.warn("⚠️ SplitText not available, skipping split animation");
      return;
    }

    const splitType = config.splitType || "chars";
    const stagger = config.stagger || 0.025;
    const duration = config.duration || 0.6;
    const ease = config.ease || "sine.out";
    const y = config.y || 35;
    const animateFrom = config.animateFrom; // 'below' | 'above' | undefined

    // Lock height before SplitText to prevent Safari jump (~7px layout shift)
    // SplitText with masking wraps content in overflow:hidden containers which adds height
    // Locking height prevents visible layout shift during LEAVE transitions on Safari
    const originalHeight = el.offsetHeight;
    $gsap.set(el, { height: originalHeight });

    // Create split
    const split = $SplitText.create(el, {
      type: splitType,
      mask: splitType, // Use masking for clean reveals
    });
    splitInstances.push(split);

    // SLIDE FROM MASK EFFECT - leverages SplitText masking for position-based reveals
    if (animateFrom === "below" || animateFrom === "above") {
      const yPercent = animateFrom === "below" ? 100 : -100;

      if (direction === "out") {
        // Animate OUT: slide away from center (opposite of entry)
        timeline.to(
          split[splitType],
          {
            yPercent: -yPercent, // Slide in opposite direction
            duration: duration * 0.7,
            stagger: stagger,
            ease: "power2.in",
            transformOrigin: "100% 0%",
            rotate: 20,
          },
          position
        );
      } else {
        // Animate IN: slide from outside mask to center
        $gsap.set(split[splitType], {
          yPercent: yPercent,
          rotate: 20,
          transformOrigin: "0% 0%",
        });
        timeline.to(
          split[splitType],
          {
            yPercent: 0,
            duration: duration,
            stagger: stagger,
            ease: ease,
            rotate: 0,
          },
          position
        );
      }
    }
    // DEFAULT FADE EFFECT - traditional opacity-based animation
    else {
      if (direction === "out") {
        // Animate OUT: fade up and disappear
        timeline.to(
          split[splitType],
          {
            y: -y,
            opacity: 0,
            duration: duration * 0.7,
            stagger: stagger,
            ease: "power2.in",
          },
          position
        );
      } else {
        // Animate IN: bounce down and appear
        $gsap.set(split[splitType], { y: y, opacity: 0 });
        timeline.to(
          split[splitType],
          {
            y: 0,
            opacity: 1,
            duration: duration,
            stagger: stagger,
            ease: ease,
          },
          position
        );
      }
    }
  };

  /**
   * FADE ANIMATION
   * Simple fade in/out with optional directional movement
   *
   * @param {HTMLElement} el - Element to animate
   * @param {Object} config - Animation config { direction, distance, duration, ease }
   * @param {string} animDirection - 'out' or 'in'
   * @param {Object} timeline - GSAP timeline
   * @param {number} position - Timeline position
   * @param {boolean} skipInitialState - Skip setting initial state (used when already set)
   */
  const animateFade = (
    el,
    config,
    animDirection,
    timeline,
    position,
    skipInitialState = false
  ) => {
    const fadeDirection = config.direction || "up";
    const distance = config.distance || 20;
    const duration = config.duration || 0.6;
    const ease = config.ease || "power2.out";

    // Determine movement axis
    const axis = fadeDirection === "up" || fadeDirection === "down" ? "y" : "x";
    const multiplier =
      fadeDirection === "up" || fadeDirection === "left" ? -1 : 1;

    if (animDirection === "out") {
      // Animate OUT: fade and move away
      timeline.to(
        el,
        {
          [axis]: multiplier * distance,
          opacity: 0,
          duration: duration * 0.7,
          ease: "power2.in",
        },
        position
      );
    } else {
      // Animate IN: fade and move in from opposite
      // Only set initial state if not already set
      if (!skipInitialState) {
        $gsap.set(el, { [axis]: -multiplier * distance, opacity: 0 });
      }
      timeline.to(
        el,
        {
          [axis]: 0,
          opacity: 1,
          duration: duration,
          ease: ease,
        },
        position
      );
    }
  };

  /**
   * CLIP-PATH ANIMATION
   * Modern clip-path reveals from any direction
   *
   * @param {HTMLElement} el - Element to animate
   * @param {Object} config - Animation config { direction, duration, ease }
   * @param {string} animDirection - 'out' or 'in'
   * @param {Object} timeline - GSAP timeline
   * @param {number} position - Timeline position
   * @param {boolean} skipInitialState - Skip setting initial state (used when already set)
   */
  const animateClip = (
    el,
    config,
    animDirection,
    timeline,
    position,
    skipInitialState = false
  ) => {
    const direction = config.direction || "top";
    const duration = config.duration || 0.6;
    const ease = config.ease || "power2.out";

    // Clip-path values for each direction
    const clips = {
      top: { out: "inset(0% 0% 100% 0%)", in: "inset(100% 0% 0% 0%)" },
      bottom: { out: "inset(100% 0% 0% 0%)", in: "inset(0% 0% 100% 0%)" },
      left: { out: "inset(0% 100% 0% 0%)", in: "inset(0% 0% 0% 100%)" },
      right: { out: "inset(0% 0% 0% 100%)", in: "inset(0% 100% 0% 0%)" },
    };

    if (animDirection === "out") {
      // Animate OUT: clip away
      timeline.to(
        el,
        {
          clipPath: clips[direction].out,
          duration: duration * 0.7,
          ease: "power2.in",
        },
        position
      );
    } else {
      // Animate IN: clip reveal
      // Only set initial state if not already set
      if (!skipInitialState) {
        $gsap.set(el, { clipPath: clips[direction].in });
      }
      timeline.to(
        el,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: duration,
          ease: ease,
        },
        position
      );
    }
  };

  /**
   * STAGGER ANIMATION
   * Stagger child elements with fade animation
   *
   * @param {HTMLElement} el - Container element
   * @param {Object} config - Animation config { selector, stagger, duration, ease }
   * @param {string} direction - 'out' or 'in'
   * @param {Object} timeline - GSAP timeline
   * @param {number} position - Timeline position
   * @param {boolean} skipInitialState - Skip setting initial state (used when already set)
   */
  const animateStagger = (
    el,
    config,
    direction,
    timeline,
    position,
    skipInitialState = false
  ) => {
    const selector = config.selector || ":scope > *";
    const stagger = config.stagger || 0.1;
    const duration = config.duration || 0.5;
    const ease = config.ease || "power2.out";

    const children = el.querySelectorAll(selector);

    if (direction === "out") {
      // Animate OUT: fade up
      timeline.to(
        children,
        {
          y: -15,
          opacity: 0,
          duration: duration * 0.7,
          stagger: stagger * 0.8,
          ease: "power2.in",
        },
        position
      );
    } else {
      // Animate IN: fade down
      // Only set initial state if not already set
      if (!skipInitialState) {
        $gsap.set(children, { y: 15, opacity: 0 });
      }
      timeline.to(
        children,
        {
          y: 0,
          opacity: 1,
          duration: duration,
          stagger: stagger,
          ease: ease,
        },
        position
      );
    }
  };

  /**
   * Cleanup function to revert all SplitText instances
   */
  const cleanup = () => {
    splitInstances.forEach((split) => split.revert?.());
    splitInstances.length = 0;
  };

  // ========================================
  // PAGE TRANSITION HOOKS
  // ========================================

  /**
   * Find all elements with page animation configs
   * Recursively walks the entire DOM tree to find elements at any nesting level
   */
  const findAnimatedElements = (el) => {
    const elements = [];

    // console.log('🔍 Finding animated elements in:', el)

    // Recursively walk the entire tree to find all elements with _pageAnimation
    const walk = (node) => {
      // Check if this node has animation config
      if (node._pageAnimation) {
        elements.push(node);
        // console.log('🔍 Found:', node.tagName, 'with type:', node._pageAnimation.type)
      }

      // Walk all children recursively
      Array.from(node.children).forEach((child) => {
        walk(child);
      });
    };

    // Start walking from root element
    walk(el);

    // console.log('🔍 Found elements with directives:', elements.length)
    return elements;
  };

  /**
   * LEAVE Animation - Elements animate OUT
   */
  const leave = (el, done) => {
    // console.log('🚀 Page LEAVE')

    const elements = findAnimatedElements(el);

    if (elements.length === 0) {
      console.warn("⚠️ No elements with page animation directives found");
      done();
      return;
    }

    const tl = $gsap.timeline({ onComplete: done });

    elements.forEach((element, index) => {
      const { type, config } = element._pageAnimation;
      const position = index * 0.06; // Stagger start times

      // Call appropriate animation function
      switch (type) {
        case "split":
          animateSplit(element, config, "out", tl, position);
          break;
        case "fade":
          animateFade(element, config, "out", tl, position);
          break;
        case "clip":
          animateClip(element, config, "out", tl, position);
          break;
        case "stagger":
          animateStagger(element, config, "out", tl, position);
          break;
        default:
          console.warn(`⚠️ Unknown animation type: ${type}`);
      }
    });
  };

  /**
   * ENTER Animation - Elements animate IN
   *
   * SAFARI FIX: Uses double requestAnimationFrame to ensure DOM is fully painted
   * before animations start. Safari executes animations too fast otherwise.
   */
  const enter = (el, done) => {
    // console.log('🎬 Page ENTER')

    // Wait for directives to mount and store their configs
    nextTick(() => {
      const elements = findAnimatedElements(el);

      if (elements.length === 0) {
        console.warn("⚠️ No elements with page animation directives found");
        $gsap.set(el, { visibility: "visible" }); // Show page even if no animations
        done();
        return;
      }

      // SAFARI FIX: Double requestAnimationFrame ensures Safari has fully painted DOM
      // Without this, Safari starts animations before layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Now Safari is ready - make page visible
          $gsap.set(el, { visibility: "visible" });

          // Refresh ScrollSmoother to recalculate data-speed/data-lag for new page
          const { refreshSmoother } = useScrollSmootherManager();
          refreshSmoother();

          // Get nuxtApp to access headroom
          const nuxtApp = useNuxtApp();

          // Create timeline - resume headroom when animation completes
          const tl = $gsap.timeline({
            onComplete: () => {
              done();
              // Resume headroom AFTER visual transition completes
              if (nuxtApp.$headroom?.resume) {
                nuxtApp.$headroom.resume();
                // console.log('[Transition] Resumed headroom after enter animation')
              }
            },
          });

          elements.forEach((element, index) => {
            const { type, config } = element._pageAnimation;
            const position = index * 0.08; // Stagger start times (slightly slower than leave)

            // Check if element should skip enter animation (only animate on leave)
            // Used for scroll-triggered elements that should only transition OUT
            if (config.leaveOnly) {
              // Set initial hidden state but don't animate
              // This prevents flash of visible content
              // ScrollTrigger or other systems will handle the IN animation
              if (type === "stagger") {
                const selector = config.selector || ":scope > *";
                const children = element.querySelectorAll(selector);
                $gsap.set(children, { y: 15, opacity: 0 });
              } else if (type === "fade") {
                // Set fade initial state if needed in future
                const direction = config.direction || "up";
                const distance = config.distance || 20;
                const axis = direction === "up" || direction === "down" ? "y" : "x";
                const value = direction === "up" || direction === "left" ? distance : -distance;
                $gsap.set(element, { [axis]: value, opacity: 0 });
              }
              return; // Skip animation
            }

            // Call appropriate animation function
            // Animation functions will set their own initial states
            switch (type) {
              case "split":
                animateSplit(element, config, "in", tl, position);
                break;
              case "fade":
                animateFade(element, config, "in", tl, position);
                break;
              case "clip":
                animateClip(element, config, "in", tl, position);
                break;
              case "stagger":
                animateStagger(element, config, "in", tl, position);
                break;
              default:
                console.warn(`⚠️ Unknown animation type: ${type}`);
            }
          });
        });
      });
    });
  };

  /**
   * Before enter hook - hide page to prevent flash of content
   */
  const beforeEnter = (el) => {
    // Hide page immediately to prevent flash while Safari paints DOM
    $gsap.set(el, { visibility: "hidden" });
  };

  /**
   * After leave hook - cleanup and scroll to top
   */
  const afterLeave = (el) => {
    // Cleanup SplitText instances and GSAP properties
    cleanup();

    if ($gsap && el) {
      $gsap.set(el, { clearProps: "all" });
      $gsap.set(el.querySelectorAll("*"), { clearProps: "all" });
    }

    // Manually scroll to top AFTER leave animation completes
    // This happens between OUT and IN animations, so user doesn't see the jump
    const { getSmoother } = useScrollSmootherManager();
    const smoother = getSmoother();

    if (smoother && typeof smoother.scrollTop === "function") {
      // Use ScrollSmoother's scrollTop method for instant scroll to 0
      smoother.scrollTop(0);
      // console.log('📍 Scrolled to top after leave animation')
    } else {
      // Fallback to window.scrollTo if ScrollSmoother not available
      window.scrollTo(0, 0);
      // console.log('📍 Fallback: Scrolled to top using window.scrollTo')
    }

    // NOTE: We do NOT reset headroom here - it stays frozen in current state
    // Header will smoothly animate to top state in resume() after enter animation completes
  };

  return { leave, enter, beforeEnter, afterLeave };
};
