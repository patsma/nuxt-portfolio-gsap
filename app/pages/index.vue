<script setup lang="ts">
import HeroSection from "~/components/HeroSection.vue";
import ScrollDownSVG from "~/components/SVG/ScrollDownSVG.vue";

const services = [
  "ART DIRECTION",
  "CREATIVE DIRECTION",
  "CONCEPT DEVELOPMENT",
  "CONSULTING & GUIDANCE",
  "USER EXPERIENCE DESIGN (UX)",
  "DIGITAL DESIGN (UI)",
  "INTERACTIVE DESIGN",
  "DESIGN SYSTEMS & TOKENS",
];
</script>

<template>
  <div>
    <HeroSection>
      <!-- Main hero text with mixed opacity and font styling -->
      <h1
        v-page-split:lines="{ animateFrom: 'below' }"
        class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter"
      >
        <span class="text-[var(--theme-text-60)]">Welcome, I am</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> Morten</span>
        <span class="text-[var(--theme-text-60)]"> – a</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> Danish</em>
        <span class="text-[var(--theme-text-100)] font-body font-[300]">
          designer</span
        >
        <span class="text-[var(--theme-text-60)]"> based in</span>
        <span class="text-[var(--theme-text-100)] font-[300]"> Tokyo</span>
        <span class="text-[var(--theme-text-60)]">
          approaching today's challenges with a</span
        >
        <span class="text-[var(--theme-text-100)] font-body font-[300]">
          digital</span
        >
        <em class="text-[var(--theme-text-100)] italic font-[300]">-first</em>
        <span class="text-[var(--theme-text-60)]"> and</span>
        <span class="text-[var(--theme-text-100)] font-body font-[300]">
          user</span
        >
        <em class="text-[var(--theme-text-100)] italic font-[300]">-centred</em>
        <span class="text-[var(--theme-text-60)]"> mindset</span>
      </h1>

      <!-- Services list with tag styling -->
      <template #services>
        <nav class="services-list pt-10 md:pt-0" aria-label="Services">
          <div
            data-speed="0.95"
            v-page-stagger="{ stagger: 0.08, duration: 0.5 }"
            class="flex flex-wrap gap-2 max-w-3xl"
          >
            <div class="tag-label">Services</div>
            <div v-for="service in services" :key="service" class="tag">
              {{ service }}
            </div>
          </div>
        </nav>
      </template>

      <!-- Scroll down button (right side on desktop) -->
      <template #button>
        <ScrollDownSVG data-speed="1" v-page-fade:left />
      </template>
    </HeroSection>
    <ImageScalingSection
      image-src="/assets/dummy/placeholder.jpg"
      image-alt="Hero image showcasing the product"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="120%"
      start-position="right"
    />
    <VideoScalingSection
      video-src="/assets/dummy/sample1.mp4"
      poster-src="/assets/dummy/placeholder.jpg"
      :start-scale="0.25"
      :end-scale="1"
      scroll-amount="180%"
      start-position="left"
    />
  </div>
</template>
