# Interactive Case Study Gallery

Responsive portfolio gallery with cursor-following preview system and varied clip animations.

## Architecture

**Desktop (≥768px):** List layout + floating cursor-following preview
**Mobile (<768px):** Card layout with images

```
InteractiveCaseStudySection.vue
  ├─ useInteractiveCaseStudyPreview.ts (state, animations, clip directions)
  ├─ calculatePreviewPosition() (viewport bounds, cursor offset)
  ├─ ScrollTrigger (scroll-based hiding with failsafe)
  └─ InteractiveCaseStudyItem.vue (inject preview controls)
```

## Key Features

- **Movement-based clip directions**: Top/bottom reveal based on list movement direction
- **Timed slideshow**: After 1s hover, cycles through additional images with left-to-right clip reveal
- **Dynamic aspect ratios**: Spring physics morphing between image sizes
- **3-slot carousel**: Robust image transitions without animation conflicts
- **Automatic direction detection**: Index-based direction (moving DOWN = from top, moving UP = from bottom)
- **Scroll-based hiding**: Smooth 300ms fade when scrolling out of section
- **Cursor failsafe**: Continuous monitoring prevents stuck previews
- **Navigation guard**: Delays navigation until clip animation completes
- **Module-level state**: Preloaded image cache persists across component instances

## Files

- `app/components/InteractiveCaseStudySection.vue` (195 lines)
- `app/components/InteractiveCaseStudyItem.vue` (204 lines)
- `app/composables/useInteractiveCaseStudyPreview.ts` (~1100 lines)
- `app/utils/previewPosition.ts` (153 lines)
- `app/utils/logger.ts` (308 lines)
- `app/assets/css/components/interactive-case-study.scss` (301 lines)

## Usage

### Basic Example
```vue
<InteractiveCaseStudySection>
  <template #title>Work</template>

  <InteractiveCaseStudyItem
    title="Recommendating"
    tag="APP"
    description="Art direction & UI"
    image="/images/projects/recommendating.jpg"
    image-alt="Recommendating app preview"
    to="/work/recommendating"
  />
</InteractiveCaseStudySection>
```

### Direction Logic

Clip direction is automatic based on movement through the list:

| Movement | Clip Direction | Visual |
|----------|---------------|--------|
| First hover | `top` | Reveals from top edge |
| Moving DOWN list (index increases) | `top` | Reveals from top edge |
| Moving UP list (index decreases) | `bottom` | Reveals from bottom edge |

No configuration needed - the system tracks item indices automatically.

### Props (InteractiveCaseStudyItem)

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | String | Yes | - | Project title |
| `tag` | String | No | - | Label like "APP", "INTRANET" |
| `description` | String | Yes | - | Role/description text |
| `image` | String | Yes | - | Image path |
| `image-alt` | String | Yes | - | Alt text for accessibility |
| `slideshow-images` | String[] | No | [] | Additional images for slideshow |
| `slideshow-image-alts` | String[] | No | [] | Alt texts for slideshow images |
| `to` | String | No | "/contact" | Navigation path |

**Note:** Clip direction is automatic based on movement through the list (see Direction Logic above).

### Slideshow Feature

After hovering for 1 second, additional images cycle with a left-to-right clip reveal:

```yaml
# content/data/case-studies.yml
- title: "Project Name"
  image: "/images/main.jpg"
  slideshowImages:
    - "/images/detail-1.jpg"
    - "/images/detail-2.jpg"
  slideshowImageAlts:
    - "Detail view"
    - "Final result"
```

**Timing:**
- **Delay**: 1s before slideshow starts
- **Interval**: 2s between images
- **Reveal**: 600ms left-to-right clip animation
- **Loop**: Continuous (main → slideshow images → main → ...)

## Technical Details

### Desktop Preview

**Positioning:**
- Teleported to body (fixed positioning for scroll support)
- Offset: 30px right, centered vertically on cursor
- `transform-origin: 0 0` (top-left) for correct GSAP positioning
- `getBoundingClientRect()` accounts for ScrollSmoother transforms

**Animations:**
- **Cursor follow**: 0.6s power2.out lag effect
- **Clip reveal**: 350ms power2.out (direction-aware)
- **Clip close**: 350ms power2.in (direction-aware)
- **Dual-clip transition**: 350ms power2.inOut (different directions for variety)
- **Aspect ratio morph**: 400ms power2.inOut
- **Crossfade**: Dual-image wrappers with opacity

