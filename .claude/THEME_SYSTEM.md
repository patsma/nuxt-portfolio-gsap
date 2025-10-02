# Theme System Documentation

## Overview

This project uses a comprehensive, GSAP-powered theme switching system with smooth color transitions. All colors, durations, and easing functions are centralized in design tokens for consistent, maintainable theming.

## Architecture

### Single Source of Truth

All theme-related tokens are defined in **one place**: `app/assets/css/tokens/theme.scss`

### Color System

#### Base Colors (Static Definitions)
Located in `@theme` directive in `theme.scss`:

```scss
/* Dark palette (used for text on light theme, bg on dark theme) */
--color-dark-100: rgba(9, 9, 37, 1);
--color-dark-60: rgba(9, 9, 37, 0.6);
--color-dark-50: rgba(9, 9, 37, 0.5);
--color-dark-40: rgba(9, 9, 37, 0.4);
--color-dark-30: rgba(9, 9, 37, 0.3);
--color-dark-15: rgba(9, 9, 37, 0.15);
--color-dark-5: rgba(9, 9, 37, 0.05);

/* Light palette (used for bg on light theme, text on dark theme) */
--color-light-100: rgba(255, 250, 245, 1);
--color-light-60: rgba(255, 250, 245, 0.6);
--color-light-50: rgba(255, 250, 245, 0.5);
--color-light-40: rgba(255, 250, 245, 0.4);
--color-light-30: rgba(255, 250, 245, 0.3);
--color-light-15: rgba(255, 250, 245, 0.15);
--color-light-5: rgba(255, 250, 245, 0.05);
```

#### Runtime Theme Variables
Located in `:root` (outside `@theme`) in `theme.scss` - animated by GSAP:

```scss
/* Background colors - inverted for accent visibility */
--theme-100: var(--color-light-100);  /* Main background */
--theme-60: var(--color-light-60);    /* Accent backgrounds (INVERTED) */
--theme-50: var(--color-light-50);    /* Accent backgrounds (INVERTED) */
--theme-40: var(--color-light-40);    /* Accent backgrounds (INVERTED) */
--theme-30: var(--color-light-30);    /* Accent backgrounds (INVERTED) */
--theme-15: var(--color-light-15);    /* Accent backgrounds (INVERTED) */
--theme-5: var(--color-light-5);      /* Accent backgrounds (INVERTED) */

/* Text colors */
--theme-text-100: var(--color-dark-100);
--theme-text-60: var(--color-dark-60);
--theme-text-50: var(--color-dark-50);
--theme-text-40: var(--color-dark-40);
--theme-text-30: var(--color-dark-30);
--theme-text-15: var(--color-dark-15);
--theme-text-5: var(--color-dark-5);
```

**Important: Inverted Accent Colors**
- `--theme-100` is the main background color
- `--theme-60`, `--theme-50`, etc. use the **opposite** (text) color with opacity
- This ensures accent backgrounds are always visible:
  - Light theme: light bg + dark accent backgrounds
  - Dark theme: dark bg + light accent backgrounds

### Transition Timing

All animation durations and easing functions are defined as design tokens:

```scss
/* Durations */
--duration-theme: 600ms;  /* GSAP theme color transitions */
--duration-hover: 300ms;  /* Interactive hover effects */
--duration-fast: 150ms;   /* Quick UI feedback */
--duration-slow: 800ms;   /* Dramatic reveals */

/* Easing functions */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);           /* Standard ease */
--ease-power2: cubic-bezier(0.455, 0.03, 0.515, 0.955); /* GSAP power2.inOut exact match */
--ease-out: cubic-bezier(0, 0, 0.2, 1);                /* Deceleration */
--ease-in: cubic-bezier(0.4, 0, 1, 1);                 /* Acceleration */
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);/* Bounce */
```

## Implementation

### GSAP Animation (`app/composables/useThemeSwitch.js`)

