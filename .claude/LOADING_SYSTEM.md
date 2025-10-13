# Loading System Documentation

A state-based loading system with visual loader, resource verification, and entrance animation sequencing.

## Architecture

### Flow

```
1. SSR Response → Loader HTML + CSS injected (Nitro plugin)
2. Browser Loads → Loader visible immediately
3. Vue Hydrates → Loader manager plugin runs, scroll reset to top
4. Resource Loading → Fonts, GSAP, ScrollSmoother, page content
5. Minimum Time Enforced → Ensures consistent UX (default 800ms)
6. Ready State → Fires 'app:ready' event
7. Loader Fade Out → 500ms transition
8. Content Fade In → Entrance animations start
9. Complete → Normal page interaction
```

## Key Files

### 1. `server/plugins/inject-loader.ts` (Nitro Plugin)
**Purpose**: Injects loader HTML into SSR response BEFORE it's sent to browser

```typescript
nitroApp.hooks.hook('render:html', (html) => {
  html.bodyAppend.unshift(`
    <div id="app-initial-loader">
      <div class="app-loader-spinner"></div>
    </div>
  `);
});
```

### 2. `nuxt.config.ts` (CSS Injection)
**Purpose**: Injects loader styles into `<head>` that render immediately

```javascript
app: {
  head: {
    style: [
      {
        textContent: `/* Loader styles */`
      }
    ]
  }
}
```

**Key Styles**:
- `#app-initial-loader` - Fixed overlay with dark background
- `.app-loader-spinner` - 48px spinning circle (0.8s rotation)
- `.fade-out` - Opacity transition (0.5s)
- `#__nuxt` - Hidden initially, fades in when loaded

### 3. `app/plugins/loader-manager.client.js` (Client Plugin)
**Purpose**: Manages loader removal when app is ready

**Key Functions**:
- Resets scroll to top immediately (`window.scrollTo(0, 0)`)
- Listens for `app:ready` event from loading store
- Fades out loader and shows content
- Removes loader from DOM after transition
- 5-second fallback timeout for safety

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
    checkFonts: true,
    minLoadTime: 800,
    animateOnReady: true,
  });
});
```

## Timing Configuration

### Current Settings

| Component | Value | Purpose |
|-----------|-------|---------|
| Minimum Display Time | 800ms | Ensures loader is visible, prevents flash |
| Loader Fade Out | 500ms | Smooth opacity transition |
| Content Fade In | 400ms | Smooth appearance of content |
| Animation Delay | 100ms | Small delay before entrance animations |

### Adjusting Timing

**To change minimum loader display time**, edit `app/app.vue`:
```javascript
initializeLoading({
  minLoadTime: 1200, // Show loader for at least 1.2 seconds
});
```

**To change fade transitions**, edit `nuxt.config.ts`:
```css
#app-initial-loader {
  transition: opacity 0.6s ease-out; /* Longer fade out */
}
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

Expected logs during loading:

```
🎨 Loader manager plugin initialized
📍 Initial scroll position reset to top
🔄 Loading started
✅ GSAP ready
✅ Fonts ready
✅ ScrollSmoother ready
✅ Page scroll position reset to top
📍 ScrollSmoother scrolled to top
✅ Page content ready
🚀 App resources ready! Loading took 450ms
⏱️ Loading took 450ms, waiting 350ms more (minLoadTime: 800ms)
🎯 Loading sequence complete - ready to show content
🚀 App ready event received: {duration: 800, isFirstLoad: true}
🎭 Fading out loader...
🎬 Header entrance animation started
✨ Loader removed from DOM
✨ Header entrance complete
```

## Troubleshooting

### Loader not visible
1. Check Nitro plugin is injecting HTML: `curl http://localhost:3000 | grep app-initial-loader`
2. Check CSS is in `<head>`: View page source, look for styles
3. Check console for errors

### Scroll offset after loading
1. Verify scroll reset logs: `📍 ScrollSmoother scrolled to top`
2. Check ScrollSmoother is initialized before reset
3. Try increasing delay before `scrollToTop()` call

### Loader visible too long/short
1. Check `minLoadTime` setting in `app.vue`
2. Check console for timing logs: `⏱️ Loading took...`
3. Adjust value based on needs (faster connections = longer minimum time)

### Animations not starting
1. Check `app:start-animations` event is fired
2. Verify components are listening for event
3. Check `animateOnReady: true` in loading options

## Production Considerations

- Loader works in both dev and production
- SSR compatible (no client-only hacks)
- Nitro plugin ensures loader in initial HTML
- No FOUC (Flash of Unstyled Content)
- Smooth transitions on all browsers
- Accessible (loader doesn't block screen readers after content loads)

## Future Enhancements

- Add loading progress indicator (percentage)
- Support for image preloading
- Add custom loader animations/graphics
- Support for multiple themes (dark/light loader)
- Lazy load non-critical resources after loader
