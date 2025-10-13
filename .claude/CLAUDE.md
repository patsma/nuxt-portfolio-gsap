# Morten 2025 - Codebase Guide

Personal portfolio for Patryk Smakosz built with Nuxt 4, featuring directive-based GSAP page transitions and ScrollSmoother integration.

## Quick Start

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run styles:build     # Build SCSS manually
npm run styles:watch     # Watch SCSS changes
npm run preview          # Preview production build
npm run generate         # Generate static site
```

## Page Transitions

**Philosophy**: Manual control via directives - NO auto-detection.

### Usage Example

```vue
<template>
  <div class="page-content">
    <h1 v-page-split:chars data-speed="0.7">Animated Title</h1>
    <p v-page-fade:up data-lag="0.15">Fades up with lag</p>
    <div v-page-clip:top>Clip reveal</div>
    <ul v-page-stagger>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </div>
</template>
```

### Available Directives

- **v-page-split:chars|words|lines** - SplitText animations with masking
- **v-page-fade:up|down|left|right** - Fade with directional movement
- **v-page-clip:top|bottom|left|right** - Modern clip-path reveals
- **v-page-stagger** - Stagger child elements

### ScrollSmoother Parallax

- **data-speed** - Movement speed relative to scroll (0.5 = slower, 1.5 = faster)
- **data-lag** - Smooth "catch up" trailing effect (0.1 to 0.3 typical)

### Lifecycle

1. **Directives Store Config** - When mounted, directives attach animation config to `element._pageAnimation`
2. **Page Leaves** - `usePageTransition` finds marked elements and animates them OUT
3. **DOM Swap** - Vue swaps old page for new page
4. **Page Enters** - New page elements animate IN with opposite animations
5. **ScrollSmoother Refresh** - Parallax effects recalculate for new content

## Safari Fixes (CRITICAL)

### Fix 1: SplitText Height Jump (~7px)

**Problem**: SplitText masking adds height, causing visible layout jump on Safari.

**Solution**: Lock height BEFORE SplitText runs in `animateSplit()`:
```javascript
const originalHeight = el.offsetHeight
$gsap.set(el, { height: originalHeight })
const split = $SplitText.create(el, { type: splitType, mask: splitType })
```

### Fix 2: Enter Animations Start Too Fast

**Problem**: Safari executes animations before DOM is fully painted, appearing "half-done".

**Solution**: Hide page + double requestAnimationFrame:
```javascript
// In beforeEnter
const beforeEnter = (el) => {
  $gsap.set(el, { visibility: 'hidden' })
}

// In enter - wait for Safari to paint DOM
const enter = (el, done) => {
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        $gsap.set(el, { visibility: 'visible' })
        // Now animate...
      })
    })
  })
}
```

The double `requestAnimationFrame` gives Safari TWO paint cycles to complete layout before animations start.

### Fix 3: ScrollSmoother Performance (14fps → 60fps)

**Settings**:
```javascript
createSmoother({
  smooth: 1,                    // Lower value = better Safari performance
  effects: true,                // Enable data-speed and data-lag
  normalizeScroll: true,        // Improves Safari performance
  ignoreMobileResize: true      // Prevents mobile jank
})
```

## Architecture

### File Structure

```
app/
├── assets/css/
│   ├── main.css          # CSS orchestrator (pre → Tailwind → post)
│   ├── pre.scss          # Tokens, base (BEFORE Tailwind)
│   └── post.scss         # Components (AFTER Tailwind)
├── composables/
│   ├── usePageTransition.js           # Transition logic + Safari fixes
│   ├── useScrollSmootherManager.js    # ScrollSmoother lifecycle
│   ├── useThemeSwitch.js              # Dark/light theme
│   └── useIsMobile.js                 # Mobile detection
├── directives/
│   ├── v-page-split.js       # SplitText animations
│   ├── v-page-fade.js        # Fade animations
│   ├── v-page-clip.js        # Clip-path reveals
│   └── v-page-stagger.js     # Stagger children
├── plugins/
│   ├── page-transitions.js   # Register directives globally
│   └── headroom.client.js    # Header show/hide behavior
├── layouts/
│   └── default.vue           # ScrollSmoother wrapper + page transitions
├── pages/
│   ├── index.vue             # Home page
│   ├── about.vue             # About page
│   └── contact.vue           # Contact page
└── components/
    ├── HeaderGrid.vue        # Fixed header with mobile overlay
    └── ThemeToggleSVG.vue    # Theme switcher
