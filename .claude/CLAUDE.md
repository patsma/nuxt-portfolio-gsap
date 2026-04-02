# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minimal GSAP-powered boilerplate template built with Nuxt 4. Preserves core animation infrastructure — directive-based page transitions, ScrollSmoother, theme-aware loading system, entrance animations, and smooth dark/light theme switching — stripped of all content-specific components.

**Branch:** `minimal-boilerplate` — use as a foundation for new GSAP+Nuxt projects.

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
  position: '<-0.3', // Overlap previous by 0.3s
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

**Patterns:** FullWidthBorder abstraction, content-grid layouts, scroll animations, responsive strategies

📖 **See** `.claude/COMPONENT_PATTERNS.md`

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
│   ├── usePageTransition.ts        # Transition logic + Safari fixes
│   ├── useScrollSmootherManager.ts # ScrollSmoother lifecycle
│   ├── useScrollTriggerInit.ts     # ScrollTrigger coordination abstraction
│   ├── useEntranceAnimation.ts     # Entrance animation coordinator
│   ├── useThemeSwitch.ts           # Dark/light theme GSAP timeline
│   ├── useLoadingSequence.ts       # Loading orchestrator
│   ├── useIsMobile.ts              # Breakpoint detection (VueUse)
│   ├── useLocalTime.ts             # Live timezone clock
│   └── useIOSSafari.ts             # iOS Safari detection
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
│   └── resize-reload.client.ts  # Reload on viewport resize (GSAP state reset)
├── stores/
│   ├── theme.ts             # Theme state (Pinia)
│   ├── loading.ts           # Loading state
│   ├── pageTransition.ts    # Page transition state machine
│   └── menu.ts              # Hamburger menu open/close
├── layouts/
│   └── default.vue          # ScrollSmoother + page transitions
├── pages/
│   └── [...slug].vue        # Catch-all MDC page renderer
├── components/
│   ├── HeaderGrid.vue              # Fixed header with mobile overlay
│   ├── FooterSection.vue           # Minimal footer with social links
│   ├── FullWidthBorder.vue         # Reusable border divider
│   ├── AppImage.vue                # Image with shimmer skeleton
│   ├── ThemeToggleSVG.vue          # Theme switcher
│   ├── SVG/HamburgerSVG.vue        # Hamburger icon animation
│   ├── SVG/ScrollButtonSVG.vue     # Scroll indicator
│   ├── OgImage/OgImagePortfolio.vue # OG image template
│   ├── content/HeroSection.vue      # Hero with entrance animations
│   ├── content/TextSection.vue      # Text section with scroll reveal
│   ├── content/ImageSection.vue     # Image with parallax
│   ├── content/ImageScalingSection.vue  # Scroll-driven image growth
│   ├── content/VideoScalingSection.vue  # Scroll-driven video growth
│   └── content/SpacerComponent.vue      # Vertical spacer
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
  mounted(
    el: PageAnimationElement,
    binding: DirectiveBinding<FadeBindingValue>
  ) {
    el._pageAnimation = {
      type: 'fade',
      config: {
        /* ... */
      }
    }
  }
}
```

**Pattern:** Directives store config, composable reads and animates.

### ScrollTrigger Initialization (useScrollTriggerInit)

Abstracts the repetitive pattern of setting up ScrollTrigger animations that need to coordinate with the loading system and page transitions.

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
html.is-first-load [data-entrance-animate='true'] {
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

## Pages

Three template pages via MDC content rendering (`app/pages/[...slug].vue`):

- **Home** (`content/index.md`) — Hero + image scaling + text section
- **Demo** (`content/demo.md`) — All components stacked for testing
- **Blank** (`content/blank.md`) — Empty starter page (hero + spacer)

Add new pages by creating `.md` files in `content/`.

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

| Document                | Description                               |
| ----------------------- | ----------------------------------------- |
| `LOADING_SYSTEM.md`     | Theme-aware loader & entrance animations  |
| `THEME_SYSTEM.md`       | Dark/light switching with GSAP            |
| `PAGE_TRANSITIONS.md`   | Directive-based transition system         |
| `SCROLL_SYSTEM.md`      | ScrollSmoother & headroom integration     |
| `COMPONENT_PATTERNS.md` | Reusable section patterns                 |
| `OG_IMAGE_SYSTEM.md`    | Dynamic social sharing images             |
| `CONTENT_SYSTEM.md`     | Nuxt Content YAML data system             |
| `NUXT-STUDIO.md`        | Self-hosted Studio CMS integration        |
| `APP_IMAGE_SYSTEM.md`   | Shimmer skeleton image wrapper (AppImage) |
