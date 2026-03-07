/**
 * Resize reload plugin
 *
 * Width change → always reload (all viewport sizes)
 * Height change → reload only on desktop (≥1024px)
 *
 * Mobile height changes are ignored — Safari URL bar show/hide triggers
 * false positive reloads without affecting GSAP/ScrollSmoother state.
 */
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  const DESKTOP_BREAKPOINT = 1024
  const initialWidth = window.innerWidth
  const initialHeight = window.innerHeight

  const checkAndReload = (): void => {
    const currentWidth = window.innerWidth
    const currentHeight = window.innerHeight

    const widthChanged = currentWidth !== initialWidth
    const heightChanged = currentHeight !== initialHeight
    const isDesktop = currentWidth >= DESKTOP_BREAKPOINT

    // Always reload on width change (catches mobile↔desktop crossings too)
    if (widthChanged) {
      reloadNuxtApp({ ttl: 1000, persistState: false })
      return
    }

    // On desktop, also reload on height change — GSAP calculations go stale
    // On mobile, ignore height changes — Safari URL bar triggers false positives
    if (heightChanged && isDesktop) {
      reloadNuxtApp({ ttl: 1000, persistState: false })
    }
  }

  const handleResize = useDebounceFn(checkAndReload, 500)

  window.addEventListener('resize', handleResize, { passive: true })
})
