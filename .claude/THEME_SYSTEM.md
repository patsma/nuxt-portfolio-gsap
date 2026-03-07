# Theme System

GSAP-animated dark/light theme with localStorage persistence and SSR compatibility.

## Architecture

**Single source of truth:** `app/assets/css/tokens/theme.scss`

### Color System

**Base colors** (static, defined in `@theme` directive):
- `--color-dark-100` through `--color-dark-5` (opacity variants)
- `--color-light-100` through `--color-light-5` (opacity variants)

**Runtime theme variables** (animated by GSAP):

| Variable | Light Theme | Dark Theme | Usage |
|----------|-------------|------------|-------|
| `--theme-100` | Light BG | Dark BG | Main background |
| `--theme-60` | Dark 60% | Light 60% | Accent backgrounds (inverted) |
| `--theme-text-100` | Dark | Light | Primary text |
| `--theme-text-60` | Dark 60% | Light 60% | Secondary text |

**Important:** Accent backgrounds (`--theme-60`, `--theme-50`, etc.) use the opposite color palette with opacity for visibility.

### Transition Timing

```scss
--duration-theme: 600ms;   // GSAP theme transitions
--duration-hover: 300ms;   // CSS hover effects
--duration-fast: 150ms;    // Quick UI feedback
--duration-slow: 800ms;    // Dramatic reveals

--ease-power2: cubic-bezier(0.455, 0.03, 0.515, 0.955); // GSAP match
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

### Border Widths

```scss
--border-width-thin: 1px;
--border-width-default: 2px;
--border-width-thick: 4px;
```

## Font Configuration

**Single source of truth:** `app/app.config.ts`

The font system uses `@nuxt/fonts` for automatic font loading and a client plugin to apply fonts at runtime via CSS variables.

### Configuration

Edit `app.config.ts` to change fonts:

```typescript
export default defineAppConfig({
  fonts: {
    // Display font for headings (serif)
    display: 'Fraunces',
    // Body font for paragraphs and UI (sans-serif)
    body: 'Inter'
  },
  // ... rest of config
})
```

### How It Works

**File:** `app/plugins/fonts.client.ts`

1. Plugin runs on `app:mounted` hook (after DOM and CSS are ready)
2. Reads font names from `useAppConfig().fonts`
3. Sets CSS variables with proper fallback stacks:
   - `--font-display` - Display/heading font (serif fallbacks)
   - `--font-body` - Body text font (sans-serif fallbacks)
   - `--font-sans` - Alias for body font

```typescript
// Plugin applies font stacks like:
html.style.setProperty(
  '--font-display',
  '"Fraunces", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
)
```

`@nuxt/fonts` automatically detects font names and downloads them from Google Fonts (or other providers).

### Recommended Fonts

**Display fonts (serif):**
- `Fraunces` - Variable optical size, great for large headings
- `Instrument Serif` - Elegant, classic feel
- `Playfair Display` - High contrast, editorial
- `Cormorant` - Refined, book-like

**Body fonts (sans-serif):**
- `Inter` - Highly readable, excellent for UI
- `DM Sans` - Geometric, clean
- `IBM Plex Sans` - Professional, versatile
- `Source Sans 3` - Adobe's open-source workhorse

### Usage in CSS

Typography utility classes use these CSS variables:

```scss
// In theme.scss
--font-display: "Fraunces", ui-serif, Georgia, serif;
--font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-sans: var(--font-body);
```

```vue
<!-- Tailwind arbitrary values -->
<h1 class="font-[var(--font-display)]">Heading</h1>
<p class="font-[var(--font-body)]">Body text</p>
```

### Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Font doesn't change | Plugin cached | Hard reload (Cmd+Shift+R) |
| Font not loading | @nuxt/fonts can't find it | Check font name spelling, try Google Fonts URL directly |
| FOUT (flash of unstyled text) | Font loading delay | Normal behavior; @nuxt/fonts handles font-display |
| CSS variables empty | Plugin didn't run | Ensure fonts.client.ts exists, check console for errors |
| Wrong font on first load | SSR/hydration mismatch | Expected - plugin runs client-side only |

**After changing fonts:** Restart dev server (`npm run dev`) to ensure @nuxt/fonts detects the new font names.

## Implementation

### GSAP Animation Pattern

**File:** `app/composables/useThemeSwitch.ts`

**Pattern:** Read colors from CSS → Animate RGB proxy object → Update CSS variables on every frame

```typescript
interface RGBAColor {
  r: number
  g: number
  b: number
  a: number
}

// Read colors from CSS
const colors: { light: Record<string, RGBAColor>; dark: Record<string, RGBAColor> } = { light: {}, dark: {} }
colorVariants.forEach((variant) => {
  const lightStr = getComputedStyle(html).getPropertyValue(`--color-light-${variant}`)
  colors.light[variant] = parseRgba(lightStr)
})

