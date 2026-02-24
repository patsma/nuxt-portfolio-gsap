/**
 * App Configuration Type Definitions
 *
 * Extends the Nuxt AppConfig interface with custom identity and social settings.
 * These types enable TypeScript support for useAppConfig() throughout the app.
 */

/**
 * Font configuration for easy font swapping
 *
 * Display fonts (serif/display): 'Instrument Serif', 'Playfair Display', 'Fraunces', 'Cormorant Garamond'
 * Body fonts (sans-serif): 'IBM Plex Sans JP', 'Inter', 'DM Sans'
 */
export interface AppConfigFonts {
  /** Display font for headings. Must match a font family in nuxt.config.ts */
  display: string
  /** Body font for paragraphs. Must match a font family in nuxt.config.ts */
  body: string
}

export interface AppConfigIdentity {
  /** Display name in header and metadata */
  name: string
  /** Professional title/role */
  title: string
  /** Location displayed in header (optional - set to null to hide) */
  location: string | null
  /** Timezone for live clock in header (optional - set to null to disable) */
  timezone: string | null
  /** Contact email address */
  email: string
}

export interface AppConfigSocial {
  /** LinkedIn profile URL (set to null to hide) */
  linkedin: string | null
  /** Behance profile URL (set to null to hide) */
  behance: string | null
  /** Dribbble profile URL (set to null to hide) */
  dribbble: string | null
  /** GitHub profile URL (set to null to hide) */
  github: string | null
  /** Twitter/X profile URL (set to null to hide) */
  twitter: string | null
  /** Instagram profile URL (set to null to hide) */
  instagram: string | null
}

export interface AppConfigSite {
  /** Site URL for OG images and canonical URLs */
  url: string
  /** Default meta description */
  description: string
  /** OG Image settings */
  ogImage: {
    /** Domain shown on OG images */
    domain: string
  }
}

export interface AppConfigFooter {
  /** Show "Built with" attribution */
  showAttribution: boolean
  /** Attribution text */
  attributionText: string
}

declare module 'nuxt/schema' {
  interface CustomAppConfig {
    fonts?: AppConfigFonts
    identity?: AppConfigIdentity
    social?: AppConfigSocial
    site?: AppConfigSite
    footer?: AppConfigFooter
  }
}

export {}
