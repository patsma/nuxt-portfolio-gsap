<template>
  <!--
    Typography test page - real-world usage patterns
    - Links with GSAP hover
    - Icons with theme colors
    - Text combinations: em, italic, bold
    - All interactive elements work with theme system
  -->
  <div class="min-h-screen bg-[var(--theme-100)]">
    <div class="content-grid">
      <div class="breakout2 py-[var(--space-xl)]">
        <!-- Page Header -->
        <header class="mb-[var(--space-2xl)]">
          <h1 class="pp-eiko-desktop-h1 text-[var(--theme-text-100)] mb-[var(--space-s)]">
            Typography & Icons Test
          </h1>
          <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]">
            Real-world usage patterns with theme-aware links, icons, and text styles
          </p>
        </header>

        <!-- Links & Icons -->
        <section ref="linksSection" class="mb-[var(--space-2xl)]">
          <h2 class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Links & Icons
          </h2>

          <div class="grid gap-[var(--space-l)]">
            <!-- Navigation with icons -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Navigation with Icons
              </h3>
              <nav class="flex gap-[var(--space-m)] flex-wrap">
                <a
                  v-for="item in navItems"
                  :key="item.href"
                  :href="item.href"
                  class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)] flex items-center gap-[var(--space-2xs)]"
                  :data-active="false"
                >
                  <Icon :name="item.icon" class="icon icon-base" />
                  {{ item.label }}
                </a>
              </nav>
            </div>

            <!-- Inline text links -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Text with Links & Formatting
              </h3>
              <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                This paragraph shows <strong>bold text</strong>, <em>italic text</em>, and <strong><em>bold italic</em></strong> combinations.
                It also contains
                <a href="#" class="text-link nav-link text-[var(--theme-text-100)]" :data-active="false">inline hyperlinks</a>
                that fade smoothly on hover. Notice how
                <a href="#" class="text-link nav-link text-[var(--theme-text-100)]" :data-active="false">multiple links</a>
                work seamlessly with the theme toggle at 600ms and hover at 300ms.
              </p>
            </div>

            <!-- Icon buttons -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Interactive Buttons
              </h3>
              <div class="flex gap-[var(--space-s)] flex-wrap">
                <button class="nav-link text-[var(--theme-text-100)] px-[var(--space-s)] py-[var(--space-xs)] bg-[var(--theme-15)] rounded-md ibm-plex-sans-jp-mobile-button flex items-center gap-[var(--space-xs)]" :data-active="false">
                  <Icon name="heroicons:play-20-solid" class="icon icon-base" />
                  Play
                </button>
                <button class="nav-link text-[var(--theme-text-100)] px-[var(--space-s)] py-[var(--space-xs)] border border-[var(--theme-text-15)] rounded-md ibm-plex-sans-jp-mobile-button flex items-center gap-[var(--space-xs)]" :data-active="false">
                  <Icon name="heroicons:document-text-20-solid" class="icon icon-base" />
                  Docs
                </button>
                <button class="nav-link p-[var(--space-xs)] bg-[var(--theme-15)] rounded-md text-[var(--theme-text-100)]" :data-active="false">
                  <Icon name="heroicons:heart-20-solid" class="icon icon-base" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Content Cards with Icons -->
        <section class="mb-[var(--space-2xl)]">
          <h2 class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Content Cards
          </h2>

          <div class="grid gap-[var(--space-m)] md:grid-cols-2">
            <!-- Card 1 -->
            <article class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-xl border border-[var(--theme-text-15)]">
              <div class="flex items-start gap-[var(--space-s)] mb-[var(--space-s)]">
                <Icon name="heroicons:sparkles-20-solid" class="icon icon-xl icon-60" />
                <div>
                  <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">
                    Theme System
                  </h3>
                  <p class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)]">
                    GSAP-powered transitions
                  </p>
                </div>
              </div>
              <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)] mb-[var(--space-s)]">
                All colors and animations are <strong>centralized in design tokens</strong> for consistent theming.
                <em>Icons inherit theme colors</em> automatically.
              </p>
              <a href="/dev/colors" class="text-link nav-link text-[var(--theme-text-100)] inline-flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-desktop-p1" :data-active="false">
                View colors
                <Icon name="heroicons:arrow-right-20-solid" class="icon icon-sm" />
              </a>
            </article>

            <!-- Card 2 -->
            <article class="p-[var(--space-m)] bg-[var(--theme-15)] rounded-xl border border-[var(--theme-text-15)]">
              <div class="flex items-start gap-[var(--space-s)] mb-[var(--space-s)]">
                <Icon name="heroicons:code-bracket-20-solid" class="icon icon-xl icon-60" />
                <div>
                  <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">
                    Typography Scale
                  </h3>
                  <p class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)]">
                    Fluid, responsive sizing
                  </p>
                </div>
              </div>
              <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)] mb-[var(--space-s)]">
                Uses <code class="px-1 py-0.5 bg-[var(--theme-30)] rounded text-sm">clamp()</code> for fluid typography
                that scales from <strong><em>mobile to desktop</em></strong> seamlessly.
              </p>
              <a href="/dev/typography" class="text-link nav-link text-[var(--theme-text-100)] inline-flex items-center gap-[var(--space-2xs)] ibm-plex-sans-jp-desktop-p1" :data-active="false">
                All styles
                <Icon name="heroicons:arrow-right-20-solid" class="icon icon-sm" />
              </a>
            </article>
          </div>
        </section>

        <!-- Article with all text variants -->
        <section class="mb-[var(--space-2xl)]">
          <h2 class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Article Example
          </h2>

          <article class="grid gap-[var(--space-m)] max-w-3xl">
            <p class="ibm-plex-sans-jp-desktop-p2 text-[var(--theme-text-100)]">
              <strong>Large paragraph (P2):</strong> This demonstrates <em>italic</em>, <strong>bold</strong>, and
              <strong><em>bold italic</em></strong> text combinations in a larger size.
              <a href="/dev/typography" class="text-link nav-link text-[var(--theme-text-100)]" :data-active="false">See all typography styles</a>
              in the dedicated showcase page.
            </p>

            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Standard paragraph with <code class="px-1 py-0.5 bg-[var(--theme-15)] rounded text-sm">inline code</code> styling.
              Notice how <a href="#" class="text-link nav-link text-[var(--theme-text-100)]" :data-active="false">hyperlinks</a>
              smoothly fade to 50% opacity on hover using GSAP, perfectly synced with theme transitions.
            </p>

            <blockquote class="pl-[var(--space-m)] border-l-4 border-[var(--theme-text-15)]">
              <p class="ibm-plex-sans-jp-desktop-p2 text-[var(--theme-text-60)] italic">
                "Typography is the craft of endowing human language with a durable visual form."
              </p>
              <footer class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-40)] mt-[var(--space-xs)]">
                — Robert Bringhurst
              </footer>
            </blockquote>

            <div class="flex items-start gap-[var(--space-s)] p-[var(--space-s)] bg-[var(--theme-5)] rounded-lg">
              <Icon name="heroicons:information-circle-20-solid" class="icon icon-lg icon-60 mt-1" />
              <div>
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)] mb-[var(--space-2xs)]">
                  <strong>Info callout:</strong> Icons automatically inherit theme colors
                </p>
                <p class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)]">
                  Use <code class="px-1 bg-[var(--theme-15)] rounded text-xs">icon-60</code> for 60% opacity icons
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
// Navigation items with icons for testing
const navItems = [
  { label: "Home", href: "/", icon: "heroicons:home-20-solid" },
  { label: "Typography", href: "/dev/typography", icon: "heroicons:document-text-20-solid" },
  { label: "Colors", href: "/dev/colors", icon: "heroicons:swatch-20-solid" },
  { label: "Icons", href: "/dev/typography-test", icon: "heroicons:sparkles-20-solid" },
];

// Nav link hover effects are now handled by CSS (see base.scss)
// No GSAP setup needed - browser-native :hover is simpler and more performant
</script>
