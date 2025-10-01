<template>
  <!--
    Simplified fixed header with responsive grid layout
    - Desktop: 1fr auto 1fr columns → logo (left), nav (center), empty (right)
    - Mobile: hamburger (left), logo (center), empty (right), nav hidden
    - Mobile overlay: appears below header, fills viewport minus header height
  -->
  <header
    ref="containerRef"
    class="header-grid bg-white fixed inset-x-0 top-0 z-50"
  >
    <div class="content-grid">
      <div class="breakout1 header-grid__inner">
        <!-- Top row: shared row for both desktop and mobile -->
        <div
          class="header-grid__row header-grid__row--top"
          data-boot-group="header-nav"
        >
          <!-- Hamburger: visible only on mobile, animates lines (no icon swap) -->
          <ClientOnly>
            <button
              ref="hamburgerBtn"
              class="header-grid__hamburger boot-hidden"
              :data-boot-item="0"
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
          </ClientOnly>

          <!-- Single logo used for both desktop and mobile -->
          <NuxtLink
            to="/"
            class="header-grid__brand boot-hidden"
            :data-boot-item="1"
          >
            LOGO
          </NuxtLink>

          <!-- Desktop nav centered (hidden on mobile) -->
          <nav class="header-grid__nav" aria-label="Primary">
            <NuxtLink
              v-for="(item, idx) in items"
              :key="item.href"
              :to="item.href"
              class="boot-hidden relative pp-eiko-mobile-custom-navigation-menu-items transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-px after:bg-accent after:transition-[width] after:duration-300 after:ease-out"
              :data-boot-item="idx + 2"
              :class="
                isActive(item.href)
                  ? 'text-accent after:w-full'
                  : 'text-ink hover:text-accent after:w-0 hover:after:w-full'
              "
            >
              {{ item.label }}
            </NuxtLink>
          </nav>

          <!-- Right spacer to balance the grid on desktop -->
          <div class="header-grid__spacer" aria-hidden="true" />
        </div>
      </div>
    </div>

    <!-- Mobile overlay: positioned under header; fills remaining viewport -->
    <div
      id="mobile-overlay"
      ref="overlayRef"
      class="fixed inset-x-0 top-[var(--size-header)] bottom-0 bg-white md:hidden z-40 opacity-0 pointer-events-none"
    >
      <div class="content-grid h-full">
        <div
          class="breakout1 py-[var(--space-m)] flex flex-col gap-[var(--space-s)]"
        >
          <NuxtLink
            v-for="item in items"
            :key="'m-' + item.href"
            :to="item.href"
            class="block relativ pp-eiko-mobile-custom-navigation-menu-items transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-px after:bg-accent after:transition-[width] after:duration-300 after:ease-out"
            :class="
              isActive(item.href)
                ? 'text-accent after:w-full'
                : 'text-ink hover:text-accent after:w-0 hover:after:w-full'
            "
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

// Nuxt GSAP services (provided by GSAP Nuxt module/plugin)
const { $gsap, $DrawSVGPlugin } = useNuxtApp();

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

// Navigation items — mirrors existing site structure
/** @typedef {{ label: string, href: string }} NavItem */
/** @type {NavItem[]} */
const items = [
  { label: "home", href: "/" },
  { label: "about", href: "/about" },
  { label: "colors", href: "/dev/colors" },
  { label: "typography", href: "/dev/typography" },
  { label: "responsive", href: "/dev/responsive" },
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

      const tl = $gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
      });
      if ($DrawSVGPlugin) {
        // Initialize states
        $gsap.set(closedPaths, { autoAlpha: 1, drawSVG: "100%" });
        $gsap.set(openedPaths, { autoAlpha: 1, drawSVG: 0 });

        // Animate out closed, then in opened
        tl.to(closedPaths, { drawSVG: 0, duration: 0.28, stagger: 0.04 }, 0).to(
          openedPaths,
          { drawSVG: "100%", duration: 0.32, stagger: 0.04 },
          "<+0.06"
        );
      } else {
        // Fallback without DrawSVG: simple crossfade
        $gsap.set(openedPaths, { autoAlpha: 0 });
        tl.to(closedPaths, { autoAlpha: 0, duration: 0.18 }, 0).to(
          openedPaths,
          { autoAlpha: 1, duration: 0.22 },
          "<+0.05"
        );
      }
      hamburgerTl = tl;

      // Animate overlay open/close using clip-path reveal + staggered links
      if (overlayRef.value) {
        const tl2 = $gsap.timeline({ paused: true });
        const links = overlayRef.value.querySelectorAll("a");

        // Prepare initial states for reveal and items
        $gsap.set(overlayRef.value, {
          opacity: 1, // we'll control visibility via clip-path
          clipPath: "inset(0 0 100% 0 round 0px)", // fully clipped (hidden)
          willChange: "clip-path",
        });
        $gsap.set(links, { y: 12, autoAlpha: 0 });

        // Enable interactions at start; disable on reverse end
        tl2.add(() => {
          $gsap.set(overlayRef.value, { pointerEvents: "auto" });
        }, 0);

        // Reveal overlay from top to bottom, then bring in links
        tl2
          .to(
            overlayRef.value,
            {
              clipPath: "inset(0 0 0% 0 round 0px)",
              duration: 0.35,
              ease: "power2.out",
            },
            0
          )
          .to(
            links,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
              stagger: 0.06,
            },
            "<+0.05"
          );

        // On reverse complete, hide interactions again
        tl2.eventCallback("onReverseComplete", () => {
          if (overlayRef.value) {
            $gsap.set(overlayRef.value, {
              pointerEvents: "none",
              clipPath: "inset(0 0 100% 0 round 0px)",
            });
            $gsap.set(links, { y: 12, autoAlpha: 0 });
          }
        });

        overlayTl = tl2;
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
