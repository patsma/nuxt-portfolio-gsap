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
| `AT_TOP_THRESHOLD` | 10px | Distance to be considered "at top" |
| `SCROLL_THRESHOLD` | 100px | Distance before hiding header |
| `THROTTLE_DELAY` | 100ms | Update frequency (~10 times/sec) using VueUse `useThrottleFn` |

### Three-State System

| State | Class | Scroll Position | Appearance |
|-------|-------|----------------|------------|
| At Top | `headroom--top` | `scrollY ≤ 10px` | Full height, transparent background |
| Not Top | `headroom--not-top` | `10px < scrollY ≤ 100px` OR scrolling up | Compact height, backdrop blur |
| Hidden | `headroom--unpinned` | Scrolling down past 100px | Translated out of view |

### Pause/Resume Pattern

**Used during page transitions for smooth header animation:**

```javascript
// Pause (on page:start)
// Freezes header in current state - no animation, no class changes
pause() {
  isPaused = true  // Header stays frozen in current visual state
}

// Resume (in enter() onComplete)
// Re-enables headroom and smoothly animates to top state with slow transition
resume() {
  isPaused = false
  lastScrollTop = 0
  lastUpdateTime = 0
  headerElement.classList.remove('headroom--no-transition')
  headerElement.classList.add('headroom--smooth-transition')  // 800ms slow transition
  headerElement.classList.add('headroom--top')  // Smoothly animate to top state
  headerElement.classList.remove('headroom--not-top', 'headroom--unpinned')

  // Remove smooth-transition after animation completes
  // This restores normal fast transitions (300ms) for scroll behavior
  setTimeout(() => {
    headerElement.classList.remove('headroom--smooth-transition')
  }, 800)
}

// Reset (on app:mounted only)
// Instantly sets header to top state during initialization
reset() {
  lastScrollTop = 0
  lastUpdateTime = 0
  headerElement.classList.add('headroom--no-transition')  // Disable transitions
  void headerElement.offsetHeight  // Force reflow
  headerElement.classList.add('headroom--top')  // Set to top state (instant)
  headerElement.classList.remove('headroom--not-top', 'headroom--unpinned')
}
```

## Page Transition Coordination

### Lifecycle

```
User clicks link → page:start → headroom.pause()
  - Header freezes in current state (no visual change)
  ↓
Leave animation (elements fade OUT)
  - Header stays frozen in current visual state (may be hidden/not-top/top)
  ↓
afterLeave → scroll to top
  - Header stays frozen in current state (NOT changed)
  ↓
Enter animation (elements fade IN)
  - Header still frozen in previous state
  ↓
onComplete → headroom.resume()
  - Re-enables headroom updates
  - Smoothly animates header to top state (800ms smooth transition)
  - Restores fast transitions (300ms) after animation completes
```

### unpause() vs resume()

**Different methods for different use cases:**

| Method | Use Case | Behavior |
|--------|----------|----------|
| `pause()` | Both page transitions and accordions | Freezes header in current state |
| `resume()` | Page transitions only | Smoothly animates header to top state (800ms) |
| `unpause()` | Accordions/height changes only | Re-enables updates without animation, uses skipNextUpdate |

**When to use which:**
- **Page transitions:** Use `pause()` → `resume()` (animates to top)
- **Accordions/dynamic content:** Use `pause()` → `unpause()` (no animation, syncs scroll position)

### skipNextUpdate Pattern

When `unpause()` is called, it sets an internal `skipNextUpdate = true` flag. The next `updateHeader()` call will:
1. Skip header state changes (no show/hide/compact)
2. Sync `lastScrollTop` to current scroll position
3. Clear `skipNextUpdate` flag

**Why this matters:** After `ScrollTrigger.refresh()`, ScrollSmoother takes time to settle. The `skipNextUpdate` pattern ensures headroom syncs to the ACTUAL final scroll position instead of reacting to intermediate scroll changes during the settling animation.

**Example:** RecommendationItem accordion (lines 326-389)
```javascript
// Pause before animation
nuxtApp.$headroom?.pause();

$gsap.to(expandedContentRef.value, {
  height: 'auto',
  onComplete: () => {
    // Setup one-time listener BEFORE refresh
    const handleRefreshComplete = () => {
      nuxtApp.$headroom?.unpause(); // Uses skipNextUpdate internally
      $ScrollTrigger.removeEventListener('refresh', handleRefreshComplete);
    };

    $ScrollTrigger.addEventListener('refresh', handleRefreshComplete);
    $ScrollTrigger.refresh(); // Listener fires when complete
  }
});
```

