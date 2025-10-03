<template>
  <!--
    Alternative ScrollSmoother demo - Layout variations
    - Image-text grid layouts with responsive reordering
    - Blockquotes, callouts, and advanced text formatting
    - Demonstrates grid order changes and complex content patterns
  -->
  <section aria-labelledby="alt-smooth-heading" class="w-full">
    <div class="content-grid">
      <div class="breakout3 py-[var(--space-l)] md:py-[var(--space-xl)] grid gap-[var(--space-xl)]">
        <!-- Section Header -->
        <header class="text-center grid gap-[var(--space-xs)]">
          <h2
            id="alt-smooth-heading"
            class="pp-eiko-mobile-h2 md:pp-eiko-desktop-h2 text-[var(--theme-text-100)]"
            data-speed="1.04"
          >
            Layout Variations
          </h2>
          <p
            class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]"
            data-speed="0.96"
          >
            Advanced layouts with responsive grids, blockquotes, and callout boxes
          </p>
        </header>

        <!-- Block A: Image left, text right -->
        <div class="grid items-center gap-[var(--space-l)] md:gap-[var(--space-xl)] md:grid-cols-2">
          <figure class="order-1" aria-label="Wide demo image" data-speed="auto" data-lag="0.25">
            <img
              src="/og.jpg"
              alt="Sample wide image showcasing theme system"
              class="w-full h-auto rounded-lg object-cover shadow-md"
              width="1200"
              height="630"
              loading="eager"
              decoding="async"
            />
            <figcaption
              class="mt-[var(--space-2xs)] ibm-plex-sans-jp-mobile-caption md:ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-40)]"
            >
              Image with <code class="px-1 bg-[var(--theme-15)] rounded text-xs">auto speed</code> and
              <code class="px-1 bg-[var(--theme-15)] rounded text-xs">0.25 lag</code>
            </figcaption>
          </figure>

          <article class="order-2 grid gap-[var(--space-s)]">
            <h3
              class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)]"
              data-speed="0.97"
            >
              Grid Layout System
            </h3>
            <p
              class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]"
              data-speed="1.06"
            >
              This layout uses <strong>CSS Grid</strong> with responsive breakpoints.
              The image on the left has a different <code class="px-1 py-0.5 bg-[var(--theme-30)] rounded text-sm">data-lag</code>
              value than the text, creating <em>subtle depth</em> while scrolling.
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]"
              data-speed="0.94"
            >
              All spacing uses <strong>fluid tokens</strong> from the theme system, ensuring
              consistent spacing that scales across viewports. No hardcoded pixel values anywhere!
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-50)]"
              data-speed="1.02"
            >
              Typography automatically switches between <em>PP Eiko</em> and <em>IBM Plex Sans JP</em>
              based on responsive breakpoints defined in our design tokens.
            </p>
          </article>
        </div>

        <!-- Blockquote Section -->
        <div class="max-w-3xl mx-auto" data-speed="0.98">
          <blockquote class="pl-[var(--space-m)] border-l-[var(--border-width-thick)] border-[var(--theme-text-15)]">
            <p class="ibm-plex-sans-jp-mobile-p2 md:ibm-plex-sans-jp-desktop-p2 text-[var(--theme-text-60)] italic">
              "Typography is the craft of endowing human language with a durable visual form."
            </p>
            <footer class="ibm-plex-sans-jp-mobile-caption md:ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-40)] mt-[var(--space-xs)]">
              — Robert Bringhurst
            </footer>
          </blockquote>
        </div>

        <!-- Info Callout Box -->
        <div class="max-w-3xl mx-auto" data-speed="1.04">
          <div class="flex items-start gap-[var(--space-s)] p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)]">
            <Icon name="heroicons:information-circle-20-solid" class="icon icon-lg icon-60 mt-1" />
            <div>
              <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">
                <strong>Design Token Benefits:</strong> Icons inherit theme colors automatically
              </p>
              <p class="ibm-plex-sans-jp-mobile-caption md:ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)]">
                Use <code class="px-1 bg-[var(--theme-15)] rounded text-xs">icon-60</code> for 60% opacity icons,
                or <code class="px-1 bg-[var(--theme-15)] rounded text-xs">icon-100</code> for full opacity
              </p>
            </div>
          </div>
        </div>

        <!-- Block B: Text left, image right (reversed on desktop) -->
        <div class="grid items-center gap-[var(--space-l)] md:gap-[var(--space-xl)] md:grid-cols-2">
          <article class="order-2 md:order-1 grid gap-[var(--space-s)]">
            <h3 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)]" data-speed="1.03">
              Responsive Grid Ordering
            </h3>
            <p
              class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-40)]"
              data-speed="0.95"
            >
              <strong class="text-[var(--theme-text-100)]">Mobile:</strong> Image appears above text.
              <strong class="text-[var(--theme-text-100)]">Desktop:</strong> Order reverses using
              <code class="px-1 py-0.5 bg-[var(--theme-30)] rounded text-sm">md:order-*</code> utilities.
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-30)]"
              data-speed="1.05"
            >
              <strong class="text-[var(--theme-text-100)]">Subtle scroll effects:</strong>
              Keep <code class="px-1 py-0.5 bg-[var(--theme-30)] rounded text-sm">data-speed</code> values
              close to <code class="px-1 py-0.5 bg-[var(--theme-30)] rounded text-sm">1.0</code>
              (like 0.95 or 1.05) for gentle motion that doesn't distract.
            </p>
            <p
              class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-15)]"
              data-speed="0.97"
            >
              <strong class="text-[var(--theme-text-100)]">Very subtle text:</strong> Perfect for secondary details or disclaimers.
            </p>

            <!-- Nested background examples -->
            <div class="mt-[var(--space-s)] grid gap-[var(--space-2xs)]">
              <p class="text-[var(--theme-text-60)] text-step-0 mb-[var(--space-2xs)]">
                Nested background variants:
              </p>
              <div class="p-[var(--space-xs)] bg-[var(--theme-5)] border border-[var(--theme-text-15)] rounded">
                <span class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-caption">5% background</span>
              </div>
              <div class="p-[var(--space-xs)] bg-[var(--theme-15)] border border-[var(--theme-text-15)] rounded">
                <span class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-caption">15% background</span>
              </div>
              <div class="p-[var(--space-xs)] bg-[var(--theme-30)] border border-[var(--theme-text-15)] rounded">
                <span class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-caption">30% background</span>
              </div>
              <div class="p-[var(--space-xs)] bg-[var(--theme-50)] border border-[var(--theme-text-15)] rounded">
                <span class="text-[var(--theme-text-100)] ibm-plex-sans-jp-mobile-caption">50% background</span>
              </div>
            </div>
          </article>

          <figure class="order-1 md:order-2" aria-label="Icon demo image" data-speed="auto" data-lag="0.15">
            <img
              src="/icon.png"
              alt="Nuxt icon with subtle parallax"
              class="w-full max-w-lg mx-auto h-auto rounded-lg object-cover shadow-lg"
              width="1024"
              height="1024"
              loading="lazy"
              decoding="async"
            />
            <figcaption
              class="mt-[var(--space-2xs)] text-center ibm-plex-sans-jp-mobile-caption md:ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-40)]"
            >
              Lighter lag value creates tighter connection to scroll
            </figcaption>
          </figure>
        </div>

        <!-- Article with Advanced Text Formatting -->
        <article class="grid gap-[var(--space-m)] max-w-3xl mx-auto">
          <h3 class="pp-eiko-mobile-h3 md:pp-eiko-desktop-h3 text-[var(--theme-text-100)]" data-speed="0.96">
            Advanced Text Formatting
          </h3>

          <p class="ibm-plex-sans-jp-mobile-p2 md:ibm-plex-sans-jp-desktop-p2 text-[var(--theme-text-100)]" data-speed="1.02">
            <strong>Large paragraph (P2):</strong> This demonstrates <em>italic</em>, <strong>bold</strong>, and
            <strong><em>bold italic</em></strong> combinations in a larger size.
            All styles work seamlessly with the theme system.
          </p>

          <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]" data-speed="0.94">
            Standard paragraph with <code class="px-1 py-0.5 bg-[var(--theme-15)] rounded text-sm">inline code</code> styling.
            Notice how <a href="/dev/typography-test" class="nav-link text-[var(--theme-text-100)]" :data-active="false">hyperlinks</a>
            smoothly fade to 50% opacity on hover using <strong>CSS-only approach</strong> (no JavaScript).
          </p>

          <!-- Warning callout -->
          <div class="flex items-start gap-[var(--space-s)] p-[var(--space-m)] bg-[var(--theme-15)] rounded-lg border border-[var(--theme-text-30)]" data-speed="1.04">
            <Icon name="heroicons:exclamation-triangle-20-solid" class="icon icon-lg icon-60 mt-1" />
            <div>
              <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">
                <strong>Callout boxes:</strong> Use different background opacities for emphasis
              </p>
              <p class="ibm-plex-sans-jp-mobile-caption md:ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)]">
                This box uses <code class="px-1 bg-[var(--theme-30)] rounded text-xs">--theme-15</code> background
                with <code class="px-1 bg-[var(--theme-30)] rounded text-xs">--theme-text-30</code> border
              </p>
            </div>
          </div>
        </article>

        <!-- Code Block Example -->
        <div class="max-w-3xl mx-auto" data-speed="0.98">
          <h4 class="pp-eiko-mobile-h3 text-[var(--theme-text-100)] mb-[var(--space-s)]">
            Code Snippets
          </h4>
          <pre class="p-[var(--space-m)] bg-[var(--theme-5)] border border-[var(--theme-text-15)] rounded-lg overflow-x-auto"><code class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-100)] font-mono text-sm">// Example: Using theme tokens
