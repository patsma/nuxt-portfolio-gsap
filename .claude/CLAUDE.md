# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GSAP-powered portfolio template built with Nuxt 4, featuring directive-based page transitions, ScrollSmoother, theme-aware loading system, and smooth dark/light theme switching.

**Live demo:** https://mp2025.netlify.app

## Commands

```bash
npm run dev              # Dev server (http://localhost:3000) - includes SCSS watch
npm run build            # Production build
npm run generate         # Generate static site
npm run preview          # Preview production build
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run typecheck        # TypeScript type checking
npm run styles:build     # Build SCSS manually (usually not needed)
```

## Key Systems

### Loading System
Theme-aware initial loader with SSR support and entrance animation sequencing.

**Features:** Blocking theme detection, minimum display time enforcement, entrance animation coordinator, event-driven resource tracking

📖 **See** `.claude/LOADING_SYSTEM.md`

### Entrance Animation System
Unified GSAP timeline sequencer for component entrance animations on first page load.

**Pattern:** Components use `setupEntrance()` with GSAP position parameters for full timing control.

```typescript
setupEntrance(elementRef.value, {
  position: '<-0.3',  // Overlap previous by 0.3s
  animate: (el: HTMLElement) => {
    const tl = $gsap.timeline()
    tl.to(el, { autoAlpha: 1, y: 0, duration: 0.8 })
    return tl
  }
})
```

**HTML Class Scoping:** `html.is-first-load` prevents FOUC on first load, allows page transitions on navigation.

📖 **See** `.claude/LOADING_SYSTEM.md` (Entrance Animation System section)

### Theme System
GSAP-animated dark/light theme with localStorage persistence and SSR compatibility.

**Features:** Smooth color transitions, manual toggle overrides system preference, SVG icon morphing, Pinia store with hydration, no FOUC

**Component Patterns:** Typography utility classes, Tailwind-first approach, when to use SCSS

📖 **See** `.claude/THEME_SYSTEM.md`

### Page Transitions
Directive-based GSAP transitions with manual control. NO auto-detection - mark exactly which elements animate.

**Directives:** `v-page-split`, `v-page-fade`, `v-page-clip`, `v-page-stagger`

**Safari Optimizations:** Height lock fix, enter animation timing fix, 60fps ScrollSmoother settings

📖 **See** `.claude/PAGE_TRANSITIONS.md`

### Scroll System
ScrollSmoother with headroom header behavior for buttery smooth scrolling.

**Features:** 60fps smooth scrolling, parallax effects (data-speed, data-lag), headroom auto-hide/show, pause/resume during transitions

📖 **See** `.claude/SCROLL_SYSTEM.md`

### Component Patterns
Reusable component architectures and layout patterns for building consistent section components.

**Patterns:** FullWidthBorder abstraction, 4-column grid layouts, BiographySection, ExperienceSection, scroll animations, responsive strategies

📖 **See** `.claude/COMPONENT_PATTERNS.md`

### Magnetic Effect
Spring physics composable for organic magnetic hover effects.

**Features:** Spring physics with timeScale, velocity tracking, auto-disabled on mobile, reusable composable

📖 **See** `.claude/MAGNETIC_EFFECT.md`

### Fluid Gradient
TresJS WebGL background with theme-aware colors and scroll-reactive effects.

**Features:** Custom GLSL shaders, GSAP ticker rendering, theme color transitions, scroll-based parameter animation, mobile-optimized (30fps simplified shader)

📖 **See** `.claude/FLUID_GRADIENT.md`

### OG Image System
Dynamic social sharing images with nuxt-og-image module.

**Features:** Custom template, global defaults, per-page dynamic generation, dev debug panel

📖 **See** `.claude/OG_IMAGE_SYSTEM.md`

## Architecture

### File Structure