```

### Stack Overview

- **Framework**: Nuxt 4 (Vue 3) with Composition API
- **Styling**: TailwindCSS v4 via Vite + SCSS preprocessing
- **Animation**: GSAP with premium Club GreenSock plugins (FREE as of 2025)
- **Type Safety**: JSDoc type annotations (NO TypeScript)
- **State Management**: Pinia + Vue composables
- **Content**: Nuxt Content module

### GSAP Integration (@hypernym/nuxt-gsap)

Premium plugins enabled via Club GreenSock (free since 2025):
- **MorphSVG** - Morph between SVG shapes
- **DrawSVG** - Animate SVG stroke drawing
- **SplitText** - Split text into animatable chars/words/lines
- **ScrollSmoother** - Smooth scrolling with parallax effects
- **CustomBounce/CustomWiggle** - Advanced easing curves
- **GSDevTools** - Timeline debugging in development

Extra plugins:
- **ScrollTrigger** - Scroll-based animations (required for ScrollSmoother)
- **Observer** - Mutation and resize observers
- **Flip** - First Last Invert Play technique
- **MotionPath** - Animate along SVG paths

Access in components:
```javascript
const { $gsap, $ScrollTrigger, $SplitText } = useNuxtApp()
```

### CSS Architecture (Three-Layer System)

```
pre.scss → Tailwind → post.scss
```

1. **pre.scss** - Loads BEFORE Tailwind
   - CSS custom properties (design tokens)
   - Base styles, resets
   - Early utilities that Tailwind should see

2. **Tailwind** - Generated by TailwindCSS v4
   - Utility classes
   - Responsive variants
   - Component layer

3. **post.scss** - Loads AFTER Tailwind
   - Complex components needing Tailwind classes
   - Layout-specific styles
   - Overrides and refinements

**Critical**: Keep `main.css` as CSS file (not SCSS) for TailwindCSS v4 compatibility.

## Key Patterns

### Module-Level State for ScrollSmoother

The `useScrollSmootherManager.js` composable uses module-level state to share a single ScrollSmoother instance:

```javascript
let smootherInstance = null // Module-level, persists across calls

export const useScrollSmootherManager = () => {
  const createSmoother = (options) => {
    smootherInstance = ScrollSmoother.create(options)
  }

  const killSmoother = () => {
    if (smootherInstance) {
      smootherInstance.kill()
      smootherInstance = null
    }
  }

  const refreshSmoother = () => {
    if (smootherInstance) {
      smootherInstance.effects('[data-speed], [data-lag]')
      smootherInstance.refresh()
    }
  }

  return { createSmoother, killSmoother, refreshSmoother }
}
```

This ensures:
- Single source of truth for ScrollSmoother instance
- Proper cleanup without stale references
- Composables can refresh without circular dependencies

### Directive Config Storage Pattern

Directives store animation configuration directly on DOM elements:

```javascript
// In v-page-fade.js directive
export default {
  mounted(el, binding) {
    const direction = binding.arg || 'up'
    const config = binding.value || {}

    el._pageAnimation = {
      type: 'fade',
      config: {
        direction,
        distance: config.distance || 20,
        duration: config.duration || 0.6,
        ease: config.ease || 'power2.out'
      }
    }
  },

  getSSRProps() {
    return {} // SSR-compatible
  }
}
```

This pattern:
- Keeps directive logic simple (just store config)
- Composable reads config and creates animations
- SSR-compatible (no DOM manipulation during SSR)
- Clean separation of concerns

### Layout Structure for ScrollSmoother

ScrollSmoother requires specific DOM structure:

```vue
<!-- app/layouts/default.vue -->
<div id="smooth-wrapper">
  <HeaderGrid />  <!-- Fixed header OUTSIDE smooth-content -->

  <div id="smooth-content">
    <div class="layout-wrapper">
      <NuxtPage :transition="{ ... }" />
    </div>
  </div>
