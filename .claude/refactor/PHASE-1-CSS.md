# Phase 1: CSS Architecture

**Goal:** Clean up CSS source files — remove dead code, fix naming, reduce repetition with mixins, standardize Vue style blocks.

**Rule:** Same compiled CSS output, cleaner source.

---

## 1a. typography.scss → SCSS Mixins

**File:** `app/assets/css/utilities/typography.scss` (518 lines → ~200)

**Why:** 56 `@utility` blocks share identical structure. Two SCSS mixins (`display-util`, `body-util`) collapse each block to one line.

### Mixin Pattern

```scss
// Display utilities: font-family and weight always fixed
@mixin display-util($name, $style, $lh, $tracking) {
  @utility #{$name} {
    font-family: var(--font-display);
    font-weight: 400;
    font-style: #{$style};
    font-size: var(--#{$name});
    line-height: #{$lh};
    letter-spacing: #{$tracking};
  }
}

// Body utilities: weight varies per style
@mixin body-util($name, $weight, $lh, $tracking) {
  @utility #{$name} {
    font-family: var(--font-body);
    font-weight: #{$weight};
    font-style: normal;
    font-size: var(--#{$name});
    line-height: #{$lh};
    letter-spacing: #{$tracking};
  }
}
```

### Verification
After rewrite: `npm run build` → confirm all 56 utility class names appear in compiled CSS.

---

## 1b. layout.scss — Dead Code Removal

**File:** `app/assets/css/utilities/layout.scss`

**What:** `hero-split-bg` utility references undefined CSS variables (`--color-hero-bg`, `--color-paper`) and is not used in any Vue template. Remove it. The `hero-offset-image` utilities are also unused — remove them.

**Keep:** `header-safe-top` and `hero-min-height` — verify if these are used anywhere first.

---

## 1c. service-tags.scss — Variable Name Fix

**File:** `app/assets/css/components/service-tags.scss`

**What:** Replace Figma-exported variable name with correct design token:

```scss
// Before
font-size: var(--i-b-m--plex--sans--j-p---mobile---custom---labels); // 10px

// After
font-size: var(--body-mobile-custom-labels); // 10px
```

---

## 1d. Vue `<style>` Consistency

**What:** Standardize all Vue component `<style>` blocks:
- Empty style blocks → remove entirely
- Plain CSS style blocks → add `lang="scss"` if SCSS features needed, or keep plain if pure CSS

**Files to check:** All `app/components/**/*.vue`

---

## 1e. !important Audit

**File:** `app/assets/css/components/interactive-case-study.scss` (lines ~146-166)

**What:** Each `!important` must have a comment explaining WHY it's needed. If it's a Tailwind conflict, document it. If it can be resolved, resolve it.

---

## Testing

```bash
npm run styles:build  # Rebuild SCSS
npm run build         # Full build to verify CSS output
```

After typography.scss refactor, check compiled CSS contains all utility names.
