/**
 * useScrollTriggerInit - Coordinates ScrollTrigger initialization with page transitions
 *
 * Abstracts the repetitive pattern of initializing ScrollTrigger animations
 * that need to coordinate with the loading system and page transitions.
 *
 * Handles:
 * - First load vs navigation timing (isFirstLoad check)
 * - pageTransitionStore watching for navigation completion
 * - nextTick coordination for DOM readiness
 * - Automatic cleanup on unmount
 *
 * @example
 * ```typescript
 * // In component setup
 * let scrollTriggerInstance: ScrollTriggerInstance | null = null
 *
 * useScrollTriggerInit(
 *   () => {
 *     // Initialize ScrollTrigger
 *     scrollTriggerInstance = $ScrollTrigger.create({ ... })
 *   },
 *   () => {
 *     // Cleanup
 *     scrollTriggerInstance?.kill()
 *     scrollTriggerInstance = null
 *   }
 * )
 * ```
 */
export const useScrollTriggerInit = (
  initFn: () => void,
  cleanupFn?: () => void
): void => {
  const loadingStore = useLoadingStore()
  const pageTransitionStore = usePageTransitionStore()

  onMounted(() => {
    // First load: Initialize immediately after mount
    if (loadingStore.isFirstLoad) {
      nextTick(initFn)
    }
    else {
      // After page navigation: Wait for page transition to complete
      // Watch pageTransitionStore.isTransitioning for proper timing
      const unwatch = watch(
        () => pageTransitionStore.isTransitioning,
        (isTransitioning) => {
          // When transition completes (isTransitioning becomes false), initialize
          if (!isTransitioning) {
            nextTick(initFn)
            unwatch()
          }
        },
        { immediate: true }
      )
    }
  })

  onUnmounted(() => {
    cleanupFn?.()
  })
}
