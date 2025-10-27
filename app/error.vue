<script setup>
// Custom Nuxt error page with a consistent empty state UI
// - Uses our SCSS tokens (space(), $primary-*, radii, borders)
// - Provides clear actions and gentle animation
// - Works for 404 and generic errors

const props = defineProps({
  error: { type: Object, default: () => ({}) },
});

const statusCode = computed(
  () =>
    props.error?.statusCode ||
    props.error?.status ||
    props.error?.response?.status ||
    500
);
const is404 = computed(() => Number(statusCode.value) === 404);

const iconName = computed(() =>
  is404.value ? "mdi:map-search-outline" : "mdi:alert-circle-outline"
);
const title = computed(() =>
  is404.value ? "Page not found" : "Something went wrong"
);
const message = computed(() => {
  if (is404.value) return "We couldn’t find the page you’re looking for.";
  return props.error?.message || "An unexpected error occurred.";
});

const handleGoHome = () => {
  // Clear Nuxt error state and redirect to home
  clearError({ redirect: "/" });
};

// ----------------------------------------------------------------------------
// Developer-friendly error payload for support/debugging
// - Structured details are rendered nicely and can be copied by the user
// ----------------------------------------------------------------------------
const errorInfo = computed(() => ({
  url: props.error?.url || props.error?.data?.url || "",
  statusCode: statusCode.value,
  statusMessage:
    props.error?.statusMessage || props.error?.response?.statusText || "",
  message: props.error?.message || "",
  description: props.error?.description || "",
  data: props.error?.data,
  stack: props.error?.stack || props.error?.cause?.stack || "",
}));

const errorJson = computed(() => {
  try {
    return JSON.stringify(errorInfo.value, null, 2);
  } catch (e) {
    return String(errorInfo.value || "");
  }
});

const copyStatus = ref("");

/**
 * Reset copy status to empty
 * Called by VueUse timeout after copy action
 */
const resetCopyStatus = () => {
  copyStatus.value = "";
};

/**
 * VueUse timeout for auto-clearing copy status
 * Starts manually after copy action completes
 */
const { start: startResetTimeout, stop: cancelResetTimeout } = useTimeoutFn(
  resetCopyStatus,
  1600,
  { immediate: false } // Don't start automatically
);

const handleCopyError = async () => {
  try {
    const text = `Nuxt Error Details\n\n${errorJson.value}`;
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "absolute";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    copyStatus.value = "Copied";
  } catch (e) {
    copyStatus.value = "Copy failed";
  } finally {
    // Cancel any pending reset, then start new timeout using VueUse
    cancelResetTimeout();
    startResetTimeout();
  }
};
</script>

<template>
  <section class="min-h-screen grid place-items-center">
    <div class="empty-state" role="status" aria-live="polite">
      <div class="empty-state__icon" aria-hidden="true">
        <Icon :name="iconName" />
      </div>
      <h1 class="empty-state__title">{{ title }}</h1>
      <p class="empty-state__copy">{{ message }}</p>
      <div class="empty-state__actions">
        <button type="button" class="btn-standard" @click="handleGoHome">
          <span>Go Home</span>
        </button>
        <NuxtLink to="/projects" class="btn-standard-outlined">
          <span>Browse Projects</span>
        </NuxtLink>
      </div>
      <p v-if="statusCode" class="empty-state__meta">Error {{ statusCode }}</p>
      <details class="tech">
        <summary>Technical details</summary>
        <pre class="tech__pre" tabindex="0">{{ errorJson }}</pre>
        <div class="tech__actions">
          <button
            type="button"
            class="btn-standard-outlined"
            @click="handleCopyError"
          >
            <span>{{ copyStatus || "Copy details" }}</span>
          </button>
        </div>
      </details>
    </div>
  </section>
</template>

