# Page Transition System Documentation

## Overview

This document outlines the progressive enhancement strategy for page transitions in the Nuxt application, starting with simple, visible CSS transitions and evolving toward immersive GSAP SVG shape-morphing transitions.

**Current State**: Phase 1 - Simple CSS transitions with opacity, blur, scale, and transform
**Target State**: Phase 5 - AAA-quality GSAP SVG morphing transitions with organic shapes

## Evolution Roadmap

```
Phase 1: Visible CSS Transitions (CURRENT)
    ↓
Phase 2: JavaScript Lifecycle Hooks
    ↓
Phase 3: GSAP Timeline Integration
    ↓
Phase 4: Advanced GSAP (Stagger, SplitText)
    ↓
Phase 5: SVG Shape Morphing (AAA Quality)
```

## Architecture Principles

### Critical Constraint: ScrollSmoother Transform Conflict

**THE MOST IMPORTANT THING TO UNDERSTAND:**

We **CANNOT** animate `<NuxtPage />` directly like a normal Nuxt app because of how ScrollSmoother works.

**Why?**
- `<NuxtPage />` content renders inside `#smooth-content`
- ScrollSmoother applies `transform` to `#smooth-content` for smooth scrolling
- CSS transforms create a new containing block that breaks standard page transitions
- Animating child elements inside a transformed container causes conflicts

**Solution:**
- Animate `#smooth-content` directly, not `<NuxtPage />`
- Use the `route-changing` class (already implemented in scrollsmoother.client.js)
- This class is added to `<html>` during transitions
- CSS transitions on `#smooth-content` trigger when class is present/removed

**Architecture Pattern:**

```
<html class="route-changing">  ← Class added here
  <div id="smooth-wrapper">
    <header>Fixed header</header>
    <div id="smooth-content">  ← Animate this container
      <main>
        <NuxtPage />  ← Don't animate this
      </main>
    </div>
  </div>
</html>
```

**CSS Pattern:**

```css
/* Enable transitions on the container */
#smooth-content {
  transition: opacity 800ms ease;
  opacity: 1;
}

/* Fade out when route-changing class present */
html.route-changing #smooth-content {
  opacity: 0;
}
```

### Key Integration Points

**Critical Rule:** Page transitions must coordinate with ScrollSmoother lifecycle

```
Navigation Start
    ↓
page:start hook → Kill ScrollSmoother
    ↓
Leave Transition (old page fades out)
    ↓
DOM swap (new page mounts)
    ↓
Enter Transition (new page fades in)
    ↓
page:finish hook → Reinit ScrollSmoother
    ↓
Navigation Complete
```

**Why This Matters:**
- ScrollSmoother applies transforms to `#smooth-content`
- Transitions must complete before ScrollSmoother reinitializes
- Timing delays prevent janky height calculations
- Headroom must reset between transitions

### Transition Coordination Pattern

**Problem:** ScrollSmoother and page transitions both manipulate DOM
**Solution:** Strict lifecycle sequencing with appropriate delays

```javascript
// In scrollsmoother.client.js
nuxtApp.hook('page:start', () => {
  kill(); // Remove ScrollSmoother before transition
});

nuxtApp.hook('page:finish', () => {
  setTimeout(() => {
    init(); // Reinit after transition completes
  }, 100); // Delay allows transition to start
});
```

## Phase 1: Gentle CSS Fade Transitions (CURRENT)

### Goal
Create gentle, visible fade transitions that work correctly with ScrollSmoother.

### Implementation

**File: `app.vue`**

```vue
<template>
  <FluidGradient />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <CursorTrail />
</template>

<script setup>
/**
 * Phase 1: Simple CSS-based page transitions
 * - Animates #smooth-content (not NuxtPage) to avoid ScrollSmoother conflicts
 * - Uses route-changing class for coordination
 * - Gentle opacity fade only (800ms)
 */

if (import.meta.client) {
  console.log('[PageTransition] System initialized - Phase 1 (smooth-content fade)');
}
</script>

<style>
/**
 * Phase 1: Gentle Page Transitions via #smooth-content
 *
 * CRITICAL: We animate the container, not <NuxtPage />, due to ScrollSmoother transforms
 */

#smooth-content {
  /* Enable smooth opacity transitions */
  transition: opacity 800ms var(--ease-power2);
  opacity: 1;
}

/**
 * Route changing state - fades out content during transition
 * Applied to HTML element by scrollsmoother.client.js
 */
html.route-changing #smooth-content {
  opacity: 0;
}
</style>
```

**File: `nuxt.config.ts`**

