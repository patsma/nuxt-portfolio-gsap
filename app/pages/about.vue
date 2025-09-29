<template>
  <div class="pt-header">
    <h1 class="sr-only">About</h1>

    <SmoothDemo />

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
