# Nuxt Portfolio GSAP — Minimal Boilerplate

**GSAP-powered Nuxt 4 starter template with smooth animations**

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?logo=greensock&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)

> **Note:** GSAP plugins (ScrollSmoother, SplitText, MorphSVG) are now **completely free** as of 2025!

## About

Minimal boilerplate stripped from the [full portfolio template](https://github.com/patsma/nuxt-portfolio-gsap). Core animation infrastructure preserved — page transitions, smooth scrolling, entrance animations, theme switching — without content-specific components.

Use this as a foundation. All the hard plumbing is done.

## Features

### Animation

- **Page Transitions** - Directive-based GSAP animations (`v-page-split`, `v-page-fade`, `v-page-clip`, `v-page-stagger`)
- **Entrance Animations** - Unified timeline sequencer for coordinated first-load animations
- **Smooth Scrolling** - ScrollSmoother with parallax effects (`data-speed`, `data-lag`)
- **Theme Morphing** - SVG icon morphing between dark/light states

### Performance

- **60fps Desktop** - Optimized GSAP animations with proper cleanup
- **Safari Fixes** - Height lock fix, enter animation timing, ScrollSmoother settings
- **Mobile Optimized** - Native scroll on mobile, ScrollSmoother on desktop
- **FOUC Prevention** - SSR-injected theme script and `is-first-load` class scoping

### Visual

- **Theme System** - Dark/light with GSAP color transitions
- **Headroom Header** - Auto-hide/show on scroll direction
- **Loading System** - Theme-aware loader with progress bar

### Developer Experience

- **TypeScript** - Strict mode with full type coverage
- **Nuxt 4** - Latest features and Vue 3 Composition API
- **Well Documented** - Comprehensive `.claude/` system docs
- **Modular Architecture** - Clean separation of concerns

## Tech Stack

| Category  | Technology                                                               |
| --------- | ------------------------------------------------------------------------ |
| Framework | Nuxt 4 (Vue 3)                                                           |
| Language  | TypeScript (strict mode)                                                 |
| Animation | GSAP with Club plugins — ScrollSmoother, SplitText, MorphSVG (now free!) |
| Styling   | TailwindCSS v4 + SCSS                                                    |
| State     | Pinia                                                                    |
| Content   | Nuxt Content (MDC + YAML)                                                |

## Quick Start

```bash
# Clone
git clone https://github.com/patsma/nuxt-portfolio-gsap.git
cd nuxt-portfolio-gsap
git checkout minimal-boilerplate

# Install
npm install

# Dev server (http://localhost:3000)
npm run dev

# Production build
npm run build
```

## Template Pages

| Page  | Route    | Purpose                             |
| ----- | -------- | ----------------------------------- |
| Home  | `/`      | Hero + image scaling + text section |
| Demo  | `/demo`  | All components stacked for testing  |
| Blank | `/blank` | Empty starter (hero + spacer)       |

Add new pages by creating `.md` files in `content/`.

## Architecture

```
app/
├── composables/          # Animation & scroll logic
│   ├── usePageTransition.ts
│   ├── useScrollSmootherManager.ts
│   ├── useScrollTriggerInit.ts
│   ├── useEntranceAnimation.ts
│   └── useThemeSwitch.ts
├── directives/           # Page transition directives
│   ├── v-page-split.ts
│   ├── v-page-fade.ts
│   ├── v-page-clip.ts
│   └── v-page-stagger.ts
├── components/
│   ├── content/          # MDC content components
│   │   ├── HeroSection.vue
│   │   ├── TextSection.vue
│   │   ├── ImageSection.vue
│   │   └── ImageScalingSection.vue
│   ├── HeaderGrid.vue
│   ├── FooterSection.vue
│   └── ThemeToggleSVG.vue
├── layouts/              # ScrollSmoother wrapper
└── pages/
    └── [...slug].vue     # Catch-all MDC renderer
```

## Documentation

Detailed system documentation lives in `.claude/`:

| Document                                               | Description                              |
| ------------------------------------------------------ | ---------------------------------------- |
| [LOADING_SYSTEM.md](.claude/LOADING_SYSTEM.md)         | Theme-aware loader & entrance animations |
| [THEME_SYSTEM.md](.claude/THEME_SYSTEM.md)             | Dark/light switching with GSAP           |
| [PAGE_TRANSITIONS.md](.claude/PAGE_TRANSITIONS.md)     | Directive-based transition system        |
| [SCROLL_SYSTEM.md](.claude/SCROLL_SYSTEM.md)           | ScrollSmoother & headroom integration    |
| [COMPONENT_PATTERNS.md](.claude/COMPONENT_PATTERNS.md) | Reusable section patterns                |
| [OG_IMAGE_SYSTEM.md](.claude/OG_IMAGE_SYSTEM.md)       | Dynamic social sharing images            |
| [CONTENT_SYSTEM.md](.claude/CONTENT_SYSTEM.md)         | Nuxt Content YAML data system            |
| [APP_IMAGE_SYSTEM.md](.claude/APP_IMAGE_SYSTEM.md)     | Shimmer skeleton image wrapper           |

## Credits

Design & Development by [Morten Christensen](https://mschristensen.com) & [Patryk Smakosz](https://patryksmakosz.com)

## License

MIT
