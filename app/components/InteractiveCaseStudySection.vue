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
    <!-- Teleport outside #smooth-content to avoid ScrollSmoother transform issues -->
    <Teleport to="body">
      <div
        v-if="showPreview"
        ref="previewContainerRef"
        class="preview-container hidden md:block"
        :class="{ active: showPreview }"
      >
        <!-- Current image (fades out during transition) -->
        <div
          ref="currentImageWrapperRef"
          class="preview-image-wrapper"
          :class="{ active: currentImageActive }"
        >
          <NuxtImg
            v-if="currentImage"
            ref="currentImageRef"
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
          :class="{ active: !currentImageActive }"
        >
          <NuxtImg
            v-if="nextImage"
            ref="nextImageRef"
            :src="nextImage.image"
            :alt="nextImage.imageAlt"
            class="preview-image"
            loading="eager"
            data-speed="0.95"
          />
        </div>
      </div>
    </Teleport>
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

// Show/hide preview
const showPreview = ref(false);

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
  // Always update cursor position (needed for initial preview positioning)
  cursorX.value = event.clientX;
  cursorY.value = event.clientY;

  // Only animate if preview is visible
  if (!showPreview.value || !previewContainerRef.value) return;

  // Get preview dimensions for bounds checking
  const previewRect = previewContainerRef.value.getBoundingClientRect();
  const previewWidth = previewRect.width;
  const previewHeight = previewRect.height;

  // Calculate target position with offset to the right of cursor
  const offsetX = 30; // Small offset to the right (in pixels)
  let targetX = cursorX.value + offsetX;

  // Center preview vertically on cursor Y (manual calculation instead of yPercent)
  let targetY = cursorY.value - (previewHeight / 2);

  // Bounds checking - keep preview on screen
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 20; // Padding from viewport edges

  // Check right edge
  if (targetX + previewWidth > viewportWidth - padding) {
    targetX = viewportWidth - previewWidth - padding;
  }

  // Check left edge
  if (targetX < padding) {
    targetX = padding;
  }

  // Check top edge
  if (targetY < padding) {
    targetY = padding;
  }

  // Check bottom edge
  if (targetY + previewHeight > viewportHeight - padding) {
    targetY = viewportHeight - previewHeight - padding;
  }

  // Animate preview position with GSAP for smooth lag effect
  $gsap.to(previewContainerRef.value, {
    x: targetX,
    y: targetY,
    xPercent: 0,
    yPercent: 0, // No percentage offset (we calculate absolute position)
    duration: 0.6,
    ease: 'power2.out',
    overwrite: 'auto', // Prevent animation queueing
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
    currentImage.value = preview;
    nextImage.value = preview;
    currentImageActive.value = true;
    showPreview.value = true;

    // Wait for next tick to ensure preview container is rendered
    await nextTick();

    // Set initial position at cursor (no animation)
    if (previewContainerRef.value) {
      // Get preview dimensions for bounds checking
      const previewRect = previewContainerRef.value.getBoundingClientRect();
      const previewWidth = previewRect.width;
      const previewHeight = previewRect.height;

      // Calculate target position with offset to the right of cursor
      const offsetX = 30; // Small offset to the right (in pixels)
      let targetX = cursorX.value + offsetX;

      // Center preview vertically on cursor Y
      let targetY = cursorY.value - (previewHeight / 2);

      // Bounds checking - keep preview on screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 20;

      // Check right edge
      if (targetX + previewWidth > viewportWidth - padding) {
        targetX = viewportWidth - previewWidth - padding;
      }

      // Check left edge
      if (targetX < padding) {
        targetX = padding;
      }

      // Check top edge
      if (targetY < padding) {
        targetY = padding;
      }

      // Check bottom edge
      if (targetY + previewHeight > viewportHeight - padding) {
        targetY = viewportHeight - previewHeight - padding;
      }

      $gsap.set(previewContainerRef.value, {
        x: targetX,
        y: targetY,
        xPercent: 0,
        yPercent: 0, // No percentage offset (we calculate absolute position)
      });
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
    return;
  }

  // Prevent multiple simultaneous transitions
  if (isTransitioning.value) return;
  isTransitioning.value = true;

  // Update the inactive image
  if (currentImageActive.value) {
    nextImage.value = preview;
  } else {
    currentImage.value = preview;
  }

  // Wait for next tick to ensure image is loaded in DOM
  await nextTick();

  // Crossfade animation: fade out current, fade in next
  const fadeOutTarget = currentImageActive.value
    ? currentImageWrapperRef.value
    : nextImageWrapperRef.value;

  const fadeInTarget = currentImageActive.value
    ? nextImageWrapperRef.value
    : currentImageWrapperRef.value;

  // Create timeline for smooth crossfade
  const tl = $gsap.timeline({
    onComplete: () => {
      // Toggle active state
      currentImageActive.value = !currentImageActive.value;
      isTransitioning.value = false;
    },
  });

  // Fade out current, fade in next (overlapping for smooth transition)
  tl.to(fadeOutTarget, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.inOut',
  }, 0);

  tl.to(fadeInTarget, {
    opacity: 1,
    duration: 0.4,
    ease: 'power2.inOut',
  }, 0);
};

/**
 * Clear active preview - hide preview container
 * Called by child InteractiveCaseStudyItem components on mouse leave
 */
const clearActivePreview = () => {
  showPreview.value = false;

  // Reset transition state
  isTransitioning.value = false;

  // Animate preview out with clip-path
  if (previewContainerRef.value) {
    $gsap.to(previewContainerRef.value, {
      clipPath: 'inset(50% 50% 50% 50%)',
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        // Reset images after animation completes
        currentImage.value = null;
        nextImage.value = null;
        currentImageActive.value = true;
      },
    });
  }
};

// Provide methods for child items to update preview
provide('setActivePreview', setActivePreview);
provide('clearActivePreview', clearActivePreview);
</script>
