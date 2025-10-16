/**
 * Composable for displaying live Tokyo time
 * Updates every second with proper cleanup
 *
 * @returns {{ tokyoTime: import('vue').Ref<string> }}
 */
export function useTokyoTime() {
  const tokyoTime = ref(getCurrentTokyoTime());

  /**
   * Get current Tokyo time formatted for display
   * Format: "Jun 18, 20:00:23"
   *
   * @returns {string} Formatted Tokyo time string
   */
  function getCurrentTokyoTime() {
    const now = new Date();

    // Tokyo is UTC+9
    const tokyoOffset = 9 * 60;
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + tokyoOffset);

    return now.toLocaleString('en-US', {
      timeZone: 'Asia/Tokyo',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /** @type {NodeJS.Timeout | undefined} */
  let intervalId;

  // Start updating time every second when mounted
  onMounted(() => {
    intervalId = setInterval(() => {
      tokyoTime.value = getCurrentTokyoTime();
    }, 1000);
  });

  // Clean up interval when component unmounts
  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return { tokyoTime };
}
