<script setup>
// Simple Blog Post page using @nuxt/content
// Renders a post from the `blog` collection by slug

const route = useRoute();
const slug = computed(() => String(route.params.slug || ""));

// Fetch the post by its path
const {
  data: post,
  status,
  error,
} = await useAsyncData(
  () => `blog-${slug.value}`,
  () => queryCollection("blog").path(`/blog/${slug.value}`).first()
);

const pageTitle = computed(() => post.value?.title || slug.value);
useHead({ title: `${pageTitle.value} • Blog` });

// Build minimal navigation list from all posts, sorted client-side
const { data: allPosts } = await useAsyncData(
  () => "blog-all",
  () => queryCollection("blog").all()
);

const normalizePath = (p) => String(p || "").replace(/\/+$/, "");
const currentPath = computed(() => normalizePath(`/blog/${slug.value}`));
const navList = computed(() => {
  const list = (allPosts.value || []).slice();
  // Sort chronologically ASC (oldest -> newest) so "Next" moves forward in time
  list.sort((a, b) => {
    const timeA = new Date(a?.date || 0).getTime();
    const timeB = new Date(b?.date || 0).getTime();
    return (
      (Number.isNaN(timeA) ? 0 : timeA) - (Number.isNaN(timeB) ? 0 : timeB)
    );
  });
  return list
    .map((p) => ({
      title: p.title || p.slug || "(untitled)",
      path: p.path || p._path,
    }))
    .filter((i) => !!i.path);
});
const navIndex = computed(() =>
  (navList.value || []).findIndex(
    (i) => normalizePath(i.path) === currentPath.value
  )
);
const prevPost = computed(() => {
  const list = navList.value || [];
  return navIndex.value > 0 ? list[navIndex.value - 1] : null;
});
const nextPost = computed(() => {
  const list = navList.value || [];
  return navIndex.value >= 0 && navIndex.value < list.length - 1
    ? list[navIndex.value + 1]
    : null;
});

/**
 * Parse and format date deterministically across SSR/CSR to avoid hydration mismatches.
 */
const parseISODate = (iso) => {
  if (!iso) return null;
  const isShort = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const safe = isShort ? `${iso}T00:00:00Z` : iso;
  const d = new Date(safe);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (iso) => {
  const d = parseISODate(iso);
  if (!d) return iso || "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return `${d.getUTCDate().toString().padStart(2, "0")} ${d
      .toLocaleString("en", { month: "short", timeZone: "UTC" })
      .replace(".", "")} ${d.getUTCFullYear()}`;
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<template>
  <div class="pt-header">
    <!-- Loading State -->
    <section v-if="status === 'pending'" class="blog-post blog-post--loading">
      <div class="blog-container">
        <div class="blog-loading">
          <div class="loading-spinner"/>
          <p>Brewing the perfect article...</p>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section v-else-if="error || !post" class="blog-post blog-post--error">
      <div class="blog-container">
        <div class="empty-state" role="status" aria-live="polite">
          <div class="empty-state__icon">
            <Icon name="tabler:file-off" class="w-16 h-16" />
          </div>
          <h1 class="empty-state__title">Article Not Found</h1>
          <p class="empty-state__message">
            This post seems to have vanished into the digital void. Perhaps it's
            still brewing in our creative cauldron.
          </p>
          <div class="empty-state__actions">
            <NuxtLink to="/blog" class="btn-back">
              <Icon name="tabler:arrow-left" class="btn-back__icon" />
              <span>Back to Blog</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Article Content -->
    <section v-else class="blog-post">
      <!-- Subtle background parallax elements -->
      <div class="parallax-bg">
        <div
          class="parallax-element parallax-element--post-1"
          data-speed="0.4"
          data-lag="0.3"
        />
        <div
          class="parallax-element parallax-element--post-2"
          data-speed="0.6"
          data-lag="0.2"
        />
      </div>

      <div class="blog-container">
        <!-- Article Header -->
        <header class="blog-post__header">
          <div class="blog-post__breadcrumb">
            <NuxtLink to="/blog" class="breadcrumb-link">
              <Icon name="tabler:arrow-left" class="breadcrumb-icon" />
              Blog
            </NuxtLink>
          </div>

          <div class="blog-post__meta">
            <time
              v-if="post.date"
              :datetime="post.date"
              class="blog-post__date"
            >
              {{ formatDate(post.date) }}
            </time>
            <div v-if="post.tags?.length" class="blog-post__tags">
              <span v-for="t in post.tags" :key="t" class="blog-post__tag">
                {{ t }}
              </span>
            </div>
          </div>

          <h1 class="blog-post__title">
            {{ post.title }}
          </h1>

          <div v-if="post.excerpt" class="blog-post__excerpt">
            {{ post.excerpt }}
          </div>

          <div v-if="post.author" class="blog-post__author">
            <span class="author-label">By</span>
            <span class="author-name">{{ post.author }}</span>
          </div>
        </header>

        <!-- Article Content -->
        <article class="blog-post__content">
          <div class="prose-wrapper" data-speed="1.05">
            <ContentRenderer :value="post" class="prose prose-light" />
          </div>
        </article>

        <!-- Navigation -->
        <nav v-if="prevPost || nextPost" class="blog-post__nav" data-lag="0.1">
          <div class="blog-nav" data-speed="1.1">
            <NuxtLink
              v-if="prevPost"
              :to="prevPost.path"
              class="blog-nav__link blog-nav__link--prev"
              :aria-label="`Previous post: ${prevPost.title}`"
            >
              <div class="blog-nav__direction">
                <Icon name="tabler:arrow-left" class="blog-nav__icon" />
                <span class="blog-nav__label">Previous</span>
              </div>
              <h3 class="blog-nav__title">{{ prevPost.title }}</h3>
            </NuxtLink>

            <div class="blog-nav__spacer"/>

            <NuxtLink
              v-if="nextPost"
              :to="nextPost.path"
              class="blog-nav__link blog-nav__link--next"
              :aria-label="`Next post: ${nextPost.title}`"
            >
              <div class="blog-nav__direction">
                <span class="blog-nav__label">Next</span>
                <Icon name="tabler:arrow-right" class="blog-nav__icon" />
              </div>
              <h3 class="blog-nav__title">{{ nextPost.title }}</h3>
            </NuxtLink>
          </div>
        </nav>

        <!-- Back to top -->
        <div class="blog-post__footer">
          <button
            class="back-to-top"
            aria-label="Scroll to top"
            @click="scrollToTop"
          >
            <Icon name="tabler:arrow-up" class="back-to-top__icon" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
