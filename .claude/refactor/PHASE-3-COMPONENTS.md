# Phase 3: Vue Component Polish

**Goal:** Ensure Vue component files are clean and consistent — no empty style blocks, consistent script setup, clean template comments.

---

## 3a. Remove Empty Style Blocks

Any `<style scoped lang="scss"></style>` or `<style scoped></style>` with zero content → delete the entire tag.

Empty style blocks add noise and suggest the file is unfinished.

---

## 3b. Script Setup Consistency

All components must use: `<script setup lang="ts">`

If any component uses Options API or is missing `lang="ts"`, flag for review.

---

## 3c. Template Comment Consistency

**Keep:** Architectural `<!-- comments -->` that explain layout decisions or component structure.

```html
<!-- Desktop: 1fr auto 1fr → logo (left), nav (center), empty (right) -->
```

**Remove:** Obvious ones that just name what the element is.

```html
<!-- Navigation links -->  ← remove if the <nav> below is self-evident
```

---

## Files to Audit

```
app/components/
  HeaderGrid.vue
  HeroSection.vue
  BiographySection.vue
  ExperienceSection.vue
  ExperienceItem.vue
  InteractiveCaseStudySection.vue
  InteractiveCaseStudyItem.vue
  FullWidthBorder.vue
  CursorTrail.vue
  FluidGradient.vue
  ThemeToggleSVG.vue
  content/         (all MDC component files)
```

---

## Verification

After changes: `npm run lint` — confirm no ESLint errors introduced.
