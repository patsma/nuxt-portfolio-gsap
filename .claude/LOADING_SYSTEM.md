# Loading System

Theme-aware loader with SSR support, entrance animations, and resource tracking.

## Flow

```
1. SSR injects loader HTML + theme detection script + asset list (Nitro plugin)
1b. PerformanceObserver watches each /_nuxt/ chunk complete → bar fills in real-time
2. Browser shows loader with correct theme + progress bar immediately
3. Resources load (fonts, GSAP, ScrollSmoother)
4. Minimum display time enforced (default 300ms)
5. 'app:ready' event fires
6. Loader fades out (500ms) — progress bar removed with it (child element)
7. Entrance animations play in sequence
8. 'app:complete' event fires
```

## Key Files

| File | Purpose |
|------|---------|
| `server/plugins/inject-loader.ts` | Injects theme script + `window.__NUXT_ASSETS__` + PerformanceObserver + loader HTML |
| `nuxt.config.ts` | Loader CSS + `#loader-bar` progress bar CSS injected in `<head>` |
| `app/plugins/loader-manager.client.ts` | Removes loader on 'app:ready' event (bar removed as child) |
| `app/stores/loading.ts` | Tracks loading state (initial → loading → ready → animating → complete) |
| `app/composables/useLoadingSequence.ts` | Orchestrates timing and resource checks |
| `app/composables/useEntranceAnimation.ts` | Coordinates component entrance animations |
| `app/app.vue` | Starts loading sequence: `initializeLoading()` |

## Theme Detection (No FOUC)

**Pattern:** Blocking script runs BEFORE loader renders, applies correct theme class.

```javascript
// server/plugins/inject-loader.ts
var stored = localStorage.getItem('theme');
var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
var isDark = stored ? stored === 'dark' : prefersDark;
document.documentElement.classList.toggle('theme-dark', isDark);
```

**Priority:** localStorage (manual toggle) → `prefers-color-scheme` → light (default)

## Progress Bar

Thin top bar (YouTube-style) that fills based on actual `/_nuxt/` asset loading — not time.

**How it works:**

1. Nitro plugin extracts all `/_nuxt/` URLs from the server-rendered `html.head` arrays (Nuxt injects `<link rel="modulepreload">` and `<script>` tags there)
2. Injects `window.__NUXT_ASSETS__ = ['/\_nuxt/chunk.js', ...]` into the loader script
3. A `PerformanceObserver` with `buffered: true` watches for each URL completing
4. Updates `--loader-progress` CSS custom property (0 → 1) as each asset loads
5. `#loader-bar` width is driven by `calc(var(--loader-progress, 0) * 100%)`
6. Bar is a child of `#app-initial-loader` — auto-removed when loader is removed

**Fallback:** In dev mode, Nuxt doesn't generate chunked `/_nuxt/` assets, so `total === 0` and the bar stays hidden. The existing timer-based `app:ready` flow still removes the loader correctly.

**CSS custom property:** `--loader-progress` — set on `<html>` by the injected script, consumed by `#loader-bar { width: calc(var(--loader-progress, 0) * 100%) }` in `nuxt.config.ts` head styles.

## Entrance Animation System

Components register animations that play in sequence after loader completes.

### Setup Pattern (Single Element)

```vue
<template>
  <div ref="elementRef" data-entrance-animate="true">
    Content
  </div>
</template>

<script setup lang="ts">
import { useEntranceAnimation } from '~/composables/useEntranceAnimation'

const { setupEntrance } = useEntranceAnimation()
const { $gsap } = useNuxtApp()
const elementRef = ref<HTMLElement | null>(null)

onMounted(() => {
  setupEntrance(elementRef.value, {
    position: '<-0.3',  // GSAP timeline position (overlap by 0.3s)

    animate: (el: HTMLElement) => {
      const tl = $gsap.timeline()
      $gsap.set(el, { y: 40 })  // Element already hidden by CSS
      tl.to(el, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' })
      return tl
    },

    scrollTrigger: {  // Fallback for below-fold elements
      start: 'top 80%',
      once: true
    }
  })
})
</script>
```

### Multi-Element Pattern (Slots with Refs)

For components with multiple optional elements (like HeroSection with services + button slots):

