# Scroll System

GSAP ScrollSmoother with headroom-style header integration.

## Architecture

```
ScrollSmoother (Composable)
  ↓ onUpdate callback
  ↓
Headroom (Plugin)
  ↓ updates CSS classes
  ↓
Page Transitions
  ↓ pause/resume coordination
```

## Critical DOM Structure

**Fixed elements MUST be outside `#smooth-content`:**

```vue
<div id="smooth-wrapper">
  <HeaderGrid />  <!-- ✅ Fixed, OUTSIDE smooth-content -->

  <div id="smooth-content">
    <!-- Page content -->
  </div>
</div>
```

**Why:** ScrollSmoother applies `transform` to `#smooth-content`, breaking `position: fixed`.

## Core Files

| File | Purpose |
|------|---------|
| `app/composables/useScrollSmootherManager.js` | Module-level composable managing lifecycle |
| `app/plugins/headroom.client.js` | Header visibility with pause/resume |
| `app/composables/usePageTransition.js` | Coordinates headroom with transitions |
| `app/assets/css/components/header-grid.scss` | Transform-based header animations |

## ScrollSmoother Setup

**File:** `app/layouts/default.vue`

```javascript
const { createSmoother, killSmoother } = useScrollSmootherManager()
const nuxtApp = useNuxtApp()

onMounted(() => {
  nextTick(() => {
    createSmoother({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1,                     // Safari-optimized (2+ drops to 14fps)
      effects: true,                 // Enable data-speed and data-lag
      normalizeScroll: true,         // Improves Safari + touch
      ignoreMobileResize: true,      // Prevents mobile jank
      onUpdate: (self) => {
        nuxtApp.$headroom?.updateHeader(self.scrollTop())
      }
    })
  })
})
```

## Headroom Configuration

**File:** `app/plugins/headroom.client.js`

| Setting | Value | Purpose |
|---------|-------|---------|
| `SCROLL_THRESHOLD` | 100px | Distance before hiding header |
| `THROTTLE_DELAY` | 100ms | Update frequency (~10 times/sec) |

### Behavior Zones

| Zone | Scroll Position | Behavior |
|------|----------------|----------|
| Top | `scrollY ≤ 0` | Always visible |
| Threshold | `0 < scrollY ≤ 100px` | Always visible (prevents flicker) |
| Content | `scrollY > 100px` | Scroll down → hide, scroll up → show |

### Pause/Resume Pattern

**Used during page transitions to prevent header jump:**

```javascript
// Pause (on page:start)
pause() {
  isPaused = true
  headerElement.classList.add('headroom--no-transition')  // Disable CSS transitions
  void headerElement.offsetHeight  // Force reflow
  headerElement.classList.add('headroom--pinned')  // Pin instantly
}

// Resume (in enter() onComplete)
resume() {
  isPaused = false
  lastScrollTop = 0
  headerElement.classList.remove('headroom--no-transition')  // Re-enable transitions
}
```

## Page Transition Coordination

### Lifecycle

```
User clicks link → page:start → headroom.pause()
  ↓
Leave animation (elements fade OUT)
  ↓
afterLeave → scroll to top (instant, content hidden)
  ↓
Enter animation (elements fade IN)
  ↓
onComplete → headroom.resume()
```

### Integration

**File:** `app/composables/usePageTransition.js`

```javascript
// Pause on navigation start
nuxtApp.hook('page:start', () => {
  nuxtApp.$headroom?.pause()
})

// Resume when enter animation completes
const enter = (el, done) => {
  const tl = gsap.timeline({
    onComplete: () => {
      done()
      nuxtApp.$headroom?.resume()
    }
  })
}
```

## Header Styles

**File:** `app/assets/css/components/header-grid.scss`

```scss
.header-grid {
  position: fixed;
  top: 0;
  transition: transform var(--duration-hover) var(--ease-power2);
  will-change: transform;

  &.headroom--pinned {
    transform: translateY(0%);
  }

  &.headroom--unpinned {
    transform: translateY(-100%);
  }

  // Disable transitions during page transitions
  &.headroom--no-transition {
    transition: none !important;
  }
}
```

**Why transform:** GPU-accelerated, no layout reflow (unlike `top` property).

## Parallax Effects

**Usage in templates:**

```vue
<div data-speed="0.5">Background (slower)</div>
<div data-lag="0.15">Trailing effect</div>
<h1 v-page-split:chars data-speed="0.7">Combined</h1>
```

**Refresh after route change:**

```javascript
// In enter() after directives mount
refreshSmoother()  // Recalculates parallax for new content
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Header jumps during transition | CSS transitions active | Use `headroom--no-transition` during pause |
| Scroll jump visible to user | Auto-scroll before animations | Scroll in `afterLeave()` when content hidden |
| Headroom not hiding | onUpdate not called | Verify callback in createSmoother() |
| Fixed elements broken | Inside smooth-content | Move outside (see DOM structure) |
| Headroom resumes too early | Using page:finish hook | Resume in enter() `onComplete` instead |
| 14fps on Safari | smooth value too high | Use `smooth: 1` (see setup) |

## Performance

**Optimizations:**
- Single scroll listener (ScrollSmoother's internal)
- Throttled updates (100ms between header changes)
- GPU-accelerated animations (transform-based)
- No layout reflows
- Cached DOM references

**Safari Performance:**
- `smooth: 1` maintains 60fps (2+ drops to 14fps)
- `normalizeScroll: true` improves behavior
- `ignoreMobileResize: true` prevents jank

## Files Reference

**Composables:**
- `app/composables/useScrollSmootherManager.js` - Lifecycle management
- `app/composables/usePageTransition.js` - Transition coordination

**Plugins:**
- `app/plugins/headroom.client.js` - Header visibility logic

**Components:**
- `app/components/HeaderGrid.vue` - Fixed header

**Styles:**
- `app/assets/css/components/header-grid.scss` - Header animations
- `app/assets/css/tokens/theme.scss` - Design tokens

**Config:**
- `app/router.options.ts` - Disable automatic scroll
- `app/layouts/default.vue` - ScrollSmoother + transitions integration
