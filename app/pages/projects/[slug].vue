<script setup>
import { useSwipe } from "maz-ui/composables";
import { useHintsStore } from "~/stores/hints";
import useIsMobile from "~/composables/useIsMobile";
// Dynamic project page driven by @nuxt/content
// - Renders markdown body via <ContentRenderer>
// - Provides basic error and loading states

const route = useRoute();
const slug = computed(() => String(route.params.slug || ""));

// Fetch project by path inside `projects` collection
const {
  data: project,
  status,
  error,
} = await useAsyncData(
  () => `project-${slug.value}`,
  () => queryCollection("projects").path(`/projects/${slug.value}`).first()
);

const pageTitle = computed(() => project.value?.title || slug.value);

// Extract optional live link from frontmatter if present
const liveLink = computed(() => project.value?.liveLink || "");

useHead({ title: `${pageTitle.value} • Projects` });

// Use Nuxt Content navigation helper (stable fields: title, path)
const { data: navItems } = await useAsyncData(
  () => `projects-nav`,
  () => queryCollectionNavigation("projects").order("title", "ASC")
);

const normalizePath = (p) => String(p || "").replace(/\/+$/, "");
const currentPath = computed(() => normalizePath(`/projects/${slug.value}`));
const { data: allProjects } = await useAsyncData(
  () => `projects-all`,
  () => queryCollection("projects").all()
);
const navList = computed(() => {
  const nav = (navItems.value || []).filter(Boolean);
  if (nav.length > 1) return nav.map((i) => ({ title: i.title, path: i.path }));
  const raw = allProjects.value || [];
  return raw
    .map((p) => ({
      title: p.title || p.slug || "(untitled)",
      path: p.path || p._path,
    }))
    .filter((i) => !!i.path)
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
});
const navIndex = computed(() =>
  (navList.value || []).findIndex(
    (item) => normalizePath(item.path) === currentPath.value
  )
);
const prevProject = computed(() => {
  const list = navList.value || [];
  return navIndex.value > 0 ? list[navIndex.value - 1] : null;
});
const nextProject = computed(() => {
  const list = navList.value || [];
  return navIndex.value >= 0 && navIndex.value < list.length - 1
    ? list[navIndex.value + 1]
    : null;
});

// Custom path to go after the last project (fallback for "next")
/** @type {string} */
const NEXT_FALLBACK_PATH = "/about";

/**
 * Whether the current project is the last in the ordered list.
 * We use this to decide if we should route to the fallback path.
 */
const isLastProject = computed(() => {
  const list = navList.value || [];
  if (!list.length || navIndex.value < 0) return false;
  return navIndex.value === list.length - 1;
});

/**
 * Resolved path for the next navigation action.
 * If there is no next project, falls back to NEXT_FALLBACK_PATH.
 */
const nextPath = computed(() => nextProject.value?.path || NEXT_FALLBACK_PATH);

// Keyboard navigation: ArrowLeft / ArrowRight to move between projects
const router = useRouter();

// Prevent rapid double navigations causing smoother crashes
const isNavigating = ref(false);
const navigateToPath = (path) => {
  if (!path || isNavigating.value) return;
  isNavigating.value = true;
  // Push, then release the guard after route completes
  router.push(path).finally(() => {
    // small delay to let new page mount and plugin reinit
    setTimeout(() => {
      isNavigating.value = false;
    }, 300);
  });
};

/**
 * Check if the event target is an editable element.
 * We skip keyboard navigation when user is typing or interacting with inputs.
 * @param {EventTarget|null} el
 * @returns {boolean}
 */
const isEditableTarget = (el) => {
  if (!el) return false;
  const tag = (el.tagName || "").toLowerCase();
  if (el.isContentEditable) return true;
  return tag === "input" || tag === "textarea" || tag === "select";
};

/**
 * Handle global keydown for Left/Right arrows. Navigates to prev/next project
 * when available. Ignores when modifiers are pressed or target is editable.
 * @param {KeyboardEvent} event
 */
const handleKeydown = (event) => {
  if (!event || event.defaultPrevented) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (isEditableTarget(event.target)) return;

  if (event.key === "ArrowLeft" && prevProject.value?.path) {
    navigateToPath(prevProject.value.path);
  } else if (event.key === "ArrowRight") {
    // If there is a next project go there, otherwise use the fallback
    navigateToPath(nextProject.value?.path || NEXT_FALLBACK_PATH);
  }
};

// Swipe navigation using Maz-UI useSwipe composable
// Attach to the root section via a template ref
const pageRef = ref(null);
const { start: startSwipe, stop: stopSwipe } = useSwipe({
  element: pageRef,
  // Swipe Left: go to next project (content moves left)
  onLeft: () => {
    // If there is a next project go there, otherwise use the fallback
    navigateToPath(nextProject.value?.path || NEXT_FALLBACK_PATH);
  },
  // Swipe Right: go to previous project
  onRight: () => {
    if (prevProject.value?.path) navigateToPath(prevProject.value.path);
  },
  threshold: 56,
});

