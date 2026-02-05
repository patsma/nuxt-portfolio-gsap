<script setup lang="ts">
/**
 * Progressive Glass Test Layout
 *
 * Enable components one by one to find what breaks Safari iOS glass effect.
 * Change STEP constant and rebuild to test each level.
 *
 * NOTE: FluidGradient is in app.vue (global), not in layouts.
 * This layout controls whether to SHOW it by removing entrance-animate hiding.
 *
 * TESTING PROTOCOL:
 * 1. Set STEP = 0
 * 2. Build: npm run build && npm run preview -- --host 0.0.0.0
 * 3. Test on iOS Safari
 * 4. If works: increment STEP, rebuild, retest
 * 5. If breaks: document which step broke it
 */

// ============================================
// STEP CONFIG - Change this to test each step
// ============================================
const STEP = 4

// Expose step for template
const currentStep = STEP

const config = {
  showFluidGradient: STEP >= 5, // Step 5: WebGL background (from app.vue)
  showHeader: STEP >= 6, // Step 6: Fixed header
  showLoadingIndicator: STEP >= 7, // Step 7: Loading indicator
  useScrollSmoother: STEP >= 8, // Step 8: ScrollSmoother wrapper
  showFooter: STEP >= 9, // Step 9: Footer
  showCursorDot: STEP >= 10, // Step 10: Cursor dot
}

// Test colors - dramatic so you can see the difference
const stepColors: Record<number, { bg: string, text: string, name: string }> = {
  0: { bg: '#ffffff', text: '#000000', name: 'White' },
  1: { bg: '#ff0000', text: '#ffffff', name: 'Red (dramatic test)' },
  2: { bg: '#0000ff', text: '#ffffff', name: 'Blue (dramatic test)' },
  3: { bg: '#fffaf5', text: '#000000', name: 'Off-white (theme light)' },
  4: { bg: '#090925', text: '#ffffff', name: 'Dark blue (theme dark)' },
  5: { bg: 'transparent', text: '#ffffff', name: '+ FluidGradient (z:-1, 150vh, top:-25vh)' },
  6: { bg: '#090925', text: '#ffffff', name: '+ HeaderGrid (fixed)' },
  7: { bg: '#090925', text: '#ffffff', name: '+ LoadingIndicator' },
  8: { bg: '#090925', text: '#ffffff', name: '+ ScrollSmoother' },
  9: { bg: '#090925', text: '#ffffff', name: '+ Footer' },
  10: { bg: '#090925', text: '#ffffff', name: '+ CursorDot' },
}

const currentColor = computed(() => stepColors[STEP] || stepColors[0])

// Body color based on step
onMounted(async () => {
  // For step 5+ with z-index: -1, body must be transparent to see gradient
  if (config.showFluidGradient) {
    document.body.style.backgroundColor = 'transparent'
    document.documentElement.style.backgroundColor = 'transparent'
    // Also target Nuxt wrapper
    const nuxtApp = document.getElementById('__nuxt')
    if (nuxtApp) nuxtApp.style.backgroundColor = 'transparent'
  } else {
    document.body.style.backgroundColor = currentColor.value.bg
  }

  // Remove is-first-load class which may lock scroll and hide elements
  document.documentElement.classList.remove('is-first-load')

  // Ensure body/html allow scrolling
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''

  // Wait for DOM to be fully updated (FluidGradient is in app.vue)
  await nextTick()

  // Control FluidGradient visibility (it's in app.vue with data-entrance-animate="true")
  const fluidGradient = document.querySelector('.fluid-gradient') as HTMLElement | null

  if (fluidGradient) {
    if (config.showFluidGradient) {
      // Step 5+: Show FluidGradient by overriding entrance-animate hiding
      fluidGradient.style.opacity = '1'
      fluidGradient.style.visibility = 'visible'

      // Safari iOS glass fix: z-index -1 puts canvas behind body layer
      fluidGradient.style.zIndex = '-1'
      // Make huge to cover iOS Safari dynamic bars + overscroll bounce
      fluidGradient.style.height = '200vh'
      fluidGradient.style.top = '-50vh'
    } else {
      // Step < 5: Hide FluidGradient completely
      fluidGradient.style.opacity = '0'
      fluidGradient.style.visibility = 'hidden'
    }
  }
})

onUnmounted(() => {
  document.body.style.backgroundColor = ''
  document.documentElement.style.backgroundColor = ''
  const nuxtApp = document.getElementById('__nuxt')
  if (nuxtApp) nuxtApp.style.backgroundColor = ''

  // Restore FluidGradient to default state
  const fluidGradient = document.querySelector('.fluid-gradient') as HTMLElement | null
  if (fluidGradient) {
    fluidGradient.style.opacity = ''
    fluidGradient.style.visibility = ''
    fluidGradient.style.zIndex = ''
    fluidGradient.style.height = ''
    fluidGradient.style.top = ''
  }
})
</script>

<template>
  <div class="min-h-screen relative z-10" :style="{ color: currentColor.text }">
    <!-- Step 5: FluidGradient is in app.vue (global) - we show/hide it via JS above -->

    <!-- Step 7: Loading Indicator (at top) -->
    <NuxtLoadingIndicator
      v-if="config.showLoadingIndicator"
      :height="6"
      color="var(--theme-text-60)"
    />

    <!-- Step 6: Header (fixed) -->
    <HeaderGrid v-if="config.showHeader" />

    <!-- Step 10: Cursor Dot -->
    <CursorDot v-if="config.showCursorDot" />

    <!-- Step indicator (fixed at top) -->
    <div class="fixed top-0 left-0 right-0 z-50 p-3 text-center text-sm font-bold" :style="{ backgroundColor: currentColor.bg, color: currentColor.text, borderBottom: '2px solid currentColor' }">
      STEP {{ currentStep }}: {{ currentColor.name }} ({{ currentColor.bg }})
    </div>

    <!-- Content wrapper (Step 8: ScrollSmoother IDs) -->
    <div :id="config.useScrollSmoother ? 'smooth-wrapper' : undefined">
      <div :id="config.useScrollSmoother ? 'smooth-content' : undefined">
        <div class="pt-12">
          <!-- pt-12 to offset fixed step indicator -->
          <slot />
        </div>

        <!-- Step 9: Footer -->
        <FooterSection v-if="config.showFooter">
          <template #linkedin>
            linkedin.com/in/mortengust
          </template>
          <template #behance>
            behance.net/mschristensen
          </template>
          <template #email>
            contact@mschristensen.com
          </template>
        </FooterSection>

        <!-- Bottom indicator: pushed way below natural viewport with transform -->
        <div
          class="h-[50px] flex items-center justify-center text-sm font-bold"
          style="background-color: #ff00ff; color: white; transform: translateY(500px);"
        >
          ⬇️ END OF CONTENT ⬇️
        </div>
      </div>
    </div>
  </div>
</template>
