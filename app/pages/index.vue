<template>
  <div class="pt-header">
    <h1 class="sr-only">Home</h1>
    <!-- Alternative layout demo for ScrollSmoother on the homepage -->
    <SmoothDemoAlt />
  </div>
</template>

<script setup>
useHead({
  title: "Home",
  meta: [
    {
      name: "description",
      content:
        "Homepage smooth scrolling demo with an alternative Tailwind layout for testing.",
    },
  ],
});
</script>
