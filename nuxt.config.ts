// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      siteUrl: "https://mortenchristensen.com",
    },
  },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: false, // No layout transitions needed

    head: {
      title: "Morten – Danish Designer in Tokyo | UX, UI & Digital Design",
      titleTemplate: "%s · Morten Christensen",
      htmlAttrs: { lang: "en" },

      // Inject loader CSS that renders immediately (works in SSR dev mode)
      style: [
        {
          textContent: `
            /* Initial loader - theme-aware, shown before Vue hydrates */
            #app-initial-loader {
              position: fixed;
              inset: 0;
              background: #fffaf5; /* Light theme default (--color-light-100) */
              z-index: 99999;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: opacity 0.5s ease-out;
            }

            #app-initial-loader.fade-out {
              opacity: 0;
              pointer-events: none;
            }

            /* Spinner - light theme */
            .app-loader-spinner {
              width: 48px;
              height: 48px;
              border: 2px solid rgba(9, 9, 37, 0.15); /* Dark with opacity */
              border-top-color: #090925; /* Dark spinner (--color-dark-100) */
              border-radius: 50%;
              animation: app-spin 0.8s linear infinite;
            }

            /* Dark theme overrides - class-based only */
            /* Blocking script handles BOTH localStorage AND system preference */
            /* No media query needed - prevents conflicts with manual toggle */
            .theme-dark #app-initial-loader {
              background: #090925; /* Dark background (--color-dark-100) */
            }

            .theme-dark .app-loader-spinner {
              border: 2px solid rgba(255, 250, 245, 0.15); /* Light with opacity */
              border-top-color: #fffaf5; /* Light spinner (--color-light-100) */
            }

            @keyframes app-spin {
              to { transform: rotate(360deg); }
            }

            /* Hide main content initially to prevent flash */
            #__nuxt {
              opacity: 0;
              transition: opacity 0.4s ease-in;
            }

            #__nuxt.loaded {
              opacity: 1;
            }
          `,
        },
      ],

      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Danish designer based in Tokyo approaching today's challenges with a digital-first and user-centred mindset. Specializing in UX/UI design, art direction, creative direction, and interactive design. Driven by passion to craft compelling solutions backed by insights and real data.",
        },
        // Open Graph Basics
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Morten Christensen" },
        {
          property: "og:title",
          content:
            "Morten – Danish Designer in Tokyo | UX, UI & Digital Design",
        },
        {
          property: "og:description",
          content:
            "Danish designer based in Tokyo approaching today's challenges with a digital-first and user-centred mindset. Specializing in UX/UI design, art direction, creative direction, and interactive design. Driven by passion to craft compelling solutions backed by insights and real data.",
        },
        // Absolute URLs are required by some scrapers (e.g., Facebook)
        {
          property: "og:url",
          content: "https://mortenchristensen.com",
        },
        {
          property: "og:image",
          content: "https://mortenchristensen.com/og.jpg",
        },
        {
          property: "og:image:secure_url",
          content: "https://mortenchristensen.com/og.jpg",
        },
        {
          property: "og:image:alt",
          content:
            "Morten – Danish Designer in Tokyo | UX, UI & Digital Design",
        },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content:
            "Morten – Danish Designer in Tokyo | UX, UI & Digital Design",
        },
        {
          name: "twitter:description",
          content:
            "Danish designer based in Tokyo approaching today's challenges with a digital-first and user-centred mindset. Specializing in UX/UI design, art direction, creative direction, and interactive design. Driven by passion to craft compelling solutions backed by insights and real data.",
        },
        {
          name: "twitter:image",
          content: "https://mortenchristensen.com/og.jpg",
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
    "nuxt-mcp",
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
