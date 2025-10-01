<template>
  <!--
    Responsive typography utility sandbox
    - Verifies responsive variants (md:, lg:, xl:) work with our custom @utility classes
    - Demonstrates switching font families and full style utilities across breakpoints
    - Demonstrates switching raw size steps with text-step-* utilities
  -->
  <main class="p-6 md:p-8 lg:p-12 space-y-12">
    <!-- Section: Font family switcher using semantic role utilities -->
    <section class="space-y-2">
      <h2 class="text-step-4 font-display">Font family switcher (semantic)</h2>
      <p class="text-sm text-stone-600">
        Base: font-body → md:font-display → lg:font-body
      </p>
      <p class="font-body md:font-display lg:font-body text-step-3">
        The quick brown fox jumps over the lazy dog.
      </p>
    </section>

    <!-- Section: Full style switcher between IBM ↔ PP Eiko across breakpoints -->
    <section class="space-y-2">
      <h2 class="text-step-4 font-display">Style switcher (IBM ↔ PP Eiko)</h2>
      <p class="text-sm text-stone-600">
        Base: PP Eiko Mobile/H2 → md: IBM Laptop/H1 → lg: PP Eiko Desktop/H2
      </p>
      <p
        class="pp-eiko-mobile-h2 md:ibm-plex-sans-jp-laptop-h1 lg:pp-eiko-desktop-h2"
      >
        The quick brown fox jumps over the lazy dog.
      </p>
    </section>

    <!-- Section: Raw step utilities switching to validate scale and layout sync -->
    <section class="space-y-2">
      <h2 class="text-step-4 font-display">Step utilities switcher</h2>
      <p class="text-sm text-stone-600">
        Base: step-2 → md: step-5 → lg: step-8 → xl: step-11
      </p>
      <p
        class="text-step-2 md:text-step-5 lg:text-step-8 xl:text-step-11 font-body"
      >
        The quick brown fox jumps over the lazy dog.
      </p>
    </section>

    <!-- Section: Body tracking tokens across sizes (IBM caption → IBM caption desktop) -->
    <section class="space-y-2">
      <h2 class="text-step-4 font-display">Body tracking scaling (IBM)</h2>
      <p class="text-sm text-stone-600">
        Base: IBM Mobile/Caption → md: IBM Desktop/Caption
      </p>
      <p
        class="ibm-plex-sans-jp-mobile-caption md:ibm-plex-sans-jp-desktop-caption"
      >
        The quick brown fox jumps over the lazy dog.
      </p>
    </section>

    <!-- Section: Navigation labels with narrow line-heights -->
    <section class="space-y-2">
      <h2 class="text-step-4 font-display">
        Navigation labels (caption/subcaption)
      </h2>
      <div class="grid gap-2">
        <p class="text-sm text-stone-600">Mobile labels → Desktop labels</p>
        <p
          class="ibm-plex-sans-jp-mobile-custom-navigation-caption md:ibm-plex-sans-jp-desktop-custom-navigation-caption"
        >
          Navigation Caption — The quick brown fox
        </p>
        <p
          class="ibm-plex-sans-jp-mobile-custom-navigation-subcaption md:ibm-plex-sans-jp-desktop-custom-navigation-subcaption"
        >
          Navigation Subcaption — The quick brown fox
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
// No script needed for this demo page.
</script>
