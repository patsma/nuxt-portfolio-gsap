<script setup lang="ts">
/**
 * Work Case Study Detail Page
 *
 * Displays a single case study project with full content from Nuxt Content collection.
 * Follows the lab/[slug].vue pattern with prev/next navigation.
 *
 * Animation Strategy:
 * - Page transitions: v-page-fade on main section, v-page-stagger with leaveOnly on images
 * - ScrollTrigger: IN animations handled by ScrollTrigger for bento grid and details
 * - Coordination: First load vs navigation handled via loadingStore/pageTransitionStore
 */

import ScrollButtonSVG from '~/components/SVG/ScrollButtonSVG.vue'

const { $gsap, $ScrollTrigger, $SplitText } = useNuxtApp()
const loadingStore = useLoadingStore()
const pageTransitionStore = usePageTransitionStore()

const route = useRoute()
const slug = String(route.params.slug || '')

// Template refs for animations
const bentoGridRef = ref<HTMLElement | null>(null)
const detailsRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const descriptionRef = ref<HTMLElement | null>(null)

// Module-level ScrollTrigger instances for cleanup
let bentoScrollTrigger: ReturnType<typeof $ScrollTrigger.create> | null = null
let detailsScrollTrigger: ReturnType<typeof $ScrollTrigger.create> | null = null
let navScrollTrigger: ReturnType<typeof $ScrollTrigger.create> | null = null
let bodyScrollTrigger: ReturnType<typeof $ScrollTrigger.create> | null = null
let textScrollTrigger: ReturnType<typeof $ScrollTrigger.create> | null = null

// Type for SplitText result (matches BiographySection pattern)
interface SplitResult {
  chars?: Element[]
  words?: Element[]
  lines?: Element[]
  revert?: () => void
  [key: string]: unknown
}

// Storage for SplitText instances cleanup
const splitInstances: SplitResult[] = []

// Fetch the work project by its path
const {
  data: project,
  status,
  error
} = await useAsyncData(
  `work-project-${slug}`,
  () => queryCollection('work').path(`/work/${slug}`).first()
)

const pageTitle = computed(() => project.value?.title || slug)
useHead({ title: `Case Study - ${pageTitle.value}` })

// Build navigation list from all projects, sorted by displayOrder
const { data: allProjects } = await useAsyncData(
  'work-all-nav',
  () => queryCollection('work').all()
)

const normalizePath = (p: string | undefined | null) => String(p || '').replace(/\/+$/, '')
const currentPath = computed(() => normalizePath(`/work/${slug}`))

const navList = computed(() => {
  const list = (allProjects.value || []).slice()
  // Sort by displayOrder (lower = earlier in list)
  list.sort((a, b) => {
    const orderA = a?.displayOrder ?? 99
    const orderB = b?.displayOrder ?? 99
    return orderA - orderB
  })
  return list
    .map(p => ({
      title: p.title || p.slug || '(untitled)',
      path: p.path || (p as { _path?: string })._path
    }))
    .filter(i => !!i.path)
})

const navIndex = computed(() =>
  (navList.value || []).findIndex(
    i => normalizePath(i.path) === currentPath.value
  )
)

const prevProject = computed(() => {
  const list = navList.value || []
  return navIndex.value > 0 ? list[navIndex.value - 1] : null
})

const nextProject = computed(() => {
  const list = navList.value || []
  return navIndex.value >= 0 && navIndex.value < list.length - 1
    ? list[navIndex.value + 1]
    : null
})

/**
 * Create bento grid scroll animation
 * Images fade in with stagger and subtle y-offset
 */
const createBentoAnimation = () => {
  if (!bentoGridRef.value) return

  // Kill existing
  if (bentoScrollTrigger) {
    bentoScrollTrigger.kill()
    bentoScrollTrigger = null
  }

  const images = bentoGridRef.value.querySelectorAll('.bento-left, .bento-top-right, .bento-bottom-right')
  if (!images?.length) return

  // Clear inline styles from page transitions, set initial hidden state
  $gsap.set(images, { clearProps: 'all' })
  $gsap.set(images, { opacity: 0, y: 30, scale: 0.98 })

  const tl = $gsap.timeline()
  tl.to(images, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power2.out'
  })

  bentoScrollTrigger = $ScrollTrigger.create({
    trigger: bentoGridRef.value,
    start: 'top 80%',
    animation: tl,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true
  })
}

/**
 * Create details section scroll animation
 * Grid children fade in with stagger
 */
