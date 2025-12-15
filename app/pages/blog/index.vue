<script setup>
// Simple Blog Index powered by @nuxt/content collections
// Lists posts from `blog` collection sorted by date (newest first)

/**
 * Fetch all blog posts with minimal fields for listing.
 * We keep it lightweight and fast.
 */
const {
  data: posts,
  status,
  error,
} = await useAsyncData(
  () => "blog-index",
  () => queryCollection("blog").all()
);

useHead({ title: "Blog" });

// Sort posts client-side by date (newest first) to satisfy content security
const postsSorted = computed(() => {
  const list = (posts.value || []).slice();
  list.sort((a, b) => {
    const timeA = new Date(a?.date || 0).getTime();
    const timeB = new Date(b?.date || 0).getTime();
    return (
      (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
    );
  });
  return list;
});

/**
 * Format ISO date to a readable short date.
 * Keep it tiny; no external deps.
 * @param {string|undefined} iso
 */
const parseISODate = (iso) => {
  // Ensure stable parsing even on server by forcing UTC midnight for YYYY-MM-DD
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
</script>

<template>
  <div class="pt-header relative z-0">
    <section class="blog-index">
      <!-- Background Parallax Elements -->
      <div class="parallax-bg">
        <div
          class="parallax-element parallax-element--1"
          data-speed="0.3"
          data-lag="0.2"
        />
        <div
          class="parallax-element parallax-element--2"
          data-speed="0.5"
          data-lag="0.15"
        />
        <div
          class="parallax-element parallax-element--3"
          data-speed="0.2"
          data-lag="0.25"
        />
      </div>

      <div class="blog-container">
        <!-- Hero Header Section -->
        <header class="blog-hero">
          <div class="blog-hero__content">
            <h1 class="blog-hero__title">
              <span class="blog-hero__title-main">Blog</span>
              <span class="blog-hero__title-sub gradient-text">& Insights</span>
            </h1>
            <p class="blog-hero__description">
              Latest notes on web animation mastery, Nuxt wizardry, Vue
              composition, and the art of motion design that brings digital
              experiences to life.
            </p>
            <div class="blog-hero__stats">
              <div class="blog-stat">
                <span class="blog-stat__number">{{ postsSorted.length }}</span>
                <span class="blog-stat__label">Articles</span>
              </div>
              <div class="blog-stat">
                <span class="blog-stat__number">∞</span>
                <span class="blog-stat__label">Ideas</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Loading & Error States -->
        <div v-if="status === 'pending'" class="blog-loading">
          <div class="loading-spinner"/>
          <p>Crafting pixels...</p>
        </div>
        <div v-else-if="error" class="blog-error">
          <h2 class="blog-error__title">Oops! Something went sideways</h2>
          <p class="blog-error__message">
            Failed to load posts. The internet gremlins are at it again.
          </p>
        </div>

        <!-- Blog Posts Grid -->
        <div v-else class="blog-content" data-lag="0.05">
          <div class="blog-grid">
            <article
              v-for="(post, index) in postsSorted"
              :key="post.path"
              class="blog-card"
              :class="`blog-card--${index % 3}`"
              :data-speed="0.95 + (index % 3) * 0.02"
              :data-lag="0.1 + (index % 3) * 0.05"
            >
              <NuxtLink
                :to="post.path"
                class="blog-card__link"
                :aria-label="`Read article: ${post.title}`"
              >
                <div class="blog-card__inner">
                  <div class="blog-card__content">
                    <div class="blog-card__meta">
                      <time
                        v-if="post.date"
                        :datetime="post.date"
                        class="blog-card__date"
                      >
                        {{ formatDate(post.date) }}
                      </time>
                      <div v-if="post.tags?.length" class="blog-card__tags">
                        <span
                          v-for="t in post.tags.slice(0, 2)"
                          :key="t"
                          class="blog-card__tag"
                        >
                          {{ t }}
                        </span>
                      </div>
                    </div>
                    <h2 class="blog-card__title">{{ post.title }}</h2>
                    <p v-if="post.excerpt" class="blog-card__excerpt">
                      {{ post.excerpt }}
                    </p>
                  </div>
                  <div class="blog-card__arrow">
                    <div class="arrow-circle">
                      <Icon name="tabler:arrow-up-right" class="arrow-icon" />
                    </div>
                  </div>
                </div>
                <div class="blog-card__glow"/>
              </NuxtLink>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