The theme switcher:
1. **Reads colors from CSS** via `getComputedStyle()` - single source of truth
2. **Animates RGB proxy object** - GSAP can't directly animate CSS custom properties
3. **Updates CSS variables on every frame** via `onUpdate` callback
4. **Syncs with icon animation** using same duration

Key code:
```javascript
// Read colors from CSS
const colors = { light: {}, dark: {} };
colorVariants.forEach((variant) => {
  const lightStr = getComputedStyle(html).getPropertyValue(`--color-light-${variant}`).trim();
  const darkStr = getComputedStyle(html).getPropertyValue(`--color-dark-${variant}`).trim();
  colors.light[variant] = parseRgba(lightStr);
  colors.dark[variant] = parseRgba(darkStr);
});

// Read duration from CSS
const themeDuration = parseFloat(getComputedStyle(html).getPropertyValue("--duration-theme")) / 1000 || 0.6;

// Animate proxy object
const colorProxy = { bgR, bgG, bgB, textR, textG, textB };
tl.to(colorProxy, {
  bgR: colors.dark["100"].r,
  bgG: colors.dark["100"].g,
  bgB: colors.dark["100"].b,
  textR: colors.light["100"].r,
  textG: colors.light["100"].g,
  textB: colors.light["100"].b,
  duration: themeDuration,
  ease: "power2.inOut",
  onUpdate: () => {
    // Update ALL theme variables with interpolated colors
    html.style.setProperty("--theme-100", toRgba(bgR, bgG, bgB, 1));
    html.style.setProperty("--theme-60", toRgba(textR, textG, textB, 0.6));
    // ... all variants
  }
});
```

### Hover Effects: CSS vs GSAP

**Critical Rule:** Theme-aware color hover effects MUST use GSAP, not CSS transitions.

#### Why CSS Transitions Fail for Theme Colors

CSS cannot smoothly animate `color: var(--theme-text-100)` because:
1. GSAP animates the CSS variable value (`--theme-text-100`) at 600ms
2. CSS transition on `color` property tries to animate at the same time
3. Result: Double transitions, sluggish feel, timing conflicts

**CSS transitions on color properties are FORBIDDEN when using theme variables.**

#### GSAP Hover Pattern (Required for Theme Colors)

Use GSAP to animate **opacity**, not color:

```javascript
// In GSAP context (onMounted)
const html = document.documentElement;
const hoverDuration = parseFloat(getComputedStyle(html).getPropertyValue("--duration-hover")) / 1000 || 0.3;

const navLinks = containerRef.value.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  const isActive = link.getAttribute("data-active") === "true";

  // Set initial opacity
  $gsap.set(link, { opacity: isActive ? 0.5 : 1 });

  if (!isActive) {
    link.addEventListener("mouseenter", () => {
      $gsap.to(link, {
        opacity: 0.5,
        duration: hoverDuration,
        ease: "power2.inOut",
      });
    });

    link.addEventListener("mouseleave", () => {
      $gsap.to(link, {
        opacity: 1,
        duration: hoverDuration,
        ease: "power2.inOut",
      });
    });
  }
});
```

**Why this works:**
- Element always uses `text-[var(--theme-text-100)]` (full color)
- GSAP animates **opacity** (numeric 0-1) which it interpolates perfectly
- Visual effect: Fading to 50% = same as `var(--theme-text-50)`
- No CSS transition conflicts
- Perfect sync with theme toggle

#### CSS Transitions (Only for Non-Color Properties)

Global utility class in `app/assets/css/post.css`:

```scss
@utility transition-theme-color {
  transition: var(--transition-hover-color);
}
```

**Use CSS transitions ONLY for:**
- `transform`, `scale`, `rotate`
- `box-shadow`
- `border-width`, `border-radius`
- `opacity` (if not theme-aware)
- Static colors (non-theme variables)

**NEVER use CSS transitions for:**
- `color` when using `var(--theme-text-*)`
- `background-color` when using `var(--theme-*)`
- Any property that references theme variables

