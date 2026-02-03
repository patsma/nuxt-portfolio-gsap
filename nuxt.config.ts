// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({

  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@nuxt/eslint', '@hypernym/nuxt-gsap', '@pinia/nuxt', '@nuxt/content', 'nuxt-studio', '@maz-ui/nuxt', 'nuxt-mcp', '@tresjs/nuxt', '@vueuse/nuxt', 'nuxt-og-image'],

  components: [
    { path: '~/components', pathPrefix: false },
    { path: '~/components/SVG', pathPrefix: false }
  ],
  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: false, // No layout transitions needed

    head: {
      title: 'Morten Stig Christensen – Digital Designer',
      titleTemplate: '%s · Morten Stig Christensen',
      htmlAttrs: { lang: 'en' },

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

            /* Gradient loader - light theme */
            .app-loader-gradient {
              position: fixed;
              inset: 0;
              width: 100vw;
              height: 100vh;
              background-image: radial-gradient(
                circle,
                rgba(255, 200, 196, 0.6),
                rgba(255, 250, 245, 0.3),
                rgba(255, 250, 245, 0.1)
              );
              animation: app-gradient-pulse 2s infinite linear;
              transform: scale(1);
            }

            /* Dark theme overrides - class-based only */
            /* Blocking script handles BOTH localStorage AND system preference */
            /* No media query needed - prevents conflicts with manual toggle */
            .theme-dark #app-initial-loader {
              background: #090925; /* Dark background (--color-dark-100) */
            }

            .theme-dark .app-loader-gradient {
              background-image: radial-gradient(
                circle,
                rgba(45, 28, 70, 0.4),
                rgba(28, 45, 80, 0.2),
                rgba(9, 9, 37, 0.05)
              );
            }

            @keyframes app-gradient-pulse {
              0% { transform: scale(1.8); }
              50% { transform: scale(1); }
              100% { transform: scale(1.8); }
            }

            /* Hide main content initially to prevent flash */
            #__nuxt {
              opacity: 0;
              transition: opacity 0.4s ease-in;
            }

            #__nuxt.loaded {
              opacity: 1;
            }
          `
        }
      ],

      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
                {
          name: 'description',
          content:
            'Hey, I\'m Morten. A Danish digital designer and developer based in Tokyo, shaping experiences that are rooted in purpose, function, and craft.'
        },
        // Open Graph Basics
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Morten Stig Christensen' },
        {
          property: 'og:title',
          content: 'Morten Stig Christensen – Digital Designer'
        },
        {
          property: 'og:description',
          content:
            'Hey, I\'m Morten. A Danish digital designer and developer based in Tokyo, shaping experiences that are rooted in purpose, function, and craft.'
        },
        // Absolute URLs are required by some scrapers (e.g., Facebook)
        {
          property: 'og:url',
          content: 'https://mschristensen.com'
        },
        {
          property: 'og:image',
          content: 'https://mschristensen.com/og.png'
        },
        {
          property: 'og:image:secure_url',
          content: 'https://mschristensen.com/og.png'
        },
        {
          property: 'og:image:alt',
          content: 'Morten Stig Christensen – Digital Designer'
        },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'Morten Stig Christensen – Digital Designer'
        },
        {
          name: 'twitter:description',
          content:
            'Hey, I\'m Morten. A Danish digital designer and developer based in Tokyo, shaping experiences that are rooted in purpose, function, and craft.'
        },
        {
          name: 'twitter:image',
          content: 'https://mschristensen.com/og.png'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/gif', href: '/favicon.gif' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },

  // Tailwind v4 + global SCSS. Order matters: Tailwind first, then custom SCSS.
  css: ['./app/assets/css/main.css'],
  runtimeConfig: {
    public: {
      siteUrl: 'https://mschristensen.com'
    }
  },

  sourcemap: {
    client: 'hidden'
  },
  compatibilityDate: '2025-07-15',

  // Enable TailwindCSS v4 via Vite plugin
  vite: {
    plugins: [tailwindcss()]
  },

  // ESLint configuration - enable stylistic formatting
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
        commaDangle: 'never'
      }
    }
  },

  // Nuxt Fonts configuration (provider-based)
  fonts: {
    // Global defaults applied when resolving families automatically from CSS
    defaults: {
      weights: ['300', '400', '600'],
      styles: ['normal'],
      preload: true,
      subsets: ['latin', 'latin-ext']
    },
    // Explicitly define families
    families: [
      {
        name: 'PP Eiko',
        provider: 'local',
        weights: ['100', '300', '400', '500', '800', '900'],
        styles: ['normal', 'italic'],
        global: true
      },
      {
        name: 'IBM Plex Sans JP',
        provider: 'local',
        weights: ['100', '200', '300', '400', '500', '600', '700'],
        styles: ['normal'],
        global: true
      }
    ]
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
      scrollSmoother: true
    },
    extraPlugins: {
      observer: true,
      flip: true,
      scrollTrigger: true,
      motionPath: true
    },
    extraEases: {
      custom: true
    }
  },

  // Nuxt Studio configuration (self-hosted)
  studio: {
    dev: false,
    repository: {
      provider: 'github',
      owner: 'patsma',
      repo: 'morten-2025',
      branch: 'main'
    }
  }
})
