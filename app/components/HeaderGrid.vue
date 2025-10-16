<template>
  <!--
    Simplified fixed header with responsive grid layout
    - Desktop: 1fr auto 1fr columns → logo (left), nav (center), empty (right)
    - Mobile: hamburger (left), logo (center), empty (right), nav hidden
    - Mobile overlay: appears below header, fills viewport minus header height
  -->
  <header
    ref="containerRef"
    class="header-grid headroom--pinned"
    data-entrance-animate="true"
  >
    <div class="content-grid">
      <div class="breakout3 header-grid__inner">
        <!-- Top row: shared row for both desktop and mobile -->
        <div class="header-grid__row header-grid__row--top">
          <!-- Hamburger: visible only on mobile, animates lines (no icon swap) -->
          <button
            ref="hamburgerBtn"
            class="header-grid__hamburger"
            :aria-expanded="Boolean(isOpen)"
            aria-controls="mobile-overlay"
            aria-label="Toggle main menu"
            @click="toggle()"
          >
            <span class="sr-only">{{
              isOpen ? "Close menu" : "Open menu"
            }}</span>
            <HamburgerSVG
              ref="hamburgerSvgComponent"
              class="header-grid__hamburgerIcon"
            />
          </button>

          <!-- Single logo used for both desktop and mobile -->
          <NuxtLink to="/" class="header-grid__brand">
            <div class="flex flex-col">
              <span
                class="ibm-plex-sans-jp-mobile-custom-navigation-caption text-[var(--theme-text-100)]"
                >Morten Christensen</span
              >
              <span
                class="ibm-plex-sans-jp-mobile-custom-navigation-caption text-[var(--theme-text-60)]"
                >UX/UI designer</span
              >
            </div>
          </NuxtLink>

          <!-- Desktop nav centered (hidden on mobile) -->
          <nav class="header-grid__nav" aria-label="Primary">
            <NuxtLink
              to="/"
              class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
              :data-active="isActive('/')"
            >
              Work
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
              :data-active="isActive('/about')"
            >
              About
            </NuxtLink>

            <!-- Theme toggle in desktop nav -->
            <button
              id="themeSwitch"
              class="cursor-pointer"
              aria-label="Toggle theme"
            >
              <ThemeToggleSVG class="w-12" />
            </button>

            <NuxtLink
              to="/lab"
              class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
              :data-active="isActive('/lab')"
            >
              Lab
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
              :data-active="isActive('/contact')"
            >
              Contact
            </NuxtLink>
          </nav>

          <!-- Right spacer: location/date on desktop, theme toggle on mobile -->
          <div class="header-grid__spacer flex items-center justify-end">
            <!-- Desktop: Location and date -->
            <div class="hidden md:flex flex-col items-end">
              <span
                class="ibm-plex-sans-jp-mobile-custom-navigation-caption text-[var(--theme-text-100)]"
                >Tokyo, JP</span
              >
              <span
                class="ibm-plex-sans-jp-mobile-custom-navigation-caption text-[var(--theme-text-60)]"
                >Jun 18, 20:00:23</span
              >
            </div>

            <!-- Mobile: Theme toggle -->
            <button
              id="themeSwitchMobile"
              class="flex md:hidden cursor-pointer"
              aria-label="Toggle theme"
            >
              <ThemeToggleSVG class="w-12" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile overlay: full height with clip-path reveal -->
    <div
      id="mobile-overlay"
      ref="overlayRef"
      class="fixed inset-x-0 top-0 h-[100dvh] pt-20 bg-[var(--theme-100)] md:hidden z-40"
    >
      <div class="content-grid h-full">
        <div
          class="breakout1 pt-[var(--size-header)] pb-[var(--space-m)] flex flex-col gap-[var(--space-s)]"
        >
          <NuxtLink
            v-for="item in items"
            :key="'m-' + item.href"
            :to="item.href"
            class="block pp-eiko-mobile-custom-navigation-menu-items nav-link text-[var(--theme-text-100)]"
            :data-active="isActive(item.href)"
            @click="close()"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="js">
// Import the provided SVG-based hamburger icon for mobile
import HamburgerSVG from "./SVG/HamburgerSVG.vue";
import ThemeToggleSVG from "./ThemeToggleSVG.vue";
import { useLoadingStore } from "~/stores/loading";
import { useLoadingSequence } from "~/composables/useLoadingSequence";

// Nuxt GSAP services (provided by GSAP Nuxt module/plugin)
const { $gsap, $DrawSVGPlugin } = useNuxtApp();

// Loading system integration
const loadingStore = useLoadingStore();
const { isFirstLoad, createStaggerAnimation } = useLoadingSequence();

/**
 * Shared menu state for consistent header behavior
 * @type {import('vue').Ref<boolean>}
 */
