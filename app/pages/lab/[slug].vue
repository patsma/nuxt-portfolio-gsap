<script setup>
/**
 * Lab Project Detail Page
 *
 * Displays a single lab project with full content from Nuxt Content collection.
 * Follows the blog/[slug].vue pattern with prev/next navigation.
 */

const route = useRoute()
const slug = String(route.params.slug || '')

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

const normalizePath = p => String(p || '').replace(/\/+$/, '')
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
      path: p.path || p._path
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
const parseISODate = (iso) => {
  if (!iso) return null
  const isShort = /^\d{4}-\d{2}-\d{2}$/.test(iso)
  const safe = isShort ? `${iso}T00:00:00Z` : iso
  const d = new Date(safe)
  return Number.isNaN(d.getTime()) ? null : d
}

const _formatDate = (iso) => {
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
          <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-40)]">
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
          <h1 class="pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 text-[var(--theme-text-100)] mb-[var(--space-m)]">
            Project Not Found
          </h1>
          <p class="ibm-plex-sans-jp-mobile-p1 text-[var(--theme-text-60)] mb-[var(--space-l)]">
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
      <!-- Hero Section with styled text -->
      <HeroSection>
        <h1
          v-page-split:lines="{ animateFrom: 'below' }"
          class="font-display font-[100] text-4xl md:text-6xl leading-[131%] tracking-tighter"
        >
          <span class="text-[var(--theme-text-60)]">Feel</span>
          <em class="text-[var(--theme-text-100)] italic font-[300]"> free</em>
          <span class="text-[var(--theme-text-60)]"> to use my lab projects</span>
          <span class="text-[var(--theme-text-100)] font-body font-[300]"> as your own.</span>
          <span class="text-[var(--theme-text-60)]"> They are</span>
          <span class="text-[var(--theme-text-100)] font-body font-[300]"> based</span>
          <span class="text-[var(--theme-text-60)]"> on Morten</span>
          <em class="text-[var(--theme-text-100)] italic font-[300]"> logic</em>
          <span class="text-[var(--theme-text-60)]"> and</span>
          <em class="text-[var(--theme-text-100)] italic font-[300]"> experience</em>
          <span class="text-[var(--theme-text-60)]">, but still experimental and always evolving</span>
        </h1>
        <template #button>
          <ScrollButtonSVG v-page-fade:left />
        </template>
      </HeroSection>

      <!-- Content below hero -->
      <div class="content-grid">
        <!-- Bento Image Grid -->
        <div
          v-if="project.images?.length >= 3"
          class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]"
        >
          <!-- Mobile: stacked, Desktop: bento grid -->
          <div class="bento-grid">
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
        <div class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]">
          <div
            v-for="(entry, index) in projectEntries"
            :key="index"
            class="lab-entry-grid"
            :class="{ 'mt-[var(--space-2xl)]': index > 0 }"
          >
            <!-- Column 1: Label (only visible on first row) -->
            <p
              class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
              :class="{ 'md:invisible': index > 0 }"
            >
              Lab projects
            </p>

            <!-- Column 2: Download button/link -->
            <a
              :href="entry.link || '#'"
              :target="entry.link ? '_blank' : undefined"
              :rel="entry.link ? 'noopener' : undefined"
              class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)] hover:text-[var(--theme-text-100)] transition-colors cursor-pointer"
              :class="{ 'underline underline-offset-4': entry.link }"
            >
              {{ entry.type || project.category || 'Template' }}
            </a>

            <!-- Column 3: Title + Description -->
            <div class="flex flex-col gap-[var(--space-m)]">
              <h2 class="pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 text-[var(--theme-text-100)] leading-none md:-mt-[0.15em]">
                {{ entry.title }}
              </h2>

              <p
                v-if="entry.description"
                class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2 text-[var(--theme-text-60)] leading-relaxed"
              >
                {{ entry.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Navigation (simple prev/next) -->
        <nav
          v-if="prevProject || nextProject"
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
