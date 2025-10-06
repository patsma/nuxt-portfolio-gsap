# Page Transition System Documentation

## Overview

This project uses a sophisticated, GSAP-powered page transition system with circle reveal animations. The system coordinates between Nuxt middleware, Vue transition hooks, and GSAP ScrollSmoother to create seamless page-to-page navigation without visible content jumps.

## Architecture

### The Three-Phase Flow

**PHASE 1: HIDE (Middleware)**
- User clicks navigation link → Middleware intercepts
- Navigation is **blocked** using `abortNavigation()`
- Circle overlay expands from bottom to cover content
- Once content is hidden, route changes programmatically

**PHASE 2: SWITCH (Nuxt Core)**
- Route changes via `router.push()`
- Vue loads new page component
- ScrollSmoother is killed and reinitialized
- New page content renders (hidden behind overlay)

**PHASE 3: REVEAL (Vue Transition Hook)**
- Circle overlay contracts from bottom to reveal new page
- Transition completes, state resets to idle

### Why This Complexity?

**The Problem We're Solving:**
- ❌ Content visible jump when route changes
- ❌ ScrollSmoother transform conflicts during transitions
- ❌ Race conditions between animations and route changes
- ❌ Inconsistent behavior due to timing issues
- ❌ Page content switching before overlay covers it

**The Solution:**
- ✅ Block navigation until content is fully hidden
- ✅ Coordinate ScrollSmoother lifecycle with transitions
- ✅ Use proper async patterns instead of timeouts
- ✅ Reactive state management with Pinia
- ✅ Promise-based animation coordination

## Core Files

### 1. Middleware: `app/middleware/pageTransition.global.ts`

**Purpose:** Intercept user navigation and block it until overlay covers content

**Key Concepts:**
```typescript
// USER navigation → BLOCK IT
if (store.isTransitioning && store.state === 'leaving') {
  return; // Allow our programmatic navigation through
}

// Create Promise that resolves when animation completes
const animationComplete = new Promise<void>((resolve) => {
  $gsap.timeline({
    onComplete: () => resolve()
  })
    .set(overlay, { opacity: 1, pointerEvents: 'auto' })
    .to(overlay, {
      clipPath: 'circle(150% at 50% 100%)', // Expand from bottom
      duration,
      ease: 'sine.out'
    });
});

// Wait for animation, then navigate
animationComplete.then(async () => {
  await nextTick();
  const router = useRouter();
  await router.push(to.fullPath); // Bypass middleware
});

return abortNavigation(); // Block original navigation
```

**Why `abortNavigation()` + `router.push()`?**
- `navigateTo()` inside middleware triggers middleware again (infinite loop)
- `abortNavigation()` blocks the original user navigation
- `router.push()` directly bypasses middleware (checked via store state)
- Uses `nextTick()` to ensure DOM readiness before navigation

### 2. Composable: `app/composables/usePageTransition.js`

**Purpose:** Handle PHASE 3 (reveal) after route has changed

**Key Concepts:**
```javascript
const handlePageEnter = async (el, done) => {
  // Get overlay element from Pinia store (set by PageTransitionOverlay on mount)
  const overlay = store.overlayElement;

  if (!overlay || !$gsap) {
    done();
    return;
  }

  store.startEntering();

  // Wait for ScrollSmoother using reactive watch, not polling
  if (!store.scrollSmootherReady) {
    const waitForScrollSmoother = new Promise((resolve) => {
      const unwatch = watch(
        () => store.scrollSmootherReady,
        (ready) => {
          if (ready) {
            unwatch();
            resolve();
          }
        },
        { immediate: true }
      );

      // Fallback timeout
      setTimeout(() => {
        unwatch();
        resolve();
      }, 2000);
    });

    await waitForScrollSmoother;
  }

  // Reveal animation - contract from bottom (reverse of expand)
  await nextTick();
  const revealComplete = new Promise((resolve) => {
    $gsap.timeline({ onComplete: () => resolve() })
      .to(overlay, {
        clipPath: 'circle(0% at 50% 100%)', // Contract to bottom
        duration,
        ease: 'power2.inOut'
      });
  });

  await revealComplete;
  done(); // Signal Vue transition complete
};
```