**Clip Path Configurations:**
```typescript
type ClipDirection = 'top' | 'bottom' | 'left'

const clipPaths: Record<ClipDirection, { closed: string; open: string }> = {
  top:    { closed: "inset(0% 0% 100% 0%)",   open: "inset(0% 0% 0% 0%)" },
  bottom: { closed: "inset(100% 0% 0% 0%)",   open: "inset(0% 0% 0% 0%)" },
  left:   { closed: "inset(0% 100% 0% 0%)",   open: "inset(0% 0% 0% 0%)" }  // Slideshow
}
```

**Direction Resolution (module-level state):**
```typescript
let previousItemIndex: number | null = null

const resolveClipDirection = (currentIndex: number): ClipDirection => {
  const prev = previousItemIndex
  previousItemIndex = currentIndex

  // First hover or moving down → reveal from top
  // Moving up → reveal from bottom
  if (prev === null || currentIndex >= prev) {
    return 'top'
  }
  return 'bottom'
}
```

**Size:**
- Width: 35vw (40vw @ lg), max 30em (40em @ lg)
- Max height: 80vh
- Dynamic aspect ratio bound via inline style

### Scroll-Based Hiding

**Problem:** Preview getting stuck on screen when quickly scrolling out of section.

**Solution:** Multi-layered failsafe system:

1. **ScrollTrigger Integration** (InteractiveCaseStudySection.vue:155-194)
   ```typescript
   $ScrollTrigger.create({
     trigger: sectionRef.value,
     start: "top top",
     end: "bottom bottom",
     onLeave: () => clearActivePreviewInstant(),      // Scroll down
     onLeaveBack: () => clearActivePreviewInstant(),  // Scroll up
     onUpdate: () => {
       // Continuous cursor position monitoring
       if (cursor outside section bounds) {
         clearActivePreviewInstant()
       }
     }
   })
   ```

2. **Vue Transition** (smooth 300ms opacity fade)
   ```vue
   <Transition name="preview-fade">
     <div v-show="showPreview" ref="previewContainerRef">
       <!-- Preview content -->
     </div>
   </Transition>
   ```

3. **Three Clear Functions:**
   - `clearActivePreview()` - 100ms debounce with animation (mouse leave)
   - `clearActivePreviewImmediate()` - Instant with animation + navigation flag
   - `clearActivePreviewInstant()` - Instant with animation, no navigation flag (scroll triggers)

4. **Hover Block** - 100ms cooldown after force hide prevents glitchy re-entry

### Aspect Ratio Detection

```typescript
interface PreloadedImage {
  img: HTMLImageElement
  aspectRatio: number
}

// Preload and detect natural dimensions
const img = new Image()
img.onload = () => {
  const aspectRatio = img.naturalWidth / img.naturalHeight
  preloadedImages.set(src, { img, aspectRatio })
}
```

### Navigation Integration

**Problem:** Component unmounting made refs null before clip animation could run.
**Solution:** Provide/inject pattern with callback-based navigation.

**Architecture:**
1. **Parent** (`InteractiveCaseStudySection`) provides `navigateWithAnimation` function
2. **Child** (`InteractiveCaseStudyItem`) intercepts clicks in capture phase
3. **Guard** (`onBeforeRouteLeave`) catches non-click navigation (back button, etc.)

**Child: Click Interception** (InteractiveCaseStudyItem.vue)
```typescript
const navigateWithAnimation = inject<((to: string) => void) | undefined>('navigateWithAnimation')

const handleClickCapture = (event: MouseEvent) => {
  // ALWAYS prevent default - we control navigation timing
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  if (navigateWithAnimation) {
    navigateWithAnimation(props.to)
  } else {
    // Fallback if injection failed
    router.push(props.to)
  }
}
```

**Parent: Animation + Navigation** (InteractiveCaseStudySection.vue)
```typescript
const navigateWithAnimation = (to: string) => {
  if (showPreview.value) {
    // Run clip-out animation, then navigate via callback
    clearActivePreviewImmediate(() => {
      router.push(to)
    })
  } else {
    router.push(to)
  }
}

provide('navigateWithAnimation', navigateWithAnimation)
```