```typescript
app: {
  // Phase 1: Simple CSS transitions (name: 'page')
  // mode: 'out-in' ensures old page leaves before new page enters
  // This will evolve to GSAP-powered transitions in Phase 3
  pageTransition: { name: 'page', mode: 'out-in' },
  layoutTransition: false, // No layout transitions needed
}
```

### Configuration Variables

**Timing:**
- Duration: 800ms (visible but not too slow)
- Easing: `var(--ease-power2)` from design tokens
- Target: `#smooth-content` (not `<NuxtPage />`)
- Trigger: `html.route-changing` class

**Effects:**
- Opacity: 0 ↔ 1 (simple fade in/out)
- **No** blur, scale, or transform (avoids ScrollSmoother conflicts)

### Why These Values?

**800ms Duration:**
- Normal web transitions: 300-600ms
- 800ms is clearly visible without feeling slow
- Enough time to see the fade
- Not so long that users get impatient
- Can be adjusted via CSS variable in future

**Opacity Only:**
- No blur/scale/transform to avoid conflicts with ScrollSmoother
- Simple, elegant, performant
- Works reliably with transformed containers
- GPU-accelerated opacity changes
- Cross-browser compatible

**Why Not More Effects?**
- Blur: Expensive, can cause jank
- Scale: Conflicts with ScrollSmoother transform
- TranslateY: Confusing when content container is moving
- Opacity fade is clean, professional, reliable

### Debugging Transitions

**Browser DevTools:**

Watch for these console logs during navigation:

```javascript
// Initialization
[PageTransition] System initialized - Phase 1 (smooth-content fade)

// On navigation click:
[ScrollSmoother] page:start - starting fade out
[ScrollSmoother] smoother killed
[Headroom] page:start - resetting state

// After DOM swap:
[ScrollSmoother] page:finish - preparing new content
[ScrollSmoother] init complete, refreshing ScrollTrigger
[ScrollSmoother] transition complete - fading in
[Headroom] Ready for ScrollSmoother integration
```

**Visual Debugging:**

Add this to browser console to see route-changing state:

```javascript
// Watch route-changing class
const observer = new MutationObserver(() => {
  console.log('route-changing:', document.documentElement.classList.contains('route-changing'));
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
```

**Common Issues:**

| Symptom | Cause | Solution |
|---------|-------|----------|
| No transition visible | CSS not applied to #smooth-content | Check `#smooth-content` has transition property |
| Transition too fast | Duration too short | Increase to 1000ms+ in app.vue |
| Content jumps | route-changing removed too early | Increase delay in scrollsmoother.client.js page:finish |
| Height jumps | ScrollSmoother init too early | Ensure setTimeout delay is adequate (150ms+) |
| Double fade | Transition running twice | Check isProcessingTransition flag |

## Phase 2: JavaScript Lifecycle Hooks

### Goal
Add Vue transition lifecycle hooks to prepare for GSAP integration.

### Implementation Strategy

**Why Add Hooks Before GSAP:**
- Transition hooks provide precise timing control
- Allows logging and debugging
- Enables conditional transitions based on route
- Foundation for GSAP timeline integration

**File: `app.vue` (Phase 2 Update)**

```vue
<template>
  <FluidGradient />

  <NuxtLayout>
    <NuxtPage
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    />
  </NuxtLayout>

  <CursorTrail />
</template>

<script setup>
/**
 * Transition Lifecycle Hooks
 * Phase 2: JavaScript hooks (still using CSS for animations)
 * Prepares structure for Phase 3 GSAP integration
 */

const onBeforeEnter = (el) => {
  console.log('[Transition] before-enter', el);
  // Future: Set initial GSAP states here
};

const onEnter = (el, done) => {
  console.log('[Transition] enter', el);
  // Future: GSAP enter timeline here
  // For now, CSS handles animation, so call done immediately
  // Wait for CSS transition to complete
  const duration = 1200; // matches CSS duration
  setTimeout(done, duration);
};

const onAfterEnter = (el) => {
  console.log('[Transition] after-enter', el);
  // Future: Cleanup GSAP animations
};

const onBeforeLeave = (el) => {
  console.log('[Transition] before-leave', el);
  // Future: Prepare leave animation
};

const onLeave = (el, done) => {
  console.log('[Transition] leave', el);
  // Future: GSAP leave timeline here
  const duration = 1200;
  setTimeout(done, duration);
};

const onAfterLeave = (el) => {
  console.log('[Transition] after-leave', el);
  // Future: Cleanup after leave
};
</script>

<style>
/* Same CSS as Phase 1 */
/* Will be replaced by GSAP in Phase 3 */
</style>
```

**Lifecycle Hook Flow:**

