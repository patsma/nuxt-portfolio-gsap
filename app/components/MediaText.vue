<template>
  <!-- MediaText: Versatile image + text section, supports flipped layout and optional title slot -->
  <section class="w-full">
    <div class="content-grid">
      <div :class="[widthClass, 'py-[var(--space-l)] md:py-[var(--space-xl)]']">
        <div
          v-gsap.whenVisible.once.reversible.stagger.from="{
            opacity: 0,
            y: 16,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power2.out'
          }"
          :class="[
            'grid items-center gap-[var(--space-l)] md:gap-[var(--space-xl)]',
            hasImage
              ? flipped
                ? 'md:grid-cols-2 md:[&>*:first-child]:order-2'
                : 'md:grid-cols-2'
              : ''
          ]"
        >
          <!-- Media -->
          <div v-if="hasImage">
            <NuxtImg
              :src="imageSrc"
              :alt="imageAlt"
              class="w-full h-auto rounded-md object-cover"
              sizes="sm:100vw md:50vw lg:50vw"
              format="webp"
              loading="lazy"
            />
          </div>

          <!-- Copy -->
          <div
            :class="flipped ? 'content-center' : 'content-start'"
            class="grid space-xs h-full"
          >
            <!-- Optional title above the paragraph, centered -->
            <div
              v-if="hasTitle"
              class="mb-[var(--space-xs)] md:mb-[var(--space-s)]"
            >
              <h2
                class="font-serif-display text-step-3 md:text-step-4 lg:text-step-6 leading-[var(--leading-display)] tracking-[var(--tracking-widest)] text-center font-semibold"
              >
                <slot name="title">
                  {{ title }}
                </slot>
              </h2>
            </div>
            <div
              class="font-agrandir text-step-0 text-[var(--color-ink)] font-light tracking-[var(--tracking-normal)] leading-[var(--leading-relaxed)]"
            >
              <slot>{{ paragraph }}</slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  imageSrc?: string
  imageAlt?: string
  title?: string
  paragraph?: string
  flipped?: boolean
  width?:
    | 'content'
    | 'breakout1'
    | 'breakout2'
    | 'breakout3'
    | 'breakout4'
    | 'full'
}>()

const widthClass = computed(() => {
  const map: Record<NonNullable<typeof props.width>, string> = {
    content: '',
    breakout1: 'breakout1',
    breakout2: 'breakout2',
    breakout3: 'breakout3',
    breakout4: 'breakout4',
    full: 'full-width'
  }
  return map[props.width ?? 'breakout3']
})

const flipped = computed(() => props.flipped === true)
const imageAlt = computed(() => props.imageAlt ?? '')
const hasTitle = computed(() => !!useSlots().title || !!props.title)
const hasImage = computed(
  () => typeof props.imageSrc === 'string' && props.imageSrc.length > 0
)
</script>

<style scoped>
/* Utilities handle presentation. */
</style>
