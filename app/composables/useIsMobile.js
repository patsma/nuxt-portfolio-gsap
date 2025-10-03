/**
 * Responsive breakpoint detection composable with SSR support
 *
 * Breakpoints synced with TailwindCSS and design system:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Laptop: 1024px - 1536px
 * - Large Desktop: 1536px - 3820px
 * - Extra Large Desktop: >= 3820px
 *
 * @returns {{
 *  isMobile: import('vue').ComputedRef<boolean>,
 *  isTablet: import('vue').ComputedRef<boolean>,
 *  isLaptop: import('vue').ComputedRef<boolean>,
 *  isDesktop: import('vue').ComputedRef<boolean>,
 *  isLargeDesktop: import('vue').ComputedRef<boolean>,
 *  isExtraLargeDesktop: import('vue').ComputedRef<boolean>
 * }}
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
export default function useIsMobile() {
  // Breakpoint constants matching TailwindCSS defaults
  const TABLET = 768
  const LAPTOP = 1024
  const LARGE_DESKTOP = 1536
  const EXTRA_LARGE_DESKTOP = 3820

  // Initialize with SSR-safe value
  const width = ref(0)

  /**
   * Update the current window width
   * Only runs on client-side
   */
  function update() {
    if (import.meta.client) {
      width.value = window.innerWidth
    }
  }

  // Client-side only lifecycle hooks
  onMounted(() => {
    update()
    if (import.meta.client) {
      window.addEventListener("resize", update, { passive: true })
    }
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener("resize", update)
    }
  })

  // Computed breakpoint flags
  const isMobile = computed(() => width.value < TABLET)
  const isTablet = computed(() => width.value >= TABLET && width.value < LAPTOP)
  const isLaptop = computed(() => width.value >= LAPTOP && width.value < LARGE_DESKTOP)
  const isDesktop = computed(() => width.value >= LAPTOP)
  const isLargeDesktop = computed(() => width.value >= LARGE_DESKTOP && width.value < EXTRA_LARGE_DESKTOP)
  const isExtraLargeDesktop = computed(() => width.value >= EXTRA_LARGE_DESKTOP)

  return {
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isLargeDesktop,
    isExtraLargeDesktop,
  }
}
