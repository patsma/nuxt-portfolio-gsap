# Interactive Case Study Gallery

Responsive portfolio gallery with cursor-following preview system.

## Architecture

**Desktop (≥768px):** List layout + floating cursor-following preview
**Mobile (<768px):** Card layout with images

```
InteractiveCaseStudySection.vue
  ├─ useInteractiveCaseStudyPreview.js (state, animations, aspect ratio detection)
  ├─ calculatePreviewPosition() (viewport bounds, cursor offset)
  └─ InteractiveCaseStudyItem.vue (inject preview controls)
```

## Key Features

- **Dynamic aspect ratios**: Morphs between image sizes (400ms smooth transition)
- **Dual-image crossfade**: Current/next image wrappers for seamless transitions
- **Clip-path animations**: 50% inset ↔ 0% (350ms)
- **Navigation guard**: Delays navigation until clip animation completes (prevents instant disappear)
- **Scroll failsafe**: Hides preview during fast scrolling if cursor outside section
- **Module-level state**: Preloaded image cache persists across component instances

## Files

- `app/components/InteractiveCaseStudySection.vue` (178 lines)
- `app/components/InteractiveCaseStudyItem.vue` (193 lines)
- `app/composables/useInteractiveCaseStudyPreview.js` (714 lines)
- `app/utils/previewPosition.js` (153 lines)
- `app/utils/logger.js` (308 lines)
- `app/assets/css/components/interactive-case-study.scss` (286 lines)

## Usage

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

**Props (InteractiveCaseStudyItem):**
- `title` (required): Project title
- `tag` (optional): Label like "APP", "INTRANET"
- `description` (required): Role/description
- `image` (required): Image path
- `image-alt` (required): Alt text
- `to` (default: "/contact"): Navigation path
- `clip-direction` (default: "random"): Clip animation direction ('center', 'left', 'right', 'top', 'bottom', 'random')

## Technical Details

### Desktop Preview

**Positioning:**
- Teleported to body (fixed positioning for scroll support)
- Offset: 30px right, centered vertically on cursor
- `transform-origin: 0 0` (top-left) for correct GSAP positioning
- `getBoundingClientRect()` accounts for ScrollSmoother transforms

**Animations:**
- Cursor follow: 0.6s power2.out lag effect
- Clip reveal/close: 350ms power2.inOut (direction-aware)
- Aspect ratio morph: 400ms power2.inOut
- Crossfade: Dual-image wrappers with opacity
- Clip directions: center (50% inset), left, right, top, bottom

**Size:**
- Width: 35vw (40vw @ lg), max 30em (40em @ lg)
- Max height: 80vh
- Dynamic aspect ratio bound via inline style

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

**Problem:** Component unmounting made refs null before clip animation could run
**Solution:** `onBeforeRouteLeave` guard blocks navigation for 350ms

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
       TRANSITIONING (item switch)
       ↓
       VISIBLE
```

**Transitions:**
- FIRST_HOVER: IDLE → REVEALING (initial)
- ITEM_SWITCH: VISIBLE → TRANSITIONING (dual-clip crossfade)
- RE_ENTRY: IDLE → REVEALING (after leaving section)
- HOVER_EXIT: VISIBLE → CLOSING (debounced 100ms)
- IMMEDIATE_CLEAR: VISIBLE → CLOSING (navigation, no debounce)

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
- Hover: `--duration-hover` (300ms)
- Easing: `--ease-power2` (cubic-bezier)

**Spacing:**
- Item padding: `--space-s` (18-22px) → `--space-m` @ lg
- Content gap: `--space-m` → `--space-l` @ lg → `--space-xl` @ 2xl
