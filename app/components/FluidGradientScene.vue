<template>
  <!--
    Inner scene component for FluidGradient.
    Lives inside TresCanvas to access useTres() context.
    Handles GSAP ticker integration for efficient manual rendering.
  -->
  <TresOrthographicCamera
    :args="[-1, 1, 1, -1, 0.1, 10]"
    :position="{ z: 1 }"
  />

  <TresMesh ref="meshRef">
    <TresPlaneGeometry :args="[2, 2]" />
    <TresShaderMaterial
      :uniforms="internalUniforms"
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
    />
  </TresMesh>
</template>

<script setup lang="ts">
/**
 * FluidGradientScene
 *
 * Inner component that renders the actual gradient mesh.
 * Must be a child of TresCanvas to access useTres() composable.
 *
 * Responsibilities:
 * - Hook into GSAP ticker for efficient frame updates
 * - Update time uniform each frame
 * - Call advance() to trigger manual render
 * - Throttle to 30fps on mobile devices
 * - Manage its own copy of uniforms for Three.js
 */

import { useTres } from '@tresjs/core'

interface UniformValue<T> {
  value: T
}

interface Uniforms {
  time: UniformValue<number>
  scrollInfluence: UniformValue<number>
  sectionIntensity: UniformValue<number>
  noiseScale: UniformValue<number>
  colorTL: UniformValue<number[]>
  colorTR: UniformValue<number[]>
  colorBL: UniformValue<number[]>
  colorBR: UniformValue<number[]>
}

interface Props {
  uniforms: Uniforms
  vertexShader: string
  fragmentShader: string
  isMobile: boolean
}

const props = defineProps<Props>()

const { $gsap } = useNuxtApp()
const { advance } = useTres()

// Mesh ref for potential direct access
const meshRef = ref(null)

// Create our OWN uniforms object - plain JS, no Vue reactivity
// This is what Three.js will actually use
const internalUniforms: Uniforms = {
  time: { value: 0 },
  scrollInfluence: { value: 0 },
  sectionIntensity: { value: 1.0 },
  noiseScale: { value: 4.3 },
  colorTL: { value: [...props.uniforms.colorTL.value] },
  colorTR: { value: [...props.uniforms.colorTR.value] },
  colorBL: { value: [...props.uniforms.colorBL.value] },
  colorBR: { value: [...props.uniforms.colorBR.value] }
}

// Type assertion for GSAP ticker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gsapWithTicker = $gsap as any

// Animation state (non-reactive for performance)
let isActive = true
let frameCount = 0

// Mobile throttle: render every 2nd frame for ~30fps (assuming 60fps base)
const MOBILE_FRAME_SKIP = 2

/**
 * Update color uniforms - called from parent during theme animation
 */
function updateColors(
  tl: number[],
  tr: number[],
  bl: number[],
  br: number[]
): void {
  internalUniforms.colorTL.value = tl
  internalUniforms.colorTR.value = tr
  internalUniforms.colorBL.value = bl
  internalUniforms.colorBR.value = br
}

/**
 * GSAP ticker callback
 * Runs every frame (synced with browser's requestAnimationFrame)
 *
 * @param _time - Total time in seconds since GSAP started (unused)
 * @param deltaTime - Time since last tick in milliseconds
 */
function onTick(_time: number, deltaTime: number): void {
  if (!isActive) return

  frameCount++

  // Frame rate throttling on mobile - skip every other frame for ~30fps
  if (props.isMobile && frameCount % MOBILE_FRAME_SKIP !== 0) {
    return
  }

  // Update time uniform (deltaTime is in ms, convert to reasonable increment)
  internalUniforms.time.value += deltaTime * 0.001

  // Trigger TresJS render
  advance()
}

onMounted(() => {
  // Register ticker callback
  gsapWithTicker.ticker.add(onTick)
})

onUnmounted(() => {
  // Stop animation and clean up
  isActive = false
  gsapWithTicker.ticker.remove(onTick)
})

// Expose updateColors method for parent to call
defineExpose({
  updateColors,
  internalUniforms
})
</script>
