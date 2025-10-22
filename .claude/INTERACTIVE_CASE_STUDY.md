# Interactive Case Study Gallery

Responsive portfolio gallery with hover-based preview system for showcasing work.

## Overview

Desktop: Two-column list layout with floating image preview
Mobile: Square image cards with touch-friendly interactions

**Key Features:**
- Full-width borders and hover backgrounds
- Theme-aware colors with smooth transitions
- Fluid spacing using design tokens
- Professional grid system (Layout Breakouts pattern)
- Clip-path reveal animations

## Current Implementation (Phase 1) ✅

### Architecture

**Component Structure:**
```
InteractiveCaseStudySection.vue (container)
  ├─ Section title with v-page-split animation
  ├─ Case study list (full-width-content sub-grid)
  │   └─ InteractiveCaseStudyItem.vue (repeating)
  └─ Preview container (absolute, clip-path reveal)
```

**Grid System:**
- Section: `.content-grid`
- Title: `.breakout3` (direct child)
- List: `.full-width-content` (creates sub-grid)
- Items: `.full-width-content` (nested sub-grid)
  - Border: `.full-width` (spans viewport)
  - Content: `.breakout3` (constrained)

**Responsive Behavior:**
- Desktop (≥768px): List layout + hover preview
- Mobile (<768px): Card layout with images
- CSS scoped to `@include bp.up(bp.$bp-md)` to prevent desktop leakage

### Desktop Layout

**Two-column list:**
- Left: Title + Tag
- Right: Description
- Full-width border line (top of item)
- Full-width hover background (`--theme-100`)

**Preview System:**
- Centered absolute positioning
- Clip-path reveal animation (50% inset → 0%)
- Transition: `var(--duration-hover)` with `var(--ease-power2)`
- Image sizing: 50vw width, max 700px (lg: 45vw, max 800px)
- Aspect ratio: 4:3
- Pointer-events: none (allows clicks through to list)

### Mobile Layout

**Card structure:**
- Square images (1:1 aspect ratio, 320x320 design)
- Stacked vertically
- Touch-friendly with scale effect on :active
- Page transition: `v-page-clip:bottom`

**Spacing (fluid tokens):**
- Card gap: `--space-2xs` (9-11px)
- Card margin: `--space-s` (18-22px)
- Content gap: `--space-3xs` (5-6px)
- Header gap: `--space-3xs-2xs` (5-11px)

### Theme Integration

**Colors:**
- Title: `--theme-text-60`
- Text: `--theme-text-100`
- Tags: `--theme-text-60`
- Border: `color-mix(in srgb, var(--theme-text-100) 10%, transparent)`
- Hover bg: `--theme-100` (white in light, black in dark)

**Transitions:**
- Duration: `--duration-hover` (300ms)
- Easing: `--ease-power2` (cubic-bezier)

### Design Tokens Usage

**Typography:**
- Section title: `var(--step-1)` (12-16px fluid)

**Spacing:**
- Item padding: `var(--space-s)` (18-22px) → `var(--space-m)` at lg (27-33px)
- Border margin: `var(--space-s)` (18-22px)
- Content gap: `var(--space-m)` (27-33px) → `var(--space-l)` at lg (36-44px) → `var(--space-xl)` at 2xl (54-66px)
- Title/tag gap: `var(--space-2xs)` (9-11px)

## Files

**Components:**
- `app/components/InteractiveCaseStudySection.vue` (100 lines)
- `app/components/InteractiveCaseStudyItem.vue` (193 lines)

**Styles:**
- `app/assets/css/components/interactive-case-study.scss` (266 lines)

**Grid System:**
- `app/assets/css/components/content-grid.scss` (with nested breakout support)

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

  <InteractiveCaseStudyItem
    title="Maj"
    description="Art direction & UI"
    image="/images/projects/maj.jpg"
    image-alt="Maj project preview"
    to="/work/maj"
  />
