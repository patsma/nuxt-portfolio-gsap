# Fluid Gradient System

TresJS-based WebGL canvas background with theme-aware colors, scroll-reactive effects, and performance-optimized rendering.

## Overview

The FluidGradient is an always-visible animated background layer that:
- Renders a fluid noise-based gradient using custom GLSL shaders
- Smoothly transitions colors on theme changes (light/dark)
- Responds to scroll position with organic parameter variations
- Uses manual render mode with GSAP ticker for optimal performance

## Architecture

```
FluidGradient.vue (419 lines) - Orchestrator
├── TresCanvas (manual render mode)
│   └── FluidGradientScene.vue (110 lines) - Rendering
│       ├── TresOrthographicCamera [-1, 1, 1, -1]
│       └── TresMesh
│           ├── TresPlaneGeometry [2, 2]
│           └── TresShaderMaterial (uniforms + shaders)
└── .gradient-overlay (CSS overlay for theme neutralization)
```

**Why two components?**
- `FluidGradientScene` MUST be a child of `TresCanvas` to access `useTres()` composable
- This is a TresJS requirement - the scene component needs the Three.js context

## Key Features

### Theme-Aware Colors
- 4 corner colors that blend via shader noise
- GSAP-animated transitions between light/dark palettes
- Smooth 0.6s color interpolation on theme toggle

### Scroll-Reactive Effects
- `noiseScale`: Oscillates 3.0-5.5 creating "breathing" pattern
- `sectionIntensity`: Gentle brightness variation around 1.0
- Uses dual sine waves for organic feel (fast + slow wave)

### Performance Optimization
- **Desktop**: Full shader (60fps) with rotation + complex noise
- **Mobile**: Simplified shader (30fps) ~85% GPU reduction
- Manual render mode - only renders when `advance()` is called
- GSAP ticker integration for frame-synced updates

### Page Transition Masking
- Fades to 50% opacity during page transitions
- Masks rapid color changes when navigating between pages
- Smooth fade back in after transition completes

## Shader System

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `time` | float | Animation time (incremented each frame) |
| `scrollInfluence` | float | 0-1 global scroll progress |
| `sectionIntensity` | float | Brightness multiplier (~1.0) |
| `noiseScale` | float | Noise pattern tightness (3.0-5.5) |
| `colorTL` | vec3 | Top-left corner color (RGB 0-1) |
| `colorTR` | vec3 | Top-right corner color |
| `colorBL` | vec3 | Bottom-left corner color |
| `colorBR` | vec3 | Bottom-right corner color |

### Desktop Shader
- Rotation-based UV distortion (`rotate(uv, t * 0.05)`)
- Complex noise: `sin(x * scale + t) + cos(y * scale + t)`
- Uses `noiseScale` uniform for dynamic pattern control

### Mobile Shader
- No rotation (expensive operation removed)
- Simplified noise: `sin(x * 4.0 + y * 3.0 + t)`
- Fixed noise scale for consistent performance

## Color Palettes

```javascript
// Light theme - bright pastels
light: {
  tl: [1.0, 0.5, 0.7],  // Rose/pink
  tr: [0.5, 1.0, 0.6],  // Mint green
  bl: [0.6, 0.5, 1.0],  // Lavender
  br: [0.8, 1.0, 0.5]   // Lime
}

// Dark theme - deep saturated
dark: {
  tl: [0.25, 0.15, 0.4],  // Rich purple
  tr: [0.15, 0.25, 0.45], // Deep blue
  bl: [0.35, 0.15, 0.25], // Deep magenta
  br: [0.15, 0.35, 0.3]   // Deep teal
}
```

## Integration Points

### Stores
- `useThemeStore()` - Watches `isDark` for color transitions
- `usePageTransitionStore()` - Watches `isTransitioning` for opacity masking

### Composables
- `useEntranceAnimation()` - First load fade-in animation
- `useLoadingSequence()` - Checks `isFirstLoad()` for entrance setup
- `useIsMobile()` - Device detection for shader/fps selection

### GSAP
- `$gsap` - Color transition animations, opacity tweens
- `$ScrollTrigger` - Scroll-based parameter updates
- GSAP ticker - Frame loop for time uniform + render calls

## Scroll Tracking

```javascript
// Global scroll progress (0-1)
uniforms.scrollInfluence.value = progress

// Organic noise scale - breathing pattern
const wave1 = Math.sin(progress * Math.PI * 4) * 0.8  // Fast
const wave2 = Math.sin(progress * Math.PI * 1.5) * 0.4 // Slow
uniforms.noiseScale.value = 4.3 + wave1 + wave2

// Gentle intensity variation
const breathe = Math.sin(progress * Math.PI * 3) * 0.08
uniforms.sectionIntensity.value = 1.0 + breathe
```

## Public API

```javascript
defineExpose({
  containerRef,       // DOM element reference
  uniforms,           // Reactive shader uniforms (for external control)
  animateToTheme      // Function to trigger theme color animation
})
```

### Usage Example
```javascript
const fluidGradient = ref(null)

// Access uniforms for custom effects
fluidGradient.value.uniforms.sectionIntensity.value = 1.5

// Manually trigger theme animation
fluidGradient.value.animateToTheme(true) // to dark
```

## CSS Overlay

The `.gradient-overlay` div adds a neutral tone on top of the gradient:

```css
.gradient-overlay {
  background-color: var(--theme-100);
  opacity: 0.4;
  transition: opacity var(--duration-theme) var(--ease-power2);
}
```

This softens the colorful gradient to better match the overall theme palette.

## FluidGradientScene Details

The inner scene component handles the rendering loop:

```javascript
// GSAP ticker callback (runs every frame)
function onTick(time, deltaTime) {
  // Mobile throttling (30fps)
  if (isMobile && time - lastTickTime < 33.3ms) return

  // Update time uniform
  uniforms.time.value += deltaTime * 0.001

  // Trigger TresJS render
  advance()
}
```

**Key points:**
- Uses `useTres()` to get `advance()` function
- Registers/unregisters from GSAP ticker on mount/unmount
- Mobile devices throttled to 30fps (33.3ms intervals)

## Performance Notes

1. **Manual render mode** - TresCanvas only renders when `advance()` is called
2. **GSAP ticker sync** - Renders in sync with other GSAP animations
3. **Mobile shader** - Removes rotation math, uses simpler noise function
4. **Frame throttling** - Mobile limited to 30fps to save battery
5. **No antialiasing on mobile** - `:antialias="!isMobile"` saves GPU cycles

## Debugging

Check these if gradient isn't rendering:
1. `isMounted` must be true (component uses `v-if="isMounted"`)
2. `#smooth-content` must exist for scroll tracking
3. GSAP must be available (`$gsap`, `$ScrollTrigger`)
4. TresCanvas needs WebGL support in browser

Console warnings:
- `[FluidGradient] No smooth-content found` - scroll tracking disabled
