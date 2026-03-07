/**
 * App Configuration
 *
 * Customize your portfolio identity and settings here.
 * This is the main file you'll edit to personalize the template.
 */
export default defineAppConfig({
  /**
   * Typography - Single source of truth for fonts
   * The fonts.client.ts plugin applies these to CSS variables
   * @nuxt/fonts will automatically load these font families
   */
  fonts: {
    // Display font for headings (serif)
    display: 'Fraunces',
    // Body font for paragraphs and UI (sans-serif)
    body: 'Inter'
  },

  /**
   * Your personal/brand identity
   */
  identity: {
    // Your name as displayed in header and metadata
    name: 'Your Name',

    // Your professional title/role
    title: 'Digital Designer',

    // Location displayed in header (optional - set to null to hide)
    location: 'Your City',

    // Timezone for live clock in header (optional - set to null to disable)
    // See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    timezone: 'America/New_York',

    // Contact email
    email: 'hello@example.com'
  },

  /**
   * Social media links
   * Set any to null to hide from footer
   */
  social: {
    linkedin: 'https://linkedin.com/in/yourprofile',
    behance: 'https://behance.net/yourprofile',
    dribbble: null,
    github: null,
    twitter: null,
    instagram: null
  },

  /**
   * Site metadata for SEO and social sharing
   */
  site: {
    // Site URL (used for OG images and canonical URLs)
    url: 'https://example.com',

    // Default meta description
    description: 'Portfolio showcasing digital design and development work. Crafting experiences rooted in purpose, function, and craft.',

    // OG Image settings
    ogImage: {
      // Domain shown on OG images
      domain: 'example.com'
    }
  },

  /**
   * Footer attribution (template creator info)
   * You can customize or remove this section
   */
  footer: {
    // Show "Built with" attribution
    showAttribution: true,
    attributionText: 'Built with Nuxt Portfolio Template'
  }
})