**Why reactive `watch()` instead of `setInterval()`?**
- ✅ Vue's reactivity system is more reliable
- ✅ No manual cleanup needed (unwatch handles it)
- ✅ Immediate execution if already ready
- ✅ Fallback timeout for safety

### 3. Pinia Store: `app/stores/pageTransition.js`

**Purpose:** Coordinate state between middleware, composable, and ScrollSmoother + manage overlay element reference

**State Machine:**
```javascript
state: {
  state: 'idle' | 'locked' | 'leaving' | 'entering',
  scrollSmootherReady: boolean,
  lockedPath: string | null,
  overlayElement: HTMLElement | null
}

// Transition flow:
// idle → lock() → locked → startLeaving() → leaving → startEntering() → entering → complete() → idle
```

**Key Actions:**
- `lock(path)` - Acquire transition lock, prevents duplicate transitions
- `startLeaving()` - Only allowed from 'locked', starts exit animation
- `startEntering()` - Allows from 'leaving' or 'entering' (Vue calls twice sometimes)
- `complete()` - Reset to idle state, clear lock
- `reset()` - Emergency fallback to idle
- `setScrollSmootherReady(ready)` - Updated by ScrollSmoother plugin
- `setOverlayElement(element)` - Set by PageTransitionOverlay component on mount

### 4. ScrollSmoother Plugin: `app/plugins/scrollsmoother.client.js`

**Purpose:** Coordinate ScrollSmoother lifecycle with page transitions

**Key Hooks:**
```javascript
// PHASE 2: Kill ScrollSmoother when route starts changing
nuxtApp.hook("page:start", async () => {
  const transitionStore = usePageTransitionStore?.();

  if (transitionStore) {
    transitionStore.setScrollSmootherReady(false);
  }

  // Use nextTick instead of setTimeout
  await nextTick();
  await nextTick(); // Double nextTick ensures overlay has started

  kill();
});

// PHASE 2: Reinit ScrollSmoother when route finishes
nuxtApp.hook("page:finish", async () => {
  setScrollerDefaultsEarly();

  // Wait for next frame using Promise
  await new Promise(resolve => requestAnimationFrame(resolve));

  init();

  if (transitionStore) {
    transitionStore.setScrollSmootherReady(true);
  }

  // Clear transition flag on next frame
  await new Promise(resolve => requestAnimationFrame(resolve));
  setRouteChanging(false);
});
```

**Why the timing matters:**
- Kill ScrollSmoother AFTER overlay starts covering (prevents visible transform removal)
- Init ScrollSmoother BEFORE reveal animation (ensures smooth scrolling is ready)
- Use `nextTick()` and `requestAnimationFrame()` instead of arbitrary timeouts

### 5. Overlay Component: `app/components/PageTransitionOverlay.vue`

**Purpose:** Visual circle mask with animated gradients that covers/reveals content

**Location:** Rendered in `app/layouts/default.vue` (same DOM context as header for proper stacking)

**Key Features:**
- Registers itself with Pinia store on mount via `setOverlayElement()`
- Animated gradient layers that sync with theme colors
- Z-index 40 (below header at 50, above content)

**Key CSS:**
```css
.page-transition-overlay {
  position: fixed;
  top: 0; /* Cover full viewport including header area */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40; /* Below header (50), above content */
  background-color: var(--theme-100); /* Theme-aware base color */
  opacity: 0;
  pointer-events: none;
  clip-path: circle(0% at 50% 100%); /* Start: bottom center, 0% radius */
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Animated gradient layers for organic fluid-like effect */
.gradient-layer {
  position: absolute;
  width: 300%;
  height: 300%;
  mix-blend-mode: normal;
  will-change: transform;
}
```

**Component Setup:**
```javascript
const overlayRef = ref(null);
const store = usePageTransitionStore();

onMounted(() => {
  store.setOverlayElement(overlayRef.value);
});

onBeforeUnmount(() => {
  store.setOverlayElement(null);
});
```

**GSAP Animation Pattern:**
```javascript
// PHASE 1: Expand from bottom (in middleware)
.to(overlay, {
  clipPath: 'circle(150% at 50% 100%)', // 150% radius at bottom
  duration,
  ease: 'power2.inOut'
})

// PHASE 3: Contract from bottom (in composable)
.to(overlay, {
  clipPath: 'circle(0% at 50% 100%)', // Contract to 0% from bottom
  duration,
  ease: 'power2.inOut'
})
```

