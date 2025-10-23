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
    <!-- Teleport to body + fixed positioning for scroll support -->
    <!-- Keep mounted once shown to preserve refs -->
    <Teleport to="body">
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
    </Teleport>
  </section>
</template>

<script setup>
/**
 * InteractiveCaseStudySection Component - Interactive Case Study Gallery (Phase 2 Refactored)
 *
 * Displays case studies in a list format (desktop) or card format (mobile).
 * Desktop shows cursor-following preview with smooth image crossfades.
 *
 * Phase 2 Features (Refactored):
 * - Modular architecture with composables
 * - Comprehensive logging for debugging
 * - DRY position calculations
 * - Smart transition routing
 * - Race condition prevention
 *
 * Architecture:
 * - Component handles: Template refs, mousemove tracking, provide/inject
 * - Composable handles: State management, animations, transitions
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
 * - Clip-path transitions: 400-500ms
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

import { useInteractiveCaseStudyPreview } from '~/composables/useInteractiveCaseStudyPreview';
import { calculatePreviewPosition } from '~/utils/previewPosition';

const { $gsap } = useNuxtApp();

// ============================================
// TEMPLATE REFS (DOM ELEMENTS)
// ============================================

const sectionRef = ref(null);
const previewContainerRef = ref(null);
const currentImageWrapperRef = ref(null);
const nextImageWrapperRef = ref(null);

// ============================================
// CURSOR TRACKING (UI CONCERN)
// ============================================

const cursorX = ref(0);
const cursorY = ref(0);

// ============================================
// PREVIEW COMPOSABLE (LOGIC)
// ============================================

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
  setActivePreview: setActivePreviewComposable,
  clearActivePreview: clearActivePreviewComposable,
  animationConfig,
} = useInteractiveCaseStudyPreview({
  gsap: $gsap,
  getRefs,
});

// ============================================
// MOUSE MOVE HANDLER (CURSOR FOLLOWING)
// ============================================

/**
 * Handle mouse move - track cursor position for preview following
 * Updates cursor position and animates preview position with GSAP
 * Uses section-relative coords converted to viewport (accounts for ScrollSmoother transform)
 * @param {MouseEvent} event - Mouse move event
 */
const handleMouseMove = (event) => {
  // Always update cursor position (viewport coordinates)
  cursorX.value = event.clientX;
  cursorY.value = event.clientY;

  // Only animate if preview is visible and refs are ready
  if (!showPreview.value || !previewContainerRef.value || !sectionRef.value) return;

  // Get rects for position calculation
  // sectionRect accounts for ScrollSmoother's transform
  const sectionRect = sectionRef.value.getBoundingClientRect();
  const previewRect = previewContainerRef.value.getBoundingClientRect();

  // Calculate position using utility (section-relative → viewport coords)
  const position = calculatePreviewPosition({
    cursorX: cursorX.value,
    cursorY: cursorY.value,
    sectionRect,
    previewRect,
    offsetX: animationConfig.position.offsetX,
    padding: animationConfig.position.padding,
    centerY: true, // Center preview on cursor (accounts for ScrollSmoother transform)
  });

  // Animate preview position with GSAP for smooth lag effect
  $gsap.to(previewContainerRef.value, {
    x: position.x,
    y: position.y,
    xPercent: 0,
    yPercent: 0,
    duration: 0.6,
    ease: 'power2.out',
    overwrite: 'auto',
  });
};

// ============================================
// PROVIDE METHODS TO CHILDREN
// ============================================

/**
 * Wrapper for setActivePreview that adds cursor position
 * @param {Object} preview - Preview data { image, imageAlt }
 */
const setActivePreview = (preview) => {
  if (!preview) return;

  // Pass current cursor position to composable
  const cursor = {
    x: cursorX.value,
    y: cursorY.value,
  };

  setActivePreviewComposable(preview, cursor);
};

/**
 * Wrapper for clearActivePreview
 */
const clearActivePreview = () => {
  clearActivePreviewComposable();
};

// Provide methods for child items to update preview
provide('setActivePreview', setActivePreview);
provide('clearActivePreview', clearActivePreview);

// ============================================
// SCROLL FAILSAFE
// ============================================

/**
 * Hide preview during fast scrolling to prevent it being left on screen
 * Uses ScrollTrigger's onUpdate to detect scroll movement
 */
onMounted(() => {
  const { $ScrollTrigger } = useNuxtApp();

  if ($ScrollTrigger) {
    // Create a ScrollTrigger that watches for any scroll movement
    $ScrollTrigger.create({
      onUpdate: (self) => {
        // If scrolling and preview is visible, hide it
        if (showPreview.value && Math.abs(self.getVelocity()) > 50) {
          clearActivePreview();
        }
      }
    });
  }
});
</script>
