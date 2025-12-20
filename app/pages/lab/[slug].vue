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
      class="lab-project content-grid"
    >
      <!-- Bento Image Grid (full width) -->
      <div
        v-if="project.images?.length >= 3"
        class="full-width py-[var(--space-xl)] md:py-[var(--space-2xl)]"
      >
        <div class="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-[var(--space-s)] md:gap-[var(--space-m)]">
          <!-- Large image (left) -->
          <div class="overflow-hidden rounded-lg aspect-[4/3] md:aspect-auto md:row-span-2">
            <NuxtImg
              :src="project.images[0]"
              :alt="project.title"
              class="w-full h-full object-cover"
              loading="eager"
              sizes="100vw md:60vw"
            />
          </div>
          <!-- Small image 1 (top right) -->
          <div class="overflow-hidden rounded-lg aspect-[16/9]">
            <NuxtImg
              :src="project.images[1]"
              :alt="`${project.title} - detail 1`"
              class="w-full h-full object-cover"
              loading="eager"
              sizes="100vw md:40vw"
            />
          </div>
          <!-- Small image 2 (bottom right) -->
          <div class="overflow-hidden rounded-lg aspect-[16/9]">
            <NuxtImg
              :src="project.images[2]"
              :alt="`${project.title} - detail 2`"
              class="w-full h-full object-cover"
              loading="lazy"
              sizes="100vw md:40vw"
            />
          </div>
        </div>
      </div>

      <!-- Fallback: Single cover image -->
      <div
        v-else-if="project.cover || project.thumbnail"
        class="full-width py-[var(--space-xl)] md:py-[var(--space-2xl)]"
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

      <!-- Project Info: 3-column grid -->
      <div class="breakout3 py-[var(--space-xl)] md:py-[var(--space-2xl)]">
        <div class="grid grid-cols-1 md:grid-cols-[auto_auto_1fr] gap-[var(--space-m)] md:gap-[var(--space-xl)] items-start">
          <!-- Column 1: Label -->
          <p class="ibm-plex-sans-jp-mobile-caption text-[var(--theme-text-40)]">
            Lab projects
          </p>

          <!-- Column 2: Category tag -->
          <div>
            <span
              v-if="project.category"
              class="tag"
            >
              {{ project.category }}
            </span>
          </div>

          <!-- Column 3: Title + Description -->
          <div class="flex flex-col gap-[var(--space-m)]">
            <h1 class="pp-eiko-mobile-h2 md:pp-eiko-laptop-h2 text-[var(--theme-text-100)]">
              {{ project.title }}
            </h1>

            <p
              v-if="project.description"
              class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2 text-[var(--theme-text-60)] leading-relaxed"
            >
              {{ project.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Article Content (Markdown) -->
      <article
        v-if="project.body"
        class="breakout3 pb-[var(--space-2xl)]"
      >
        <div class="prose prose-light max-w-prose">
          <ContentRenderer
            :value="project"
            class="ibm-plex-sans-jp-mobile-p1 md:ibm-plex-sans-jp-laptop-p2 text-[var(--theme-text-80)]"
          />
        </div>
      </article>

      <!-- Navigation -->
      <nav
        v-if="prevProject || nextProject"
        class="breakout3 pt-[var(--space-xl)] pb-[var(--space-2xl)] border-t border-[var(--theme-15)]"
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
