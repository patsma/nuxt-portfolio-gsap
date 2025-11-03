<template>
  <section key="test-page" aria-labelledby="test-heading">
    <h1 id="test-heading" class="sr-only">Test</h1>

    <!-- Clients Section Test -->
    <ClientsSection>
      <template #label>Clients</template>
      <template #primary-clients>
        <p>
          Carlsberg, Coop (Irma, SuperBrugsen, Fakta), Lundbech Foundation, Maj
          Bank/Invest, Maanesten, Molio, New Carlsberg Foundation, Novo Nordisk
          Foundation, TNT
        </p>
      </template>
      <template #secondary-clients>
        <p>
          Arkyn, Begravelse Danmark, Bibelselskabet, Bilka, BreathingBusiness,
          Copenhagen Segway, Dansk Markedsføring, Danske Spil, eSmiley, FIF
          Håndbold, FitnessDK, Fonden for Socialt Ansvar, Fonda, FoodWaste,
          Haveselskabet, Independo, Isaaffik, Karen Tobiasen, Klarlund,
          Kulturtjenesten, Kunstens Veje, Københavns Håndbold, Københavns
          Kommune, Langelinie Outlet, LevendeStreg, MS Branding, Needit,
          Neurotorium, Nixu, Novo Nordisk Foundation (August Krogh,
          BioInnovation Institute, Data Science, Impact Assessment, LIFE, New
          Carlsberg Foundation, Novo Holdings, ScienceNews), Pergo, Spirii,
          SpotTheSpy, Storebælt, Sydsjællandspoliti, Toftkobber, WMHD
        </p>
      </template>
    </ClientsSection>

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
