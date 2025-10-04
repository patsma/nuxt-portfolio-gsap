<template>
  <div class="header-safe-top">
    <h1 class="sr-only">About</h1>

    <SmoothDemo />
    <IconDemo />
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
