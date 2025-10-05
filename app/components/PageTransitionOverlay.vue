<template>
  <!--
    Circle reveal page transition overlay
    - Covers FULL viewport to prevent glitches above header
    - Uses clip-path circle() for organic reveal animation
    - Animated radial gradients mimic FluidGradient for visual continuity
    - Theme-aware: gradients sync with current theme colors
    - Controlled by GSAP in usePageTransition composable
  -->
  <div ref="overlayRef" class="page-transition-overlay" aria-hidden="true">
    <!-- Animated gradient layers for organic fluid-like effect -->
    <div class="gradient-layer gradient-layer-1"></div>
    <div class="gradient-layer gradient-layer-2"></div>
    <div class="gradient-layer gradient-layer-3"></div>
    <div class="gradient-layer gradient-layer-4"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// Overlay element ref
const overlayRef = ref(null);

// Register overlay element with store on mount
const store = usePageTransitionStore();

onMounted(() => {
  store.setOverlayElement(overlayRef.value);
});

onBeforeUnmount(() => {
  store.setOverlayElement(null);
});
</script>

<style scoped>
.page-transition-overlay {
  /* Fixed overlay covering full viewport - header stays visible via z-index */
  position: fixed;
  top: 0; /* Cover full viewport to prevent content showing through transparent header */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40; /* Below header (50), above content */

  /* Base background color (fallback) */
  background-color: var(--theme-100);

  /* Initially hidden - GSAP will control visibility and clip-path */
  opacity: 0;
  pointer-events: none;

  /* Start with circle at 0% (fully clipped)
     Circle origin at bottom center */
  clip-path: circle(0% at 50% 100%);

  /* Full viewport dimensions */
  width: 100vw;
  height: 100vh;

  /* Ensure gradient layers are properly contained */
  overflow: hidden;
}

/* Gradient layers - create organic fluid-like movement */
.gradient-layer {
  position: absolute;
  width: 300%;
  height: 300%;
  mix-blend-mode: normal;
  will-change: transform; /* GPU acceleration hint */
}

/* Layer 1: Large organic blob - top area */
.gradient-layer-1 {
  top: -100%;
  left: -100%;
  background: radial-gradient(
    ellipse 70% 60% at 40% 30%,
    var(--gradient-tl) 0%,
    var(--gradient-tl) 10%,
    transparent 60%
  );
  opacity: 1;
  animation: gradient-drift-1 12s ease-in-out infinite;
}

/* Layer 2: Large organic blob - bottom area */
.gradient-layer-2 {
  top: -100%;
  left: -100%;
  background: radial-gradient(
    ellipse 65% 70% at 60% 70%,
    var(--gradient-br) 0%,
    var(--gradient-br) 10%,
    transparent 60%
  );
  opacity: 1;
  animation: gradient-drift-2 15s ease-in-out infinite;
  animation-delay: -3s;
}

/* Layer 3: Medium organic blob - left side */
.gradient-layer-3 {
  top: -100%;
  left: -100%;
  background: radial-gradient(
    ellipse 60% 75% at 30% 50%,
    var(--gradient-bl) 0%,
    var(--gradient-bl) 10%,
    transparent 55%
  );
  opacity: 1;
  animation: gradient-drift-3 18s ease-in-out infinite;
  animation-delay: -6s;
}

/* Layer 4: Right side organic blob for balance */
.gradient-layer-4 {
  top: -100%;
  left: -100%;
  background: radial-gradient(
    ellipse 68% 65% at 70% 45%,
    var(--gradient-tr) 0%,
    var(--gradient-tr) 10%,
    transparent 58%
  );
  opacity: 1;
  animation: gradient-drift-4 20s ease-in-out infinite;
  animation-delay: -9s;
}

/* Gentle organic drift animations */
@keyframes gradient-drift-1 {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(-8%, 4%) rotate(3deg);
  }
  66% {
    transform: translate(4%, -6%) rotate(-2deg);
  }
}

@keyframes gradient-drift-2 {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(6%, -5%) rotate(-4deg);
  }
  50% {
    transform: translate(-3%, 7%) rotate(2deg);
  }
  75% {
    transform: translate(5%, 3%) rotate(-3deg);
  }
}

@keyframes gradient-drift-3 {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  40% {
    transform: translate(-7%, -4%) rotate(5deg);
  }
  80% {
    transform: translate(6%, 5%) rotate(-4deg);
  }
}

@keyframes gradient-drift-4 {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  30% {
    transform: translate(5%, 6%) rotate(-5deg);
  }
  60% {
    transform: translate(-6%, -3%) rotate(4deg);
  }
  90% {
    transform: translate(4%, -5%) rotate(-2deg);
  }
}
</style>