```
User clicks link
    ↓
onBeforeLeave (old page)
    ↓
onLeave (old page) → CSS animation starts
    ↓
onAfterLeave (old page)
    ↓
DOM swap
    ↓
onBeforeEnter (new page)
    ↓
onEnter (new page) → CSS animation starts
    ↓
onAfterEnter (new page)
```

**Benefits:**
- ✅ Full visibility into transition lifecycle
- ✅ Ability to run code before/during/after transitions
- ✅ Foundation for GSAP timelines
- ✅ Can modify transition based on route metadata

## Phase 3: GSAP Timeline Integration

### Goal
Replace CSS transitions with GSAP-powered animations for better control and timing.

### Why GSAP Over CSS?

**GSAP Advantages:**
- More precise timing control
- Chainable timeline sequences
- Better easing curves (CustomEase)
- Can animate properties CSS can't (drawSVG, morphSVG)
- Scrub/reverse/pause capabilities
- Better performance for complex animations

**Architecture Pattern:**

```
Composable: usePageTransition
    ↓
Provides: enterTimeline, leaveTimeline
    ↓
Used by: app.vue lifecycle hooks
    ↓
Coordinates with: ScrollSmoother hooks
```

### Implementation

**File: `app/composables/usePageTransition.js`**

```javascript
/**
 * Page Transition Composable
 * Phase 3: GSAP timeline-based transitions
 *
 * Provides reusable enter/leave animations using GSAP
 * Coordinates with ScrollSmoother lifecycle
 */

export const usePageTransition = () => {
  const { $gsap } = useNuxtApp();

  if (!$gsap) {
    console.warn('[usePageTransition] GSAP not available');
    return { enterTimeline: null, leaveTimeline: null };
  }

  /**
   * Create enter animation timeline
   * Animates new page coming into view
   *
   * @param {HTMLElement} el - Page element to animate
   * @param {Function} done - Callback to signal completion
   * @returns {GSAPTimeline}
   */
  const createEnterTimeline = (el, done) => {
    // Read duration from CSS variable
    const html = document.documentElement;
    const durationRaw = getComputedStyle(html)
      .getPropertyValue('--duration-page-transition')
      .trim();

    let duration = 1.0; // Default 1 second
    if (durationRaw.endsWith('ms')) {
      duration = parseFloat(durationRaw) / 1000;
    } else if (durationRaw.endsWith('s')) {
      duration = parseFloat(durationRaw);
    }

    const tl = $gsap.timeline({
      onComplete: done,
      defaults: { ease: 'power2.out' }
    });

    // Set initial state
    $gsap.set(el, {
      opacity: 0,
      y: 30,
      scale: 0.95,
      filter: 'blur(12px)',
    });

    // Animate to final state
    tl.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: duration,
    });

    return tl;
  };

  /**
   * Create leave animation timeline
   * Animates old page leaving view
   *
   * @param {HTMLElement} el - Page element to animate
   * @param {Function} done - Callback to signal completion
   * @returns {GSAPTimeline}
   */
  const createLeaveTimeline = (el, done) => {
    const html = document.documentElement;
    const durationRaw = getComputedStyle(html)
      .getPropertyValue('--duration-page-transition')
      .trim();

    let duration = 1.0;
    if (durationRaw.endsWith('ms')) {
      duration = parseFloat(durationRaw) / 1000;
    } else if (durationRaw.endsWith('s')) {
      duration = parseFloat(durationRaw);
    }

    const tl = $gsap.timeline({
      onComplete: done,
      defaults: { ease: 'power2.in' }
    });

    // Animate out
    tl.to(el, {
      opacity: 0,
      y: -30,
      scale: 0.95,
      filter: 'blur(12px)',
      duration: duration,
    });

    return tl;
  };

  return {
    createEnterTimeline,
    createLeaveTimeline,
  };
};
```

**File: `app.vue` (Phase 3 Update)**

