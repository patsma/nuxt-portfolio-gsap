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
 *
 * Usage:
 * ```javascript
 * const position = calculatePreviewPosition({
 *   cursorX: 500,
 *   cursorY: 300,
 *   sectionRect: sectionRef.getBoundingClientRect(),
 *   previewRect: previewRef.getBoundingClientRect(),
 *   offsetX: 30,
 *   padding: 20
 * })
 * // Returns: { x: 530, y: 150, clamped: false }
 * ```
 */

/**
 * Calculate preview position with bounds checking
 *
 * Calculates section-relative position then converts to viewport coordinates.
 * This accounts for ScrollSmoother's transform on the section.
 *
 * @param {Object} params - Position calculation parameters
 * @param {number} params.cursorX - Cursor X position (viewport coords)
 * @param {number} params.cursorY - Cursor Y position (viewport coords)
 * @param {DOMRect} params.sectionRect - Section bounding rect (accounts for ScrollSmoother transform)
 * @param {DOMRect} params.previewRect - Preview bounding rect
 * @param {number} [params.offsetX=30] - Horizontal offset in pixels (default: 30)
 * @param {number} [params.padding=20] - Edge padding in pixels (default: 20)
 * @param {boolean} [params.centerY=true] - Center preview vertically on cursor (default: true)
 * @returns {Object} Position object { x, y, clamped, clampReason }
 */
export const calculatePreviewPosition = ({
  cursorX,
  cursorY,
  sectionRect,
  previewRect,
  offsetX = 30,
  padding = 20,
  centerY = true,
}) => {
  // Extract dimensions
  const previewWidth = previewRect.width;
  const previewHeight = previewRect.height;

  // Convert cursor from viewport coords to section-relative coords
  // This accounts for ScrollSmoother's transform on the section
  const sectionRelativeX = cursorX - sectionRect.left;
  const sectionRelativeY = cursorY - sectionRect.top;

  // Calculate position relative to section
  let relativeX = sectionRelativeX + offsetX;
  let relativeY = sectionRelativeY;

  // Center preview vertically on cursor if requested
  if (centerY) {
    relativeY -= previewHeight / 2;
  }

  // Convert back to viewport coordinates (for fixed positioning)
  let targetX = sectionRect.left + relativeX;
  let targetY = sectionRect.top + relativeY;

  // Store original position for clamping detection
  const originalX = targetX;
  const originalY = targetY;
  let clamped = false;
  const clampReasons = [];

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Bounds checking - keep preview on screen

  // Check right edge
  if (targetX + previewWidth > viewportWidth - padding) {
    targetX = viewportWidth - previewWidth - padding;
    clamped = true;
    clampReasons.push('viewport right edge');
  }

  // Check left edge
  if (targetX < padding) {
    targetX = padding;
    clamped = true;
    clampReasons.push('viewport left edge');
  }

  // Check top edge
  if (targetY < padding) {
    targetY = padding;
    clamped = true;
    clampReasons.push('viewport top edge');
  }

  // Check bottom edge
  if (targetY + previewHeight > viewportHeight - padding) {
    targetY = viewportHeight - previewHeight - padding;
    clamped = true;
    clampReasons.push('viewport bottom edge');
  }

  return {
    x: targetX,
    y: targetY,
    clamped,
    clampReason: clampReasons.join(', '),
    original: { x: originalX, y: originalY },
  };
};

/**
 * Validate that required DOM elements exist
 *
 * @param {Object} elements - Object with element references
 * @returns {Object} Validation result { valid, missing }
 */
export const validateElements = (elements) => {
  const missing = Object.entries(elements)
    .filter(([, el]) => !el)
    .map(([name]) => name);

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Get viewport constraints for preview positioning
 *
 * Useful for pre-calculating constraints before multiple position calculations.
 *
 * @param {number} [padding=20] - Edge padding in pixels
 * @returns {Object} Constraints { width, height, padding, maxX, maxY }
 */
export const getViewportConstraints = (padding = 20) => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    padding,
    maxX: width - padding,
    maxY: height - padding,
    minX: padding,
    minY: padding,
  };
};

/**
 * Check if a position is within viewport bounds
 *
 * @param {Object} position - Position { x, y } (viewport coords)
 * @param {DOMRect} previewRect - Preview bounding rect
 * @param {number} [padding=20] - Edge padding in pixels
 * @returns {boolean} True if position is valid
 */
export const isPositionValid = (position, previewRect, padding = 20) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Position is already in viewport coords (fixed positioning)
  const viewportX = position.x;
  const viewportY = position.y;

  // Check all edges
  const rightEdge = viewportX + previewRect.width;
  const bottomEdge = viewportY + previewRect.height;

  return (
    viewportX >= padding &&
    viewportY >= padding &&
    rightEdge <= viewportWidth - padding &&
    bottomEdge <= viewportHeight - padding
  );
};
