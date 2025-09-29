<template>
  <section key="test-page" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test</h1>
    <!-- Minimal SmoothSmoother demo using Tailwind-only styles -->
    <SmoothDemo />
  </section>
</template>
<script setup>
useHead({
  title: "Test",
  meta: [
    {
      name: "description",
      content:
        "Explore TastySites’ interactive components, animations, and recent work on the test page.",
    },
  ],
});
// Use default layout so ScrollSmoother structure (#smooth-wrapper / #smooth-content) is present
definePageMeta({ layout: "default" });
</script>
