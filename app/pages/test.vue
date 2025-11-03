<template>
  <section key="test-page" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test</h1>

    <!-- Clients Section Test -->
  

    <!-- Recommendations Section Test -->
    <RecommendationsSection>
      <template #label>Recommendations</template>

      <RecommendationItem
        id="rec-1"
        :index="0"
        quote="An extraordinary individual"
        full-recommendation="I worked closely with Morten for almost three years while building an ambitious creative digital agency with Morten as a key player in executing on our most prominent digital design solutions.

Morten is always on the lookout for what's next and has a strong eye for spotting design trends and capturing the visual DNA of clients on all levels.

I have always been impressed by the speed and thoroughness that Morten shows in all projects he is a part of."
        author-first-name="Thomas"
        author-last-name="Rømhild"
        author-title="CEO, Bærnholdt"
        author-image="/assets/dummy/placeholder.jpg"
      />

      <RecommendationItem
        id="rec-2"
        :index="1"
        quote="I understood once & for all"
        full-recommendation="Morten's user-centric approach significantly improved our platform's usability and conversion rates. His attention to detail and ability to translate complex requirements into intuitive designs has been invaluable to our product development process."
        author-first-name="Jesper"
        author-last-name="Geldø Hansen"
        author-title="UX Writer, Microsoft"
        author-image="/assets/dummy/placeholder2.jpg"
      />

      <RecommendationItem
        id="rec-3"
        :index="2"
        quote="A talented passionate designer"
        full-recommendation="Working with Morten was a game-changer for our digital transformation. His creative vision and technical expertise helped us reimagine our entire user experience. He consistently delivered exceptional work that exceeded our expectations."
        author-first-name="Mikkel"
        author-last-name="Kreiner"
        author-title="CTO, Arkyn"
        author-image="/assets/dummy/placeholder3.jpg"
      />

      <RecommendationItem
        id="rec-4"
        :index="3"
        quote="Fast and efficient at work and colleagues"
        full-recommendation="Morten brings an incredible combination of strategic thinking and hands-on design skills. His ability to understand business objectives and translate them into compelling user experiences sets him apart. A true professional in every sense."
        author-first-name="Rune"
        author-last-name="Brændholt"
        author-title="Partner, Bærnholdt"
        author-image="/assets/dummy/placeholder1.jpg"
      />
    </RecommendationsSection>

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
