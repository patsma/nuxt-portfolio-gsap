# OG Image System

Dynamic social sharing images with `nuxt-og-image` module for automatic Open Graph image generation.

## Overview

The system generates custom OG images for social sharing (Twitter, Facebook, LinkedIn) using a Vue template rendered server-side. Images are generated on-demand with dynamic content from page metadata.

**Module:** `nuxt-og-image`

## Key Files

| File | Purpose |
|------|---------|
| `nuxt.config.ts` | Module registration |
| `app/components/OgImage/OgImagePortfolio.vue` | Custom OG image template (1200x630) |
| `app/app.vue` | Global SEO defaults + default OG component |
| `app/pages/[...slug].vue` | Per-page dynamic OG images from content |

## How It Works

### 1. Global Defaults (app.vue)

Sets site-wide defaults that apply to all pages:

```typescript
// Global SEO defaults
useSeoMeta({
  ogSiteName: 'Morten Christensen',
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

// Default OG image for all pages
defineOgImageComponent('Portfolio', {
  title: 'Morten Christensen',
  description: 'Danish Designer in Tokyo · UX/UI Design, Art Direction & Interactive Design'
})
```

### 2. Per-Page Overrides ([...slug].vue)

Dynamic pages override with content-specific data:

```typescript
// Dynamic OG image - use page title/description if available
if (page.value) {
  defineOgImageComponent('Portfolio', {
    title: page.value?.seo?.title || page.value?.title || 'Morten Christensen',
    description: page.value?.seo?.description || page.value?.description || 'Danish Designer in Tokyo'
  })
}
```

### 3. Custom Template (OgImagePortfolio.vue)

Vue component rendered as image:
- **Dimensions:** 1200x630 (standard OG ratio)
- **Styling:** Tailwind classes (subset supported)
- **Props:** `title`, `description` with defaults

## Testing (Development)

Debug panel and direct image access in dev mode:

| URL | Purpose |
|-----|---------|
| `/__og-image__/` | Debug panel with all OG images |
| `/__og-image__/image/og.png` | Homepage OG image |
| `/__og-image__/image/about/og.png` | About page OG image |
| `/__og-image__/image/<path>/og.png` | Any page OG image |

## Testing (Production)

Validate OG images work correctly on social platforms:

1. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
2. **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
3. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

**Tip:** Social platforms cache OG images aggressively. Use the debuggers to force a refresh after changes.

## Content Frontmatter Override

Override OG data directly in markdown content files:

```yaml
---
title: "My Page Title"
description: "Page description for SEO"
seo:
  title: "Custom OG Title"        # Optional: Override for OG specifically
  description: "Custom OG desc"   # Optional: Override for OG specifically
---
```

The catch-all page automatically uses `seo.title` > `title` and `seo.description` > `description`.

## Cleanup Notes

The `nuxt.config.ts` contains redundant static OG meta tags that can be removed since `nuxt-og-image` handles dynamic generation:

**Can remove from nuxt.config.ts:**
- `og:image` and `og:image:secure_url`
- `og:image:alt`, `og:image:type`, `og:image:width`, `og:image:height`
- `twitter:image`

**Keep:**
- `/public/og.jpg` as ultimate fallback for scrapers that don't execute JavaScript
- Static `og:title`, `og:description` etc. as fallbacks

## Template Customization

Modify `app/components/OgImage/OgImagePortfolio.vue` to change the OG image design:

```vue
<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Morten Christensen',
  description: 'Danish Designer in Tokyo'
})
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between bg-[#090925] p-16">
    <!-- Your custom layout -->
  </div>
</template>
```

**Supported:** Tailwind utility classes (subset), inline styles, basic HTML.

**Not Supported:** Custom fonts (use system fonts), external images (must be base64 or public URLs), complex CSS.