// Animate proxy
const colorProxy = { bgR, bgG, bgB, textR, textG, textB }
tl.to(colorProxy, {
  bgR: colors.dark["100"].r,
  duration: themeDuration,
  ease: "power2.inOut",
  onUpdate: () => {
    html.style.setProperty("--theme-100", toRgba(bgR, bgG, bgB, 1))
    html.style.setProperty("--theme-60", toRgba(textR, textG, textB, 0.6))
  }
})
```

### Hover Effects: CSS-Based

**All navigation links use `.nav-link` class:**

```scss
// base.scss
.nav-link {
  transition: opacity var(--duration-hover) var(--ease-power2);

  &[data-active="true"] {
    opacity: 0.5;  // Active links dimmed
  }

  &[data-active="false"] {
    opacity: 1;
    &:hover { opacity: 0.5; }  // Fade on hover
  }
}
```

**Why CSS hover:** Simpler, more performant, browser-native. Elements use full-color theme variables, CSS animates opacity to achieve color fading effect.

### Tailwind v4 Usage

```vue
<!-- Correct -->
<div class="bg-[var(--theme-100)]">
<p class="text-[var(--theme-text-100)]">
<div class="after:duration-[var(--duration-hover)]">

<!-- Wrong - Tailwind v4 doesn't generate utilities from CSS vars -->
<div class="bg-theme-100">  <!-- ❌ -->
```

## Breakpoint System

### SCSS Breakpoints

**File:** `app/assets/css/tokens/breakpoints.scss`

```scss
$bp-md: 48rem;        /* 768px */
$bp-lg: 64rem;        /* 1024px */
$bp-2xl: 120rem;      /* 1920px */
$bp-xxl: 126.875rem;  /* ~2030px */
$bp-4xl: 156.25rem;   /* 2560px */
$bp-6xl: 237.5rem;    /* 3840px */
```

**Usage:**
```scss
@use "../tokens/breakpoints.scss" as bp;

.my-component {
  display: none;
  @include bp.up(bp.$bp-md) { display: block; }
}
```

### Tailwind Breakpoints

Defined in `theme.scss` under `@theme`:
```scss
--breakpoint-3xl: 120rem;
--breakpoint-4xl: 126.875rem;
--breakpoint-5xl: 156.25rem;
--breakpoint-6xl: 237.5rem;
```

## SSR & State Management

### Initialization Flow

```
1. SERVER (SSR)
   Nitro plugin injects blocking script → checks localStorage + prefers-color-scheme
   → adds 'theme-dark' class if dark

2. BROWSER (First Paint)
   Loader CSS sees 'theme-dark' class → shows correct colors
   NO FOUC - correct theme from first pixel

3. CLIENT (Hydration)
   Plugin confirms theme class → Pinia store hydrates → GSAP timeline syncs
```

### Blocking Script Pattern

**File:** `server/plugins/inject-loader.ts`

```javascript
var stored = localStorage.getItem('theme');
var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
var isDark = stored ? stored === 'dark' : prefersDark;
document.documentElement.classList.toggle('theme-dark', isDark);
```

**Priority:** localStorage (manual) → `prefers-color-scheme` (system) → light (default)

### Pinia Store

**File:** `app/stores/theme.ts`

```typescript
interface ThemeState {
  isDark: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({ isDark: false }),

  hydrate(state: ThemeState, initialState: ThemeState): void {
    if (import.meta.client) {
      const stored = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      state.isDark = stored ? stored === 'dark' : prefersDark
    }
  },

  actions: {
    toggle(): void {
      this.isDark = !this.isDark
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('theme-dark', this.isDark)
    }
  }
})
```

### SVG Toggle Button Pattern

**Critical:** Read theme from localStorage (not Pinia - timing issue), sync store immediately, initialize colorProxy from LIGHT theme, build timeline TO dark, set initial SVG to LIGHT, position timeline based on actual theme.

```typescript
// 0. Read from localStorage
const stored = localStorage.getItem('theme')
const isDarkInitially = stored ? stored === 'dark' : prefersDark

// 0.5. CRITICAL: Sync Pinia immediately
themeStore.isDark = isDarkInitially

// 1. ALWAYS init from LIGHT (timeline start)
const colorProxy = { bgR: colors.light["100"].r, /* ... */ }

// 2. Build timeline TO dark
tl.to(colorProxy, { bgR: colors.dark["100"].r, /* ... */ })

// 3. Set SVG to LIGHT (start position)
$gsap.set(background, { fill: darkHex, fillOpacity: 0.6 })

// 4. Position timeline based on theme
tl.progress(isDarkInitially ? 1 : 0).pause()

// 5. Toggle uses PREVIOUS state
const wasLight = !themeStore.isDark
themeStore.toggle()
if (wasLight) tl.play() else tl.reverse()
```

## Usage

### Adding Theme Colors

```vue
<div class="bg-[var(--theme-5)]">
  <h1 class="text-[var(--theme-text-100)]">Heading</h1>
  <p class="text-[var(--theme-text-60)]">Body</p>
</div>
```

### Navigation with Hover

```vue
<a class="nav-link text-[var(--theme-text-100)]" :data-active="isActive">
  Link
