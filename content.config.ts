import { defineContentConfig, defineCollection, z, property } from '@nuxt/content'

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
  variant: z.enum(['default', 'emphasis', 'body', 'italic']).optional().default('default').describe('default = 60% opacity, emphasis = full weight, body = body font, italic = italic style')
})

/**
 * Case study item for interactive gallery
 */
const caseStudySchema = z.object({
  title: z.string(),
  slug: z.string().optional().describe('URL slug for the /work/[slug] detail page'),
  description: z.string(),
  tag: z.string().optional().describe('Category label shown on hover (e.g. BRANDING, APP, WEB)'),
  image: property(z.string()).editor({ input: 'media' }).describe('Preview image shown in the interactive gallery'),
  imageAlt: z.string().describe('Alt text for the preview image'),
  slideshowImages: z.array(z.string()).optional(),
  slideshowImageAlts: z.array(z.string()).optional(),
  to: z.string().optional(),
  clipDirection: z.enum(['center', 'left', 'right', 'top', 'bottom', 'random']).optional().describe('Direction of the clip-path reveal animation')
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
  quote: z.string().describe('Short excerpt shown in the collapsed card'),
  fullRecommendation: z.string().describe('Full text shown when card is expanded'),
  authorFirstName: z.string(),
  authorLastName: z.string(),
  authorTitle: z.string(),
  authorImage: property(z.string()).editor({ input: 'media' }).optional().describe('Author avatar image (optional)')
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
    // Uses **/*.md to support nested pages (e.g., content/work/project.md → /work/project)
    pages: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['data/**', 'lab/**', 'work/**']
      },
      schema: z.object({
        title: z.string().describe('Page title'),
        description: z.string().optional().describe('Page description'),
        seo: z.object({
          title: z.string().optional().describe('SEO title (optional override)'),
          description: z.string().optional().describe('SEO meta description')
        }).optional(),
        ogImage: z.object({
          component: z.string().optional(),
          props: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            cover: property(z.string()).editor({ input: 'media' }).optional()
          }).optional()
        }).optional().describe('Open Graph image configuration')
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
    // PAGE COLLECTIONS
    // ----------------------------------------

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
        shortTitle: z.string().describe('Short title for the marquee (shown in italic)'),
        thumbnail: property(z.string()).editor({ input: 'media' }).describe('Small image shown in the marquee strip'),
        cover: property(z.string()).editor({ input: 'media' }).optional().describe('Large image shown in the expanded bento view'),
        images: z.array(property(z.string()).editor({ input: 'media' })).optional().describe('Bento grid images (3 images: 1 large + 2 small)'),
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
    }),

    // Work collection: case study detail pages
    work: defineCollection({
      type: 'page',
      source: {
        include: 'work/*.md',
        prefix: '/work'
      },
      schema: z.object({
        title: z.string(), // Project title
        slug: z.string(), // URL slug
        client: z.string().optional(), // Client name
        role: z.string().optional(), // Designer's role
        year: z.string().optional(), // Project year
        tag: z.string().optional(), // Category (APP, INTRANET, etc.)
        cover: property(z.string()).editor({ input: 'media' }).optional().describe('Main cover image for the case study'),
        images: z.array(property(z.string()).editor({ input: 'media' })).optional().describe('Bento grid images (3+ recommended)'),
        description: z.string().optional(), // Brief description
        displayOrder: z.number().optional().default(99).describe('Lower numbers appear first in navigation (default: 99)'),
        liveLink: z.string().optional() // Link to live project
      })
    })
  }
})