</div>
```

**Why this structure**:
- HeaderGrid is positioned fixed, outside smooth-content
- smooth-content is the scrollable container
- ScrollSmoother transforms smooth-content for smooth scrolling
- Page transitions happen inside layout-wrapper

## Development Notes

### Running Dev Server
- Dev server runs on `http://localhost:3000`
- SCSS watch is automatically included in `npm run dev`
- Changes to SCSS files trigger automatic rebuild
- Changes to Vue files trigger hot module replacement

### SCSS Compilation
SCSS files are compiled to CSS using Sass CLI:
- `pre.scss` → `pre.css`
- `post.scss` → `post.css`
- Both are imported in `main.css`
- Watch mode runs in parallel with Nuxt dev server

### Page Structure Requirements
All pages must wrap content in `.page-content` for transitions:

```vue
<template>
  <div class="page-content">
    <h1 v-page-split:chars data-speed="0.7">Title</h1>
    <p v-page-fade:up data-lag="0.15">Content</p>
  </div>
</template>
```

### Debugging Page Transitions
Watch console logs during navigation:
```
🚀 Page LEAVE
🔍 Finding animated elements in: <div class="page-content">
🔍 Found elements with directives: 5
🎬 Page ENTER
🔍 Finding animated elements in: <div class="page-content">
🔍 Found elements with directives: 6
🔄 ScrollSmoother effects recalculated
🔄 ScrollSmoother refreshed
```

Missing logs indicate:
- Directives not registered (check `plugins/page-transitions.js`)
- Wrong page structure (missing `.page-content`)
- ScrollSmoother not initialized (check layout)

### Common Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| Animations not running | Directives not registered | Check `plugins/page-transitions.js` loads |
| Elements jump during transition | ScrollSmoother not refreshed | Verify `refreshSmoother()` called in enter() |
| SplitText not working | Plugin not enabled | Enable `splitText: true` in nuxt.config |
| No parallax effects | effects: false | Set `effects: true` in createSmoother() |
| Duplicated imports warning | Naming conflict | Use distinct names (e.g., `useScrollSmootherManager`) |

## Reference Implementation

Based on [nuxt4page-transitions](https://github.com/user/nuxt4page-transitions) with Safari enhancements:

Key files:
- `app/composables/usePageTransition.js` - Core transition logic (471 lines)
- `app/composables/useScrollSmootherManager.js` - ScrollSmoother lifecycle
- `app/directives/*.js` - Four animation directives
- `app/plugins/page-transitions.js` - Register directives globally
- `app/layouts/default.vue` - Integration layer
- `app/router.options.ts` - Manual scroll control

Safari enhancements:
- Height lock fix for SplitText (prevents 7px jump)
- Enter animation timing fix (double requestAnimationFrame)
- Optimized ScrollSmoother settings (smooth: 1, normalizeScroll, ignoreMobileResize)

## Production Ready

✅ Safari-optimized (height lock + timing fixes)
✅ 60fps scrolling on all browsers
✅ Manual control - NO auto-detection
✅ Headroom integration with pause/resume
✅ SSR-compatible directives
✅ Reusable across Nuxt 4 projects

## Documentation

- **`.claude/PAGE_TRANSITIONS.md`** - Complete transition system documentation
- **`.claude/SCROLL_SYSTEM.md`** - ScrollSmoother and Headroom integration
- **`app/composables/usePageTransition.js`** - Inline code comments
- **`app/directives/*.js`** - Directive usage documentation
