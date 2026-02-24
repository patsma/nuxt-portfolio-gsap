/**
 * App Configuration
 *
 * This file contains user-configurable settings that can be changed
 * without modifying the codebase. Edit these values to personalize
 * your portfolio.
 */
export default defineAppConfig({
  /**
   * Font configuration
   *
   * Choose from fonts defined in nuxt.config.ts. The selected fonts
   * are applied at runtime via CSS variables.
   *
   * DISPLAY FONTS (for headings - serif/display style):
   * - 'Instrument Serif' (default) - Clean, modern serif
   * - 'Playfair Display' - Elegant, high contrast
   * - 'Fraunces' - Variable, quirky with optical sizing
   * - 'Cormorant Garamond' - Classical, refined
   *
   * BODY FONTS (for paragraphs - sans-serif):
   * - 'IBM Plex Sans JP' (default) - Japanese support, professional
   * - 'Inter' - Variable, excellent readability
   * - 'DM Sans' - Geometric, friendly
   */
  fonts: {
    display: 'Fraunces',
    body: 'Inter'
  },

  /**
   * Personal identity displayed throughout the site
   */
  identity: {
    name: 'Jane Doe',
    title: 'Digital Designer',
    location: 'New York, USA',
    timezone: 'America/New_York',
    email: 'hello@example.com'
  },

  /**
   * Social media links
   * Set to null to hide a link
   */
  social: {
    linkedin: 'https://linkedin.com/in/username',
    behance: 'https://behance.net/username',
    dribbble: 'https://dribbble.com/username',
    github: 'https://github.com/username',
    twitter: null,
    instagram: null
  },

  /**
   * Site metadata for SEO and OG images
   */
  site: {
    url: 'https://example.com',
    description: 'Portfolio showcasing digital design and development work.',
    ogImage: {
      domain: 'example.com'
    }
  },

  /**
   * Footer configuration
   */
  footer: {
    showAttribution: true,
    attributionText: 'Built with Nuxt'
  }
})
