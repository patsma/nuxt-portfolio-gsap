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
- `.theme-dark` - Class-based dark theme (manual toggle - priority)
- `@media (prefers-color-scheme: dark)` - Media query dark theme (system preference - fallback)
- `.fade-out` - Opacity transition (0.5s)
- `#__nuxt` - Hidden initially, fades in when loaded

**Theme Colors**:
- **Light theme**: `#fffaf5` background + `#090925` spinner (matches theme system)
- **Dark theme**: `#090925` background + `#fffaf5` spinner
- Colors match `--color-light-100` and `--color-dark-100` from theme tokens

**Theme Detection Priority**:
1. `.theme-dark` class (manual user toggle stored in localStorage) - highest priority
2. `@media (prefers-color-scheme: dark)` (system preference) - fallback
3. Light theme (default)

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

### HeaderGrid Entrance Animation
Example integration in `app/components/HeaderGrid.vue`:

```javascript
onMounted(() => {
  const { isFirstLoad } = useLoadingSequence();

  if (isFirstLoad()) {
    // Hide elements initially
    $gsap.set(containerRef.value, { autoAlpha: 0 });

    // Listen for animation start
    window.addEventListener('app:start-animations', () => {
      const tl = $gsap.timeline();
      tl.to(containerRef.value, { autoAlpha: 1, duration: 0.6 });
      // ... more animations
    }, { once: true });
  }
});
```

## Console Output

Expected logs during loading (with `minLoadTime: 300`):

```
🎨 [Nitro] Loader HTML injected into SSR response
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
✨ Loader removed from DOM
✨ Header entrance complete
```

**Key Insight**: The `⏱️ Resources loaded...` log shows the timing enforcement working. If resources load in 45ms but `minLoadTime: 300`, it waits 255ms more to ensure consistent UX.

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

3. **Test with DevTools**:
   - Open DevTools → Rendering tab
   - Find "Emulate CSS media feature prefers-color-scheme"
   - Toggle between light/dark
   - Hard refresh (Cmd+Shift+R) - loader updates instantly

4. **Expected Behavior**:
   - Light mode: Light background (#fffaf5) + Dark spinner (#090925)
   - Dark mode: Dark background (#090925) + Light spinner (#fffaf5)
   - Loader matches theme BEFORE JavaScript loads
   - Manual toggle overrides system preference
   - No FOUC - correct theme from first pixel
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