```vue
<template>
  <FluidGradient />

  <NuxtLayout>
    <NuxtPage
      @enter="onEnter"
      @leave="onLeave"
    />
  </NuxtLayout>

  <CursorTrail />
</template>

<script setup>
/**
 * Phase 3: GSAP-powered page transitions
 * Uses usePageTransition composable for timeline management
 */

const { createEnterTimeline, createLeaveTimeline } = usePageTransition();

// Track active timelines for cleanup
let currentEnterTl = null;
let currentLeaveTl = null;

const onEnter = (el, done) => {
  console.log('[PageTransition] GSAP enter start');

  // Kill any existing timeline
  if (currentEnterTl) currentEnterTl.kill();

  // Create and play enter timeline
  currentEnterTl = createEnterTimeline(el, () => {
    console.log('[PageTransition] GSAP enter complete');
    done();
  });
};

const onLeave = (el, done) => {
  console.log('[PageTransition] GSAP leave start');

  // Kill any existing timeline
  if (currentLeaveTl) currentLeaveTl.kill();

  // Create and play leave timeline
  currentLeaveTl = createLeaveTimeline(el, () => {
    console.log('[PageTransition] GSAP leave complete');
    done();
  });
};

// Cleanup on unmount
onUnmounted(() => {
  if (currentEnterTl) currentEnterTl.kill();
  if (currentLeaveTl) currentLeaveTl.kill();
});
</script>

<style>
/**
 * Phase 3: Minimal CSS
 * GSAP handles all animations via JavaScript
 * Only keep structural styles here
 */

/* Remove all transition CSS - GSAP handles it now */
</style>
```

**File: `app/assets/css/tokens/theme.scss` (Add Variable)**

```scss
// Page transition timing
--duration-page-transition: 1000ms; // Single source of truth
```

**File: `nuxt.config.ts` (Phase 3 Update)**

```typescript
app: {
  // Phase 3: GSAP-powered transitions
  // CSS classes still use 'page' name, but animations via JavaScript hooks
  pageTransition: { name: 'page', mode: 'out-in' },
  layoutTransition: false,
}
```

### Benefits of Phase 3

✅ **Centralized Control**
- Single composable manages all transition logic
- Duration from CSS variable (design tokens)
- Easy to swap animations per route

✅ **Better Timing**
- GSAP's timeline system more precise than CSS
- Can chain multiple animations
- Can scrub, pause, reverse

✅ **Performance**
- GSAP optimizes animations automatically
- Uses RAF (requestAnimationFrame) internally
- Better than CSS for complex sequences

## Phase 4: Advanced GSAP Effects

### Goal
Add sophisticated animations: stagger, SplitText, custom easing, per-route variations.

### New Capabilities

**1. Staggered Element Entry**

Animate page elements in sequence rather than all at once.

```javascript
const createEnterTimeline = (el, done) => {
  const tl = $gsap.timeline({ onComplete: done });

  // Set initial state for page
  $gsap.set(el, { opacity: 1 }); // Page visible

  // Find child elements to stagger
  const headings = el.querySelectorAll('h1, h2, h3');
  const paragraphs = el.querySelectorAll('p');
  const images = el.querySelectorAll('img');

  // Stagger headings
  tl.from(headings, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
  }, 0);

  // Stagger paragraphs (slightly delayed)
  tl.from(paragraphs, {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out'
  }, 0.2);

  // Fade in images
  tl.from(images, {
    scale: 0.8,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'back.out(1.2)'
  }, 0.3);

  return tl;
};
```

**2. SplitText for Typography**

Animate text character-by-character or word-by-word.

```javascript
const { $gsap, $SplitText } = useNuxtApp();

const createEnterTimeline = (el, done) => {
  const tl = $gsap.timeline({ onComplete: done });

  const heading = el.querySelector('h1');
  if (heading && $SplitText) {
    const split = new $SplitText(heading, { type: 'chars, words' });

    tl.from(split.chars, {
      opacity: 0,
      y: 20,
      rotationX: -90,
      stagger: 0.02,
      duration: 0.8,
      ease: 'back.out(1.7)'
    });
  }

  return tl;
};
```

**3. Custom Easing Curves**

Use CustomEase for organic, branded motion.

```javascript
// Define custom ease in plugin or composable
const customEaseOut = CustomEase.create(
  "custom",
  "M0,0 C0.126,0.382 0.282,0.674 0.44,0.822 0.632,1.002 0.818,1.001 1,1"
);

tl.to(el, {
  opacity: 1,
  y: 0,
  duration: 1.2,
  ease: customEaseOut
});
```

**4. Route-Specific Transitions**

Different animations based on route metadata.

```javascript
// In page component
definePageMeta({
  transitionType: 'slide-left'
});

// In usePageTransition composable
const createEnterTimeline = (el, done, route) => {
  const transitionType = route.meta.transitionType || 'default';

  const tl = $gsap.timeline({ onComplete: done });

  switch (transitionType) {
    case 'slide-left':
      tl.from(el, { x: '100%', duration: 0.8 });
      break;
    case 'slide-right':
      tl.from(el, { x: '-100%', duration: 0.8 });
      break;
    case 'zoom':
      tl.from(el, { scale: 0, duration: 0.8 });
      break;
    default:
      tl.from(el, { opacity: 0, y: 30, duration: 0.8 });
  }

  return tl;
};
```

