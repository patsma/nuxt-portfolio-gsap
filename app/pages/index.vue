<script setup lang="ts">
import HeroSection from "~/components/HeroSection.vue";
</script>

<template>
  <div class="page-content">
    <HeroSection />
    <!-- v-page-split:chars - Character reveal with slower scroll speed -->
    <h1 v-page-split:chars data-speed="0.7">Home Page</h1>

    <!-- v-page-clip:bottom - Clip from bottom with lag effect -->
    <p v-page-clip:bottom data-lag="0.15">
      This demonstrates directive-based page transitions. Mark elements with
      v-page-* directives for full control.
    </p>

    <!-- v-page-fade:left - Fade from left with faster speed -->
    <div v-page-fade:left data-speed="1.1" class="content-box">
      <h2>Manual Control</h2>
      <p>Use directives to control exactly how each element animates.</p>
    </div>

    <!-- v-page-stagger - Stagger list items with slightly slower speed -->
    <ul v-page-stagger="{ stagger: 0.12, duration: 0.6 }" data-speed="0.85">
      <li>v-page-split → SplitText character/word reveals</li>
      <li>v-page-fade → Fade with directional movement</li>
      <li>v-page-clip → Clip-path reveals</li>
      <li>v-page-stagger → Stagger child elements</li>
    </ul>

    <!-- v-page-fade:right - Fade from right with lag effect -->
    <p v-page-fade:right data-lag="0.18">
      Navigate between pages to see elements animate OUT, then IN with opposite
      animations!
    </p>

    <!-- Add more content to enable scrolling -->
    <div class="spacer"></div>

    <div v-page-clip:top data-lag="0.2" class="content-box">
      <h2>Scroll Smoothing</h2>
      <p>
        ScrollSmoother creates buttery smooth scrolling with momentum and
        effects.
      </p>
      <p>Try scrolling to feel the smooth animation!</p>
    </div>

    <div class="spacer"></div>

    <div v-page-clip:left data-lag="0.25" class="content-box">
      <h2>How It Works</h2>
      <p>
        ScrollSmoother wraps your content and creates a virtual scroll
        experience.
      </p>
      <p>
        It transitions between pages seamlessly with our page transition system.
      </p>
    </div>

    <div class="spacer"></div>
  </div>
</template>

<style scoped>
h1 {
  color: #00dc82;
  margin-bottom: 1rem;
}

h2 {
  color: #333;
  margin-top: 0;
}

p {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.content-box {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-left: 4px solid #00dc82;
  border-radius: 4px;
}

ul {
  line-height: 1.8;
  margin: 1.5rem 0;
}

.spacer {
  height: 60vh;
}
</style>
