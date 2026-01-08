<script setup lang="ts">
// Content-driven components from components/content/
import HeroSection from '~/components/content/HeroSection.vue'
import BiographyGrid from '~/components/content/BiographyGrid.vue'
import ExperienceGrid from '~/components/content/ExperienceGrid.vue'
import ServicesGrid from '~/components/content/ServicesGrid.vue'
import ClientsGrid from '~/components/content/ClientsGrid.vue'
import AwardsGrid from '~/components/content/AwardsGrid.vue'
import RecommendationsGrid from '~/components/content/RecommendationsGrid.vue'
</script>

<template>
  <div>
    <!-- 1. Hero Section - Content-driven from data/hero/about.yml -->
    <HeroSection hero-id="about" />

    <!-- 2. Biography Section - Content-driven from data/biography/about.yml -->
    <BiographyGrid biography-id="about" />

    <!-- 3. Experience Section - Content-driven from data/experience.yml -->
    <ExperienceGrid
      view-more-text="View all"
      view-more-to="/about"
    />

    <!-- 4. Image from left -->
    <ImageScalingSection
      image-src="/assets/dummy/placeholder.jpg"
      image-alt="Portfolio image"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="120%"
      start-position="left"
    />

    <!-- 5. Spacer -->
    <div class="h-20" />

    <!-- 6. Image from right -->
    <ImageScalingSection
      image-src="/assets/dummy/placeholder2.jpg"
      image-alt="Portfolio image"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="120%"
      start-position="right"
    />

    <!-- 7. Services Section - Content-driven from data/services.yml -->
    <ServicesGrid />

    <!-- 8. Clients Section - Content-driven from data/clients.yml -->
    <ClientsGrid />

    <!-- 9. Awards & Recognition Section - Content-driven from data/awards.yml -->
    <AwardsGrid />

    <!-- 10. Recommendations Section - Content-driven from data/recommendations.yml -->
    <RecommendationsGrid />

    <!-- 11. Image from left -->
    <ImageScalingSection
      image-src="/assets/dummy/placeholder3.jpg"
      image-alt="Portfolio image"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="120%"
      start-position="left"
    />

    <!-- 12. Spacer -->
    <div class="h-20" />

    <!-- 13. Image from right -->
    <ImageScalingSection
      image-src="/assets/dummy/placeholder1.jpg"
      image-alt="Portfolio image"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="120%"
      start-position="right"
    />
  </div>
</template>