const isOpen = useState("headerMenuOpen", () => false);

// Refs to animate
/** @type {import('vue').Ref<HTMLElement|null>} */
const containerRef = ref(null);
/** @type {import('vue').Ref<HTMLElement|null>} */
const hamburgerBtn = ref(null);
/** @type {import('vue').Ref<HTMLElement|null>} */
const overlayRef = ref(null);

// Reference to child SVG component to access its root SVG via exposed ref
/**
 * @typedef {SVGSVGElement | null | { value: SVGSVGElement | null }} MaybeRefSvg
 * @typedef {{ svgRootRef?: MaybeRefSvg, svgRef?: MaybeRefSvg }} HamburgerSVGExposed
 */
/** @type {import('vue').Ref<HamburgerSVGExposed|null>} */
const hamburgerSvgComponent = ref(null);

// Internal handles
/** @type {any} */
let hamburgerTl = null;
/** @type {any} */
let overlayTl = null;
/** @type {{ revert?: () => void } | null} */
let gsapCtx = null;

// Navigation items — main pages for page transition demo
/** @typedef {{ label: string, href: string }} NavItem */
/** @type {NavItem[]} */
const items = [
  { label: "Work", href: "/" },
  { label: "About", href: "/about" },
  { label: "Lab", href: "/lab" },
  { label: "Contact", href: "/contact" },
];

// Active route highlighting
const route = useRoute();
/**
 * @param {string} href
 * @returns {boolean}
 */
function isActive(href) {
  return route.path === href;
}

