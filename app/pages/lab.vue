<script setup lang="ts">
import HeroSection from "~/components/HeroSection.vue";
import ScrollDownSVG from "~/components/SVG/ScrollDownSVG.vue";
</script>

<template>
  <div>
    <!-- Hero section with different content, NO services -->
    <HeroSection>
      <h1
        v-page-split:lines="{ animateFrom: 'below' }"
        data-speed="0.8"
        class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter"
      >
        <span class="text-[var(--theme-text-60)]">Feel</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> free</em>
        <span class="text-[var(--theme-text-60)]">
          to use my lab projects as your own. They are</span
        >
        <span class="text-[var(--theme-text-100)] font-body font-[300]">
          based</span
        >
        <span class="text-[var(--theme-text-60)]"> on Morten</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> logic</em>
        <span class="text-[var(--theme-text-60)]"> and</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]">
          experience</em
        >
        <span class="text-[var(--theme-text-60)]"
          >, but still experimental and always evolving</span
        >
      </h1>
      <template #button>
        <ScrollDownSVG v-page-fade:left />
      </template>
    </HeroSection>

    <!-- Additional page content below hero -->
    <div class="content-grid pt-[var(--space-2xl)]">
      <div class="breakout2">
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
          <p>
            ScrollSmoother is active on all pages for a consistent experience.
          </p>
        </div>

        <div class="spacer"></div>
      </div>
    </div>
  </div>
</template>
