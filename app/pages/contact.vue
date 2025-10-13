<template>
  <div class="page-content">
    <!-- v-page-split:chars with custom config and slower speed -->
    <h1 v-page-split:chars="{ stagger: 0.04, duration: 0.8 }" data-speed="0.7">Contact Page</h1>

    <!-- v-page-clip:right - Clip from right with lag -->
    <p v-page-clip:right data-lag="0.15">
      This page demonstrates all 4 directive types with various configurations.
    </p>

    <!-- v-page-fade:left with custom distance and faster speed -->
    <div v-page-fade:left="{ distance: 40 }" data-speed="1.1" class="content-box">
      <h2>All Directive Types</h2>
      <p>v-page-split, v-page-fade, v-page-clip, v-page-stagger</p>
    </div>

    <!-- v-page-stagger with slow stagger and slower speed -->
    <ul v-page-stagger="{ stagger: 0.15 }" data-speed="0.85">
      <li>Split → Character/word/line reveals</li>
      <li>Fade → Directional fade animations</li>
      <li>Clip → Clip-path reveals</li>
      <li>Stagger → Child element staggers</li>
    </ul>

    <!-- v-page-stagger with fast stagger and lag -->
    <ol v-page-stagger="{ stagger: 0.08, duration: 0.4 }" data-lag="0.18">
      <li>Manual control via directives</li>
      <li>No auto-detection bullshit</li>
      <li>Simple, DRY code</li>
      <li>Production-ready</li>
    </ol>

    <!-- v-page-clip:bottom with lag -->
    <div v-page-clip:bottom="{ duration: 0.8 }" data-lag="0.25" class="content-box">
      <h3>Custom Configs</h3>
      <p>Pass custom timing, easing, and other options to any directive.</p>
    </div>

    <!-- v-page-fade:right with lag -->
    <p v-page-fade:right data-lag="0.18">
      Navigate between pages to see the full effect of OUT then IN animations!
    </p>

    <!-- Add spacers for scrolling -->
    <div class="spacer"></div>

    <div v-page-clip:top data-lag="0.2" class="content-box">
      <h3>Scroll & Transition</h3>
      <p>ScrollSmoother and page transitions work together seamlessly.</p>
    </div>

    <div class="spacer"></div>
  </div>
</template>

<style scoped>
h1 {
  color: #00dc82;
  margin-bottom: 1rem;
}

h2,
h3 {
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
