# Content System

Nuxt Content integration for managing portfolio content via YAML data files, content-driven Vue components, and MDC (Markdown Components) page rendering.

## Overview

**Architecture:** MDC pages + YAML data collections + content-driven Vue components
**Location:**
- MDC pages in `content/*.md`
- Data files in `content/data/`
- Components in `app/components/content/`
**Pattern:** Pages rendered via `<ContentRenderer>`, components fetch their own data via `queryCollection()`

## Content Structure

```
content/
├── index.md               # Home page (MDC)
├── about.md               # About page (MDC)
├── contact.md             # Contact page (MDC)
├── data/
│   ├── hero/              # Page-specific hero content
│   │   ├── home.yml
│   │   ├── about.yml
│   │   ├── contact.yml
│   │   └── lab.yml
│   ├── biography/         # Page-specific biography content
│   │   └── about.yml
│   ├── services.yml       # Shared services list
│   ├── case-studies.yml   # All case study items (27+)
│   ├── experience.yml     # Work history
│   ├── clients.yml        # Primary + secondary clients
│   ├── awards.yml         # Awards + featured recognition
│   └── recommendations.yml # Testimonials
├── projects/              # Existing project pages
├── blog/                  # Existing blog posts
└── lab/                   # Existing lab projects
```

## Content-Driven Components

All located in `app/components/content/`:

| Component | Data Source | Props |
|-----------|-------------|-------|
| `HeroSection` | `data/hero/*.yml` | `heroId`, `showServices`, `showScrollButton` |
| `BiographyGrid` | `data/biography/*.yml` | `biographyId` |
| `CaseStudyGrid` | `data/case-studies.yml` | `animateEntrance`, `animateOnScroll` |
| `ExperienceGrid` | `data/experience.yml` | `limit`, `viewMoreText`, `viewMoreTo` |
| `ServicesGrid` | `data/services.yml` | - |
| `ClientsGrid` | `data/clients.yml` | - |
| `AwardsGrid` | `data/awards.yml` | - |
| `RecommendationsGrid` | `data/recommendations.yml` | - |

## Data Fetching Pattern

Components use `useAsyncData` + `queryCollection`:

```typescript
// Single file collection (services, case-studies, etc.)
const { data } = await useAsyncData('services', () =>
  queryCollection('services').first()
)

// Multi-file collection (hero, biography - matched by ID)
const { data } = await useAsyncData(`hero-${props.heroId}`, async () => {
  const all = await queryCollection('hero').all()
  return all.find(h => h.stem?.endsWith(props.heroId)) || null
})
```

## Schema Definitions

All schemas defined in `content.config.ts`:

```typescript
// Hero text segment with styling variants
heroTextSegmentSchema = z.object({
  text: z.string(),
  variant: z.enum(['default', 'emphasis', 'body', 'italic'])
})

// Case study item
caseStudySchema = z.object({
  title: z.string(),
  description: z.string(),
  tag: z.string().optional(),
  image: z.string(),
  imageAlt: z.string(),
  to: z.string().optional()
})

// Experience item
experienceSchema = z.object({
  dateRange: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string()
})

// Recommendation item
recommendationSchema = z.object({
  id: z.string(),
  quote: z.string(),
  fullRecommendation: z.string(),
  authorFirstName: z.string(),
  authorLastName: z.string(),
  authorTitle: z.string(),
  authorImage: z.string().optional()
})
```

## Usage in Pages

```vue
<script setup lang="ts">
import HeroSection from '~/components/content/HeroSection.vue'
import CaseStudyGrid from '~/components/content/CaseStudyGrid.vue'
</script>

<template>
  <div>
    <HeroSection hero-id="home" />
    <CaseStudyGrid />
  </div>
</template>
```

## Adding New Content

### Add a new hero

1. Create `content/data/hero/[page-name].yml`:
```yaml
id: page-name
showServices: false
showScrollButton: true
headline:
  - text: "Your headline "
    variant: default
  - text: "with styling"
    variant: emphasis
```

2. Use in page: `<HeroSection hero-id="page-name" />`

### Add a case study

Edit `content/data/case-studies.yml`:
```yaml
items:
  - title: "New Project"
    tag: "APP"
    description: "Art direction & UI"
    image: "/assets/images/project.jpg"
    imageAlt: "Project preview"
    to: "/work/new-project"
```

### Add experience

Edit `content/data/experience.yml`:
```yaml
items:
  - dateRange: "2024 – Current"
    title: "Position Title"
    company: "Company Name"
    location: "City"
```

## MDC Page Rendering

Pages are composed using MDC syntax in markdown files. Vue pages use `<ContentRenderer>` to render the content.

### Page Vue Pattern

```vue
<script setup lang="ts">
const { data: page } = await useAsyncData('index-page', () =>
  queryCollection('pages').path('/').first()
)

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <div>
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>
```

### MDC Page File Example

`content/index.md`:
```markdown
---
title: Home
description: Danish designer based in Tokyo
seo:
  title: "Morten – Danish Designer in Tokyo"
  description: "Danish designer based in Tokyo..."
---

::HeroSection{hero-id="home"}
::

::VideoScalingSection{video-src="/assets/dummy/sample1.mp4" poster-src="/assets/dummy/placeholder.jpg" :start-width="25" :start-height="25" scroll-amount="180%" start-position="left"}
::

::CaseStudyGrid
::
```

### MDC Prop Syntax

- **String props:** `{hero-id="home"}`
- **Number props:** `{:start-width="25"}` (colon prefix for binding)
- **Boolean props:** `{show-services}` or `{:show-services="true"}`
- **Kebab-case:** Always use kebab-case in MDC (auto-converts to camelCase)

### Available MDC Components

All components in `app/components/content/` are auto-registered for MDC:

| Component | MDC Usage |
|-----------|-----------|
| `HeroSection` | `::HeroSection{hero-id="home"}::` |
| `BiographyGrid` | `::BiographyGrid{biography-id="about"}::` |
| `CaseStudyGrid` | `::CaseStudyGrid::` |
| `ExperienceGrid` | `::ExperienceGrid{view-more-text="View all"}::` |
| `ServicesGrid` | `::ServicesGrid::` |
| `ClientsGrid` | `::ClientsGrid::` |
| `AwardsGrid` | `::AwardsGrid::` |
| `RecommendationsGrid` | `::RecommendationsGrid::` |
| `VideoScalingSection` | `::VideoScalingSection{video-src="..." poster-src="..."}::` |
| `ImageScalingSection` | `::ImageScalingSection{image-src="..." image-alt="..."}::` |
| `SpacerComponent` | `::SpacerComponent{size="md"}::` |

### Nuxt Studio Compatibility

MDC pages are compatible with Nuxt Studio for visual editing. The `pages` collection schema supports SEO metadata:

```typescript
// content.config.ts
pages: defineCollection({
  type: 'page',
  source: { include: '*.md', exclude: ['data/**', 'projects/**', 'blog/**', 'lab/**'] },
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional()
    }).optional()
  })
})
```

## Related Documentation

- `.claude/COMPONENT_PATTERNS.md` - Component architecture patterns
- `.claude/PAGE_TRANSITIONS.md` - Animation system
- `content.config.ts` - Schema definitions