const heading = {
  color: 'var(--theme-text-100)',
  fontSize: 'var(--step-4)',
  fontFamily: 'var(--font-display)',
  letterSpacing: 'var(--tracking-display-2)',
};</code></pre>
        </div>

        <!-- Feature Grid -->
        <div class="grid gap-[var(--space-s)] md:grid-cols-3" data-speed="1.06">
          <div class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)] text-center" v-once>
            <Icon name="heroicons:bolt-20-solid" class="icon icon-2xl icon-60 mx-auto mb-[var(--space-xs)]" />
            <h5 class="pp-eiko-mobile-h3 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">Fast</h5>
            <p class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-60)]">Optimized performance</p>
          </div>
          <div class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)] text-center" v-once>
            <Icon name="heroicons:paint-brush-20-solid" class="icon icon-2xl icon-60 mx-auto mb-[var(--space-xs)]" />
            <h5 class="pp-eiko-mobile-h3 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">Themed</h5>
            <p class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-60)]">Smooth transitions</p>
          </div>
          <div class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)] text-center" v-once>
            <Icon name="heroicons:code-bracket-20-solid" class="icon icon-2xl icon-60 mx-auto mb-[var(--space-xs)]" />
            <h5 class="pp-eiko-mobile-h3 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">Clean</h5>
            <p class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-60)]">Token-driven design</p>
          </div>
        </div>

        <!-- Final CTA -->
        <div class="text-center mt-[var(--space-xl)]" data-speed="0.96">
          <p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)] mb-[var(--space-m)]">
            Explore more examples and documentation
          </p>
          <div class="flex gap-[var(--space-s)] justify-center flex-wrap">
            <a href="/dev/colors" class="nav-link text-[var(--theme-text-100)] px-[var(--space-m)] py-[var(--space-s)] bg-[var(--theme-15)] rounded-md ibm-plex-sans-jp-mobile-button inline-flex items-center gap-[var(--space-xs)]" :data-active="false">
              <Icon name="heroicons:swatch-20-solid" class="icon icon-base" />
              Color System
            </a>
            <a href="/dev/typography-test" class="nav-link text-[var(--theme-text-100)] px-[var(--space-m)] py-[var(--space-s)] border border-[var(--theme-text-15)] rounded-md ibm-plex-sans-jp-mobile-button inline-flex items-center gap-[var(--space-xs)]" :data-active="false">
              <Icon name="heroicons:document-text-20-solid" class="icon icon-base" />
              Typography
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Define component name for better DevTools debugging
defineOptions({
  name: 'SmoothDemoAlt',
})

// No component logic necessary - all interactions handled by:
// - CSS hover via .nav-link class (see base.scss)
// - GSAP ScrollSmoother reads data-speed and data-lag attributes
// Accessibility: aria-labelledby ties the section to the heading
</script>

<!-- Tailwind-only styles -->
