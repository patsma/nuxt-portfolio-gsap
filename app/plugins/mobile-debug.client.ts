/**
 * Mobile Debug Console Plugin
 *
 * Displays console logs on screen for mobile Safari debugging.
 * Shows a fixed overlay with logs, route changes, and page transitions.
 * Toggle with triple-tap anywhere on screen.
 */

interface LogEntry {
  type: 'log' | 'error' | 'warn' | 'info'
  timestamp: string
  message: string
}

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  // Only enable on mobile devices (optional - remove if you want it on desktop too)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  if (!isMobile) return

  // State
  let isVisible = false
  let logs: LogEntry[] = []
  const MAX_LOGS = 50 // Keep last 50 logs

  // Create debug console container
  const container = document.createElement('div')
  container.id = 'mobile-debug-console'
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    color: #0f0;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    padding: 48px 12px 12px 12px;
    overflow-y: auto;
    z-index: 999999;
    display: none;
    line-height: 1.4;
  `

  // Create toggle button
  const toggleBtn = document.createElement('button')
  toggleBtn.textContent = '✕'
  toggleBtn.style.cssText = `
    position: fixed;
    top: 8px;
    right: 8px;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 20px;
    z-index: 1000000;
    cursor: pointer;
    display: none;
    -webkit-tap-highlight-color: transparent;
  `
  toggleBtn.onclick = () => toggleConsole()

  // Create copy button
  const copyBtn = document.createElement('button')
  copyBtn.textContent = 'Copy Logs'
  copyBtn.style.cssText = `
    position: fixed;
    top: 8px;
    right: 56px;
    background: rgba(0, 200, 0, 0.9);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: bold;
    z-index: 1000000;
    cursor: pointer;
    display: none;
    -webkit-tap-highlight-color: transparent;
  `
  copyBtn.onclick = () => copyLogsToClipboard()

  // Create clear button
  const clearBtn = document.createElement('button')
  clearBtn.textContent = 'Clear'
  clearBtn.style.cssText = `
    position: fixed;
    top: 8px;
    right: 178px;
    background: rgba(0, 100, 255, 0.8);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    z-index: 1000000;
    cursor: pointer;
    display: none;
    -webkit-tap-highlight-color: transparent;
  `
  clearBtn.onclick = () => clearLogs()

  // Create toast notification
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 200, 0, 0.95);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    z-index: 1000001;
    display: none;
  `
  toast.textContent = 'Logs copied to clipboard!'

  // Create floating debug button (always visible)
  const floatingBtn = document.createElement('button')
  floatingBtn.textContent = '🐛'
  floatingBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(255, 0, 255, 0.8);
    color: white;
    border: 2px solid white;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    font-size: 24px;
    z-index: 999998;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    -webkit-tap-highlight-color: transparent;
  `
  floatingBtn.onclick = () => toggleConsole()

  // Append to body
  document.body.appendChild(container)
  document.body.appendChild(toggleBtn)
  document.body.appendChild(copyBtn)
  document.body.appendChild(clearBtn)
  document.body.appendChild(toast)
  document.body.appendChild(floatingBtn)

  /**
   * Add log entry
   */
  const addLog = (type: LogEntry['type'], ...args: unknown[]): void => {
    const timestamp = new Date().toLocaleTimeString()
    const message = args
      .map((arg) => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2)
          }
          catch {
            return String(arg)
          }
        }
        return String(arg)
      })
      .join(' ')

    // Filter out HMR/WebSocket noise from Nuxt dev mode
    const ignorePatterns = [
      '[Content] WS',
      'WS Error',
      'WS reconnecting',
      'WS connect'
    ]

    const shouldIgnore = ignorePatterns.some(pattern =>
      message.includes(pattern)
    )

    if (shouldIgnore) {
      return // Skip this log
    }

    logs.push({ type, timestamp, message })

    // Keep only last MAX_LOGS
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(-MAX_LOGS)
    }

    renderLogs()
  }

  /**
   * Render all logs
   */
  const renderLogs = (): void => {
    container.innerHTML = logs
      .map((log) => {
        const color
          = log.type === 'error'
            ? '#f00'
            : log.type === 'warn'
              ? '#ff0'
              : log.type === 'info'
                ? '#0ff'
                : '#0f0'

        return `<div style="margin-bottom: 8px; color: ${color};">
          <span style="opacity: 0.6;">[${log.timestamp}]</span>
          <span style="font-weight: bold;">[${log.type.toUpperCase()}]</span>
          <pre style="margin: 2px 0 0 0; white-space: pre-wrap; word-break: break-word;">${log.message}</pre>
        </div>`
      })
      .join('')

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight
  }

  /**
   * Clear all logs
   */
  const clearLogs = (): void => {
    logs = []
    renderLogs()
  }

  /**
   * Copy logs to clipboard
   */
  const copyLogsToClipboard = async (): Promise<void> => {
    // Create plain text version of logs
    const logText = logs
      .map((log) => {
        return `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`
      })
      .join('\n')

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(logText)
        showToast()
      }
      else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = logText
        textArea.style.position = 'fixed'
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.width = '2em'
        textArea.style.height = '2em'
        textArea.style.padding = '0'
        textArea.style.border = 'none'
        textArea.style.outline = 'none'
        textArea.style.boxShadow = 'none'
        textArea.style.background = 'transparent'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showToast()
      }
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      addLog('error', 'Failed to copy logs:', errorMessage)
    }
  }

  /**
   * Show toast notification
   */
  const showToast = (): void => {
    toast.style.display = 'block'
    setTimeout(() => {
      toast.style.display = 'none'
    }, 2000)
  }

  /**
   * Toggle console visibility
   */
  const toggleConsole = (): void => {
    isVisible = !isVisible
    container.style.display = isVisible ? 'block' : 'none'
    toggleBtn.style.display = isVisible ? 'block' : 'none'
    copyBtn.style.display = isVisible ? 'block' : 'none'
    clearBtn.style.display = isVisible ? 'block' : 'none'
    floatingBtn.style.display = isVisible ? 'none' : 'block' // Hide floating button when console is open

    if (isVisible) {
      addLog('info', '🔍 Mobile Debug Console Activated - Tap \'Copy Logs\' to copy all logs to clipboard')
    }
  }

  // Triple-tap anywhere to toggle console
  let tapCount = 0
  let tapTimeout: ReturnType<typeof setTimeout>
  document.addEventListener('touchend', () => {
    tapCount++
    clearTimeout(tapTimeout)

    if (tapCount === 3) {
      toggleConsole()
      tapCount = 0
    }

    tapTimeout = setTimeout(() => {
      tapCount = 0
    }, 500)
  })

  // Intercept console methods
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn

  console.log = (...args: unknown[]): void => {
    addLog('log', ...args)
    originalLog.apply(console, args)
  }

  console.error = (...args: unknown[]): void => {
    addLog('error', ...args)
    originalError.apply(console, args)
  }

  console.warn = (...args: unknown[]): void => {
    addLog('warn', ...args)
    originalWarn.apply(console, args)
  }

  // Track route changes
  nuxtApp.hook('page:start', () => {
    addLog('error', '🚀 PAGE:START ⚠️ THIS SHOULD NOT FIRE ON ACCORDION!')
  })

  nuxtApp.hook('page:finish', () => {
    addLog('error', '✅ PAGE:FINISH')
  })

  nuxtApp.hook('page:loading:end', () => {
    addLog('error', '⏸️  PAGE:LOADING:END')
  })

  nuxtApp.hook('page:transition:finish', () => {
    addLog('error', '🎬 PAGE:TRANSITION:FINISH')
  })

  // Track window resize (to debug resize-reload)
  let lastResize = Date.now()
  window.addEventListener(
    'resize',
    () => {
      const now = Date.now()
      const delta = now - lastResize
      lastResize = now
      addLog(
        'warn',
        `📐 RESIZE DETECTED (${delta}ms ago): ${window.innerWidth}x${window.innerHeight}`
      )
    },
    { passive: true }
  )

  // Global error handler
  window.addEventListener('error', (event) => {
    addLog('error', '💥 GLOBAL ERROR:', event.message, 'at', event.filename, event.lineno, event.colno)
  })

  window.addEventListener('unhandledrejection', (event) => {
    addLog('error', '💥 UNHANDLED PROMISE REJECTION:', event.reason)
  })

  // Initial log
  addLog(
    'info',
    '✅ Mobile Debug Console loaded. Tap the 🐛 button to open, then tap \'Copy Logs\' to copy everything to clipboard.'
  )

  console.log('✅ Mobile Debug Console active - tap 🐛 button or triple-tap to open')
})
