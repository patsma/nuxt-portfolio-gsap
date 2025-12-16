/**
 * Clamp a value between min and max bounds
 * Automatically swaps min/max if provided in wrong order
 */
export const clamp = (
  value: number,
  min: number = 0,
  max: number = 1
): number => {
  if (min > max) [min, max] = [max, min]
  return Math.max(min, Math.min(max, value))
}

/**
 * Normalize a value from one scale to another (linear interpolation)
 */
export const normalize = (
  value: number,
  currentMin: number,
  currentMax: number,
  newMin: number = 0,
  newMax: number = 1
): number => {
  const normalized = (value - currentMin) / (currentMax - currentMin)
  return (newMax - newMin) * normalized + newMin
}

/**
 * Normalize with automatic clamping to target range
 */
export const clampedNormalize = (
  value: number,
  currentMin: number,
  currentMax: number,
  newMin: number = 0,
  newMax: number = 1
): number => {
  return clamp(
    normalize(value, currentMin, currentMax, newMin, newMax),
    newMin,
    newMax
  )
}

/**
 * Exponential/curved interpolation for non-linear mappings
 * Use exponent > 1 for ease-in curve, < 1 for ease-out curve
 */
export const exponentialNormalize = (
  value: number,
  currentMin: number,
  currentMax: number,
  newMin: number = 0,
  newMax: number = 1,
  exponent: number = 2
): number => {
  const normalized = (value - currentMin) / (currentMax - currentMin)
  const exponential = Math.pow(normalized, exponent)
  return newMin + (newMax - newMin) * exponential
}