### Enhanced Composable (Phase 4)

**File: `app/composables/usePageTransition.js` (Phase 4 Update)**

```javascript
export const usePageTransition = () => {
  const { $gsap, $SplitText } = useNuxtApp();
  const route = useRoute();

  const createEnterTimeline = (el, done) => {
    const tl = $gsap.timeline({
      onComplete: done,
      defaults: { ease: 'power2.out' }
    });

    // Get transition type from route meta
    const transitionType = route.meta.transitionType || 'default';

    // Apply route-specific transition
    switch (transitionType) {
      case 'stagger':
        animateStagger(el, tl);
        break;
      case 'split-text':
        animateSplitText(el, tl);
        break;
      default:
        animateDefault(el, tl);
    }

    return tl;
  };

  const animateDefault = (el, tl) => {
    $gsap.set(el, { opacity: 0, y: 30, scale: 0.95 });
    tl.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.0
    });
  };

  const animateStagger = (el, tl) => {
    $gsap.set(el, { opacity: 1 });

    const headings = el.querySelectorAll('h1, h2, h3');
    const paragraphs = el.querySelectorAll('p');

    tl.from(headings, {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8
    }, 0);

    tl.from(paragraphs, {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      duration: 0.6
    }, 0.2);
  };

  const animateSplitText = (el, tl) => {
    if (!$SplitText) {
      animateDefault(el, tl);
      return;
    }

    const heading = el.querySelector('h1');
    if (heading) {
      const split = new $SplitText(heading, { type: 'chars' });

      tl.from(split.chars, {
        opacity: 0,
        y: 20,
        rotationX: -90,
        stagger: 0.02,
        duration: 0.8,
        ease: 'back.out(1.7)'
      });
    }
  };

  const createLeaveTimeline = (el, done) => {
    // Simple fade out for all leave transitions
    const tl = $gsap.timeline({ onComplete: done });
    tl.to(el, {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: 'power2.in'
    });
    return tl;
  };

  return {
    createEnterTimeline,
    createLeaveTimeline,
  };
};
```

## Phase 5: SVG Shape Morphing Transitions (AAA Quality)

### Goal
Create immersive, organic transitions using SVG shapes that morph across pages.

### Concept

Full-screen SVG overlay that:
1. Morphs from one shape to another
2. Reveals new page content underneath
3. Uses DrawSVG for progressive reveal
4. Coordinates with page enter/leave timing

### Architecture

```
Components:
- PageTransitionOverlay.vue (SVG overlay component)
- useShapeTransition.js (composable for shape morphing)

Flow:
1. User clicks link → page:start
2. SVG shape animates IN (circle → blob)
3. Old page hidden beneath SVG
4. New page mounted (invisible)
5. SVG shape animates OUT (blob → liquid splash)
6. New page revealed
7. page:finish → ScrollSmoother reinit
```

### Implementation

**File: `app/components/PageTransitionOverlay.vue`**

```vue
<template>
  <!--
    Full-screen SVG overlay for shape morphing transitions
    Phase 5: Advanced organic transitions
    Uses MorphSVG to animate between different path shapes
  -->
  <div
    v-show="isVisible"
    class="fixed inset-0 z-[9999] pointer-events-none"
    aria-hidden="true"
  >
    <svg
      ref="svgRef"
      class="w-full h-full"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
    >
      <!-- Morphing shape path -->
      <path
        ref="pathRef"
        :d="currentShape"
        :fill="shapeColor"
        opacity="1"
      />
    </svg>
  </div>
</template>

<script setup>
/**
 * PageTransitionOverlay
 *
 * Full-screen SVG that morphs between shapes during page transitions
 * Provides immersive, organic transition effects
 */

const svgRef = ref(null);
const pathRef = ref(null);
const isVisible = ref(false);

// Shape definitions (SVG path data)
const shapes = {
  // Simple circle (starting shape)
  circle: 'M960,100 C1250,100 1500,350 1500,640 C1500,930 1250,1180 960,1180 C670,1180 420,930 420,640 C420,350 670,100 960,100 Z',

  // Organic blob (mid-transition)
  blob: 'M960,80 C1280,120 1520,340 1540,660 C1560,980 1290,1200 970,1180 C650,1160 400,920 420,600 C440,280 640,40 960,80 Z',

  // Liquid splash (exit shape)
  splash: 'M960,0 C1400,50 1800,200 1900,500 C2000,800 1700,1080 1200,1080 C700,1080 200,900 100,600 C0,300 520,-50 960,0 Z',

  // Full coverage (for reveals)
  full: 'M0,0 L1920,0 L1920,1080 L0,1080 Z'
};

const currentShape = ref(shapes.circle);
const shapeColor = ref('var(--theme-100)'); // Use theme color

// Expose methods for parent to trigger animations
const show = () => {
  isVisible.value = true;
};

const hide = () => {
  isVisible.value = false;
};

defineExpose({
  show,
  hide,
  svgRef,
  pathRef,
  shapes
});
</script>
```