**Guard: Non-Click Navigation** (back button, programmatic, etc.)
```typescript
onBeforeRouteLeave((_to, _from, next) => {
  if (showPreview.value && !isNavigating.value) {
    clearActivePreviewImmediate(() => next())
    return // Wait for animation
  }
  next()
})
```

### State Machine

```
IDLE → REVEALING → VISIBLE → CLOSING → IDLE
       ↓
       TRANSITIONING (item switch with different clip directions)
       ↓
       VISIBLE
```

**Transitions:**
- **FIRST_HOVER**: IDLE → REVEALING (initial reveal with chosen direction)
- **ITEM_SWITCH**: VISIBLE → TRANSITIONING (dual-clip with old→new directions)
- **RE_ENTRY**: IDLE → REVEALING (after leaving section, new random direction)
- **HOVER_EXIT**: VISIBLE → CLOSING (debounced 100ms, smooth clip close)
- **IMMEDIATE_CLEAR**: VISIBLE → CLOSING (navigation, no debounce)
- **INSTANT_CLEAR**: VISIBLE → IDLE (scroll triggers, smooth fade)

### Grid System

**Section:** `.content-grid`
**Title:** `.breakout3` (constrained)
**List:** `.full-width-content` (sub-grid)
**Item:** `.full-width-content` (nested sub-grid)
  - Border: `.full-width` (viewport span)
  - Content: `.breakout3` (constrained)

### Mobile Layout

- Square images (1:1 aspect ratio)
- Stacked vertically
- Scale effect on :active
- Page transition: `v-page-clip:bottom`

## Design Tokens

**Colors:**
- Title: `--theme-text-60`
- Text: `--theme-text-100`
- Border: `color-mix(in srgb, var(--theme-text-100) 10%, transparent)`
- Hover bg: `--theme-100`

**Timing:**
- Hover debounce: 100ms
- Clip animations: 350ms
- Aspect ratio morph: 400ms
- Vue fade transition: 300ms
- Easing: `power2.out`, `power2.in`, `power2.inOut`

**Spacing:**
- Item padding: `--space-s` (18-22px) → `--space-m` @ lg
- Content gap: `--space-m` → `--space-l` @ lg → `--space-xl` @ 2xl

## Debugging

**Console Logs** (useInteractiveCaseStudyPreview.ts):
```
🆕 [PREVIEW:ROUTE] FIRST_HOVER {"image":"..."}
🔄 [PREVIEW:STATE] IDLE → REVEALING (image: ..., direction: top)
🔄 [PREVIEW:STATE] REVEALING → VISIBLE
🔄 [PREVIEW:ROUTE] ITEM_SWITCH {"from":"...","to":"..."}
🔄 [PREVIEW:STATE] VISIBLE → TRANSITIONING (image: ...)
🔄 [PREVIEW:STATE] TRANSITIONING → VISIBLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ CLEAR INSTANT (Scroll) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 [PREVIEW:STATE] VISIBLE → CLOSING (scroll: true)
🔄 [PREVIEW:STATE] CLOSING → IDLE
```

**Direction Flow:**
- Moving DOWN list (1→2→3): direction = "top" (reveals from top)
- Moving UP list (3→2→1): direction = "bottom" (reveals from bottom)
- First hover or re-entry: direction = "top"

## Known Limitations

1. **Preview not visible on first hover:**
   - Check if `previewMounted.value` is true
   - Verify `showPreview.value` is true
   - Ensure Vue transition isn't blocking

2. **Preview stuck on screen:**
   - Should be fixed by scroll triggers + cursor failsafe
   - Check console for "CLEAR INSTANT" logs
   - Verify ScrollTrigger is initialized

3. **Direction seems wrong:**
   - Check console logs for item index values
   - Verify items have `.case-study-item` class
   - Ensure DOM order matches visual order

