# nuxt.com/templates Submission Guide

This document contains instructions for submitting this template to the official [nuxt.com/templates](https://nuxt.com/templates) directory.

## Current Status

- **Fork**: https://github.com/patsma/nuxt.com
- **Template file**: `content/templates/nuxt-portfolio-gsap.yml` (already created)
- **Demo**: https://mp2025.netlify.app

## Pre-Submission Checklist

Before opening the PR, verify:

- [ ] Demo URL is live and working
- [ ] All pages load correctly on demo
- [ ] Dark/light theme works
- [ ] Page transitions work
- [ ] Mobile responsive
- [ ] README deploy buttons work
- [ ] No console errors on demo site

## How to Submit

### 1. Sync Fork (if needed)

If time has passed since forking, sync your fork with upstream:

```bash
gh repo sync patsma/nuxt.com
```

### 2. Open Pull Request

From the fork, create a PR to the main nuxt/nuxt.com repository:

```bash
gh pr create \
  --repo nuxt/nuxt.com \
  --head patsma:main \
  --base main \
  --title "feat(templates): add nuxt-portfolio-gsap template" \
  --body "$(cat <<'EOF'
### Type of change
- [x] ✨ New feature (a non-breaking change that adds functionality)

### Description
Add GSAP Portfolio template featuring:
- GSAP Club plugins (ScrollSmoother, SplitText, MorphSVG)
- Directive-based page transitions
- WebGL fluid gradient background (TresJS)
- Theme-aware loading system
- Safari-optimized 60fps performance

Repository: https://github.com/patsma/nuxt-portfolio-gsap
Demo: https://mp2025.netlify.app
EOF
)"
```

Or manually at: https://github.com/nuxt/nuxt.com/compare/main...patsma:nuxt.com:main

### 3. Wait for Review

The Nuxt team will review your submission. They may:
- Request changes to the YAML file
- Ask questions about the template
- Auto-generate a screenshot from your demo URL

## Template YAML Reference

The submitted template file (`content/templates/nuxt-portfolio-gsap.yml`):

```yaml
name: 'GSAP Portfolio'
slug: 'nuxt-portfolio-gsap'
description: 'A high-performance portfolio with GSAP animations, smooth scrolling, and WebGL backgrounds.'
repo: 'patsma/nuxt-portfolio-gsap'
demo: 'https://mp2025.netlify.app'
```

## Template Differentiation

This template differentiates from existing templates with:

| Feature | Standard Portfolios | This Template |
|---------|---------------------|---------------|
| Animation system | Basic CSS/Vue | GSAP Club plugins (ScrollSmoother, SplitText, MorphSVG) |
| Page transitions | None/Basic | Directive-based (`v-page-split`, `v-page-fade`, `v-page-clip`) |
| Scroll behavior | Native | ScrollSmoother with headroom header |
| Background | Static | WebGL fluid gradient (TresJS) |
| Theme switching | CSS variables | GSAP-animated with SVG morphing |
| Loading system | Basic | Theme-aware loader with entrance animations |
| Safari optimization | Standard | Specific 60fps fixes |

## Links

- **This repo**: https://github.com/patsma/nuxt-portfolio-gsap
- **Fork with template file**: https://github.com/patsma/nuxt.com
- **nuxt.com templates**: https://nuxt.com/templates
- **nuxt.com repo**: https://github.com/nuxt/nuxt.com
