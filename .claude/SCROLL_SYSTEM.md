# Scroll System Documentation

## Overview

GSAP ScrollSmoother with integrated headroom-style header that hides on scroll down and shows on scroll up. Coordinated with GSAP page transitions for smooth navigation without jumps.

## Architecture

### Key Components

```
ScrollSmoother (Composable-based)
    ↓ onUpdate callback
    ↓ provides: scrollTop()
    ↓
Headroom (Plugin)
    ↓ receives scroll position
    ↓ calculates: direction, threshold
    ↓ updates: CSS classes
    ↓
Page Transitions
    ↓ pause/resume headroom
    ↓ prevent header jump during navigation
```

### Critical Structure

Fixed-position elements MUST be outside `#smooth-content`:

```vue
<div id="smooth-wrapper">
  <!-- ✅ Header OUTSIDE smooth-content -->
  <HeaderGrid />

  <div id="smooth-content">
    <!-- Page content here -->
  </div>
</div>
```

**Why?** ScrollSmoother applies `transform` to `#smooth-content`, breaking `position: fixed`.

## Core Files

### 1. ScrollSmoother Manager (`app/composables/useScrollSmootherManager.js`)

Module-level composable managing ScrollSmoother lifecycle.

**Key Methods:**
```javascript
const { createSmoother, killSmoother, getSmoother, refreshSmoother } = useScrollSmootherManager()

// Create with onUpdate callback for headroom
createSmoother({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 2,
  effects: true,
  onUpdate: (self) => {
    nuxtApp.$headroom?.updateHeader(self.scrollTop())
  }
})

// Refresh after DOM changes (parallax recalculation)
refreshSmoother()
```

**Module-Level State:**
```javascript
let smootherInstance = null // Shared across all calls
```

### 2. Headroom Plugin (`app/plugins/headroom.client.js`)

Throttled header visibility with pause/resume for page transitions.

**Configuration:**
```javascript
const SCROLL_THRESHOLD = 100  // px before hiding header
const THROTTLE_DELAY = 100    // ms between updates
```

**API:**
```javascript
nuxtApp.$headroom = {
  updateHeader(scrollTop),  // Called by ScrollSmoother.onUpdate
  reset(),                   // Show header, clear state
  pause(),                   // Pause during transitions
  resume()                   // Resume after transitions
}
```

**Pause/Resume Pattern:**
```javascript
pause() {
  isPaused = true
  // Disable CSS transitions to prevent animated slide
  headerElement.classList.add('headroom--no-transition')
  void headerElement.offsetHeight  // Force reflow
  // Pin header instantly
  headerElement.classList.add('headroom--pinned')
  headerElement.classList.remove('headroom--unpinned')
}

resume() {
  isPaused = false
  lastScrollTop = 0
  lastUpdateTime = 0
  // Re-enable CSS transitions
  headerElement.classList.remove('headroom--no-transition')
}
```

### 3. Page Transitions Integration (`app/composables/usePageTransition.js`)

Coordinates headroom with page animations.

**Lifecycle:**
```javascript
// page:start → pause headroom
nuxtApp.hook('page:start', () => pause())

// enter() onComplete → resume headroom
const tl = gsap.timeline({
  onComplete: () => {
    done()
    nuxtApp.$headroom?.resume()
  }
})
```

### 4. Header Styles (`app/assets/css/components/header-grid.scss`)

Transform-based animations with transition disabling.

```scss
.header-grid {
  position: fixed;
  top: 0;
  transition: transform var(--duration-hover) var(--ease-power2);
  will-change: transform;
}

.header-grid.headroom--pinned {
  transform: translateY(0%);
}

.header-grid.headroom--unpinned {
  transform: translateY(-100%);
}

/* Disable transitions during page transitions */
.header-grid.headroom--no-transition {
  transition: none !important;
}
```

## Page Transition Flow

### Complete Navigation Cycle

```
User at scroll 500px → clicks link
    ↓
page:start → headroom.pause()
    - Add headroom--no-transition
    - Pin header instantly
    - isPaused = true
    ↓
Leave animation → elements fade OUT at scroll 500px
    ↓
afterLeave → smoother.scrollTop(0)
    - Scroll instantly to 0
    - Content already hidden
    - Headroom paused, no reaction
    ↓
Enter animation → elements fade IN at scroll 0
    ↓
onComplete → headroom.resume()
    - Remove headroom--no-transition
    - isPaused = false
    - Headroom active again
```

### Key Implementation Details

**Manual Scroll Control** (`router.options.ts`):
```typescript
scrollBehavior() {
  return false // Prevent automatic scroll
}
```

**Scroll in afterLeave** (`usePageTransition.js`):
```javascript
afterLeave(el) {
  cleanup()
  // Scroll to top AFTER leave animation
  const smoother = getSmoother()
  smoother?.scrollTop(0)
}
```

**Resume in enter onComplete** (`usePageTransition.js`):
```javascript
enter(el, done) {
  const tl = gsap.timeline({
    onComplete: () => {
      done()
      nuxtApp.$headroom?.resume()
    }
  })
}
```

## Headroom Behavior

### Three Zones