// Navigation hints management
const hintsStore = useHintsStore();
const showDesktopHint = ref(false);
const showMobileHint = ref(false);

// Use proper mobile detection composable
const { isMobile } = useIsMobile();

// Check if we should show navigation hints
const shouldShowNavigationHints = computed(() => {
  // Only show hints if there are multiple projects to navigate between
  return !!(prevProject.value || nextProject.value) && !!project.value;
});

onMounted(() => {
  // Initialize keyboard navigation
  window.addEventListener("keydown", handleKeydown, { passive: true });

  // Initialize swipe navigation
  startSwipe();

  // Initialize hints system
  hintsStore.loadPersistedHints();

  // Show hints after a delay if they haven't been shown before
  setTimeout(() => {
    if (shouldShowNavigationHints.value) {
      if (
        !hintsStore.hasShown("project-navigation-desktop") &&
        !isMobile.value
      ) {
        showDesktopHint.value = true;
        // Auto-hide after 4 seconds
        setTimeout(() => {
          showDesktopHint.value = false;
          hintsStore.markAsShown("project-navigation-desktop");
        }, 4000);
      }

      if (!hintsStore.hasShown("project-navigation-mobile") && isMobile.value) {
        showMobileHint.value = true;
        // Auto-hide after 4 seconds
        setTimeout(() => {
          showMobileHint.value = false;
          hintsStore.markAsShown("project-navigation-mobile");
        }, 4000);
      }
    }
  }, 2000);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  stopSwipe();
});

// Inline debug object visible in UI
const debugInfo = computed(() => ({
  currentPath: currentPath.value,
  navIndex: navIndex.value,
  prev: prevProject.value
    ? { title: prevProject.value.title, path: prevProject.value.path }
    : null,
  next: nextProject.value
    ? { title: nextProject.value.title, path: nextProject.value.path }
    : null,
  navItemsCount: (navItems.value || []).length,
  navListCount: (navList.value || []).length,
  navListPaths: (navList.value || []).map((i) => i.path),
}));
</script>

<template>
  <section ref="pageRef" class="project-page pt-header">
    <div v-if="status === 'pending'" class="project-page__loading">
      Loading…
    </div>
    <div v-else-if="error || !project" class="empty-state">
      <div class="empty-state__wrapper" role="status" aria-live="polite">
        <div class="empty-state__icon" aria-hidden="true">
          <Icon name="mdi:file-search-outline" />
        </div>
        <h2 class="empty-state__title">Project not found</h2>
        <p class="empty-state__copy">
          It may have been moved or renamed. Explore other projects or learn
          more about me.
        </p>
        <div class="empty-state__actions">
          <NuxtLink to="/projects" class="btn-standard">
            <span>Browse Projects</span>
          </NuxtLink>
          <NuxtLink to="/about" class="btn-standard-outlined">
            <span>About</span>
          </NuxtLink>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="project-page__body prose prose-invert">
        <ContentRenderer :value="project" />

        <div v-if="liveLink" class="project-container">
          <div class="project-page__live-link">
            <NuxtLink
              :to="liveLink"
              external
              target="_blank"
              rel="noopener noreferrer"
              class="btn-standard-outlined"
              aria-label="Open live project in new tab"
            >
              <span class="project-page__live-link-button"> Live Link </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Bottom navigation: Previous / Next projects -->
        <div v-if="prevProject || nextProject" class="project-container">
          <div class="project-page__navigation">
            <NuxtLink
              v-if="prevProject"
              :to="prevProject.path"
              class="btn-standard-outlined"
              aria-label="Previous project"
            >
              <span class="project-page__navigation-button">
                <Icon
                  name="tabler:arrow-left"
                  class="project-page__navigation-button-icon"
                />
                <!-- {{ prevProject.title || "Previous" }}  -->
              </span>
            </NuxtLink>

            <div class="project-page__navigation-spacer" />

            <NuxtLink
              :to="nextPath"
              class="btn-standard-outlined"
              :aria-label="isLastProject ? 'About page' : 'Next project'"
            >
              <span class="project-page__navigation-button">
                <!-- {{ nextProject.title || "Next" }} -->
                <Icon
                  name="tabler:arrow-right"
                  class="project-page__navigation-button-icon"
                />
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Navigation Hint (Arrow Keys) -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="showDesktopHint"
        class="project-page__hint project-page__hint--desktop"
      >
        <div class="project-page__hint-keys">
          <div class="project-page__hint-key-group">
            <kbd>←</kbd>
            <kbd>→</kbd>
          </div>
          <span>Use arrow keys to navigate projects</span>
        </div>
      </div>
    </Transition>

    <!-- Mobile Navigation Hint (Swipe Gestures) -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="showMobileHint"
        class="project-page__hint project-page__hint--mobile"
      >
        <div class="project-page__hint-swipe">
          <svg
            class="project-page__hint-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4"
            />
          </svg>
          <span>Swipe to navigate</span>
        </div>
      </div>
    </Transition>
  </section>
</template>
