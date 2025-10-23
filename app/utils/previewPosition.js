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
 * Converts viewport cursor coordinates to section-relative coordinates,
 * applies offset, and clamps to viewport bounds to prevent overflow.
 *
 * @param {Object} params - Position calculation parameters
 * @param {number} params.cursorX - Cursor X position (viewport coords)
 * @param {number} params.cursorY - Cursor Y position (viewport coords)
 * @param {DOMRect} params.sectionRect - Section bounding rect
 * @param {DOMRect} params.previewRect - Preview bounding rect
 * @param {number} [params.offsetX=30] - Horizontal offset in pixels (default: 30)
 * @param {number} [params.offsetY=0] - Vertical offset in pixels (default: 0)
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
  offsetY = 0,
  padding = 20,
  centerY = true,
}) => {
  // Extract dimensions
  const previewWidth = previewRect.width;
  const previewHeight = previewRect.height;

  // Convert viewport coordinates to section-relative coordinates
  let targetX = (cursorX - sectionRect.left) + offsetX;
  let targetY = (cursorY - sectionRect.top) + offsetY;

  // Center preview vertically on cursor if requested
  if (centerY) {
    targetY -= previewHeight / 2;
  }

  // Store original position for clamping detection
  const originalX = targetX;
  const originalY = targetY;
  let clamped = false;
  const clampReasons = [];

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Bounds checking - keep preview on screen (viewport-relative)

  // Check right edge (convert back to viewport coords for check)
  if (sectionRect.left + targetX + previewWidth > viewportWidth - padding) {
    targetX = viewportWidth - sectionRect.left - previewWidth - padding;
    clamped = true;
    clampReasons.push('viewport right edge');
  }

  // Check left edge
  if (sectionRect.left + targetX < padding) {
    targetX = padding - sectionRect.left;
    clamped = true;
    clampReasons.push('viewport left edge');
  }

  // Check top edge
  if (sectionRect.top + targetY < padding) {
    targetY = padding - sectionRect.top;
    clamped = true;
    clampReasons.push('viewport top edge');
  }

  // Check bottom edge
  if (sectionRect.top + targetY + previewHeight > viewportHeight - padding) {
    targetY = viewportHeight - sectionRect.top - previewHeight - padding;
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
    .filter(([_, el]) => !el)
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
 * @param {Object} position - Position { x, y }
 * @param {DOMRect} previewRect - Preview bounding rect
 * @param {DOMRect} sectionRect - Section bounding rect
 * @param {number} [padding=20] - Edge padding in pixels
 * @returns {boolean} True if position is valid
 */
export const isPositionValid = (position, previewRect, sectionRect, padding = 20) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Convert section-relative to viewport coords
  const viewportX = sectionRect.left + position.x;
  const viewportY = sectionRect.top + position.y;

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