**File: `app/composables/useShapeTransition.js`**

```javascript
/**
 * useShapeTransition
 * Phase 5: SVG shape morphing transitions
 *
 * Provides timeline for morphing SVG shapes during page transitions
 * Uses MorphSVG and DrawSVG plugins for organic effects
 */

export const useShapeTransition = () => {
  const { $gsap, $MorphSVGPlugin, $DrawSVGPlugin } = useNuxtApp();

  /**
   * Create leave transition with shape morph
   * Shape grows to cover screen, hiding old page
   */
  const createShapeLeaveTl = (overlayComponent, pageEl, done) => {
    const tl = $gsap.timeline({ onComplete: done });

    // Show overlay
    overlayComponent.show();

    const path = overlayComponent.pathRef;
    const shapes = overlayComponent.shapes;

    if (!path || !$MorphSVGPlugin) {
      // Fallback without MorphSVG
      tl.to(pageEl, { opacity: 0, duration: 0.6 });
      done();
      return tl;
    }

    // Morph circle → blob → full (covering screen)
    tl.to(path, {
      morphSVG: shapes.blob,
      duration: 0.4,
      ease: 'power2.in'
    }, 0);

    tl.to(path, {
      morphSVG: shapes.full,
      duration: 0.5,
      ease: 'power3.inOut'
    }, 0.3);

    // Fade out old page as shape covers it
    tl.to(pageEl, {
      opacity: 0,
      duration: 0.3
    }, 0.5);

    return tl;
  };

  /**
   * Create enter transition with shape reveal
   * Shape morphs and reveals new page underneath
   */
  const createShapeEnterTl = (overlayComponent, pageEl, done) => {
    const tl = $gsap.timeline({
      onComplete: () => {
        overlayComponent.hide();
        done();
      }
    });

    const path = overlayComponent.pathRef;
    const shapes = overlayComponent.shapes;

    if (!path || !$MorphSVGPlugin) {
      // Fallback
      $gsap.set(pageEl, { opacity: 0 });
      tl.to(pageEl, { opacity: 1, duration: 0.6 });
      done();
      return tl;
    }

    // Set initial states
    $gsap.set(path, { morphSVG: shapes.full });
    $gsap.set(pageEl, { opacity: 1 });

    // Morph full → splash → blob → circle (revealing page)
    tl.to(path, {
      morphSVG: shapes.splash,
      duration: 0.5,
      ease: 'power3.out'
    }, 0);

    tl.to(path, {
      morphSVG: shapes.blob,
      duration: 0.4,
      ease: 'power2.out'
    }, 0.4);

    tl.to(path, {
      morphSVG: shapes.circle,
      duration: 0.4,
      ease: 'power1.out'
    }, 0.7);

    // Fade out shape overlay
    tl.to(path, {
      opacity: 0,
      duration: 0.3
    }, 0.9);

    return tl;
  };

  /**
   * Advanced: Draw-based reveal
   * Uses DrawSVG to progressively reveal shape
   */
  const createDrawRevealTl = (overlayComponent, pageEl, done) => {
    if (!$DrawSVGPlugin) {
      return createShapeEnterTl(overlayComponent, pageEl, done);
    }

    const tl = $gsap.timeline({ onComplete: done });
    const path = overlayComponent.pathRef;

    // Draw shape from center outward
    $gsap.set(path, { drawSVG: '50% 50%' });

    tl.to(path, {
      drawSVG: '0% 100%',
      duration: 1.2,
      ease: 'power2.inOut'
    });

    return tl;
  };

  return {
    createShapeLeaveTl,
    createShapeEnterTl,
    createDrawRevealTl,
  };
};
```

**File: `app.vue` (Phase 5 Update)**

