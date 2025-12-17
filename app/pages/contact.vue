<script setup lang="ts">
import HeroSection from '~/components/HeroSection.vue'
import ScrollButtonSVG from '~/components/SVG/ScrollButtonSVG.vue'
</script>

<template>
  <div>
    <!-- Hero section with contact copy -->
    <HeroSection>
      <h1
        v-page-split:lines="{ animateFrom: 'below' }"
        data-speed="0.8"
        class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter"
      >
        <span class="text-[var(--theme-text-60)]">Feel</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> free</em>
        <span class="text-[var(--theme-text-60)]">
          to reach out if you want to</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]">
          collaborate</em>
        <span class="text-[var(--theme-text-60)]">,</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> hire</em>
        <span class="text-[var(--theme-text-60)]">, or simply</span>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> have a</em>
        <em class="text-[var(--theme-text-100)] italic font-[300]"> chat</em>
        <span class="text-[var(--theme-text-60)]"> with me</span>
      </h1>
      <template #button>
        <ScrollButtonSVG v-page-fade:left />
      </template>
    </HeroSection>
  </div>
</template>
