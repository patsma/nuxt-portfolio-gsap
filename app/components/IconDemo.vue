<template>
  <!--
    Icon usage examples with theme-aware colors
    Demonstrates Nuxt Icon integration with design system
  -->
  <div class="grid gap-[var(--space-l)]">
    <!-- Basic icon usage -->
    <section>
      <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-s)]">
        Basic Icons (inherit color from parent)
      </h3>
      <div class="flex gap-[var(--space-m)] items-center flex-wrap">
        <span class="text-[var(--theme-text-100)]">
          <Icon name="heroicons:home-20-solid" class="icon icon-base" />
          Home
        </span>
        <span class="text-[var(--theme-text-60)]">
          <Icon name="heroicons:heart-20-solid" class="icon icon-base" />
          Favorite
        </span>
        <span class="text-[var(--theme-text-50)]">
          <Icon name="heroicons:star-20-solid" class="icon icon-base" />
          Star
        </span>
      </div>
    </section>

    <!-- Icon sizes -->
    <section>
      <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-s)]">
        Icon Sizes (em-based, scales with text)
      </h3>
      <div class="flex gap-[var(--space-m)] items-center flex-wrap">
        <Icon name="heroicons:cube-20-solid" class="icon icon-xs icon-100" />
        <Icon name="heroicons:cube-20-solid" class="icon icon-sm icon-100" />
        <Icon name="heroicons:cube-20-solid" class="icon icon-base icon-100" />
        <Icon name="heroicons:cube-20-solid" class="icon icon-lg icon-100" />
        <Icon name="heroicons:cube-20-solid" class="icon icon-xl icon-100" />
        <Icon name="heroicons:cube-20-solid" class="icon icon-2xl icon-100" />
      </div>
    </section>

    <!-- Icon opacity variants -->
    <section>
      <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-s)]">
        Icon Opacity Variants
      </h3>
      <div class="flex gap-[var(--space-m)] items-center flex-wrap">
        <Icon name="heroicons:light-bulb-20-solid" class="icon icon-xl icon-100" />
        <Icon name="heroicons:light-bulb-20-solid" class="icon icon-xl icon-60" />
        <Icon name="heroicons:light-bulb-20-solid" class="icon icon-xl icon-50" />
        <Icon name="heroicons:light-bulb-20-solid" class="icon icon-xl icon-40" />
      </div>
    </section>

    <!-- Icons in links -->
    <section>
      <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-s)]">
        Icons in Links (with GSAP hover)
      </h3>
      <div class="flex gap-[var(--space-m)] flex-wrap">
        <a href="#" class="nav-link text-[var(--theme-text-100)] flex items-center gap-[var(--space-2xs)]" :data-active="false">
          <Icon name="heroicons:arrow-right-20-solid" class="icon icon-base" />
          <span>Next Page</span>
        </a>
        <a href="#" class="nav-link text-[var(--theme-text-100)] flex items-center gap-[var(--space-2xs)]" :data-active="false">
          <Icon name="heroicons:document-text-20-solid" class="icon icon-base" />
          <span>View Docs</span>
        </a>
        <a href="#" class="nav-link text-[var(--theme-text-100)] flex items-center gap-[var(--space-2xs)]" :data-active="false">
          <Icon name="heroicons:code-bracket-20-solid" class="icon icon-base" />
          <span>Source Code</span>
        </a>
      </div>
    </section>

    <!-- Icons with backgrounds -->
    <section>
      <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-s)]">
        Icons on Colored Backgrounds
      </h3>
      <div class="grid gap-[var(--space-s)]">
        <div class="flex items-center gap-[var(--space-s)] p-[var(--space-s)] bg-[var(--theme-5)] rounded-lg">
          <Icon name="heroicons:information-circle-20-solid" class="icon icon-lg icon-100" />
          <span class="text-[var(--theme-text-100)]">Information message with icon</span>
        </div>
        <div class="flex items-center gap-[var(--space-s)] p-[var(--space-s)] bg-[var(--theme-15)] rounded-lg">
          <Icon name="heroicons:check-circle-20-solid" class="icon icon-lg icon-100" />
          <span class="text-[var(--theme-text-100)]">Success message with icon</span>
        </div>
        <div class="flex items-center gap-[var(--space-s)] p-[var(--space-s)] bg-[var(--theme-30)] rounded-lg">
          <Icon name="heroicons:exclamation-triangle-20-solid" class="icon icon-lg icon-100" />
          <span class="text-[var(--theme-text-100)]">Warning message with icon</span>
        </div>
      </div>
    </section>

    <!-- Icon buttons -->
    <section>
      <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-s)]">
        Icon Buttons (with GSAP hover)
      </h3>
      <div class="flex gap-[var(--space-s)] flex-wrap">
        <button class="nav-link p-[var(--space-xs)] bg-[var(--theme-15)] rounded-md text-[var(--theme-text-100)]" :data-active="false">
          <Icon name="heroicons:play-20-solid" class="icon icon-base" />
        </button>
        <button class="nav-link p-[var(--space-xs)] bg-[var(--theme-15)] rounded-md text-[var(--theme-text-100)]" :data-active="false">
          <Icon name="heroicons:pause-20-solid" class="icon icon-base" />
        </button>
        <button class="nav-link p-[var(--space-xs)] bg-[var(--theme-15)] rounded-md text-[var(--theme-text-100)]" :data-active="false">
          <Icon name="heroicons:forward-20-solid" class="icon icon-base" />
        </button>
        <button class="nav-link p-[var(--space-xs)] bg-[var(--theme-15)] rounded-md text-[var(--theme-text-100)]" :data-active="false">
          <Icon name="heroicons:backward-20-solid" class="icon icon-base" />
        </button>
      </div>
    </section>

    <!-- Large decorative icons -->
    <section>
      <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-s)]">
        Large Decorative Icons
      </h3>
      <div class="flex gap-[var(--space-l)] items-center justify-center p-[var(--space-xl)] bg-[var(--theme-5)] rounded-xl flex-wrap">
        <Icon name="heroicons:rocket-launch-20-solid" class="icon icon-60" style="font-size: 4rem;" />
        <Icon name="heroicons:sparkles-20-solid" class="icon icon-60" style="font-size: 4rem;" />
        <Icon name="heroicons:fire-20-solid" class="icon icon-60" style="font-size: 4rem;" />
      </div>
    </section>
  </div>
</template>

<script setup>
// GSAP hover animations for icons in links/buttons
const { $gsap } = useNuxtApp();

onMounted(() => {
  if (!$gsap) return;

  nextTick(() => {
    // Read hover duration from CSS
    const html = document.documentElement;
    const hoverDuration = parseFloat(getComputedStyle(html).getPropertyValue("--duration-hover")) / 1000 || 0.3;

    // Setup GSAP hover for all nav-link elements (including icon buttons)
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("data-active") === "true";

      // Set initial opacity
      $gsap.set(link, { opacity: isActive ? 0.5 : 1 });

      // Only add hover for non-active links
      if (!isActive) {
        link.addEventListener("mouseenter", () => {
          $gsap.to(link, {
            opacity: 0.5,
            duration: hoverDuration,
            ease: "power2.inOut",
          });
        });

        link.addEventListener("mouseleave", () => {
          $gsap.to(link, {
            opacity: 1,
            duration: hoverDuration,
            ease: "power2.inOut",
          });
        });
      }
    });
  });
});
</script>