```vue
<template>
  <section ref="containerRef" data-entrance-animate="true">
    <slot /> <!-- h1 text -->

    <div ref="servicesRef">
      <slot name="services" /> <!-- optional tags -->
    </div>

    <div ref="buttonRef">
      <slot name="button" /> <!-- optional button -->
    </div>
  </section>
</template>

<script setup lang="ts">
const { $gsap } = useNuxtApp()
const { setupEntrance } = useEntranceAnimation()

const containerRef = ref<HTMLElement | null>(null)
const servicesRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)

onMounted(() => {
  setupEntrance(containerRef.value, {
    position: '<-0.3',
    animate: (el: HTMLElement) => {
      const tl = $gsap.timeline()

      // 1. Animate h1 text (always present)
      const h1 = el.querySelector('h1')
      if (h1) {
        $gsap.set(h1, { opacity: 0, y: 40 })
        tl.to(h1, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
      }

      // 2. Animate services (if slot filled)
      if (servicesRef.value?.children.length > 0) {
        const tags = servicesRef.value.querySelectorAll('.tag')
        if (tags.length > 0) {
          $gsap.set(tags, { opacity: 0, y: 20 })
          tl.to(tags, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out'
          }, '<+0.3')  // Start 0.3s after h1
        }
      }

      // 3. Animate button (if slot filled)
      if (buttonRef.value?.children.length > 0) {
        const button = buttonRef.value.querySelector('.button')
        if (button) {
          $gsap.set(button, { opacity: 0, scale: 0.9 })
          tl.to(button, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.5)'
          }, '<+0.2')  // Start 0.2s after services
        }
      }

      return tl
    }
  })
})
</script>
```

**Key Points:**
- Use template refs for slot wrappers (not slot elements directly)
- Check `ref.value?.children.length > 0` to detect filled slots
- Query within refs for specific elements (`.querySelectorAll()`)
- Timeline auto-adjusts if elements missing
- Use relative position params (`'<+0.3'`) for smooth sequencing

### GSAP Position Parameters

| Syntax | Behavior |
|--------|----------|
| `'<'` | Start with previous animation |
| `'<-0.3'` | Start 0.3s before previous ends (overlap) |
| `'+=0.2'` | Start 0.2s after previous ends (gap) |
| `'start'` | Timeline start |
| `2` | Exact time (2 seconds) |

### HTML Class Scoping (Critical)

**Prevents FOUC on first load, allows page transitions on navigation.**

```css
/* base.scss - only hides elements when class exists */
html.is-first-load [data-entrance-animate="true"] {
  opacity: 0;
  visibility: hidden;
}
```

**Flow:**
1. SSR injects `is-first-load` class on `<html>` before page loads
2. First load: Class exists → CSS hides elements → Animations play → Class removed
3. Navigation: No class → CSS doesn't apply → Page transitions handle visibility

## Critical Warnings (Don't Do This)

### ❌ Don't Wrap Animated Components in ClientOnly

**Never use `<ClientOnly>` on components with `data-entrance-animate="true"`:**

```vue
<!-- ❌ BAD - Component mounts too late, misses animation sequence -->
<ClientOnly>
  <CursorTrail v-if="!isMobile" />
</ClientOnly>

<!-- ✅ GOOD - Use v-if or import.meta.client guards instead -->
<CursorTrail v-if="!isMobile" />
```

**Why:** `<ClientOnly>` delays component mounting until after hydration. By then, the entrance animation coordinator has already started collecting and playing animations. The component misses its slot in the sequence.

**Alternatives for SSR safety:**
- `v-if="someClientOnlyCondition"` - Component still mounts at correct time
- `if (!import.meta.client) return` guards inside component
- Canvas/WebGL elements are inert during SSR anyway

## Configuration

### Timing Options

```javascript
// app/app.vue
initializeLoading({
  checkFonts: true,      // Wait for fonts (default: true)
  minLoadTime: 300,      // Minimum display in ms (default: 800)
  animateOnReady: true,  // Auto-start animations (default: true)
})
```

### Events

