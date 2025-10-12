/**
 * Page Transitions Plugin
 *
 * Registers all page transition directives globally with Vue.
 * This makes them available in any component without explicit imports.
 *
 * Runs on BOTH server and client for SSR compatibility.
 * Directives include getSSRProps() to handle server-side rendering.
 *
 * Available directives:
 * - v-page-split: SplitText character/word/line animations
 * - v-page-fade: Fade in/out with optional directional movement
 * - v-page-clip: Clip-path reveals from any direction
 * - v-page-stagger: Stagger child elements with any animation type
 */

import vPageSplit from '~/directives/v-page-split'
import vPageFade from '~/directives/v-page-fade'
import vPageClip from '~/directives/v-page-clip'
import vPageStagger from '~/directives/v-page-stagger'

export default defineNuxtPlugin((nuxtApp) => {
  // Register all page transition directives
  nuxtApp.vueApp.directive('page-split', vPageSplit)
  nuxtApp.vueApp.directive('page-fade', vPageFade)
  nuxtApp.vueApp.directive('page-clip', vPageClip)
  nuxtApp.vueApp.directive('page-stagger', vPageStagger)

  console.log('✅ Page transition directives registered!')
  console.log('   - v-page-split:chars | :words | :lines')
  console.log('   - v-page-fade:in | :out | :up | :down | :left | :right')
  console.log('   - v-page-clip:top | :bottom | :left | :right')
  console.log('   - v-page-stagger:fade | :clip | :scale')
})
