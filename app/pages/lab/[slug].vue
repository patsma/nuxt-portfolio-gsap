<script setup lang="ts">
/**
 * Lab Project Detail Page
 *
 * Displays a single lab project with full content from Nuxt Content collection.
 * Follows the work/[slug].vue pattern with prev/next navigation.
 *
 * Animation Strategy:
 * - Page transitions: v-page-fade on main section, v-page-stagger with leaveOnly on images/entries
 * - ScrollTrigger: IN animations handled by ScrollTrigger for bento grid, entries, and nav
 * - Coordination: First load vs navigation handled via loadingStore/pageTransitionStore
 */

// Use the content-driven HeroSection
import HeroSection from '~/components/content/HeroSection.vue'

const { $gsap, $ScrollTrigger } = useNuxtApp()
const loadingStore = useLoadingStore()
const pageTransitionStore = usePageTransitionStore()

const route = useRoute()
const slug = String(route.params.slug || '')

// Template refs for animations
const bentoGridRef = ref<HTMLElement | null>(null)
const entriesRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)

// Module-level ScrollTrigger instances for cleanup
let bentoScrollTrigger: ReturnType<typeof $ScrollTrigger.create> | null = null
let entriesScrollTrigger: ReturnType<typeof $ScrollTrigger.create> | null = null
let navScrollTrigger: ReturnType<typeof $ScrollTrigger.create> | null = null

// Fetch the lab project by its path
const {
  data: project,
  status,
  error
} = await useAsyncData(
  `lab-project-${slug}`,
  () => queryCollection('lab').path(`/lab/${slug}`).first()
)

const pageTitle = computed(() => project.value?.title || slug)
useHead({ title: `${pageTitle.value} • Lab` })

// Build minimal navigation list from all projects, sorted by date
const { data: allProjects } = await useAsyncData(
  'lab-all-nav',
  () => queryCollection('lab').all()
)

