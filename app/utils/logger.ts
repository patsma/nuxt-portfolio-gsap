/**
 * Smart Logging System for Interactive Case Study Preview
 *
 * Provides comprehensive, namespaced logging with state tracking,
 * performance monitoring, and error detection for easy debugging.
 *
 * Features:
 * - Namespaced logs (e.g., [PREVIEW:STATE], [PREVIEW:ANIM])
 * - Log levels (debug, info, warn, error)
 * - State snapshots for transitions
 * - Performance timing and warnings
 * - Animation lifecycle tracking
 * - Ref validation logging
 * - Race condition detection
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Log levels for filtering output
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4
} as const

export type LogLevelValue = (typeof LogLevel)[keyof typeof LogLevel]

export type PreloadAction = 'loading' | 'cached' | 'failed'

export type HoverRoute = 'FIRST_HOVER' | 'SAME_IMAGE' | 'ITEM_SWITCH' | 'RE_ENTRY' | 'SKIP'

export interface Position {
  x: number
  y: number
}

export interface PreviewLogger {
  state: (from: string, to: string, context?: Record<string, unknown>) => void
  animationStart: (name: string, expectedDuration: number, context?: Record<string, unknown>) => void
  animationComplete: (name: string, expectedDuration: number, context?: Record<string, unknown>) => void
  preload: (action: PreloadAction, src: string, duration?: number | null) => void
  position: (position: Position, clamped?: Position | null, reason?: string | null) => void
  refs: (refs: Record<string, boolean>) => void
  route: (route: HoverRoute | string, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  error: (message: string, context?: Record<string, unknown>) => void
  raceCondition: (description: string, state?: Record<string, unknown>) => void
  info: (message: string, context?: Record<string, unknown>) => void
  debug: (message: string, context?: Record<string, unknown>) => void
  separator: (label?: string | null) => void
}

// ============================================================================
// Module State
// ============================================================================

/**
 * Current log level (set to INFO for normal use, DEBUG for troubleshooting)
 * Can be changed via setLogLevel()
 */
let currentLogLevel: LogLevelValue = LogLevel.SILENT

/**
 * Set the minimum log level for output
 */
