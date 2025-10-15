# Loading System Documentation

State-based loading system with visual loader, resource verification, and entrance animation sequencing for Nuxt 4 SSR apps.

## Architecture Overview

### Loading Flow

```
1. SSR Response      → Loader HTML + CSS injected (Nitro plugin)
2. Browser Loads     → Loader visible immediately (black screen + spinner)
3. Vue Hydrates      → Client plugin runs, scroll reset to top
4. Resources Load    → Fonts, GSAP, ScrollSmoother, page content
5. Minimum Time Wait → Ensures consistent UX (configurable, default 800ms)
6. Ready Event Fires → 'app:ready' event dispatched after minimum time
7. Loader Fades Out  → 500ms opacity transition
8. Content Fades In  → Main content appears with entrance animations
9. Complete          → Normal page interaction enabled
```

### Why This Architecture?

This follows **Nuxt 4 best practices** for SSR applications:

- **Nitro Plugin** → Only way to inject HTML before SSR response (app.html doesn't work in dev)
- **Config CSS** → Immediate styling before JavaScript loads
- **Media Query** → Theme detection without JavaScript (`prefers-color-scheme`)
- **Client Plugin** → DOM manipulation after Vue hydrates
- **Pinia Store** → Centralized state management
- **Composable** → Reusable logic and timing orchestration
- **Event System** → Decoupled component communication

## Key Files

### 1. `server/plugins/inject-loader.ts` (Nitro Plugin)
**Purpose**: Injects theme detection script + loader HTML into SSR response BEFORE it's sent to browser

```typescript
nitroApp.hooks.hook('render:html', (html) => {
  html.bodyAppend.unshift(`
    <script>
      // Theme detection runs BEFORE loader is visible (prevents FOUC)
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = stored ? stored === 'dark' : prefersDark;
      if (isDark) {
        document.documentElement.classList.add('theme-dark');
      }
    </script>
    <div id="app-initial-loader">
      <div class="app-loader-spinner"></div>
    </div>
  `);
});
```

**Key Features**:
- Blocking script runs IMMEDIATELY (before loader renders)
- Checks localStorage first (respects manual theme toggle)
- Falls back to `prefers-color-scheme` (system preference)
- Sets `theme-dark` class on `<html>` instantly
- No FOUC - loader shows correct theme from first pixel

### 2. `nuxt.config.ts` (CSS Injection)
**Purpose**: Injects loader styles into `<head>` that render immediately

```javascript
app: {
  head: {
    style: [
      {
        textContent: `/* Loader styles with theme support */`
      }
    ]
  }
}
```

**Key Styles**:
- `#app-initial-loader` - Fixed overlay with theme-aware background
- `.app-loader-spinner` - 48px spinning circle (0.8s rotation) with theme colors
- `.theme-dark` - Class-based dark theme (applied by blocking script)
- `.fade-out` - Opacity transition (0.5s)
- `#__nuxt` - Hidden initially, fades in when loaded

**Theme Colors**:
- **Light theme** (default): `#fffaf5` background + `#090925` dark spinner
- **Dark theme** (with `.theme-dark` class): `#090925` background + `#fffaf5` light spinner
- Colors match `--color-light-100` and `--color-dark-100` from theme tokens

**Theme Detection**:
- Blocking script checks localStorage → system preference → default light
- Sets `.theme-dark` class if dark theme needed
- CSS applies styles based on class presence only (no media query conflicts)

### 3. `app/plugins/loader-manager.client.js` (Client Plugin)
**Purpose**: Manages loader removal when app is ready

**Key Functions**:
- Resets scroll to top immediately (`window.scrollTo(0, 0)`)
- Listens for `app:ready` event from loading sequence composable
- Fades out loader and shows content
- Removes loader from DOM after transition
- 10-second fallback timeout for safety (prevents stuck loader if something breaks)

### 4. `app/stores/loading.js` (Pinia Store)
**Purpose**: Central state management for loading process

**States**:
- `initial` - App just started
- `loading` - Resources being loaded
- `ready` - All resources loaded, can animate
- `animating` - Entrance animations running
- `complete` - All animations finished

**Tracked Resources**:
- `gsapReady` - GSAP and plugins loaded
- `scrollSmootherReady` - ScrollSmoother initialized
- `pageReady` - Page content mounted
- `fontsReady` - Custom fonts loaded
- `isFirstLoad` - First page load vs navigation

### 5. `app/composables/useLoadingSequence.js` (Orchestrator)
**Purpose**: Coordinates loading process and enforces timing

**Main Function**: `initializeLoading(options)`

**Options**:
```javascript
{
  checkFonts: true,      // Wait for fonts (default: true)
  minLoadTime: 800,      // Minimum display time in ms (default: 800)
  animateOnReady: true,  // Auto-start animations (default: true)
}
```

**Timing Logic**:
```javascript
const startTime = Date.now();
// ... load resources ...
const elapsed = Date.now() - startTime;
const remainingTime = Math.max(minLoadTime - elapsed, 0);
if (remainingTime > 0) {
  await new Promise(resolve => setTimeout(resolve, remainingTime));
}
```

### 6. `app/layouts/default.vue` (Integration)
**Purpose**: Initializes ScrollSmoother and marks resources ready

**Critical Steps**:
1. Creates ScrollSmoother instance
2. Scrolls to top: `scrollToTop()` - ensures page starts at scrollTop 0
3. Marks ScrollSmoother ready: `markScrollSmootherReady()`
4. Marks page content ready: `markPageReady()`

### 7. `app/app.vue` (Entry Point)
**Purpose**: Starts loading sequence on mount

```javascript
onMounted(() => {
  initializeLoading({
    checkFonts: true,      // Wait for custom fonts to load
    minLoadTime: 300,      // Minimum display time in ms
    animateOnReady: true,  // Auto-start entrance animations
  });
});
```

**IMPORTANT**: Configure `minLoadTime` HERE in `app.vue`, not in the composable. The composable's default is just a fallback - explicit values in `app.vue` always take precedence.

## Timing Configuration

### Current Settings

| Component | Value | Purpose |
|-----------|-------|---------|
| Minimum Display Time | 300ms | Ensures loader is visible, prevents flash |
| Loader Fade Out | 500ms | Smooth opacity transition |
| Content Fade In | 400ms | Smooth appearance of content |
| Animation Delay | 100ms | Small delay before entrance animations |
| Fallback Timeout | 10000ms | Safety mechanism if event never fires |

### Adjusting Timing

**To change minimum loader display time** (recommended place):
```javascript
// app/app.vue
initializeLoading({
  minLoadTime: 800, // Show loader for at least 800ms
});
```

**To change composable default fallback**:
```javascript
// app/composables/useLoadingSequence.js (line 46)
minLoadTime = 800, // Default if not specified in app.vue
```

**To change fade transitions**:
```javascript
// nuxt.config.ts - in the style.textContent string
#app-initial-loader {
  transition: opacity 0.6s ease-out; /* Longer fade out */
}

// AND update timeout in loader-manager.client.js (line 56)
setTimeout(() => {
  loader.remove();
}, 600); // Match CSS transition duration
```

## Scroll Reset System

**Problem**: Page sometimes starts at offset (scrollTop > 0) after loading.

**Solution**: Three-layer scroll reset

1. **Plugin Level** (earliest):
   ```javascript
   // loader-manager.client.js
   window.scrollTo(0, 0); // Immediate reset
   ```

2. **ScrollSmoother Level** (after creation):
   ```javascript
   // layouts/default.vue
   scrollToTop(); // Reset smoother's internal position
   ```

3. **Utility Method** (reusable):
   ```javascript
   // composables/useScrollSmootherManager.js
   const scrollToTop = () => {
     smootherInstance.scrollTo(0, false); // Instant scroll
   };
   ```

## Events System

### app:ready
**Fired when**: All resources loaded and minimum time reached

**Payload**:
```javascript
{
  duration: 856,     // Loading duration in ms
  isFirstLoad: true  // Is this the first page load
}
```

**Listen in components**:
```javascript
window.addEventListener('app:ready', (event) => {
  console.log('App ready:', event.detail);
});
```

### app:start-animations
**Fired when**: Ready to start entrance animations

**Listen in components**:
```javascript
window.addEventListener('app:start-animations', () => {
  // Start your component's entrance animation
}, { once: true });
```

### app:complete
**Fired when**: All entrance animations finished

**Listen in components**:
```javascript
window.addEventListener('app:complete', () => {
  // Everything is fully loaded and animated
});
```

## Integration with Existing Systems

### Page Transitions
- Loading system runs ONCE on initial page load
- Page transitions (`.claude/PAGE_TRANSITIONS.md`) handle subsequent navigations
- No conflict: Loading uses `isFirstLoad` flag to differentiate

### ScrollSmoother
- Loading system waits for ScrollSmoother initialization
- Scroll position reset after creation
- Entrance animations respect ScrollSmoother's parallax effects

### Entrance Animation System

The loading system integrates with a powerful entrance animation sequencer that allows components in the initial viewport to play animations in sequence after the loader completes.

**Flow**: Loader completes → Header animates → `app:entrance-ready` event → Queued component animations play

#### How It Works

1. **Components register animations** - Components call `setupEntrance()` with animation function
2. **Automatic viewport detection** - System checks if component is visible on load
3. **Queueing** - In-viewport components queue for entrance sequence
4. **Sequential playback** - Animations play with GSAP position parameter control
5. **ScrollTrigger fallback** - Below-fold components use ScrollTrigger automatically

#### Using setupEntrance() in Components

**IMPORTANT**: Add `data-entrance-animate="true"` attribute to elements that should hide on first load only.

```vue
<template>
  <div ref="myElementRef" data-entrance-animate="true">
    Your content
  </div>
</template>

<script setup>
import { useEntranceAnimation } from '~/composables/useEntranceAnimation'

const { setupEntrance } = useEntranceAnimation()
const { $gsap } = useNuxtApp()
const myElementRef = ref(null)

onMounted(() => {
  setupEntrance(myElementRef.value, {
    // GSAP position parameter - full flexibility
    position: '<-0.3',  // Start 0.3s before previous animation ends (overlap)

    // Animation function - define your timeline
    animate: (el) => {
      const tl = $gsap.timeline()

      // Element already hidden by CSS via data-entrance-animate attribute + html.is-first-load class
      // Just set transform offset before animating
      $gsap.set(el, { y: 40 })

      // Animate to visible with autoAlpha (opacity + visibility)
      tl.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      })

      return tl
    },

    // Optional: ScrollTrigger config for below-fold fallback
    scrollTrigger: {
      start: 'top 80%',
      once: true
    }
  })
})
</script>
```

**CSS-First Approach with HTML Class Scoping**:
```css
/* In app/assets/css/base/base.scss */
/* Only hides elements on first load when html.is-first-load class exists */
html.is-first-load [data-entrance-animate="true"] {
  opacity: 0;
  visibility: hidden;
}
```

**How it works**:
1. **SSR injects class**: Nitro plugin adds `is-first-load` class to `<html>` element before page loads
2. **First load**: Class exists → CSS hides elements with `data-entrance-animate="true"` → Animations play
3. **Class removed**: After entrance animations complete, `is-first-load` class is removed
4. **Subsequent navigations**: No class → CSS doesn't apply → Elements visible → Page transitions work normally

This prevents flash on first load while allowing page transitions to control visibility on subsequent navigations.

#### GSAP Position Parameter Examples

Full GSAP position parameter syntax is supported:

```javascript
// Overlap completely with previous animation
position: '<'

// Start 0.3s before previous animation ends (smooth overlap)
position: '<-0.3'

// Start 0.2s after previous animation ends (gap)
position: '+=0.2'

// Start with previous animation but delay 0.1s
position: '<+0.1'

// Start at timeline beginning
position: 'start'

// Start at header label
position: 'header'

// Start 0.5s after header label
position: 'header+=0.5'

// Start at exact time (2 seconds from timeline start)
position: 2
```

#### HeroSection Integration

The `HeroSection` component has built-in entrance animation support:

```vue
<template>
  <HeroSection
    :animate-entrance="true"
    position="<-0.3"
  >
    <h1>Your headline</h1>
    <p>Your content</p>
  </HeroSection>
</template>
```

**Props**:
- `animateEntrance` - Enable entrance animation (default: `true`)
- `position` - GSAP position parameter (default: `'<-0.3'` - overlap header by 0.3s)

#### HeaderGrid Integration

HeaderGrid dispatches `app:entrance-ready` event when its animation completes:

```javascript
// In HeaderGrid.vue onComplete callback
onComplete: () => {
  console.log("✨ Header entrance complete")
  window.dispatchEvent(new CustomEvent('app:entrance-ready'))
  console.log("🚀 Fired 'app:entrance-ready' event")
}
```

This signals the entrance animation system to play all queued component animations.

## Console Output

Expected logs during loading with entrance animations (with `minLoadTime: 300`):

```
🎨 [Blocking Script] Theme detected: LIGHT | localStorage: null | system prefers: light
🎨 [Nitro] Theme detection script + Loader HTML injected into SSR response
🎨 Loader manager plugin initialized
📍 Initial scroll position reset to top
🔄 Loading started
✅ Page content ready
✅ ScrollSmoother ready
📍 ScrollSmoother scrolled to top
✅ Page scroll position reset to top
✅ GSAP ready
✅ Fonts ready
✅ All resources loaded! Took 45ms
ℹ️  Waiting for minimum display time before showing content...
⏱️ Resources loaded in 45ms, waiting 255ms more (minLoadTime: 300ms)
🎯 Minimum display time reached - ready to show content
🚀 Fired 'app:ready' event after 302ms
🚀 App ready event received: {duration: 302, isFirstLoad: true}
🎭 Fading out loader...
🎬 Initial animations started
🎬 Header entrance animation started
🎬 Entrance animation system initialized
📝 Queued entrance animation for element: <section class="content-grid">
✨ Loader removed from DOM
✨ Header entrance complete
🚀 Fired 'app:entrance-ready' event - queued entrance animations can now play
🎬 Playing 1 entrance animations
✨ All entrance animations complete
🔓 Removed is-first-load class - page transitions can now handle visibility
```

**Key Insights**:
- The `⏱️ Resources loaded...` log shows timing enforcement working
- `📝 Queued entrance animation` shows components registering for entrance sequence
- `🚀 Fired 'app:entrance-ready'` is dispatched by HeaderGrid after it completes
- `🎬 Playing N entrance animations` shows the master timeline starting
- `🔓 Removed is-first-load class` happens after animations, enabling page transitions
- Components animate in sequence based on their `position` parameters

## Troubleshooting

### Loader not visible

**Check if HTML is injected**:
```bash
curl -s http://localhost:3000 | grep app-initial-loader
```
If no output, Nitro plugin isn't running. Check `server/plugins/inject-loader.ts` exists.

**Check if CSS is in head**:
View page source (Cmd+U), search for `#app-initial-loader`. If not found, check `nuxt.config.ts` style injection.

**Check console for errors**: Look for plugin initialization logs.

### Minimum time not working

**Problem**: Changing `minLoadTime` has no effect

**Solution**: Make sure you're changing it in `app.vue`, NOT just the composable:
```javascript
// ✅ CORRECT - app/app.vue
initializeLoading({
  minLoadTime: 1000, // This value is actually used
});

// ❌ WRONG - changing only the default in composable
// app/composables/useLoadingSequence.js
minLoadTime = 1000, // This is just a fallback
```

**Verify**: Check console for `⏱️ Resources loaded in Xms, waiting Yms more (minLoadTime: Zms)` - the Z value should match your setting.

### Scroll offset after loading

**Symptoms**: Page starts at scrollTop 20-40px instead of 0

**Solution**: Already fixed with three-layer reset:
1. Plugin level: `window.scrollTo(0, 0)`
2. ScrollSmoother level: `scrollToTop()`
3. Both should show in logs

**Verify**: Check for these logs:
- `📍 Initial scroll position reset to top`
- `📍 ScrollSmoother scrolled to top`

### Loader visible too long

**Check current setting**:
```javascript
// app/app.vue - look at minLoadTime value
```

**Adjust timing**:
- Fast connection: 300-500ms recommended
- Slow connection: 800-1200ms recommended
- Testing: Use higher values (2000+) to see loader clearly

### Animations not starting

**Check event is fired**: Look for `🚀 Fired 'app:ready' event`

**Check components are listening**:
```javascript
window.addEventListener('app:start-animations', () => {
  console.log('Component received animation event');
}, { once: true });
```

**Check option**: Ensure `animateOnReady: true` in `app.vue`

### Fallback timeout triggered

**Warning**: `⚠️ Loader fallback timeout triggered`

**Meaning**: Loader was forced to remove after 10 seconds because `app:ready` event never fired.

**Common causes**:
- Resource loading failed (check for JavaScript errors)
- Store not marking resources as ready
- Loading sequence not firing event

**Debug**: Check which resources are stuck:
```javascript
// In browser console
window.__loadingStore = useLoadingStore()
console.log(window.__loadingStore.gsapReady) // Should be true
console.log(window.__loadingStore.fontsReady) // Should be true
```

### Entrance animations not playing

**Symptoms**: Components don't animate after header completes

**Check if system initialized**:
Look for `🎬 Entrance animation system initialized` in console

**Check if components queued**:
Look for `📝 Queued entrance animation for element:` logs

**Check if event fired**:
Look for `🚀 Fired 'app:entrance-ready' event` from HeaderGrid

**Common causes**:
- Component not in viewport on load (check viewport detection)
- `animateEntrance` prop set to `false`
- Element ref not available in `onMounted`
- HeaderGrid animation never completes

**Debug**:
```javascript
// In component
console.log('Element ref:', myElementRef.value)
console.log('Is first load:', isFirstLoad())

// Check if element is in viewport
const rect = myElementRef.value?.getBoundingClientRect()
const inViewport = rect && rect.top < window.innerHeight && rect.bottom > 0
console.log('In viewport:', inViewport)
```

### Animations play in wrong order

**Symptoms**: Components animate out of sequence

**Cause**: Position parameters not configured correctly

**Solution**: Review GSAP position parameter syntax:
- Use `'<-0.3'` for overlap (starts before previous ends)
- Use `'+=0.2'` for gap (starts after previous ends)
- Use `'<'` to start with previous animation
- Check that position parameters create logical sequence

**Verify timing**:
```javascript
// Add logs in animate function
animate: (el) => {
  console.log('Animating element:', el, 'at position:', options.position)
  // ... your animation
}
```

### ScrollTrigger fallback not working

**Symptoms**: Below-fold components don't animate on scroll

**Check if ScrollTrigger provided**:
```javascript
setupEntrance(el, {
  position: '+=0.2',
  animate: (el) => { /* ... */ },
  scrollTrigger: {  // Must provide this for fallback
    start: 'top 80%',
    once: true
  }
})
```

**Check console for errors**: Look for ScrollTrigger warnings

**Verify ScrollTrigger plugin loaded**: Check `nuxt.config.ts` has `scrollTrigger: true`

## Testing Theme-Aware Loader

**To test light/dark theme loader**:

1. **Test Manual Toggle (Priority)**:
   - Toggle theme using theme switcher button
   - localStorage stores 'theme: dark' or 'theme: light'
   - Hard refresh page (Cmd+Shift+R)
   - Loader should match your manual toggle choice
   - NO flash of wrong theme (FOUC prevented)

2. **Test System Preference (Fallback)**:
   - Clear localStorage: `localStorage.removeItem('theme')` in console
   - macOS: System Preferences → General → Appearance
   - Toggle between Light/Dark
   - Hard refresh (Cmd+Shift+R) - loader matches system theme

3. **Test Class-Based Detection** (No Media Query Conflicts):
   - Set system to dark mode
   - Toggle app to light theme manually
   - Hard refresh (Cmd+Shift+R)
   - **Expected**: Loader shows LIGHT theme (manual choice wins)
   - No CSS specificity conflicts

4. **Expected Behavior**:
   - Light theme: Light background (#fffaf5) + Dark spinner (#090925)
   - Dark theme: Dark background (#090925) + Light spinner (#fffaf5)
   - Loader matches theme BEFORE JavaScript loads
   - Manual toggle always overrides system preference
   - No FOUC - correct theme from first pixel
   - No media query conflicts - class-based only
   - Smooth transition when content appears

## Production Considerations

- Loader works in both dev and production
- SSR compatible (no client-only hacks)
- Nitro plugin ensures loader in initial HTML
- No FOUC (Flash of Unstyled Content)
- **Theme-aware** - respects `prefers-color-scheme` instantly
- Smooth transitions on all browsers
- Accessible (loader doesn't block screen readers after content loads)
- Colors match theme system exactly (`--color-light-100`/`--color-dark-100`)

## Quick Reference

### Files You'll Edit

| File | What to Change | Why |
|------|---------------|-----|
| `app/app.vue` | `minLoadTime` value | Control how long loader shows |
| `nuxt.config.ts` | Loader CSS styles | Change appearance (color, size, animation) |
| `app/components/*.vue` | Listen to `app:start-animations` | Trigger entrance animations |

### Files You Probably Won't Edit

| File | Purpose | Don't Touch Unless |
|------|---------|-------------------|
| `server/plugins/inject-loader.ts` | Inject HTML | Changing loader HTML structure |
| `app/plugins/loader-manager.client.js` | Remove loader | Changing removal logic/timing |
| `app/stores/loading.js` | Track state | Adding new resources to track |
| `app/composables/useLoadingSequence.js` | Orchestrate | Changing loading logic/flow |

### Common Tasks

**Make loader show longer**:
```javascript
// app/app.vue
minLoadTime: 1000, // 1 second
```

**Change loader colors**:
```javascript
// nuxt.config.ts (in style textContent)

// Light theme
background: #fffaf5;
border-top-color: #090925;

// Dark theme (inside @media query)
background: #090925;
border-top-color: #fffaf5;
```

**Add component entrance animation**:
```javascript
// your-component.vue
onMounted(() => {
  window.addEventListener('app:start-animations', () => {
    // Your GSAP animation here
  }, { once: true });
});
```

## Future Enhancements

- Add loading progress indicator (percentage)
- Support for image preloading with progress
- Multiple loader designs (light/dark themes)
- Configurable loader graphics/animations
- Per-route minimum loading times
