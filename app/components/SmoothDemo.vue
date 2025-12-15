<template>
  <!--
    Primary ScrollSmoother demo - Interactive showcase
    - Combines scroll effects, typography, icons, and theme system
    - CSS-based hover (no GSAP needed for interactions)
    - Demonstrates all essential UI patterns with theme tokens
  -->
  <section
    class="w-full"
    aria-labelledby="smooth-demo-heading"
  >
    <div class="content-grid">
      <div class="breakout3 py-[var(--space-l)] md:py-[var(--space-xl)]">
        <!-- Page Header with scroll effects -->
        <header
          class="text-center grid gap-[var(--space-xs)] mb-[var(--space-2xl)]"
          data-speed="0.95"
        >
          <h2
            id="smooth-demo-heading"
            class="pp-eiko-mobile-h2 md:pp-eiko-desktop-h2 text-[var(--theme-text-100)]"
          >
            Interactive Demo
          </h2>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)]"
            data-speed="1.05"
          >
            Showcasing theme system, scroll effects, typography, and interactive elements
          </p>
        </header>

        <!-- Navigation with Icons -->
        <section class="mb-[var(--space-2xl)]">
          <h3
            class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]"
            data-speed="0.98"
          >
            Navigation & Links
          </h3>

          <nav
            class="flex gap-[var(--space-m)] flex-wrap mb-[var(--space-l)]"
            data-speed="1.02"
          >
            <a
              v-for="item in navItems"
              :key="item.href"
              v-memo="[item.href, item.label, item.icon]"
              :href="item.href"
              class="pp-eiko-mobile-custom-navigation-menu-items md:pp-eiko-desktop-custom-navigation nav-link text-[var(--theme-text-100)] flex items-center gap-[var(--space-2xs)]"
              :data-active="false"
            >
              <Icon
                :name="item.icon"
                class="icon icon-base"
              />
              {{ item.label }}
            </a>
          </nav>

          <!-- Inline text with links -->
          <div
            class="max-w-3xl"
            data-speed="0.96"
          >
            <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              This paragraph demonstrates <strong>bold</strong>, <em>italic</em>, and
              <a
                href="/dev/colors"
                class="nav-link text-[var(--theme-text-100)]"
                :data-active="false"
              >inline links</a>
              that fade to 50% opacity on hover. The theme system uses CSS variables for
              <a
                href="/dev/typography-test"
                class="nav-link text-[var(--theme-text-100)]"
                :data-active="false"
              >consistent styling</a>
              across all components.
            </p>
          </div>
        </section>

        <!-- Responsive Typography Showcase -->
        <section class="mb-[var(--space-2xl)]">
          <h3
            class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]"
            data-speed="0.97"
          >
            Responsive Typography
          </h3>

          <div class="max-w-3xl">
            <div class="grid gap-[var(--space-l)]">
              <!-- Font family switcher -->
              <div data-speed="1.04">
                <p class="text-[var(--theme-text-40)] text-step-0 mb-[var(--space-2xs)]">
                  Font switching: Body → Display → Body
                </p>
                <p class="font-body md:font-display lg:font-body text-step-3">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>

              <!-- Step utilities switcher -->
              <div data-speed="0.94">
                <p class="text-[var(--theme-text-40)] text-step-0 mb-[var(--space-2xs)]">
                  Size scaling: step-2 → step-5 → step-8
                </p>
                <p class="text-step-2 md:text-step-5 lg:text-step-8 font-display">
                  Fluid responsive sizing
                </p>
              </div>

              <!-- Full style switcher -->
              <div data-speed="1.06">
                <p class="text-[var(--theme-text-40)] text-step-0 mb-[var(--space-2xs)]">
                  Style switching: PP Eiko → IBM → PP Eiko
                </p>
                <p class="pp-eiko-mobile-h2 md:ibm-plex-sans-jp-laptop-h1 lg:pp-eiko-desktop-h2">
                  Typography system in action
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Content Cards with Interactive Buttons -->
        <section class="mb-[var(--space-2xl)]">
          <h3
            class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]"
            data-speed="0.99"
          >
            Cards & Buttons
          </h3>

          <div class="grid gap-[var(--space-m)] md:grid-cols-2">
            <!-- Card 1: Theme System -->
            <article
              class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-xl border border-[var(--theme-text-15)]"
              data-speed="auto"
              data-lag="0.15"
            >
              <div class="flex items-start gap-[var(--space-s)] mb-[var(--space-s)]">
                <Icon
                  name="heroicons:sparkles-20-solid"
                  class="icon icon-xl icon-60"
                />
                <div>
                  <h4 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">
                    Theme System
                  </h4>
                  <p class="ibm-plex-sans-jp-mobile-caption md:ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)]">
                    GSAP-powered color transitions
                  </p>
                </div>
              </div>
              <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-100)] mb-[var(--space-s)]">
                All colors animate smoothly at <code class="px-1 py-0.5 bg-[var(--theme-30)] rounded text-sm">600ms</code>
                when toggling themes. Hover effects use <strong>CSS-based approach</strong> at
                <code class="px-1 py-0.5 bg-[var(--theme-30)] rounded text-sm">300ms</code>.
              </p>
              <a
                href="/dev/colors"
                class="nav-link text-[var(--theme-text-100)] inline-flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-mobile-p1"
                :data-active="false"
              >
                View all colors
                <Icon
                  name="heroicons:arrow-right-20-solid"
                  class="icon icon-sm"
                />
              </a>
            </article>

            <!-- Card 2: Scroll Effects -->
            <article
              class="p-[var(--space-m)] bg-[var(--theme-15)] rounded-xl border border-[var(--theme-text-15)]"
              data-speed="auto"
              data-lag="0.2"
            >
              <div class="flex items-start gap-[var(--space-s)] mb-[var(--space-s)]">
                <Icon
                  name="heroicons:arrows-up-down-20-solid"
                  class="icon icon-xl icon-60"
                />
                <div>
                  <h4 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">
                    Scroll Effects
                  </h4>
                  <p class="ibm-plex-sans-jp-mobile-caption md:ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)]">
                    GSAP ScrollSmoother
                  </p>
                </div>
              </div>
              <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-100)] mb-[var(--space-s)]">
                Uses <code class="px-1 py-0.5 bg-[var(--theme-30)] rounded text-sm">data-speed</code> and
                <code class="px-1 py-0.5 bg-[var(--theme-30)] rounded text-sm">data-lag</code> attributes
                for <em>subtle parallax</em> effects throughout the page.
              </p>
              <a
                href="/dev/responsive"
                class="nav-link text-[var(--theme-text-100)] inline-flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-mobile-p1"
                :data-active="false"
              >
                See responsive
                <Icon
                  name="heroicons:arrow-right-20-solid"
                  class="icon icon-sm"
                />
              </a>
            </article>
          </div>

          <!-- Interactive Buttons -->
          <div
            class="mt-[var(--space-m)]"
            data-speed="1.03"
          >
            <p class="text-[var(--theme-text-60)] text-step-0 mb-[var(--space-s)]">
              Button examples with CSS hover:
            </p>
            <div class="flex gap-[var(--space-s)] flex-wrap">
              <button
                class="nav-link text-[var(--theme-text-100)] px-[var(--space-s)] py-[var(--space-xs)] bg-[var(--theme-15)] rounded-md ibm-plex-sans-jp-mobile-button flex items-center gap-[var(--space-xs)]"
                :data-active="false"
              >
                <Icon
                  name="heroicons:play-20-solid"
                  class="icon icon-base"
                />
                Primary
              </button>
              <button
                class="nav-link text-[var(--theme-text-100)] px-[var(--space-s)] py-[var(--space-xs)] border border-[var(--theme-text-15)] rounded-md ibm-plex-sans-jp-mobile-button flex items-center gap-[var(--space-xs)]"
                :data-active="false"
              >
                <Icon
                  name="heroicons:document-text-20-solid"
                  class="icon icon-base"
                />
                Secondary
              </button>
              <button
                class="nav-link p-[var(--space-xs)] bg-[var(--theme-15)] rounded-full text-[var(--theme-text-100)]"
                :data-active="false"
              >
                <Icon
                  name="heroicons:heart-20-solid"
                  class="icon icon-base"
                />
              </button>
            </div>
          </div>
        </section>

        <!-- Image with Scroll Effect -->
        <section class="mb-[var(--space-2xl)]">
          <h3
            class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]"
            data-speed="0.96"
          >
            Images & Media
          </h3>

          <figure
            class="max-w-3xl mx-auto"
            aria-label="Demo image with parallax"
            data-speed="auto"
            data-lag="0.2"
          >
            <img
              src="/og.jpg"
              alt="TastySites showcase image with parallax effect"
              class="w-full h-auto rounded-lg shadow-lg"
              width="1200"
              height="630"
              loading="eager"
              decoding="async"
            >
            <figcaption
              class="mt-[var(--space-2xs)] text-center ibm-plex-sans-jp-mobile-caption md:ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-40)]"
            >
              Image with parallax effect using <code class="px-1 bg-[var(--theme-15)] rounded text-xs">data-speed="auto"</code> and
              <code class="px-1 bg-[var(--theme-15)] rounded text-xs">data-lag="0.2"</code> on the figure element
            </figcaption>
          </figure>
        </section>

        <!-- Color Opacity Variants -->
        <section class="mb-[var(--space-2xl)]">
          <h3
            class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-m)]"
            data-speed="1.02"
          >
            Color Variants
          </h3>

          <div class="max-w-3xl">
            <div class="grid gap-[var(--space-m)]">
              <!-- Text opacity showcase -->
              <article
                class="grid gap-[var(--space-s)]"
                data-speed="0.94"
              >
                <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  <strong>100% opacity:</strong> Primary text for maximum readability and emphasis.
                </p>
                <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]">
                  <strong>60% opacity:</strong> Secondary text for supporting information.
                </p>
                <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-50)]">
                  <strong class="text-[var(--theme-text-100)]">50% opacity:</strong> Tertiary text for de-emphasized content.
                </p>
                <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-40)]">
                  <strong class="text-[var(--theme-text-100)]">40% opacity:</strong> Muted text for subtle details.
                </p>
                <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-30)]">
                  <strong class="text-[var(--theme-text-100)]">30% opacity:</strong> Very muted for background information.
                </p>
                <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-15)]">
                  <strong class="text-[var(--theme-text-100)]">15% opacity:</strong> Barely visible for dividers.
                </p>
              </article>

              <!-- Background opacity showcase -->
              <div
                class="grid gap-[var(--space-2xs)]"
                data-speed="1.06"
              >
                <p
                  v-once
                  class="text-[var(--theme-text-60)] text-step-0 mb-[var(--space-xs)]"
                >
                  Background variants:
                </p>
                <div
                  v-once
                  class="p-[var(--space-s)] bg-[var(--theme-5)] border border-[var(--theme-text-15)] rounded-md"
                >
                  <p class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-p1">
                    5% background opacity
                  </p>
                </div>
                <div
                  v-once
                  class="p-[var(--space-s)] bg-[var(--theme-15)] border border-[var(--theme-text-15)] rounded-md"
                >
                  <p class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-p1">
                    15% background opacity
                  </p>
                </div>
                <div
                  v-once
                  class="p-[var(--space-s)] bg-[var(--theme-30)] border border-[var(--theme-text-15)] rounded-md"
                >
                  <p class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-p1">
                    30% background opacity
                  </p>
                </div>
                <div
                  v-once
                  class="p-[var(--space-s)] bg-[var(--theme-50)] border border-[var(--theme-text-15)] rounded-md"
                >
                  <p class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-p1">
                    50% background opacity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Define component name for better DevTools debugging
defineOptions({
  name: 'SmoothDemo'
})

// Navigation items with icons
const navItems = [
  { label: 'Home', href: '/', icon: 'heroicons:home-20-solid' },
  { label: 'Typography', href: '/dev/typography-test', icon: 'heroicons:document-text-20-solid' },
  { label: 'Colors', href: '/dev/colors', icon: 'heroicons:swatch-20-solid' },
  { label: 'Responsive', href: '/dev/responsive', icon: 'heroicons:device-phone-mobile-20-solid' }
]

// NOTE: All hover effects are handled by CSS via .nav-link class (see base.scss)
// This follows the theme system's CSS-based approach for better performance
// GSAP ScrollSmoother reads data-speed and data-lag attributes automatically
</script>

<!-- TailwindCSS only: No scoped styles -->
