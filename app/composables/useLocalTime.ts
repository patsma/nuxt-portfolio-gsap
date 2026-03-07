/**
 * Composable for displaying live local time in a configurable timezone
 * Updates every second with proper cleanup using VueUse
 * Configured via app.config.ts identity.timezone setting
 */
import type { Ref } from 'vue'
import type { Pausable } from '@vueuse/core'

export interface LocalTimeReturn extends Pausable {
  localTime: Ref<string>
  timezone: Ref<string | null>
  isEnabled: Ref<boolean>
}

/**
 * Get current time formatted for display in specified timezone
 * Format: "Jun 18, 20:00:23"
 */
function getCurrentTime(timezone: string): string {
  const now = new Date()

  return now.toLocaleString('en-US', {
    timeZone: timezone,
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Get live local time based on app.config.ts timezone setting
 * Returns controls to pause/resume the interval if needed
 *
 * @example
 * ```ts
 * const { localTime, isEnabled } = useLocalTime()
 *
 * // In template:
 * <span v-if="isEnabled">{{ localTime }}</span>
 * ```
 */
export function useLocalTime(): LocalTimeReturn {
  const config = useAppConfig()

  // Get timezone from config, default to null (disabled)
  const timezone = computed(() => config.identity?.timezone ?? null)
  const isEnabled = computed(() => timezone.value !== null)

  // Initialize time if enabled
  const localTime = ref(
    isEnabled.value && timezone.value
      ? getCurrentTime(timezone.value)
      : ''
  )

  /**
   * Update time value
   * Called every second by VueUse useIntervalFn
   */
  const updateTime = (): void => {
    if (isEnabled.value && timezone.value) {
      localTime.value = getCurrentTime(timezone.value)
    }
  }

  // Auto-start interval when composable is used, auto-cleanup on unmount
  // VueUse handles lifecycle automatically - no need for onMounted/onUnmounted
  const { pause, resume, isActive } = useIntervalFn(updateTime, 1000, {
    immediate: isEnabled.value
  })

  return {
    localTime,
    timezone,
    isEnabled,
    pause,
    resume,
    isActive
  }
}

// Re-export for backwards compatibility
export { useLocalTime as useTokyoTime }
