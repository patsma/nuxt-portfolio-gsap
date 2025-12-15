/**
 * Composable for displaying live Tokyo time
 * Updates every second with proper cleanup using VueUse
 */
import type { Ref } from 'vue'
import type { Pausable } from '@vueuse/core'

export interface TokyoTimeReturn extends Pausable {
  tokyoTime: Ref<string>
}

/**
 * Get current Tokyo time formatted for display
 * Format: "Jun 18, 20:00:23"
 */
function getCurrentTokyoTime(): string {
  const now = new Date()

  // Tokyo is UTC+9
  const tokyoOffset = 9 * 60
  now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + tokyoOffset)

  return now.toLocaleString('en-US', {
    timeZone: 'Asia/Tokyo',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function useTokyoTime(): TokyoTimeReturn {
  const tokyoTime = ref(getCurrentTokyoTime())

  /**
   * Update Tokyo time value
   * Called every second by VueUse useIntervalFn
   */
  const updateTime = (): void => {
    tokyoTime.value = getCurrentTokyoTime()
  }

  // Auto-start interval when composable is used, auto-cleanup on unmount
  // VueUse handles lifecycle automatically - no need for onMounted/onUnmounted
  const { pause, resume, isActive } = useIntervalFn(updateTime, 1000)

  return {
    tokyoTime,
    pause, // Exposed for manual control if needed
    resume, // Exposed for manual control if needed
    isActive // Exposed to check if interval is running
  }
}
