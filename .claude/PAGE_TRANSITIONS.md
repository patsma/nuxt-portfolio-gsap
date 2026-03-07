# Page Transitions

Directive-based GSAP transitions with ScrollSmoother parallax and headroom integration.

**Philosophy:** Manual control via directives - NO auto-detection.

## How It Works

```
1. Directives store config → el._pageAnimation
2. Page leaves → elements animate OUT
3. Scroll to top (instant, content hidden)
4. Page enters → elements animate IN (opposite direction)
5. Headroom resumes
6. ScrollSmoother refreshes
```

## Directives

### Quick Reference

| Directive | Args | Common Options | Example |
|-----------|------|----------------|---------|
| `v-page-split` | chars, words, lines | stagger, duration, ease, y | `v-page-split:chars="{ stagger: 0.04 }"` |
| `v-page-fade` | up, down, left, right | distance, duration, ease, leaveOnly | `v-page-fade:up="{ distance: 40 }"` |
| `v-page-clip` | top, bottom, left, right | duration, ease | `v-page-clip:bottom="{ duration: 0.8 }"` |
| `v-page-stagger` | - | selector, stagger, duration, leaveOnly | `v-page-stagger="{ selector: 'a', leaveOnly: true }"` |

### Defaults

**v-page-split:**
- `stagger: 0.025`, `duration: 0.6`, `ease: 'back.out(1.5)'`, `y: 35`

**v-page-fade:**
- `direction: 'up'`, `distance: 20`, `duration: 0.6`, `ease: 'power2.out'`

**v-page-clip:**
- `direction: 'top'`, `duration: 0.6`, `ease: 'power2.out'`

**v-page-stagger:**
- `selector: ':scope > *'`, `stagger: 0.1`, `duration: 0.5`, `ease: 'power2.out'`, `leaveOnly: false`

### Leave-Only Mode

**Use Case:** Elements that should only animate OUT during page transitions, with IN animation handled by ScrollTrigger or other systems.

**Option:** `leaveOnly: true`

**Behavior:**
- **Page Leave**: Element animates OUT normally ✅
- **Page Enter**: Element is set to hidden state but doesn't animate ✅
- **After Enter**: ScrollTrigger or other systems handle the IN animation ✅

**Example - Scroll-Triggered Elements:**
```vue
<!-- Items should only transition OUT, ScrollTrigger handles IN animation -->
<div v-page-stagger="{ stagger: 0.08, leaveOnly: true }">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Fade element that uses custom IN animation -->
<h2 v-page-fade:up="{ distance: 40, leaveOnly: true }">
  Title animated by ScrollTrigger
</h2>
```

**Supported Directives:**
- `v-page-stagger` - Sets children to `y: 15, opacity: 0` on enter (no animation)
- `v-page-fade` - Sets element to initial fade state on enter (no animation)

**Why Use This:**
- Prevents conflict between page transitions and scroll-based animations
- Elements controlled by ScrollTrigger should use `leaveOnly: true`
- Ensures clean state after page transition without animating IN

## Parallax Effects

### data-speed

Movement speed relative to scroll:

```vue
<div data-speed="0.5">Background (slower)</div>
<div data-speed="1.0">Normal speed</div>
<div data-speed="1.5">Foreground (faster)</div>
```

### data-lag

Smooth "catch up" trailing effect (typical: 0.1 to 0.3):

```vue
<div data-lag="0.15">Slight trailing</div>
```

### Combined

```vue
<h1 v-page-split:chars data-speed="0.7">
  Animated reveal + parallax
</h1>
```

## Five Critical Fixes

### 1. ScrollSmoother Refresh Timing
**Issue:** Parallax broken after route change
**Fix:** Refresh AFTER directives mount, BEFORE animations start
**Location:** `usePageTransition.js` enter() → `nextTick()` → `refreshSmoother()` → animate

### 2. Manual Scroll Control
**Issue:** User sees scroll jump
**Fix:** Disable auto-scroll in router, scroll manually in `afterLeave()` when content hidden
**Location:** `router.options.ts` → `scrollBehavior() { return false }`

