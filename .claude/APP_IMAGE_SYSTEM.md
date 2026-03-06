# AppImage System

Thin `NuxtImg` wrapper that shows a theme-aware shimmer skeleton while loading, then fades it out and reveals the image. Drop-in replacement for `NuxtImg`.

**File:** `app/components/AppImage.vue`

---

## Component API

```vue
<AppImage
  src="/images/foo.jpg"
  alt="Description"
  wrapperClass="w-full h-full"
  class="object-cover"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `wrapperClass` | `String` | `''` | Classes applied to the `.img-wrapper` div |

All other attributes (`src`, `alt`, `class`, `sizes`, etc.) are forwarded to `NuxtImg`/`<img>` via `v-bind="$attrs"` (`inheritAttrs: false`).

---

## Where It's Used

| File | Usage |
|------|-------|
| `InteractiveCaseStudySection.vue` | 3× preview slots (slotA / slotB / slotC) |
| `InteractiveCaseStudyItem.vue` | Mobile card image |
| `MediaText.vue` | Image + text section |
| `LabProjectItem.vue` | Expanded cover image |
| `work/[slug].vue` | Bento grid (3×) + fallback cover |
| `lab/[slug].vue` | Bento grid (3×) + fallback cover |
| `content/ImageScalingSection.vue` | Parallax image (GSAP ref via `defineExpose`) |

### NOT used (by design)

| File | Reason |
|------|--------|
| `RecommendationItem.vue` marquee `<img>` | GSAP `querySelectorAll('.marquee-image')` targets elements directly |
| `LabProjectItem.vue` marquee `<img>` | Same reason — wrapping would break GSAP loop |
| `VideoScalingSection.vue` | Has its own first-frame poster system |

---

## CSS Architecture

**File:** `app/assets/css/post.scss`

```scss
.img-wrapper {
  position: relative;
  display: block;

  // Solid background overlay while loading
  &::before {
    content: '';
    position: absolute; inset: 0;
    background: var(--theme-100);
    z-index: 1;
    transition: opacity 0.3s ease;
  }

  // Spinner
  &::after {
    content: '';
    position: absolute; inset: 0; margin: auto;
    width: 20px; height: 20px;
    border: 2px solid transparent;
    border-top-color: var(--theme-text-100);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    z-index: 2;
  }

  img {
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &--loaded {
    &::before, &::after { opacity: 0; pointer-events: none; }
    img { opacity: 1; }
  }
}
```

Theme-aware: `--theme-100` and `--theme-text-100` auto-swap under `.theme-dark`.

### Cached image handling

Browsers sometimes fire `@load` before `onMounted` for cached images. We check `img.complete` in `nextTick` to avoid a phantom shimmer on repeat visits:

```ts
onMounted(() => {
  nextTick(() => {
    const img = imgRef.value?.$el as HTMLImageElement | undefined
    if (img?.complete && img.naturalWidth > 0) {
      isLoaded.value = true
    }
  })
})
```

---

## Fixed-Height Container Pattern

For containers with defined dimensions (bento grid, aspect-ratio, parallax), use `wrapperClass="w-full h-full"` so the wrapper fills the parent.

Without it, the wrapper's default `display: block; height: auto` won't fill a fixed-height parent, and the spinner won't appear at the correct size.

```vue
<!-- Inside aspect-ratio or overflow-hidden container -->
<AppImage wrapper-class="w-full h-full" class="object-cover" ... />
```

**Required for:** bento grids, `.card-image-container`, `.parallax-container`, aspect-ratio containers.

**Not required for:** flowing content (e.g. MediaText where height is auto).

---

## Scoped CSS + AppImage

When a parent component uses `<style scoped>`, CSS rules for classes on `<img>` won't pierce AppImage's component boundary.

**Fix:** Use `:deep()` in the parent's scoped styles:

```scss
// ImageScalingSection.vue
:deep(.parallax-media) {
  height: 140%; // parallax requires img taller than container
}
```

For global CSS (not scoped), classes on AppImage's `<img>` work normally — e.g. `.card-image` in `interactive-case-study.scss` applies correctly.

### Transition specificity gotcha

`.img-wrapper img` (specificity 0-1-1) overrides `.card-image` (0-1-0) for `transition`. Fix with a higher-specificity rule:

```scss
.img-wrapper .card-image {
  transition: opacity 0.4s ease, transform var(--duration-hover) var(--ease-power2);
}
```

---

## GSAP Consumer Pattern

For components that need to animate the `<img>` element directly (e.g. ImageScalingSection parallax), AppImage exposes the inner element:

```ts
// AppImage.vue
defineExpose({
  get $el() { return imgRef.value?.$el as HTMLElement | undefined }
})
```

```ts
// Parent (ImageScalingSection.vue)
const imageRef = useTemplateRef('imageRef')

// <AppImage ref="imageRef" ... />
$gsap.set(imageRef.value.$el, { yPercent: 0 })
```

The getter (not a computed) ensures GSAP receives the raw `HTMLElement`, not a reactive ref.

---

## Known Issues / Future Refactors

### querySelector in Marquee Components (future refactor)

**Files:** `RecommendationItem.vue`, `LabProjectItem.vue`

Both use `querySelectorAll` to collect DOM elements for the GSAP horizontal loop:

```js
const items = marqueeTrackRef.value.querySelectorAll('.marquee-text, .marquee-image')
```

Wrapping marquee `<img>` tags in AppImage would cause GSAP to animate the `<img>` inside the wrapper while `.img-wrapper` stays in place, breaking the loop.

**The proper fix:** Replace `querySelectorAll` with Vue template refs. Use `:ref` on each marquee item and collect them into a reactive array — eliminating class-based DOM querying and making AppImage usable in marquees.
