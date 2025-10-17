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
  </div>
</template>
