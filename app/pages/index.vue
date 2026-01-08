<script setup lang="ts">
// Content-driven components from components/content/
import HeroSection from '~/components/content/HeroSection.vue'
import CaseStudyGrid from '~/components/content/CaseStudyGrid.vue'
</script>

<template>
  <div>
    <!-- 1. Hero Section - Content-driven from data/hero/home.yml -->
    <HeroSection hero-id="home" />

    <!-- 2. Video from left -->
    <VideoScalingSection
      video-src="/assets/dummy/sample1.mp4"
      poster-src="/assets/dummy/placeholder.jpg"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="180%"
      start-position="left"
    />

    <!-- 3. Case Study Grid - Content-driven from data/case-studies.yml -->
    <CaseStudyGrid />
  </div>
</template>
