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

    <!-- Spacer -->
    <div class="h-[30vh]"></div>

    <!-- Parallax Tests -->
    <div class="content-grid">
      <div class="breakout3 grid gap-[var(--space-4xl)]">
        <!-- Image Parallax -->
        <section class="grid gap-[var(--space-l)]">
          <h2
            class="font-display text-4xl text-[var(--theme-text-100)] tracking-tight"
          >
            Image Parallax
          </h2>
          <!-- Wrapper controls height -->
          <div class="h-[60vh] rounded-lg">
            <!-- Container fills wrapper (100%) -->
            <div class="parallax-container">
              <!-- Image is 120% of container -->
              <img
                src="/assets/dummy/placeholder2.jpg"
                data-speed="auto"
                class="parallax-media"
                alt="Parallax test image"
              />
            </div>
          </div>
        </section>

        <!-- Spacer -->
        <div class="h-[40vh]"></div>

        <!-- Video Parallax -->
        <section class="grid gap-[var(--space-l)]">
          <h2
            class="font-display text-4xl text-[var(--theme-text-100)] tracking-tight"
          >
            Video Parallax
          </h2>
          <!-- Wrapper controls height -->
          <div class="h-[60vh] rounded-lg">
            <!-- Container fills wrapper (100%) -->
            <div class="parallax-container">
              <!-- Video is 120% of container -->
              <video
                src="/assets/dummy/sample1.mp4"
                data-speed="auto"
                class="parallax-media w-full"
                autoplay
                loop
                muted
                playsinline
              />
            </div>
          </div>
        </section>

        <!-- Spacer -->
        <div class="h-[50vh]"></div>
      </div>
    </div>
  </div>
</template>
