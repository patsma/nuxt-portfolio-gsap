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

  <TresMesh>
    <TresPlaneGeometry :args="[2, 2]" />
    <TresShaderMaterial
      :uniforms="uniforms"
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
 */

import { useTres } from '@tresjs/core'

interface UniformValue<T> {
  value: T
}

interface Props {
  uniforms: {
    time: UniformValue<number>
    colorTL: UniformValue<number[]>
    colorTR: UniformValue<number[]>
    colorBL: UniformValue<number[]>
    colorBR: UniformValue<number[]>
  }
  vertexShader: string
  fragmentShader: string
  isMobile: boolean
}

const props = defineProps<Props>()

const { $gsap } = useNuxtApp()
const { advance } = useTres()

// Animation state (non-reactive for performance)
let isActive = true
let lastTickTime = 0

// Mobile throttle: 30fps = ~33.3ms per frame
const MOBILE_FRAME_INTERVAL = 1000 / 30

/**
 * GSAP ticker callback
 * Runs every frame (synced with browser's requestAnimationFrame)
 *
 * @param time - Current time in ms since GSAP started
 * @param deltaTime - Time since last tick in ms
 */
function onTick(time: number, deltaTime: number): void {
  if (!isActive) return

  // Frame rate throttling on mobile
  if (props.isMobile) {
    if (time - lastTickTime < MOBILE_FRAME_INTERVAL) return
    lastTickTime = time
  }

  // Update time uniform (convert deltaTime ms to reasonable increment)
  // Using a small multiplier to keep the animation speed similar to before
  props.uniforms.time.value += deltaTime * 0.001

  // Trigger TresJS render
  advance()
}

onMounted(() => {
  // Register ticker callback
  $gsap.ticker.add(onTick)
})

onUnmounted(() => {
  // Stop animation and clean up
  isActive = false
  $gsap.ticker.remove(onTick)
})
</script>
