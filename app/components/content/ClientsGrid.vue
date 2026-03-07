<template>
  <ClientsSection :animate-on-scroll="animateOnScroll">
    <template #label>
      <slot name="label">
        Clients
      </slot>
    </template>

    <template #primary-clients>
      <p>{{ primaryClientsText }}</p>
    </template>

    <template #secondary-clients>
      <p>{{ secondaryClientsText }}</p>
    </template>
  </ClientsSection>
</template>

<script setup lang="ts">
/**
 * ClientsGrid - Content-driven clients section
 *
 * Fetches client lists from YAML data and renders them
 * using the existing ClientsSection component.
 *
 * Usage:
 * ```vue
 * <ClientsGrid />
 * ```
 */

interface Props {
  animateOnScroll?: boolean
}

withDefaults(defineProps<Props>(), {
  animateOnScroll: true
})

// Fetch clients from YAML data collection
const { data: clients } = await useAsyncData('clients', () =>
  queryCollection('clients').first()
)

// Format client lists as comma-separated strings
const primaryClientsText = computed(() =>
  (clients.value?.primary || []).join(', ')
)

const secondaryClientsText = computed(() =>
  (clients.value?.secondary || []).join(', ')
)
</script>
