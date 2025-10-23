<template>
  <section
    ref="sectionRef"
    class="interactive-case-study-section content-grid w-full min-h-screen relative py-12 md:py-16 lg:py-20"
    @mousemove="handleMouseMove"
  >
    <!-- Section title with page transition animation (direct child of content-grid) -->
    <h2
      class="section-title breakout3 mb-8 md:mb-12"
      v-page-split:lines
    >
      <slot name="title">Work</slot>
    </h2>

    <!-- Case study list (full-width-content creates sub-grid for items) -->
    <div class="case-study-list full-width-content" v-page-stagger="{ stagger: 0.08 }">
      <slot />
    </div>

    <!-- Desktop hover preview (cursor-following with dual-image crossfade) -->
    <!-- NO Teleport - using absolute positioning to avoid ref issues -->
    <!-- Keep mounted once shown to preserve refs -->
    <div
      v-if="previewMounted"
      v-show="showPreview"
      ref="previewContainerRef"
      class="preview-container hidden md:block"
      :class="{ active: showPreview }"
    >
      <!-- Current image (fades out during transition) -->
      <div
        ref="currentImageWrapperRef"
        class="preview-image-wrapper"
      >
        <NuxtImg
          v-if="currentImage"
          :src="currentImage.image"
          :alt="currentImage.imageAlt"
          class="preview-image"
          loading="eager"
          data-speed="0.95"
        />
      </div>

      <!-- Next image (fades in during transition) -->
      <div
        ref="nextImageWrapperRef"
        class="preview-image-wrapper"
      >
        <NuxtImg
          v-if="nextImage"
          :src="nextImage.image"
          :alt="nextImage.imageAlt"
          class="preview-image"
          loading="eager"
          data-speed="0.95"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * InteractiveCaseStudySection Component - Interactive Case Study Gallery (Phase 2)
 *
 * Displays case studies in a list format (desktop) or card format (mobile).
 * Desktop shows cursor-following preview with smooth image crossfades.
 *
 * Phase 2 Features:
 * - Cursor-following preview (floats with cursor, not centered)
 * - Smooth image crossfade transitions (dual-image system)
 * - Image preloading for instant display
 * - Subtle parallax effect on preview images
 * - 60fps performance with GSAP optimization
 *
 * Slots:
 * - title: Section title (defaults to "Work")
 * - default: InteractiveCaseStudyItem components
 *
 * Desktop (md: 768px and up):
 * - List layout with two columns (title left, description right)
 * - Preview follows cursor with lag effect (0.6s, power2.out)
 * - Cursor offset: 0% x, -50% y (center aligns with cursor Y, appears to right)
 * - Crossfade duration: 0.4s
 * - Parallax effect using data-speed attribute
 *
 * Mobile:
 * - Card layout with images
 * - Stacked vertically
 * - Full-card clickable area
 * - Uses v-page-clip directive
 *
 * Usage:
 * <InteractiveCaseStudySection>
 *   <InteractiveCaseStudyItem
 *     title="Recommendating"
 *     tag="APP"
 *     description="Art direction & UI"
 *     image="/images/projects/recommendating.jpg"
 *     image-alt="Recommendating app preview"
 *     to="/work/recommendating"
 *   />
 * </InteractiveCaseStudySection>
 */

const { $gsap } = useNuxtApp();

// Template refs
const sectionRef = ref(null);
const previewContainerRef = ref(null);
const currentImageWrapperRef = ref(null);
const nextImageWrapperRef = ref(null);
const currentImageRef = ref(null);
const nextImageRef = ref(null);

// Cursor tracking state
const cursorX = ref(0);
const cursorY = ref(0);

// Dual-image state for crossfade
const currentImage = ref(null);
const nextImage = ref(null);
const currentImageActive = ref(true); // Toggle between current/next

// Show/hide preview (keep mounted, control visibility with opacity)
const showPreview = ref(false);
const previewMounted = ref(false); // Track if preview has ever been shown

