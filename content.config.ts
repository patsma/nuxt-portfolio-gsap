import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// Define content collections to organize and validate content.
// Docs: https://content.nuxt.com/docs/collections/define
export default defineContentConfig({
  collections: {
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
