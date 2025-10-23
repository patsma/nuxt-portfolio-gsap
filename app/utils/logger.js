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
 *
 * Usage:
 * ```javascript
 * const log = createPreviewLogger()
 * log.state('IDLE', 'REVEALING', { image: 'foo.jpg' })
 * log.animation('clip-reveal', 500, () => { ... })
 * log.error('Missing refs', { currentWrapper: false })
 * ```
 */

/**
 * Log levels for filtering output
 * @enum {number}
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Current log level (set to INFO for normal use, DEBUG for troubleshooting)
 * Can be changed via setLogLevel()
 */
let currentLogLevel = LogLevel.INFO;

/**
 * Set the minimum log level for output
 * @param {number} level - LogLevel enum value
 */
export const setLogLevel = (level) => {
  currentLogLevel = level;
};

/**
 * Format a log message with namespace and emoji
 * @param {string} namespace - Log namespace (e.g., 'STATE', 'ANIM')
 * @param {string} emoji - Emoji for quick visual scanning
 * @param {string} message - Log message
 * @returns {string} Formatted log message
 */
const formatLog = (namespace, emoji, message) => {
  return `${emoji} [PREVIEW:${namespace}] ${message}`;
};

/**
 * Create a logger instance for preview system
 * @returns {Object} Logger instance with logging methods
 */
