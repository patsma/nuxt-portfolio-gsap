import { defineContentConfig, defineCollection, z, property } from '@nuxt/content'

// ============================================
// REUSABLE SCHEMAS
// ============================================

/**
 * Hero text segment - allows mixing text with styling variants
 * Variants:
 * - default: 60% opacity, display font
 * - emphasis: 100% opacity, display font, light weight
 * - body: 100% opacity, body font
 * - italic: 100% opacity, italic
 */
const heroTextSegmentSchema = z.object({
  text: z.string(),
  variant: z.enum(['default', 'emphasis', 'body', 'italic']).optional().default('default').describe('default = 60% opacity, emphasis = full weight, body = body font, italic = italic style')
})

// ============================================
// CONTENT COLLECTIONS
// ============================================

export default defineContentConfig({
  collections: {
    // MDC pages — components in components/content/ are auto-registered for MDC syntax
    pages: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['data/**']
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

    // Services list
    services: defineCollection({
      type: 'data',
      source: 'data/services.yml',
      schema: z.object({
        items: z.array(z.string())
      })
    })
  }
})
