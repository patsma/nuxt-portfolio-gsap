# Loading System

Theme-aware loader with SSR support, entrance animations, and resource tracking.

## Flow

```
1. SSR injects loader HTML + theme detection script (Nitro plugin)
2. Browser shows loader with correct theme immediately
3. Resources load (fonts, GSAP, ScrollSmoother)
4. Minimum display time enforced (default 300ms)
5. 'app:ready' event fires
6. Loader fades out (500ms)
7. Entrance animations play in sequence
8. 'app:complete' event fires
```

## Key Files

| File | Purpose |
|------|---------|
| `server/plugins/inject-loader.ts` | Injects theme script + loader HTML before SSR response |
| `nuxt.config.ts` | Loader CSS injected in `<head>` |
| `app/plugins/loader-manager.client.js` | Removes loader on 'app:ready' event |
| `app/stores/loading.js` | Tracks loading state (initial → loading → ready → animating → complete) |
| `app/composables/useLoadingSequence.js` | Orchestrates timing and resource checks |
| `app/composables/useEntranceAnimation.js` | Coordinates component entrance animations |
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

## Entrance Animation System

Components register animations that play in sequence after loader completes.

### Setup Pattern

```vue
<template>
  <div ref="elementRef" data-entrance-animate="true">
    Content
  </div>
</template>

<script setup>
import { useEntranceAnimation } from '~/composables/useEntranceAnimation'

const { setupEntrance } = useEntranceAnimation()
const { $gsap } = useNuxtApp()
const elementRef = ref(null)

onMounted(() => {
  setupEntrance(elementRef.value, {
    position: '<-0.3',  // GSAP timeline position (overlap by 0.3s)

    animate: (el) => {
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

```vue
<HeroSection
  :animate-entrance="true"
  position="<-0.3"
>
  <h1>Your content</h1>
</HeroSection>
```

### Custom Components

See setup pattern above. Add `data-entrance-animate="true"` and call `setupEntrance()` in `onMounted`.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Loader not visible | Nitro plugin not running | Check `server/plugins/inject-loader.ts` exists |
| Min time not working | Changing default instead of app.vue | Set `minLoadTime` in `app.vue` call |
| Entrance animations not playing | Not in viewport or missing attribute | Add `data-entrance-animate="true"` |
| Elements stay hidden after navigation | CSS applies without class check | Use `html.is-first-load` scoping |
| Wrong animation order | Position parameters incorrect | Review GSAP position syntax table |
| ScrollTrigger fallback broken | No config provided | Add `scrollTrigger` option to `setupEntrance()` |

## Architecture Notes

- **Nitro plugin** - Only way to inject HTML before SSR response (app.html doesn't work in dev)
- **Blocking script** - Runs BEFORE loader renders, prevents FOUC
- **Module-level state** - `useEntranceAnimation.js` shares master timeline across components
- **Viewport detection** - In-viewport elements queue for entrance, below-fold use ScrollTrigger
- **Event-driven** - Decoupled component communication via window events

## Reference

See inline documentation in:
- `app/composables/useEntranceAnimation.js` - Entrance timeline coordinator
- `app/composables/useLoadingSequence.js` - Timing orchestration
- `server/plugins/inject-loader.ts` - SSR injection + is-first-load class
- `app/stores/loading.js` - State tracking
