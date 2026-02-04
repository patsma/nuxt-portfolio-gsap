# Morten 2025

**Personal portfolio with buttery smooth animations**

[![Live Demo](https://img.shields.io/badge/Live-Demo-00DC82?style=for-the-badge)](https://mp2025.netlify.app)

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?logo=greensock&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TresJS](https://img.shields.io/badge/TresJS-WebGL-black?logo=three.js&logoColor=white)

---

## About

A custom-built portfolio featuring directive-based page transitions, smooth scrolling, and WebGL backgrounds. Every animation system is hand-crafted - no templates, no page builders, just clean TypeScript and GSAP.

What makes it technically interesting: SSR-compatible animations with zero FOUC, Safari-specific performance optimizations, and a unified timeline sequencer that coordinates entrance animations across components.

## Key Features

- **Page Transitions** - Directive-based GSAP animations (`v-page-split`, `v-page-fade`, `v-page-clip`)
- **Smooth Scrolling** - ScrollSmoother with headroom header behavior
- **Theme System** - Dark/light with GSAP color transitions and SVG morphing
- **Fluid Gradient** - WebGL background with TresJS and custom GLSL shaders
- **Entrance Animations** - Unified timeline sequencer for coordinated first-load animations
- **Mobile Optimized** - 60fps desktop, 30fps mobile with automatic detection

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Nuxt 4 (Vue 3) |
| Language | TypeScript (strict, no `any`) |
| Animation | GSAP with Club plugins (ScrollSmoother, SplitText, MorphSVG) |
| 3D/WebGL | TresJS with custom shaders |
| Styling | TailwindCSS v4 + SCSS |
| State | Pinia |

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/morten-2025.git
cd morten-2025

# Install
npm install

# Dev server (http://localhost:3000)
npm run dev

# Production build
npm run build
```

## Architecture

```
app/
├── composables/          # Animation & scroll logic
│   ├── usePageTransition.ts
│   ├── useScrollSmootherManager.ts
│   ├── useEntranceAnimation.ts
│   └── useThemeSwitch.ts
├── directives/           # Page transition directives
│   ├── v-page-split.ts
│   ├── v-page-fade.ts
│   └── v-page-clip.ts
├── components/           # Vue components
├── layouts/              # ScrollSmoother wrapper
└── pages/                # Route pages
```

## Documentation

Detailed system documentation lives in `.claude/`:

| Document | Description |
|----------|-------------|
| [LOADING_SYSTEM.md](.claude/LOADING_SYSTEM.md) | Theme-aware loader & entrance animations |
| [THEME_SYSTEM.md](.claude/THEME_SYSTEM.md) | Dark/light switching with GSAP |
| [PAGE_TRANSITIONS.md](.claude/PAGE_TRANSITIONS.md) | Directive-based transition system |
| [SCROLL_SYSTEM.md](.claude/SCROLL_SYSTEM.md) | ScrollSmoother & headroom integration |
| [COMPONENT_PATTERNS.md](.claude/COMPONENT_PATTERNS.md) | Reusable section patterns |
| [FLUID_GRADIENT.md](.claude/FLUID_GRADIENT.md) | WebGL background system |

## Performance

- **Safari Optimizations** - Height lock fix, enter animation timing, 60fps ScrollSmoother settings
- **Mobile Detection** - Automatic frame rate reduction (60fps → 30fps)
- **FOUC Prevention** - SSR-injected theme script and `is-first-load` class scoping
- **Type Safety** - Full TypeScript coverage with strict mode

## License

MIT
