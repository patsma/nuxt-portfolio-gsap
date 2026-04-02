<template>
  <div
    ref="itemRef"
    class="scrolling-demo-accordion-item full-width-content relative"
  >
    <FullWidthBorder spacing="0" />

    <div class="breakout3">
      <button
        class="flex w-full items-center justify-between py-[var(--space-s)] lg:py-[var(--space-m)] cursor-pointer"
        :aria-expanded="isExpanded"
        @click="handleToggle"
      >
        <!-- Number -->
        <span class="body-mobile-p1 2xl:body-desktop-p1 text-[var(--theme-text-60)] shrink-0 w-8">
          {{ number }}
        </span>

        <!-- Title -->
        <span class="body-mobile-p1 2xl:body-desktop-p1 text-[var(--theme-text-60)] flex-1 text-left px-[var(--space-s)]">
          {{ title }}
        </span>

        <!-- Toggle icon -->
        <span
          class="text-[var(--theme-text-60)] text-2xl leading-none transition-transform duration-300 shrink-0"
          :class="{ 'rotate-45': isExpanded }"
        >
          +
        </span>
      </button>

      <!-- Expandable content -->
      <div
        ref="contentRef"
        class="overflow-hidden h-0 opacity-0"
      >
        <p class="body-mobile-p1 2xl:body-desktop-p1 text-[var(--theme-text-60)] pb-[var(--space-s)] lg:pb-[var(--space-m)] pl-8 pr-[var(--space-l)]">
          {{ content }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: string
  title: string
  content: string
}>()

const isExpanded = ref(false)
const contentRef = ref<HTMLElement | null>(null)
const itemRef = ref<HTMLElement | null>(null)

useAccordionAnimation({
  contentRef,
  itemRef,
  isExpanded,
  componentName: 'ScrollingDemoAccordionItem'
})

const handleToggle = () => {
  isExpanded.value = !isExpanded.value
}
</script>