| Event | When | Payload |
|-------|------|---------|
| `app:ready` | Resources loaded + min time reached | `{ duration: 302, isFirstLoad: true }` |
| `app:start-animations` | Ready to start entrance animations | none |
| `app:complete` | All entrance animations finished | none |

## Integration

### HeroSection Built-in Support

HeroSection has built-in multi-element entrance animations using the slot refs pattern:

```vue
<HeroSection
  :animate-entrance="true"
  position="<-0.3"
>
  <h1>Your headline</h1>

  <template #services>
    <nav class="services-list">
      <div class="tag">Service 1</div>
      <div class="tag">Service 2</div>
    </nav>
  </template>

  <template #button>
    <ScrollDownSVG />
  </template>
</HeroSection>
```

**Animation Sequence:**
1. h1 text with SplitText (1s, stagger 0.08s)
2. Service tags fade + slide up (0.5s, stagger 0.08s) - if slot filled
3. Button fade + scale (0.6s) - if slot filled

Timeline adapts automatically if services or button slots are empty.

### Custom Components

See setup pattern above. Add `data-entrance-animate="true"` and call `setupEntrance()` in `onMounted`.

### Infinite Animations (Viewport-Aware)

For components with infinite/looping animations (like rotating elements), use ScrollTrigger to pause when out of viewport:

```vue
<script setup lang="ts">
const { $gsap, $ScrollTrigger } = useNuxtApp()
const loadingStore = useLoadingStore()

const containerRef = ref<HTMLElement | null>(null)
const elementRef = ref<HTMLElement | null>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let animation: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let scrollTrigger: any = null

onMounted(() => {
  // Create infinite animation (paused initially)
  animation = $gsap.to(elementRef.value, {
    rotation: 360,
    duration: 20,
    repeat: -1,
    ease: 'none',
    paused: true,
    transformOrigin: 'center center'
  })

  // ScrollTrigger: pause/resume based on viewport
  scrollTrigger = $ScrollTrigger.create({
    trigger: containerRef.value,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => animation.resume(),
    onLeave: () => animation.pause(),
    onEnterBack: () => animation.resume(),
    onLeaveBack: () => animation.pause(),
  })

  // Start after entrance/transition completes
  if (loadingStore.isFirstLoad) {
    window.addEventListener('app:complete', () => animation.play(), { once: true })
  } else {
    setTimeout(() => animation.play(), 600) // Page transition delay
  }
})

onUnmounted(() => {
  animation?.kill()
  scrollTrigger?.kill()
})
</script>
```

**Benefits:**
- Saves CPU/GPU when element not visible
- Integrates with both entrance and page transition systems
- Proper cleanup prevents memory leaks
- Works anywhere on page (hero or mid-page)

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Loader not visible | Nitro plugin not running | Check `server/plugins/inject-loader.ts` exists |
| Min time not working | Changing default instead of app.vue | Set `minLoadTime` in `app.vue` call |
| Entrance animations not playing | Not in viewport or missing attribute | Add `data-entrance-animate="true"` |
| Elements stay hidden after navigation | CSS applies without class check | Use `html.is-first-load` scoping |
| Wrong animation order | Position parameters incorrect | Review GSAP position syntax table |
| ScrollTrigger fallback broken | No config provided | Add `scrollTrigger` option to `setupEntrance()` |
| Bar stays at 0% | No `/_nuxt/` URLs in head (expected in dev mode) | Normal — timer still removes loader; test in `npm run preview` |
| Bar jumps to 100% instantly | All assets cached (correct behavior) | Expected on repeat visits — browser cache is the truth |

## Architecture Notes

- **Nitro plugin** - Only way to inject HTML before SSR response (app.html doesn't work in dev)
- **Blocking script** - Runs BEFORE loader renders, prevents FOUC
- **Module-level state** - `useEntranceAnimation.ts` shares master timeline across components
- **Viewport detection** - In-viewport elements queue for entrance, below-fold use ScrollTrigger
- **Event-driven** - Decoupled component communication via window events

## Reference

See inline documentation in:
- `app/composables/useEntranceAnimation.ts` - Entrance timeline coordinator
- `app/composables/useLoadingSequence.ts` - Timing orchestration
- `server/plugins/inject-loader.ts` - SSR injection + is-first-load class
- `app/stores/loading.ts` - State tracking
