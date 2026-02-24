<template>
  <div
    ref="containerRef"
    class="animation-component animation-component--zaksa"
  >
    <div
      ref="logoRef"
      class="logo-animation-wrapper"
    >
      <div
        ref="innerLogoRef"
        class="logo-animation"
      >
        <ZaksaLogoSVG ref="svgComponentRef" />
      </div>
    </div>
  </div>
  <!--
    The wrapper structure mirrors the legacy index.html with minimal changes:
    .logo-animation-wrapper > .logo-animation > <svg/>
    Styles for these classes are defined globally in SCSS to match original layout.
  -->
</template>

<script setup lang="ts">
// Standard GSAP & tools from Nuxt app
import { scopeSvgDefsIds } from '~/utils/scopeSvgIds'

const { $gsap } = useNuxtApp()
const { $GSDevTools } = useNuxtApp()
const { $ScrollTrigger } = useNuxtApp()
const { $CustomBounce } = useNuxtApp()

// Core refs for the component container and inner logo area
const containerRef = ref(null)
const logoRef = ref(null)
const innerLogoRef = ref(null)
const timeline = ref(null)
let gsapCtx = null
let scrollTriggerInstance = null

// Child SVG component ref to access its exposed element refs
const svgComponentRef = ref(null)

// Props for configurability and parity with other animation components
const props = defineProps({
  /**
   * @type {boolean}
   * Show GSDevTools (minimal) for debugging
   */
  showDevTools: { type: Boolean, default: false },
  /**
   * @type {string}
   * Unique id for GSDevTools instance
   */
  devToolsId: {
    type: String,
    default: () => `zaksa-${Math.random().toString(36).slice(2, 9)}`
  },
  /**
   * @type {boolean}
   * Autoplay when ScrollTrigger is disabled
   */
  autoPlay: { type: Boolean, default: false },
  /**
   * @type {boolean}
   * Use ScrollTrigger to play/pause based on visibility
   */
  useScrollTrigger: { type: Boolean, default: true },
  /**
   * @type {string}
   * ScrollTrigger start position
   */
  stStart: { type: String, default: 'top center' },
  /**
   * @type {string}
   * ScrollTrigger end position
   */
  stEnd: { type: String, default: 'bottom center' },
  /**
   * @type {number}
   * Global playback speed for the Zaksa master timeline
   */
  timeScale: { type: Number, default: 6.5 }
})

/**
 * Resolve query helper scoped to the SVG root
 * @param {string} selector
 */
const qs = selector =>
  svgComponentRef.value?.svgRootRef?.querySelector(selector)
/**
 * Resolve queryAll helper scoped to the SVG root
 * @param {string} selector
 * @returns {Element[]}
 */
const qsa = selector =>
  Array.from(
    svgComponentRef.value?.svgRootRef?.querySelectorAll(selector) || []
  )

/**
 * Build the Zaksa animation timeline (ported from legacy app.js)
 * Uses GSAP 3 APIs and keeps original durations/eases where possible
 * @returns {GSAPTimeline|null}
 */