</InteractiveCaseStudySection>
```

**Props (InteractiveCaseStudyItem):**
- `title` (required): Project title
- `tag` (optional): Label like "APP", "INTRANET"
- `description` (required): Role/description
- `image` (required): Image path
- `image-alt` (required): Alt text for accessibility
- `to` (default: "/contact"): Navigation path

## Grid System Fixes Applied

**Problem:** Nested sub-grids couldn't access grid classes properly

**Solution:** Enhanced `content-grid.scss` with:

1. **Fixed `.full-width` in nested grids:**
```scss
/* Before */
.full-width-content > :not(.breakout, .full-width-content) {
  grid-column: content;
}

/* After - added .full-width to exclusion */
.full-width-content > :not(.breakout, .full-width, .full-width-content) {
  grid-column: content;
}
```

2. **Added nested breakout rules:**
```scss
.full-width-content > .breakout1 {
  grid-column: breakout-start1 / breakout-end1;
}
/* ...breakout2, breakout3, breakout4 */
```

**Result:** Universal grid system that works at any nesting level

---

## Phase 2: Floating Preview Enhancement 🎯

### Goals

Transform static centered preview into fluid, cursor-following preview with smooth image transitions.

### Planned Features

1. **Cursor-Following Preview**
   - Preview floats near hovered item (not fixed center)
   - Smooth movement with lag/easing
   - Follows mouse cursor within section bounds

2. **Smooth Image Transitions**
   - Crossfade effect when swapping images
   - No instant "pop" between images
   - Preload images for instant display

3. **Performance Optimization**
   - 60fps cursor tracking
   - GPU-accelerated transforms
   - Minimal layout thrashing
   - Works smoothly on mid-range devices

### Technical Approach (GSAP-based)

**Research Source:** Context7 GSAP documentation

**Recommended Technique: Crossfade**
- Two image elements in preview container
- Animate opacity for smooth swap
- Use `will-change: transform` for performance
- GSAP quickSetter for cursor tracking

**Cursor Tracking:**
```javascript
// Smooth follow with lag
$gsap.to(previewRef.value, {
  x: cursorX,
  y: cursorY,
  xPercent: -50,
  yPercent: -50,
  duration: 0.6,
  ease: "power2.out"
});
```

**Image Transition:**
```javascript
// Crossfade pattern
$gsap.to(currentImage, { opacity: 0, duration: 0.4 });
$gsap.to(nextImage, { opacity: 1, duration: 0.4 });
```

**Alternative Techniques:**
- FLIP plugin (more complex, smoother for layout changes)
- Clip-path morphing (already using, can enhance)
- Scale + opacity combo (more dynamic feel)

### Implementation Checklist

**InteractiveCaseStudySection.vue:**
- [ ] Add mousemove listener on section
- [ ] Track cursor position (reactive state)
- [ ] Animate preview position with GSAP
- [ ] Implement dual-image crossfade
- [ ] Add image preloading logic
- [ ] Handle section bounds/constraints

**interactive-case-study.scss:**
- [ ] Remove centered absolute positioning
- [ ] Add dual-image container structure
- [ ] Add performance hints (will-change)
- [ ] Ensure z-index layering works

**InteractiveCaseStudyItem.vue:**
- [ ] Enhance hover handlers with preload
- [ ] Add hover intent detection (optional)
- [ ] Emit image URLs to parent

### Performance Budget

- **Target:** 60fps cursor tracking
- **Image transition:** <400ms
- **No layout thrashing**
- **Smooth on mid-range devices**

### Open Questions

1. Should preview stay within section bounds or allow overflow?
2. Hover intent delay to prevent accidental triggers?
3. Parallax effect on preview image? (like ImageScalingSection)
4. Different cursor offset for mobile-sized viewports?

---

## Notes

- Component follows all patterns from `.claude/CLAUDE.md`
- Grid system now universally reusable (Layout Breakouts pattern)
- All spacing uses fluid design tokens
- Theme-aware with GSAP transitions
- Fully accessible (alt text, semantic HTML, keyboard navigation via NuxtLink)
