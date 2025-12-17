<script setup lang="ts">
import HeroSection from '~/components/HeroSection.vue'
import ScrollButtonSVG from '~/components/SVG/ScrollButtonSVG.vue'
import VideoScalingSection from '~/components/VideoScalingSection.vue'
</script>

<template>
  <div>
    <!-- Hero section with different content, NO services -->
    <HeroSection>
      <h1
        v-page-split:lines="{ animateFrom: 'below' }"
        class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter"
      >
        <span class="text-[var(--theme-text-60)]">Driven by a high</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> passion</em>
        <span class="text-[var(--theme-text-60)]"> for design, I craft</span>
        <span class="text-[var(--theme-text-60)]">
          compelling solutions backed by</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> insights</span>
        <span class="text-[var(--theme-text-60)]"> and</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> real data</span>
        <span class="text-[var(--theme-text-60)]"> to ensure a</span>
        <span class="text-[var(--theme-text-60)]"> meaningful</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> journey</em>
        <span class="text-[var(--theme-text-60)]"> and an</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> engaging</span>
        <span class="text-[var(--theme-text-60)]"> end-product</span>
      </h1>
      <template #button>
        <ScrollButtonSVG v-page-fade:left />
      </template>
    </HeroSection>

    <!-- Video Scaling Section -->
    <VideoScalingSection
      video-src="/assets/dummy/sample1.mp4"
      poster-src="/assets/dummy/placeholder.jpg"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="180%"
      start-position="left"
    />

    <!-- Footer Hero Section - Scroll-triggered variant for testing -->
  </div>
</template>
