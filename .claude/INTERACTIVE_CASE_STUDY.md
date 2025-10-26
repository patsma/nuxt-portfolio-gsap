# Interactive Case Study Gallery

Responsive portfolio gallery with cursor-following preview system and varied clip animations.

## Architecture

**Desktop (≥768px):** List layout + floating cursor-following preview
**Mobile (<768px):** Card layout with images

```
InteractiveCaseStudySection.vue
  ├─ useInteractiveCaseStudyPreview.js (state, animations, clip directions)
  ├─ calculatePreviewPosition() (viewport bounds, cursor offset)
  ├─ ScrollTrigger (scroll-based hiding with failsafe)
  └─ InteractiveCaseStudyItem.vue (inject preview controls)
```

## Key Features

- **Varied clip directions**: 5 reveal styles (center, left, right, top, bottom) + random
- **Dynamic aspect ratios**: Morphs between image sizes (400ms smooth transition)
- **Dual-image crossfade**: Current/next image wrappers for seamless transitions
- **Direction-aware animations**: Each item can have different clip reveal direction
- **Scroll-based hiding**: Smooth 300ms fade when scrolling out of section
- **Cursor failsafe**: Continuous monitoring prevents stuck previews
- **Navigation guard**: Delays navigation until clip animation completes
- **Module-level state**: Preloaded image cache persists across component instances

## Files

- `app/components/InteractiveCaseStudySection.vue` (195 lines)
- `app/components/InteractiveCaseStudyItem.vue` (204 lines)
- `app/composables/useInteractiveCaseStudyPreview.js` (893 lines)
- `app/utils/previewPosition.js` (153 lines)
- `app/utils/logger.js` (308 lines)
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

### With Specific Clip Directions
```vue
<InteractiveCaseStudySection>
  <template #title>Work</template>

  <!-- Reveal from left -->
  <InteractiveCaseStudyItem
    clip-direction="left"
    title="Project A"
    description="..."
    image="..."
    image-alt="..."
  />

  <!-- Reveal from bottom -->
  <InteractiveCaseStudyItem
    clip-direction="bottom"
    title="Project B"
    description="..."
    image="..."
    image-alt="..."
  />

  <!-- Random direction (default) -->
  <InteractiveCaseStudyItem
    title="Project C"
    description="..."
    image="..."
    image-alt="..."
  />
</InteractiveCaseStudySection>
```

### Props (InteractiveCaseStudyItem)

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | String | Yes | - | Project title |
| `tag` | String | No | - | Label like "APP", "INTRANET" |
| `description` | String | Yes | - | Role/description text |
| `image` | String | Yes | - | Image path |
| `image-alt` | String | Yes | - | Alt text for accessibility |
| `to` | String | No | "/contact" | Navigation path |
| `clip-direction` | String | No | "random" | Animation direction (see below) |

#### Clip Direction Options

- **`center`** - Classic reveal from center (50% inset → 0%)
- **`left`** - Slide in from left edge
- **`right`** - Slide in from right edge
- **`top`** - Slide down from top
- **`bottom`** - Slide up from bottom
- **`random`** - Randomly picks one of the above (adds variety)

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
```javascript
center: { closed: "inset(50% 50% 50% 50%)", open: "inset(0% 0% 0% 0%)" }
left:   { closed: "inset(0% 100% 0% 0%)",    open: "inset(0% 0% 0% 0%)" }
right:  { closed: "inset(0% 0% 0% 100%)",    open: "inset(0% 0% 0% 0%)" }
top:    { closed: "inset(0% 0% 100% 0%)",    open: "inset(0% 0% 0% 0%)" }
bottom: { closed: "inset(100% 0% 0% 0%)",    open: "inset(0% 0% 0% 0%)" }
```

**Size:**
- Width: 35vw (40vw @ lg), max 30em (40em @ lg)
- Max height: 80vh
- Dynamic aspect ratio bound via inline style

### Scroll-Based Hiding

**Problem:** Preview getting stuck on screen when quickly scrolling out of section.

**Solution:** Multi-layered failsafe system:

1. **ScrollTrigger Integration** (InteractiveCaseStudySection.vue:155-194)
   ```javascript
   $ScrollTrigger.create({
     trigger: sectionRef.value,
     start: "top top",
     end: "bottom bottom",
     onLeave: () => clearActivePreviewInstant(),      // Scroll down
     onLeaveBack: () => clearActivePreviewInstant(),  // Scroll up
     onUpdate: () => {
       // Continuous cursor position monitoring
       if (cursor outside section bounds) {
         clearActivePreviewInstant();
       }
     }
   });
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

```javascript
// Preload and detect natural dimensions
const img = new Image();
img.onload = () => {
  const aspectRatio = img.naturalWidth / img.naturalHeight;
  preloadedImages.set(src, { img, aspectRatio });
};
```

### Navigation Integration

**Problem:** Component unmounting made refs null before clip animation could run.
**Solution:** `onBeforeRouteLeave` guard blocks navigation for 350ms.

```javascript
onBeforeRouteLeave((to, from, next) => {
  if (showPreview.value) {
    clearActivePreviewImmediate();
    setTimeout(() => next(), 350); // Keep component mounted
  } else {
    next();
  }
});
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

**Console Logs** (useInteractiveCaseStudyPreview.js):
```
🆕 [PREVIEW:ROUTE] FIRST_HOVER {"image":"..."}
🔄 [PREVIEW:STATE] IDLE → REVEALING (image: ..., direction: left)
🔄 [PREVIEW:STATE] REVEALING → VISIBLE
🔄 [PREVIEW:ROUTE] ITEM_SWITCH {"from":"...","to":"..."}
🔄 [PREVIEW:STATE] VISIBLE → TRANSITIONING (image: ...)
🔄 [PREVIEW:STATE] TRANSITIONING → VISIBLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ CLEAR INSTANT (Scroll) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 [PREVIEW:STATE] VISIBLE → CLOSING (scroll: true)
🔄 [PREVIEW:STATE] CLOSING → IDLE
```

## Known Limitations

1. **Preview not visible on first hover:**
   - Check if `previewMounted.value` is true
   - Verify `showPreview.value` is true
   - Ensure Vue transition isn't blocking

2. **Preview stuck on screen:**
   - Should be fixed by scroll triggers + cursor failsafe
   - Check console for "CLEAR INSTANT" logs
   - Verify ScrollTrigger is initialized

3. **Clip direction not working:**
   - Verify prop value is valid ('center', 'left', 'right', 'top', 'bottom', 'random')
   - Check console logs for resolved direction
   - Ensure GSAP is available

## Next Steps (Upcoming Features)

### Entrance Animations on Scroll

Similar to HeroSection.vue but triggered when scrolling into view:

**Goal:** Smooth stagger animation for all items when section enters viewport

**Approach:**
```javascript
// InteractiveCaseStudySection.vue
onMounted(() => {
  if (!$ScrollTrigger) return;

  const items = sectionRef.value.querySelectorAll('.case-study-item');

  $ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 80%', // When section is 80% down viewport
    once: true,       // Only animate once
    onEnter: () => {
      $gsap.from(items, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }
  });
});
```

**Integration Points:**
- Works alongside existing hover/preview system
- Respects `html.is-first-load` for first load vs navigation
- Uses existing design tokens for timing
- No conflicts with page transition directives

**Design Decisions:**
- Stagger timing: 0.1s (similar to services in HeroSection)
- Animation duration: 0.6s (matches button animation)
- Y offset: 40px (consistent with other entrance animations)
- Trigger point: 80% (items visible before animating)

---

**Status:** ✅ Stable & Production-Ready
**Last Updated:** 2025-10-27
