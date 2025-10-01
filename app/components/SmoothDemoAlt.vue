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
            class="pp-eiko-mobile-h2 md:pp-eiko-desktop-h2"
            data-speed="1.04"
          >
            Smooth Demo (Alt Layout)
          </h2>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--color-stone-600)]"
            data-speed="0.96"
          >
            A simple two-column composition to test ScrollSmoother on another
            page.
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
              class="mt-[var(--space-2xs)] ibm-plex-sans-jp-mobile-caption text-[color:rgb(107_114_128)]"
              data-speed="1.02"
            >
              Wide image with auto speed and small lag
            </figcaption>
          </figure>

          <article class="order-2 grid gap-[var(--space-s)]">
            <h3
              class="ibm-plex-sans-jp-mobile-p2 font-medium"
              data-speed="0.97"
            >
              Clean and minimal
            </h3>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--color-ink)]"
              data-speed="1.06"
            >
              This layout uses a simple grid. The image on the left moves
              slightly differently than the text on the right, creating a subtle
              depth effect while scrolling.
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--color-ink)] opacity-80"
              data-speed="0.94"
            >
              Tailwind utilities provide spacing and typography. No component
              logic is required. The ScrollSmoother plugin picks up the
              data-speed/data-lag attributes automatically.
            </p>
          </article>
        </div>

        <!-- Block B: Text left, image right -->
        <div
          class="grid items-center gap-[var(--space-l)] md:gap-[var(--space-xl)] md:grid-cols-2"
        >
          <article class="order-2 md:order-1 grid gap-[var(--space-s)]">
            <h3 class="font-body text-step-2 font-medium" data-speed="1.03">
              Reversed section
            </h3>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--color-ink)]"
              data-speed="0.95"
            >
              Here we reverse the grid order on large screens to verify effects
              in different content flows. Try fast and slow scrolls to observe
              the easing behavior.
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 text-[var(--color-ink)] opacity-80"
              data-speed="1.05"
            >
              You can tweak the numbers (e.g., 0.9 or 1.1) if you need stronger
              motion. Keep values close to 1.0 for subtlety.
            </p>
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
              class="mt-[var(--space-2xs)] text-center ibm-plex-sans-jp-mobile-caption text-[color:rgb(107_114_128)]"
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