### 6. App Setup: `app/app.vue`

**Purpose:** Wire up the transition system

```vue
<template>
  <FluidGradient />

  <NuxtLayout>
    <NuxtPage
      :transition="{
        mode: 'out-in',
        css: false, // Disable CSS transitions, use GSAP
        onEnter: handlePageEnter // Only handle reveal phase
      }"
    />
  </NuxtLayout>

  <CursorTrail />
</template>

<script setup>
// Initialize page transition composable
// Overlay element is accessed from Pinia store (set by PageTransitionOverlay component)
const { handlePageEnter } = usePageTransition();
</script>
```

**Why `mode: 'out-in'`?**
- Ensures old page fully leaves before new page enters
- Prevents both pages from being visible simultaneously

**Why `css: false`?**
- We use GSAP for animations, not Vue's CSS transitions
- Gives us precise control over timing and coordination

**Why no overlay ref?**
- PageTransitionOverlay registers itself with Pinia store on mount
- usePageTransition gets overlay from store (no prop passing needed)
- Eliminates provide/inject timing issues

## Design Tokens

### Transition Timing (in `app/assets/css/tokens/theme.scss`)

```scss
/* Page transition duration */
--duration-page: 1400ms; /* Circle reveal animation */

/* Easing function (matches GSAP power2.inOut) */
--ease-power2-inout: cubic-bezier(0.65, 0, 0.35, 1);
```

**Usage in JavaScript:**
```javascript
const duration = parseFloat(
  getComputedStyle(document.documentElement)
    .getPropertyValue('--duration-page')
) / 1000 || 1;

$gsap.to(overlay, {
  clipPath: 'circle(150% at 50% 100%)',
  duration,
  ease: 'power2.inOut' // GSAP ease name
});
```

### Theme Integration

The overlay uses theme-aware colors for organic gradient effects:
- Base background: `var(--theme-100)` matches current theme
- Gradient colors: `var(--gradient-tl/tr/bl/br)` animated by GSAP during theme toggle
- Light theme: Soft pastel gradients (rose, mint, lavender, lime)
- Dark theme: Deep rich gradients (purple, blue, magenta, teal)
- Smooth theme transitions: All colors animate together

## Key Principles

### 1. Async Coordination (Not Timeouts)

**❌ BAD - Arbitrary timeouts:**
```javascript
setTimeout(() => {
  kill();
}, 100); // Why 100ms? What if it's not enough?
```

**✅ GOOD - Promise-based coordination:**
```javascript
const animationComplete = new Promise((resolve) => {
  $gsap.timeline({
    onComplete: () => resolve()
  }).to(overlay, { /* animation */ });
});

await animationComplete;
// Now we KNOW animation is done
```

### 2. Reactivity Over Polling

**❌ BAD - Polling with setInterval:**
```javascript
const check = setInterval(() => {
  if (store.scrollSmootherReady) {
    clearInterval(check);
    startReveal();
  }
}, 50);
```

**✅ GOOD - Reactive watch:**
```javascript
const unwatch = watch(
  () => store.scrollSmootherReady,
  (ready) => {
    if (ready) {
      unwatch();
      resolve();
    }
  },
  { immediate: true }
);
```

### 3. Nuxt Hooks Over DOM Events

**✅ Use Nuxt lifecycle hooks:**
- `page:start` - Route is about to change
- `page:finish` - New page component loaded
- `app:mounted` - App fully initialized

**✅ Use proper timing helpers:**
- `nextTick()` - Wait for Vue to update DOM
- `requestAnimationFrame()` - Wait for next browser paint
- Promises - Coordinate async operations

### 4. State Management

**Single source of truth in Pinia:**
- Transition state ('idle', 'leaving', 'entering')
- ScrollSmoother readiness
- Prevents race conditions
- Coordinates across files

## Nuxt 4 Specifics

### Navigation Guards

**Nuxt 4 provides these helpers in middleware:**
```typescript
navigateTo(path) // Redirects and triggers middleware again
abortNavigation() // Stops navigation completely
```

**Our pattern:**
1. `abortNavigation()` - Block user navigation
2. Animate overlay
3. `router.push()` - Navigate programmatically (bypasses middleware)

### Transition Hooks

