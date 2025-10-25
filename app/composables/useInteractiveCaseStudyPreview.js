/**
 * Interactive Case Study Preview Composable
 *
 * Manages state and animations for the cursor-following preview system.
 * Extracted from InteractiveCaseStudySection.vue for better modularity,
 * testability, and maintainability.
 *
 * Features:
 * - Dual-image crossfade system
 * - Clip-path reveal/close animations
 * - Image preloading with caching
 * - Smart transition routing
 * - Comprehensive logging
 * - Race condition prevention
 *
 * Usage:
 * ```javascript
 * const {
 *   currentImage,
 *   nextImage,
 *   showPreview,
 *   previewMounted,
 *   currentImageActive,
 *   setActivePreview,
 *   clearActivePreview,
 *   calculatePosition,
 * } = useInteractiveCaseStudyPreview({ gsap, getRefs })
 * ```
 *
 * @param {Object} options - Composable options
 * @param {Object} options.gsap - GSAP instance from useNuxtApp()
 * @param {Function} options.getRefs - Function that returns fresh template refs
 * @returns {Object} Preview state and methods
 */

import { ref, nextTick } from "vue";
import { createPreviewLogger } from "~/utils/logger";
import {
  calculatePreviewPosition,
  validateElements,
} from "~/utils/previewPosition";

/**
 * Animation configuration constants
 * Single source of truth for all animation timings and easings
 * Reduced durations for smooth gallery-like rapid switching
 */
const ANIMATION_CONFIG = {
  clipReveal: {
    duration: 350, // ms - faster for smooth gallery feel
    ease: "power2.out",
  },
  clipClose: {
    duration: 350, // ms - faster for smooth gallery feel
    ease: "power2.in",
  },
  dualClip: {
    duration: 350, // ms - faster for smooth gallery feel
    ease: "power2.inOut",
  },
  aspectRatio: {
    duration: 400, // ms - slightly slower for smooth size morphing
    ease: "power2.inOut", // Smooth in-out for size changes
  },
  clipPath: {
    closed: "inset(50% 50% 50% 50%)",
    open: "inset(0% 0% 0% 0%)",
  },
  position: {
    offsetX: 30, // px to the right
    padding: 20, // viewport edge padding
  },
  debounce: {
    clearDelay: 100, // ms delay before hiding preview (allows rapid item switching)
  },
};