### Tailwind v4 Integration

**Using theme colors:**
```vue
<!-- Correct -->
<div class="bg-[var(--theme-100)]">
<p class="text-[var(--theme-text-100)]">
<div class="border-[var(--theme-text-15)]">

<!-- WRONG - Tailwind v4 doesn't generate utilities from CSS vars -->
<div class="bg-theme-100">  <!-- ❌ This doesn't work -->
```

**Using transition durations:**
```vue
<!-- Correct -->
<div class="after:transition-[width] after:duration-[var(--duration-hover)] after:ease-[var(--ease-out)]">

<!-- Avoid hardcoded values -->
<div class="duration-300">  <!-- ❌ Not consistent with theme -->
```

## Key Components

### `app/components/ThemeToggleSVG.vue`
Theme toggle icon (sun/moon morphing animation)
- All colors use theme variables: `var(--theme-100)`, `var(--theme-text-100)`, etc.
- CSS hides `#sun-dark` and `#moon-dark` initially to prevent flash
- GSAP animates morphing and color changes

### `app/components/HeaderGrid.vue`
Navigation header with theme-aware styling
- Background: `var(--theme-100)`
- Text: `var(--theme-text-100)`
- Hamburger icon reads `--duration-hover` for animation timing
- Navigation underlines use theme colors and timing variables

### `app/components/SVG/HamburgerSVG.vue`
Mobile menu hamburger icon
- All strokes use `var(--theme-text-100)`
- Animates with DrawSVGPlugin

### `app/assets/css/components/header-grid.scss`
Header layout and theming
- Background transition: `background-color var(--duration-theme) ease`
- All colors reference theme variables

## Usage Guidelines

### Adding New Components

1. **Use theme color variables:**
   ```vue
   <div class="bg-[var(--theme-5)]">
     <h1 class="text-[var(--theme-text-100)]">Heading</h1>
     <p class="text-[var(--theme-text-60)]">Body text</p>
   </div>
   ```

2. **Theme-aware hover colors (REQUIRED: Use GSAP):**
   ```vue
   <!-- Template: All links use full color, opacity controlled by GSAP -->
   <a class="nav-link text-[var(--theme-text-100)]" :data-active="isActive">
     Link text
   </a>
   ```
   ```javascript
   // Script: GSAP handles opacity animation
   const links = containerRef.value.querySelectorAll(".nav-link");
   const hoverDuration = parseFloat(getComputedStyle(html).getPropertyValue("--duration-hover")) / 1000;

   links.forEach((link) => {
     const isActive = link.getAttribute("data-active") === "true";
     $gsap.set(link, { opacity: isActive ? 0.5 : 1 });

     if (!isActive) {
       link.addEventListener("mouseenter", () => {
         $gsap.to(link, { opacity: 0.5, duration: hoverDuration, ease: "power2.inOut" });
       });
       link.addEventListener("mouseleave", () => {
         $gsap.to(link, { opacity: 1, duration: hoverDuration, ease: "power2.inOut" });
       });
     }
   });
   ```

3. **Non-color hover effects (CSS transitions OK):**
   ```vue
   <button class="transition-[transform,box-shadow] duration-[var(--duration-hover)] hover:shadow-lg hover:scale-105">
     Click me
   </button>
   ```

4. **For custom GSAP animations:**
   ```javascript
   const duration = parseFloat(getComputedStyle(html).getPropertyValue("--duration-hover")) / 1000;
   gsap.to(element, { x: 100, duration, ease: "power2.inOut" });
   ```

### Changing Theme Timing Globally

Want faster/slower theme transitions? Change one value:

```scss
/* In theme.scss */
--duration-theme: 400ms;  /* Was 600ms - now all theme transitions are faster */
```

This automatically updates:
- ✅ All GSAP color animations
- ✅ All CSS fallback transitions
- ✅ SVG icon morphing
- ✅ Any custom code reading the variable