// Image preloading cache
const preloadedImages = new Map();

// Track if we're currently animating a transition
const isTransitioning = ref(false);

/**
 * Handle mouse move - track cursor position for preview following
 * Always track cursor position, even before preview appears
 * @param {MouseEvent} event - Mouse move event
 */
const handleMouseMove = (event) => {
  // Always update cursor position (viewport coordinates)
  cursorX.value = event.clientX;
  cursorY.value = event.clientY;

  // Only animate if preview is visible
  if (!showPreview.value || !previewContainerRef.value || !sectionRef.value) return;

  // Get section position to convert viewport coords to section-relative coords
  const sectionRect = sectionRef.value.getBoundingClientRect();

  // Get preview dimensions for bounds checking
  const previewRect = previewContainerRef.value.getBoundingClientRect();
  const previewWidth = previewRect.width;
  const previewHeight = previewRect.height;

  // Convert viewport coordinates to section-relative coordinates
  const offsetX = 30; // Small offset to the right (in pixels)
  let targetX = (cursorX.value - sectionRect.left) + offsetX;
  let targetY = (cursorY.value - sectionRect.top) - (previewHeight / 2);

  // Bounds checking - keep preview on screen (viewport-relative)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 20;

  // Check right edge (convert back to viewport coords for check)
  if (sectionRect.left + targetX + previewWidth > viewportWidth - padding) {
    targetX = viewportWidth - sectionRect.left - previewWidth - padding;
  }

  // Check left edge
  if (sectionRect.left + targetX < padding) {
    targetX = padding - sectionRect.left;
  }

  // Check top edge
  if (sectionRect.top + targetY < padding) {
    targetY = padding - sectionRect.top;
  }

  // Check bottom edge
  if (sectionRect.top + targetY + previewHeight > viewportHeight - padding) {
    targetY = viewportHeight - sectionRect.top - previewHeight - padding;
  }

  // Animate preview position with GSAP for smooth lag effect
  $gsap.to(previewContainerRef.value, {
    x: targetX,
    y: targetY,
    xPercent: 0,
    yPercent: 0,
    duration: 0.6,
    ease: 'power2.out',
    overwrite: 'auto',
  });
};

