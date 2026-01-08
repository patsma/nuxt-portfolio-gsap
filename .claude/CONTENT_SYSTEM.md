# Content System

Nuxt Content integration for managing portfolio content via YAML data files and content-driven Vue components.

## Overview

**Architecture:** YAML data collections + content-driven Vue components
**Location:** Content files in `content/data/`, components in `app/components/content/`
**Pattern:** Components fetch their own data via `queryCollection()`

## Content Structure

```
content/
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

## Future: MDC Page Rendering

Components are MDC-ready. When needed, create `content/index.md`:

```markdown
---
title: Home
---

::HeroSection{heroId="home"}
::

::CaseStudyGrid
::
```

Then update `pages/index.vue` to use `<ContentRenderer>`.

## Related Documentation

- `.claude/COMPONENT_PATTERNS.md` - Component architecture patterns
- `.claude/PAGE_TRANSITIONS.md` - Animation system
- `content.config.ts` - Schema definitions
