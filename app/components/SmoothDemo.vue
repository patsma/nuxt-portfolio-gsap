<template>
  <!--
    Simple ScrollSmoother demo component
    - Tailwind-only styling (no SCSS)
    - Uses NuxtImg and a few paragraphs
    - Elements include data-speed/data-lag attributes for GSAP ScrollSmoother effects
    - Keep markup semantic and accessible
  -->
  <section class="w-full" aria-labelledby="smooth-demo-heading">
    <div class="content-grid">
      <div class="breakout3 py-[var(--space-l)] md:py-[var(--space-xl)]">
        <!-- Heading with token-driven typography -->
        <header
          class="text-center grid gap-[var(--space-xs)]"
          data-speed="0.95"
        >
          <h2
            id="smooth-demo-heading"
            class="pp-eiko-mobile-h2 md:pp-eiko-desktop-h2 text-[var(--color-ink)]"
          >
            Smooth Scrolling Demo
          </h2>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)]"
            data-speed="1.05"
          >
            Minimal demo to verify GSAP ScrollSmoother effects. Scroll to see
            subtle motion on the image and text blocks.
          </p>
        </header>

        <!-- Image block -->
        <figure
          class="max-w-3xl mx-auto mt-[var(--space-l)]"
          aria-label="Demo image"
        >
          <!--
        Use a local public asset to avoid external domain config.
        Add data-speed and data-lag so ScrollSmoother can animate it.
      -->
          <NuxtImg
            src="/icon.png"
            alt="Nuxt icon"
            class="w-full h-auto rounded-lg shadow-lg"
            width="1024"
            height="1024"
            sizes="(min-width: 1024px) 768px, 100vw"
            format="webp"
            loading="eager"
            decoding="async"
            data-speed="auto"
            data-lag="0.2"
          />
          <figcaption
            class="mt-[var(--space-2xs)] text-center ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
            data-speed="0.98"
          >
            Image uses data-speed="auto" and data-lag="0.2" for a smooth feel
          </figcaption>
        </figure>

        <!-- Paragraph block 1 - showcasing color variants -->
        <article
          class="max-w-3xl mx-auto mt-[var(--space-l)] grid gap-[var(--space-s)]"
        >
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-100)] font-light"
            data-speed="1.06"
          >
            <strong class="font-medium">100% opacity:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vel
            enim vel nisl viverra bibendum. Integer tincidunt, purus id volutpat
            dignissim, libero lectus imperdiet dui, id accumsan ipsum mauris
            vitae risus.
          </p>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)] font-light"
            data-speed="0.94"
          >
            <strong class="font-medium">60% opacity:</strong> Suspendisse potenti. Cras lobortis, arcu nec egestas rhoncus, felis
            lectus lobortis mi, vitae cursus risus sapien id magna. Donec id dui
            at nibh mattis sagittis. Sed nec faucibus lorem, non tincidunt nibh.
          </p>
        </article>

        <!-- Paragraph block 2 - more color variants -->
        <article
          class="max-w-3xl mx-auto mt-[var(--space-m)] grid gap-[var(--space-s)]"
        >
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-50)] font-light"
            data-speed="1.02"
          >
            <strong class="font-medium text-[var(--theme-text-100)]">50% opacity:</strong> Proin ac nunc a diam porttitor pulvinar. Morbi at efficitur neque.
            Donec feugiat erat vitae sagittis ornare. Pellentesque habitant
            morbi tristique senectus et netus et malesuada fames ac turpis
            egestas.
          </p>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-40)] font-light"
            data-speed="0.98"
          >
            <strong class="font-medium text-[var(--theme-text-100)]">40% opacity:</strong> Integer porttitor, nisl id dapibus consectetur, mauris risus
            scelerisque nulla, vitae sollicitudin nisl augue at ante. In hac
            habitasse platea dictumst. Phasellus egestas, velit sit amet
            ullamcorper auctor, nibh sem consequat nisl.
          </p>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-30)] font-light"
            data-speed="0.96"
          >
            <strong class="font-medium text-[var(--theme-text-100)]">30% opacity:</strong> Nam varius bibendum nunc, id aliquet nunc faucibus non.
            Sed nec faucibus lorem, non tincidunt nibh.
          </p>
          <p
            class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-15)] font-light"
            data-speed="1.04"
          >
            <strong class="font-medium text-[var(--theme-text-100)]">15% opacity:</strong> Very subtle text for backgrounds or dividers.
          </p>
        </article>

        <!-- Background color showcase -->
        <div class="max-w-3xl mx-auto mt-[var(--space-xl)] grid gap-[var(--space-s)]">
          <h3 class="pp-eiko-mobile-h3 text-[var(--theme-text-100)]">
            Background Variants
          </h3>
          <div class="grid gap-[var(--space-2xs)]">
            <div class="p-[var(--space-s)] bg-[var(--theme-5)] border border-[var(--theme-text-15)] rounded-md">
              <p class="text-[var(--theme-text-100)] font-light">5% background opacity</p>
            </div>
            <div class="p-[var(--space-s)] bg-[var(--theme-15)] border border-[var(--theme-text-15)] rounded-md">
              <p class="text-[var(--theme-text-100)] font-light">15% background opacity</p>
            </div>
            <div class="p-[var(--space-s)] bg-[var(--theme-30)] border border-[var(--theme-text-15)] rounded-md">
              <p class="text-[var(--theme-text-100)] font-light">30% background opacity</p>
            </div>
          </div>
        </div>

        <!-- Links showcase -->
        <div class="max-w-3xl mx-auto mt-[var(--space-xl)] grid gap-[var(--space-m)]">
          <h3 class="pp-eiko-mobile-h3 text-[var(--theme-text-100)]">
            Interactive Links
          </h3>

          <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-100)] font-light">
            This paragraph contains
            <a href="/dev/typography-test" class="nav-link text-[var(--theme-text-100)]" :data-active="false">inline links</a>
            that use GSAP hover animations. Try hovering to see the smooth 300ms fade to 50% opacity.
            Here's <a href="/dev/colors" class="nav-link text-[var(--theme-text-100)]" :data-active="false">another link</a>
            to test with.
          </p>

          <nav class="flex gap-[var(--space-m)] flex-wrap">
            <a href="/" class="nav-link text-[var(--theme-text-100)] pp-eiko-mobile-custom-navigation-menu-items" :data-active="false">Home</a>
            <a href="/about" class="nav-link text-[var(--theme-text-100)] pp-eiko-mobile-custom-navigation-menu-items" :data-active="false">About</a>
            <a href="/dev/typography-test" class="nav-link text-[var(--theme-text-100)] pp-eiko-mobile-custom-navigation-menu-items" :data-active="false">Typography Test</a>
            <a href="/dev/colors" class="nav-link text-[var(--theme-text-100)] pp-eiko-mobile-custom-navigation-menu-items" :data-active="false">Colors</a>
          </nav>
        </div>
      </div>
    </div>
  </section>
  <!-- End of demo component -->
</template>

<script setup>
// GSAP ScrollSmoother plugin (initialized globally) reads the
// data-speed and data-lag attributes when effects: true.

// NOTE: Hover effects are handled by CSS via .nav-link class (see base.scss)
// This follows the theme system's CSS-based approach for better performance
// and simpler code maintenance. No JavaScript needed for hover states!

// Accessibility notes:
// - Section is labeled by the heading via aria-labelledby.
// - Figure/figcaption provide semantic description for the image content.
// - All interactive elements use CSS hover for consistent timing and behavior.
</script>

<!-- TailwindCSS only: No scoped styles. -->
