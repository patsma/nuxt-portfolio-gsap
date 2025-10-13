<template>
  <div class="page-content">
    <!-- v-page-split:words - Word reveal (different from Home) with slow speed -->
    <h1 v-page-split:chars data-speed="0.7">About Page</h1>

    <!-- v-page-clip:bottom - Clip from bottom with lag effect -->
    <p v-page-clip:bottom data-lag="0.15">
      Use different directives and configs on each page for variety in
      animations.
    </p>

    <!-- v-page-fade:left - Fade from left with faster speed -->
    <div v-page-fade:left data-speed="1.1" class="content-box">
      <h2>Flexible System</h2>
      <p>Mix and match directives to create unique page experiences.</p>
    </div>

    <!-- v-page-clip:left - Clip from left with lag effect -->
    <div v-page-clip:left data-lag="0.25" class="content-box">
      <h2>How It Works</h2>
      <p>Directives store config, page transitions read and animate.</p>
    </div>

    <!-- v-page-stagger with custom config and slower scroll -->
    <ol v-page-stagger="{ stagger: 0.12, duration: 0.6 }" data-speed="0.85">
      <li>Directives mark elements with animation config</li>
      <li>Page transitions read configs</li>
      <li>Elements animate OUT, then IN</li>
      <li>Simple, DRY, full control</li>
    </ol>

    <!-- v-page-fade:right - Fade from right with lag -->
    <p v-page-fade:right data-lag="0.18">
      Try clicking rapidly between pages - GSAP handles interruptions
      gracefully!
    </p>

    <!-- Add spacers for scrolling -->
    <div class="spacer"></div>

    <div v-page-clip:top data-lag="0.2" class="content-box">
      <h2>Smooth Scrolling</h2>
      <p>ScrollSmoother is active on all pages for a consistent experience.</p>
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

ul,
ol {
  line-height: 1.8;
  margin: 1.5rem 0;
}

.spacer {
  height: 60vh;
}
</style>