export const useInteractiveCaseStudyPreview = ({ gsap, getRefs }) => {
  const log = createPreviewLogger();

  const currentImage = ref(null);
  const nextImage = ref(null);
  const currentImageActive = ref(true);
  const showPreview = ref(false);
  const previewMounted = ref(false);
  const isTransitioning = ref(false);
  const clearTimer = ref(null);
  const preloadedImages = new Map(); // Stores { img, aspectRatio }
  const currentAspectRatio = ref(4 / 3); // Default aspect ratio (fallback)
  const isNavigating = ref(false); // Prevents re-showing preview during navigation

  /**
   * Preload image for instant display on hover
   * Captures natural aspect ratio from loaded image for dynamic sizing
   * @param {string} src - Image source URL
   * @returns {Promise<number>} Resolves with aspect ratio (width/height)
   */
  const preloadImage = (src) => {
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      // Check if already preloaded
      if (preloadedImages.has(src)) {
        const cached = preloadedImages.get(src);
        log.preload("cached", src);
        resolve(cached.aspectRatio);
        return;
      }

      log.preload("loading", src);

      // Create new image and preload
      const img = new Image();
      img.onload = () => {
        const duration = Math.round(performance.now() - startTime);

        // Calculate aspect ratio from natural dimensions
        const aspectRatio = img.naturalWidth / img.naturalHeight;

        // Store image and aspect ratio
        preloadedImages.set(src, {
          img,
          aspectRatio,
        });

        log.preload("cached", src, duration);
        log.debug(`Aspect ratio detected: ${aspectRatio.toFixed(2)} (${img.naturalWidth}x${img.naturalHeight})`);

        resolve(aspectRatio);
      };
      img.onerror = () => {
        log.preload("failed", src);
        reject(new Error(`Failed to preload image: ${src}`));
      };
      img.src = src;
    });
  };

  // POSITION CALCULATION

  /**
   * Calculate preview position using utility
   * Wrapper around calculatePreviewPosition with logging
   * @param {Object} cursor - Cursor position { x, y }
   * @param {DOMRect} previewRect - Preview bounding rect
   * @returns {Object} Position { x, y, clamped, clampReason }
   */
  const calculatePosition = (cursor, sectionRect, previewRect) => {
    const position = calculatePreviewPosition({
      cursorX: cursor.x,
      cursorY: cursor.y,
      sectionRect,
      previewRect,
      offsetX: ANIMATION_CONFIG.position.offsetX,
      padding: ANIMATION_CONFIG.position.padding,
      centerY: true, // Center preview on cursor (accounts for ScrollSmoother transform)
    });

    // Log if position was clamped
    if (position.clamped) {
      log.position(position.original, position, position.clampReason);
    }

    return position;
  };

  // ANIMATION HELPERS

  /**
   * Set initial position without animation
   * Uses section-relative coords converted to viewport (accounts for ScrollSmoother transform)
   * @param {Object} refs - Template refs
   * @param {Object} cursor - Cursor position { x, y }
   */
  const setInitialPosition = (refs, cursor) => {
    if (!refs.previewContainerRef || !refs.sectionRef) {
      log.warn("Missing refs for initial position", {
        hasPreview: !!refs.previewContainerRef,
        hasSection: !!refs.sectionRef,
      });
      return;
    }

    const sectionRect = refs.sectionRef.getBoundingClientRect();
    const previewRect = refs.previewContainerRef.getBoundingClientRect();
    const position = calculatePosition(cursor, sectionRect, previewRect);

    gsap.set(refs.previewContainerRef, {
      x: position.x,
      y: position.y,
      xPercent: 100,
      yPercent: 15,
    });

    log.position({ x: position.x, y: position.y });
  };

  /**
   * Animate clip-path reveal
   * @param {HTMLElement} target - Target element
   * @param {Function} onComplete - Completion callback
   */
  const animateClipReveal = (target, onComplete) => {
    if (!target) {
      log.error("animateClipReveal: target is null");
      return;
    }

    log.animationStart("clip-reveal", ANIMATION_CONFIG.clipReveal.duration);

    gsap.fromTo(
      target,
      { clipPath: ANIMATION_CONFIG.clipPath.closed },
      {
        clipPath: ANIMATION_CONFIG.clipPath.open,
        duration: ANIMATION_CONFIG.clipReveal.duration / 1000, // Convert to seconds
        ease: ANIMATION_CONFIG.clipReveal.ease,
        overwrite: true, // Kill all tweens on target for smooth interruption
        onComplete: () => {
          log.animationComplete(
            "clip-reveal",
            ANIMATION_CONFIG.clipReveal.duration
          );
          if (onComplete) onComplete();
        },
      }
    );
  };

  /**
   * Animate clip-path close
   * @param {HTMLElement} target - Target element
   * @param {Function} onComplete - Completion callback
   */
  const animateClipClose = (target, onComplete) => {
    if (!target) {
      log.error("animateClipClose: target is null");
      return;
    }

    log.animationStart("clip-close", ANIMATION_CONFIG.clipClose.duration);

    gsap.to(target, {
      clipPath: ANIMATION_CONFIG.clipPath.closed,
      duration: ANIMATION_CONFIG.clipClose.duration / 1000,
      ease: ANIMATION_CONFIG.clipClose.ease,
      overwrite: true, // Kill all tweens on target for smooth interruption
      onComplete: () => {
        log.animationComplete(
          "clip-close",
          ANIMATION_CONFIG.clipClose.duration
        );
        if (onComplete) onComplete();
      },
    });
  };

  /**
   * Animate dual clip-path transition (one closes, one opens)
   * @param {HTMLElement} clipOutTarget - Element to close
   * @param {HTMLElement} clipInTarget - Element to open
   * @param {Function} onComplete - Completion callback
   */
  const animateDualClip = (clipOutTarget, clipInTarget, onComplete) => {
    if (!clipOutTarget || !clipInTarget) {
      log.error("animateDualClip: missing targets", {
        clipOut: !!clipOutTarget,
        clipIn: !!clipInTarget,
      });
      return;
    }

    log.animationStart("dual-clip", ANIMATION_CONFIG.dualClip.duration, {
      clipOut: "closing",
      clipIn: "opening",
    });

    // Ensure new image wrapper is visible
    gsap.set(clipInTarget, { opacity: 1 });

    // Create timeline for dual clip-path transition
    const tl = gsap.timeline({
      onComplete: () => {
        log.animationComplete("dual-clip", ANIMATION_CONFIG.dualClip.duration);
        // Hide old wrapper after transition
        gsap.set(clipOutTarget, { opacity: 0 });
        if (onComplete) onComplete();
      },
    });

    // Clip out current image (0% → 50% inset)
    tl.to(
      clipOutTarget,
      {
        clipPath: ANIMATION_CONFIG.clipPath.closed,
        duration: ANIMATION_CONFIG.dualClip.duration / 1000,
        ease: ANIMATION_CONFIG.dualClip.ease,
        overwrite: true, // Kill all tweens on target for smooth interruption
      },
      0 // Position 0 - start immediately
    );

    // Clip in next image (50% → 0% inset)
    tl.fromTo(
      clipInTarget,
      { clipPath: ANIMATION_CONFIG.clipPath.closed },
      {
        clipPath: ANIMATION_CONFIG.clipPath.open,
        duration: ANIMATION_CONFIG.dualClip.duration / 1000,
        ease: ANIMATION_CONFIG.dualClip.ease,
        overwrite: true, // Kill all tweens on target for smooth interruption
      },
      0 // Position 0 - start at same time as clip-out
    );
  };

  /**
   * Animate aspect ratio change
   * Smoothly morphs the preview container size based on new image aspect ratio
   * @param {number} newAspectRatio - Target aspect ratio (width/height)
   */
  const animateAspectRatio = (newAspectRatio) => {
    const oldRatio = currentAspectRatio.value;

    // Skip if same ratio (avoid unnecessary animations)
    if (Math.abs(oldRatio - newAspectRatio) < 0.01) {
      log.debug("Aspect ratio unchanged, skipping animation");
      return;
    }

    log.animationStart("aspect-ratio", ANIMATION_CONFIG.aspectRatio.duration, {
      from: oldRatio.toFixed(2),
      to: newAspectRatio.toFixed(2),
    });

    // Animate the reactive ref (component will react to changes)
    gsap.to(currentAspectRatio, {
      value: newAspectRatio,
      duration: ANIMATION_CONFIG.aspectRatio.duration / 1000,
      ease: ANIMATION_CONFIG.aspectRatio.ease,
      overwrite: true, // Kill any existing aspect ratio tweens
      onComplete: () => {
        log.animationComplete(
          "aspect-ratio",
          ANIMATION_CONFIG.aspectRatio.duration
        );
      },
    });
  };

  // TRANSITION HANDLERS

  /**
   * Handle first hover - Initialize and reveal preview
   * @param {Object} preview - Preview data { image, imageAlt }
   * @param {Object} cursor - Cursor position { x, y }
   * @param {number} aspectRatio - Image aspect ratio (width/height)
   */
  const handleFirstHover = async (preview, cursor, aspectRatio) => {
    log.route("FIRST_HOVER", { image: preview.image });
    log.state("IDLE", "REVEALING", { image: preview.image });

    // Set state
    currentImage.value = preview;
    nextImage.value = preview;
    currentImageActive.value = true;
    previewMounted.value = true;
    showPreview.value = true;

    // Set initial aspect ratio (no animation on first hover)
    currentAspectRatio.value = aspectRatio;

    // Wait for DOM update
    await nextTick();

    // Get fresh refs
    const refs = getRefs();

    // Validate refs
    const validation = validateElements({
      currentImageWrapperRef: refs.currentImageWrapperRef,
      nextImageWrapperRef: refs.nextImageWrapperRef,
      previewContainerRef: refs.previewContainerRef,
      sectionRef: refs.sectionRef,
    });

    log.refs({
      currentWrapper: !!refs.currentImageWrapperRef,
      nextWrapper: !!refs.nextImageWrapperRef,
      previewContainer: !!refs.previewContainerRef,
      section: !!refs.sectionRef,
    });

    if (!validation.valid) {
      log.error("Missing refs after mount, aborting animation", {
        missing: validation.missing,
      });
      return;
    }

    // Set initial position at cursor
    setInitialPosition(refs, cursor);

    // Set initial opacity and clip-path
    gsap.set(refs.currentImageWrapperRef, {
      opacity: 1,
      clipPath: ANIMATION_CONFIG.clipPath.closed, // Start closed
    });
    gsap.set(refs.nextImageWrapperRef, { opacity: 0 });

    // Animate clip-path reveal
    animateClipReveal(refs.currentImageWrapperRef, () => {
      log.state("REVEALING", "VISIBLE");
    });
  };

  /**
   * Handle re-entry after leaving section
   * @param {Object} preview - Preview data { image, imageAlt }
   * @param {boolean} sameImage - Whether this is the same image as before
   * @param {number} aspectRatio - Image aspect ratio (width/height)
   */
  const handleReentry = async (preview, sameImage, aspectRatio) => {
    log.route("RE_ENTRY", { image: preview.image, sameImage });
    log.state("IDLE", "REVEALING", { image: preview.image, reentry: true });

    showPreview.value = true;
    isTransitioning.value = true;

    // If different image, update the inactive wrapper and animate aspect ratio
    if (!sameImage) {
      if (currentImageActive.value) {
        nextImage.value = preview;
      } else {
        currentImage.value = preview;
      }
      // Animate to new aspect ratio
      animateAspectRatio(aspectRatio);
    }

    await nextTick();

    const refs = getRefs();
    const validation = validateElements({
      currentImageWrapperRef: refs.currentImageWrapperRef,
      nextImageWrapperRef: refs.nextImageWrapperRef,
    });

    if (!validation.valid) {
      log.error("Missing refs on re-entry", { missing: validation.missing });
      isTransitioning.value = false;
      return;
    }

    // Get target wrapper (same if same image, opposite if different)
    const revealTarget = sameImage
      ? currentImageActive.value
        ? refs.currentImageWrapperRef
        : refs.nextImageWrapperRef
      : currentImageActive.value
        ? refs.nextImageWrapperRef
        : refs.currentImageWrapperRef;

    const hideTarget = sameImage
      ? currentImageActive.value
        ? refs.nextImageWrapperRef
        : refs.currentImageWrapperRef
      : currentImageActive.value
        ? refs.currentImageWrapperRef
        : refs.nextImageWrapperRef;

    // Set visibility
    gsap.set(hideTarget, { opacity: 0 });
    gsap.set(revealTarget, { opacity: 1 });

    // Animate clip-path reveal
    animateClipReveal(revealTarget, () => {
      // Toggle active state if different image
      if (!sameImage) {
        currentImageActive.value = !currentImageActive.value;
        log.debug("Toggled active image", {
          newActive: currentImageActive.value,
        });
      }
      isTransitioning.value = false;
      log.state("REVEALING", "VISIBLE");
    });
  };

  /**
   * Handle item switch with dual clip-path transition
   * @param {Object} preview - Preview data { image, imageAlt }
   * @param {number} aspectRatio - Image aspect ratio (width/height)
   */
  const handleItemSwitch = async (preview, aspectRatio) => {
    log.route("ITEM_SWITCH", {
      from: currentImageActive.value
        ? currentImage.value?.image
        : nextImage.value?.image,
      to: preview.image,
    });
    log.state("VISIBLE", "TRANSITIONING", { image: preview.image });

    // Get current refs for cleanup
    let refs = getRefs();

    // Kill all running tweens to prevent conflicts
    if (refs.currentImageWrapperRef && refs.nextImageWrapperRef) {
      log.debug("Killing active tweens");
      gsap.killTweensOf([
        refs.currentImageWrapperRef,
        refs.nextImageWrapperRef,
      ]);
    }

    // Check for race condition
    if (isTransitioning.value) {
      log.raceCondition("Transition already in progress, forcing reset", {
        currentState: isTransitioning.value,
      });
      isTransitioning.value = false;
    }

    isTransitioning.value = true;

    // Update inactive image
    if (currentImageActive.value) {
      nextImage.value = preview;
    } else {
      currentImage.value = preview;
    }

    // Animate to new aspect ratio
    animateAspectRatio(aspectRatio);

    await nextTick();

    // Get fresh refs after DOM update
    refs = getRefs();

    const validation = validateElements({
      currentImageWrapperRef: refs.currentImageWrapperRef,
      nextImageWrapperRef: refs.nextImageWrapperRef,
    });

    if (!validation.valid) {
      log.error("Missing refs for item switch", {
        missing: validation.missing,
      });
      isTransitioning.value = false;
      return;
    }

    const clipOutTarget = currentImageActive.value
      ? refs.currentImageWrapperRef
      : refs.nextImageWrapperRef;

    const clipInTarget = currentImageActive.value
      ? refs.nextImageWrapperRef
      : refs.currentImageWrapperRef;

    // Animate dual clip-path transition
    animateDualClip(clipOutTarget, clipInTarget, () => {
      // Toggle active state
      currentImageActive.value = !currentImageActive.value;
      isTransitioning.value = false;
      log.debug("Toggled active image", {
        newActive: currentImageActive.value,
      });
      log.state("TRANSITIONING", "VISIBLE");
    });
  };

  // PUBLIC API

  /**
   * Set active preview with smart routing
   * Routes to appropriate handler based on current state
   * @param {Object} preview - Preview data { image, imageAlt }
   * @param {Object} cursor - Cursor position { x, y }
   */
  const setActivePreview = async (preview, cursor) => {
    if (!preview) {
      log.warn("setActivePreview called with null preview");
      return;
    }

    // Prevent showing preview during navigation
    if (isNavigating.value) {
      log.debug("Navigation in progress, skipping hover");
      return;
    }

    log.separator(`HOVER: ${preview.image}`);

    // Cancel pending clear timer (rapid item switching)
    if (clearTimer.value) {
      log.debug("Cancelled pending clear timer", { wasScheduled: true });
      clearTimeout(clearTimer.value);
      clearTimer.value = null;
    }

    // Preload image first and get aspect ratio
    let aspectRatio = 4 / 3; // Fallback
    try {
      aspectRatio = await preloadImage(preview.image);
    } catch (error) {
      log.error("Image preload failed", {
        image: preview.image,
        error: error.message,
      });
      // Continue anyway - browser will load on-demand with fallback aspect ratio
    }

    // First hover - initialize
    if (!currentImage.value && !nextImage.value) {
      return handleFirstHover(preview, cursor, aspectRatio);
    }

    // Get currently active image
    const currentActiveImage = currentImageActive.value
      ? currentImage.value
      : nextImage.value;
    const sameImage = currentActiveImage?.image === preview.image;

    // Same image check
    if (sameImage) {
      // If preview was hidden, re-show it
      if (!showPreview.value) {
        log.route("SKIP", {
          reason: "same image, re-entry",
          image: preview.image,
        });
        return handleReentry(preview, true, aspectRatio);
      }
      // Already showing same image, do nothing
      log.route("SKIP", { reason: "already showing", image: preview.image });
      return;
    }

    // Different image
    // If preview was hidden, show with reveal
    if (!showPreview.value) {
      return handleReentry(preview, false, aspectRatio);
    }

    // REMOVED BLOCKING LOGIC - Let GSAP handle interruptions with overwrite: true
    // Always allow item switch for smooth gallery-like flow
    return handleItemSwitch(preview, aspectRatio);
  };

  /**
   * Clear active preview - hide preview container with clip-path animation
   * Uses debounce to allow rapid item switching without closing
   * NOTE: Don't clear image data - keep it so toggle state persists
   */
  const clearActivePreview = () => {
    log.separator("CLEAR");

    // Clear any existing timer
    if (clearTimer.value) {
      clearTimeout(clearTimer.value);
    }

    // Set debounced timer
    clearTimer.value = setTimeout(() => {
      log.debug("Executing debounced clear", {
        delay: ANIMATION_CONFIG.debounce.clearDelay,
      });

      // REMOVED BLOCKING LOGIC - Let GSAP handle interruptions with overwrite: true
      isTransitioning.value = true;
      log.state("VISIBLE", "CLOSING");

      // Get currently visible wrapper
      const refs = getRefs();
      const activeWrapper = currentImageActive.value
        ? refs.currentImageWrapperRef
        : refs.nextImageWrapperRef;

      if (!activeWrapper) {
        log.warn("No active wrapper for clear, instant hide");
        showPreview.value = false;
        isTransitioning.value = false;
        clearTimer.value = null;
        log.state("CLOSING", "IDLE");
        return;
      }

      // Animate clip-path close
      animateClipClose(activeWrapper, () => {
        showPreview.value = false;
        isTransitioning.value = false;
        clearTimer.value = null;
        log.state("CLOSING", "IDLE");
      });
    }, ANIMATION_CONFIG.debounce.clearDelay);

    log.debug("Clear scheduled", {
      delay: ANIMATION_CONFIG.debounce.clearDelay,
    });
  };

  /**
   * Clear active preview immediately - no debounce
   * Used for navigation clicks to ensure smooth exit animation plays before page transition
   * Immediately triggers clip-close animation, then hides preview
   * Sets isNavigating flag to prevent hover events from re-showing preview
   */
  const clearActivePreviewImmediate = () => {
    log.separator("CLEAR IMMEDIATE (Navigation)");

    // Set navigation flag to prevent hover events from re-showing preview
    isNavigating.value = true;

    // Cancel any pending debounced clear
    if (clearTimer.value) {
      clearTimeout(clearTimer.value);
      clearTimer.value = null;
    }

    // Skip if already hidden
    if (!showPreview.value) {
      log.debug("Preview already hidden, skipping");
      return;
    }

    isTransitioning.value = true;
    log.state("VISIBLE", "CLOSING", { immediate: true });

    // Get currently visible wrapper
    const refs = getRefs();
    const activeWrapper = currentImageActive.value
      ? refs.currentImageWrapperRef
      : refs.nextImageWrapperRef;

    if (!activeWrapper) {
      log.warn("No active wrapper for immediate clear, instant hide");
      showPreview.value = false;
      isTransitioning.value = false;
      log.state("CLOSING", "IDLE");
      // Keep isNavigating true - will be reset on page unload
      return;
    }

    // Animate clip-path close immediately
    animateClipClose(activeWrapper, () => {
      showPreview.value = false;
      isTransitioning.value = false;
      log.state("CLOSING", "IDLE");
      // Keep isNavigating true - will be reset on page unload
    });
  };

  // RETURN PUBLIC API

  return {
    // State (reactive)
    currentImage,
    nextImage,
    showPreview,
    previewMounted,
    currentImageActive,
    currentAspectRatio, // Dynamic aspect ratio for preview container

    // Methods
    setActivePreview,
    clearActivePreview,
    clearActivePreviewImmediate, // Immediate clear for navigation clicks
    calculatePosition,

    // Animation config (for external use if needed)
    animationConfig: ANIMATION_CONFIG,
  };
};
