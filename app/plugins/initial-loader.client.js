/**
 * Initial Loader Plugin
 *
 * Shows a simple loader IMMEDIATELY when the app starts
 * and hides it after resources are loaded
 */

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (import.meta.server) return

  // Inject loader HTML immediately
  const loaderHTML = `
    <div id="initial-app-loader" style="
      position: fixed;
      inset: 0;
      background: #0a0a0a;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 48px;
        height: 48px;
        border: 2px solid transparent;
        border-top-color: #0089d0;
        border-radius: 50%;
        animation: loader-spin 1s linear infinite;
      "></div>
    </div>
    <style>
      @keyframes loader-spin {
        to { transform: rotate(360deg); }
      }
      @media (prefers-color-scheme: light) {
        #initial-app-loader { background: #ffffff !important; }
      }
    </style>
  `

  // Insert at start of body
  const loaderDiv = document.createElement('div')
  loaderDiv.innerHTML = loaderHTML
  document.body.insertBefore(loaderDiv.firstChild, document.body.firstChild)
  if (loaderDiv.lastChild.tagName === 'STYLE') {
    document.head.appendChild(loaderDiv.lastChild)
  }

  // Remove loader after minimum time
  setTimeout(() => {
    const loader = document.getElementById('initial-app-loader')
    if (loader) {
      loader.style.opacity = '0'
      loader.style.transition = 'opacity 0.3s'
      setTimeout(() => loader.remove(), 300)
    }
  }, 1200)
})