### Integration

**File:** `app/composables/usePageTransition.js`

```javascript
// Pause on navigation start (freezes header in current state)
nuxtApp.hook('page:start', () => {
  nuxtApp.$headroom?.pause()
})

// After leave animation - scroll to top (header stays frozen)
const afterLeave = (el) => {
  // ... cleanup code ...

  // Scroll to top
  smoother.scrollTop(0)

  // NOTE: Header stays frozen in current state (NOT reset here)
  // It will smoothly animate to top state in resume()
}

// Resume when enter animation completes
// Smoothly animates header to top state
const enter = (el, done) => {
  const tl = gsap.timeline({
    onComplete: () => {
      done()
      // Resume headroom - smoothly animates to top state with CSS transitions
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
  height: var(--size-header); // Full height by default
  // Normal scroll transitions: 300ms (--duration-hover)
  transition: transform var(--duration-hover) var(--ease-power2),
              height var(--duration-hover) var(--ease-power2),
              background-color var(--duration-hover) var(--ease-power2),
              backdrop-filter var(--duration-hover) var(--ease-power2);

  // STATE 1: At top (default)
  // Full height, transparent

  // STATE 2: Not at top
  &.headroom--not-top {
    height: var(--size-header-compact); // Compact: 64-80px
    background-color: var(--theme-5); // 5% opacity
    backdrop-filter: blur(4px);
  }

  // STATE 3: Hidden
  &.headroom--unpinned {
    transform: translateY(-100%);
  }

  // Disable transitions during page transitions
  &.headroom--no-transition {
    transition: none !important;
  }

  // Slow transitions for post-transition animations
  // Applied by resume() for smooth 800ms reveal after page transitions
  &.headroom--smooth-transition {
    transition: transform var(--duration-slow) var(--ease-power2),
                height var(--duration-slow) var(--ease-power2),
                background-color var(--duration-slow) var(--ease-power2),
                backdrop-filter var(--duration-slow) var(--ease-power2);
  }
}
```

**Why transform:** GPU-accelerated, no layout reflow (unlike `top` property).

**Transition timing:**
- Normal scroll behavior: 300ms (`--duration-hover`) - responsive and snappy
- Page transition animation: 800ms (`--duration-slow`) - smooth and dramatic

## Parallax Effects

### System (Tested & Working)

**File:** `app/assets/css/base/base.scss`

```scss
.parallax-container {
  overflow: hidden;
  position: relative;
  height: 100%;  // Fills parent
}

.parallax-media {
  width: 100%;
  height: 120%;  // 20% larger for movement
  object-fit: cover;
  display: block;
}
```

### Usage Pattern

**Three-layer structure:**
1. Wrapper controls height (vh, %, Tailwind, etc.)
2. Container fills wrapper (100%)
3. Media is 120% of container for parallax movement

```vue
<!-- Image parallax -->
<div class="h-[60vh]">
  <div class="parallax-container">
    <img src="..." data-speed="auto" class="parallax-media" />
  </div>
</div>

<!-- Video parallax -->
<div class="h-[60vh]">
  <div class="parallax-container">
    <video src="..." data-speed="auto" class="parallax-media" autoplay loop muted />
  </div>
</div>
```

### Data Attributes

**data-speed="auto"** - GSAP calculates parallax automatically
**data-lag** - Smooth trailing effect (0.1-0.3 range)

### Combined with Page Transitions

```vue
<h1 v-page-split:chars data-speed="0.7">
  Text with parallax + animation
</h1>
```

### Refresh After Route Change

```javascript
refreshSmoother()  // Recalculates parallax for new content
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Header snaps when clicking link | pause() changes header state | pause() should only set isPaused = true (freeze in place) |
| Header doesn't animate after transition | resume() doesn't change classes | resume() must add headroom--top and remove others (with transitions enabled) |
| Scroll jump visible to user | Auto-scroll before animations | Scroll in `afterLeave()` when content hidden |
| Headroom not hiding | onUpdate not called | Verify callback in createSmoother() |
| Fixed elements broken | Inside smooth-content | Move outside (see DOM structure) |
| Headroom resumes too early | Using page:finish hook | Resume in enter() `onComplete` instead |
| 14fps on Safari | smooth value too high | Use `smooth: 1` (see setup) |
| ScrollTrigger pinning at wrong position | Content height changed after initialization | Call ScrollTrigger.refresh() after animations (see Component Patterns) |

## Performance

**Optimizations:**
- Single scroll listener (ScrollSmoother's internal)
- Throttled updates (100ms between header changes using VueUse `useThrottleFn`)
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
