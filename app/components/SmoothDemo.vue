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
            class="font-serif-display text-step-3 md:text-step-4 lg:text-step-6 leading-[var(--leading-display)] tracking-[var(--tracking-widest)] font-semibold"
          >
            Smooth Scrolling Demo
          </h2>
          <p
            class="font-agrandir text-step-0 text-[var(--color-stone-600)] leading-[var(--leading-relaxed)] tracking-[var(--tracking-normal)]"
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
            class="mt-[var(--space-2xs)] text-center font-agrandir text-step-0 text-[color:rgb(107_114_128)]"
            data-speed="0.98"
          >
            Image uses data-speed="auto" and data-lag="0.2" for a smooth feel
          </figcaption>
        </figure>

        <!-- Paragraph block 1 -->
        <article
          class="max-w-3xl mx-auto mt-[var(--space-l)] grid gap-[var(--space-s)]"
        >
          <p
            class="font-agrandir text-step-0 text-[var(--color-ink)] font-light tracking-[var(--tracking-normal)] leading-[var(--leading-relaxed)]"
            data-speed="1.06"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vel
            enim vel nisl viverra bibendum. Integer tincidunt, purus id volutpat
            dignissim, libero lectus imperdiet dui, id accumsan ipsum mauris
            vitae risus. Integer egestas, nunc at hendrerit consectetur, ipsum
            ex facilisis lorem, at lobortis eros urna quis metus.
          </p>
          <p
            class="font-agrandir text-step-0 text-[var(--color-ink)] font-light tracking-[var(--tracking-normal)] leading-[var(--leading-relaxed)] opacity-80"
            data-speed="0.94"
          >
            Suspendisse potenti. Cras lobortis, arcu nec egestas rhoncus, felis
            lectus lobortis mi, vitae cursus risus sapien id magna. Donec id dui
            at nibh mattis sagittis. Sed nec faucibus lorem, non tincidunt nibh.
          </p>
        </article>

        <!-- Paragraph block 2 -->
        <article
          class="max-w-3xl mx-auto mt-[var(--space-m)] grid gap-[var(--space-s)]"
        >
          <p
            class="font-agrandir text-step-0 text-[var(--color-ink)] font-light tracking-[var(--tracking-normal)] leading-[var(--leading-relaxed)]"
            data-speed="1.02"
          >
            Proin ac nunc a diam porttitor pulvinar. Morbi at efficitur neque.
            Donec feugiat erat vitae sagittis ornare. Pellentesque habitant
            morbi tristique senectus et netus et malesuada fames ac turpis
            egestas. Nam varius bibendum nunc, id aliquet nunc faucibus non.
          </p>
          <p
            class="font-agrandir text-step-0 text-[var(--color-ink)] font-light tracking-[var(--tracking-normal)] leading-[var(--leading-relaxed)] opacity-80"
            data-speed="0.98"
          >
            Integer porttitor, nisl id dapibus consectetur, mauris risus
            scelerisque nulla, vitae sollicitudin nisl augue at ante. In hac
            habitasse platea dictumst. Phasellus egestas, velit sit amet
            ullamcorper auctor, nibh sem consequat nisl, non vestibulum nibh
            libero id augue.
          </p>
        </article>
      </div>
    </div>
  </section>
  <!-- End of demo component -->
</template>

<script setup>
// No interactive logic required for the demo.
// The GSAP ScrollSmoother plugin (initialized globally) reads the
// data-speed and data-lag attributes when effects: true.

// Accessibility notes:
// - Section is labeled by the heading via aria-labelledby.
// - Figure/figcaption provide semantic description for the image content.
</script>

<!-- TailwindCSS only: No scoped styles. -->