```vue
<template>
  <FluidGradient />

  <!-- SVG shape transition overlay -->
  <PageTransitionOverlay ref="transitionOverlay" />

  <NuxtLayout>
    <NuxtPage
      @enter="onEnter"
      @leave="onLeave"
    />
  </NuxtLayout>

  <CursorTrail />
</template>

<script setup>
/**
 * Phase 5: SVG shape morphing transitions
 * Uses PageTransitionOverlay + useShapeTransition
 */

const transitionOverlay = ref(null);
const { createShapeLeaveTl, createShapeEnterTl } = useShapeTransition();

let currentTl = null;

const onLeave = (el, done) => {
  console.log('[ShapeTransition] leave start');

  if (currentTl) currentTl.kill();

  currentTl = createShapeLeaveTl(transitionOverlay.value, el, () => {
    console.log('[ShapeTransition] leave complete');
    done();
  });
};

const onEnter = (el, done) => {
  console.log('[ShapeTransition] enter start');

  if (currentTl) currentTl.kill();

  currentTl = createShapeEnterTl(transitionOverlay.value, el, () => {
    console.log('[ShapeTransition] enter complete');
    done();
  });
};

onUnmounted(() => {
  if (currentTl) currentTl.kill();
});
</script>
```

### Advanced Shape Patterns

**1. Directional Shapes**

Morph based on navigation direction (forward/back).

```javascript
const route = useRoute();
const previousRoute = ref(null);

watch(() => route.path, (newPath, oldPath) => {
  previousRoute.value = oldPath;
});

const getTransitionDirection = () => {
  // Determine if going "deeper" or "back"
  const depth = route.path.split('/').length;
  const prevDepth = previousRoute.value?.split('/').length || 0;
  return depth > prevDepth ? 'forward' : 'back';
};

const createShapeLeaveTl = (overlay, el, done) => {
  const direction = getTransitionDirection();
  const shapes = overlay.shapes;

  const tl = $gsap.timeline({ onComplete: done });

  if (direction === 'forward') {
    // Forward: circle → full (covering)
    tl.to(overlay.pathRef, { morphSVG: shapes.full });
  } else {
    // Back: different shape (e.g., wipe from left)
    tl.to(overlay.pathRef, { x: '-100%' });
  }

  return tl;
};
```

**2. Color-Based Transitions**

Change shape color based on target page theme.

```javascript
// In page component
definePageMeta({
  transitionColor: '#FF6B6B' // Custom color for this page
});

// In composable
const createShapeEnterTl = (overlay, el, done) => {
  const route = useRoute();
  const color = route.meta.transitionColor || 'var(--theme-100)';

  const tl = $gsap.timeline({ onComplete: done });

  // Animate shape with custom color
  $gsap.set(overlay.pathRef, { fill: color });

  // ... rest of animation

  return tl;
};
```

**3. Multi-Layer Shapes**

Stack multiple SVG layers for depth.

```vue
<!-- In PageTransitionOverlay.vue -->
<svg>
  <!-- Background layer (slower) -->
  <path ref="bgPath" :d="bgShape" fill="var(--theme-100)" opacity="0.3" />

  <!-- Foreground layer (faster) -->
  <path ref="fgPath" :d="fgShape" fill="var(--theme-200)" opacity="1" />
</svg>
```

```javascript
// Animate layers at different speeds for parallax effect
tl.to(bgPath, { morphSVG: shapes.blob, duration: 1.2 }, 0);
tl.to(fgPath, { morphSVG: shapes.splash, duration: 0.8 }, 0);
```

## Troubleshooting

### Phase 1 Issues

**Problem**: Transition not visible at all
- **Check**: Browser console for errors
- **Check**: CSS classes applied (`.page-enter-active`)
- **Check**: `nuxt.config.ts` has `pageTransition` configured
- **Fix**: Ensure `name: 'page'` matches CSS class prefix

**Problem**: Transition too fast
- **Check**: Duration in `app.vue` styles
- **Fix**: Increase from 600ms → 1200ms or higher

**Problem**: Blur not working
- **Check**: Browser support for `filter` CSS property
- **Fix**: Use `backdrop-filter` or remove blur on unsupported browsers

### Phase 3 Issues

**Problem**: GSAP timeline not running
- **Check**: `$gsap` is available (`console.log($gsap)`)
- **Check**: `done()` callback is being called
- **Fix**: Ensure GSAP plugin loaded before app.vue

**Problem**: Height jumps after transition
- **Check**: ScrollSmoother init timing
- **Fix**: Increase `setTimeout` delay in `scrollsmoother.client.js`

**Problem**: Transition cuts off early
- **Check**: Timeline duration matches callback timing
- **Fix**: Ensure `onComplete: done` is set correctly

### Phase 5 Issues

**Problem**: MorphSVG not working
- **Check**: Club GreenSock membership active
- **Check**: `@hypernym/nuxt-gsap` config includes `morphSvg: true`
- **Fix**: Verify plugin registration in nuxt.config.ts

**Problem**: Shapes look distorted
- **Check**: Path data has same number of points
- **Fix**: Use GSAP's path normalization or create compatible paths