**Vue 3 transition hooks we use:**
```javascript
onEnter(el, done) // Called when new page enters
```

**Hooks we DON'T use:**
- `onLeave` - Handled by middleware instead
- `onBeforeEnter` - Not needed
- `onAfterEnter` - Not needed (we handle in onEnter)

### Page Lifecycle

```
User clicks link
  ↓
Middleware intercepts (page:start NOT fired yet)
  ↓
abortNavigation() blocks route
  ↓
Overlay expands (PHASE 1)
  ↓
router.push() triggers route change
  ↓
page:start hook fires → Kill ScrollSmoother
  ↓
Route changes, new page component loads
  ↓
page:finish hook fires → Init ScrollSmoother
  ↓
onEnter hook fires (PHASE 3)
  ↓
Wait for ScrollSmoother ready
  ↓
Overlay contracts to reveal
  ↓
done() signals Vue
  ↓
Transition complete → State resets to 'idle'
```

## Common Issues & Solutions

### Issue: Nuxt config conflicts with custom transitions

**Cause:** Global `pageTransition` config in `nuxt.config.ts` overrides custom GSAP-based transitions

**Symptoms:**
- Middleware never fires (no console logs)
- Super-fast CSS-based transitions instead of GSAP animations
- onEnter hooks ignored in app.vue

**Solution:** Explicitly disable Nuxt's built-in transitions in `nuxt.config.ts`:

```typescript
// nuxt.config.ts
app: {
  pageTransition: false, // Disable Nuxt's built-in CSS transitions
  layoutTransition: false, // Custom JS-based transitions only

  head: {
    // ... rest of config
  }
}
```

**DO NOT USE:**
```typescript
// ❌ This will break your custom GSAP middleware system
app: {
  pageTransition: { name: "page", mode: "out-in", appear: true },
  layoutTransition: { name: "layout", mode: "out-in", appear: true },
}
```

### Issue: Page transitions too fast or instant

**Cause:** Incorrect duration parsing when reading CSS custom properties

**Symptoms:**
- Animations complete in ~1-5ms instead of 1400ms
- Console shows: `Duration raw: 1.4s parsed: 0.0014`

**Solution:** Browser normalizes CSS time values (e.g., `1400ms` becomes `"1.4s"`). The parsing code must handle both formats:

```javascript
// WRONG - assumes ms and always divides by 1000
const duration = parseFloat(getComputedStyle(html).getPropertyValue("--duration-page")) / 1000;
// If browser returns "1.4s", this gives 0.0014 seconds!

// CORRECT - detects unit and parses accordingly
const durationRaw = getComputedStyle(html).getPropertyValue("--duration-page").trim();
let duration = 1; // Default fallback
if (durationRaw.endsWith('ms')) {
  duration = parseFloat(durationRaw) / 1000; // Convert ms to seconds
} else if (durationRaw.endsWith('s')) {
  duration = parseFloat(durationRaw); // Already in seconds
}
```

This fix is implemented in:
- `app/middleware/pageTransition.global.ts` (cover animation)
- `app/composables/usePageTransition.js` (reveal animation)

### Issue: Content jumps visible during transition

**Cause:** Route changing before overlay covers content

**Solution:** Middleware blocks navigation until overlay covers:
```typescript
const animationComplete = new Promise((resolve) => {
  $gsap.timeline({ onComplete: () => resolve() })
    .to(overlay, { /* cover content */ });
});

await animationComplete;
await router.push(to.fullPath); // Only navigate when covered
```

### Issue: Middleware triggers infinitely

**Cause:** `navigateTo()` inside middleware triggers middleware again

**Solution:** Use state flag + `router.push()`:
```typescript
// Check if WE triggered this navigation
if (store.isTransitioning && store.state === 'leaving') {
  return; // Allow our navigation through
}

// Otherwise, it's a user navigation - block and animate
store.startLeaving();
// ... animate ...
await router.push(to.fullPath); // Bypasses middleware
```

### Issue: Animations sometimes inconsistent

**Cause:** Using `setTimeout()` instead of proper async patterns

**Solution:** Use Promises and `nextTick()`:
```javascript
// Wait for animation
const animationComplete = new Promise(resolve => {
  $gsap.timeline({ onComplete: resolve })
});

await animationComplete;
await nextTick(); // Ensure DOM is ready
```

