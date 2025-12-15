<template>
  <!--
    Icon usage examples with theme-aware colors
    - Follows content-grid layout system
    - Uses CSS-based hover (no GSAP needed)
    - Demonstrates Nuxt Icon integration with design system
    - Subtle scroll effects for visual interest
  -->
  <section
    class="w-full"
    aria-labelledby="icon-demo-heading"
  >
    <div class="content-grid">
      <div class="breakout3 py-[var(--space-l)] md:py-[var(--space-xl)] grid gap-[var(--space-2xl)]">
        <!-- Section Header -->
        <header
          class="text-center grid gap-[var(--space-xs)]"
          data-speed="0.98"
        >
          <h2
            id="icon-demo-heading"
            class="pp-eiko-mobile-h2 md:pp-eiko-desktop-h2 text-[var(--theme-text-100)]"
          >
            Icon System
          </h2>
          <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]">
            Theme-aware icons that inherit colors and scale with text
          </p>
        </header>

        <!-- Basic icon usage -->
        <div
          class="max-w-3xl mx-auto"
          data-speed="1.02"
        >
          <h3 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Basic Icons (inherit color from parent)
          </h3>
          <div class="flex gap-[var(--space-l)] items-center flex-wrap">
            <span class="text-[var(--theme-text-100)] flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-mobile-p1 leading-none">
              <Icon
                name="heroicons:home-20-solid"
                class="icon icon-base shrink-0"
              />
              Home
            </span>
            <span class="text-[var(--theme-text-60)] flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-mobile-p1 leading-none">
              <Icon
                name="heroicons:heart-20-solid"
                class="icon icon-base shrink-0"
              />
              Favorite
            </span>
            <span class="text-[var(--theme-text-50)] flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-mobile-p1 leading-none">
              <Icon
                name="heroicons:star-20-solid"
                class="icon icon-base shrink-0"
              />
              Star
            </span>
          </div>
        </div>

        <!-- Icon sizes -->
        <div
          class="max-w-3xl mx-auto"
          data-speed="0.96"
        >
          <h3 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Icon Sizes (em-based, scales with text)
          </h3>
          <div class="flex gap-[var(--space-m)] items-center flex-wrap">
            <Icon
              name="heroicons:cube-20-solid"
              class="icon icon-xs icon-100"
            />
            <Icon
              name="heroicons:cube-20-solid"
              class="icon icon-sm icon-100"
            />
            <Icon
              name="heroicons:cube-20-solid"
              class="icon icon-base icon-100"
            />
            <Icon
              name="heroicons:cube-20-solid"
              class="icon icon-lg icon-100"
            />
            <Icon
              name="heroicons:cube-20-solid"
              class="icon icon-xl icon-100"
            />
            <Icon
              name="heroicons:cube-20-solid"
              class="icon icon-2xl icon-100"
            />
          </div>
        </div>

        <!-- Icon opacity variants -->
        <div
          class="max-w-3xl mx-auto"
          data-speed="1.04"
        >
          <h3 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Icon Opacity Variants
          </h3>
          <div class="flex gap-[var(--space-m)] items-center flex-wrap">
            <Icon
              name="heroicons:light-bulb-20-solid"
              class="icon icon-xl icon-100"
            />
            <Icon
              name="heroicons:light-bulb-20-solid"
              class="icon icon-xl icon-60"
            />
            <Icon
              name="heroicons:light-bulb-20-solid"
              class="icon icon-xl icon-50"
            />
            <Icon
              name="heroicons:light-bulb-20-solid"
              class="icon icon-xl icon-40"
            />
          </div>
        </div>

        <!-- Icons in links -->
        <div
          class="max-w-3xl mx-auto"
          data-speed="0.97"
        >
          <h3 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Icons in Links (CSS hover)
          </h3>
          <div class="flex gap-[var(--space-m)] flex-wrap">
            <a
              href="#"
              class="nav-link text-[var(--theme-text-100)] flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-mobile-p1"
              :data-active="false"
            >
              <Icon
                name="heroicons:arrow-right-20-solid"
                class="icon icon-base"
              />
              <span>Next Page</span>
            </a>
            <a
              href="#"
              class="nav-link text-[var(--theme-text-100)] flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-mobile-p1"
              :data-active="false"
            >
              <Icon
                name="heroicons:document-text-20-solid"
                class="icon icon-base"
              />
              <span>View Docs</span>
            </a>
            <a
              href="#"
              class="nav-link text-[var(--theme-text-100)] flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-mobile-p1"
              :data-active="false"
            >
              <Icon
                name="heroicons:code-bracket-20-solid"
                class="icon icon-base"
              />
              <span>Source Code</span>
            </a>
          </div>
        </div>

        <!-- Icons with backgrounds -->
        <div
          class="max-w-3xl mx-auto"
          data-speed="1.03"
        >
          <h3 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Icons on Colored Backgrounds
          </h3>
          <div class="grid gap-[var(--space-s)]">
            <div class="flex items-center gap-[var(--space-s)] p-[var(--space-s)] bg-[var(--theme-5)] rounded-lg">
              <Icon
                name="heroicons:information-circle-20-solid"
                class="icon icon-lg icon-100"
              />
              <span class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-p1">Information message with icon</span>
            </div>
            <div class="flex items-center gap-[var(--space-s)] p-[var(--space-s)] bg-[var(--theme-15)] rounded-lg">
              <Icon
                name="heroicons:check-circle-20-solid"
                class="icon icon-lg icon-100"
              />
              <span class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-p1">Success message with icon</span>
            </div>
            <div class="flex items-center gap-[var(--space-s)] p-[var(--space-s)] bg-[var(--theme-30)] rounded-lg">
              <Icon
                name="heroicons:exclamation-triangle-20-solid"
                class="icon icon-lg icon-100"
              />
              <span class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-p1">Warning message with icon</span>
            </div>
          </div>
        </div>

        <!-- Icon buttons -->
        <div
          class="max-w-3xl mx-auto"
          data-speed="0.99"
        >
          <h3 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Icon Buttons (CSS hover)
          </h3>
          <div class="flex gap-[var(--space-s)] flex-wrap">
            <button
              class="nav-link p-[var(--space-s)] bg-[var(--theme-15)] rounded-md text-[var(--theme-text-100)]"
              :data-active="false"
              aria-label="Play"
            >
              <Icon
                name="heroicons:play-20-solid"
                class="icon icon-base"
              />
            </button>
            <button
              class="nav-link p-[var(--space-s)] bg-[var(--theme-15)] rounded-md text-[var(--theme-text-100)]"
              :data-active="false"
              aria-label="Pause"
            >
              <Icon
                name="heroicons:pause-20-solid"
                class="icon icon-base"
              />
            </button>
            <button
              class="nav-link p-[var(--space-s)] bg-[var(--theme-15)] rounded-md text-[var(--space-text-100)]"
              :data-active="false"
              aria-label="Forward"
            >
              <Icon
                name="heroicons:forward-20-solid"
                class="icon icon-base"
              />
            </button>
            <button
              class="nav-link p-[var(--space-s)] bg-[var(--theme-15)] rounded-md text-[var(--theme-text-100)]"
              :data-active="false"
              aria-label="Backward"
            >
              <Icon
                name="heroicons:backward-20-solid"
                class="icon icon-base"
              />
            </button>
          </div>
        </div>

        <!-- Large decorative icons -->
        <div
          class="max-w-3xl mx-auto"
          data-speed="1.01"
        >
          <h3 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Large Decorative Icons
          </h3>
          <div class="flex gap-[var(--space-xl)] items-center justify-center p-[var(--space-xl)] bg-[var(--theme-5)] rounded-xl flex-wrap">
            <Icon
              name="heroicons:rocket-launch-20-solid"
              class="icon icon-60"
              style="font-size: 4rem;"
            />
            <Icon
              name="heroicons:sparkles-20-solid"
              class="icon icon-60"
              style="font-size: 4rem;"
            />
            <Icon
              name="heroicons:fire-20-solid"
              class="icon icon-60"
              style="font-size: 4rem;"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Define component name for better DevTools debugging
defineOptions({
  name: 'IconDemo'
})

// NOTE: All hover effects are handled by CSS via .nav-link class (see base.scss)
// This follows the theme system's CSS-based approach for better performance
// Scroll effects use subtle data-speed values (0.96-1.04) for gentle motion
</script>

<!-- TailwindCSS only: No scoped styles -->