const createAnimation = () => {
  const svgRoot = svgComponentRef.value?.svgRootRef
  if (!svgRoot) {
    // console.warn('Zaksa: SVG root not found')
    return null
  }

  // Scope <defs> IDs to avoid collisions across the page
  // This utility only rewrites IDs inside <defs>, so runtime IDs like #letters remain intact
  const idPrefix
    = props.devToolsId || `zaksa-${Math.random().toString(36).slice(2, 6)}`
  scopeSvgDefsIds(svgRoot, idPrefix)

  // Create CustomBounce with squash pair; ease names "myBounce" and "myBounce-squash"
  try {
    $CustomBounce?.create('myBounce', { strength: 0.7, squash: 6 })
  }
  catch (e) {
    console.debug('Zaksa: CustomBounce setup issue', e)
  }

  // Element handles
  const animation = innerLogoRef.value // inner div .logo-animation that starts hidden
  const logoBcgBlue = qs('#logo-background-blue')
  const logoInnerBcgBlue = qs('#logo-inner-background-blue')
  const logoBcgWhite = qs('#logo-background-white')
  const bcg01 = qs('#background01')
  const bcg02 = qs('#background02')
  const textCity = qs('#text-city')
  const charOutline = qs('#char-outline')
  const char = qs('#char')
  const charFill = qs('#char-fill')
  const charFillLegL = qs('#char-fill-leg-l')
  const ball = qs('#ball')
  const stripeBlue = qs('#stripe-blue')
  const stripeRed = qs('#stripe-red')
  const stripeWhite = qs('#stripe-white')
  const _zaksa = qs('#text-zaksa')
  const legL = qs('#leg-l')
  const _legR = qs('#leg-r')
  const handL = qs('#hand-l')
  const handR = qs('#hand-r')
  const _torso = qs('#torso')
  const _head = qs('#head')
  const shineRect = qs('#shine rect')

  // Initial state: reveal container (legacy used visibility hidden on .logo-animation)
  $gsap.set(animation, { autoAlpha: 1 })

  // Ball bounce timeline
  const ballTl = $gsap.timeline()
  ballTl.to(ball, { duration: 10, y: 250, ease: 'myBounce' }).to(
    ball,
    {
      duration: 10,
      scaleY: 0.5,
      scaleX: 1.3,
      ease: 'myBounce-squash',
      transformOrigin: 'bottom'
    },
    0
  )

  // Character timeline
  const charTl = $gsap.timeline()
  charTl
    .add('playAll')
    .from(
      charOutline,
      { duration: 4, autoAlpha: 0, x: '+=50', y: '+=50', rotation: '-=8' },
      'playAll'
    )
    .to(
      handR,
      {
        duration: 4,
        rotation: '+=12',
        repeat: 1,
        yoyo: true,
        transformOrigin: '0% 90%'
      },
      'playAll'
    )
    .to(
      handL,
      {
        duration: 4,
        rotation: '-=12',
        repeat: 1,
        yoyo: true,
        transformOrigin: '100% 10%'
      },
      'playAll'
    )

  // Main sequence combining ball and character
  const ballAndCharTl = $gsap.timeline()
  ballAndCharTl
    .add(ballTl.reverse())
    .from(ball, { duration: 1, autoAlpha: 0 }, 0)
    .add(charTl, '-=1.5')
    .from([charFill, charFillLegL], { duration: 3, autoAlpha: 0 }, '-=0.6')
    .add('charMove')
    .to(
      ball,
      {
        duration: 4,
        rotation: '+=360',
        transformOrigin: '50% 50%',
        repeat: 1,
        ease: 'none'
      },
      'charMove-=10.9'
    )
    .to(
      char,
      { duration: 4, y: '+=10', repeat: 1, yoyo: true, ease: 'none' },
      'charMove-=3.8'
    )
    .from(bcg02, { duration: 3, scaleX: 0, transformOrigin: '50% 50%' })
    .from(
      [stripeBlue, stripeWhite, stripeRed],
      {
        duration: 1,
        autoAlpha: 0,
        transformOrigin: 'center center',
        stagger: 0.5
      },
      'charMove-=0.9'
    )

  // Final scene
  const finalSceneTl = $gsap.timeline()
  finalSceneTl
    .add('showFinal')
    .from(
      [logoBcgWhite, logoInnerBcgBlue],
      {
        duration: 1,
        autoAlpha: 0,
        y: '+=20',
        transformOrigin: 'center center'
      },
      'showFinal'
    )
    .to([legL, charFillLegL], { duration: 1, autoAlpha: 0 }, 'showFinal-=0.1')
    .from(
      [bcg01, logoBcgBlue],
      { duration: 3, scale: 0, transformOrigin: '50% 50%' },
      'showFinal'
    )
    .from(
      qsa('#letters > *'),
      {
        duration: 4,
        autoAlpha: 0,
        y: '-=5',
        ease: 'power1.inOut',
        stagger: 0.4
      },
      '-=1'
    )
    .from(textCity, { duration: 1, autoAlpha: 0 }, '-=2')

  // Master timeline (looped)
  const masterTl = $gsap.timeline({ repeat: -1, paused: true })
  masterTl.add(ballAndCharTl).add(finalSceneTl, '-=5').fromTo(
    shineRect,
    {
      autoAlpha: 0,
      transformOrigin: 'center center',
      yPercent: -50,
      xPercent: -50
    },
    {
      duration: 6,
      autoAlpha: 1,
      transformOrigin: 'center center',
      yPercent: 50,
      xPercent: 50
    }
  )

  // Apply requested playback speed to the master timeline
  masterTl.timeScale(props.timeScale)

  // Attach GSDevTools when requested
  if (props.showDevTools) {
    nextTick(() => {
      try {
        $GSDevTools.create({
          animation: masterTl,
          container: containerRef.value,
          minimal: true,
          id: props.devToolsId,
          globalSync: false
        })
        // Ensure timeScale remains applied after DevTools initialization
        masterTl.timeScale(props.timeScale)
      }
      catch (e) {
        console.debug('Zaksa: GSDevTools error', e)
      }
    })
  }

  timeline.value = masterTl
  return masterTl
}

// Lifecycle: mount, build animation, wire ScrollTrigger
onMounted(() => {
  nextTick(() => {
    gsapCtx = $gsap.context(() => {
      const tl = createAnimation()
      if (!tl) return

      if (props.useScrollTrigger && $ScrollTrigger) {
        scrollTriggerInstance = $ScrollTrigger.create({
          trigger: containerRef.value,
          start: props.stStart,
          end: props.stEnd,
          onEnter: () => tl.play(),
          onEnterBack: () => tl.play(),
          onLeave: () => tl.pause(0).progress(0),
          onLeaveBack: () => tl.pause(0).progress(0)
        })
        $ScrollTrigger.refresh()
      }
      else if (props.autoPlay) {
        tl.play()
      }
      else if (props.showDevTools) {
        // When DevTools is shown and no ScrollTrigger/autoPlay, start playback for visibility
        tl.play()
      }
    }, containerRef.value)
  })
})

// Cleanup
onUnmounted(() => {
  if (gsapCtx) gsapCtx.revert()
  if (scrollTriggerInstance) {
    try {
      scrollTriggerInstance.kill()
    }
    catch { /* ignore */ }
    scrollTriggerInstance = null
  }
  if (props.showDevTools) {
    try {
      $GSDevTools.getById?.(props.devToolsId)?.kill()
    }
    catch { /* ignore */ }
  }
})

// Public API for external control
defineExpose({
  containerRef,
  timeline,
  play: () => timeline.value?.play(),
  pause: () => timeline.value?.pause(),
  restart: () => timeline.value?.restart(),
  reverse: () => timeline.value?.reverse(),
  seek: time => timeline.value?.seek(time)
})
</script>

<style scoped>
/* Visual styles are centralized under app/assets/scss/components/_animation-components.scss */
</style>