### Issue: ScrollSmoother visible during kill

**Cause:** Killing ScrollSmoother before overlay covers content

**Solution:** Double `nextTick()` delay:
```javascript
nuxtApp.hook("page:start", async () => {
  await nextTick();
  await nextTick(); // Wait for overlay to start covering
  kill(); // Now safe to kill
});
```

### Issue: Reveal happens before ScrollSmoother ready

**Cause:** Not waiting for ScrollSmoother initialization

**Solution:** Reactive watch on store:
```javascript
const waitForScrollSmoother = new Promise((resolve) => {
  const unwatch = watch(
    () => store.scrollSmootherReady,
    (ready) => {
      if (ready) {
        unwatch();
        resolve();
      }
    },
    { immediate: true }
  );
});

await waitForScrollSmoother;
```

### Issue: Overlay ref is null in composable (provide/inject timing)

**Cause:** When using provide/inject pattern between layout and app.vue, the overlay component hasn't mounted when app.vue setup runs, so the injected ref is null.

**Solution:** Use Pinia store to manage overlay element reference:
```javascript
// In PageTransitionOverlay.vue
const overlayRef = ref(null);
const store = usePageTransitionStore();

onMounted(() => {
  store.setOverlayElement(overlayRef.value);
});

// In usePageTransition.js
const overlay = store.overlayElement; // Always available after mount
```

**Why this works:**
- Component mounts and registers overlay element immediately
- Pinia store is reactive and accessible everywhere
- No timing issues with provide/inject across layout boundaries
- Simpler code, single source of truth

### Issue: Header glitches/disappears during transition

**Cause:** Overlay in different DOM context (app.vue) than header (layouts/default.vue), causing stacking context issues.

**Solution:** Move overlay to same component as header:
```vue
<!-- layouts/default.vue -->
<template>
  <div id="smooth-wrapper">
    <header role="banner">
      <HeaderGrid />
    </header>

    <!-- Same DOM level as header -->
    <PageTransitionOverlay />

    <div id="smooth-content">
      <main><slot /></main>
    </div>
  </div>
</template>
```

**Additional fix:** Add isolation to header CSS:
```scss
.header-grid {
  position: relative;
  z-index: 50;
  isolation: isolate; // Create isolated stacking context
}
```

**Why this works:**
- Header and overlay in same DOM tree
- Header has z-index 50, overlay has z-index 40
- `isolation: isolate` ensures header children stay above overlay
- Overlay covers full viewport (including header area) but header renders on top

## Testing Checklist

When testing page transitions:

- [x] First navigation works smoothly
- [x] Second+ navigations work consistently
- [x] No visible content jumps
- [x] Header stays visible throughout (fixed via DOM context + isolation)
- [x] Overlay gradients match theme (animated gradient layers)
- [x] Theme switching during transition works
- [x] No console errors
- [x] ScrollSmoother works on new page
- [x] Back button navigation works
- [x] Fast clicking doesn't break transitions (locking mechanism)
- [ ] Mobile navigation works (needs testing)
- [x] Overlay element properly registered in store
- [x] Single bottom-origin animation (expand and contract from same position)

## Performance Considerations

### Why GSAP for Transitions?

**Advantages:**
- ✅ Hardware-accelerated animations
- ✅ Precise timing control
- ✅ Coordinates with ScrollSmoother (same engine)
- ✅ Smooth clip-path animations
- ✅ Theme-aware (uses CSS variables)

**vs CSS Transitions:**
- CSS can't coordinate with route changes
- CSS can't block navigation
- CSS doesn't integrate with ScrollSmoother lifecycle

### Optimization Tips

**Minimize repaints:**
- Overlay uses `transform` and `clip-path` (GPU accelerated)
- No `width`/`height` animations
- `opacity` changes are cheap

**Reduce JavaScript work:**
- State checks are lightweight
- No DOM queries in hot paths
- Reactive watch instead of polling intervals

## Future Enhancements

Potential improvements:

- [ ] Different transition types (slide, fade, etc.)
- [ ] Page-specific transition overrides via `definePageMeta`
- [ ] Respect `prefers-reduced-motion` to disable transitions
- [ ] Loading states for slow pages
- [ ] Transition progress indicator
- [ ] Custom easing curves per route
- [ ] Stagger animations for page elements

