<template>
  <main class="p-6 md:p-8 lg:p-12">
    <section class="space-y-10">
      <div v-for="family in families" :key="family.name">
        <h2 class="mb-4 text-xl font-medium text-stone-700">
          {{ family.name }}
        </h2>
        <ul class="grid gap-4">
          <li
            v-for="style in family.styles"
            :key="style.label"
            class="p-4 rounded-lg border border-black/10"
          >
            <div class="text-xs text-stone-600 mb-1">
              {{ style.label }} • class: <code>{{ style.class }}</code>
            </div>
            <p :class="style.class">
              The quick brown fox jumps over the lazy dog.
            </p>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup>
// Reusable template: list font families and their utility classes
const families = [
  {
    name: "PP Eiko",
    styles: [
      { label: "Mobile/H1", class: "pp-eiko-mobile-h1" },
      { label: "Mobile/H1 bold", class: "pp-eiko-mobile-h1-bold" },
      { label: "Mobile/H1 italic", class: "pp-eiko-mobile-h1-italic" },
      { label: "Mobile/H2", class: "pp-eiko-mobile-h2" },
      { label: "Mobile/H2 enlarged", class: "pp-eiko-mobile-h2-enlarged" },
      {
        label: "Mobile/H2 enlarged italic",
        class: "pp-eiko-mobile-h2-enlarged-italic",
      },
      { label: "Mobile/H3", class: "pp-eiko-mobile-h3" },
      { label: "Mobile/H3 italic", class: "pp-eiko-mobile-h3-italic" },
      { label: "Mobile/H3 enlarged", class: "pp-eiko-mobile-h3-enlarged" },
      {
        label: "Mobile/Custom/Navigation Menu-items",
        class: "pp-eiko-mobile-custom-navigation-menu-items",
      },
      { label: "Laptop/H1", class: "pp-eiko-laptop-h1" },
      { label: "Laptop/H1 bold", class: "pp-eiko-laptop-h1-bold" },
      { label: "Laptop/H1 italic", class: "pp-eiko-laptop-h1-italic" },
      { label: "Laptop/H2", class: "pp-eiko-laptop-h2" },
      { label: "Laptop/H2 enlarged", class: "pp-eiko-laptop-h2-enlarged" },
      {
        label: "Laptop/H2 enlarged italic",
        class: "pp-eiko-laptop-h2-enlarged-italic",
      },
      { label: "Laptop/H3 enlarged", class: "pp-eiko-laptop-h3-enlarged" },
      { label: "Desktop/H1", class: "pp-eiko-desktop-h1" },
      { label: "Desktop/H1 bold", class: "pp-eiko-desktop-h1-bold" },
      { label: "Desktop/H1 italic", class: "pp-eiko-desktop-h1-italic" },
      { label: "Desktop/H2", class: "pp-eiko-desktop-h2" },
      { label: "Desktop/H2 enlarged", class: "pp-eiko-desktop-h2-enlarged" },
      {
        label: "Desktop/H2 enlarged italic",
        class: "pp-eiko-desktop-h2-enlarged-italic",
      },
      { label: "Desktop/H3", class: "pp-eiko-desktop-h3" },
      { label: "Desktop/H3 italic", class: "pp-eiko-desktop-h3-italic" },
      { label: "Desktop/H3 enlarged", class: "pp-eiko-desktop-h3-enlarged" },
      {
        label: "Desktop/Custom/Navigation",
        class: "pp-eiko-desktop-custom-navigation",
      },
      { label: "Desktop large/H2", class: "pp-eiko-desktop-large-h2" },
    ],
  },
];
</script>
