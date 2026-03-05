# Phase 4: Documentation Update

**Goal:** Bring `.claude/` docs in sync with the actual codebase. Fix cross-references, path consistency, and add missing composable documentation.

---

## 4a. CLAUDE.md — File Structure Update

Add `useScrollTriggerInit.ts` to the composables list:

```
├── composables/
│   ├── usePageTransition.ts
│   ├── useScrollSmootherManager.ts
│   ├── useEntranceAnimation.ts
│   ├── useScrollTriggerInit.ts    ← ADD THIS
│   ...
```

Add a "Key Patterns" entry for `useScrollTriggerInit`:

```typescript
// useScrollTriggerInit.ts
// Abstraction used by 7+ components to set up ScrollTrigger animations.
// Handles refresh coordination with ScrollSmoother automatically.
const { initScrollTriggers } = useScrollTriggerInit()
```

Standardize path notation: always include `app/` prefix (e.g., `app/components/HeaderGrid.vue`).

---

## 4b. COMPONENT_PATTERNS.md — Add useScrollTriggerInit Section

Add section before or after "Scroll Animations":

**`useScrollTriggerInit` Abstraction**

Replaces the 25-line manual ScrollTrigger setup pattern in components. Used by 7+ components.

Include before/after code example.

Cross-reference: see `SCROLL_SYSTEM.md` for full documentation.

---

## 4c. SCROLL_SYSTEM.md — Update composable references

Confirm `useScrollTriggerInit` is documented with current usage (7 components). Verify code examples are still accurate against actual codebase.

---

## 4d. NUXT-STUDIO.md — Verify module name

Check if `nuxt-studio` is the current module name. If changed, update. Expand troubleshooting section with at least 2 more common issues and their solutions.

---

## 4e. Path Consistency Audit

Grep all `.claude/*.md` files for component references without `app/` prefix. Update to be consistent.

Pattern to find: file paths starting with `components/`, `composables/`, `plugins/` without leading `app/`.

---

## 4f. README.md Polish

- Make features list concrete and specific (e.g., "GSAP 3.x with Club GreenSock plugins — free as of 2025")
- Verify all external links are live
- Ensure deploy buttons are correct

---

## Verification

Read through CLAUDE.md end-to-end after changes. Verify all file paths mentioned exist in the codebase.