/**
 * Preload an image to ensure instant display on hover
 * @param {string} src - Image source URL
 * @returns {Promise<void>}
 */
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    // Check if already preloaded
    if (preloadedImages.has(src)) {
      resolve();
      return;
    }

    // Create new image and preload
    const img = new Image();
    img.onload = () => {
      preloadedImages.set(src, img);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Set active preview with crossfade animation
 * Called by child InteractiveCaseStudyItem components on hover
 * @param {Object} preview - Preview data { image, imageAlt }
 */
const setActivePreview = async (preview) => {
  if (!preview) return;

  // Preload image first (instant if already cached)
  await preloadImage(preview.image);

  // First hover - initialize both images to same preview, show immediately
  if (!currentImage.value && !nextImage.value) {
    console.log('🆕 First hover - initializing preview:', preview.image);
    currentImage.value = preview;
    nextImage.value = preview;
    currentImageActive.value = true;
    previewMounted.value = true; // Mount preview (stays mounted from now on)
    showPreview.value = true; // Make visible

    // Wait for next tick to ensure preview container is rendered
    await nextTick();

    // Set initial position at cursor (no animation)
    if (previewContainerRef.value && sectionRef.value) {
      // Get section position for section-relative coordinates
      const sectionRect = sectionRef.value.getBoundingClientRect();

      // Get preview dimensions for bounds checking
      const previewRect = previewContainerRef.value.getBoundingClientRect();
      const previewWidth = previewRect.width;
      const previewHeight = previewRect.height;

      // Convert viewport coordinates to section-relative coordinates
      const offsetX = 30; // Small offset to the right (in pixels)
      let targetX = (cursorX.value - sectionRect.left) + offsetX;
      let targetY = (cursorY.value - sectionRect.top) - (previewHeight / 2);

      // Bounds checking - keep preview on screen (viewport-relative)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 20;

      // Check right edge
      if (sectionRect.left + targetX + previewWidth > viewportWidth - padding) {
        targetX = viewportWidth - sectionRect.left - previewWidth - padding;
      }

      // Check left edge
      if (sectionRect.left + targetX < padding) {
        targetX = padding - sectionRect.left;
      }

      // Check top edge
      if (sectionRect.top + targetY < padding) {
        targetY = padding - sectionRect.top;
      }

      // Check bottom edge
      if (sectionRect.top + targetY + previewHeight > viewportHeight - padding) {
        targetY = viewportHeight - sectionRect.top - previewHeight - padding;
      }

      $gsap.set(previewContainerRef.value, {
        x: targetX,
        y: targetY,
        xPercent: 0,
        yPercent: 0,
      });

      // Set initial opacity on both wrappers (GSAP controls all opacity)
      if (currentImageWrapperRef.value && nextImageWrapperRef.value) {
        $gsap.set(currentImageWrapperRef.value, { opacity: 1 }); // Current visible
        $gsap.set(nextImageWrapperRef.value, { opacity: 0 }); // Next hidden
      }
    }

    // Animate preview in with clip-path reveal
    if (currentImageWrapperRef.value) {
      $gsap.fromTo(
        currentImageWrapperRef.value,
        { clipPath: 'inset(50% 50% 50% 50%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.5,
          ease: 'power2.out',
        }
      );
    }
    return;
  }

  // Check if this is the same image (prevent unnecessary crossfade)
  const currentActiveImage = currentImageActive.value ? currentImage.value : nextImage.value;
  if (currentActiveImage?.image === preview.image) {
    console.log('⏭️ Same image, skipping crossfade');
    // If preview was hidden, show it again with clip-path reveal
    if (!showPreview.value) {
      console.log('🎬 Re-entering section - showing preview with clip-path reveal');
      showPreview.value = true;
      await nextTick();

      // Get active wrapper
      const activeWrapper = currentImageActive.value ? currentImageWrapperRef.value : nextImageWrapperRef.value;

      // Clip-path reveal animation
      if (activeWrapper) {
        $gsap.fromTo(
          activeWrapper,
          { clipPath: 'inset(50% 50% 50% 50%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.5,
            ease: 'power2.out',
          }
        );
      }
    }
    return;
  }

  // Check if preview was hidden (re-entering section with different image)
  const wasHidden = !showPreview.value;

  console.log(wasHidden ? '🎬 Re-entering section - different image, clip-path reveal' : '🔄 Different image, starting crossfade from ' + currentActiveImage?.image + ' to ' + preview.image);

  // Show preview (in case it was hidden from previous mouse leave)
  showPreview.value = true;

  // Kill any active close animations (prevents race condition when quickly moving between items)
  if (currentImageWrapperRef.value && nextImageWrapperRef.value) {
    $gsap.killTweensOf([currentImageWrapperRef.value, nextImageWrapperRef.value]);
  }

  // Prevent multiple simultaneous transitions
  if (isTransitioning.value) {
    console.log('⚠️ Transition already in progress, resetting flag');
    isTransitioning.value = false; // Reset flag since we killed the animations
  }
  isTransitioning.value = true;

  // Update the inactive image
  if (currentImageActive.value) {
    nextImage.value = preview;
  } else {
    currentImage.value = preview;
  }

  // Wait for next tick to ensure image is loaded in DOM
  await nextTick();

  // Double-check refs exist (Teleport can delay ref assignment)
  if (!currentImageWrapperRef.value || !nextImageWrapperRef.value) {
    console.warn('⚠️ Image wrapper refs not ready, waiting...');
    await nextTick(); // Wait one more tick

    // If still not ready, bail out
    if (!currentImageWrapperRef.value || !nextImageWrapperRef.value) {
      console.error('❌ Image wrapper refs still null, aborting crossfade');
      isTransitioning.value = false;
      return;
    }
  }

  // If preview was hidden, do clip-path reveal instead of crossfade
  if (wasHidden) {
    console.log('🎬 Clip-path reveal on re-entry');

    // Get the target wrapper for the new image
    const revealTarget = currentImageActive.value
      ? nextImageWrapperRef.value
      : currentImageWrapperRef.value;

    // Hide the old wrapper, show the new one
    const hideTarget = currentImageActive.value
      ? currentImageWrapperRef.value
      : nextImageWrapperRef.value;

    $gsap.set(hideTarget, { opacity: 0 });
    $gsap.set(revealTarget, { opacity: 1 });

    // Clip-path reveal animation
    $gsap.fromTo(
      revealTarget,
      { clipPath: 'inset(50% 50% 50% 50%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          // Toggle active state
          currentImageActive.value = !currentImageActive.value;
          isTransitioning.value = false;
          console.log('✅ Clip-path reveal complete, new active:', currentImageActive.value);
        },
      }
    );
  } else {
    // Normal transition when preview is already visible - dual clip-path animation
    const clipOutTarget = currentImageActive.value
      ? currentImageWrapperRef.value
      : nextImageWrapperRef.value;

    const clipInTarget = currentImageActive.value
      ? nextImageWrapperRef.value
      : currentImageWrapperRef.value;

    console.log('🎬 Dual clip-path transition:', {
      clipOut: clipOutTarget ? 'ready' : 'NULL',
      clipIn: clipInTarget ? 'ready' : 'NULL',
      currentActive: currentImageActive.value,
      currentImage: currentImage.value?.image || 'NULL',
      nextImage: nextImage.value?.image || 'NULL',
      newPreview: preview.image
    });

    // Ensure new image wrapper is visible
    $gsap.set(clipInTarget, { opacity: 1 });

    // Create timeline for dual clip-path transition
    const tl = $gsap.timeline({
      onComplete: () => {
        // Hide old wrapper after transition
        $gsap.set(clipOutTarget, { opacity: 0 });
        // Toggle active state
        currentImageActive.value = !currentImageActive.value;
        isTransitioning.value = false;
        console.log('✅ Clip-path transition complete, new active:', currentImageActive.value);
      },
    });

    // Clip out current image (0% → 50% inset) and clip in next image (50% → 0% inset)
    // Both animations start at same time (position 0) for seamless overlap
    tl.to(clipOutTarget, {
      clipPath: 'inset(50% 50% 50% 50%)',
      duration: 0.4,
      ease: 'power2.inOut',
    }, 0);

    tl.fromTo(clipInTarget,
      { clipPath: 'inset(50% 50% 50% 50%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.4,
        ease: 'power2.inOut',
      }, 0);
  }
};

/**
 * Clear active preview - hide preview container with clip-path animation
 * Called by child InteractiveCaseStudyItem components on mouse leave
 * NOTE: Don't clear image data - keep it so toggle state persists between hovers
 */
const clearActivePreview = () => {
  // Prevent multiple transitions
  if (isTransitioning.value) return;
  isTransitioning.value = true;

  // Get currently visible wrapper
  const activeWrapper = currentImageActive.value
    ? currentImageWrapperRef.value
    : nextImageWrapperRef.value;

  console.log('👋 Hiding preview with clip-path animation (keeping image data for next hover)');

  // Animate clip-path close (reverse of entrance)
  if (activeWrapper) {
    $gsap.to(activeWrapper, {
      clipPath: 'inset(50% 50% 50% 50%)',
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        showPreview.value = false;
        isTransitioning.value = false;
      }
    });
  } else {
    // Fallback if ref not available
    showPreview.value = false;
    isTransitioning.value = false;
  }
};

// Provide methods for child items to update preview
provide('setActivePreview', setActivePreview);
provide('clearActivePreview', clearActivePreview);
</script>
