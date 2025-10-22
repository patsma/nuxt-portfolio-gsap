<template>
  <section
    ref="sectionRef"
    class="interactive-case-study-section content-grid w-full min-h-screen relative py-12 md:py-16 lg:py-20"
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

    <!-- Desktop hover preview (absolute positioned, clip-path reveal) -->
    <div
      v-if="activePreview"
      class="preview-container hidden md:block"
      :class="{ active: !!activePreview }"
    >
      <NuxtImg
        :src="activePreview.image"
        :alt="activePreview.imageAlt"
        class="preview-image"
        loading="lazy"
      />
    </div>
  </section>
</template>

<script setup>
/**
 * InteractiveCaseStudySection Component - Interactive Case Study Gallery
 *
 * Displays case studies in a list format (desktop) or card format (mobile).
 * Desktop shows clip-path reveal preview on hover, mobile shows card layout with images.
 *
 * Slots:
 * - title: Section title (defaults to "Work")
 * - default: InteractiveCaseStudyItem components
 *
 * Features:
 * - Responsive layout (list on desktop, cards on mobile)
 * - Transparent background (works with FluidGradient or other backgrounds)
 * - Theme-aware using CSS variables
 * - Page transition directives support (v-page-stagger)
 * - NuxtLink navigation to project pages
 * - Clip-path reveal animation for desktop hover previews
 *
 * Desktop (md: 768px and up):
 * - List layout with two columns (title left, description right)
 * - Hover reveals preview image with clip-path animation
 * - Image positioned centrally, overlays list
 * - Smooth transitions using --duration-hover
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
 *   <InteractiveCaseStudyItem
 *     title="Maj"
 *     description="Art direction & UI"
 *     image="/images/projects/maj.jpg"
 *     image-alt="Maj project preview"
 *     to="/work/maj"
 *   />
 * </InteractiveCaseStudySection>
 */

const sectionRef = ref(null);

// Active preview state for desktop hover
const activePreview = ref(null);

// Provide methods for child items to update preview
provide('setActivePreview', (preview) => {
  activePreview.value = preview;
});

provide('clearActivePreview', () => {
  activePreview.value = null;
});
</script>
