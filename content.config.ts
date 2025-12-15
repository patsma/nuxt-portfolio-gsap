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
    })
  }
})
