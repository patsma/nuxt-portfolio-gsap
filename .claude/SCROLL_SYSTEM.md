# Scroll System Documentation

## Overview

This project uses GSAP ScrollSmoother for smooth scrolling with an integrated headroom-style header that hides on scroll down and shows on scroll up. The system coordinates multiple plugins and components to create a polished, performant scroll experience.

## Architecture

### Key Principle: Header Outside ScrollSmoother Content

**Critical Rule:** Fixed-position elements MUST be placed outside `#smooth-content` to work properly.

```
<div id="smooth-wrapper">
  <!-- ✅ Fixed header goes HERE (outside smooth-content) -->
  <header>
    <HeaderGrid />
  </header>

  <div id="smooth-content">
    <!-- ❌ Fixed elements DON'T work here -->
    <main>...</main>
  </div>
</div>
```

**Why?**
- ScrollSmoother applies `transform` to `#smooth-content` for smooth scrolling
- CSS transforms create a new containing block, breaking `position: fixed`
- Elements with `position: fixed` inside a transformed parent become positioned relative to that parent, not the viewport
- Moving fixed elements outside the transformed container restores normal fixed positioning

**Per GSAP Documentation:**
> HTML Structure for ScrollSmoother Content: `<!-- position: fixed elements can go outside -->`

### Plugin Integration Pattern

The scroll system uses a **producer-consumer** pattern:

```
ScrollSmoother (Producer)
    ↓ onUpdate callback
    ↓ provides: scrollTop()
    ↓
Headroom (Consumer)
    ↓ receives scroll position
    ↓ calculates: direction, threshold
    ↓ updates: CSS classes
```

