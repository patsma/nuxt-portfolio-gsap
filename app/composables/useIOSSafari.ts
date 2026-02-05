/**
 * useIOSSafari
 *
 * Detects iOS Safari browser for applying Safari-specific fixes,
 * particularly for the iOS 26+ Liquid Glass effect.
 *
 * Detection excludes Chrome on iOS (CriOS) and Firefox on iOS (FxiOS)
 * since those browsers don't use Safari's rendering engine for glass effect.
 *
 * @see .claude/SAFARI_LIQUID_GLASS.md for full documentation
 */
export function useIOSSafari() {
  const isIOSSafari = computed(() => {
    if (!import.meta.client) return false

    const ua = navigator.userAgent

    // iOS device check
    const isIOS = /iPad|iPhone|iPod/.test(ua)

    // Safari check (excludes Chrome/Firefox on iOS)
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)

    return isIOS && isSafari
  })

  return { isIOSSafari }
}
