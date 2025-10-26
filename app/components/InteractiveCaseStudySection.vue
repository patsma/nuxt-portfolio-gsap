<template>
  <section
    ref="sectionRef"
    class="interactive-case-study-section content-grid w-full min-h-screen relative py-12 md:py-16 lg:py-20"
    @mousemove="handleMouseMove"
  >
    <h2 class="section-title breakout3 mb-8 md:mb-12" v-page-split:lines>
      <slot name="title">Work</slot>
    </h2>

    <div
      class="case-study-list full-width-content"
      v-page-stagger="{ stagger: 0.08 }"
    >
      <slot />
    </div>

    <!-- Teleport to body for scroll support, visibility via clip-path -->
    <Teleport to="body" v-if="previewMounted">
      <div
        ref="previewContainerRef"
        class="preview-container hidden md:block"
        :class="{ active: showPreview }"
        :style="{ aspectRatio: currentAspectRatio }"
      >
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
 * Interactive case study gallery with cursor-following preview
 * Desktop: List layout with hover preview (dynamic aspect ratios, crossfade transitions)
 * Mobile: Card layout with images
 */
import { useInteractiveCaseStudyPreview } from "~/composables/useInteractiveCaseStudyPreview";
import { calculatePreviewPosition } from "~/utils/previewPosition";

const { $gsap } = useNuxtApp();

const sectionRef = ref(null);
const previewContainerRef = ref(null);
const currentImageWrapperRef = ref(null);
const nextImageWrapperRef = ref(null);

const cursorX = ref(0);
const cursorY = ref(0);

const getRefs = () => ({
  sectionRef: sectionRef.value,
  previewContainerRef: previewContainerRef.value,
  currentImageWrapperRef: currentImageWrapperRef.value,
  nextImageWrapperRef: nextImageWrapperRef.value,
});

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

// Track cursor and animate preview position (getBoundingClientRect accounts for ScrollSmoother)
const handleMouseMove = (event) => {
  cursorX.value = event.clientX;
  cursorY.value = event.clientY;

  if (!showPreview.value || !previewContainerRef.value || !sectionRef.value)
    return;

  const sectionRect = sectionRef.value.getBoundingClientRect();
  const previewRect = previewContainerRef.value.getBoundingClientRect();

  const position = calculatePreviewPosition({
    cursorX: cursorX.value,
    cursorY: cursorY.value,
    sectionRect,
    previewRect,
    offsetX: animationConfig.position.offsetX,
    padding: animationConfig.position.padding,
    centerY: true,
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

// Delay navigation until clip animation completes (350ms)
onBeforeRouteLeave((to, from, next) => {
  if (showPreview.value) {
    clearActivePreviewImmediate();
    setTimeout(() => next(), 350);
  } else {
    next();
  }
});

// Provide preview control to child items (adds cursor position)
const setActivePreview = (preview) => {
  if (!preview) return;
  setActivePreviewComposable(preview, {
    x: cursorX.value,
    y: cursorY.value,
  });
};

const clearActivePreview = () => {
  clearActivePreviewComposable();
};

provide("setActivePreview", setActivePreview);
provide("clearActivePreview", clearActivePreview);

// Hide preview when scrolling out of section bounds (both directions)
onMounted(() => {
  const { $ScrollTrigger } = useNuxtApp();

  if ($ScrollTrigger) {
    $ScrollTrigger.create({
      trigger: sectionRef.value,
      start: "top top",
      end: "bottom bottom",
      onLeave: () => {
        // User scrolled past the section (going down)
        if (showPreview.value) {
          clearActivePreview();
        }
      },
      onLeaveBack: () => {
        // User scrolled past the section (going up)
        if (showPreview.value) {
          clearActivePreview();
        }
      },
    });
  }
});
</script>
