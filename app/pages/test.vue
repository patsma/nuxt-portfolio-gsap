<template>
  <section key="test-page" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test</h1>

    <!-- Experience Section Test -->
    <ExperienceSection view-more-text="View all" view-more-to="/about">
      <ExperienceItem
        date-range="2023 – Current"
        title="Senior UX/UI Designer"
        company="TCS"
        location="Tokyo"
      />
      <ExperienceItem
        date-range="2020 – 2023"
        title="Lead/Senior Digital Designer"
        company="Bærnholdt"
        location="Copenhagen"
      />
      <ExperienceItem
        date-range="2018 – 2020"
        title="Senior UX/UI Designer"
        company="Pointvoucher"
        location="Copenhagen"
      />
    </ExperienceSection>

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
