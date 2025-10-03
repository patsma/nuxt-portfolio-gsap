<template>
  <div class="header-safe-top bg-[var(--theme-100)]">
    <h1 class="sr-only">About</h1>

    <SmoothDemo />
    <IconDemo />

    <!-- <ProjectPathAnimation /> -->
  </div>
</template>

<script setup>
useHead({
  title: "About",
  meta: [
    {
      name: "description",
      content:
        "Learn about TastySites’ process and approach to crafting interactive experiences.",
    },
  ],
});
</script>
