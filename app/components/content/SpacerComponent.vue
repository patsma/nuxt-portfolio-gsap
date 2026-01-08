<template>
  <div :class="spacerClass" />
</template>

<script setup lang="ts">
/**
 * SpacerComponent - MDC-ready vertical spacing component
 *
 * Provides consistent vertical spacing between sections.
 *
 * Usage in Vue:
 * ```vue
 * <SpacerComponent size="md" />
 * ```
 *
 * Usage in MDC:
 * ```markdown
 * ::SpacerComponent{size="md"}
 * ::
 * ```
 */

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const spacerClass = computed(() => {
  const sizes = {
    sm: 'h-10',
    md: 'h-20',
    lg: 'h-32',
    xl: 'h-48'
  }
  return sizes[props.size] || sizes.md
})
</script>
