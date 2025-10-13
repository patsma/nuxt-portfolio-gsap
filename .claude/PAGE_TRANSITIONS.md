# Page Transition System

**Working directive-based page transitions with GSAP and ScrollSmoother**

Based on the [nuxt4page-transitions](https://github.com/user/nuxt4page-transitions) reference implementation.

## Overview

This system provides directive-based page transitions that work seamlessly with ScrollSmoother. Instead of auto-detecting elements, you explicitly mark which elements should animate using Vue directives.

## Architecture

### Key Principle: Manual Control

**NO auto-detection** - You explicitly mark elements with directives:

```vue
<h1 v-page-split:chars data-speed="0.7">Animated Title</h1>
<p v-page-fade:up data-lag="0.15">Fades up with lag</p>
```

### How It Works

1. **Directives Store Config** - When mounted, directives attach animation config to elements
2. **Page Leaves** - `usePageTransition` finds elements and animates them OUT
3. **DOM Swap** - Vue swaps old page for new page
4. **Page Enters** - New page elements animate IN with opposite animations
5. **ScrollSmoother Refresh** - Parallax effects recalculate for new content

### Component Structure

```
app/
├── composables/
│   ├── usePageTransition.js          # Page transition logic
│   └── useScrollSmootherManager.js   # ScrollSmoother lifecycle
├── directives/
│   ├── v-page-split.js                # SplitText animations
│   ├── v-page-fade.js                 # Fade animations
│   ├── v-page-clip.js                 # Clip-path reveals
│   └── v-page-stagger.js              # Stagger children
├── plugins/
│   └── page-transitions.js            # Register directives
└── layouts/
    └── default.vue                    # ScrollSmoother + transitions
```

## Directives

### v-page-split

Animates text using GSAP SplitText with character, word, or line splitting.

```vue
<!-- Arguments: :chars | :words | :lines -->
<h1 v-page-split:chars>Character reveal</h1>
<p v-page-split:words>Word by word</p>
<div v-page-split:lines>Line by line</div>

<!-- With custom config -->
<h1 v-page-split:chars="{ stagger: 0.04, duration: 0.8, ease: 'back.out(1.5)' }">
  Custom timing
</h1>
```

**Options:**
- `splitType` - 'chars', 'words', or 'lines'
- `stagger` - Delay between each element (default: 0.025)
- `duration` - Animation duration (default: 0.6)
- `ease` - GSAP easing (default: 'back.out(1.5)')
- `y` - Vertical movement (default: 35)

### v-page-fade

Simple fade animation with optional directional movement.

```vue
<!-- Arguments: :up | :down | :left | :right -->
<div v-page-fade>Fade in (defaults to up)</div>
<p v-page-fade:up>Fade up</p>
<div v-page-fade:left="{ distance: 40 }">Fade left with custom distance</div>
```

**Options:**
- `direction` - 'up', 'down', 'left', 'right'
- `distance` - Movement distance in pixels (default: 20)
- `duration` - Animation duration (default: 0.6)
- `ease` - GSAP easing (default: 'power2.out')

### v-page-clip

Modern clip-path reveal animations from any direction.

```vue
<!-- Arguments: :top | :bottom | :left | :right -->
<div v-page-clip>Clip from top (default)</div>
<div v-page-clip:bottom="{ duration: 0.8 }">Clip from bottom</div>
```

**Options:**
- `direction` - 'top', 'bottom', 'left', 'right'
- `duration` - Animation duration (default: 0.6)
- `ease` - GSAP easing (default: 'power2.out')

### v-page-stagger

Stagger child elements with fade animation.

```vue
<ul v-page-stagger>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<!-- Custom config -->
<div v-page-stagger="{ stagger: 0.15, duration: 0.7 }">
  <div>Card 1</div>
  <div>Card 2</div>
</div>

<!-- Custom selector -->
<nav v-page-stagger="{ selector: 'a' }">
  <a href="#">Link 1</a>
  <a href="#">Link 2</a>
</nav>
```

**Options:**
- `selector` - CSS selector for children (default: ':scope > *')
- `stagger` - Delay between each child (default: 0.1)
- `duration` - Animation duration per child (default: 0.5)
- `ease` - GSAP easing (default: 'power2.out')

## ScrollSmoother Parallax

Add `data-speed` and `data-lag` attributes to any element for smooth parallax effects.

### data-speed

Controls how fast elements move relative to scroll:

```vue
<!-- Slower than scroll (background effect) -->
<div data-speed="0.5">Moves at 50% scroll speed</div>
<h1 data-speed="0.8">Moves at 80% scroll speed</h1>

<!-- Normal speed -->
<p data-speed="1.0">Moves at 100% scroll speed</p>

<!-- Faster than scroll (foreground effect) -->
<div data-speed="1.5">Moves at 150% scroll speed</div>
```

**Values:**
- `< 1.0` - Background effect (slower)
- `= 1.0` - Normal scroll speed (default)
- `> 1.0` - Foreground effect (faster)

### data-lag

Creates smooth "catch up" effect with momentum:

```vue
<div data-lag="0.1">Slight trailing motion</div>
<h2 data-lag="0.2">Smooth catch-up effect</h2>
<img data-lag="0.3">Pronounced trailing</img>
```

**Values:**
- Typical range: `0.1` to `0.3`
- Higher values = more lag/trailing

### Combining Directives + Parallax

Use both page transitions AND parallax on the same elements:

```vue
<h1 v-page-split:chars data-speed="0.8">
  Animated reveal + slow parallax
</h1>

<p v-page-fade:up data-lag="0.15">
  Fade transition + lag effect
</p>

<div v-page-clip:top data-speed="1.2">
  Clip animation + fast parallax
</div>
```

## Implementation Details

### Critical Fix: ScrollSmoother Jump Prevention

**Problem:** Elements visibly "jump" during page transitions when ScrollSmoother is active.

**Cause:** ScrollSmoother applies transforms to elements with `data-speed`/`data-lag`. If these transforms are applied AFTER elements become visible, you see the jump.

**Solution:** Three-step process in `usePageTransition.js` enter() function:

```javascript
// STEP 1: Set initial states FIRST (elements hidden)
elements.forEach((element) => {
  // Set to hidden/transformed state
  $gsap.set(element, { opacity: 0, y: -20 })
})

// STEP 2: Refresh ScrollSmoother with elements already hidden
const { refreshSmoother } = useScrollSmootherManager()
refreshSmoother() // Calculates positions with elements in initial state

// STEP 3: Animate from initial states (skipInitialState = true)
elements.forEach((element) => {
  animateFade(element, config, 'in', tl, position, true)
})
```

This ensures ScrollSmoother sees elements in their hidden state and applies transforms before animation starts.

### Layout Integration

The layout coordinates ScrollSmoother with page transitions:

```vue
<!-- app/layouts/default.vue -->
<script setup>
const { leave, enter, beforeEnter, afterLeave } = usePageTransition()
const { createSmoother, killSmoother } = useScrollSmootherManager()

onMounted(() => {
  nextTick(() => {
    createSmoother({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 2,
      effects: true // Enable data-speed/data-lag
    })
  })
})
</script>

<template>
  <div id="smooth-wrapper">
    <HeaderGrid />
    <div id="smooth-content">
      <div class="layout-wrapper">
        <NuxtPage
          :transition="{
            name: 'page',
            mode: 'out-in',
            onBeforeEnter: beforeEnter,
            onEnter: enter,
            onLeave: leave,
            onAfterLeave: afterLeave,
          }"
        />
      </div>
    </div>
  </div>
</template>
```

**Key Points:**
- ScrollSmoother created on mount
- Page transitions use composable hooks
- Simple lifecycle: create → use → destroy
- No complex cleanup needed

## Page Structure

Pages should wrap content in `.page-content`:

```vue
<template>
  <div class="page-content">
    <!-- Directive-marked elements here -->
    <h1 v-page-split:chars data-speed="0.7">Title</h1>
    <p v-page-fade:up data-lag="0.15">Content</p>
  </div>
</template>
```

## Configuration

### Nuxt Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@hypernym/nuxt-gsap"],

  gsap: {
    composables: true,
    provide: true,

    // Club GreenSock premium plugins (FREE as of 2025!)
    clubPlugins: {
      splitText: true,
      scrollSmoother: true,
    },

    extraPlugins: {
      scrollTrigger: true, // Required for ScrollSmoother
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: false,
  },
})
```

## Debugging

### Console Logs

Watch for these during navigation:

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

### Common Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| Animations not running | Directives not registered | Check plugin loads in plugins/ |
| Elements jump | ScrollSmoother not refreshed | Verify refreshSmoother() called |
| SplitText not working | Plugin not enabled | Enable splitText in nuxt.config |
| No parallax | effects: false | Set effects: true in createSmoother() |

## Example Pages

### Home Page

```vue
<template>
  <div class="page-content">
    <h1 v-page-split:chars data-speed="0.7">Home Page</h1>

    <p v-page-clip:bottom data-lag="0.15">
      Directive-based transitions with full control.
    </p>

    <div v-page-fade:left data-speed="1.1" class="content-box">
      <h2>Manual Control</h2>
      <p>Use directives to control exactly how each element animates.</p>
    </div>

    <ul v-page-stagger="{ stagger: 0.12 }" data-speed="0.85">
      <li>v-page-split → Character/word reveals</li>
      <li>v-page-fade → Fade with movement</li>
      <li>v-page-clip → Clip-path reveals</li>
    </ul>
  </div>
