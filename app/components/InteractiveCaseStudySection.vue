<template>
  <section
    ref="sectionRef"
    class="interactive-case-study-section content-grid w-full min-h-screen relative py-12 md:py-16 lg:py-20"
    @mousemove="handleMouseMove"
  >
    <!-- Section title with page transition animation (direct child of content-grid) -->
    <h2 class="section-title breakout3 mb-8 md:mb-12" v-page-split:lines>
      <slot name="title">Work</slot>
    </h2>

    <!-- Case study list (full-width-content creates sub-grid for items) -->
    <div
      class="case-study-list full-width-content"
      v-page-stagger="{ stagger: 0.08 }"
    >
      <slot />
    </div>

    <!-- Desktop hover preview (cursor-following with dual-image crossfade) -->
    <!-- Teleport to body + fixed positioning for scroll support -->
    <!-- Keep mounted once shown to preserve refs -->
    <!-- Always in DOM once mounted - visibility controlled by clip-path animations -->
    <Teleport to="body" v-if="previewMounted">
      <div
        ref="previewContainerRef"
        class="preview-container hidden md:block"
        :class="{ active: showPreview }"
        :style="{ aspectRatio: currentAspectRatio }"
      >
        <!-- Current image (fades out during transition) -->
        <div ref="currentImageWrapperRef" class="preview-image-wrapper">
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
        <div ref="nextImageWrapperRef" class="preview-image-wrapper">
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
    </Teleport>
  </section>
</template>

<script setup>
/**
 * InteractiveCaseStudySection Component - Interactive Case Study Gallery
 *
 * Displays case studies in a list format (desktop) or card format (mobile).
 * Desktop shows cursor-following preview with smooth image crossfades and dynamic aspect ratios.
 *
 * Features:
 * - Modular architecture with composables
 * - Dynamic aspect ratios (morphs between image sizes)
 * - Comprehensive logging for debugging
 * - DRY position calculations
 * - Smart transition routing
 * - Race condition prevention
 * - Page transition integration (smooth exit on navigation)
 *
 * Architecture:
 * - Component handles: Template refs, mousemove tracking, provide/inject
 * - Composable handles: State management, animations, transitions, aspect ratio detection
 * - Utils handle: Position calculations, logging
 *
 * Slots:
 * - title: Section title (defaults to "Work")
 * - default: InteractiveCaseStudyItem components
 *
 * Desktop (md: 768px and up):
 * - List layout with two columns (title left, description right)
 * - Preview follows cursor with lag effect (0.6s, power2.out)
 * - Cursor offset: 30px right, centered vertically
 * - Clip-path transitions: 350ms
 * - Aspect ratio morphing: 400ms (smooth size changes between images)
 * - Page transition exit: v-page-clip:center directive
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

import { useInteractiveCaseStudyPreview } from "~/composables/useInteractiveCaseStudyPreview";
import { calculatePreviewPosition } from "~/utils/previewPosition";

const { $gsap } = useNuxtApp();

// TEMPLATE REFS (DOM ELEMENTS)

const sectionRef = ref(null);
const previewContainerRef = ref(null);
const currentImageWrapperRef = ref(null);
const nextImageWrapperRef = ref(null);

// CURSOR TRACKING (UI CONCERN)

const cursorX = ref(0);
const cursorY = ref(0);

// PREVIEW COMPOSABLE (LOGIC)

// Function to get fresh refs (passed to composable)
const getRefs = () => ({
  sectionRef: sectionRef.value,
  previewContainerRef: previewContainerRef.value,
  currentImageWrapperRef: currentImageWrapperRef.value,
  nextImageWrapperRef: nextImageWrapperRef.value,
});

// Initialize preview composable
const {
  currentImage,
  nextImage,
  showPreview,
  previewMounted,
  currentImageActive,
  currentAspectRatio,
  setActivePreview: setActivePreviewComposable,
  clearActivePreview: clearActivePreviewComposable,
  clearActivePreviewImmediate,
  animationConfig,
} = useInteractiveCaseStudyPreview({
  gsap: $gsap,
  getRefs,
});

// MOUSE MOVE HANDLER (CURSOR FOLLOWING)

/**
 * Handle mouse move - track cursor position for preview following
 * Updates cursor position and animates preview position with GSAP
 * Uses section-relative coords converted to viewport (accounts for ScrollSmoother transform)
 * @param {MouseEvent} event - Mouse move event
 */