1. **Top Zone** (`scrollY ≤ 0`)
   - Header: Always visible

2. **Threshold Zone** (`0 < scrollY ≤ 100px`)
   - Header: Always visible
   - Prevents flicker on tiny scrolls

3. **Content Zone** (`scrollY > 100px`)
   - Scroll down → Hide header
   - Scroll up → Show header

### Direction Detection

```javascript
const scrollDirection = currentScroll > lastScrollTop ? 1 : -1
// 1 = scrolling down, -1 = scrolling up
```

### Throttling

```javascript
const now = Date.now()
if (now - lastUpdateTime < THROTTLE_DELAY) return
// Update only every 100ms (~10 times per second)
```

## Configuration

### Layout Setup (`app/layouts/default.vue`)

```vue
<script setup>
const { leave, enter, beforeEnter, afterLeave } = usePageTransition()
const { createSmoother, killSmoother } = useScrollSmootherManager()
const nuxtApp = useNuxtApp()

onMounted(() => {
  nextTick(() => {
    createSmoother({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 2,
      effects: true,
      onUpdate: (self) => {
        nuxtApp.$headroom?.updateHeader(self.scrollTop())
      }
    })
  })
})

onUnmounted(() => {
  killSmoother()
})
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

### Design Tokens

```scss
// app/assets/css/tokens/theme.scss
--size-header: 80px;
--duration-hover: 300ms;
--ease-power2: cubic-bezier(0.455, 0.03, 0.515, 0.955);
```

## Parallax Effects

### data-speed

Controls movement speed relative to scroll:

```vue
<div data-speed="0.5">Background (slower)</div>
<div data-speed="1.0">Normal speed</div>
<div data-speed="1.5">Foreground (faster)</div>
```

### data-lag

Creates smooth "catch up" effect:

```vue
<div data-lag="0.15">Slight trailing</div>
<div data-lag="0.25">More pronounced trailing</div>
```

### Combined with Transitions

```vue
<h1 v-page-split:chars data-speed="0.7">
  Animated reveal + parallax
</h1>
```

## Common Issues & Solutions

### Header Jumps During Transitions

**Symptom:** Header slides down when page changes

**Cause:** CSS transitions animate class changes

**Solution:** `headroom--no-transition` class applied during pause

### Scroll Jump Visible

**Symptom:** User sees scroll to top

**Cause:** Automatic scroll happens before animations complete

**Solution:** Manual scroll in `afterLeave` (content already hidden)

### Headroom Resumes Too Early

**Symptom:** Header reacts to scroll during transition

**Cause:** Resume triggered by `page:finish` (fires before animations)

**Solution:** Resume in enter() `onComplete` (waits for visual completion)

### Header Not Hiding on Scroll

**Diagnosis:**
1. Check ScrollSmoother created: `getSmoother()`
2. Verify onUpdate callback registered
3. Check headroom plugin loaded: `nuxtApp.$headroom`

**Solution:** Ensure onUpdate callback includes `updateHeader()`

## Performance

### Optimizations

- ✅ Single scroll listener (ScrollSmoother's internal)
- ✅ Throttled updates (100ms between header changes)
- ✅ GPU-accelerated animations (transform-based)
- ✅ No layout reflows during header hide/show
- ✅ Cached DOM references
- ✅ will-change hints for browser optimization

### Transform vs Top Animation

```scss
/* ❌ BAD: Forces layout recalculation */
.header { top: -80px; }

/* ✅ GOOD: GPU-accelerated, no reflow */
.header { transform: translateY(-100%); }
```

## Testing Checklist

**Desktop:**
- [ ] Scroll down past 100px → Header hides
- [ ] Scroll up → Header shows
- [ ] Page navigation → No header jump
- [ ] Fast navigation → Header stays pinned

**Mobile:**
- [ ] Touch scroll responsive
- [ ] Address bar show/hide doesn't cause jumps
- [ ] Headroom behavior works correctly

**Performance:**
- [ ] 60fps scroll (DevTools Performance)
- [ ] No layout thrashing
- [ ] Header animation smooth

## Benefits

✅ **No Scroll Jumps** - Manual scroll control during transitions
✅ **No Header Jumps** - CSS transitions disabled during pause
✅ **Perfect Timing** - Resume exactly when animations complete
✅ **Smooth UX** - Fade out → instant cut → fade in
✅ **Performant** - Single scroll listener, throttled updates
✅ **Maintainable** - Clear separation of concerns

## Files Reference

**Composables:**
- `app/composables/useScrollSmootherManager.js` - ScrollSmoother lifecycle
- `app/composables/usePageTransition.js` - Page transitions with headroom coordination

**Plugins:**
- `app/plugins/headroom.client.js` - Header visibility logic with pause/resume

**Components:**
- `app/components/HeaderGrid.vue` - Fixed header with headroom classes

**Styles:**
- `app/assets/css/components/header-grid.scss` - Header animations and states
- `app/assets/css/tokens/theme.scss` - Design tokens

**Config:**
- `app/router.options.ts` - Disable automatic scroll behavior
- `app/layouts/default.vue` - ScrollSmoother + page transitions integration