## Migration Guide

If you need to change the transition system:

### Changing Animation Style

**Current:** Circle expand/contract

**To change:** Update `clip-path` values:
```javascript
// Example: Vertical wipe instead
.to(overlay, {
  clipPath: 'inset(0 0 0 0)', // Full coverage
  duration,
  ease: 'sine.out'
})
```

### Changing Timing

**Global change:** Update CSS token:
```scss
--duration-page: 1500ms; /* Slower transitions */
```

**Per-route override:** Use `definePageMeta`:
```javascript
definePageMeta({
  pageTransition: {
    duration: 500 // Override for this page
  }
})
```

### Adding New Transition Types

1. Add token for transition name
2. Create new animation function in composable
3. Use `to.meta.pageTransition.name` to select animation
4. Keep same phase architecture (hide → switch → reveal)

## Files Reference

### Core System
- `nuxt.config.ts` - **CRITICAL:** Must disable built-in transitions (`pageTransition: false`)
- `app/middleware/pageTransition.global.ts` - Navigation interception (PHASE 1)
- `app/composables/usePageTransition.js` - Reveal animations (PHASE 3)
- `app/stores/pageTransition.js` - State coordination
- `app/plugins/scrollsmoother.client.js` - ScrollSmoother lifecycle
- `app/components/PageTransitionOverlay.vue` - Visual overlay element
- `app/app.vue` - System initialization

### Supporting Files
- `app/assets/css/tokens/theme.scss` - Timing tokens
- `.claude/THEME_SYSTEM.md` - Theme integration docs
- `.claude/PAGE_TRANSITION_SYSTEM.md` - This file

## Key Learnings

**What worked:**
- ✅ Blocking navigation until content is hidden
- ✅ Promise-based coordination over timeouts
- ✅ Reactive watch over polling intervals
- ✅ Pinia for state management
- ✅ `router.push()` to bypass middleware loop
- ✅ Double `nextTick()` for proper timing
- ✅ Theme-aware overlay using CSS variables
- ✅ Pinia store for overlay element reference (no provide/inject timing issues)
- ✅ Single bottom-origin animation (expand and contract from same point)
- ✅ Moving overlay to layout (same DOM context as header)
- ✅ `isolation: isolate` on header for proper stacking
- ✅ Animated gradient layers for organic visual effect
- ✅ Transition locking mechanism to prevent rapid clicks
- ✅ **CRITICAL:** Setting `pageTransition: false` in `nuxt.config.ts` to disable Nuxt's built-in system
- ✅ Proper duration parsing that handles browser-normalized units (`s` vs `ms`)

**What didn't work:**
- ❌ `navigateTo()` in middleware (infinite loop)
- ❌ `setTimeout()` for coordination (unreliable)
- ❌ `setInterval()` for waiting (unnecessary)
- ❌ Killing ScrollSmoother too early (visible jump)
- ❌ Not waiting for ScrollSmoother (buggy reveal)
- ❌ CSS transitions (can't coordinate with routing)
- ❌ provide/inject for overlay ref (timing issues across layout boundaries)
- ❌ Overlay in app.vue while header in layout (stacking context issues)
- ❌ Different clip-path origins for expand/contract (disorienting animation)
- ❌ **CRITICAL:** Leaving default `pageTransition` config in `nuxt.config.ts` (completely bypasses middleware)
- ❌ Assuming CSS duration values are always in `ms` (browser normalizes to `s` format)

## Credits & Resources

**GSAP Documentation:**
- [GSAP Timeline](https://greensock.com/docs/v3/GSAP/Timeline)
- [ScrollSmoother](https://greensock.com/docs/v3/Plugins/ScrollSmoother)
- [clip-path animations](https://greensock.com/docs/v3/GSAP/CorePlugins)

**Nuxt 4 Documentation:**
- [Route Middleware](https://nuxt.com/docs/guide/directory-structure/middleware)
- [Page Transitions](https://nuxt.com/docs/getting-started/transitions)
- [Lifecycle Hooks](https://nuxt.com/docs/api/advanced/hooks)

**Vue 3 Documentation:**
- [Transition Hooks](https://vuejs.org/guide/built-ins/transition.html#javascript-hooks)
- [Reactivity API](https://vuejs.org/api/reactivity-core.html)