const handleMouseMove = (event) => {
  cursorX.value = event.clientX;
  cursorY.value = event.clientY;

  if (!showPreview.value || !previewContainerRef.value || !sectionRef.value)
    return;

  // sectionRect accounts for ScrollSmoother's transform
  const sectionRect = sectionRef.value.getBoundingClientRect();
  const previewRect = previewContainerRef.value.getBoundingClientRect();

  const position = calculatePreviewPosition({
    cursorX: cursorX.value,
    cursorY: cursorY.value,
    sectionRect,
    previewRect,
    offsetX: animationConfig.position.offsetX,
    padding: animationConfig.position.padding,
    centerY: true, // Center preview on cursor (accounts for ScrollSmoother transform)
  });

  $gsap.to(previewContainerRef.value, {
    x: position.x,
    y: position.y,
    xPercent: 0,
    yPercent: 0,
    duration: 0.6,
    ease: "power2.out",
    overwrite: "auto",
  });
};

// NAVIGATION GUARD (SMOOTH PREVIEW EXIT)

/**
 * Route leave guard - delays navigation until preview clip animation completes
 * This ensures the preview animates out smoothly before page transition starts
 */
onBeforeRouteLeave((to, from, next) => {
  // If preview is visible, animate it out first
  if (showPreview.value) {
    // Hide preview with immediate clip animation
    clearActivePreviewImmediate();

    // Wait for clip animation to complete, then allow navigation
    setTimeout(() => {
      next(); // Allow navigation to proceed
    }, 350); // Match clip-close animation duration
  } else {
    // No preview visible, allow immediate navigation
    next();
  }
});

// PROVIDE METHODS TO CHILDREN

/**
 * Wrapper for setActivePreview that adds cursor position
 * @param {Object} preview - Preview data { image, imageAlt }
 */
const setActivePreview = (preview) => {
  if (!preview) return;

  const cursor = {
    x: cursorX.value,
    y: cursorY.value,
  };

  setActivePreviewComposable(preview, cursor);
};

const clearActivePreview = () => {
  clearActivePreviewComposable();
};

provide("setActivePreview", setActivePreview);
provide("clearActivePreview", clearActivePreview);

// SCROLL FAILSAFE

/**
 * Hide preview during fast scrolling to prevent it being left on screen
 * Only hides if cursor is actually outside the section bounds
 * Uses ScrollTrigger's onUpdate to detect scroll movement
 */
onMounted(() => {
  const { $ScrollTrigger } = useNuxtApp();

  if ($ScrollTrigger) {
    $ScrollTrigger.create({
      onUpdate: (self) => {
        if (showPreview.value && Math.abs(self.getVelocity()) > 50) {
          // Check if cursor is within section bounds before hiding
          // This prevents hiding when user stops scrolling with cursor over an item
          if (sectionRef.value && cursorX.value && cursorY.value) {
            const sectionRect = sectionRef.value.getBoundingClientRect();

            // Check if cursor is outside section bounds
            const isCursorOutsideSection =
              cursorX.value < sectionRect.left ||
              cursorX.value > sectionRect.right ||
              cursorY.value < sectionRect.top ||
              cursorY.value > sectionRect.bottom;

            // Only clear if cursor is outside the section
            if (isCursorOutsideSection) {
              clearActivePreview();
            }
          }
        }
      },
    });
  }
});
</script>