**Problem**: SVG overlay blocks clicks
- **Check**: `pointer-events: none` on overlay
- **Fix**: Add CSS class or inline style

## Performance Optimization

### Reducing Jank

**1. Use will-change Sparingly**

```css
/* Only on elements that will animate */
.page-enter-active,
.page-leave-active {
  will-change: opacity, transform, filter;
}

/* Remove after transition */
.page-enter-to,
.page-leave-from {
  will-change: auto;
}
```

**2. GPU Acceleration**

```javascript
// Force GPU acceleration for transforms
$gsap.set(el, { force3D: true });
```

**3. Limit Concurrent Animations**

```javascript
// Kill old timeline before starting new one
if (currentTl) {
  currentTl.kill();
  currentTl = null;
}
currentTl = createEnterTimeline(el, done);
```

### Memory Management

```javascript
// Always cleanup timelines
onUnmounted(() => {
  if (enterTl) enterTl.kill();
  if (leaveTl) leaveTl.kill();

  // Cleanup SplitText instances
  if (splitInstance) splitInstance.revert();
});
```

## Configuration Reference

### Design Tokens

**File: `app/assets/css/tokens/theme.scss`**

```scss
/* Page transition timing */
--duration-page-transition: 1000ms;     // Base duration
--duration-page-transition-fast: 600ms; // Fast transitions
--duration-page-transition-slow: 1500ms; // Slow/cinematic

/* Easing curves */
--ease-page-in: cubic-bezier(0.4, 0.0, 1, 1);
--ease-page-out: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-page-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Shape colors */
--color-transition-overlay: var(--theme-100);
```

### Per-Route Configuration

```javascript
// In page component
definePageMeta({
  // Transition configuration
  transitionType: 'stagger',        // Which animation to use
  transitionDuration: 1200,         // Override default duration
  transitionColor: '#FF6B6B',       // Custom overlay color
  transitionDirection: 'slide-left', // Directional hint

  // Disable transitions for specific page
  pageTransition: false,
});
```

## Testing Checklist

### Phase 1
- [ ] CSS transitions visible (1200ms duration)
- [ ] Opacity fades in/out
- [ ] Blur effect visible
- [ ] Scale transform noticeable
- [ ] TranslateY motion smooth
- [ ] Works with ScrollSmoother (no conflicts)

### Phase 3
- [ ] GSAP timeline fires
- [ ] Duration matches CSS variable
- [ ] Cleanup on unmount
- [ ] No memory leaks (check DevTools)
- [ ] Timelines killed before new navigation

### Phase 5
- [ ] SVG overlay appears
- [ ] Shape morphing smooth
- [ ] Overlay hides after transition
- [ ] No pointer-events blocking
- [ ] Works on all routes
- [ ] Performance 60fps

## Files Reference

### Core Files (All Phases)

**Configuration:**
- `nuxt.config.ts` - App-level transition config

**Components:**
- `app.vue` - Transition lifecycle hooks
- `app/components/PageTransitionOverlay.vue` - Phase 5 SVG overlay

**Composables:**
- `app/composables/usePageTransition.js` - Phase 3-4 GSAP timelines
- `app/composables/useShapeTransition.js` - Phase 5 shape morphing

**Styles:**
- `app/assets/css/tokens/theme.scss` - Design tokens
- `app.vue` (style block) - Phase 1 CSS transitions

**Integration:**
- `app/plugins/scrollsmoother.client.js` - Coordinates with transitions
- `app/plugins/headroom.client.js` - Resets header state

## Future Enhancements

Potential additions beyond Phase 5:

- [ ] Loading progress indicator during transition
- [ ] Preload next page before transition starts
- [ ] Route-aware shape selection (e.g., portfolio uses different shapes)
- [ ] Sound effects synchronized with shape morphing
- [ ] Cursor interaction with transition overlay
- [ ] WebGL shader effects on SVG shapes
- [ ] Reduced motion preference detection (`prefers-reduced-motion`)
- [ ] Fallback transitions for older browsers
- [ ] Prefetch strategy for instant navigation
- [ ] Custom transition curves per brand section

## Summary

This page transition system evolves through 5 phases:

1. **Phase 1** (Current): Slow, visible CSS transitions for debugging
2. **Phase 2**: JavaScript lifecycle hooks for control
3. **Phase 3**: GSAP timeline-based animations
4. **Phase 4**: Advanced GSAP (stagger, SplitText, custom easing)
5. **Phase 5**: Immersive SVG shape morphing transitions

Each phase builds on the previous, maintaining compatibility with ScrollSmoother and headroom systems while progressively enhancing the user experience from functional to extraordinary.