const createDetailsAnimation = () => {
  if (!detailsRef.value) return

  // Kill existing
  if (detailsScrollTrigger) {
    detailsScrollTrigger.kill()
    detailsScrollTrigger = null
  }

  const elements = detailsRef.value.querySelectorAll(':scope > *')
  if (!elements?.length) return

  // Clear and set initial state
  $gsap.set(elements, { clearProps: 'all' })
  $gsap.set(elements, { opacity: 0, y: 20 })

  const tl = $gsap.timeline()
  tl.to(elements, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out'
  })

  detailsScrollTrigger = $ScrollTrigger.create({
    trigger: detailsRef.value,
    start: 'top 80%',
    animation: tl,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true
  })
}

/**
 * Create nav section scroll animation
 */
const createNavAnimation = () => {
  if (!navRef.value) return

  // Kill existing
  if (navScrollTrigger) {
    navScrollTrigger.kill()
    navScrollTrigger = null
  }

  // Clear and set initial state
  $gsap.set(navRef.value, { clearProps: 'all' })
  $gsap.set(navRef.value, { opacity: 0, y: 20 })

  const tl = $gsap.timeline()
  tl.to(navRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out'
  })

  navScrollTrigger = $ScrollTrigger.create({
    trigger: navRef.value,
    start: 'top 85%',
    animation: tl,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true
  })
}

/**
 * Create body content scroll animation
 */
const createBodyAnimation = () => {
  if (!bodyRef.value) return

  // Kill existing
  if (bodyScrollTrigger) {
    bodyScrollTrigger.kill()
    bodyScrollTrigger = null
  }

  // Clear and set initial state
  $gsap.set(bodyRef.value, { clearProps: 'all' })
  $gsap.set(bodyRef.value, { opacity: 0, y: 20 })

  const tl = $gsap.timeline()
  tl.to(bodyRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out'
  })

  bodyScrollTrigger = $ScrollTrigger.create({
    trigger: bodyRef.value,
    start: 'top 80%',
    animation: tl,
    toggleActions: 'play pause resume reverse',
    invalidateOnRefresh: true
  })
}

/**
 * Create masked line reveal animation for description text
 * Lines slide up from behind mask with subtle rotation - organic feel
 * Following BiographySection pattern
 */
const createTextAnimation = () => {
  if (!descriptionRef.value) return

  // Kill existing ScrollTrigger
  if (textScrollTrigger) {
    textScrollTrigger.kill()
    textScrollTrigger = null
  }

  // Revert existing SplitText instances (restores original DOM)
  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0

  // Create master timeline (paused - ScrollTrigger controls playback)
  const masterTl = $gsap.timeline({ paused: true })

  // Clear any leftover styles
  $gsap.set(descriptionRef.value, { clearProps: 'all' })

  // Lock height before split to prevent layout shift
  const originalHeight = descriptionRef.value.offsetHeight
  $gsap.set(descriptionRef.value, { height: originalHeight, overflow: 'hidden' })

  // Split text into lines with mask for clean reveal effect
  const split = $SplitText.create(descriptionRef.value, {
    type: 'lines',
    mask: 'lines'
  })
  splitInstances.push(split)

  // Initial state: hidden below mask with subtle rotation
  $gsap.set(split.lines, {
    yPercent: 100,
    rotate: 8,
    transformOrigin: '0% 100%' // Pivot from bottom-left for natural rotation
  })

  // Build animation timeline
  masterTl.to(split.lines, {
    yPercent: 0,
    rotate: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out'
  })

  // Single ScrollTrigger controls master timeline
  textScrollTrigger = $ScrollTrigger.create({
    trigger: descriptionRef.value,
    start: 'top 75%',
    end: 'bottom top+=20%',
    animation: masterTl,
    toggleActions: 'play reverse play reverse',
    invalidateOnRefresh: true
  })
}

/**
 * Initialize all scroll animations
 * Called after proper timing coordination
 */
const initScrollAnimations = () => {
  createBentoAnimation()
  createDetailsAnimation()
  createNavAnimation()
  createBodyAnimation()
  createTextAnimation()
}

onMounted(() => {
  if (!$ScrollTrigger) return

  // Coordinate with page transition system
  // First load: Create immediately after mount
  // Navigation: Recreate after page transition completes
  if (loadingStore.isFirstLoad) {
    nextTick(() => {
      initScrollAnimations()
    })
  }
  else {
    // After page navigation, wait for page transition to complete
    const unwatch = watch(
      () => pageTransitionStore.isTransitioning,
      (isTransitioning) => {
        if (!isTransitioning) {
          nextTick(() => {
            initScrollAnimations()
          })
          unwatch()
        }
      },
      { immediate: true }
    )
  }
})

