# Next Session Handoff

Quick reference for continuing work on morten-2025 portfolio.

## Current State (Jan 2026)

### What's Working
- **Content System**: Full MDC + YAML hybrid setup
- **Catch-all Routing**: `pages/[...slug].vue` handles `/`, `/about`, `/contact`
- **Content-driven Components**: All in `app/components/content/`
- **Page Transitions**: Working for most components
- **Lint & Typecheck**: Both passing clean

### Git Status
```
8 commits ahead of origin/main (not pushed)
Changes include:
- Phase 7: Catch-all routing
- Phase 7.1: Page transition fix (definePageMeta key)
```

Run `git status` to see current state, `git push` when ready.

---

## Known Issues

### 1. InteractiveCaseStudySection Preview Animation (HIGH)
**Problem**: When clicking a case study item, the preview image vanishes instantly instead of animating out.

**Location**: `app/components/InteractiveCaseStudySection.vue`

**What we tried**:
- Added `definePageMeta({ key: route => route.fullPath })` to catch-all page
- The `v-page-fade="{ leaveOnly: true }"` directive is on the section
- `onBeforeRouteLeave` hook calls `clearActivePreviewImmediate()`

**Root cause speculation**:
- The preview is teleported to `<body>` via `<Teleport>`
- Page transition system walks DOM from page root, may not find teleported elements
- The `onBeforeRouteLeave` + navigation delay logic may be racing with transitions

**Recommended refactor**:
- Simplify the preview system
- Consider not using Teleport, or handle preview cleanup differently
- The component is 430+ lines and overly complex

### 2. Footer Section (TODO)
**Task**: Footer needs content update/refactoring

**Location**: `app/layouts/default.vue` lines 119-128 (hardcoded content)

**Consider**: Making it content-driven like other components

---

## Architecture Summary

### Content Flow
```
content/*.md (MDC pages)     → pages/[...slug].vue → <ContentRenderer>
content/data/*.yml (data)    → components query via queryCollection()
```

### Key Files
| File | Purpose |
|------|---------|
| `pages/[...slug].vue` | Catch-all page for MDC content |
| `content.config.ts` | All collection schemas |
| `app/components/content/` | MDC-enabled components |
| `app/composables/usePageTransition.ts` | Page transition logic |
| `app/components/InteractiveCaseStudySection.vue` | Needs refactor |

### Collections Defined
- `pages` - MDC page files (`**/*.md`)
- `hero` - Hero content per page
- `services` - Services list
- `caseStudies` - Case study items
- `experience` - Work history
- `clients` - Client lists
- `awards` - Awards & recognition
- `recommendations` - Testimonials
- `biography` - Biography content
- `projects`, `blog`, `lab` - Existing collections

---

## Commands

```bash
npm run dev          # Start dev server
npm run lint -- --fix # Lint with auto-fix
npm run typecheck    # TypeScript check
npm run build        # Production build
```

---

## Files Changed in Phase 7

**Created**:
- `app/pages/[...slug].vue` - Catch-all page with `definePageMeta` key

**Deleted**:
- `app/pages/index.vue`
- `app/pages/about.vue`
- `app/pages/contact.vue`

**Modified**:
- `content.config.ts` - Updated pages source to `**/*.md`, added Studio hints

---

## Documentation

- `.claude/CLAUDE.md` - Main codebase guide
- `.claude/CONTENT_SYSTEM.md` - Content architecture
- `.claude/PAGE_TRANSITIONS.md` - Transition system
- `.claude/COMPONENT_PATTERNS.md` - Component patterns
- `.claude/plans/tidy-fluttering-bubble.md` - Full migration plan

---

## Next Steps

1. **Commit Phase 7 changes** - 8 commits ready to push
2. **Footer refactor** - Make content-driven or update content
3. **InteractiveCaseStudySection refactor** - Simplify preview system
4. **Nuxt Studio testing** - Verify visual editing works

---

## Quick Context for AI

When starting a new session, say:
> "Read `.claude/NEXT_SESSION.md` for context on where we left off"

Or provide specific task:
> "The InteractiveCaseStudySection preview animation isn't working on page leave. The component needs refactoring - it's overcomplicated. See `.claude/NEXT_SESSION.md` for details."
