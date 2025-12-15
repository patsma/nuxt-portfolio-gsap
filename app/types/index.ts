/**
 * Shared TypeScript types for the application
 *
 * Add types here when they're used across multiple files.
 * Keep component-specific types co-located with the component.
 */

// ============================================================================
// Loading System Types
// ============================================================================

/**
 * Loading status states for the app initialization sequence
 */
export type LoadingStatus = 'initial' | 'loading' | 'ready' | 'animating' | 'complete'

/**
 * Loading store state shape
 */
export interface LoadingState {
  status: LoadingStatus
  gsapReady: boolean
  scrollSmootherReady: boolean
  pageReady: boolean
  fontsReady: boolean
  isFirstLoad: boolean
  startTime: number | null
  readyTime: number | null
}

// ============================================================================
// Theme Types
// ============================================================================

/**
 * Theme store state shape
 */
export interface ThemeState {
  isDark: boolean
}

/**
 * Theme values
 */
export type Theme = 'dark' | 'light'

// ============================================================================
// Menu Types
// ============================================================================

/**
 * Menu store state shape
 */
export interface MenuState {
  isOpen: boolean
}

// ============================================================================
// Page Transition Types
// ============================================================================

/**
 * Page transition states for the state machine
 */
export type PageTransitionStatus = 'idle' | 'fading-out' | 'swapping' | 'fading-in'

/**
 * Page transition store state shape
 */
export interface PageTransitionState {
  state: PageTransitionStatus
  isTransitioning: boolean
  contentElement: HTMLElement | null
  cleanupFns: Array<() => void>
}

// ============================================================================
// Title Rotation Types
// ============================================================================

/**
 * Title rotation store state shape
 */
export interface TitleRotationState {
  textArray: string[]
  currentIndex: number
}

// ============================================================================
// Hints Types
// ============================================================================

/**
 * Hints store - uses setup syntax, so no state interface needed
 * The store exposes these methods:
 * - hasShown(hintKey: string): boolean
 * - markAsShown(hintKey: string): void
 * - loadPersistedHints(): void
 * - resetHints(): void
 */