### 3. Headroom Pause/Resume
**Issue:** Header jumps or animates when clicking navigation link
**Fix:** Pause freezes header in place (no class changes), resume smoothly animates to top with 800ms transition
**Details:**
- `pause()`: Sets `isPaused = true` only - header freezes in current visual state
- `resume()`: Adds `headroom--smooth-transition` class, animates to top state (800ms), then restores fast transitions
- See `.claude/SCROLL_SYSTEM.md` for full implementation details
**Location:** `usePageTransition.js` + `headroom.client.js`

### 4. Safari SplitText Height Lock
**Issue:** ~7px layout jump when SplitText adds masks
**Fix:** Lock element height BEFORE SplitText runs
```javascript
const originalHeight = el.offsetHeight;
gsap.set(el, { height: originalHeight });
const split = SplitText.create(el, { type: splitType, mask: splitType });
```

### 5. Safari Enter Animation Timing
**Issue:** Animations appear "half-done" on Safari
**Fix:** Hide page in `beforeEnter`, double requestAnimationFrame before animating
```javascript
// beforeEnter
gsap.set(el, { visibility: 'hidden' });

// enter
nextTick(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      gsap.set(el, { visibility: 'visible' });
      // Animate now...
    });
  });
});
```

## Mobile Performance Optimizations

### 6. Visibility Check in findAnimatedElements()
**Issue:** Page transitions were animating hidden responsive elements (e.g., desktop layout on mobile)
**Fix:** Skip elements with `display: none` when walking DOM tree

```typescript
const walk = (node: HTMLElement): void => {
  const style = getComputedStyle(node)
  if (style.display === 'none') {
    return // Skip this element AND all its children
  }
  // ... rest of walk logic
}
```

**Important:** Only check `display: none`, NOT `visibility: hidden`. The page transition system uses `visibility: hidden` temporarily during transitions via `beforeEnter`.

### 7. Optimized clearProps Cleanup
**Issue:** `afterLeave()` was calling `el.querySelectorAll('*')` - expensive on large pages
**Fix:** Track animated elements in a Set, only clear those

```typescript
let animatedElementsForCleanup: Set<HTMLElement> = new Set()

// In leave() - store what we're animating
animatedElementsForCleanup = new Set(elements)

// In afterLeave() - only clear what we animated
animatedElementsForCleanup.forEach((el) => {
  $gsap.set(el, { clearProps: 'all' })
})
animatedElementsForCleanup.clear()
```

### 8. Stagger Animation Filters Hidden Children
**Issue:** `animateStagger` was animating all children including `display: none` elements
**Fix:** Filter out hidden children before animating

```typescript
const allChildren = el.querySelectorAll(selector)
const children = Array.from(allChildren).filter((child) => {
  const style = getComputedStyle(child as HTMLElement)
  return style.display !== 'none'
})
```

This allows combined selectors like `.case-study-item, .case-study-card` to work correctly - only the visible layout animates.

## Safari Performance

**Settings for 60fps on Safari:**

```javascript
createSmoother({
  smooth: 1,                    // Lower = better perf (2+ drops to 14fps)
  effects: true,                // Enable data-speed and data-lag
  normalizeScroll: true,        // Improves Safari + touch
  ignoreMobileResize: true,     // Prevents mobile jank
})
```

## Layout Integration

**Structure requirement:** Fixed elements OUTSIDE `#smooth-content`

```vue
<!-- layouts/default.vue -->
<div id="smooth-wrapper">
  <HeaderGrid />  <!-- Fixed, outside smooth-content -->

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
```

**See:** `app/layouts/default.vue` for full implementation

## Page Structure

**Wrap content in `.page-content`:**

```vue
<template>
  <div class="page-content">
    <h1 v-page-split:chars data-speed="0.7">Title</h1>
    <p v-page-fade:up data-lag="0.15">Content</p>
  </div>
</template>
```

## Configuration

**Nuxt config:**

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
      scrollTrigger: true,
    },
  },
})
```

## Transition Flow

```
User at scroll 500px → clicks link
  ↓
page:start → headroom.pause()
  - Freeze header in current state (no visual change)
  - Header may be hidden, compact, or full-height
  ↓
