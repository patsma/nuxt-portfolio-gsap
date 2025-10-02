<template>
  <!-- Alternative SmoothSmoother demo using token-driven layout/typography -->
  <section aria-labelledby="alt-smooth-heading" class="w-full">
    <div class="content-grid">
      <div
        class="breakout3 py-[var(--space-l)] md:py-[var(--space-xl)] grid gap-[var(--space-xl)]"
      >
        <header class="text-center grid gap-[var(--space-xs)]">
          <h2
            id="alt-smooth-heading"
            class="pp-eiko-mobile-h2 md:pp-eiko-desktop-h2 text-[var(--theme-text-100)]"
            data-speed="1.04"
          >
            Smooth Demo (Alt Layout)
          </h2>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)]"
            data-speed="0.96"
          >
            Testing all color opacity variants with theme switching
          </p>
        </header>

        <!-- Block A: Image left, text right -->
        <div
          class="grid items-center gap-[var(--space-l)] md:gap-[var(--space-xl)] md:grid-cols-2"
        >
          <figure class="order-1" aria-label="Wide demo image">
            <NuxtImg
              src="/og.jpg"
              alt="Sample wide image"
              class="w-full h-auto rounded-md object-cover shadow-md"
              width="1200"
              height="630"
              sizes="sm:100vw md:60vw lg:50vw"
              format="webp"
              loading="eager"
              decoding="async"
              data-speed="auto"
              data-lag="0.25"
            />
            <figcaption
              class="mt-[var(--space-2xs)] ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
              data-speed="1.02"
            >
              Wide image with auto speed and small lag
            </figcaption>
          </figure>

          <article class="order-2 grid gap-[var(--space-s)]">
            <h3
              class="ibm-plex-sans-jp-mobile-p2 font-medium text-[var(--theme-text-100)]"
              data-speed="0.97"
            >
              Text Opacity: 100%, 60%, 50%
            </h3>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-100)]"
              data-speed="1.06"
            >
              <strong>100%:</strong> This layout uses a simple grid. The image on the left moves
              slightly differently than the text on the right, creating a subtle
              depth effect while scrolling.
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)]"
              data-speed="0.94"
            >
              <strong>60%:</strong> Tailwind utilities provide spacing and typography. No component
              logic is required. The ScrollSmoother plugin picks up the
              data-speed/data-lag attributes automatically.
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-50)]"
              data-speed="1.02"
            >
              <strong>50%:</strong> All colors smoothly animate when you toggle the theme.
            </p>
          </article>
        </div>

        <!-- Block B: Text left, image right -->
        <div
          class="grid items-center gap-[var(--space-l)] md:gap-[var(--space-xl)] md:grid-cols-2"
        >
          <article class="order-2 md:order-1 grid gap-[var(--space-s)]">
            <h3 class="font-body text-step-2 font-medium text-[var(--theme-text-100)]" data-speed="1.03">
              More Opacity Variants
            </h3>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-40)]"
              data-speed="0.95"
            >
              <strong class="text-[var(--theme-text-100)]">40%:</strong> Here we reverse the grid order on large screens to verify effects
              in different content flows. Try toggling the theme to see smooth color transitions.
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-30)]"
              data-speed="1.05"
            >
              <strong class="text-[var(--theme-text-100)]">30%:</strong> You can tweak the numbers (e.g., 0.9 or 1.1) if you need stronger
              motion. Keep values close to 1.0 for subtlety.
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-15)]"
              data-speed="0.97"
            >
              <strong class="text-[var(--theme-text-100)]">15%:</strong> Very subtle, perfect for secondary information.
            </p>

            <!-- Background examples -->
            <div class="mt-[var(--space-s)] grid gap-[var(--space-2xs)]">
              <div class="p-[var(--space-xs)] bg-[var(--theme-5)] border border-[var(--theme-text-15)] rounded">
                <span class="text-[var(--theme-text-100)] text-xs">5% bg</span>
              </div>
              <div class="p-[var(--space-xs)] bg-[var(--theme-15)] border border-[var(--theme-text-15)] rounded">
                <span class="text-[var(--theme-text-100)] text-xs">15% bg</span>
              </div>
              <div class="p-[var(--space-xs)] bg-[var(--theme-30)] border border-[var(--theme-text-15)] rounded">
                <span class="text-[var(--theme-text-100)] text-xs">30% bg</span>
              </div>
            </div>
          </article>

          <figure class="order-1 md:order-2" aria-label="Icon demo image">
            <NuxtImg
              src="/icon.png"
              alt="Nuxt icon"
              class="w-full max-w-lg mx-auto h-auto rounded-md object-cover shadow-lg"
              width="1024"
              height="1024"
              sizes="sm:100vw md:50vw lg:40vw"
              format="webp"
              loading="lazy"
              decoding="async"
              data-speed="auto"
              data-lag="0.15"
            />
            <figcaption
              class="mt-[var(--space-2xs)] text-center ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
              data-speed="1.0"
            >
              Icon with a lighter lag value
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No component logic necessary. GSAP ScrollSmoother reads data attributes.
// Accessibility: aria-labelledby ties the section to the heading.
</script>

<!-- Tailwind-only styles -->
