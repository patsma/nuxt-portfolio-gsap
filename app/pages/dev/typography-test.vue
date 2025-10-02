<template>
  <!--
    Comprehensive typography test page
    - Tests all text styles with theme colors
    - Tests GSAP hover on links
    - Tests em, italic, bold, combinations
    - Demonstrates all PP Eiko and IBM Plex Sans JP variants
  -->
  <div class="min-h-screen bg-[var(--theme-100)]">
    <div class="content-grid">
      <div class="breakout2 py-[var(--space-xl)]">
        <!-- Page Header -->
        <header class="mb-[var(--space-2xl)]">
          <h1 class="pp-eiko-desktop-h1 text-[var(--theme-text-100)] mb-[var(--space-s)]">
            Typography Test Suite
          </h1>
          <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]">
            Comprehensive test of all typography styles, links with GSAP hover, and text variants
          </p>
        </header>

        <!-- Links Section -->
        <section ref="linksSection" class="mb-[var(--space-2xl)]">
          <h2 class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Interactive Links
          </h2>

          <div class="grid gap-[var(--space-m)]">
            <!-- Navigation-style links -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-xs)]">
                Navigation Links (PP Eiko)
              </h3>
              <nav class="flex gap-[var(--space-l)] flex-wrap">
                <a
                  v-for="item in navItems"
                  :key="item.href"
                  :href="item.href"
                  class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
                  :data-active="false"
                >
                  {{ item.label }}
                </a>
              </nav>
            </div>

            <!-- Body text links -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-xs)]">
                Inline Text Links (IBM Plex Sans JP)
              </h3>
              <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                This paragraph contains several
                <a href="#" class="text-link nav-link text-[var(--theme-text-100)]" :data-active="false">inline links</a>
                that demonstrate how GSAP hover works in
                <a href="#" class="text-link nav-link text-[var(--theme-text-100)]" :data-active="false">flowing text</a>.
                Notice how they smoothly fade to 50% opacity on hover, perfectly synced with the theme toggle animation.
              </p>
            </div>

            <!-- Button-style links -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-xs)]">
                Button-style Links
              </h3>
              <div class="flex gap-[var(--space-s)] flex-wrap">
                <a
                  href="#"
                  class="nav-link text-[var(--theme-text-100)] px-[var(--space-s)] py-[var(--space-xs)] border border-[var(--theme-text-15)] rounded-md ibm-plex-sans-jp-mobile-button"
                  :data-active="false"
                >
                  Primary Action
                </a>
                <a
                  href="#"
                  class="nav-link text-[var(--theme-text-100)] px-[var(--space-s)] py-[var(--space-xs)] bg-[var(--theme-15)] rounded-md ibm-plex-sans-jp-mobile-button"
                  :data-active="false"
                >
                  Secondary Action
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- PP Eiko Variants -->
        <section class="mb-[var(--space-2xl)]">
          <h2 class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            PP Eiko Display Font
          </h2>

          <div class="grid gap-[var(--space-l)]">
            <!-- Headings -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Headings
              </h3>
              <div class="grid gap-[var(--space-s)]">
                <h1 class="pp-eiko-desktop-h1 text-[var(--theme-text-100)]">
                  H1: The quick brown fox
                </h1>
                <h1 class="pp-eiko-desktop-h1-bold text-[var(--theme-text-100)]">
                  H1 Bold: The quick brown fox
                </h1>
                <h1 class="pp-eiko-desktop-h1-italic text-[var(--theme-text-100)]">
                  H1 Italic: The quick brown fox
                </h1>
                <h2 class="pp-eiko-desktop-h2 text-[var(--theme-text-100)]">
                  H2: Jumps over the lazy dog
                </h2>
                <h2 class="pp-eiko-desktop-h2-enlarged text-[var(--theme-text-100)]">
                  H2 Enlarged: Spectacular typography
                </h2>
                <h2 class="pp-eiko-desktop-h2-enlarged-italic text-[var(--theme-text-100)]">
                  H2 Enlarged Italic: Spectacular typography
                </h2>
                <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)]">
                  H3: Perfect for section headings
                </h3>
                <h3 class="pp-eiko-desktop-h3-italic text-[var(--theme-text-100)]">
                  H3 Italic: Perfect for section headings
                </h3>
                <h3 class="pp-eiko-desktop-h3-enlarged text-[var(--theme-text-100)]">
                  H3 Enlarged: Maximum visual impact
                </h3>
              </div>
            </div>

            <!-- Text with links -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Display Text with Links
              </h3>
              <p class="pp-eiko-desktop-custom-navigation text-[var(--theme-text-100)]">
                Navigation style:
                <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">Home</a> /
                <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">About</a> /
                <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">Contact</a>
              </p>
            </div>

            <!-- Opacity variants -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Text Opacity Variants
              </h3>
              <div class="grid gap-[var(--space-xs)]">
                <p class="pp-eiko-desktop-h3 text-[var(--theme-text-100)]">100% opacity (primary)</p>
                <p class="pp-eiko-desktop-h3 text-[var(--theme-text-60)]">60% opacity (secondary)</p>
                <p class="pp-eiko-desktop-h3 text-[var(--theme-text-50)]">50% opacity (tertiary)</p>
                <p class="pp-eiko-desktop-h3 text-[var(--theme-text-40)]">40% opacity (muted)</p>
                <p class="pp-eiko-desktop-h3 text-[var(--theme-text-30)]">30% opacity (very muted)</p>
                <p class="pp-eiko-desktop-h3 text-[var(--theme-text-15)]">15% opacity (barely visible)</p>
              </div>
            </div>
          </div>
        </section>

        <!-- IBM Plex Sans JP Variants -->
        <section class="mb-[var(--space-2xl)]">
          <h2 class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            IBM Plex Sans JP Body Font
          </h2>

          <div class="grid gap-[var(--space-l)]">
            <!-- Paragraphs -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Paragraph Styles
              </h3>
              <div class="grid gap-[var(--space-m)]">
                <p class="ibm-plex-sans-jp-desktop-p2 text-[var(--theme-text-100)]">
                  <strong>P2 (Large):</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. This is
                  <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">a link within paragraph text</a>,
                  and here's some <em>emphasized text</em> and <strong>bold text</strong> for good measure.
                </p>
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  <strong>P1 (Standard):</strong> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  Notice how <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">links</a> maintain
                  consistent hover behavior. <em>Italic text flows naturally</em>, and <strong>bold stands out</strong>
                  within the paragraph rhythm.
                </p>
                <p class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-60)]">
                  <strong>Caption:</strong> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
                  Perfect for <a href="#" class="nav-link text-[var(--theme-text-60)]" :data-active="false">image captions</a>
                  and <em>auxiliary information</em>.
                </p>
              </div>
            </div>

            <!-- Text combinations -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Text Style Combinations
              </h3>
              <div class="grid gap-[var(--space-s)]">
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  <strong>Bold</strong>, <em>italic</em>, <strong><em>bold italic</em></strong>,
                  and <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false"><strong>bold link</strong></a>
                </p>
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  Regular text with <code class="px-2 py-1 bg-[var(--theme-15)] rounded">inline code</code> styling
                </p>
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  <small>Small text for fine print and legal notices</small>
                </p>
              </div>
            </div>

            <!-- Labels and UI text -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Labels & UI Elements
              </h3>
              <div class="grid gap-[var(--space-s)]">
                <div class="flex items-center gap-[var(--space-xs)]">
                  <span class="ibm-plex-sans-jp-desktop-custom-labels text-[var(--theme-text-60)]">LABEL:</span>
                  <span class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">Content value</span>
                </div>
                <div class="flex items-center gap-[var(--space-xs)]">
                  <span class="ibm-plex-sans-jp-desktop-custom-navigation-caption text-[var(--theme-text-60)]">Navigation caption</span>
                  <span class="ibm-plex-sans-jp-desktop-custom-navigation-subcaption text-[var(--theme-text-40)]">Subcaption</span>
                </div>
                <button class="ibm-plex-sans-jp-mobile-button px-[var(--space-s)] py-[var(--space-xs)] bg-[var(--theme-15)] rounded-md text-[var(--theme-text-100)]">
                  Button Text Style
                </button>
              </div>
            </div>

            <!-- Opacity variants -->
            <div>
              <h3 class="pp-eiko-desktop-h3 text-[var(--theme-text-60)] mb-[var(--space-s)]">
                Text Opacity Hierarchy
              </h3>
              <div class="grid gap-[var(--space-xs)]">
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                  100%: Primary body text for maximum readability
                </p>
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-60)]">
                  60%: Secondary text and metadata
                </p>
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-50)]">
                  50%: Tertiary text, hover states
                </p>
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-40)]">
                  40%: Muted text, disabled states
                </p>
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-30)]">
                  30%: Very subtle text
                </p>
                <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-15)]">
                  15%: Barely visible dividers
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Background Variants with Text -->
        <section class="mb-[var(--space-2xl)]">
          <h2 class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Background & Text Combinations
          </h2>

          <div class="grid gap-[var(--space-s)]">
            <div class="p-[var(--space-m)] bg-[var(--theme-5)] rounded-lg">
              <h4 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-xs)]">
                5% Background
              </h4>
              <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                Subtle background with <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">interactive link</a>
                and <em>italic text</em>
              </p>
            </div>

            <div class="p-[var(--space-m)] bg-[var(--theme-15)] rounded-lg">
              <h4 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-xs)]">
                15% Background
              </h4>
              <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                Medium background with <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">interactive link</a>
                and <strong>bold text</strong>
              </p>
            </div>

            <div class="p-[var(--space-m)] bg-[var(--theme-30)] rounded-lg">
              <h4 class="pp-eiko-desktop-h3 text-[var(--theme-text-100)] mb-[var(--space-xs)]">
                30% Background
              </h4>
              <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
                Strong background with <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">interactive link</a>
                and <strong><em>bold italic</em></strong>
              </p>
            </div>
          </div>
        </section>

        <!-- Long-form Content -->
        <section class="mb-[var(--space-2xl)]">
          <h2 class="pp-eiko-desktop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Long-form Content Example
          </h2>

          <article class="grid gap-[var(--space-m)] max-w-3xl">
            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">Learn more about our process</a>.
            </p>

            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              <em>This is emphasized content within the flow</em>, and here's
              <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">another contextual link</a>
              to demonstrate consistent behavior.
            </p>

            <blockquote class="pl-[var(--space-m)] border-l-4 border-[var(--theme-text-15)]">
              <p class="ibm-plex-sans-jp-desktop-p2 text-[var(--theme-text-60)] italic">
                "Typography is the craft of endowing human language with a durable visual form."
              </p>
              <footer class="ibm-plex-sans-jp-desktop-caption text-[var(--theme-text-40)] mt-[var(--space-xs)]">
                — Robert Bringhurst
              </footer>
            </blockquote>

            <p class="ibm-plex-sans-jp-desktop-p1 text-[var(--theme-text-100)]">
              Final paragraph with <strong>strong emphasis</strong>, <em>subtle emphasis</em>,
              <code class="px-2 py-1 bg-[var(--theme-15)] rounded text-sm">code snippets</code>, and of course
              <a href="#" class="nav-link text-[var(--theme-text-100)]" :data-active="false">interactive links</a>
              that all work harmoniously together.
            </p>
          </article>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
// Nuxt GSAP services
const { $gsap } = useNuxtApp();

// Navigation items for testing
const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Typography", href: "/dev/typography" },
  { label: "Colors", href: "/dev/colors" },
  { label: "Responsive", href: "/dev/responsive" },
];

// Ref for links section
const linksSection = ref(null);

onMounted(() => {
  if (!$gsap) return;

  nextTick(() => {
    // Read hover duration from CSS
    const html = document.documentElement;
    const hoverDuration = parseFloat(getComputedStyle(html).getPropertyValue("--duration-hover")) / 1000 || 0.3;

    // Setup GSAP hover for all nav-link elements
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
