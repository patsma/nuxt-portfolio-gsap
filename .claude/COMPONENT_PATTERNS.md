# Component Patterns

Reusable component architectures and layout patterns for building consistent, maintainable section components.

## Table of Contents
1. [Reusable Components](#reusable-components)
2. [Section Layout Patterns](#section-layout-patterns)
3. [Grid Layout Best Practices](#grid-layout-best-practices)
4. [Animation Integration](#animation-integration)
5. [Reference Implementations](#reference-implementations)

---

## Reusable Components

### FullWidthBorder Component

**Purpose:** Theme-aware full-width horizontal border dividers that span entire content-grid width.

**File:** `app/components/FullWidthBorder.vue`

**Props:**
- `opacity` (Number, default: 15): Opacity percentage (0-100) for border color
- `spacing` (String, default: 'var(--space-s)'): Bottom margin spacing

**Features:**
- Uses `color-mix()` for theme-aware transparency
- Spans full-width via `grid-column: full-width`
- 1px height for clean divider lines
- Configurable opacity and spacing

**Usage:**
```vue
<!-- Default: 15% opacity, space-s margin -->
<FullWidthBorder />

<!-- Custom: 10% opacity, space-m margin -->
<FullWidthBorder :opacity="10" spacing="var(--space-m)" />
```

**Why Abstracted:**
- Previously duplicated in InteractiveCaseStudySection SCSS
- Now reused in ExperienceSection, InteractiveCaseStudySection
- Follows DRY principle, single source of truth
- Easier to update globally

**Implementation:**
```vue
<template>
  <div
    class="full-width-border-line full-width"
    :style="{ marginBottom: spacing }"
  ></div>
</template>

<style scoped>
.full-width-border-line {
  grid-column: full-width;
  height: 1px;
  background-color: color-mix(
    in srgb,
    var(--theme-text-100) v-bind(opacity + '%'),
    transparent
  );
}
</style>
```

---

## Section Layout Patterns

### Pattern 1: BiographySection (Simple 2-Column)

**Use Case:** Simple text content with label + content layout

**Layout:**
- **Desktop:** 2-column grid (label left, content right)
- **Mobile:** Stacked (label above content)

**Key Features:**
- Content-grid with breakout3 for width
- Typography utility classes (no SCSS needed)
- Scroll-triggered animations
- Minimal custom styling

**Structure:**
```vue
<section class="content-grid w-full py-[var(--space-xl)]">
  <div class="breakout3 grid gap-[var(--space-m)] lg:grid-cols-[minmax(auto,12rem)_1fr]">
    <!-- Label -->
    <h2 class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
      Biography
    </h2>

    <!-- Content -->
    <div class="space-y-[var(--space-m)] ibm-plex-sans-jp-mobile-p1">
      <slot />
    </div>
  </div>
</section>
```

**Reference:** `app/components/BiographySection.vue`

---

### Pattern 2: ExperienceSection (4-Column Grid)

**Use Case:** List of structured data items (experience, education, etc.)

**Layout:**
- **Desktop:** 4-column grid (Date | Title | Company | Location)
- **Tablet/Mobile:** 2-column (Date left, Title/Company/Location stacked right)

**Key Features:**
- Content-grid system with breakout3
- FullWidthBorder for row dividers
- 4-column equal-width grid on desktop
- Scroll-triggered animations
- "View all" link aligned with first column

**Desktop Grid:**
```vue
<div class="breakout3 py-[var(--space-s)] lg:grid lg:grid-cols-4 lg:gap-[var(--space-m)]">
  <p>2023 – Current</p>
  <p>Senior UX/UI Designer</p>
  <p>TCS</p>
  <p class="text-right">Tokyo</p>
</div>
```

**Mobile Layout:**
```vue
<div class="grid grid-cols-2 gap-[var(--space-xs)] lg:hidden">
  <p>2023 – Current</p>
  <div class="flex flex-col items-end text-right">
    <p>Senior UX/UI Designer</p>
    <p>TCS</p>
    <p>Tokyo</p>
  </div>
</div>
```

**Nested Full-Width Structure:**
```scss
// Required for nested full-width-content elements
.full-width-content > .experience-item.full-width-content {
  grid-column: full-width;
  display: grid;
  grid-template-columns: inherit;
}
```

**Files:**
- `app/components/ExperienceSection.vue` - Container with animations
- `app/components/ExperienceItem.vue` - Individual row
- `app/assets/css/components/experience-section.scss` - Nested grid rules

**Reference Implementation:** See [ExperienceSection Details](#experiencesection-reference)

---

### Pattern 3: InteractiveCaseStudySection (Complex with Preview)

**Use Case:** Interactive gallery with hover preview and complex interactions

**Layout:**
- **Desktop:** 2-column list (title + tag left, description right) + hover preview
- **Mobile:** Cards with images

**Key Features:**
- Full-width-content nested sub-grids
- Desktop hover preview (teleported to body for scroll support)
- FullWidthBorder for dividers
- Complex GSAP preview animations
- Responsive layout switching

**Files:**
- `app/components/InteractiveCaseStudySection.vue`
- `app/components/InteractiveCaseStudyItem.vue`
- `app/assets/css/components/interactive-case-study.scss`
- `app/composables/useInteractiveCaseStudyPreview.js`

**Reference:** `.claude/INTERACTIVE_CASE_STUDY.md`

---

## Grid Layout Best Practices

### Use Content-Grid System

**DO:**
```vue
<!-- Use breakout3 for consistent content width -->
<div class="breakout3">
  <!-- Content aligns with other sections -->
</div>
```

**DON'T:**
```vue
<!-- Avoid custom padding -->
<div class="px-[custom-value]">
  <!-- Misaligned with grid system -->
</div>
```

### When to Use What

| Pattern | Use Case | Grid Approach |
|---------|----------|---------------|
| **Simple 2-column** | Label + content | `lg:grid-cols-[minmax(auto,12rem)_1fr]` |
| **4-column equal** | Structured data rows | `lg:grid-cols-4` |
| **Custom widths** | Specific column sizes | `lg:grid-cols-[17rem_17rem_1fr_auto]` |
| **Full-width** | Borders, backgrounds | `grid-column: full-width` |

### Responsive Strategy

**Mobile (<768px):**
- Stack or 2-column layouts
- Centered or left-aligned content
- Simpler interactions

**Tablet (768-1023px):**
- Often same as mobile
- May use grid for better spacing

**Desktop (≥1024px):**
- Multi-column grids (2-4 columns)
- Hover interactions
- More complex layouts

**Breakpoint Classes:**
```vue
<div class="lg:grid lg:grid-cols-4">
  <!-- Mobile: stack, Desktop: grid -->
</div>
```

### Avoiding Custom Padding

**Problem:** Custom padding creates misaligned "boxes" that don't follow grid lines.

**Solution:** Use content-grid's built-in spacing via breakout3.

**Before (WRONG):**
```scss
.experience-item-content {
  padding-left: var(--space-s);
  padding-right: var(--space-s);

  @include bp.up(bp.$bp-lg) {
    padding-left: calc(var(--space-xl) + var(--space-l));
  }
}
```

**After (CORRECT):**
```vue
<div class="breakout3">
  <!-- Content-grid handles spacing automatically -->
</div>
```

---

## Animation Integration

### Scroll-Triggered Animations

**Pattern:** BiographySection / ExperienceSection approach

**Features:**
- Fade + y-offset animations
- Stagger delays (0.08s)
- ScrollTrigger integration
- Coordinate with page transitions

**Implementation:**
```javascript
const createSectionAnimation = () => {
  const tl = $gsap.timeline();

  const items = listRef.value.querySelectorAll('.experience-item');
  if (items.length > 0) {
    tl.fromTo(
      items,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
      }
    );
  }

  return tl;
};

scrollTriggerInstance = $ScrollTrigger.create({
  trigger: sectionRef.value,
  start: 'top 80%',
  animation: createSectionAnimation(),
  toggleActions: 'play pause resume reverse',
});
```

**Critical:** Recreate ScrollTrigger after page transitions for fresh DOM queries.

```javascript
// Clear inline GSAP styles from page transitions
$gsap.set(items, { clearProps: 'all' });
$gsap.set(items, { opacity: 0, y: 40 });
```

### Refreshing ScrollTrigger After Dynamic Height Changes

**Problem:** When content height changes dynamically (accordions, modals, lazy-loaded content), ScrollTrigger positions become stale. This breaks pinning for subsequent sections.

**Solution:** Call `ScrollTrigger.refresh()` after height-changing animations complete.

**When to Use:**
- Accordion expand/collapse
- Modal open/close
- Lazy-loaded content insertion
- Dynamic content additions/removals
- Any height-changing GSAP animations

**Pattern:**
```javascript
const nuxtApp = useNuxtApp();
const { $gsap, $ScrollTrigger } = nuxtApp;

watch(isExpanded, (expanded) => {
  // Pause headroom before animation to prevent header from reacting to scroll changes
  nuxtApp.$headroom?.pause();

  if (expanded) {
    $gsap.to(element, {
      height: 'auto',
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        // Setup one-time listener BEFORE calling refresh
        // This fires precisely when ScrollTrigger.refresh() completes all recalculations
        const handleRefreshComplete = () => {
          // Unpause headroom after ScrollSmoother settles
          nuxtApp.$headroom?.unpause();

          // Remove listener immediately to prevent memory leaks
          $ScrollTrigger.removeEventListener('refresh', handleRefreshComplete);
        };

        // Register listener first
        $ScrollTrigger.addEventListener('refresh', handleRefreshComplete);

        // Trigger refresh - listener will fire when ScrollSmoother has fully settled
        $ScrollTrigger.refresh();
      },
    });
  } else {
    $gsap.to(element, {
      height: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        // Same pattern for collapse
        const handleRefreshComplete = () => {
          nuxtApp.$headroom?.unpause();
          $ScrollTrigger.removeEventListener('refresh', handleRefreshComplete);
        };

        $ScrollTrigger.addEventListener('refresh', handleRefreshComplete);
        $ScrollTrigger.refresh();
      },
    });
  }
});
```

**Reference Implementation:** `app/components/RecommendationItem.vue` (lines 326-389)

**Critical Timing:**
- ALWAYS call refresh in `onComplete` callback, never during animation
- This ensures DOM has fully updated before recalculation
- Prevents visual glitches and incorrect positioning

**Why It Matters:**
- ScrollTrigger caches element positions for performance
- Height changes invalidate these cached positions
- Subsequent sections (ImageScalingSection, VideoScalingSection) pin at wrong scroll positions
- Global refresh recalculates all triggers efficiently

### Headroom Coordination Pattern

**Why coordinate with headroom?**

When content height changes (accordion expand/collapse), it triggers:
1. ScrollTrigger.refresh() → Recalculates all scroll positions
2. ScrollSmoother animates to new scroll position
3. Headroom sees scroll position changes and tries to show/hide header ❌

**Solution:** Pause headroom during animation, unpause after ScrollSmoother settles.

**Key Pattern: ScrollTrigger.addEventListener("refresh")**

❌ **Anti-pattern (arbitrary timing):**
```javascript
$ScrollTrigger.refresh();
setTimeout(() => {
  nuxtApp.$headroom?.unpause(); // Guessing when ScrollSmoother settles
}, 300);
```

✅ **Correct pattern (event-driven):**
```javascript
const handleRefreshComplete = () => {
  nuxtApp.$headroom?.unpause();
  $ScrollTrigger.removeEventListener('refresh', handleRefreshComplete);
};

$ScrollTrigger.addEventListener('refresh', handleRefreshComplete);
$ScrollTrigger.refresh(); // Listener fires when complete
```

**Why event listeners are better:**
- No arbitrary delays
- Fires precisely when ScrollTrigger calculations complete
- Event-driven (matches codebase patterns)
- Official GSAP API

**unpause() uses skipNextUpdate pattern:**
When `unpause()` is called, it sets `skipNextUpdate = true`. The next `updateHeader()` call will sync `lastScrollTop` to the current scroll position without changing header state. This prevents headroom from reacting to scroll changes that occurred during the animation.

See `.claude/SCROLL_SYSTEM.md` for full skipNextUpdate documentation.

**Alternative (with ScrollSmoother):**
```javascript
const { refreshSmoother } = useScrollSmootherManager();

onComplete: () => {
  // Also recalculates data-speed/data-lag parallax effects
  refreshSmoother();
}
```

### iOS Safari Fix: Targeted Refresh Pattern

**Problem (iOS Safari only):** Global `ScrollTrigger.refresh()` reverses entrance animations on iOS Safari when entrance ScrollTrigger still exists.

**Root Cause:** iOS Safari + GSAP quirk - `ScrollTrigger.refresh()` can trigger `toggleActions: 'play pause resume reverse'` to execute reversal on entrance ScrollTriggers, even when they're not in viewport.

**Solution:** Targeted refresh pattern - only refresh pinned ScrollTriggers, not entrance animations or marquees.

**Implementation Pattern:**
```javascript
// RecommendationsSection.vue - Targeted refresh for accordion animations
const executeRefresh = () => {
  // CRITICAL: Kill entrance ScrollTrigger BEFORE refresh
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }

  // TARGETED REFRESH: Only refresh ScrollTriggers with pin: true
  // Avoids affecting marquee ScrollTriggers and entrance animations
  const pinnedTriggers = $ScrollTrigger.getAll().filter(st => st.pin);

  pinnedTriggers.forEach((trigger) => {
    trigger.refresh();
  });
};

// Debounce to let once:true fully clean up
const debouncedRefresh = useDebounceFn(executeRefresh, 100);
```

**When to Use:**
- Accordion expand/collapse animations
- Any height-changing animations that need to update pinned sections below
- iOS Safari compatibility is critical

**Key Points:**
- Kill entrance ScrollTriggers before refresh (prevents reversal)
- Filter for `pin: true` to only refresh pinned sections
- Use `once: true` on entrance animations (auto-destroys after first play)
- Debounce refresh with 100ms delay to ensure cleanup completes

**Reference Implementations:**
- `app/components/RecommendationsSection.vue` (lines 107-152) - Targeted refresh pattern
- `app/components/RecommendationItem.vue` (lines 342-413) - Accordion animation with refresh

### Page Transition Directives

**Pattern:** Use `leaveOnly: true` for exit animations only

```vue
<div v-page-stagger="{ stagger: 0.08, leaveOnly: true }">
  <!-- Items animate OUT on navigation -->
  <!-- ScrollTrigger handles IN animations -->
</div>
```

**Why:** Prevents conflicts between entrance animations and page transitions.

### Entrance Animations (First Load)

**Pattern:** Optional entrance animation system for hero sections

```javascript
setupEntrance(sectionRef.value, {
  position: '<-0.5',  // Timing relative to previous animation
  animate: () => createSectionAnimation()
});
```

**HTML Scoping:** Use `data-entrance-animate="true"` attribute + CSS hiding

---

## Reference Implementations

### ExperienceSection Reference

**Complete implementation example with all patterns:**

#### Component Structure

```vue
<!-- app/components/ExperienceSection.vue -->
<template>
  <section
    ref="sectionRef"
    class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]"
  >
    <div
      ref="listRef"
      class="experience-list full-width-content flex flex-col"
      v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
    >
      <!-- Experience items slot -->
      <slot />

      <!-- Optional "View more" link -->
      <div
        v-if="viewMoreText && viewMoreTo"
        class="experience-item full-width-content"
      >
        <FullWidthBorder />
        <div class="experience-view-more breakout3 py-[var(--space-s)]">
          <NuxtLink :to="viewMoreTo">
            {{ viewMoreText }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
```

#### Individual Item

```vue
<!-- app/components/ExperienceItem.vue -->
<template>
  <div class="experience-item full-width-content">
    <FullWidthBorder />

    <div class="experience-item-content breakout3 py-[var(--space-s)] lg:grid lg:grid-cols-4 lg:gap-[var(--space-m)]">
      <!-- Mobile: 2-column layout -->
      <div class="grid grid-cols-2 gap-[var(--space-xs)] lg:hidden">
        <p>{{ dateRange }}</p>
        <div class="flex flex-col items-end text-right">
          <p>{{ title }}</p>
          <p>{{ company }}</p>
          <p>{{ location }}</p>
        </div>
      </div>

      <!-- Desktop: 4-column grid (direct children) -->
      <p class="hidden lg:block">{{ dateRange }}</p>
      <p class="hidden lg:block">{{ title }}</p>
      <p class="hidden lg:block">{{ company }}</p>
      <p class="hidden lg:block text-right">{{ location }}</p>
    </div>
  </div>
</template>
```

#### SCSS (Minimal)

```scss
/* app/assets/css/components/experience-section.scss */

/* Nested full-width-content grid handling */
.full-width-content > .experience-item.full-width-content {
  grid-column: full-width;
  display: grid;
  grid-template-columns: inherit;
}

.experience-item {
  position: relative;
}
```

#### Usage

```vue
<ExperienceSection view-more-text="View all" view-more-to="/experience">
  <ExperienceItem
    date-range="2023 – Current"
    title="Senior UX/UI Designer"
    company="TCS"
    location="Tokyo"
  />
  <ExperienceItem
    date-range="2020 – 2023"
    title="Lead/Senior Digital Designer"
    company="Bærnholdt"
    location="Copenhagen"
  />
</ExperienceSection>
```

---

### FooterSection Reference

**Complete implementation for layout-level components with page transitions**

#### Key Differences from Page Components

- Lives in layout (persists across navigation)
- Page transition directives won't work
- Must manually handle page leave animation
- ScrollTrigger handles entrance animations

#### Why It's Different

**Page components** (index.vue, about.vue):
- Destroyed/recreated on navigation
- Directives (v-page-fade, v-page-stagger) work automatically
- Framework handles lifecycle

**Layout components** (FooterSection in default.vue):
- Persist across all pages
- Directives never trigger (not part of NuxtPage)
- Manual hooks required

#### Implementation Pattern

**1. Simple Page Leave Hook**

```javascript
const handlePageLeave = () => {
  // Fade out marquee
  if (marqueeRef.value && marqueeRef.value.$el) {
    $gsap.to(marqueeRef.value.$el, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    });
  }

  // Fade out links
  if (linksListRef.value) {
    const items = linksListRef.value.querySelectorAll('.link-item');
    if (items.length > 0) {
      $gsap.to(items, {
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.in',
      });
    }
  }
};

onMounted(() => {
  const nuxtApp = useNuxtApp();
  unhookPageStart = nuxtApp.hook('page:start', handlePageLeave);
});
```

**2. ScrollTrigger for Each Element**

```javascript
// Marquee ScrollTrigger
const createMarqueeAnimation = () => {
  const tl = $gsap.timeline();
  if (marqueeRef.value && marqueeRef.value.$el) {
    tl.fromTo(
      marqueeRef.value.$el,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
  }
  return tl;
};

const createMarqueeScrollTrigger = () => {
  // Kill existing
  if (marqueeScrollTriggerInstance) {
    marqueeScrollTriggerInstance.kill();
    marqueeScrollTriggerInstance = null;
  }

  // Clear inline styles from page leave
  $gsap.set(marqueeRef.value.$el, { clearProps: 'all' });
  $gsap.set(marqueeRef.value.$el, { opacity: 0 });

  // Create ScrollTrigger
  const timeline = createMarqueeAnimation();
  marqueeScrollTriggerInstance = $ScrollTrigger.create({
    trigger: marqueeRef.value.$el,
    start: 'top 80%',
    animation: timeline,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true,
  });
};

// Coordinate with page transitions
if (loadingStore.isFirstLoad) {
  nextTick(() => createMarqueeScrollTrigger());
} else {
  const unwatch = watch(
    () => pageTransitionStore.isTransitioning,
    (isTransitioning) => {
      if (!isTransitioning) {
        nextTick(() => createMarqueeScrollTrigger());
        unwatch();
      }
    },
    { immediate: true }
  );
}
```

**3. Proper Cleanup**

```javascript
onUnmounted(() => {
  // Unhook page:start
  if (unhookPageStart) {
    unhookPageStart();
    unhookPageStart = null;
  }

  // Kill ScrollTriggers
  if (marqueeScrollTriggerInstance) {
    marqueeScrollTriggerInstance.kill();
    marqueeScrollTriggerInstance = null;
  }

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
});
```

#### Anti-Patterns to Avoid

❌ **Don't use `page:finish` to reset elements**
```javascript
// BAD: Racing with other animations
nuxtApp.hook('page:finish', () => {
  $gsap.set(element, { autoAlpha: 1 });
});
```

❌ **Don't store and kill timelines**
```javascript
// BAD: Breaks other animations
let leaveTimeline = $gsap.timeline();
nuxtApp.hook('page:finish', () => {
  leaveTimeline.kill();
});
```

❌ **Don't use page transition directives**
```vue
<!-- BAD: Won't work in layout components -->
<div v-page-fade="{ leaveOnly: true }">
```

✅ **Do use simple hooks + ScrollTrigger**
```javascript
// GOOD: Clean separation of concerns
nuxtApp.hook('page:start', () => fadeOut());
$ScrollTrigger.create({ animation: fadeIn() });
```

#### Files

- `app/components/FooterSection.vue` - Container with ScrollTriggers
- `app/components/FooterMarquee.vue` - Child component (no transition logic)
- `app/components/FooterHeroSection.vue` - Child with own ScrollTrigger

#### Critical Rules

1. **Never** try to reset elements in `page:finish` hook
2. **Always** let ScrollTrigger handle entrance animations
3. **Keep** page leave animations simple (just fade to opacity: 0)
4. **Use** refs instead of `document.querySelector()`
5. **Clear** inline styles before creating ScrollTrigger

---

## Key Takeaways

✅ **Use content-grid system** - Avoid custom padding, use breakout3
✅ **Abstract reusable patterns** - FullWidthBorder component approach
✅ **Keep SCSS minimal** - Tailwind-first, SCSS only for complex cases
✅ **Consistent animations** - Scroll triggers + page transition directives
✅ **Responsive strategy** - Mobile-first, progressive enhancement
✅ **Grid for alignment** - Use grid-cols-4 or grid-cols-2, not arbitrary padding
✅ **Typography utilities** - Use generated classes (ibm-plex-sans-jp-mobile-p1)
✅ **Theme-aware colors** - Always use CSS variables (--theme-text-60)
✅ **Refresh after height changes** - Call ScrollTrigger.refresh() in GSAP onComplete callbacks

---

## Next Steps

When building a new section component:

1. **Choose pattern** - Simple 2-column, 4-column grid, or complex interactive
2. **Use content-grid** - Start with `content-grid` + `breakout3`
3. **Reuse FullWidthBorder** - For dividers between items
4. **Add scroll animations** - Follow BiographySection/ExperienceSection pattern
5. **Page transitions** - Use `v-page-stagger` with `leaveOnly: true`
6. **Keep it simple** - Tailwind-first, minimal SCSS
7. **Test responsively** - Mobile, tablet, desktop breakpoints

**For questions or patterns not covered here, reference:**
- BiographySection.vue (simplest pattern)
- ExperienceSection.vue (4-column grid)
- FooterSection.vue (layout component with page transitions)
- InteractiveCaseStudySection.vue (complex interactions)
