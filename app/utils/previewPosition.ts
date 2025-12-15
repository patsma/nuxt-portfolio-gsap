/**
 * Preview Position Utilities
 *
 * Centralized position calculation and bounds checking for the
 * Interactive Case Study preview system.
 *
 * Features:
 * - DRY bounds checking (eliminates duplicate code)
 * - Section-relative coordinate conversion
 * - Viewport constraint validation
 * - Configurable offset and padding
 */

// ============================================================================
// Types
// ============================================================================

export interface PreviewPositionParams {
  cursorX: number
  cursorY: number
  sectionRect: DOMRect
  previewRect: DOMRect
  offsetX?: number
  padding?: number
  centerY?: boolean
}

export interface PreviewPosition {
  x: number
  y: number
  clamped: boolean
  clampReason: string
  original: { x: number, y: number }
}

export interface ViewportConstraints {
  width: number
  height: number
  padding: number
  maxX: number
  maxY: number
  minX: number
  minY: number
}

export interface ElementValidation {
  valid: boolean
  missing: string[]
}

// ============================================================================
// Functions
// ============================================================================

/**
 * Calculate preview position with bounds checking
 *
 * Calculates section-relative position then converts to viewport coordinates.
 * This accounts for ScrollSmoother's transform on the section.
 */
export const calculatePreviewPosition = ({
  cursorX,
  cursorY,
  sectionRect,
  previewRect,
  offsetX = 30,
  padding = 20,
  centerY = true
}: PreviewPositionParams): PreviewPosition => {
  // Extract dimensions
  const previewWidth = previewRect.width
  const previewHeight = previewRect.height

  // Convert cursor from viewport coords to section-relative coords
  // This accounts for ScrollSmoother's transform on the section
  const sectionRelativeX = cursorX - sectionRect.left
  const sectionRelativeY = cursorY - sectionRect.top

  // Calculate position relative to section
  const relativeX = sectionRelativeX + offsetX
  let relativeY = sectionRelativeY

  // Center preview vertically on cursor if requested
  if (centerY) {
    relativeY -= previewHeight / 2
  }

  // Convert back to viewport coordinates (for fixed positioning)
  let targetX = sectionRect.left + relativeX
  let targetY = sectionRect.top + relativeY

  // Store original position for clamping detection
  const originalX = targetX
  const originalY = targetY
  let clamped = false
  const clampReasons: string[] = []

  // Get viewport dimensions
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Bounds checking - keep preview on screen

  // Check right edge
  if (targetX + previewWidth > viewportWidth - padding) {
    targetX = viewportWidth - previewWidth - padding
    clamped = true
    clampReasons.push('viewport right edge')
  }

  // Check left edge
  if (targetX < padding) {
    targetX = padding
    clamped = true
    clampReasons.push('viewport left edge')
  }

  // Check top edge
  if (targetY < padding) {
    targetY = padding
    clamped = true
    clampReasons.push('viewport top edge')
  }

  // Check bottom edge
  if (targetY + previewHeight > viewportHeight - padding) {
    targetY = viewportHeight - previewHeight - padding
    clamped = true
    clampReasons.push('viewport bottom edge')
  }

  return {
    x: targetX,
    y: targetY,
    clamped,
    clampReason: clampReasons.join(', '),
    original: { x: originalX, y: originalY }
  }
}

/**
 * Validate that required DOM elements exist
 */
export const validateElements = (elements: Record<string, unknown>): ElementValidation => {
  const missing = Object.entries(elements)
    .filter(([, el]) => !el)
    .map(([name]) => name)

  return {
    valid: missing.length === 0,
    missing
  }
}

/**
 * Get viewport constraints for preview positioning
 *
 * Useful for pre-calculating constraints before multiple position calculations.
 */
export const getViewportConstraints = (padding = 20): ViewportConstraints => {
  const width = window.innerWidth
  const height = window.innerHeight

  return {
    width,
    height,
    padding,
    maxX: width - padding,
    maxY: height - padding,
    minX: padding,
    minY: padding
  }
}

/**
 * Check if a position is within viewport bounds
 */
export const isPositionValid = (
  position: { x: number, y: number },
  previewRect: DOMRect,
  padding = 20
): boolean => {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Position is already in viewport coords (fixed positioning)
  const viewportX = position.x
  const viewportY = position.y

  // Check all edges
  const rightEdge = viewportX + previewRect.width
  const bottomEdge = viewportY + previewRect.height

  return (
    viewportX >= padding
    && viewportY >= padding
    && rightEdge <= viewportWidth - padding
    && bottomEdge <= viewportHeight - padding
  )
}
