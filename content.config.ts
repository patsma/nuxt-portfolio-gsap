import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// ============================================
// REUSABLE SCHEMAS
// ============================================

/**
 * Hero text segment - allows mixing text with styling variants
 * Variants:
 * - default: 60% opacity, display font
 * - emphasis: 100% opacity, display font, light weight (names like "Morten", "Tokyo")
 * - body: 100% opacity, body font (words like "designer", "digital")
 * - italic: 100% opacity, italic (words like "Danish", "-first")
 */
const heroTextSegmentSchema = z.object({
  text: z.string(),
  variant: z.enum(['default', 'emphasis', 'body', 'italic']).optional().default('default')
})

/**
 * Case study item for interactive gallery
 */
const caseStudySchema = z.object({
  title: z.string(),
  description: z.string(),
  tag: z.string().optional(),
  image: z.string(),
  imageAlt: z.string(),
  to: z.string().optional(),
  clipDirection: z.enum(['center', 'left', 'right', 'top', 'bottom', 'random']).optional()
})

/**
 * Experience item (work history)
 */
const experienceSchema = z.object({
  dateRange: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string()
})

/**
 * Award item
 */
const awardSchema = z.object({
  count: z.number(),
  name: z.string()
})

/**
 * Featured recognition
 */
const featuredSchema = z.object({
  name: z.string()
})

/**
 * Recommendation/testimonial
 */
const recommendationSchema = z.object({
  id: z.string(),
  quote: z.string(),
  fullRecommendation: z.string(),
  authorFirstName: z.string(),
  authorLastName: z.string(),
  authorTitle: z.string(),
  authorImage: z.string().optional()
})

/**
 * Biography paragraph
 */
const biographyParagraphSchema = z.object({
  text: z.string()
})

// ============================================
// CONTENT COLLECTIONS
// ============================================

// Define content collections to organize and validate content.
// Docs: https://content.nuxt.com/docs/collections/define
export default defineContentConfig({
  collections: {
    // ----------------------------------------
    // MDC PAGE COLLECTION (root-level .md files)
    // ----------------------------------------

    // MDC pages for flexible component-based layouts
    // Components in components/content/ are auto-registered for MDC syntax
    pages: defineCollection({
      type: 'page',
      source: {
        include: '*.md',
        exclude: ['data/**', 'projects/**', 'blog/**', 'lab/**']
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        seo: z.object({
          title: z.string().optional(),
          description: z.string().optional()
        }).optional()
      })
    }),

    // ----------------------------------------
    // DATA COLLECTIONS (YAML files)
    // ----------------------------------------

    // Hero content for different pages
    hero: defineCollection({
      type: 'data',
      source: 'data/hero/*.yml',
      schema: z.object({
        id: z.string(),
        headline: z.array(heroTextSegmentSchema),
        showServices: z.boolean().optional().default(true),
        showScrollButton: z.boolean().optional().default(true)
      })
    }),

    // Services list (shared between home and about)
    services: defineCollection({
      type: 'data',
      source: 'data/services.yml',
      schema: z.object({
        items: z.array(z.string())
      })
    }),

    // Case studies for interactive gallery
    caseStudies: defineCollection({
      type: 'data',
      source: 'data/case-studies.yml',
      schema: z.object({
        items: z.array(caseStudySchema)
      })
    }),

    // Experience/work history
    experience: defineCollection({
      type: 'data',
      source: 'data/experience.yml',
      schema: z.object({
        items: z.array(experienceSchema)
      })
    }),

    // Client lists
    clients: defineCollection({
      type: 'data',
      source: 'data/clients.yml',
      schema: z.object({
        primary: z.array(z.string()),
        secondary: z.array(z.string())
      })
    }),

    // Awards & recognition
    awards: defineCollection({
      type: 'data',
      source: 'data/awards.yml',
      schema: z.object({
        awards: z.array(awardSchema),
        featured: z.array(featuredSchema)
      })
    }),

    // Recommendations/testimonials
    recommendations: defineCollection({
      type: 'data',
      source: 'data/recommendations.yml',
      schema: z.object({
        items: z.array(recommendationSchema)
      })
    }),

    // Biography content (page-specific, like hero)
    biography: defineCollection({
      type: 'data',
      source: 'data/biography/*.yml',
      schema: z.object({
        id: z.string(),
        label: z.string().optional().default('Biography'),
        paragraphs: z.array(biographyParagraphSchema)
      })
    }),

    // ----------------------------------------
    // PAGE COLLECTIONS (existing)
    // ----------------------------------------

    // Projects collection: all markdown files in content/projects
    projects: defineCollection({
      type: 'page',
      source: {
        include: 'projects/*.md',
        prefix: '/projects'
      },
      // Minimal schema for consistent metadata across projects
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        category: z.string().optional(),
        cover: z.string().optional(),
        video: z.string().optional(),
        liveLink: z.string().optional(),
        components: z.array(z.string()).optional(),
        summary: z.string().optional()
      })
    }),
    // Blog collection: simple blog posts in content/blog
    blog: defineCollection({
      type: 'page',
      source: {
        include: 'blog/*.md',
        prefix: '/blog'
      },
      // Lightweight schema for a basic blog
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        date: z.string().optional(), // ISO date string
        tags: z.array(z.string()).optional(),
        excerpt: z.string().optional(),
        cover: z.string().optional(),
        author: z.string().optional()
      })
    }),
    // Lab collection: experimental projects and tools
    lab: defineCollection({
      type: 'page',
      source: {
        include: 'lab/*.md',
        prefix: '/lab'
      },
      // Schema for lab projects with marquee display data
      schema: z.object({
        title: z.string(), // Full project title
        slug: z.string(), // URL slug
        shortTitle: z.string(), // Short title for marquee (italic)
        thumbnail: z.string(), // Small image for marquee
        cover: z.string().optional(), // Large image for expanded view
        images: z.array(z.string()).optional(), // Bento grid images (3 images: 1 large + 2 small)
        description: z.string(), // Description text for expanded view
        date: z.string().optional(), // ISO date string
        tags: z.array(z.string()).optional(),
        category: z.string().optional(), // Category tag (e.g., "Template", "Animation")
        status: z.enum(['experimental', 'stable', 'deprecated']).optional(),
        entries: z.array(z.object({
          type: z.string(),
          link: z.string().nullable().optional(),
          title: z.string(),
          description: z.string()
        })).optional()
      })
    })
  }
})