onUnmounted(() => {
  // Cleanup all ScrollTrigger instances
  bentoScrollTrigger?.kill()
  detailsScrollTrigger?.kill()
  navScrollTrigger?.kill()
  bodyScrollTrigger?.kill()
  textScrollTrigger?.kill()

  bentoScrollTrigger = null
  detailsScrollTrigger = null
  navScrollTrigger = null
  bodyScrollTrigger = null
  textScrollTrigger = null

  // Revert SplitText instances (restores original DOM)
  splitInstances.forEach(split => split.revert?.())
  splitInstances.length = 0
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <section
      v-if="status === 'pending'"
      class="work-project work-project--loading content-grid"
    >
      <div class="breakout3 py-[var(--space-2xl)]">
        <div class="flex items-center gap-[var(--space-m)]">
          <div class="loading-spinner" />
          <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-40)]">
            Loading project...
          </p>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section
      v-else-if="error || !project"
      class="work-project work-project--error content-grid"
    >
      <div class="breakout3 py-[var(--space-2xl)]">
        <div
          class="empty-state"
          role="status"
          aria-live="polite"
        >
          <h1 class="pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Project Not Found
          </h1>
          <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)] mb-[var(--space-l)]">
            This case study seems to have moved or doesn't exist yet.
          </p>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-[var(--space-xs)] text-[var(--theme-text-100)] hover:text-[var(--theme-text-60)] transition-colors"
          >
            <span>&larr;</span>
            <span>Back to Home</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Project Content -->
    <section
      v-else
      v-page-fade
      class="work-project"
    >
      <!-- Hero Section - custom inline with project title -->
      <section class="content-grid w-full min-h-[100dvh] grid items-center">
        <div class="breakout3 translate-y-[var(--space-xl)]">
          <h1 class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter">
            <span class="text-[var(--theme-text-60)]">Case</span>
            <em class="text-[var(--theme-text-100)] italic font-[300]"> Study</em>
            <span class="text-[var(--theme-text-40)]"> - </span>
            <span class="text-[var(--theme-text-100)] font-[300]">{{ project.title }}</span>
          </h1>

          <!-- Scroll down button -->
          <div class="flex justify-end pt-[var(--space-xl)]">
            <ScrollButtonSVG />
          </div>
        </div>
      </section>

      <!-- Content below hero -->
      <div class="content-grid">
        <!-- Bento Image Grid -->
        <!-- Page transition OUT only (leaveOnly), ScrollTrigger handles IN animation -->
        <div
          v-if="project.images?.length >= 3"
          class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]"
        >
          <div
            ref="bentoGridRef"
            v-page-stagger="{ stagger: 0.1, leaveOnly: true }"
            class="bento-grid"
          >
            <!-- Large image (left, spans 2 rows on desktop) -->
            <div class="bento-left overflow-hidden rounded-lg">
              <NuxtImg
                :src="project.images[0]"
                :alt="project.title"
                class="w-full h-full object-cover"
                loading="eager"
                sizes="100vw md:50vw"
              />
            </div>
            <!-- Top right image -->
            <div class="bento-top-right overflow-hidden rounded-lg">
              <NuxtImg
                :src="project.images[1]"
                :alt="`${project.title} - detail 1`"
                class="w-full h-full object-cover"
                loading="eager"
                sizes="100vw md:50vw"
              />
            </div>
            <!-- Bottom right image -->
            <div class="bento-bottom-right overflow-hidden rounded-lg">
              <NuxtImg
                :src="project.images[2]"
                :alt="`${project.title} - detail 2`"
                class="w-full h-full object-cover"
                loading="lazy"
                sizes="100vw md:50vw"
              />
            </div>
          </div>
        </div>

        <!-- Fallback: Single cover image -->
        <div
          v-else-if="project.cover"
          class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]"
        >
          <div class="overflow-hidden rounded-lg aspect-[1184/666]">
            <NuxtImg
              :src="project.cover"
              :alt="project.title"
              class="w-full h-full object-cover"
              loading="eager"
              sizes="100vw"
            />
          </div>
        </div>

        <!-- Project Details: 3-column grid -->
        <!-- Page transition OUT only (leaveOnly), ScrollTrigger handles IN animation -->
        <div class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]">
          <div
            ref="detailsRef"
            v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
            class="work-details-grid"
          >
            <!-- Column 1: Label -->
            <p class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
              Case Study
            </p>

            <!-- Column 2: Meta info (year, role, client) -->
            <div class="flex flex-col gap-[var(--space-xs)]">
              <span
                v-if="project.year"
                class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
              >
                {{ project.year }}
              </span>
              <span
                v-if="project.role"
                class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
              >
                {{ project.role }}
              </span>
              <a
                v-if="project.liveLink"
                :href="project.liveLink"
                target="_blank"
                rel="noopener"
                class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)] hover:text-[var(--theme-text-100)] transition-colors underline underline-offset-4"
              >
                View Live
              </a>
            </div>

            <!-- Column 3: Title + Description -->
            <div class="flex flex-col gap-[var(--space-m)]">
              <h2 class="pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 text-[var(--theme-text-100)] leading-none md:-mt-[0.15em]">
                {{ project.title }}
              </h2>

              <p
                v-if="project.client"
                class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)]"
              >
                Client: {{ project.client }}
              </p>

              <p
                v-if="project.description"
                ref="descriptionRef"
                class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2 text-[var(--theme-text-60)] leading-relaxed"
              >
                {{ project.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Markdown Body Content (if any) -->
        <!-- Page transition OUT only (leaveOnly), ScrollTrigger handles IN animation -->
        <div
          v-if="project.body"
          ref="bodyRef"
          v-page-fade:up="{ leaveOnly: true }"
          class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]"
        >
          <div class="prose prose-invert max-w-none">
            <ContentRenderer :value="project" />
          </div>
        </div>

        <!-- Navigation (simple prev/next) -->
        <!-- Page transition OUT only (leaveOnly), ScrollTrigger handles IN animation -->
        <nav
          v-if="prevProject || nextProject"
          ref="navRef"
          v-page-fade:up="{ leaveOnly: true }"
          class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]"
        >
          <div class="flex justify-between items-center">
            <!-- Previous Project -->
            <NuxtLink
              v-if="prevProject"
              :to="prevProject.path"
              class="group flex items-center gap-[var(--space-s)] text-[var(--theme-text-60)] hover:text-[var(--theme-text-100)] transition-colors"
            >
              <span class="text-xl">&larr;</span>
              <span class="ibm-plex-sans-jp-mobile-p1 md:hidden">Prev</span>
              <span class="ibm-plex-sans-jp-mobile-p1 hidden md:inline">{{ prevProject.title }}</span>
            </NuxtLink>
            <div v-else />

            <!-- Next Project -->
            <NuxtLink
              v-if="nextProject"
              :to="nextProject.path"
              class="group flex items-center gap-[var(--space-s)] text-[var(--theme-text-60)] hover:text-[var(--theme-text-100)] transition-colors"
            >
              <span class="ibm-plex-sans-jp-mobile-p1 md:hidden">Next</span>
              <span class="ibm-plex-sans-jp-mobile-p1 hidden md:inline">{{ nextProject.title }}</span>
              <span class="text-xl">&rarr;</span>
            </NuxtLink>
          </div>
        </nav>

        <!-- Bottom border separator -->
        <div class="full-width relative">
          <FullWidthBorder />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/**
 * Work project detail page styles
 * Minimal styling - most handled by Tailwind utilities
 */

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--theme-15);
  border-top-color: var(--theme-text-40);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/**
 * Bento Grid Layout
 * Mobile: stacked images
 * Desktop: left image spans 2 rows, right column has 2 images
 */