```
app/
├── assets/css/
│   ├── main.css          # CSS orchestrator (pre → Tailwind → post)
│   ├── pre.scss          # Tokens, base (BEFORE Tailwind)
│   └── post.scss         # Components (AFTER Tailwind)
├── composables/
│   ├── usePageTransition.ts              # Transition logic + Safari fixes
│   ├── useScrollSmootherManager.ts       # ScrollSmoother lifecycle
│   ├── useScrollTriggerInit.ts           # ScrollTrigger coordination abstraction (used by 7+ components)
│   ├── useEntranceAnimation.ts           # Entrance animation coordinator
│   ├── useThemeSwitch.ts                 # Dark/light theme GSAP timeline
│   ├── useLoadingSequence.ts             # Loading orchestrator
│   ├── useAccordionAnimation.ts          # GSAP accordion expand/collapse
│   ├── useHorizontalLoop.ts              # Infinite horizontal marquee loop
│   ├── useMagnetic.ts                    # Spring physics hover effect
│   ├── useInteractiveCaseStudyPreview.ts # Case study hover preview state machine
│   ├── useIsMobile.ts                    # Breakpoint detection (VueUse)
│   ├── useLocalTime.ts                   # Live timezone clock
│   ├── useVideoPoster.ts                 # First-frame video poster extraction
│   └── useIOSSafari.ts                   # iOS Safari detection
├── directives/
│   ├── v-page-split.ts       # SplitText animations
│   ├── v-page-fade.ts        # Fade animations
│   ├── v-page-clip.ts        # Clip-path reveals
│   └── v-page-stagger.ts     # Stagger children
├── plugins/
│   ├── page-transitions.ts      # Register directives
│   ├── theme.client.ts          # Theme initialization
│   ├── loader-manager.client.ts # Loader removal
│   ├── headroom.client.ts       # Header show/hide
│   ├── fonts.client.ts          # Apply font CSS variables from app.config.ts
│   ├── resize-reload.client.ts  # Reload on viewport resize (GSAP state reset)
│   └── mobile-debug.client.ts   # On-screen debug console (disabled by default)
├── stores/
│   ├── theme.ts             # Theme state (Pinia)
│   ├── loading.ts           # Loading state
│   ├── pageTransition.ts    # Page transition state machine
│   ├── menu.ts              # Hamburger menu open/close
│   ├── hints.ts             # UI hint tracking (localStorage)
│   └── title-rotation.ts   # Hero title rotation state
├── layouts/
│   └── default.vue          # ScrollSmoother + page transitions
├── pages/
│   ├── index.vue            # Home
│   ├── about.vue            # About
│   └── contact.vue          # Contact
├── components/
│   ├── HeaderGrid.vue              # Fixed header with mobile overlay
│   ├── content/HeroSection.vue     # Hero with entrance animation support
│   ├── BiographySection.vue        # Simple 2-column section
│   ├── ExperienceSection.vue       # Experience list with scroll animations
│   ├── ExperienceItem.vue          # Individual experience entry
│   ├── InteractiveCaseStudySection.vue  # Gallery with hover preview
│   ├── InteractiveCaseStudyItem.vue     # Individual case study item
│   ├── FullWidthBorder.vue         # Reusable border divider
│   ├── CursorTrail.vue             # Cursor trail effect
│   ├── FluidGradient.vue           # Animated gradient background
│   └── ThemeToggleSVG.vue          # Theme switcher
server/
└── plugins/
    └── inject-loader.ts # Nitro plugin: loader + theme script + is-first-load class
```

### Stack

- **Framework:** Nuxt 4 (Vue 3) with Composition API
- **Styling:** TailwindCSS v4 + SCSS preprocessing
- **Animation:** GSAP with Club GreenSock plugins (free as of 2025)
- **Type Safety:** TypeScript with full type annotations
- **State:** Pinia + Vue composables
- **Content:** Nuxt Content module

### GSAP Integration (@hypernym/nuxt-gsap)

**Premium plugins:**
- MorphSVG, DrawSVG, SplitText, ScrollSmoother, CustomBounce/Wiggle, GSDevTools

**Extra plugins:**
- ScrollTrigger, Observer, Flip, MotionPath

**Access:**
```typescript
const { $gsap, $ScrollTrigger, $SplitText } = useNuxtApp()
```

### CSS Architecture

```
pre.scss → Tailwind → post.scss
```

1. **pre.scss** - Design tokens, base styles, early utilities
2. **Tailwind** - Generated utility classes
3. **post.scss** - Complex components needing Tailwind classes

**Critical:** Keep `main.css` as CSS file (not SCSS) for TailwindCSS v4 compatibility.

## Key Patterns

### Module-Level State (ScrollSmoother)