</template>
```

### About Page

```vue
<template>
  <div class="page-content">
    <h1 v-page-split:chars data-speed="0.7">About Page</h1>

    <p v-page-clip:bottom data-lag="0.15">
      Different animations per page for variety.
    </p>

    <div v-page-clip:left data-lag="0.25" class="content-box">
      <h2>How It Works</h2>
      <p>Directives store config, transitions read and animate.</p>
    </div>

    <ol v-page-stagger="{ stagger: 0.12 }" data-speed="0.85">
      <li>Mark elements with directives</li>
      <li>Page transitions read configs</li>
      <li>Elements animate OUT, then IN</li>
    </ol>
  </div>
</template>
```

## Benefits

✅ **Manual Control** - No guessing, you decide what animates
✅ **Simple & DRY** - 8 files total, easy to understand
✅ **ScrollSmoother Compatible** - Works seamlessly with parallax
✅ **Opposite Animations** - Elements animate OUT then IN with reverse effect
✅ **Production Ready** - Battle-tested patterns from reference implementation
✅ **Easy to Reuse** - Copy files to any Nuxt 4 project

## Reference

This implementation is based on the working [nuxt4page-transitions](https://github.com/user/nuxt4page-transitions) demo.

Key files copied from reference:
- `app/composables/usePageTransition.js`
- `app/composables/useScrollSmootherManager.js`
- `app/directives/*.js`
- `app/plugins/page-transitions.js`