export const setLogLevel = (level: LogLevelValue): void => {
  currentLogLevel = level
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format a log message with namespace and emoji
 */
const _formatLog = (namespace: string, emoji: string, message: string): string => {
  return `${emoji} [PREVIEW:${namespace}] ${message}`
}

// ============================================================================
// Logger Factory
// ============================================================================

/**
 * Create a logger instance for preview system
 */
export const createPreviewLogger = (): PreviewLogger => {
  // Performance timing map (animation name → start time)
  const timings = new Map<string, number>()

  return {
    /**
     * Log state machine transitions
     */
    state(from: string, to: string, context: Record<string, unknown> = {}): void {
      if (currentLogLevel > LogLevel.INFO) return

      const _contextStr = Object.keys(context).length > 0
        ? ` (${Object.entries(context).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : ''

      // console.log(_formatLog('STATE', '🔄', `${from} → ${to}${_contextStr}`))
    },

    /**
     * Log animation start with performance tracking
     */
    animationStart(name: string, expectedDuration: number, context: Record<string, unknown> = {}): void {
      if (currentLogLevel > LogLevel.DEBUG) return

      const _contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : ''

      // console.log(_formatLog('ANIM', '🎬', `Starting ${name} (duration: ${expectedDuration}ms)${_contextStr}`))
      timings.set(name, performance.now())
    },

    /**
     * Log animation completion with performance validation
     */
    animationComplete(name: string, expectedDuration: number, context: Record<string, unknown> = {}): void {
      if (currentLogLevel > LogLevel.DEBUG) return

      const startTime = timings.get(name)
      let _perfInfo = ''

      if (startTime) {
        const actualDuration = Math.round(performance.now() - startTime)
        const diff = actualDuration - expectedDuration

        // Warn if animation took significantly longer (>50ms tolerance)
        if (diff > 50) {
          _perfInfo = ` ⚠️ (actual: ${actualDuration}ms, expected: ${expectedDuration}ms, +${diff}ms jank)`
        }
        else {
          _perfInfo = ` (${actualDuration}ms)`
        }

        timings.delete(name)
      }

      const _contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : ''

      // console.log(_formatLog('ANIM', '✅', `${name} complete${_perfInfo}${_contextStr}`))
    },

    /**
     * Log image preload events
     */
    preload(action: PreloadAction, src: string, duration: number | null = null): void {
      if (currentLogLevel > LogLevel.DEBUG) return

      const _filename = src.split('/').pop()

      switch (action) {
        case 'loading':
          // console.log(_formatLog('PRELOAD', '⏳', `Loading: ${_filename}`))
          break
        case 'cached': {
          const _durationStr = duration ? ` (${duration}ms)` : ''
          // console.log(_formatLog('PRELOAD', '✓', `Cached: ${_filename}${_durationStr}`))
          break
        }
        case 'failed':
          // console.error(_formatLog('PRELOAD', '❌', `Failed: ${_filename}`))
          break
      }
    },

    /**
     * Log position calculations and bounds clamping
     */
    position(position: Position, clamped: Position | null = null, _reason: string | null = null): void {
      if (currentLogLevel > LogLevel.DEBUG) return

      if (clamped) {
        /*
        console.log(_formatLog('POSITION', '📍',
          `Clamped (x: ${Math.round(position.x)} → ${Math.round(clamped.x)}, `
          + `y: ${Math.round(position.y)} → ${Math.round(clamped.y)}, reason: ${_reason})`
        ))
        */
      }
      else {
        /*
        console.log(_formatLog('POSITION', '📍',
          `Set (x: ${Math.round(position.x)}, y: ${Math.round(position.y)})`
        ))
        */
      }
    },

    /**
     * Log ref validation results
     */
    refs(refs: Record<string, boolean>): void {
      if (currentLogLevel > LogLevel.DEBUG) return

      const missing = Object.entries(refs)
        .filter(([, exists]) => !exists)
        .map(([name]) => name)

      if (missing.length > 0) {
        // console.error(_formatLog('REFS', '❌', `Missing refs: ${missing.join(', ')}`))
      }
      else {
        // console.log(_formatLog('REFS', '✓', 'All refs valid'))
      }
    },

    /**
     * Log hover routing decisions
     */
    route(route: HoverRoute | string, context: Record<string, unknown> = {}): void {
      if (currentLogLevel > LogLevel.INFO) return

      const _contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : ''

      const emojiMap: Record<string, string> = {
        FIRST_HOVER: '🆕',
        SAME_IMAGE: '⏭️',
        ITEM_SWITCH: '🔄',
        RE_ENTRY: '🎬',
        SKIP: '⏸️'
      }
      const _emoji = emojiMap[route] || '🎯'

      // console.log(_formatLog('ROUTE', _emoji, `${route}${_contextStr}`))
    },

    /**
     * Log warnings (non-fatal issues)
     */
    warn(message: string, context: Record<string, unknown> = {}): void {
      if (currentLogLevel > LogLevel.WARN) return

      const _contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : ''

      // console.warn(_formatLog('WARN', '⚠️', `${message}${_contextStr}`))
    },

    /**
     * Log errors (fatal issues)
     */
    error(message: string, context: Record<string, unknown> = {}): void {
      if (currentLogLevel > LogLevel.ERROR) return

      const _contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : ''

      // console.error(_formatLog('ERROR', '💥', `${message}${_contextStr}`))
    },

    /**
     * Log race condition detection
     */
    raceCondition(description: string, state: Record<string, unknown> = {}): void {
      if (currentLogLevel > LogLevel.WARN) return

      const _stateStr = Object.keys(state).length > 0
        ? ` State: ${JSON.stringify(state)}`
        : ''

      // console.warn(_formatLog('RACE', '⚡', `${description}${_stateStr}`))
    },

    /**
     * Log info messages (general information)
     */
    info(message: string, context: Record<string, unknown> = {}): void {
      if (currentLogLevel > LogLevel.INFO) return

      const _contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : ''

      // console.log(_formatLog('INFO', 'ℹ️', `${message}${_contextStr}`))
    },

    /**
     * Log debug messages (verbose debugging)
     */
    debug(message: string, context: Record<string, unknown> = {}): void {
      if (currentLogLevel > LogLevel.DEBUG) return

      const _contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : ''

      // console.log(_formatLog('DEBUG', '🔍', `${message}${_contextStr}`))
    },

    /**
     * Create a visual separator in logs
     */
    separator(label: string | null = null): void {
      if (currentLogLevel > LogLevel.DEBUG) return

      const _line = '━'.repeat(40)
      if (label) {
        // console.log(`\n${_line}\n  ${label}\n${_line}`)
      }
      else {
        // console.log(`\n${_line}\n`)
      }
    }
  }
}
