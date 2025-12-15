/**
 * Responsive breakpoint detection composable powered by VueUse
 *
 * Uses VueUse's optimized useBreakpoints with proper debouncing and SSR support.
 * Provides the same API as the previous custom implementation for backward compatibility.
 *
 * Breakpoints synced with TailwindCSS and design system:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Laptop: 1024px - 1536px
 * - Large Desktop: 1536px - 3820px
 * - Extra Large Desktop: >= 3820px
 *
 * @example
 * ```vue
 * <script setup>
 * const { isMobile, isTablet } = useIsMobile()
 * </script>
 *
 * <template>
 *   <div v-if="isMobile">Mobile view</div>
 *   <div v-else-if="isTablet">Tablet view</div>
 * </template>
 * ```
 */
import type { Ref } from 'vue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

export interface BreakpointFlags {
  isMobile: Ref<boolean>
  isTablet: Ref<boolean>
  isLaptop: Ref<boolean>
  isDesktop: Ref<boolean>
  isLargeDesktop: Ref<boolean>
  isExtraLargeDesktop: Ref<boolean>
}

export default function useIsMobile(): BreakpointFlags {
  // Extend Tailwind breakpoints with custom 3xl breakpoint for extra large desktop
  const breakpoints = useBreakpoints({
    ...breakpointsTailwind,
    '3xl': 3820 // Custom extra large desktop breakpoint
  })

  // Computed breakpoint flags matching the previous custom implementation API
  // VueUse provides optimized resize handling with proper debouncing and SSR safety
  return {
    isMobile: breakpoints.smaller('md'), // < 768px
    isTablet: breakpoints.between('md', 'lg'), // 768px - 1024px
    isLaptop: breakpoints.between('lg', '2xl'), // 1024px - 1536px
    isDesktop: breakpoints.greaterOrEqual('lg'), // >= 1024px
    isLargeDesktop: breakpoints.between('2xl', '3xl'), // 1536px - 3820px
    isExtraLargeDesktop: breakpoints.greaterOrEqual('3xl') // >= 3820px
  }
}