4. **Navigation happens before animation completes:**
   - Check console for debug logs: `🟡` (click captured) → `🔴` (navigateWithAnimation called) → `✅` (animation complete)
   - Missing `🔴` log = provide/inject failed (child didn't receive function)
   - Missing `✅` log = callback not firing from `clearActivePreviewImmediate`
   - Verify parent provides `navigateWithAnimation` before children mount

## Entrance & Scroll Animations

### Dual Animation Modes

The section supports two animation modes controlled by props:

**Props:**
- `animateEntrance` (Boolean, default: false) - Use entrance animation system (first load only, via setupEntrance)
- `animateOnScroll` (Boolean, default: true) - Use ScrollTrigger animation when scrolling into viewport
- `position` (String, default: '<-0.5') - GSAP position parameter for entrance timeline timing

### Scroll Animation (Default Mode)

**Goal:** Smooth stagger animation for title and items when section enters viewport, with bidirectional playback on scroll.

**Implementation:**
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GSAPTimeline = any

// Creates timeline with fromTo() for explicit start/end states
const createSectionAnimation = (): GSAPTimeline => {
  const tl = $gsap.timeline()

  // Title animation
  if (titleRef.value) {
    tl.fromTo(
      titleRef.value,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
  }

  // Items animation - targets .case-study-item selector (desktop only)
  if (itemsListRef.value) {
    const items = itemsListRef.value.querySelectorAll(".case-study-item")
    if (items.length > 0) {
      tl.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
        "<+0.2" // Start 0.2s after title animation begins
      )
    }
  }

  return tl
}

// ScrollTrigger with scrub for bidirectional playback
$ScrollTrigger.create({
  trigger: sectionRef.value,
  start: "top 80%",
  end: "bottom top+=25%",
  animation: scrollTimeline,
  scrub: 0.5,
  invalidateOnRefresh: true,
})
```

**Integration with Page Transitions:**

The scroll animation system works seamlessly with page transitions by:

1. **Kill-and-Recreate Pattern**: ScrollTrigger instance is killed and recreated after page transitions for fresh DOM queries
2. **Store-Based Timing**: Uses `pageTransitionStore.isTransitioning` and `loadingStore.isFirstLoad` for proper coordination (NO setTimeout hacks)
3. **Clearing Stale Styles**: `gsap.set()` with `clearProps: "all"` removes inline styles from page transition directives before creating timeline
4. **Explicit State Definition**: `.fromTo()` defines both start and end states, ensuring reliable animation regardless of current element state

**Critical Fix for Page Transitions:**
```typescript
// Clear inline GSAP styles from page transitions
// The v-page-stagger directive leaves inline styles (opacity, transform)
// These stale styles prevent scroll animations from working after transitions
if (titleRef.value) {
  $gsap.set(titleRef.value, { clearProps: "all" })
}
if (itemsListRef.value) {
  const items = itemsListRef.value.querySelectorAll(".case-study-item")
  if (items.length > 0) {
    $gsap.set(items, { clearProps: "all" })
  }
}
```

### Entrance Animation (Opt-In Mode)

When `animateEntrance: true`, the section uses the entrance animation system (InteractiveCaseStudySection.vue:258-266):

```vue
<InteractiveCaseStudySection animate-entrance :position="'<-0.3'">
  <!-- items -->
</InteractiveCaseStudySection>
```

**How it works:**
- Only runs on first load (via `html.is-first-load` class scoping)
- Uses `setupEntrance()` from entrance animation system
- Same `createSectionAnimation()` function as scroll mode
- CSS hides elements until animation plays (no FOUC)

### Design Decisions

- **Stagger timing**: 0.1s (similar to services in HeroSection)
- **Animation duration**: 0.6s (matches other entrance animations)
- **Y offset**: 40px (consistent with page transition system)
- **Trigger point**: 80% (items visible before animating)
- **Scrub**: 0.5s (smooth bidirectional playback)
- **End point**: "bottom top+=25%" (animation completes before section leaves viewport)

### Selector Specificity

**Critical**: Use `.case-study-item` selector, NOT `:scope > *`

**Why:**
- `.case-study-list` contains BOTH desktop (`.case-study-item`) AND mobile (`.case-study-card`) items
- Using `:scope > *` would query all 8 children (4 desktop + 4 mobile)
- Mobile items have `display: none` on desktop - can't animate hidden elements!

### Works With

- Page transition directives (`v-page-split:lines`, `v-page-stagger`)
- ScrollSmoother parallax effects
- Preview hover system
- Theme switching

---

**Status:** ✅ Stable & Production-Ready
**Last Updated:** 2026-01-29 (Slideshow feature added)
