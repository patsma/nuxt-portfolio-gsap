<script setup>
/**
 * Lab Project Detail Page
 *
 * Displays a single lab project with full content from Nuxt Content collection.
 * Follows the blog/[slug].vue pattern with prev/next navigation.
 */

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

// Fetch the lab project by its path
const {
  data: project,
  status,
  error
} = await useAsyncData(
  () => `lab-${slug.value}`,
  () => queryCollection('lab').path(`/lab/${slug.value}`).first()
)

const pageTitle = computed(() => project.value?.title || slug.value)
useHead({ title: `${pageTitle.value} • Lab` })

// Build minimal navigation list from all projects, sorted by date
const { data: allProjects } = await useAsyncData(
  () => 'lab-all',
  () => queryCollection('lab').all()
)

const normalizePath = p => String(p || '').replace(/\/+$/, '')
const currentPath = computed(() => normalizePath(`/lab/${slug.value}`))
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

const formatDate = (iso) => {
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

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="pt-header">
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
      class="lab-project content-grid"
    >
      <div class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]">
        <!-- Project Header -->
        <header class="lab-project__header mb-[var(--space-xl)]">
          <!-- Breadcrumb -->
          <NuxtLink
            to="/lab"
            class="inline-flex items-center gap-[var(--space-xs)] ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)] hover:text-[var(--theme-text-60)] transition-colors mb-[var(--space-m)]"
          >
            <span>&larr;</span>
            <span>Lab</span>
          </NuxtLink>

          <!-- Meta: Date + Tags -->
          <div class="flex flex-wrap items-center gap-[var(--space-m)] mb-[var(--space-m)]">
            <time
              v-if="project.date"
              :datetime="project.date"
              class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]"
            >
              {{ formatDate(project.date) }}
            </time>
            <div
              v-if="project.tags?.length"
              class="flex flex-wrap gap-[var(--space-xs)]"
            >
              <span
                v-for="t in project.tags"
                :key="t"
                class="tag"
              >
                {{ t }}
              </span>
            </div>
            <span
              v-if="project.status"
              class="tag"
              :class="{
                'bg-green-500/10 text-green-600': project.status === 'stable',
                'bg-yellow-500/10 text-yellow-600': project.status === 'experimental',
                'bg-red-500/10 text-red-600': project.status === 'deprecated'
              }"
            >
              {{ project.status }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="pp-eiko-mobile-h1 md:pp-eiko-laptop-h1 text-[var(--theme-text-100)]">
            {{ project.title }}
          </h1>

          <!-- Description -->
          <p
            v-if="project.description"
            class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2 text-[var(--theme-text-60)] mt-[var(--space-m)] max-w-prose leading-relaxed"
          >
            {{ project.description }}
          </p>
        </header>

        <!-- Cover Image -->
        <div
          v-if="project.cover || project.thumbnail"
          class="lab-project__cover mb-[var(--space-xl)] rounded-lg overflow-hidden"
        >
          <img
            :src="project.cover || project.thumbnail"
            :alt="project.title"
            class="w-full h-auto"
          >
        </div>

        <!-- Article Content (Markdown) -->
        <article class="lab-project__content prose prose-light max-w-prose">
          <ContentRenderer
            :value="project"
            class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2 text-[var(--theme-text-80)]"
          />
        </article>

        <!-- Navigation -->
        <nav
          v-if="prevProject || nextProject"
          class="lab-project__nav mt-[var(--space-2xl)] pt-[var(--space-xl)] border-t border-[var(--theme-15)]"
        >
          <div class="grid md:grid-cols-2 gap-[var(--space-l)]">
            <!-- Previous Project -->
            <NuxtLink
              v-if="prevProject"
              :to="prevProject.path"
              class="group flex flex-col gap-[var(--space-xs)] p-[var(--space-m)] rounded-lg hover:bg-[var(--theme-bg-5)] transition-colors"
            >
              <span class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
                &larr; Previous
              </span>
              <span class="pp-eiko-mobile-h4 text-[var(--theme-text-100)] group-hover:text-[var(--theme-text-80)] transition-colors">
                {{ prevProject.title }}
              </span>
            </NuxtLink>
            <div v-else />

            <!-- Next Project -->
            <NuxtLink
              v-if="nextProject"
              :to="nextProject.path"
              class="group flex flex-col gap-[var(--space-xs)] p-[var(--space-m)] rounded-lg hover:bg-[var(--theme-bg-5)] transition-colors text-right"
            >
              <span class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
                Next &rarr;
              </span>
              <span class="pp-eiko-mobile-h4 text-[var(--theme-text-100)] group-hover:text-[var(--theme-text-80)] transition-colors">
                {{ nextProject.title }}
              </span>
            </NuxtLink>
          </div>
        </nav>

        <!-- Back to top -->
        <div class="lab-project__footer mt-[var(--space-xl)] flex justify-center">
          <button
            class="inline-flex items-center gap-[var(--space-xs)] ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)] hover:text-[var(--theme-text-60)] transition-colors"
            aria-label="Scroll to top"
            @click="scrollToTop"
          >
            <span>&uarr;</span>
            <span>Back to top</span>
          </button>
        </div>
      </div>
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

/* Prose styles for markdown content */
.prose :deep(h2) {
  font-family: 'PP Eiko', serif;
  font-weight: 300;
  font-size: clamp(1.5rem, 1.25rem + 1vw, 2rem);
  color: var(--theme-text-100);
  margin-top: var(--space-xl);
  margin-bottom: var(--space-m);
}

.prose :deep(h3) {
  font-family: 'PP Eiko', serif;
  font-weight: 300;
  font-size: clamp(1.25rem, 1rem + 0.75vw, 1.5rem);
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

.prose :deep(code) {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.9em;
  background: var(--theme-bg-5);
  padding: 0.125em 0.375em;
  border-radius: 0.25rem;
}

.prose :deep(pre) {
  background: var(--theme-bg-5);
  padding: var(--space-m);
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: var(--space-m);
}

.prose :deep(pre code) {
  background: transparent;
  padding: 0;
}

.prose :deep(a) {
  color: var(--theme-text-100);
  text-decoration: underline;
  text-decoration-color: var(--theme-text-40);
  text-underline-offset: 0.2em;
  transition: text-decoration-color 0.2s;
}

.prose :deep(a:hover) {
  text-decoration-color: var(--theme-text-100);
}

.prose :deep(blockquote) {
  border-left: 2px solid var(--theme-15);
  padding-left: var(--space-m);
  margin: var(--space-l) 0;
  font-style: italic;
  color: var(--theme-text-60);
}

.prose :deep(hr) {
  border: none;
  border-top: 1px solid var(--theme-15);
  margin: var(--space-xl) 0;
}

.prose :deep(img) {
  border-radius: 0.5rem;
  margin: var(--space-l) 0;
}

.prose :deep(strong) {
  color: var(--theme-text-100);
  font-weight: 500;
}
</style>
