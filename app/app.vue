<template>
  <!-- Fluid gradient background (z-0, behind everything) -->
  <FluidGradient class="opacity-70" />

  <NuxtLayout>
    <NuxtPage
      :transition="{
        mode: 'out-in',
        css: false,
        onEnter: handlePageEnter,
      }"
    />
  </NuxtLayout>

  <!-- Circle reveal page transition overlay -->
  <PageTransitionOverlay ref="overlayComponentRef" />

  <!-- Smooth cursor trail effect (z-50, on top) -->
  <CursorTrail class="!opacity-20" />
</template>

<script setup>
import { ref, computed } from "vue";

// Page transition setup
const overlayComponentRef = ref(null);

// Access the overlay element ref from the component
const overlayRef = computed(() => overlayComponentRef.value?.overlayRef);

// Initialize page transition composable
const { handlePageLeave, handlePageEnter } = usePageTransition(overlayRef);

// Display fancy console info about developer and work
if (process.client) {
  console.log(`
   👨‍💻 Developer: Patryk Smakosz
   🌐 Website: https://patryksmakosz.com
   🏢 Brand: tastysites.pl
   📧 Contact: patryksmakosz1@gmail.com

   🚀 Built with:
   • Nuxt 4 (Vue 3) - Modern full-stack framework
   • GSAP - Premium animations & ScrollSmoother
   • TailwindCSS - Utility-first styling
   • Nuxt Content - Type-safe content management
   • Pinia - State management

   ✨ Features:
   • Smooth scrolling with GSAP ScrollSmoother
   • Interactive SVG animations
   • Orbital carousel components
   • Project case studies with video
   • Responsive design & accessibility

   🎯 Specializing in:
   • Creative web development
   • Interactive user experiences
   • Modern JavaScript frameworks
   • Performance optimization
   • Animation & motion design

   💼 Available for freelance projects & collaborations
  `);

  console.log(
    "%c🎨 Welcome to my portfolio!",
    "font-size: 24px; color: #ff6b6b; font-weight: bold;"
  );
  console.log(
    "%cLike what you see? Let's work together!",
    "font-size: 16px; color: #4ecdc4; font-weight: bold;"
  );
  console.log(
    "%c📧 patryksmakosz1@gmail.com",
    "font-size: 14px; color: #45b7d1; text-decoration: underline;"
  );
}

// Intentionally minimal: all app-level structure is handled by layouts and pages
</script>
