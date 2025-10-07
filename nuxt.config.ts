// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://patryksmakosz.com",
    },
  },

  /**
   * Page Transition System - Progressive Enhancement
   *
   * Current: Phase 1 - Simple CSS transitions (see app.vue for styles)
   * Future: Will evolve through 5 phases to GSAP SVG morphing transitions
   *
   * Phase 1: CSS transitions (opacity, blur, scale, transform) - CURRENT
   * Phase 2: JavaScript lifecycle hooks
   * Phase 3: GSAP timeline integration
   * Phase 4: Advanced GSAP (stagger, SplitText, custom easing)
   * Phase 5: SVG shape morphing transitions (AAA quality)
   *
   * Configuration:
   * - name: 'page' - CSS class prefix (.page-enter-active, .page-leave-active)
   * - mode: 'out-in' - Old page leaves completely before new page enters
   *
   * Coordinates with ScrollSmoother hooks:
   * - page:start → Kill ScrollSmoother before transition
   * - page:finish → Reinit ScrollSmoother after transition
   *
   * Documentation: .claude/PAGE_TRANSITION_SYSTEM.md
   */
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: false, // No layout transitions needed

    head: {
      title:
        "Creative Developer & Web Animator | Front-End Developer with Expertise in Interactive Motion Design",
      titleTemplate: "%s · Patryk Smakosz",
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Expertise in Interactive Motion Design,immersive user experiences. With over 10 years of experience building Vue.js/Nuxt.js apps, custom WordPress themes, and animated web banners using GreenSock, SVG, and Canvas technologies, Patryk crafts dynamic digital products that engage and inspire worldwide brands and agencies.",
        },
        // Open Graph Basics
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Patryk Smakosz" },
        {
          property: "og:title",
          content:
            "Creative Developer & Web Animator | Front-End Developer with Expertise in Interactive Motion Design",
        },
        {
          property: "og:description",
          content:
            "Expertise in Interactive Motion Design,immersive user experiences. With over 10 years of experience building Vue.js/Nuxt.js apps, custom WordPress themes, and animated web banners using GreenSock, SVG, and Canvas technologies, Patryk crafts dynamic digital products that engage and inspire worldwide brands and agencies.",
        },
        // Absolute URLs are required by some scrapers (e.g., Facebook)
        {
          property: "og:url",
          content:
            process.env.NUXT_PUBLIC_SITE_URL ||
            "https://patryksmakosz.com/.local",
        },
        {
          property: "og:image",
          content: `${process.env.NUXT_PUBLIC_SITE_URL || "https://patryksmakosz.com/.local"}/og.jpg`,
        },
        {
          property: "og:image:secure_url",
          content: `${process.env.NUXT_PUBLIC_SITE_URL || "https://patryksmakosz.com/.local"}/og.jpg`,
        },
        {
          property: "og:image:alt",
          content:
            "Creative Developer & Web Animator | Front-End Developer with Expertise in Interactive Motion Design",
        },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content:
            "Creative Developer & Web Animator | Front-End Developer with Expertise in Interactive Motion Design",
        },
        {
          name: "twitter:description",
          content:
            "Expertise in Interactive Motion Design,immersive user experiences. With over 10 years of experience building Vue.js/Nuxt.js apps, custom WordPress themes, and animated web banners using GreenSock, SVG, and Canvas technologies, Patryk crafts dynamic digital products that engage and inspire worldwide brands and agencies.",
        },
        {
          name: "twitter:image",
          content: `${process.env.NUXT_PUBLIC_SITE_URL || "https://patryksmakosz.com/.local"}/og.jpg`,
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  components: [
    { path: "~/components", pathPrefix: false },
    { path: "~/components/SVG", pathPrefix: false },
  ],

  // Tailwind v4 + global SCSS. Order matters: Tailwind first, then custom SCSS.
  css: ["./app/assets/css/main.css"],

  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/eslint",
    "@hypernym/nuxt-gsap",
    "@pinia/nuxt",
    "@nuxt/content",
    "@maz-ui/nuxt",
    "@tresjs/nuxt",
  ],

  // Nuxt Fonts configuration (provider-based)
  fonts: {
    // Global defaults applied when resolving families automatically from CSS
    defaults: {
      weights: ["300", "400", "600"],
      styles: ["normal"],
      preload: true,
      subsets: ["latin", "latin-ext"],
    },
    // Explicitly define families
    families: [
      {
        name: "PP Eiko",
        provider: "local",
        weights: ["100", "300", "400", "500", "800", "900"],
        styles: ["normal", "italic"],
        global: true,
      },
      {
        name: "IBM Plex Sans JP",
        provider: "local",
        weights: ["100", "200", "300", "400", "500", "600", "700"],
        styles: ["normal"],
        global: true,
      },
    ],
  },

  // Enable TailwindCSS v4 via Vite plugin
  vite: {
    plugins: [tailwindcss()],
  },

  gsap: {
    composables: true,
    clubPlugins: {
      morphSvg: true,
      drawSvg: true,
      customBounce: true,
      customWiggle: true,
      splitText: true,
      gsDevTools: true,
      scrollSmoother: true,
    },
    extraPlugins: {
      observer: true,
      flip: true,
      scrollTrigger: true,
      motionPath: true,
    },
    extraEases: {
      custom: true,
    },
  },

  sourcemap: {
    client: "hidden",
  },
});
