<template>
  <div class="content-grid">
    <div class="breakout2 py-[var(--space-xl)]">
      <!-- Page Header -->
      <header class="mb-[var(--space-2xl)]">
        <h1
          v-page-split:chars="{ stagger: 0.03 }"
          data-speed="0.7"
          class="pp-eiko-desktop-h1 text-[var(--theme-text-100)] mb-[var(--space-s)]"
        >
          Page Transitions
        </h1>
        <p
          v-page-fade:up
          data-lag="0.15"
          class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]"
        >
          Directive-based GSAP transitions with manual control and ScrollSmoother
          integration
        </p>
      </header>

      <!-- v-page-split Section -->
      <section class="mb-[var(--space-2xl)]">
        <h2
          v-page-split:words="{ stagger: 0.05 }"
          class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]"
        >
          v-page-split Directive
        </h2>

        <div class="grid gap-[var(--space-l)]">
          <!-- Split by characters -->
          <div>
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-xs)]"
            >
              <code
                class="px-1 py-0.5 bg-[var(--theme-15)] rounded text-sm"
              >v-page-split:chars</code>
            </p>
            <h3
              v-page-split:chars="{ stagger: 0.04, duration: 0.8 }"
              data-speed="0.9"
              class="pp-eiko-desktop-h3 text-[var(--theme-text-100)]"
            >
              Character by character reveal
            </h3>
          </div>

          <!-- Split by words -->
          <div>
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-xs)]"
            >
              <code
                class="px-1 py-0.5 bg-[var(--theme-15)] rounded text-sm"
              >v-page-split:words</code>
            </p>
            <h3
              v-page-split:words="{ stagger: 0.06 }"
              data-speed="1.05"
              class="pp-eiko-desktop-h3 text-[var(--theme-text-100)]"
            >
              Word by word animation effect
            </h3>
          </div>

          <!-- Split by lines -->
          <div>
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-xs)]"
            >
              <code
                class="px-1 py-0.5 bg-[var(--theme-15)] rounded text-sm"
              >v-page-split:lines</code>
            </p>
            <h3
              v-page-split:lines="{ stagger: 0.08 }"
              data-speed="0.95"
              class="pp-eiko-desktop-h3 text-[var(--theme-text-100)]"
            >
              Line by line reveal with custom stagger timing for smooth sequential
              animations
            </h3>
          </div>
        </div>
      </section>

      <!-- v-page-fade Section -->
      <section class="mb-[var(--space-2xl)]">
        <h2
          v-page-fade:left
          class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]"
        >
          v-page-fade Directive
        </h2>

        <div class="grid gap-[var(--space-m)] md:grid-cols-2">
          <!-- Fade from up -->
          <div
            v-page-fade:up="{ distance: 40 }"
            class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)]"
          >
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-2xs)]"
            >
              <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                >v-page-fade:up</code
              >
            </p>
            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Fades in from below with 40px distance
            </p>
          </div>

          <!-- Fade from down -->
          <div
            v-page-fade:down="{ distance: 30 }"
            class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)]"
          >
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-2xs)]"
            >
              <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                >v-page-fade:down</code
              >
            </p>
            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Fades in from above with 30px distance
            </p>
          </div>

          <!-- Fade from left -->
          <div
            v-page-fade:left="{ distance: 50, duration: 0.8 }"
            class="p-[var(--space-m)] bg-[var(--theme-15)] rounded-lg border border-[var(--theme-text-15)]"
          >
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-2xs)]"
            >
              <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                >v-page-fade:left</code
              >
            </p>
            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Fades in from right with 50px and custom duration
            </p>
          </div>

          <!-- Fade from right -->
          <div
            v-page-fade:right="{ distance: 50, duration: 0.8 }"
            class="p-[var(--space-m)] bg-[var(--theme-15)] rounded-lg border border-[var(--theme-text-15)]"
          >
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-2xs)]"
            >
              <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                >v-page-fade:right</code
              >
            </p>
            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Fades in from left with 50px and custom duration
            </p>
          </div>
        </div>
      </section>

      <!-- v-page-clip Section -->
      <section class="mb-[var(--space-2xl)]">
        <h2
          v-page-clip:right
          class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]"
        >
          v-page-clip Directive
        </h2>

        <div class="grid gap-[var(--space-m)]">
          <!-- Clip from top -->
          <div
            v-page-clip:top="{ duration: 0.7 }"
            class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)]"
          >
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-2xs)]"
            >
              <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                >v-page-clip:top</code
              >
            </p>
            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Reveals from top with clip-path animation
            </p>
          </div>

          <!-- Clip from bottom -->
          <div
            v-page-clip:bottom="{ duration: 0.8 }"
            data-lag="0.15"
            class="p-[var(--space-m)] bg-[var(--theme-15)] rounded-lg border border-[var(--theme-text-15)]"
          >
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-2xs)]"
            >
              <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                >v-page-clip:bottom</code
              >
            </p>
            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Reveals from bottom with clip-path + lag effect
            </p>
          </div>

          <!-- Clip from left -->
          <div
            v-page-clip:left
            class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)]"
          >
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-2xs)]"
            >
              <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                >v-page-clip:left</code
              >
            </p>
            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Reveals from left with default settings
            </p>
          </div>

          <!-- Clip from right -->
          <div
            v-page-clip:right
            data-lag="0.2"
            class="p-[var(--space-m)] bg-[var(--theme-15)] rounded-lg border border-[var(--theme-text-15)]"
          >
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-2xs)]"
            >
              <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                >v-page-clip:right</code
              >
            </p>
            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Reveals from right with lag effect
            </p>
          </div>
        </div>
      </section>

      <!-- v-page-stagger Section -->
      <section class="mb-[var(--space-2xl)]">
        <h2
          v-page-fade:up
          class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]"
        >
          v-page-stagger Directive
        </h2>

        <div class="grid gap-[var(--space-l)]">
          <!-- Stagger list items -->
          <div>
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-s)]"
            >
              <code class="px-1 py-0.5 bg-[var(--theme-15)] rounded text-sm"
                >v-page-stagger</code
              >
              on list - default stagger
            </p>
            <ul
              v-page-stagger="{ stagger: 0.1 }"
              data-speed="0.95"
              class="grid gap-[var(--space-xs)]"
            >
              <li class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                First item animates in
              </li>
              <li class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                Second item follows
              </li>
              <li class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                Third item after that
              </li>
              <li class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                Fourth completes the sequence
              </li>
            </ul>
          </div>

          <!-- Fast stagger -->
          <div>
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-s)]"
            >
              <code class="px-1 py-0.5 bg-[var(--theme-15)} rounded text-sm"
                >v-page-stagger="{ stagger: 0.05 }"</code
              >
              - fast stagger
            </p>
            <ol
              v-page-stagger="{ stagger: 0.05, duration: 0.4 }"
              data-lag="0.18"
              class="grid gap-[var(--space-xs)]"
            >
              <li class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]">
                Quick animation sequence
              </li>
              <li class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]">
                With shorter duration
              </li>
              <li class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]">
                Creates snappy feel
              </li>
              <li class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]">
                Plus lag effect for depth
              </li>
            </ol>
          </div>

          <!-- Stagger cards -->
          <div>
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-s)]"
            >
              <code class="px-1 py-0.5 bg-[var(--theme-15)] rounded text-sm"
                >v-page-stagger</code
              >
              on grid of cards
            </p>
            <div
              v-page-stagger="{ stagger: 0.12 }"
              data-speed="1.05"
              class="grid gap-[var(--space-s)] md:grid-cols-3"
            >
              <div
                class="p-[var(--space-s)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)] text-center"
              >
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  Card 1
                </p>
              </div>
              <div
                class="p-[var(--space-s)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)] text-center"
              >
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  Card 2
                </p>
              </div>
              <div
                class="p-[var(--space-s)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)] text-center"
              >
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  Card 3
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Parallax Effects Section -->
      <section class="mb-[var(--space-2xl)]">
        <h2
          v-page-split:words
          class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]"
        >
          Parallax Effects
        </h2>

        <div class="grid gap-[var(--space-l)]">
          <!-- data-speed examples -->
          <div>
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-s)]"
            >
              <code class="px-1 py-0.5 bg-[var(--theme-15)] rounded text-sm"
                >data-speed</code
              >
              - Controls scroll movement speed
            </p>
            <div class="grid gap-[var(--space-s)]">
              <div
                data-speed="0.5"
                class="p-[var(--space-s)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)]"
              >
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                    >data-speed="0.5"</code
                  >
                  - Slower (background effect)
                </p>
              </div>
              <div
                data-speed="1.0"
                class="p-[var(--space-s)] bg-[var(--theme-15)] rounded-lg border border-[var(--theme-text-15)]"
              >
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                    >data-speed="1.0"</code
                  >
                  - Normal speed
                </p>
              </div>
              <div
                data-speed="1.5"
                class="p-[var(--space-s)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)]"
              >
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                    >data-speed="1.5"</code
                  >
                  - Faster (foreground effect)
                </p>
              </div>
            </div>
          </div>

          <!-- data-lag examples -->
          <div>
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-s)]"
            >
              <code class="px-1 py-0.5 bg-[var(--theme-15)] rounded text-sm"
                >data-lag</code
              >
              - Smooth "catch up" trailing effect
            </p>
            <div class="grid gap-[var(--space-s)]">
              <div
                data-lag="0.1"
                class="p-[var(--space-s)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)]"
              >
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                    >data-lag="0.1"</code
                  >
                  - Subtle trailing
                </p>
              </div>
              <div
                data-lag="0.25"
                class="p-[var(--space-s)] bg-[var(--theme-15)] rounded-lg border border-[var(--theme-text-15)]"
              >
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                    >data-lag="0.25"</code
                  >
                  - More noticeable lag
                </p>
              </div>
            </div>
          </div>

          <!-- Combined effects -->
          <div>
            <p
              class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)] mb-[var(--space-s)]"
            >
              Combined: Directives + Parallax
            </p>
            <div
              v-page-fade:up="{ distance: 40 }"
              data-speed="0.8"
              data-lag="0.2"
              class="p-[var(--space-m)] bg-[var(--theme-15)] rounded-lg border border-[var(--theme-text-15)]"
            >
              <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                This element combines
                <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                  >v-page-fade:up</code
                >
                with
                <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                  >data-speed="0.8"</code
                >
                and
                <code class="px-1 bg-[var(--theme-30)] rounded text-xs"
                  >data-lag="0.2"</code
                >
                for page transitions + scroll parallax + lag trailing
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Scroll testing spacers -->
      <div class="h-[60vh]"></div>

      <div
        v-page-clip:top
        data-lag="0.2"
        class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg border border-[var(--theme-text-15)] mb-[var(--space-2xl)]"
      >
        <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-s)]">
          Scroll & Transition
        </h3>
        <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
          ScrollSmoother and page transitions work together seamlessly. Navigate
          between pages to see the full effect of OUT then IN animations!
        </p>
      </div>

      <div class="h-[60vh]"></div>
    </div>
  </div>
</template>

<script setup>
// No script needed - all interactions handled by directives and ScrollSmoother
defineOptions({
  name: "PageTransitionsDemo",
});
</script>
