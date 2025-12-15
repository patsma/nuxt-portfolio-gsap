/**
 * Types for page transition directives
 *
 * These types define the configuration stored on elements by v-page-* directives.
 * The usePageTransition composable reads these configs to animate elements.
 */

// ============================================================================
// Direction Types
// ============================================================================

export type ClipDirection = 'top' | 'bottom' | 'left' | 'right'
export type FadeDirection = 'up' | 'down' | 'left' | 'right'
export type SplitType = 'chars' | 'words' | 'lines'
export type AnimateFrom = 'below' | 'above'

// ============================================================================
// Config Types
// ============================================================================

export interface ClipConfig {
  direction: ClipDirection
  duration: number
  ease: string
  leaveOnly: boolean
}

export interface FadeConfig {
  direction: FadeDirection
  distance: number
  duration: number
  ease: string
  leaveOnly: boolean
}

export interface StaggerConfig {
  selector: string
  stagger: number
  duration: number
  ease: string
  leaveOnly: boolean
}

export interface SplitConfig {
  splitType: SplitType
  stagger: number
  duration: number
  ease: string
  y: number
  animateFrom?: AnimateFrom
  leaveOnly: boolean
}

// ============================================================================
// Animation Storage Type
// ============================================================================

export type PageAnimationType = 'clip' | 'fade' | 'stagger' | 'split'

export interface PageAnimation {
  type: 'clip'
  config: ClipConfig
}

export interface PageFadeAnimation {
  type: 'fade'
  config: FadeConfig
}

export interface PageStaggerAnimation {
  type: 'stagger'
  config: StaggerConfig
}

export interface PageSplitAnimation {
  type: 'split'
  config: SplitConfig
}

export type PageAnimationConfig
  = | PageAnimation
    | PageFadeAnimation
    | PageStaggerAnimation
    | PageSplitAnimation

// ============================================================================
// Extended HTMLElement with animation config
// ============================================================================

export interface PageAnimationElement extends HTMLElement {
  _pageAnimation?: PageAnimationConfig
}

// ============================================================================
// Binding Value Types (what users pass to directives)
// ============================================================================

export interface ClipBindingValue {
  duration?: number
  ease?: string
  leaveOnly?: boolean
}

export interface FadeBindingValue {
  distance?: number
  duration?: number
  ease?: string
  leaveOnly?: boolean
}

export interface StaggerBindingValue {
  selector?: string
  stagger?: number
  duration?: number
  ease?: string
  leaveOnly?: boolean
}

export interface SplitBindingValue {
  stagger?: number
  duration?: number
  ease?: string
  y?: number
  animateFrom?: AnimateFrom
  leaveOnly?: boolean
}