Leave → elements fade OUT at 500px
  - Header stays frozen in same state
  ↓
afterLeave → smoother.scrollTop(0)
  - Instant scroll to 0
  - Header stays frozen (NOT changed)
  - Content hidden from user
  ↓
Enter → elements fade IN at 0
  - Header still frozen in previous state
  ↓
onComplete → headroom.resume()
  - Add headroom--smooth-transition (800ms)
  - Smoothly animate to top state (full-height, transparent)
  - Remove smooth-transition class after animation completes
  - Restore fast transitions (300ms) for scroll behavior
```

## Infinite Animations During Transitions

For components with infinite/looping animations (e.g., rotating elements), coordinate with page transitions:

```javascript
const loadingStore = useLoadingStore()
let animation = null

onMounted(() => {
  animation = $gsap.to(element, {
    rotation: 360,
    duration: 20,
    repeat: -1,
    ease: 'none',
    paused: true
  })

  // Start after transition completes
  if (loadingStore.isFirstLoad) {
    // First load: wait for entrance animations
    window.addEventListener('app:complete', () => animation.play(), { once: true })
  } else {
    // Navigation: delay for transition
    setTimeout(() => animation.play(), 600)
  }
})
```

**Important:**
- Avoid CSS transitions on elements with GSAP animations (conflicts)
- Use ScrollTrigger to pause when out of viewport (performance)
- Always kill animations in `onUnmounted()` (prevent leaks)
- See LOADING_SYSTEM.md for full viewport-aware pattern

## Layout Component Page Transitions

**Problem:** Components in layouts (default.vue) persist across page navigations. Page transition directives (v-page-fade, v-page-stagger) only work for content inside NuxtPage.

**Example:** FooterSection in default.vue layout - directives won't trigger.

### Solution Pattern

**1. Page Leave:** Hook into `page:start`, manually animate to `opacity: 0`

```javascript
const nuxtApp = useNuxtApp();
let unhookPageStart = null;

