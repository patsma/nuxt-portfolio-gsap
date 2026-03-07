<template>
  <ServicesSection :animate-on-scroll="animateOnScroll">
    <template #label>
      <slot name="label">
        Services
      </slot>
    </template>

    <template #column-left>
      <p
        v-for="service in leftColumnServices"
        :key="service"
      >
        {{ service }}
      </p>
    </template>

    <template #column-right>
      <p
        v-for="service in rightColumnServices"
        :key="service"
      >
        {{ service }}
      </p>
    </template>
  </ServicesSection>
</template>

<script setup lang="ts">
/**
 * ServicesGrid - Content-driven services section
 *
 * Fetches services from YAML data and renders them
 * using the existing ServicesSection component.
 * Splits services evenly between two columns.
 *
 * Usage:
 * ```vue
 * <ServicesGrid />
 * ```
 */

interface Props {
  animateOnScroll?: boolean
}

withDefaults(defineProps<Props>(), {
  animateOnScroll: true
})

// Fetch services from YAML data collection
const { data: services } = await useAsyncData('services-grid', () =>
  queryCollection('services').first()
)

// Split services into two columns
const leftColumnServices = computed(() => {
  const items = services.value?.items || []
  const midpoint = Math.ceil(items.length / 2)
  return items.slice(0, midpoint)
})

const rightColumnServices = computed(() => {
  const items = services.value?.items || []
  const midpoint = Math.ceil(items.length / 2)
  return items.slice(midpoint)
})
</script>