```typescript
// useScrollSmootherManager.ts
let smootherInstance: ScrollSmoother | null = null // Module-level, persists across calls

export const useScrollSmootherManager = () => {
  const createSmoother = (options: ScrollSmootherConfig): void => {
    smootherInstance = ScrollSmoother.create(options)
  }
  // ...
}
```

**Benefits:** Single source of truth, proper cleanup, no circular dependencies.

### Directive Config Storage

```typescript
// v-page-fade.ts
import type { Directive, DirectiveBinding } from 'vue'
import type { FadeBindingValue, PageAnimationElement } from '~/types/directives'

const vPageFade: Directive<PageAnimationElement, FadeBindingValue> = {
  mounted(el: PageAnimationElement, binding: DirectiveBinding<FadeBindingValue>) {
    el._pageAnimation = {
      type: 'fade',
      config: { /* ... */ }
    }
  }
}
```

**Pattern:** Directives store config, composable reads and animates.

### ScrollTrigger Initialization (useScrollTriggerInit)

Abstracts the repetitive pattern of setting up ScrollTrigger animations that need to coordinate with the loading system and page transitions. Used by 7+ section components.

```typescript
// In any component that needs ScrollTrigger
let scrollTriggerInstance: ScrollTriggerInstance | null = null

useScrollTriggerInit(
  () => {
    // Init — called after first load or after page transition completes
    scrollTriggerInstance = $ScrollTrigger.create({ ... })
  },
  () => {
    // Cleanup — called on unmount
    scrollTriggerInstance?.kill()
    scrollTriggerInstance = null
  }
)
```

**Why:** Handles first-load vs navigation timing automatically. Without this, ScrollTrigger initializes before the page is in final position.

📖 **See** `.claude/SCROLL_SYSTEM.md`

### HTML Class Scoping (FOUC Prevention)

```css
/* base.scss - only applies when class exists */
html.is-first-load [data-entrance-animate="true"] {
  opacity: 0;
  visibility: hidden;
}
```

**Flow:**
1. SSR injects `is-first-load` class before page loads
2. First load: Class exists → CSS hides → Animations play → Class removed
3. Navigation: No class → Elements visible → Page transitions work

### Layout Structure for ScrollSmoother

```vue
<div id="smooth-wrapper">
  <HeaderGrid />  <!-- Fixed, OUTSIDE smooth-content -->

  <div id="smooth-content">
    <div class="layout-wrapper">
      <NuxtPage :transition="{ ... }" />
    </div>
  </div>
</div>
```

**Why:** Fixed elements must be outside smooth-content (ScrollSmoother applies transform).

## Page Structure Requirements

```vue
<template>
  <div class="page-content">
    <h1 v-page-split:chars data-speed="0.7">Title</h1>
    <p v-page-fade:up data-lag="0.15">Content</p>
  </div>
</template>
```

## Debugging

### Page Transitions
Watch console logs for:
```
🚀 Page LEAVE
🔍 Found elements with directives: 5
🎬 Page ENTER
🔍 Found elements with directives: 6
🔄 ScrollSmoother refreshed
```

Missing logs indicate: directives not registered, wrong page structure (missing `.page-content`), or ScrollSmoother not initialized.

## System Documentation

Detailed documentation for each system lives in `.claude/`:

| Document | Description |
|----------|-------------|
| `LOADING_SYSTEM.md` | Theme-aware loader & entrance animations |
| `THEME_SYSTEM.md` | Dark/light switching with GSAP |
| `PAGE_TRANSITIONS.md` | Directive-based transition system |
| `SCROLL_SYSTEM.md` | ScrollSmoother & headroom integration |
| `COMPONENT_PATTERNS.md` | Reusable section patterns |
| `FLUID_GRADIENT.md` | TresJS WebGL background system |
| `OG_IMAGE_SYSTEM.md` | Dynamic social sharing images |
| `MAGNETIC_EFFECT.md` | Spring physics hover effects |
| `ELASTIC_BORDER.md` | Physics-based elastic border effect |
| `INTERACTIVE_CASE_STUDY.md` | Interactive case study gallery |
| `CONTENT_SYSTEM.md` | Nuxt Content YAML data system |
| `NUXT-STUDIO.md` | Self-hosted Studio CMS integration |
