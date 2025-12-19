# Elastic Border System

Physics-based wobbly border effect using spring simulation. Borders bend organically when the mouse hovers near them, with velocity-sensitive physics for natural momentum and overshoot.

## Table of Contents
1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Physics Configuration](#physics-configuration)
4. [Usage](#usage)
5. [CSS Requirements](#css-requirements)
6. [Technical Details](#technical-details)

---

## Overview

**File:** `app/components/FullWidthBorder.vue`

**Features:**
- Physics-based spring simulation for organic movement
- Velocity-sensitive: faster mouse movement = more dramatic bending
- Natural overshoot and oscillation on fast movements
- Quadratic bezier curve for rope-like bending
- Proximity-based triggering (~120px detection zone)
- Disabled on mobile/touch devices for performance
- Theme-aware stroke color using CSS custom properties

**Visual Behavior:**
- **Slow mouse movement** → Gentle, smooth bending that follows cursor
- **Fast mouse movement** → Dramatic overshoot with spring-back
- **Quick swipe across** → Border whips and oscillates before settling
- **Mouse leaves area** → Smooth spring-back to straight line

---

## How It Works

### Spring Physics Model

The border uses a spring physics simulation rather than direct position mapping:

```
┌─────────────────────────────────────────┐
│  Spring State                           │
│  ─────────────                          │
│  position: current Y displacement       │
│  velocity: current movement speed       │
│  target: where we want to be            │
│                                         │
│  Each frame:                            │
│  1. Calculate spring force → target     │
│  2. Apply force to velocity             │
│  3. Apply damping to velocity           │
│  4. Update position from velocity       │
└─────────────────────────────────────────┘
```

### SVG Structure

Uses a single quadratic bezier curve anchored at both ends:

```
M 0 50 Q controlX controlY width 50
│       │
│       └── Control point moves up/down based on physics
└── Line starts and ends at center (y=50 in 100px tall SVG)
```

**Why quadratic bezier?**
- Simpler than cubic (one control point vs two)
- Natural rope-like curve
- Endpoints stay fixed (anchored)
- Control point follows mouse horizontally, displacement vertically

---

## Physics Configuration

### Tunable Parameters

```typescript
// Detection and displacement
const PROXIMITY_THRESHOLD = 120  // pixels - how close mouse needs to be
const MAX_DISPLACEMENT = 40      // pixels - maximum bend amount

// Spring physics
const SPRING_STIFFNESS = 0.08    // Lower = more lag/momentum (range: 0.05-0.2)
const SPRING_DAMPING = 0.82      // Higher = less bounce (range: 0.7-0.95)
const VELOCITY_INFLUENCE = 3.0   // How much mouse speed affects bend (range: 1-5)
```

### Parameter Effects

| Parameter | Low Value | High Value |
|-----------|-----------|------------|
| `SPRING_STIFFNESS` | Sluggish, laggy response | Snappy, immediate response |
| `SPRING_DAMPING` | More bounce/oscillation | Quick settling |
| `VELOCITY_INFLUENCE` | Subtle velocity effect | Dramatic whip on fast movement |
| `PROXIMITY_THRESHOLD` | Must be very close | Triggers from far away |
| `MAX_DISPLACEMENT` | Subtle bends | Dramatic bends |

### Recommended Presets

**Subtle/Professional:**
```typescript
SPRING_STIFFNESS = 0.12
SPRING_DAMPING = 0.88
VELOCITY_INFLUENCE = 1.5
MAX_DISPLACEMENT = 25
```

**Playful/Bouncy:**
```typescript
SPRING_STIFFNESS = 0.06
SPRING_DAMPING = 0.75
VELOCITY_INFLUENCE = 4.0
MAX_DISPLACEMENT = 50
```

---

## Usage

### Basic Usage

```vue
<!-- Default: 15% opacity, no extra spacing -->
<FullWidthBorder />

<!-- Custom opacity (0-100) -->
<FullWidthBorder :opacity="10" />

<!-- With spacing below -->
<FullWidthBorder :opacity="15" spacing="var(--space-m)" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `opacity` | Number | 15 | Border opacity percentage (0-100) |
| `spacing` | String | '0' | Bottom margin spacing (CSS value) |

### Inside Content Grid

```vue
<section class="content-grid">
  <div class="full-width-content relative">
    <FullWidthBorder />
    <!-- Content here -->
  </div>
</section>
```

---

## CSS Requirements

### Parent Container Must Be Positioned

The border uses `position: absolute` to avoid affecting layout. **Parent elements must have `position: relative`**.

```vue
<!-- ✅ CORRECT: Parent has relative positioning -->
<div class="marquee-wrapper full-width-content relative">
  <FullWidthBorder :opacity="15" />
  <MarqueeContent />
</div>

<!-- ❌ WRONG: Border will position relative to wrong ancestor -->
<div class="marquee-wrapper full-width-content">
  <FullWidthBorder :opacity="15" />
  <MarqueeContent />
</div>
```

### Component Classes

Classes automatically applied to handle positioning:

```css
.full-width-border-svg {
  grid-column: full-width;     /* Span entire content-grid width */
  width: 100%;                  /* Full width of parent */
  height: 100px;                /* Space for bend effect (line at center) */
  margin-bottom: calc(-50px + var(--border-spacing));  /* Offset to not affect layout */
  pointer-events: none;         /* Don't interfere with content below */
  position: absolute;           /* Positioned relative to nearest positioned ancestor */
  top: 0;
  left: 0;
  transform: translate(0, -50%);  /* Center line on parent's top edge */
}
```

### Why 100px Height?

The SVG needs vertical space for the bend effect:
- Line sits at `y=50` (center of 100px height)
- Max displacement is 40px up or down
- Gives comfortable margin for overshoot

The `margin-bottom: calc(-50px + var(--border-spacing))` compensates so it doesn't affect layout.

---

## Technical Details

### Physics Loop (requestAnimationFrame)

The animation runs via requestAnimationFrame for smooth 60fps updates:

```typescript
const runPhysicsLoop = () => {
  // 1. Calculate spring force toward target
  const forceY = (spring.target - spring.position) * SPRING_STIFFNESS

  // 2. Apply force to velocity
  spring.velocity += forceY

  // 3. Apply damping (friction)
  spring.velocity *= SPRING_DAMPING

  // 4. Update position
  spring.position += spring.velocity

  // 5. Smooth X position tracking
  spring.controlX += (spring.targetX - spring.controlX) * 0.15

  // 6. Update SVG path directly (no GSAP tween)
  pathRef.value.setAttribute('d', generateRopePath(...))

  // 7. Continue if still moving
  if (isStillMoving) {
    requestAnimationFrame(runPhysicsLoop)
  }
}
```

### Velocity Tracking

Mouse velocity is calculated between frames:

```typescript
const trackVelocity = (e: MouseEvent) => {
  const now = performance.now()
  const dt = now - lastMouseTime

  if (dt > 0 && dt < 100) {
    // Normalize to ~16ms (one frame)
    mouseVelocityY = ((e.clientY - lastMouseY) / dt) * 16
  }

  lastMouseY = e.clientY
  lastMouseTime = now
}
```

### Mouse Proximity Detection

```typescript
const handleMouseMove = (e: MouseEvent) => {
  const rect = svgRef.value.getBoundingClientRect()
  const lineY = rect.top + rect.height / 2  // Line center
  const distanceY = e.clientY - lineY
  const proximity = Math.abs(distanceY)

  if (proximity < PROXIMITY_THRESHOLD) {
    // Calculate intensity (1 at line, 0 at threshold)
    const intensity = 1 - proximity / PROXIMITY_THRESHOLD

    // Direction: bend toward cursor
    const direction = distanceY > 0 ? 1 : -1

    // Base + velocity boost
    const baseDisplacement = direction * MAX_DISPLACEMENT * intensity
    const velocityBoost = mouseVelocityY * VELOCITY_INFLUENCE * intensity

    spring.target = baseDisplacement + velocityBoost
    spring.targetX = mouseX  // Follow mouse horizontally

    startPhysicsLoop()
  } else {
    spring.target = 0  // Spring back to straight
  }
}
```

### Mobile Detection

Effect is disabled on touch devices:

```typescript
const checkMobile = () => {
  isMobile.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// In mousemove handler
if (isMobile.value) return
```

### Cleanup

Proper cleanup on unmount:

```typescript
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', updateWidth)

  if (physicsFrame) {
    cancelAnimationFrame(physicsFrame)
    physicsFrame = null
  }
})
```

---

## Troubleshooting

### Border Not Visible

1. **Check parent positioning** - Must have `position: relative`
2. **Check z-index** - May be behind other content
3. **Check opacity prop** - Default is 15%, might be too subtle

### Border in Wrong Position

1. **Missing `relative` on parent** - Border positions to wrong ancestor
2. **Wrong grid column** - Should be inside `.full-width-content`

### Animation Not Working

1. **On mobile?** - Effect is disabled on touch devices
2. **Check console** - Look for errors in physics loop
3. **Mouse too far** - Must be within 120px of line

### Performance Issues

1. **Too many borders** - Each has its own physics loop
2. **Lower physics parameters** - Reduce `VELOCITY_INFLUENCE`
3. **Increase `SPRING_DAMPING`** - Faster settling = fewer frames

---

## Files

- `app/components/FullWidthBorder.vue` - Main component with physics
- `.claude/ELASTIC_BORDER.md` - This documentation
- `.claude/COMPONENT_PATTERNS.md` - General component patterns (update needed)