onMounted(() => {
  if (!$gsap) return;

  const scopeEl = containerRef.value || undefined;

  nextTick(() => {
    // Initialize theme switch
    const { initThemeSwitch } = useThemeSwitch();
    initThemeSwitch();

    gsapCtx = $gsap.context(() => {
      /**
       * Helper to unwrap child-exposed refs safely
       * @param {HamburgerSVGExposed | null} exp
       * @returns {SVGSVGElement | null}
       */
      const getExposedSvgEl = (exp) => {
        if (!exp) return null;
        const candidate = exp.svgRootRef ?? exp.svgRef;
        if (candidate == null) return null;
        return Object.prototype.hasOwnProperty.call(candidate, "value")
          ? /** @type {{ value: SVGSVGElement | null }} */ (candidate).value
          : /** @type {SVGSVGElement | null} */ (candidate);
      };

      // Prefer animating via child component's exposed svgRootRef for reliability
      /** @type {SVGSVGElement | null} */
      const svgRoot =
        getExposedSvgEl(hamburgerSvgComponent.value) ||
        /** @type {SVGSVGElement | null} */ (
          hamburgerBtn.value?.querySelector("svg") || null
        );

      if (!svgRoot) {
        console.warn("HeaderGrid: hamburger SVG root not found");
        return;
      }

      // Cross-draw between #closed and #opened path sets using DrawSVG
      const closedPaths = svgRoot.querySelectorAll("#closed path");
      const openedPaths = svgRoot.querySelectorAll("#opened path");

      if (!closedPaths.length || !openedPaths.length) {
        console.warn(
          "HeaderGrid: expected #closed and #opened path groups in HamburgerSVG"
        );
        return;
      }

      // Read durations from CSS variables - handle both 's' and 'ms' units
      const html = document.documentElement;
      const hoverDurationRaw = getComputedStyle(html)
        .getPropertyValue("--duration-hover")
        .trim();

      let hoverDuration = 0.3; // Default fallback
      if (hoverDurationRaw.endsWith("ms")) {
        hoverDuration = parseFloat(hoverDurationRaw) / 1000; // Convert ms to seconds
      } else if (hoverDurationRaw.endsWith("s")) {
        hoverDuration = parseFloat(hoverDurationRaw); // Already in seconds
      }

      // Nav link hover effects are now handled by CSS (see base.scss)
      // No GSAP event listeners needed - browser-native :hover is simpler and more performant

      const tl = $gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
      });
      if ($DrawSVGPlugin) {
        // Initialize states
        $gsap.set(closedPaths, { autoAlpha: 1, drawSVG: "100%" });
        $gsap.set(openedPaths, { autoAlpha: 1, drawSVG: 0 });

        // Animate out closed, then in opened using CSS variable duration
        tl.to(
          closedPaths,
          { drawSVG: 0, duration: hoverDuration * 0.93, stagger: 0.04 },
          0
        ).to(
          openedPaths,
          { drawSVG: "100%", duration: hoverDuration * 1.07, stagger: 0.04 },
          "<+0.06"
        );
      } else {
        // Fallback without DrawSVG: simple crossfade
        $gsap.set(openedPaths, { autoAlpha: 0 });
        tl.to(
          closedPaths,
          { autoAlpha: 0, duration: hoverDuration * 0.6 },
          0
        ).to(
          openedPaths,
          { autoAlpha: 1, duration: hoverDuration * 0.73 },
          "<+0.05"
        );
      }
      hamburgerTl = tl;

      // Mobile overlay animation with clip-path reveal
      if (overlayRef.value) {
        const tl2 = $gsap.timeline({ paused: true });
        const links = overlayRef.value.querySelectorAll("a");

        // Prepare initial states for overlay and links
        $gsap.set(overlayRef.value, {
          opacity: 1,
          clipPath: `inset(${getComputedStyle(document.documentElement).getPropertyValue("--size-header").trim()} 0 100% 0 round 0px)`,
          willChange: "clip-path",
        });
        $gsap.set(links, { y: 12, autoAlpha: 0 });

        // Reveal overlay from header position, then animate links
        tl2
          .to(
            overlayRef.value,
            {
              clipPath: `inset(${getComputedStyle(document.documentElement).getPropertyValue("--size-header").trim()} 0 0% 0 round 0px)`,
              duration: hoverDuration * 1.17,
              ease: "power2.out",
            },
            0
          )
          .to(
            links,
            {
              autoAlpha: 1,
              y: 0,
              duration: hoverDuration,
              ease: "power2.out",
              stagger: 0.06,
            },
            "<+0.05"
          );

        // On reverse complete, reset overlay
        tl2.eventCallback("onReverseComplete", () => {
          if (overlayRef.value) {
            $gsap.set(overlayRef.value, {
              clipPath: `inset(${getComputedStyle(document.documentElement).getPropertyValue("--size-header").trim()} 0 100% 0 round 0px)`,
            });
            $gsap.set(links, { y: 12, autoAlpha: 0 });
          }
        });

        overlayTl = tl2;
      }

      // Create initial load animation if this is the first load
      if (isFirstLoad()) {
        // Use entrance animation system for unified control
        const { setupEntrance } = useEntranceAnimation();

        setupEntrance(containerRef.value, {
          position: "0.2", // First in the sequence (can be changed to reorder)
          animate: (el) => {
            const tl = $gsap.timeline({
              onStart: () =>
                console.log("🎬 Header entrance animation started"),
              onComplete: () => console.log("✨ Header entrance complete"),
            });

            // Elements are already hidden by CSS + is-first-load class
            // Just set initial transform states
            const brandEl = el.querySelector(".header-grid__brand");
            const navLinks = el.querySelectorAll(".header-grid__nav .nav-link");
            const spacerEl = el.querySelector(".header-grid__spacer");
            const hamburgerEl = el.querySelector(".header-grid__hamburger");

            if (brandEl) $gsap.set(brandEl, { x: -20, autoAlpha: 0 });
            if (navLinks) $gsap.set(navLinks, { y: -10, autoAlpha: 0 });
            if (spacerEl) $gsap.set(spacerEl, { x: 20, autoAlpha: 0 });
            if (hamburgerEl)
              $gsap.set(hamburgerEl, { scale: 0.8, autoAlpha: 0 });

            // Animate container in first
            tl.to(el, {
              autoAlpha: 1,
              duration: 0.6,
              ease: "power2.out",
            });

            // Then animate individual elements
            if (brandEl) {
              tl.to(
                brandEl,
                {
                  autoAlpha: 1,
                  x: 0,
                  duration: 0.8,
                  ease: "power3.out",
                },
                "-=0.4"
              );
            }

            if (navLinks && navLinks.length > 0) {
              tl.to(
                navLinks,
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power2.out",
                  stagger: 0.08,
                },
                "-=0.5"
              );
            }

            if (hamburgerEl) {
              tl.to(
                hamburgerEl,
                {
                  autoAlpha: 1,
                  scale: 1,
                  duration: 0.5,
                  ease: "back.out(1.5)",
                },
                "-=0.6"
              );
            }

            if (spacerEl) {
              tl.to(
                spacerEl,
                {
                  autoAlpha: 1,
                  x: 0,
                  duration: 0.7,
                  ease: "power3.out",
                },
                "-=0.4"
              );
            }

            return tl;
          },
        });
      }
    }, scopeEl);
  });
});

watch(isOpen, (open) => {
  if (hamburgerTl) {
    if (open) hamburgerTl.play();
    else hamburgerTl.reverse();
  }
  if (overlayTl) {
    if (open) overlayTl.play();
    else overlayTl.reverse();
  }
});

// Menu interactions
function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

onUnmounted(() => {
  if (gsapCtx && typeof gsapCtx.revert === "function") {
    gsapCtx.revert();
  }
});
</script>

<style scoped lang="scss"></style>
