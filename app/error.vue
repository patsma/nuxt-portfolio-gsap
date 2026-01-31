<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: { type: Object as () => NuxtError, default: () => ({}) }
})

// Status code detection
const statusCode = computed(() =>
  props.error?.statusCode
    || props.error?.status
    || 500
)
const is404 = computed(() => Number(statusCode.value) === 404)

// Content
const displayNumber = computed(() => is404.value ? '404' : String(statusCode.value))
const title = computed(() => is404.value ? 'Page not found' : 'Something went wrong')
const message = computed(() => {
  if (is404.value) return 'The page you\'re looking for doesn\'t exist or has been moved.'
  return props.error?.message || 'An unexpected error occurred.'
})

// Developer-friendly error payload for debugging
const errorInfo = computed(() => ({
  url: props.error?.url || props.error?.data?.url || '',
  statusCode: statusCode.value,
  statusMessage: props.error?.statusMessage || '',
  message: props.error?.message || '',
  description: props.error?.description || '',
  data: props.error?.data,
  stack: props.error?.stack || props.error?.cause?.stack || ''
}))

const errorJson = computed(() => {
  try {
    return JSON.stringify(errorInfo.value, null, 2)
  }
  catch {
    return String(errorInfo.value || '')
  }
})

const copyStatus = ref('')

const resetCopyStatus = () => {
  copyStatus.value = ''
}

const { start: startResetTimeout, stop: cancelResetTimeout } = useTimeoutFn(
  resetCopyStatus,
  1600,
  { immediate: false }
)

const handleCopyError = async () => {
  try {
    const text = `Nuxt Error Details\n\n${errorJson.value}`
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    }
    else {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'absolute'
      area.style.left = '-9999px'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    copyStatus.value = 'Copied'
  }
  catch {
    copyStatus.value = 'Copy failed'
  }
  finally {
    cancelResetTimeout()
    startResetTimeout()
  }
}

const handleGoHome = () => {
  clearError({ redirect: '/' })
}
</script>

<template>
  <section class="error-page">
    <div
      class="error-content"
      role="status"
      aria-live="polite"
    >
      <!-- Giant status code -->
      <p
        class="error-number"
        aria-hidden="true"
      >
        {{ displayNumber }}
      </p>

      <!-- Title -->
      <h1 class="error-title">
        {{ title }}
      </h1>

      <!-- Message -->
      <p class="error-message">
        {{ message }}
      </p>

      <!-- Single action -->
      <button
        type="button"
        class="error-btn"
        @click="handleGoHome"
      >
        Go Home
      </button>

      <!-- Technical details (collapsible) -->
      <details class="error-details">
        <summary>
          Technical details
        </summary>
        <pre class="error-pre">{{ errorJson }}</pre>
        <button
          type="button"
          class="error-btn error-btn--small"
          @click="handleCopyError"
        >
          {{ copyStatus || 'Copy details' }}
        </button>
      </details>
    </div>
  </section>
</template>

<style>
/* Error page - NOT scoped so theme selectors work */

/* Error page container - theme-aware background */
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--color-light-100);
}

html.theme-dark .error-page {
  background-color: var(--color-dark-100);
}

.error-content {
  text-align: center;
  max-width: 40rem;
}

/* Giant error number - PP Eiko display style */
.error-number {
  font-family: var(--font-display);
  font-weight: 100;
  font-size: clamp(6rem, 18vw, 12rem);
  line-height: 1;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
  color: var(--color-dark-100);
}

html.theme-dark .error-number {
  color: var(--color-light-100);
}

/* Title */
.error-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.3;
  margin-bottom: 1rem;
  color: var(--color-dark-100);
}

html.theme-dark .error-title {
  color: var(--color-light-100);
}

/* Message */
.error-message {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.5;
  margin-bottom: 2rem;
  color: var(--color-dark-60);
}

html.theme-dark .error-message {
  color: var(--color-light-60);
}

/* Button */
.error-btn {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.5;
  padding: 0.75rem 2rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
  background-color: var(--color-dark-100);
  color: var(--color-light-100);
  border: none;
}

html.theme-dark .error-btn {
  background-color: var(--color-light-100);
  color: var(--color-dark-100);
}

.error-btn:hover {
  opacity: 0.85;
}

.error-btn--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Technical details */
.error-details {
  margin-top: 3rem;
  text-align: left;
}

.error-details summary {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  color: var(--color-dark-40);
}

html.theme-dark .error-details summary {
  color: var(--color-light-40);
}

.error-pre {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow: auto;
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  background-color: var(--color-dark-5);
  color: var(--color-dark-60);
  border: 1px solid var(--color-dark-10);
}

html.theme-dark .error-pre {
  background-color: var(--color-light-5);
  color: var(--color-light-60);
  border-color: var(--color-light-10);
}

.error-details .error-btn {
  margin-top: 1rem;
}
</style>