onMounted(() => {
  unhookPageStart = nuxtApp.hook('page:start', () => {
    // Simple fade out when navigation starts
    $gsap.to(marqueeElement, { opacity: 0, duration: 0.5, ease: 'power2.in' });
    $gsap.to(linksItems, { opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.in' });
  });
});

onUnmounted(() => {
  if (unhookPageStart) {
    unhookPageStart();
  }
});
```

**2. Page Enter:** Do NOT use `page:finish` to reset/force visible
- Let elements stay at `opacity: 0` after page transition
- ScrollTrigger will handle fade in when user scrolls

**3. ScrollTrigger:** Animate to visible when scrolling into view

```javascript
const createScrollTrigger = () => {
  // Clear inline styles from page leave animation
  $gsap.set(element, { clearProps: 'all' });
  $gsap.set(element, { opacity: 0 });

  // Create fade in animation
  const timeline = $gsap.timeline();
  timeline.fromTo(element,
    { opacity: 0 },
    { opacity: 1, duration: 0.6, ease: 'power2.out' }
  );

  // Attach to ScrollTrigger
  $ScrollTrigger.create({
    trigger: element,
    start: 'top 80%',
    animation: timeline,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true,
  });
};

// Coordinate with page transitions
if (loadingStore.isFirstLoad) {
  nextTick(() => createScrollTrigger());
} else {
  const unwatch = watch(
    () => pageTransitionStore.isTransitioning,
    (isTransitioning) => {
      if (!isTransitioning) {
        nextTick(() => createScrollTrigger());
        unwatch();
      }
    },
    { immediate: true }
  );
}
```

### Anti-Patterns (What NOT to Do)

❌ **Don't store timelines and kill them in `page:finish`**
```javascript
// BAD: Causes issues with other animations
let leaveTimeline = $gsap.timeline();
nuxtApp.hook('page:finish', () => {
  leaveTimeline.kill(); // This breaks everything else!
});
```

❌ **Don't use `clearProps` and force visible in `page:finish`**
```javascript
// BAD: Racing conditions with page transitions
nuxtApp.hook('page:finish', () => {
  $gsap.set(element, { clearProps: 'all' });
  $gsap.set(element, { autoAlpha: 1 }); // Fighting with other animations!
});
```

❌ **Don't try to coordinate reset timing**
```javascript
// BAD: Complex and error-prone
watch(() => pageTransitionStore.isTransitioning, (value) => {
  if (!value) {
    // Too late, animations already conflicting
  }
});
```

✅ **Simple fade out + ScrollTrigger fade in**
```javascript
// GOOD: Clean, predictable, works every time
nuxtApp.hook('page:start', () => {
  $gsap.to(element, { opacity: 0, duration: 0.5 });
});

// ScrollTrigger handles fade in
$ScrollTrigger.create({
  trigger: element,
  animation: $gsap.fromTo(element, { opacity: 0 }, { opacity: 1 }),
});
```

### Why This Works

1. **Page leave**: Elements fade to `opacity: 0` cleanly
2. **Page transition**: Content swaps, elements stay hidden
3. **Scroll in**: ScrollTrigger animates to visible when user reaches footer
4. **No conflicts**: Each system has one job, no coordination needed

### Reference Implementation

**File:** `app/components/FooterSection.vue`

Complete example showing:
- Simple `page:start` fade out
- ScrollTrigger setup for marquee
- ScrollTrigger setup for links
- Proper cleanup in `onUnmounted()`

## Critical Warnings (Don't Do This)

### ❌ Don't Make Timeline Building Async

**Never wrap timeline building in promises or async callbacks:**

```javascript
// ❌ BAD - Breaks transition done() callback timing
const buildTimeline = () => { /* ... done() inside ... */ }
if (hasSplit) {
  document.fonts.ready.then(buildTimeline)  // BROKEN!
}

// ✅ GOOD - Keep synchronous
const tl = $gsap.timeline({ onComplete: done })
elements.forEach((el) => { /* add to timeline */ })
```

**Why:** The `done()` callback must fire synchronously within the transition lifecycle. Async wrappers cause the transition to never complete.

**If you need font loading:** Handle it in the loading sequence (`useLoadingSequence.ts`), not in page transitions.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Page stuck, transitions don't complete | Async `document.fonts.ready.then()` in timeline building | Keep timeline building synchronous - never wrap in promises |
| Animations not running | Directives not registered | Check `plugins/page-transitions.js` loads |
| Elements jump during transition | ScrollSmoother not refreshed | Verify `refreshSmoother()` in enter() |
| Scroll jump visible | Auto-scroll before animations | Set `scrollBehavior() { return false }` in router.options.ts |
| Header animates on link click | pause() changes header state | Ensure pause() only sets `isPaused = true` (see Fix #3) |
| Header doesn't animate after transition | resume() doesn't add smooth-transition | Verify resume() adds `headroom--smooth-transition` class (see SCROLL_SYSTEM.md) |
| Header animation too fast/slow | Wrong transition duration | Adjust `--duration-slow` in theme.scss (default: 800ms) |
| SplitText not working | Plugin not enabled | Enable `splitText: true` in nuxt.config |
| No parallax | effects: false | Set `effects: true` in createSmoother() |
| Safari height jump | SplitText adds height | Lock height before SplitText (see Fix #4) |
| Safari animations broken | DOM not ready | Double requestAnimationFrame (see Fix #5) |
| Mobile transitions slow | Animating hidden elements | Visibility check filters `display: none` in usePageTransition.ts |

## Files Reference

**Composables:**
- `app/composables/usePageTransition.ts` - Core transition logic (471 lines)
- `app/composables/useScrollSmootherManager.ts` - ScrollSmoother lifecycle

**Directives:**
- `app/directives/v-page-split.ts`
- `app/directives/v-page-fade.ts`
- `app/directives/v-page-clip.ts`
- `app/directives/v-page-stagger.ts`

**Plugins:**
- `app/plugins/page-transitions.ts` - Register directives globally
- `app/plugins/headroom.client.ts` - Header pause/resume

**Config:**
- `app/router.options.ts` - Disable automatic scroll
- `app/layouts/default.vue` - Integration layer

**Reference:** Based on [nuxt4page-transitions](https://github.com/user/nuxt4page-transitions)