</a>
```

CSS handles hover automatically (opacity fade + underline animation).

### Custom GSAP Animations

```typescript
const html = document.documentElement
const duration = parseFloat(getComputedStyle(html).getPropertyValue("--duration-hover")) / 1000
gsap.to(element, { x: 100, duration, ease: "power2.inOut" })
```

## Component Patterns

### Typography Utility Classes

**All typography styles from `theme.scss` are available as utility classes.**

Generated automatically from design tokens - no need to manually create them.

**Pattern:** `{font-family}-{breakpoint}-{style}`

```vue
<!-- Responsive typography: Mobile P1 → Laptop P2 -->
<p class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2 text-[var(--theme-text-100)]">
  Your content here
</p>

<!-- Single size (no responsive variant needed) -->
<h2 class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
  Biography
</h2>

<!-- Display heading (uses Instrument Serif via --font-display) -->
<h1 class="pp-eiko-mobile-h1 md:pp-eiko-desktop-h1 text-[var(--theme-text-100)]">
  Large Heading
</h1>
```

**Available utility classes:**

- **Display Font (Instrument Serif):** `pp-eiko-mobile-h1`, `pp-eiko-laptop-h2`, `pp-eiko-desktop-h3`, etc.
  - Note: Class names retain "pp-eiko-" prefix for Figma compatibility
- **IBM Plex Sans JP:** `ibm-plex-sans-jp-mobile-p1`, `ibm-plex-sans-jp-laptop-p2`, `ibm-plex-sans-jp-desktop-caption`, etc.
- **Custom styles:** `ibm-plex-sans-jp-mobile-custom-labels`, `pp-eiko-desktop-custom-navigation`, etc.

See `app/pages/dev/typography.vue` for complete list.

### Building Components: Tailwind-First Approach

**Keep it simple** - use Tailwind utilities + generated typography classes.

✅ **DO:**
- Use pure Tailwind + typography utility classes
- Apply responsive typography with `md:`, `lg:` prefixes
- Use `content-grid` + `breakout3` for layout (already styled in `content-grid.scss`)
- Apply theme colors via `text-[var(--theme-text-100)]`, `bg-[var(--theme-5)]`
- Use fluid spacing tokens: `gap-[var(--space-m)]`, `py-[var(--space-xl)]`

❌ **DON'T:**
- Create custom SCSS files for simple components
- Use `@apply` for basic utility combinations
- Reinvent layout systems (use content-grid)
- Write media queries manually (use Tailwind's `md:`, `lg:` prefixes)

**Example: BiographySection.vue** (reference implementation)

```vue
<template>
  <section class="content-grid w-full py-[var(--space-xl)] md:py-[var(--space-2xl)]">
    <div class="breakout3 grid gap-[var(--space-m)] lg:grid-cols-[minmax(auto,12rem)_1fr] lg:gap-[var(--space-3xl)] items-start">
      <!-- Label: single size, secondary color -->
      <h2 class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
        <slot name="label">Biography</slot>
      </h2>

      <!-- Content: responsive typography, primary color -->
      <div class="space-y-[var(--space-m)] ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2">
        <slot />
      </div>
    </div>
  </section>
</template>
```

**Key points:**
- Layout: Tailwind grid (`grid lg:grid-cols-[...]`)
- Typography: Utility classes with responsive modifiers (`class="mobile-p1 md:laptop-p2"`)
- Spacing: Fluid tokens (`gap-[var(--space-m)]`)
- Colors: Theme variables (`text-[var(--theme-text-100)]`)
- **No `<style>` block needed**

### When to Use SCSS

Only create SCSS files when:
- Complex hover states requiring multiple properties
- Pseudo-elements with intricate styling (::before, ::after)
- Component needs CSS that can't be expressed with utilities
- Tailwind would require 10+ classes for a single element

**Examples of valid SCSS usage:**
- `interactive-case-study.scss` - Complex hover preview with clip-path animations
- `content-grid.scss` - Advanced grid system with named grid lines
- `base.scss` - Global resets and navigation link behaviors

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Colors don't transition smoothly | CSS transition on color/background-color | Remove transition, GSAP handles theme colors |
| Theme toggle instant (~0.6ms) | Duration parsing incorrect (browser normalizes to "0.6s") | Parse both 'ms' and 's' units in code |
| Hover timing incorrect | Not reading CSS variables | Use `getComputedStyle()` to read `--duration-hover` |
| Icon doesn't change colors | Hardcoded fill colors | Use `:style="{ fill: 'var(--theme-text-100)' }"` |
| Theme flash on load | Script runs after render | Already fixed with Nitro blocking script |

## Key Files

**Core:**
- `app/assets/css/tokens/theme.scss` - All design tokens
- `app/assets/css/tokens/breakpoints.scss` - Breakpoints and mixins
- `app/composables/useThemeSwitch.ts` - GSAP animation logic
- `app/stores/theme.ts` - Pinia state management
- `server/plugins/inject-loader.ts` - SSR blocking script

**Components:**
- `app/components/ThemeToggleSVG.vue` - Toggle icon
- `app/components/HeaderGrid.vue` - Navigation with theme
