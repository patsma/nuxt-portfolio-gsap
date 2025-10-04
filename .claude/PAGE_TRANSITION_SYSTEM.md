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
- Circle overlay flips to top position
- Overlay contracts from top to reveal new page
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

  // Reveal animation
  await nextTick();
  const revealComplete = new Promise((resolve) => {
    $gsap.timeline({ onComplete: () => resolve() })
      .set(overlay, { clipPath: 'circle(150% at 50% 0%)' }) // Flip to top
      .to(overlay, {
        clipPath: 'circle(0% at 50% 0%)', // Contract from top
        duration,
        ease: 'sine.out'
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

**Purpose:** Coordinate state between middleware, composable, and ScrollSmoother

**State Machine:**
```javascript
state: {
  state: 'idle' | 'leaving' | 'entering',
  scrollSmootherReady: boolean
}

// Transition flow:
// idle → startLeaving() → leaving → startEntering() → entering → complete() → idle
```

**Key Actions:**
- `startLeaving()` - Only allowed from 'idle', prevents duplicate transitions
- `startEntering()` - Allows from 'leaving' or 'entering' (Vue calls twice sometimes)
- `complete()` - Reset to idle state
- `setScrollSmootherReady()` - Updated by ScrollSmoother plugin

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

**Purpose:** Visual circle mask that covers/reveals content

**Key CSS:**
```css
.page-transition-overlay {
  position: fixed;
  top: var(--size-header); /* Below header - header stays visible */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40; /* Below header (50), above content */
  background-color: var(--theme-100); /* Theme-aware */
  opacity: 0;
  pointer-events: none;
  clip-path: circle(0% at 50% 100%); /* Start: bottom center, 0% radius */
  width: 100vw;
  height: calc(100vh - var(--size-header));
}
```

**GSAP Animation Pattern:**
```javascript
// PHASE 1: Expand from bottom
.to(overlay, {
  clipPath: 'circle(150% at 50% 100%)', // 150% radius at bottom
  duration,
  ease: 'sine.out'
})

// PHASE 3: Contract from top
.set(overlay, {
  clipPath: 'circle(150% at 50% 0%)' // Flip to top instantly
})
.to(overlay, {
  clipPath: 'circle(0% at 50% 0%)', // Contract to 0% from top
  duration,
  ease: 'sine.out'
})
```

### 6. App Setup: `app/app.vue`

**Purpose:** Wire up the transition system

```vue
<template>
  <NuxtLayout>
    <NuxtPage
      :transition="{
        mode: 'out-in',
        css: false, // Disable CSS transitions, use GSAP
        onEnter: handlePageEnter // Only handle reveal phase
      }"
    />
  </NuxtLayout>

  <PageTransitionOverlay ref="overlayComponentRef" />
</template>

<script setup>
const overlayComponentRef = ref(null);
const overlayRef = computed(() => overlayComponentRef.value?.overlayRef);
const { handlePageEnter } = usePageTransition(overlayRef);
</script>
```

**Why `mode: 'out-in'`?**
- Ensures old page fully leaves before new page enters
- Prevents both pages from being visible simultaneously

**Why `css: false`?**
- We use GSAP for animations, not Vue's CSS transitions
- Gives us precise control over timing and coordination

## Design Tokens

### Transition Timing (in `app/assets/css/tokens/theme.scss`)

```scss
/* Page transition duration */
--duration-page: 1000ms; /* Circle reveal animation */

/* Easing function (matches GSAP sine.out) */
--ease-sine-out: cubic-bezier(0.39, 0.575, 0.565, 1);
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
  ease: 'sine.out' // GSAP ease name
});
```

### Theme Integration

The overlay uses `var(--theme-100)` so it automatically matches the current theme:
- Light theme: Light overlay covers content
- Dark theme: Dark overlay covers content
- Smooth theme transitions: Overlay color animates with theme

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

## Testing Checklist

When testing page transitions:

- [ ] First navigation works smoothly
- [ ] Second+ navigations work consistently
- [ ] No visible content jumps
- [ ] Header stays visible throughout
- [ ] Overlay color matches theme
- [ ] Theme switching during transition works
- [ ] No console errors
- [ ] ScrollSmoother works on new page
- [ ] Back button navigation works
- [ ] Fast clicking doesn't break transitions
- [ ] Mobile navigation works

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

**What didn't work:**
- ❌ `navigateTo()` in middleware (infinite loop)
- ❌ `setTimeout()` for coordination (unreliable)
- ❌ `setInterval()` for waiting (unnecessary)
- ❌ Killing ScrollSmoother too early (visible jump)
- ❌ Not waiting for ScrollSmoother (buggy reveal)
- ❌ CSS transitions (can't coordinate with routing)

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