.bento-grid {
  display: grid;
  gap: var(--space-s);
}

.bento-left,
.bento-top-right,
.bento-bottom-right {
  aspect-ratio: 4 / 3;
}

@media (min-width: 768px) {
  .bento-grid {
    gap: var(--space-m);
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
      "left top-right"
      "left bottom-right";
    aspect-ratio: 16 / 9;
  }

  .bento-left {
    grid-area: left;
    aspect-ratio: unset;
  }

  .bento-top-right {
    grid-area: top-right;
    aspect-ratio: unset;
  }

  .bento-bottom-right {
    grid-area: bottom-right;
    aspect-ratio: unset;
  }
}

/**
 * Work Details Grid Layout
 * 3-column grid: Label | Meta | Title + Description
 */
.work-details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-m);
}

@media (min-width: 768px) {
  .work-details-grid {
    grid-template-columns: auto auto 1fr;
    gap: var(--space-xl);
    align-items: start;
  }
}

/**
 * Prose styling for markdown content
 */
.prose {
  color: var(--theme-text-60);
}

.prose :deep(h2) {
  color: var(--theme-text-100);
  margin-top: var(--space-xl);
  margin-bottom: var(--space-m);
}

.prose :deep(h3) {
  color: var(--theme-text-100);
  margin-top: var(--space-l);
  margin-bottom: var(--space-s);
}

.prose :deep(p) {
  margin-bottom: var(--space-m);
  line-height: 1.7;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-bottom: var(--space-m);
  padding-left: var(--space-l);
}

.prose :deep(li) {
  margin-bottom: var(--space-xs);
}

.prose :deep(a) {
  color: var(--theme-text-100);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.prose :deep(a:hover) {
  color: var(--theme-text-60);
}
</style>