**Benefits:**
- ✅ Single scroll listener (ScrollSmoother's internal system)
- ✅ No duplicate scroll event handlers
- ✅ Headroom synced with smooth scroll position (not native scroll)
- ✅ Throttled updates for performance
- ✅ Clean separation of concerns

## Core Components

### 1. ScrollSmoother Plugin (`app/plugins/scrollsmoother.client.js`)

Main smooth scrolling implementation with headroom integration.

**Key Configuration:**
```javascript
instance = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 0.8,              // Smoothing duration (seconds to catch up)
  effects: true,             // Enable data-speed/data-lag parallax
  smoothTouch: 0.2,          // Shorter smoothing on touch devices
  normalizeScroll: true,     // Prevent address bar show/hide on mobile
  ignoreMobileResize: true,  // Ignore mobile resize events

  // Headroom integration via onUpdate callback
  onUpdate: (self) => {
    if (nuxtApp.$headroom?.updateHeader) {
      const currentScroll = self.scrollTop();
      nuxtApp.$headroom.updateHeader(currentScroll);
    }
  },
});
```

**Lifecycle Hooks:**
- `page:start` → Kill smoother, set route-changing class
- `page:finish` → Reinitialize smoother after 100ms delay
- `app:mounted` → Initial setup
- `app:beforeUnmount` → Cleanup

**Important Methods:**
- `init()` - Creates ScrollSmoother instance with config
- `kill()` - Destroys instance and removes transform
- `refresh()` - Recalculates scroll measurements
- `setScrollerDefaultsEarly()` - Sets up scrollerProxy for ScrollTrigger

### 2. Headroom Plugin (`app/plugins/headroom.client.js`)

Throttled header visibility logic called by ScrollSmoother's onUpdate.

**Configuration Constants:**
```javascript
const SCROLL_THRESHOLD = 100;  // px before hiding header
const THROTTLE_DELAY = 100;    // ms between updates
```

**State Tracking:**
```javascript
let lastScrollTop = 0;      // Previous scroll position
let lastUpdateTime = 0;     // Timestamp of last update
let headerElement = null;   // Cached header DOM reference
```

**Core Logic (`updateHeader` function):**
```javascript
updateHeader(currentScroll) {
  // 1. Throttle: Skip if less than 100ms since last update
  const now = Date.now();
  if (now - lastUpdateTime < THROTTLE_DELAY) return;
  lastUpdateTime = now;

  // 2. Direction: Compare current vs previous scroll position
  const scrollDirection = currentScroll > lastScrollTop ? 1 : -1;
  // 1 = scrolling down, -1 = scrolling up

  // 3. Threshold Logic:
  if (currentScroll <= 0) {
    // At top: always show
    addClass('headroom--pinned');
  } else if (currentScroll > SCROLL_THRESHOLD) {
    // Past threshold: apply headroom behavior
    if (scrollDirection === 1) {
      removeClass('headroom--pinned');
      addClass('headroom--unpinned'); // Hide on scroll down
    } else {
      addClass('headroom--pinned');    // Show on scroll up
      removeClass('headroom--unpinned');
    }
  } else {
    // Below threshold: always show
    addClass('headroom--pinned');
  }

  lastScrollTop = currentScroll;
}
```

**Exposed API:**
```javascript
nuxtApp.provide('headroom', {
  updateHeader,  // Called by ScrollSmoother.onUpdate
  reset,         // Reset state (show header, clear tracking)
});
```

### 3. Header Component (`app/components/HeaderGrid.vue`)

Fixed header with headroom CSS classes.

**Template Structure:**
```vue
<header ref="containerRef" class="header-grid headroom--pinned">
  <!-- Initial state: pinned (visible) -->
  <div class="content-grid">
    <div class="header-grid__inner">
      <!-- Hamburger, logo, nav, theme toggle -->
    </div>
  </div>
</header>
```

**Key Points:**
- Starts with `headroom--pinned` class (visible by default)
- JavaScript adds/removes classes based on scroll
- Fixed positioning handled by CSS
- No inline `position: fixed` needed (comes from SCSS)

### 4. Header Styles (`app/assets/css/components/header-grid.scss`)

CSS architecture for fixed header with show/hide animations.

**Fixed Positioning:**
```scss
.header-grid {
  /* Fixed positioning - works outside #smooth-content */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--size-header);

  /* High z-index to stay above content */
  z-index: 50;
  isolation: isolate;

  /* Smooth transform animation for show/hide */
  will-change: transform;
  transition: transform var(--duration-hover) var(--ease-power2);
}
```

**Headroom State Classes:**
```scss
/* Visible state - header in normal position */
.header-grid.headroom--pinned {
  transform: translateY(0%);
}

/* Hidden state - header moved up offscreen */
.header-grid.headroom--unpinned {
  transform: translateY(-100%);
}
```

**Why Transform Instead of Top:**
- ✅ GPU-accelerated animation (better performance)
- ✅ No layout reflows (transform doesn't affect layout)
- ✅ Smooth 60fps animation
- ✅ Works with will-change optimization

### 5. Layout Structure (`app/layouts/default.vue`)

Proper HTML structure for ScrollSmoother with fixed header outside.

**Correct Structure:**
```vue
<div id="smooth-wrapper">
  <!-- Header OUTSIDE smooth-content -->
  <header role="banner">
    <HeaderGrid />
  </header>

  <div id="smooth-content" :key="route.fullPath">
    <main id="main-content" class="header-safe-top">
      <slot />
    </main>
  </div>
</div>
```

**Key Features:**
- `:key="route.fullPath"` on smooth-content forces re-render on navigation
- `header-safe-top` class adds top padding to account for fixed header
- Header positioned between wrapper and content (critical for fixed positioning)

## Implementation Details

### ScrollSmoother Configuration Explained

**`smooth: 0.8`**
- Duration (in seconds) for smooth scroll to "catch up" to native scroll position
- Higher = more smoothing (floaty feeling)
- Lower = more responsive (closer to native)
- 0.8s provides good balance for desktop
- Mobile uses `smoothTouch: 0.2` for more responsive feel

**`effects: true`**
- Enables automatic parallax via `data-speed` and `data-lag` attributes
- Elements with `data-speed="0.5"` scroll at half speed
- Elements with `data-lag="0.8"` create trailing effect
- Parallax calculations happen automatically

**`normalizeScroll: true`**
- Forces scrolling to occur on JavaScript thread
- Prevents mobile address bar show/hide jank
- Ensures consistent scroll behavior across browsers
- Critical for smooth experience on iOS Safari

**`ignoreMobileResize: true`**
- Ignores resize events on mobile devices
- Prevents unnecessary recalculations when address bar hides
- Improves mobile scroll performance

### Headroom Behavior Logic

**Three Zones of Scroll Behavior:**

1. **Top Zone (scrollY ≤ 0px)**
   - Header: Always visible (pinned)
   - Reason: User expects to see navigation at page top

2. **Threshold Zone (0 < scrollY ≤ 100px)**
   - Header: Always visible (pinned)
   - Reason: Don't hide header for tiny scrolls (prevents flickering)

3. **Content Zone (scrollY > 100px)**
   - Scroll Down → Hide header (unpinned)
   - Scroll Up → Show header (pinned)
   - Reason: Maximize content space, but make nav accessible on upward scroll

**Direction Detection:**
```javascript
// Simple comparison of positions
const scrollDirection = currentScroll > lastScrollTop ? 1 : -1;
```

**Throttling Strategy:**
```javascript
// Skip updates if less than 100ms since last update
const now = Date.now();
if (now - lastUpdateTime < THROTTLE_DELAY) return;
```

**Why Throttle?**
- ScrollSmoother's onUpdate fires on every scroll tick (60fps = ~16ms)
- We don't need to update classes that frequently
- 100ms throttle = ~10 updates per second (more than enough)
- Reduces DOM manipulation overhead
- Prevents class thrashing

### Page Transition Coordination

**Problem:** ScrollSmoother and headroom must reinitialize after page navigation.

**Solution:** Coordinated lifecycle hooks with timing delays.

**Flow:**

```
User clicks link
    ↓
page:start hook fires
    ↓
scrollsmoother.client.js: kill()
headroom.client.js: reset()
    ↓ (route changes, new page loads)
    ↓
page:finish hook fires
    ↓
scrollsmoother.client.js: setTimeout(100ms) → init()
    ↓ (smoother needs time to measure content)
    ↓
headroom.client.js: automatically works via onUpdate
```

**Critical Timing:**
- ScrollSmoother needs 100ms delay after page:finish to measure new content height
- Headroom integrates automatically via onUpdate callback (no separate init needed)
- Both plugins must reset state on page:start to prevent stale references

**State Management During Transitions:**
```javascript
// Track if currently in transition
let isProcessingTransition = false;

nuxtApp.hook('page:start', () => {
  isProcessingTransition = true;
  kill(); // Clean up old instance
});

nuxtApp.hook('page:finish', () => {
  if (!isProcessingTransition) return; // Prevent double execution
  setTimeout(() => {
    init(); // Create new instance
    isProcessingTransition = false;
  }, 100);
});
```

### Height Calculation & Layout Considerations

**Challenge:** Fixed header doesn't contribute to document height.

**Solution:** Add top padding/margin to content equal to header height.

**CSS Variable System:**
```scss
// In theme.scss
--size-header: 80px;  // Single source of truth
```

**Usage:**
```scss
// Fixed header height
.header-grid {
  height: var(--size-header);
}

// Content top padding (header-safe-top utility class)
.header-safe-top {
  padding-top: var(--size-header);
}
```

**Mobile Overlay Positioning:**
```vue
<!-- In HeaderGrid.vue -->
<div class="fixed inset-x-0 top-[var(--size-header)]">
  <!-- Mobile menu positioned below header -->
</div>
```

**Benefits:**
- ✅ Change header height in one place
- ✅ All spacing automatically adjusts
- ✅ No hardcoded pixel values scattered in codebase

## CSS Architecture

### Transform-Based Animation

**Why Transform > Top Animation:**

```scss
/* ❌ WRONG: Animate top property */
.header-wrong {
  position: fixed;
  top: 0;
  transition: top 300ms;
}
.header-wrong.hidden {
  top: -80px; /* Forces layout recalculation */
}

/* ✅ CORRECT: Animate transform */
.header-grid {
  position: fixed;
  top: 0;
  transition: transform 300ms;
}
.header-grid.headroom--unpinned {
  transform: translateY(-100%); /* No layout recalculation */
}
```

**Performance Benefits:**
- Transform is GPU-accelerated (composited layer)
- Doesn't trigger layout reflows
- Maintains 60fps animation
- Lower CPU usage

### Will-Change Optimization

```scss
.header-grid {
  will-change: transform;
}
```

**What It Does:**
- Tells browser to create a composite layer in advance
- Reduces paint time when animation starts
- Should be used sparingly (only on elements that animate)

**When to Use:**
- Elements that animate frequently (like header)
- Elements with transform animations
- Before user interaction (hover, scroll)

**When NOT to Use:**
- Static elements
- Too many elements (memory overhead)
- Elements that animate once and stop

### CSS Variable Integration

**Duration from Design Tokens:**
```scss
transition: transform var(--duration-hover) var(--ease-power2);
```

**Benefits:**
- ✅ Consistent timing across all animations
- ✅ Change timing globally in theme.scss
- ✅ Synced with GSAP animations (read from same variable)

## Troubleshooting

### Header Doesn't Hide on Scroll

**Symptoms:**
- Scrolling down doesn't hide header
- Classes aren't changing

**Diagnosis:**
1. Check browser console for errors
2. Verify ScrollSmoother initialized: `console.log($smoother.get())`
3. Check headroom provided: `console.log($headroom)`
4. Verify onUpdate callback is firing: Add `console.log` in scrollsmoother.client.js

**Common Causes:**
- ❌ Headroom plugin loaded after ScrollSmoother
- ❌ Header element missing `.header-grid` class
- ❌ ScrollSmoother failed to initialize (missing wrapper/content divs)

**Solution:**
- Ensure both plugins are in `app/plugins/` directory
- Nuxt loads plugins alphabetically (headroom.client.js loads before scrollsmoother.client.js ✅)
- Check that `nuxtApp.provide('headroom')` happens before ScrollSmoother.create()

### Header Position Fixed Not Working

**Symptoms:**
- Header scrolls with content
- Header jumps around during scroll

**Diagnosis:**
- Check header's parent elements in DevTools
- Look for any parent with `transform`, `perspective`, or `filter` CSS properties

**Cause:**
- Header is inside `#smooth-content` (transformed container)
- CSS transforms create new containing block for fixed elements

**Solution:**
- Move header OUTSIDE `#smooth-content` in layout
- Structure should be: `wrapper > header + smooth-content`

### Page Transition Height Issues

**Symptoms:**
- Scroll jumps after navigation
- Content too short/tall after transition
- ScrollTriggers in wrong positions

**Diagnosis:**
```javascript
// Add logging in scrollsmoother.client.js init()
console.log('Content height:', content.offsetHeight);
console.log('Wrapper height:', wrapper.offsetHeight);
```

**Cause:**
- ScrollSmoother measures content before DOM fully settled
- Fonts loading changes layout
- Images without height attributes

**Solution:**
```javascript
// In scrollsmoother.client.js
setTimeout(() => {
  init();
  // Additional refresh after fonts load
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }
}, 100); // Delay allows DOM to settle
```

### Header Flickers During Scroll

**Symptoms:**
- Header rapidly switches between visible/hidden
- Classes toggling too quickly

**Diagnosis:**
- Check THROTTLE_DELAY value in headroom.client.js
- Verify scroll direction calculation

**Cause:**
- Throttle delay too low
- ScrollSmoother's smooth animation creates micro-direction changes

**Solution:**
```javascript
// Increase throttle delay
const THROTTLE_DELAY = 150; // Was 100ms

// Add deadzone for direction changes
const DIRECTION_DEADZONE = 5; // px
const scrollDirection = Math.abs(currentScroll - lastScrollTop) < DIRECTION_DEADZONE
  ? 0 // No change
  : (currentScroll > lastScrollTop ? 1 : -1);
```

### Mobile Performance Issues

**Symptoms:**
- Janky scroll on mobile
- Address bar causes layout shifts
- Touch scroll feels unresponsive

**Diagnosis:**
- Test on actual device (not just browser DevTools)
- Check scrollTouch config value
- Monitor frame rate in DevTools Performance tab

**Solution:**
```javascript
// In scrollsmoother.client.js
ScrollSmoother.create({
  smooth: 0.8,           // Desktop smoothing
  smoothTouch: 0.1,      // Much less smoothing on touch (was 0.2)
  normalizeScroll: true, // Critical for mobile
  ignoreMobileResize: true, // Prevent address bar issues
});
```

### Smooth Scroll Conflicts with ScrollTrigger Animations

**Symptoms:**
- ScrollTrigger animations start at wrong positions
- Pin spacing incorrect
- Horizontal scroll broken

**Diagnosis:**
- Check if ScrollTrigger uses correct scroller reference
- Verify scrollerProxy is set up

**Cause:**
- ScrollTrigger defaults to window scroll
- Must configure to use ScrollSmoother's content element

**Solution:**
```javascript
// In scrollsmoother.client.js setScrollerDefaultsEarly()
const content = document.getElementById("smooth-content");
ScrollTrigger.scrollerProxy(content, {
  scrollTop(value) {
    const inst = ScrollSmoother.get();
    if (!inst) return window.scrollY || 0;
    if (arguments.length) inst.scrollTop(value);
    return inst.scrollTop();
  },
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },
  pinType: "transform", // Use transform for pinning
});
ScrollTrigger.defaults({ scroller: content });
```

## Performance Considerations

### Throttling Strategy

**Current Implementation:**
- Throttle delay: 100ms
- Updates per second: ~10
- Class changes per scroll: 1-2

**Optimization:**
```javascript
// Throttle with debounce for settling
let throttleTimer;
let debounceTimer;

const updateHeader = (currentScroll) => {
  // Throttle: Limit update frequency
  const now = Date.now();
  if (now - lastUpdateTime < THROTTLE_DELAY) return;
  lastUpdateTime = now;

  // Update classes immediately
  updateClasses(currentScroll);

  // Debounce: Final update when scroll stops
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateClasses(currentScroll); // Ensure final state is correct
  }, 150);
};
```

### DOM Manipulation Optimization

**Avoid Repeated Class Checks:**
```javascript
// ❌ BAD: Checks and sets classes every time
headerElement.classList.add('headroom--pinned');
headerElement.classList.remove('headroom--unpinned');

// ✅ GOOD: Only update if state changed
let currentState = 'pinned'; // Track current state

const setState = (newState) => {
  if (currentState === newState) return; // Skip if no change

  if (newState === 'pinned') {
    headerElement.classList.add('headroom--pinned');
    headerElement.classList.remove('headroom--unpinned');
  } else {
    headerElement.classList.remove('headroom--pinned');
    headerElement.classList.add('headroom--unpinned');
  }

  currentState = newState;
};
```

### Memory Management

**Cache DOM References:**
```javascript
// Cache header reference (don't query every update)
let headerElement = null;

const updateHeader = (currentScroll) => {
  if (!headerElement) {
    headerElement = document.querySelector('.header-grid');
    if (!headerElement) return;
  }
  // Use cached reference
};
```

**Cleanup on Unmount:**
```javascript
// In headroom.client.js
nuxtApp.hook('app:beforeUnmount', () => {
  headerElement = null;
  lastScrollTop = 0;
  lastUpdateTime = 0;
});
```

## Advanced Patterns

### Multiple Scroll-Based Animations

**Pattern:** Use ScrollTrigger with ScrollSmoother scroller.

```javascript
// Create ScrollTrigger that works with ScrollSmoother
ScrollTrigger.create({
  trigger: '.section',
  start: 'top center',
  end: 'bottom center',
  scroller: '#smooth-content', // Use ScrollSmoother's content
  onEnter: () => console.log('Section entered'),
  onLeave: () => console.log('Section left'),
});
```

### Parallax Effects with data-speed

**HTML:**
```html
<div data-speed="0.5">
  <!-- Scrolls at half speed (parallax) -->
</div>

<div data-speed="1.5">
  <!-- Scrolls at 1.5x speed (faster than page) -->
</div>

<div data-speed="auto">
  <!-- Auto-calculated based on container -->
</div>
```

**Requirements:**
- `effects: true` in ScrollSmoother.create()
- Elements inside `#smooth-content`
- Works automatically (no JavaScript needed)

### Lag Effects with data-lag

**HTML:**
```html
<div data-lag="0.8">
  <!-- Takes 0.8 seconds to "catch up" to scroll position -->
</div>
```

**Use Cases:**
- Trailing effect on background elements
- Staggered scroll animations
- Creating depth perception

### Custom Scroll-Based Triggers

**Pattern:** Access scroll position in onUpdate.

```javascript
// In scrollsmoother.client.js
ScrollSmoother.create({
  onUpdate: (self) => {
    const scroll = self.scrollTop();
    const velocity = self.getVelocity();

    // Headroom integration
    nuxtApp.$headroom?.updateHeader(scroll);

    // Custom logic
    if (velocity > 1000) {
      console.log('Fast scroll detected!');
    }
  },
});
```

## Files Reference

### Core Files

**Plugins:**
- `app/plugins/scrollsmoother.client.js` - Main ScrollSmoother initialization and lifecycle
- `app/plugins/headroom.client.js` - Header visibility logic (throttled, direction-based)

**Components:**
- `app/components/HeaderGrid.vue` - Fixed header with headroom classes
- `app/components/SVG/HamburgerSVG.vue` - Mobile menu icon (animated)
- `app/components/ThemeToggleSVG.vue` - Theme toggle button

**Layouts:**
- `app/layouts/default.vue` - Main layout with scroll structure

**Styles:**
- `app/assets/css/components/header-grid.scss` - Header styles and headroom states
- `app/assets/css/tokens/theme.scss` - Design tokens (--size-header, --duration-hover)

### Configuration Variables

**In `theme.scss`:**
```scss
--size-header: 80px;           // Header height
--duration-hover: 300ms;        // Headroom animation duration
--ease-power2: cubic-bezier(0.455, 0.03, 0.515, 0.955); // Animation easing
```

**In `headroom.client.js`:**
```javascript
const SCROLL_THRESHOLD = 100;  // px before hiding header
const THROTTLE_DELAY = 100;    // ms between updates
```

**In `scrollsmoother.client.js`:**
```javascript
smooth: 0.8,              // Desktop smoothing
smoothTouch: 0.2,         // Mobile smoothing
normalizeScroll: true,    // Mobile address bar fix
ignoreMobileResize: true, // Mobile resize handling
```

## Testing

### Manual Testing Checklist

**Desktop:**
- [ ] Scroll down slowly → Header hides after 100px
- [ ] Scroll up → Header shows immediately
- [ ] Scroll to top → Header always visible
- [ ] Navigate between pages → Smooth scroll resets
- [ ] Fast scroll → No flickering
- [ ] Parallax elements (if any) move at correct speed

**Mobile:**
- [ ] Touch scroll feels responsive (not too floaty)
- [ ] Address bar show/hide doesn't cause jumps
- [ ] Header hides on scroll down (threshold works)
- [ ] Hamburger menu opens/closes smoothly
- [ ] Mobile overlay positioned correctly below header

**Performance:**
- [ ] Smooth 60fps scroll (check DevTools Performance)
- [ ] No layout thrashing (no red bars in paint profiler)
- [ ] Header animation smooth (no jank)
- [ ] Page transitions don't cause scroll jumps

### Debug Logging

**Enable verbose logging:**
```javascript
// In scrollsmoother.client.js
onUpdate: (self) => {
  console.log('[Smoother]', {
    scrollTop: self.scrollTop(),
    velocity: self.getVelocity(),
    progress: self.progress(),
  });
  nuxtApp.$headroom?.updateHeader(self.scrollTop());
},
```

```javascript
// In headroom.client.js
updateHeader(currentScroll) {
  console.log('[Headroom]', {
    scroll: currentScroll,
    direction: scrollDirection,
    threshold: SCROLL_THRESHOLD,
    lastUpdate: now - lastUpdateTime,
  });
  // ... rest of logic
}
```

## Benefits of This System

✅ **Performance**
- Single scroll listener (ScrollSmoother's internal system)
- Throttled updates (100ms) reduce DOM manipulation
- GPU-accelerated animations (transform-based)
- No layout reflows during header hide/show

✅ **Maintainability**
- Clear separation of concerns (scroll vs visibility logic)
- Centralized configuration (design tokens)
- Well-documented architecture
- Easy to debug (producer-consumer pattern)

✅ **User Experience**
- Smooth scroll on all devices
- Smart header hiding (threshold + direction)
- Mobile-optimized (address bar handling)
- No FOUC or scroll jumps during navigation

✅ **Developer Experience**
- Simple integration pattern (`onUpdate` callback)
- Extensible (easy to add more scroll-based features)
- Type-safe with JSDoc comments
- Follows GSAP best practices

## Future Enhancements

Potential additions:
- [ ] Variable header size (shrink on scroll down)
- [ ] Different threshold for mobile/desktop
- [ ] Scroll-to-top button (appears after threshold)
- [ ] Progress bar (scroll percentage indicator)
- [ ] Disable smooth scroll on specific pages
- [ ] Custom easing curves per page
- [ ] Scroll-based background color changes
- [ ] Integration with lenis for alternative smooth scroll library