### Color Variants Reference

| Variable | Light Theme | Dark Theme | Usage |
|----------|-------------|------------|-------|
| `--theme-100` | Light BG | Dark BG | Main background |
| `--theme-60` | Dark 60% | Light 60% | Accent backgrounds |
| `--theme-50` | Dark 50% | Light 50% | Accent backgrounds |
| `--theme-40` | Dark 40% | Light 40% | Accent backgrounds |
| `--theme-30` | Dark 30% | Light 30% | Accent backgrounds |
| `--theme-15` | Dark 15% | Light 15% | Subtle backgrounds, borders |
| `--theme-5` | Dark 5% | Light 5% | Very subtle backgrounds |
| `--theme-text-100` | Dark | Light | Primary text |
| `--theme-text-60` | Dark 60% | Light 60% | Secondary text |
| `--theme-text-50` | Dark 50% | Light 50% | Tertiary text |
| `--theme-text-40` | Dark 40% | Light 40% | Muted text |
| `--theme-text-30` | Dark 30% | Light 30% | Very muted text |
| `--theme-text-15` | Dark 15% | Light 15% | Barely visible text |
| `--theme-text-5` | Dark 5% | Light 5% | Nearly invisible text |

## Testing

Test page: `/dev/colors`
- Displays all color variants (text and background)
- Shows smooth transitions when toggling theme
- Demonstrates hover effects on cards

## Troubleshooting

### Colors don't transition smoothly during theme toggle
- Check if element has CSS transition on color/background-color
- Remove `transition-all` and use `.transition-hover` instead
- Only non-color properties should have CSS transitions

### Hover effects too slow/fast or jumping (not smooth)
- **If using theme colors:** Remove CSS transitions, use GSAP opacity animation pattern
- Check if hardcoded durations exist (search for `duration-\d+`)
- Replace with `var(--duration-hover)` read via `getComputedStyle()`
- Verify easing matches GSAP: `ease: "power2.inOut"`

### Theme toggle icon doesn't change colors
- Verify SVG uses `:style="{ fill: 'var(--theme-text-100)' }"` not hardcoded colors
- Check `useThemeSwitch.js` is initialized in component

### Elements flash before theme loads
- Add CSS to hide elements that GSAP will show: `opacity: 0; visibility: hidden;`
- Example: `#sun-dark`, `#moon-dark` in ThemeToggleSVG.vue

## Files Reference

### Core Files
- `app/assets/css/tokens/theme.scss` - All design tokens
- `app/assets/css/base/base.scss` - Global utilities (`.transition-hover`)
- `app/composables/useThemeSwitch.js` - GSAP theme animation logic

### Components
- `app/components/ThemeToggleSVG.vue` - Theme toggle icon
- `app/components/HeaderGrid.vue` - Navigation header
- `app/components/SVG/HamburgerSVG.vue` - Mobile menu icon
- `app/assets/css/components/header-grid.scss` - Header styles

### Test Pages
- `app/pages/dev/colors.vue` - Color system showcase
- `app/components/SmoothDemo.vue` - Demo with theme colors
- `app/components/SmoothDemoAlt.vue` - Alternative demo layout

## Benefits of This System

✅ **Single source of truth** - Change colors/timing in one place
✅ **Smooth animations** - GSAP handles all color transitions
✅ **No conflicts** - CSS and GSAP transitions don't fight
✅ **Maintainable** - No hardcoded colors or durations scattered in code
✅ **Type-safe** - CSS variables provide consistent naming
✅ **Performant** - GSAP animates efficiently, CSS vars update on GPU
✅ **Accessible** - respects user's color preferences (can be extended)

## Future Enhancements

Potential additions:
- [ ] localStorage persistence of theme preference
- [ ] Respect `prefers-color-scheme` media query
- [ ] Multiple theme variants (not just light/dark)
- [ ] Per-component theme overrides
- [ ] Theme transition disable for `prefers-reduced-motion`