export const createPreviewLogger = () => {
  // Performance timing map (animation name → start time)
  const timings = new Map();

  return {
    /**
     * Log state machine transitions
     * @param {string} from - Previous state
     * @param {string} to - New state
     * @param {Object} context - Additional context (image, reason, etc.)
     */
    state(from, to, context = {}) {
      if (currentLogLevel > LogLevel.INFO) return;

      const contextStr = Object.keys(context).length > 0
        ? ` (${Object.entries(context).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : '';

      console.log(formatLog('STATE', '🔄', `${from} → ${to}${contextStr}`));
    },

    /**
     * Log animation start with performance tracking
     * @param {string} name - Animation name (e.g., 'clip-reveal', 'crossfade')
     * @param {number} expectedDuration - Expected duration in ms
     * @param {Object} context - Animation context
     */
    animationStart(name, expectedDuration, context = {}) {
      if (currentLogLevel > LogLevel.DEBUG) return;

      const contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : '';

      console.log(formatLog('ANIM', '🎬', `Starting ${name} (duration: ${expectedDuration}ms)${contextStr}`));
      timings.set(name, performance.now());
    },

    /**
     * Log animation completion with performance validation
     * @param {string} name - Animation name
     * @param {number} expectedDuration - Expected duration in ms
     * @param {Object} context - Completion context
     */
    animationComplete(name, expectedDuration, context = {}) {
      if (currentLogLevel > LogLevel.DEBUG) return;

      const startTime = timings.get(name);
      let perfInfo = '';

      if (startTime) {
        const actualDuration = Math.round(performance.now() - startTime);
        const diff = actualDuration - expectedDuration;

        // Warn if animation took significantly longer (>50ms tolerance)
        if (diff > 50) {
          perfInfo = ` ⚠️ (actual: ${actualDuration}ms, expected: ${expectedDuration}ms, +${diff}ms jank)`;
        } else {
          perfInfo = ` (${actualDuration}ms)`;
        }

        timings.delete(name);
      }

      const contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : '';

      console.log(formatLog('ANIM', '✅', `${name} complete${perfInfo}${contextStr}`));
    },

    /**
     * Log image preload events
     * @param {string} action - 'loading', 'cached', 'failed'
     * @param {string} src - Image source URL
     * @param {number|null} duration - Load duration in ms (for 'cached')
     */
    preload(action, src, duration = null) {
      if (currentLogLevel > LogLevel.DEBUG) return;

      const filename = src.split('/').pop();

      switch (action) {
        case 'loading':
          console.log(formatLog('PRELOAD', '⏳', `Loading: ${filename}`));
          break;
        case 'cached':
          const durationStr = duration ? ` (${duration}ms)` : '';
          console.log(formatLog('PRELOAD', '✓', `Cached: ${filename}${durationStr}`));
          break;
        case 'failed':
          console.error(formatLog('PRELOAD', '❌', `Failed: ${filename}`));
          break;
      }
    },

    /**
     * Log position calculations and bounds clamping
     * @param {Object} position - Calculated position { x, y }
     * @param {Object|null} clamped - Clamped position if different (or null)
     * @param {string|null} reason - Reason for clamping
     */
    position(position, clamped = null, reason = null) {
      if (currentLogLevel > LogLevel.DEBUG) return;

      if (clamped) {
        console.log(formatLog('POSITION', '📍',
          `Clamped (x: ${Math.round(position.x)} → ${Math.round(clamped.x)}, ` +
          `y: ${Math.round(position.y)} → ${Math.round(clamped.y)}, reason: ${reason})`
        ));
      } else {
        console.log(formatLog('POSITION', '📍',
          `Set (x: ${Math.round(position.x)}, y: ${Math.round(position.y)})`
        ));
      }
    },

    /**
     * Log ref validation results
     * @param {Object} refs - Refs object with boolean values
     */
    refs(refs) {
      if (currentLogLevel > LogLevel.DEBUG) return;

      const missing = Object.entries(refs)
        .filter(([_, exists]) => !exists)
        .map(([name]) => name);

      if (missing.length > 0) {
        console.error(formatLog('REFS', '❌', `Missing refs: ${missing.join(', ')}`));
      } else {
        console.log(formatLog('REFS', '✓', 'All refs valid'));
      }
    },

    /**
     * Log hover routing decisions
     * @param {string} route - Route taken (e.g., 'FIRST_HOVER', 'SAME_IMAGE', 'ITEM_SWITCH')
     * @param {Object} context - Decision context
     */
    route(route, context = {}) {
      if (currentLogLevel > LogLevel.INFO) return;

      const contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : '';

      const emoji = {
        FIRST_HOVER: '🆕',
        SAME_IMAGE: '⏭️',
        ITEM_SWITCH: '🔄',
        RE_ENTRY: '🎬',
        SKIP: '⏸️',
      }[route] || '🎯';

      console.log(formatLog('ROUTE', emoji, `${route}${contextStr}`));
    },

    /**
     * Log warnings (non-fatal issues)
     * @param {string} message - Warning message
     * @param {Object} context - Additional context
     */
    warn(message, context = {}) {
      if (currentLogLevel > LogLevel.WARN) return;

      const contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : '';

      console.warn(formatLog('WARN', '⚠️', `${message}${contextStr}`));
    },

    /**
     * Log errors (fatal issues)
     * @param {string} message - Error message
     * @param {Object} context - Additional context
     */
    error(message, context = {}) {
      if (currentLogLevel > LogLevel.ERROR) return;

      const contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : '';

      console.error(formatLog('ERROR', '💥', `${message}${contextStr}`));
    },

    /**
     * Log race condition detection
     * @param {string} description - What race condition was detected
     * @param {Object} state - Current state snapshot
     */
    raceCondition(description, state = {}) {
      if (currentLogLevel > LogLevel.WARN) return;

      const stateStr = Object.keys(state).length > 0
        ? ` State: ${JSON.stringify(state)}`
        : '';

      console.warn(formatLog('RACE', '⚡', `${description}${stateStr}`));
    },

    /**
     * Log info messages (general information)
     * @param {string} message - Info message
     * @param {Object} context - Additional context
     */
    info(message, context = {}) {
      if (currentLogLevel > LogLevel.INFO) return;

      const contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : '';

      console.log(formatLog('INFO', 'ℹ️', `${message}${contextStr}`));
    },

    /**
     * Log debug messages (verbose debugging)
     * @param {string} message - Debug message
     * @param {Object} context - Additional context
     */
    debug(message, context = {}) {
      if (currentLogLevel > LogLevel.DEBUG) return;

      const contextStr = Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : '';

      console.log(formatLog('DEBUG', '🔍', `${message}${contextStr}`));
    },

    /**
     * Create a visual separator in logs
     * @param {string|null} label - Optional label for separator
     */
    separator(label = null) {
      if (currentLogLevel > LogLevel.DEBUG) return;

      const line = '━'.repeat(40);
      if (label) {
        console.log(`\n${line}\n  ${label}\n${line}`);
      } else {
        console.log(`\n${line}\n`);
      }
    },
  };
};

/**
 * Export LogLevel enum for external use
 */
export { LogLevel };
