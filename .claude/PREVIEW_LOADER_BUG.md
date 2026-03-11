# Preview Loader Bug — Investigation Reference

## Symptom

Hovering a case study item on desktop shows the AppImage shimmer (solid bg + spinning circle) for ~0.3–0.5s before the image appears — even on localhost. Also visible during slideshow auto-transitions between images.

Expected: clip-path animation reveals image cleanly, zero flash.
Actual: solid color + spinner visible before image appears.

---

## Confirmed Root Causes

### Root Cause 1 — URL mismatch (primary)

`preloadImage()` in `useInteractiveCaseStudyPreview.ts` fetches the raw path:

```typescript
const img = new Image()
img.src = '/images/foo.jpg'  // ← browser caches this URL
```

But `<NuxtImg>` (used inside `<AppImage>`) transforms URLs through the IPX processor. With `image: { quality: 80 }` in `nuxt.config.ts`, NuxtImg actually requests:

```
/_ipx/q_80/images/foo.jpg   ← completely different URL
```

Browser cache has `/images/foo.jpg`. NuxtImg requests `/_ipx/q_80/images/foo.jpg` → **cache miss → real network request → shimmer shows**. This is why localhost is no different from production — IPX processing always creates a new URL.

### Root Cause 2 — CSS transition always visible (secondary)

`post.scss` shimmer structure:

```scss
.img-wrapper {
  &::before { opacity: 1; transition: opacity 0.3s ease; }  // solid bg
  &::after  { opacity: 1; transition: opacity 0.3s ease; }  // spinner
  img { opacity: 0; transition: opacity 0.3s ease; }

  &--loaded {
    &::before, &::after { opacity: 0; }
    img { opacity: 1; }
  }
}
```

Even if `isLoaded` fires at the exact right moment, there is always a 0.3s window where the shimmer is fading out. The 3-slot carousel also remounts `<AppImage>` via `v-if` on every slot use, resetting `isLoaded = false` every time a new image appears.

---

## Failed Fix Attempts

### Fix #1 — Sync `img.complete` check in AppImage.vue

Added immediate sync check in `onMounted` before the `nextTick` fallback:

```typescript
onMounted(() => {
  const imgEl = imgRef.value?.$el as HTMLImageElement | undefined
  if (imgEl?.complete && imgEl.naturalWidth > 0) {
    isLoaded.value = true
    return
  }
  nextTick(() => { /* ... */ })
})
```

**Result:** No effect. Because of the URL mismatch, `img.complete` is never `true` at mount time — the IPX-transformed URL triggers a real network request regardless.

### Fix #2 — Replace `<AppImage>` with plain `<img loading="eager">` in 3 preview slots

Rationale: plain `<img>` uses the same raw URL as `preloadImage()` → instant cache hit → no shimmer, no CSS transition.

**Result:** Shimmer was eliminated BUT introduced a new visual glitch — a ~20px bar visible at the top of the preview during the clip-path animation, then the full image snaps in instantly.

Root cause of the glitch: AppImage rendered an intermediate `.img-wrapper` div that was targeted by `.preview-image-wrapper .img-wrapper { width: 100%; height: 100% }` in `interactive-case-study.scss`. This div was the key element in the height cascade:

```
.preview-container (fixed, aspect-ratio = height source)
  └── .preview-image-wrapper (position: absolute, height: 100%)
        └── .img-wrapper (display: block, height: 100%) ← AppImage's wrapper div
              └── img.preview-image (height: 100%)
```

Without `.img-wrapper`, the `height: 100%` on `img.preview-image` doesn't resolve correctly. Tailwind's preflight resets `img { height: auto }` and the post.scss class rule doesn't win reliably.

### Fix #3 — Add `position: absolute; inset: 0` to `.preview-image` CSS

Rationale: absolute positioning removes dependency on the height cascade.

**Result:** Made things worse. Likely an interaction with the clip-path animation origin point or GSAP's scroll parallax (`data-speed="0.95"` on the img element).

---

## Files Involved

| File | Role |
|------|------|
| `app/components/InteractiveCaseStudySection.vue` | 3 slot wrappers (`slotARef/B/C`) + `<AppImage>` inside each |
| `app/composables/useInteractiveCaseStudyPreview.ts` | `preloadImage()` (~line 402), slot state machine, `await nextTick()` before slot assignment |
| `app/components/AppImage.vue` | Shimmer wrapper — `isLoaded` ref, `NuxtImg`, CSS pseudo-elements |
| `app/assets/css/post.scss` | `.img-wrapper` shimmer CSS (lines ~26–73) |
| `app/assets/css/components/interactive-case-study.scss` | `.preview-image`, `.preview-image-wrapper .img-wrapper { width/height: 100% }` |
| `nuxt.config.ts` | `image: { quality: 80 }` → drives IPX URL transformation |

### Key CSS Rule (do not remove)

`interactive-case-study.scss` line 127:
```scss
.preview-image-wrapper .img-wrapper {
  width: 100%;
  height: 100%;
}
```
This targets AppImage's inner `.img-wrapper` div. Without it, image sizing breaks.

---

## Recommended Approaches for Next Attempt

### Option A — Fix preload URL to match NuxtImg's IPX URL (most correct)

Use `useImage()` composable from `@nuxt/image` to generate the exact same transformed URL that NuxtImg will request, then preload that:

```typescript
// In useInteractiveCaseStudyPreview.ts
const $img = useImage()

async function preloadImage(src: string): Promise<void> {
  // Generate the IPX-transformed URL that NuxtImg will actually request
  const transformedUrl = $img(src, { quality: 80 })
  const img = new Image()
  img.src = transformedUrl
  // ... rest of preload logic
}
```

This keeps AppImage, the shimmer CSS, and all other code intact. Only the cache key changes.

**Caveat:** `useImage()` must be called at composable setup time (not inside the async function). Check if the composable is initialized in the right context.

### Option B — `preloaded` prop on AppImage to skip shimmer

Add a `preloaded` prop to AppImage:

```vue
<!-- InteractiveCaseStudySection.vue -->
<AppImage :preloaded="true" ... />
```

```typescript
// AppImage.vue
const props = defineProps({
  preloaded: { type: Boolean, default: false }
})

// In onMounted or immediately:
if (props.preloaded) {
  isLoaded.value = true  // skip shimmer entirely
}
```

Since the composable guarantees `await preloadImage()` runs before slot assignment, `preloaded` is always accurate for preview slots.

### Option C — Use NuxtImg's `preload` prop

NuxtImg has a `preload` prop that generates `<link rel="preload">` in the document head. May preload the correct IPX URL and avoid the cache miss entirely. Worth investigating.

---

## Architecture Notes

- **Slot carousel:** 3 slots (`slotA/B/C`) rotate — GSAP animates the incoming slot with a clip-path reveal while the outgoing slot is already hidden. `v-if` on AppImage remounts the component fresh for each slot use.
- **Preview container:** `position: fixed`, teleported to `<body>`, outside `#smooth-content` so scroll doesn't affect position.
- **Parallax:** `data-speed="0.95"` on the `<img>` element — ScrollSmoother applies this. Careful with absolute positioning changes here.
- **Clip-path target:** The `.preview-image-wrapper` div is what GSAP animates (not the img). The img fills this wrapper.
