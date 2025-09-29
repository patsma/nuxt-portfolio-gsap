<template>
  <div id="smooth-wrapper" class="min-h-screen">
    <NuxtLoadingIndicator
      :height="6"
      color="#0089d0"
      style="top: auto; bottom: 0"
    />
    <!--
    Default layout with GSAP ScrollSmoother structure.
    - Keeps fixed UI outside transformed content to avoid position:fixed issues
    - Provides #smooth-wrapper and #smooth-content for the plugin to hook into
  -->
    <!-- Accessible skip link: appears on focus to bypass repetitive content -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded"
    >
      Skip to main content
    </a>

    <!-- Visible, semantic site header (fixed outside #smooth-content for GSAP) -->
    <header role="banner" aria-label="Site header">
      <HeaderGrid />
    </header>

    <div id="smooth-content" :key="route.fullPath">
      <!-- Use landmark roles and a main heading region -->

      <main id="main-content" class="header-safe-top" role="main" tabindex="-1">
        <slot />
      </main>

      <footer role="contentinfo" class="sr-only">
        <p class="sr-only">© TastySites</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
</script>
