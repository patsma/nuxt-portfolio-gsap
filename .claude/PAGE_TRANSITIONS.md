# Page Transition System

Directive-based GSAP page transitions with ScrollSmoother parallax and headroom integration.

Based on [nuxt4page-transitions](https://github.com/user/nuxt4page-transitions) reference implementation.

## Overview

Manual control via Vue directives - **NO auto-detection**. Mark elements explicitly for animation.

```vue
<h1 v-page-split:chars data-speed="0.7">Animated Title</h1>
<p v-page-fade:up data-lag="0.15">Fades up with lag</p>
```

## How It Works

1. **Directives Store Config** - Mount → attach `el._pageAnimation`
2. **Page Leaves** - `usePageTransition` animates elements OUT
3. **Scroll to Top** - Instant scroll in `afterLeave` (content hidden)
4. **Page Enters** - New elements animate IN (opposite direction)
5. **Headroom Resumes** - Header reactivates after enter completes
6. **ScrollSmoother Refresh** - Parallax effects recalculate

## Architecture

```
app/
├── composables/
│   ├── usePageTransition.js           # Transition logic + headroom coordination
│   └── useScrollSmootherManager.js    # ScrollSmoother lifecycle
├── directives/
│   ├── v-page-split.js                # SplitText animations
│   ├── v-page-fade.js                 # Fade with movement
│   ├── v-page-clip.js                 # Clip-path reveals
│   └── v-page-stagger.js              # Stagger children
├── plugins/
│   ├── page-transitions.js            # Register directives
│   └── headroom.client.js             # Header hide/show + pause/resume
└── layouts/
    └── default.vue                    # ScrollSmoother + transitions + headroom
```

## Directives

### v-page-split

SplitText character/word/line animations.

```vue
<h1 v-page-split:chars>Character reveal</h1>
<p v-page-split:words>Word by word</p>
<div v-page-split:lines>Line by line</div>

<!-- Custom config -->
<h1 v-page-split:chars="{ stagger: 0.04, duration: 0.8, ease: 'back.out(1.5)' }">
  Custom timing
</h1>
```

**Options:**
- `splitType` - 'chars', 'words', 'lines'
- `stagger` - Delay between elements (default: 0.025)
- `duration` - Animation duration (default: 0.6)
- `ease` - GSAP easing (default: 'back.out(1.5)')
- `y` - Vertical movement (default: 35)

### v-page-fade

Fade with directional movement.

```vue
<div v-page-fade>Defaults to up</div>
<p v-page-fade:up>Fade up</p>
<div v-page-fade:left="{ distance: 40 }">Custom distance</div>
```

**Options:**
- `direction` - 'up', 'down', 'left', 'right'
- `distance` - Movement in pixels (default: 20)
- `duration` - Animation duration (default: 0.6)
- `ease` - GSAP easing (default: 'power2.out')

### v-page-clip

Clip-path reveals from any direction.

```vue
<div v-page-clip>From top (default)</div>
<div v-page-clip:bottom="{ duration: 0.8 }">From bottom</div>
```

**Options:**
- `direction` - 'top', 'bottom', 'left', 'right'
- `duration` - Animation duration (default: 0.6)
- `ease` - GSAP easing (default: 'power2.out')

### v-page-stagger

Stagger child elements with fade.

```vue
<ul v-page-stagger>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<!-- Custom config -->
<nav v-page-stagger="{ selector: 'a', stagger: 0.15 }">
  <a href="#">Link 1</a>
  <a href="#">Link 2</a>
</nav>
```

**Options:**
- `selector` - CSS selector (default: ':scope > *')
- `stagger` - Delay between children (default: 0.1)
- `duration` - Animation duration (default: 0.5)
- `ease` - GSAP easing (default: 'power2.out')

## Parallax Effects

### data-speed

Controls movement speed relative to scroll:

```vue
<div data-speed="0.5">Background (50% speed)</div>
<div data-speed="1.0">Normal speed</div>
<div data-speed="1.5">Foreground (150% speed)</div>
```

- `< 1.0` = Background effect (slower)
- `= 1.0` = Normal scroll speed
- `> 1.0` = Foreground effect (faster)

### data-lag

Creates smooth "catch up" trailing effect:

```vue
<div data-lag="0.15">Slight trailing</div>
<h2 data-lag="0.25">More pronounced trailing</h2>
```

Typical range: `0.1` to `0.3`

### Combined Usage

```vue
<h1 v-page-split:chars data-speed="0.8">
  Animated reveal + parallax
</h1>

<p v-page-fade:up data-lag="0.15">
  Fade transition + lag effect
</p>
```

## Implementation Details

### Five Critical Fixes

**1. ScrollSmoother Refresh Timing**

ScrollSmoother is refreshed after page enters but before animations start:

```javascript
// Wait for directives to mount
nextTick(() => {
  const elements = findAnimatedElements(el)

  // Refresh ScrollSmoother to recalculate parallax for new page
  refreshSmoother()

  // Create timeline and animate elements
  const tl = gsap.timeline({ onComplete: done })
  elements.forEach((element) => {
    animateFade(element, config, 'in', tl, position)
  })
})
```

**2. Manual Scroll Control**

Prevent automatic scroll, control timing manually:

```typescript
// router.options.ts
scrollBehavior() {
  return false // Manual control
}
```

```javascript
// usePageTransition.js afterLeave()
afterLeave(el) {
  cleanup()
  const smoother = getSmoother()
  smoother?.scrollTop(0) // Scroll when content hidden
}
```

**3. Headroom Pause/Resume**

Prevent header jump during transitions:

```javascript
// Pause at page:start
nuxtApp.hook('page:start', () => {
  nuxtApp.$headroom.pause() // Adds headroom--no-transition class
})

// Resume in enter() onComplete
const tl = gsap.timeline({
  onComplete: () => {
    done()
    nuxtApp.$headroom?.resume() // Removes headroom--no-transition
  }
})
```

**4. Safari Height Lock for SplitText**

Prevent ~7px layout jump when SplitText masking adds height:

```javascript
// Lock element height BEFORE SplitText
const originalHeight = el.offsetHeight
gsap.set(el, { height: originalHeight })

// Now create split - can't grow because height is locked
const split = SplitText.create(el, { type: splitType, mask: splitType })
```

**5. Safari Enter Animation Timing**

Prevent enter animations from appearing "half-done" on Safari:

```javascript
// Hide page in beforeEnter
const beforeEnter = (el) => {
  gsap.set(el, { visibility: 'hidden' })
}

// Wait for Safari to paint DOM before animating
const enter = (el, done) => {
  nextTick(() => {
    // Double requestAnimationFrame ensures Safari is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gsap.set(el, { visibility: 'visible' })
        // Now start animations...
      })
    })
  })
}
```

## Layout Integration

```vue
<!-- app/layouts/default.vue -->
<script setup>
const { leave, enter, beforeEnter, afterLeave } = usePageTransition()
const { createSmoother, killSmoother } = useScrollSmootherManager()
const nuxtApp = useNuxtApp()

onMounted(() => {
  nextTick(() => {
    createSmoother({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1, // Optimized for consistent 60fps (Safari-friendly)
      effects: true,
      normalizeScroll: true, // Improves Safari performance
      ignoreMobileResize: true, // Prevents mobile jank
      onUpdate: (self) => {
        nuxtApp.$headroom?.updateHeader(self.scrollTop())
      }
    })
  })
})

onUnmounted(() => killSmoother())
</script>

<template>
  <div id="smooth-wrapper">
    <HeaderGrid />
    <div id="smooth-content">
      <NuxtPage :transition="{
        mode: 'out-in',
        onBeforeEnter: beforeEnter,
        onEnter: enter,
        onLeave: leave,
        onAfterLeave: afterLeave
      }" />
    </div>
  </div>
</template>
```

## Page Structure

Wrap content in `.page-content`:

```vue
<template>
  <div class="page-content">
    <h1 v-page-split:chars data-speed="0.7">Title</h1>
    <p v-page-fade:up data-lag="0.15">Content</p>
  </div>
</template>
```

## Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@hypernym/nuxt-gsap"],

  gsap: {
    composables: true,
    provide: true,
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

## Transition Flow

```
User at scroll 500px → clicks link
    ↓
page:start → headroom.pause()
    - Add headroom--no-transition
    - Pin header instantly
    ↓
Leave animation → elements fade OUT at 500px
    ↓
afterLeave → smoother.scrollTop(0)
    - Instant scroll to 0
    - Content already hidden
    ↓
Enter animation → elements fade IN at 0
    ↓
onComplete → headroom.resume()
    - Remove headroom--no-transition
    - Headroom active again
```

## Safari-Specific Fixes

### Issue 1: Content Jumps During Page Transitions

**Problem:** On Safari (desktop and mobile), content jumps ~7px down when page transitions start.

**Cause:** SplitText with masking wraps each character/word/line in an `overflow: hidden` container, which adds ~7px to the element's height. Safari renders this layout shift visibly during the LEAVE transition.

**Solution:** The fix is built into `animateSplit()` in `usePageTransition.js` - it locks element height BEFORE SplitText runs:

```javascript
// Lock height before SplitText to prevent Safari jump
const originalHeight = el.offsetHeight;
$gsap.set(el, { height: originalHeight });

// Now create split - can't grow because height is locked
const split = $SplitText.create(el, { type: splitType, mask: splitType });
```

This prevents the element from growing when masks are added. The locked height is automatically cleared in `afterLeave()` with `clearProps: 'all'`.

### Issue 2: Enter Animations Start Too Fast (Appear Half-Done)

**Problem:** On Safari, enter animations appear to start "half-done" or already completed. Chrome works fine.

**Cause:** Safari executes the enter animation before the new page DOM is fully painted/laid out, causing animations to start before elements are ready.

**Solution:** Use visibility control + double requestAnimationFrame to ensure Safari has fully painted the DOM:

```javascript
// In beforeEnter - hide page immediately
const beforeEnter = (el) => {
  $gsap.set(el, { visibility: 'hidden' });
};

// In enter - wait for Safari to fully paint DOM
const enter = (el, done) => {
  nextTick(() => {
    const elements = findAnimatedElements(el);

    // Double requestAnimationFrame ensures Safari has fully painted DOM
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Now Safari is ready - make page visible and animate
        $gsap.set(el, { visibility: 'visible' });

        refreshSmoother();

        const tl = $gsap.timeline({ onComplete: done });
        // ... animate elements
      });
    });
  });
};
```

The double `requestAnimationFrame` gives Safari TWO paint cycles to complete layout before animations start.

### Issue 3: Slow Scrolling Performance (14fps drops)

**Problem:** ScrollSmoother can drop to 14fps on Safari, especially with higher `smooth` values.

**Cause:** Higher `smooth` values (2, 3, etc.) require more calculations per frame, causing Safari's rendering engine to struggle.

**Solution:** Use optimized ScrollSmoother settings in `app/layouts/default.vue`:

```javascript
createSmoother({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1,                    // Lower value = better performance (2+ can drop to 14fps on Safari)
  effects: true,                // Enable data-speed and data-lag
  normalizeScroll: true,        // Significantly improves Safari performance and touch behavior
  ignoreMobileResize: true,     // Prevents janky resizing on mobile devices
  onUpdate: (self) => {
    // Your scroll handlers here
  }
})
```

**Why these settings work:**
- `smooth: 1` maintains consistent 60fps across all browsers while still providing smooth scrolling
- `normalizeScroll: true` normalizes scroll behavior across different devices, especially Safari
- `ignoreMobileResize: true` prevents layout jank when mobile browsers resize (address bar hiding/showing)

### Safari Performance Summary

✅ **Fixed Issues:**
1. Content jump during transitions (SplitText height lock)
2. Enter animations starting too fast/appearing half-done (visibility + double requestAnimationFrame)
3. Slow 14fps scrolling (optimized smooth value + normalizeScroll)
4. Mobile resize jank (ignoreMobileResize setting)
5. Parallax effects not working after route change (refreshSmoother timing)

## Common Issues

### Animations not running

**Cause:** Directives not registered

**Solution:** Check `plugins/page-transitions.js` loads

### Elements jump during transition

**Cause:** ScrollSmoother applies transforms after elements visible

**Solution:** Three-step process (set states → refresh → animate)

### Scroll jump visible to user

**Cause:** Automatic scroll before animations complete

**Solution:** Manual scroll in `afterLeave`, disabled in `router.options.ts`

### Header jumps during transition

**Cause:** CSS transitions animate class changes

**Solution:** `headroom--no-transition` class during pause

### SplitText not working

**Cause:** Plugin not enabled

**Solution:** Enable `splitText: true` in `nuxt.config.ts`

### No parallax effects

**Cause:** `effects: false`

**Solution:** Set `effects: true` in `createSmoother()`

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

✅ **Manual Control** - Explicit directive marking
✅ **No Jumps** - Perfect scroll and header coordination
✅ **ScrollSmoother Compatible** - Seamless parallax integration
✅ **Opposite Animations** - OUT then IN with reverse effect
✅ **Safari Optimized** - Built-in fixes for height jump and 60fps performance
✅ **Simple & DRY** - 8 files, easy to understand
✅ **Production Ready** - Battle-tested patterns
✅ **Easy to Reuse** - Copy to any Nuxt 4 project

## Files Reference

**Composables:**
- `app/composables/usePageTransition.js` - Transition logic + headroom coordination
- `app/composables/useScrollSmootherManager.js` - ScrollSmoother lifecycle

**Directives:**
- `app/directives/v-page-split.js` - SplitText animations
- `app/directives/v-page-fade.js` - Fade animations
- `app/directives/v-page-clip.js` - Clip-path reveals
- `app/directives/v-page-stagger.js` - Stagger children

**Plugins:**
- `app/plugins/page-transitions.js` - Register directives
- `app/plugins/headroom.client.js` - Header visibility with pause/resume

**Config:**
- `app/router.options.ts` - Disable automatic scroll
- `app/layouts/default.vue` - Integration layer

**Styles:**
- `app/assets/css/components/header-grid.scss` - headroom--no-transition class

## Reference

Based on [nuxt4page-transitions](https://github.com/user/nuxt4page-transitions) with enhancements:
- Manual scroll control (no visible jump)
- Headroom pause/resume integration
- CSS transition disabling during page changes
- Safari height jump fix (SplitText height lock)
- Optimized ScrollSmoother settings for Safari 60fps performance
