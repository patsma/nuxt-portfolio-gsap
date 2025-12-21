# Magnetic Effect System

Spring physics composable for organic magnetic hover effects. Elements gently pull toward the cursor when nearby, with natural overshoot and oscillation.

## Table of Contents
1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Technical Details](#technical-details)

---

## Overview

**File:** `app/composables/useMagnetic.ts`

**Features:**
- Spring physics simulation for organic movement
- Velocity tracking: faster mouse = more dramatic pull
- `timeScale` option: stretch animation in time while keeping spring character
- Proximity-based activation (configurable threshold)
- Auto-disabled on mobile/touch devices
- Automatic cleanup on unmount

**Visual Behavior:**
- **Cursor approaches** → Element gently drifts toward cursor
- **Cursor within threshold** → Element follows with spring lag
- **Fast cursor movement** → More dramatic pull with velocity boost
- **Cursor leaves** → Smooth spring-back to origin with oscillation

---

## How It Works

### Spring Physics Model

Same physics model as FullWidthBorder (see ELASTIC_BORDER.md):

```
┌─────────────────────────────────────────┐
│  Spring State                           │
│  ─────────────                          │
│  x, y: current position offset          │
│  targetX, targetY: where we want to be  │
│  velocityX, velocityY: movement speed   │
│                                         │
│  Each frame:                            │
│  1. Calculate spring force → target     │
│  2. Apply force to velocity             │
│  3. Apply damping to velocity           │
│  4. Update position from velocity       │
│  5. Apply timeScale to all steps        │
└─────────────────────────────────────────┘
```

### Time Scale

The `timeScale` option stretches the animation in time without changing the spring character:

```typescript
// Normal speed - bouncy but fast
timeScale: 1.0

// Slow motion - same bounce, 40% speed
timeScale: 0.4

// Very slow - dreamy, floaty feel
timeScale: 0.25
```

---

## Configuration

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `threshold` | 150 | Detection radius in pixels |
| `maxDisplacement` | 28 | Maximum movement in pixels |
| `strength` | 0.5 | Pull strength (0-1) |
| `stiffness` | 0.08 | Spring stiffness (higher = faster response) |
| `damping` | 0.85 | Spring damping (higher = less bounce) |
| `velocityInfluence` | 1.5 | Mouse velocity effect multiplier |
| `timeScale` | 1.0 | Animation speed (lower = slower) |

### Presets

**Subtle/Professional:**
```typescript
useMagnetic(ref, {
  threshold: 120,
  maxDisplacement: 20,
  strength: 0.3,
  stiffness: 0.08,
  damping: 0.88,
  velocityInfluence: 0.8,
  timeScale: 0.5
})
```

**Organic/Fluid (ScrollButtonSVG):**
```typescript
useMagnetic(ref, {
  threshold: 150,
  maxDisplacement: 28,
  strength: 0.5,
  stiffness: 0.08,
  damping: 0.82,
  velocityInfluence: 1.5,
  timeScale: 0.4
})
```

**Playful/Bouncy:**
```typescript
useMagnetic(ref, {
  threshold: 180,
  maxDisplacement: 35,
  strength: 0.6,
  stiffness: 0.1,
  damping: 0.75,
  velocityInfluence: 2.5,
  timeScale: 0.6
})
```

---

## Usage

### Basic Usage

```vue
<script setup lang="ts">
import useMagnetic from '~/composables/useMagnetic'

const buttonRef = ref<HTMLElement | null>(null)

// Apply magnetic effect with defaults
useMagnetic(buttonRef)
</script>

<template>
  <button ref="buttonRef">Hover me</button>
</template>
```

### With Custom Options

```vue
<script setup lang="ts">
import useMagnetic from '~/composables/useMagnetic'

const cardRef = ref<HTMLElement | null>(null)

const { isActive } = useMagnetic(cardRef, {
  threshold: 200,
  maxDisplacement: 30,
  timeScale: 0.4
})
</script>

<template>
  <div ref="cardRef" :class="{ 'is-magnetic': isActive }">
    Card content
  </div>
</template>
```

### Return Values

```typescript
const { isActive, offsetX, offsetY } = useMagnetic(ref, options)

// isActive: Ref<boolean> - true when cursor within threshold
// offsetX: Ref<number> - current X offset in pixels
// offsetY: Ref<number> - current Y offset in pixels
```

---

## Technical Details

### Velocity Tracking

Mouse velocity is tracked between frames for organic feel:

```typescript
const trackMouseVelocity = (e: MouseEvent) => {
  const now = performance.now()
  const dt = now - lastMouseTime

  if (dt > 0 && dt < 100) {
    // Normalize to ~16ms (one frame) for consistent feel
    mouseVelocityX = ((e.clientX - lastMouseX) / dt) * 16
    mouseVelocityY = ((e.clientY - lastMouseY) / dt) * 16
  }

  lastMouseX = e.clientX
  lastMouseY = e.clientY
  lastMouseTime = now
}
```

### Physics Loop

Runs via requestAnimationFrame, stops when settled:

```typescript
const runPhysics = () => {
  // Spring force (scaled by timeScale)
  const forceX = (spring.targetX - spring.x) * config.stiffness * config.timeScale

  // Apply force to velocity
  spring.velocityX += forceX

  // Damping (adjusted for timeScale)
  const effectiveDamping = 1 - (1 - config.damping) * config.timeScale
  spring.velocityX *= effectiveDamping

  // Update position (scaled by timeScale)
  spring.x += spring.velocityX * config.timeScale

  // Apply transform
  element.style.transform = `translate(${spring.x}px, ${spring.y}px)`

  // Continue if still moving, else stop (performance)
  if (isStillMoving) {
    requestAnimationFrame(runPhysics)
  }
}
```

### Mobile Detection

Effect is disabled on touch devices:

```typescript
onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  if (isMobile.value || isTouchDevice.value) return

  // Setup listeners...
})
```

### Cleanup

Proper cleanup on unmount:

```typescript
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseleave', handleMouseLeave)

  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
  }
})
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Effect not working | On mobile/touch device | Expected - disabled for performance |
| Too fast/bouncy | timeScale too high | Lower timeScale (try 0.3-0.5) |
| Too slow/sluggish | timeScale too low | Raise timeScale (try 0.6-0.8) |
| Not enough movement | maxDisplacement too low | Increase maxDisplacement |
| Triggers too early | threshold too high | Lower threshold |
| No spring bounce | damping too high | Lower damping (try 0.75-0.82) |

---

## Files

- `app/composables/useMagnetic.ts` - Main composable
- `app/components/SVG/ScrollButtonSVG.vue` - Example usage
- `.claude/MAGNETIC_EFFECT.md` - This documentation