const normalizePath = (p: string | undefined | null) => String(p || '').replace(/\/+$/, '')
const currentPath = computed(() => normalizePath(`/lab/${slug}`))
const navList = computed(() => {
  const list = (allProjects.value || []).slice()
  // Sort chronologically DESC (newest -> oldest) for intuitive "Next" = newer
  list.sort((a, b) => {
    const timeA = new Date(a?.date || 0).getTime()
    const timeB = new Date(b?.date || 0).getTime()
    return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
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
 * Parse and format date deterministically across SSR/CSR
 */
const parseISODate = (iso: string | undefined | null): Date | null => {
  if (!iso) return null
  const isShort = /^\d{4}-\d{2}-\d{2}$/.test(iso)
  const safe = isShort ? `${iso}T00:00:00Z` : iso
  const d = new Date(safe)
  return Number.isNaN(d.getTime()) ? null : d
}

const _formatDate = (iso: string | undefined | null): string => {
  const d = parseISODate(iso)
  if (!d) return iso || ''
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(d)
  }
  catch {
    return `${d.getUTCDate().toString().padStart(2, '0')} ${d
      .toLocaleString('en', { month: 'short', timeZone: 'UTC' })
      .replace('.', '')} ${d.getUTCFullYear()}`
  }
}

const _scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Project entries - supports multiple downloadable items per project
 * Falls back to single entry from project frontmatter if no entries array
 */
const projectEntries = computed(() => {
  if (project.value?.entries && Array.isArray(project.value.entries)) {
    return project.value.entries
  }
  // Fallback to single entry from project data
  return [{
    type: project.value?.category || 'Template',
    link: null,
    title: project.value?.title || '',
    description: project.value?.description || ''
  }]
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
 * Create entries section scroll animation
 * Grid entries fade in with stagger
 */
const createEntriesAnimation = () => {
  if (!entriesRef.value) return

  // Kill existing
  if (entriesScrollTrigger) {
    entriesScrollTrigger.kill()
    entriesScrollTrigger = null
  }

  const entries = entriesRef.value.querySelectorAll('.lab-entry-grid')
  if (!entries?.length) return

  // Clear and set initial state
  $gsap.set(entries, { clearProps: 'all' })
  $gsap.set(entries, { opacity: 0, y: 20 })

  const tl = $gsap.timeline()
  tl.to(entries, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out'
  })

  entriesScrollTrigger = $ScrollTrigger.create({
    trigger: entriesRef.value,
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
 * Initialize all scroll animations
 * Called after proper timing coordination
 */
const initScrollAnimations = () => {
  createBentoAnimation()
  createEntriesAnimation()
  createNavAnimation()
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
  entriesScrollTrigger?.kill()
  navScrollTrigger?.kill()

  bentoScrollTrigger = null
  entriesScrollTrigger = null
  navScrollTrigger = null
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <section
      v-if="status === 'pending'"
      class="lab-project lab-project--loading content-grid"
    >
      <div class="breakout3 py-[var(--space-2xl)]">
        <div class="flex items-center gap-[var(--space-m)]">
          <div class="loading-spinner" />
          <p class="body-mobile-p1 text-[var(--theme-text-40)]">
            Loading project...
          </p>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section
      v-else-if="error || !project"
      class="lab-project lab-project--error content-grid"
    >
      <div class="breakout3 py-[var(--space-2xl)]">
        <div
          class="empty-state"
          role="status"
          aria-live="polite"
        >
          <h1 class="display-mobile-h2 md:display-laptop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Project Not Found
          </h1>
          <p class="body-mobile-p1 text-[var(--theme-text-60)] mb-[var(--space-l)]">
            This lab project seems to have vanished. Perhaps it's still being experimented on.
          </p>
          <NuxtLink
            to="/lab"
            class="inline-flex items-center gap-[var(--space-xs)] text-[var(--theme-text-100)] hover:text-[var(--theme-text-60)] transition-colors"
          >
            <span>&larr;</span>
            <span>Back to Lab</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Project Content -->
    <section
      v-else
      v-page-fade
      class="lab-project"
    >
      <!-- Hero Section - Content-driven from data/hero/lab.yml -->
      <HeroSection hero-id="lab" />

      <!-- Content below hero -->
      <div class="content-grid">
        <!-- Bento Image Grid -->
        <!-- Page transition OUT only (leaveOnly), ScrollTrigger handles IN animation -->
        <div
          v-if="project.images?.length >= 3"
          class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]"
        >
          <!-- Mobile: stacked, Desktop: bento grid -->
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
          v-else-if="project.cover || project.thumbnail"
          class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]"
        >
          <div class="overflow-hidden rounded-lg aspect-[1184/666]">
            <NuxtImg
              :src="project.cover || project.thumbnail"
              :alt="project.title"
              class="w-full h-full object-cover"
              loading="eager"
              sizes="100vw"
            />
          </div>
        </div>

        <!-- Project Entries: 3-column grid with multiple entries support -->
        <!-- Page transition OUT only (leaveOnly), ScrollTrigger handles IN animation -->
        <div
          ref="entriesRef"
          v-page-stagger="{ stagger: 0.08, leaveOnly: true }"
          class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]"
        >
          <div
            v-for="(entry, index) in projectEntries"
            :key="index"
            class="lab-entry-grid"
            :class="{ 'mt-[var(--space-2xl)]': index > 0 }"
          >
            <!-- Column 1: Label (only visible on first row) -->
            <p
              class="body-mobile-caption text-[var(--theme-text-40)]"
              :class="{ 'md:invisible': index > 0 }"
            >
              Lab projects
            </p>

            <!-- Column 2: Download button/link -->
            <a
              :href="entry.link || '#'"
              :target="entry.link ? '_blank' : undefined"
              :rel="entry.link ? 'noopener' : undefined"
              class="body-mobile-caption text-[var(--theme-text-40)] hover:text-[var(--theme-text-100)] transition-colors cursor-pointer"
              :class="{ 'underline underline-offset-4': entry.link }"
            >
              {{ entry.type || project.category || 'Template' }}
            </a>

            <!-- Column 3: Title + Description -->
            <div class="flex flex-col gap-[var(--space-m)]">
              <h2 class="display-mobile-h2 md:display-laptop-h2 text-[var(--theme-text-100)] leading-none md:-mt-[0.15em]">
                {{ entry.title }}
              </h2>

              <p
                v-if="entry.description"
                class="body-mobile-p1 md:body-laptop-p2 text-[var(--theme-text-60)] leading-relaxed"
              >
                {{ entry.description }}
              </p>
            </div>
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
              <span class="body-mobile-p1 md:hidden">Prev</span>
              <span class="body-mobile-p1 hidden md:inline">{{ prevProject.title }}</span>
            </NuxtLink>
            <div v-else />

            <!-- Next Project -->
            <NuxtLink
              v-if="nextProject"
              :to="nextProject.path"
              class="group flex items-center gap-[var(--space-s)] text-[var(--theme-text-60)] hover:text-[var(--theme-text-100)] transition-colors"
            >
              <span class="body-mobile-p1 md:hidden">Next</span>
              <span class="body-mobile-p1 hidden md:inline">{{ nextProject.title }}</span>
              <span class="text-xl">&rarr;</span>
            </NuxtLink>
          </div>
        </nav>

        <!-- Bottom border separator -->
        <div class="full-width relative">
          <FullWidthBorder />
        </div>
      </div><!-- /.content-grid -->
    </section>
  </div>
</template>

<style scoped>
/**
 * Lab project detail page styles
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
    aspect-ratio: 16 / 9; /* Container aspect ratio controls overall height */
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
 * Lab Entry Grid Layout
 * 3-column grid: Label | Download button | Title + Description
 */
.lab-entry-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-m);
}

@media (min-width: 768px) {
  .lab-entry-grid {
    grid-template-columns: auto auto 1fr;
    gap: var(--space-xl);
    align-items: start;
  }
}
</style>
