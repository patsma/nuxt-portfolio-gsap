# Phase 2: Comment Standardization

**Goal:** Apply the comment standard consistently across all TypeScript and Vue files.

---

## Comment Standard

| Type | Format | When to use |
|------|--------|-------------|
| File header | `/** */` JSDoc block | Every `.ts` file, one paragraph max |
| Function doc | `/** */` | Only non-obvious functions |
| Inline logic | `//` single-line | Only when "why" isn't clear from code |
| Section divider | `// ─────────── NAME ───────────` | Files > 150 lines, major logical sections |
| Critical callout | `// CRITICAL:` / `// IMPORTANT:` / `// NOTE:` | Keep all — they're valuable |
| Debug logs | `// console.log(...)` | Keep commented-out — useful for debugging |

**Remove:** Anything that just restates the code.

```typescript
// ❌ Remove these
const loadingStore = useLoadingStore()  // Get loading store
isClient.value = true  // Set client flag
const tl = gsap.timeline()  // Create timeline

// ✅ Keep these
// Lock height before SplitText to prevent Safari jump
const originalHeight = el.offsetHeight

// CRITICAL: Immediately sync store with what we just read from DOM
themeStore.isDark = isDarkInitially
```

---

## Processing Order

### 1. Composables (`app/composables/*.ts`)
- `usePageTransition.ts` — standardize section dividers to em-dash style
- `useThemeSwitch.ts` — same, standardize section dividers
- `useEntranceAnimation.ts`
- `useScrollSmootherManager.ts`
- `useMagnetic.ts`
- `useLoadingSequence.ts` — remove `// Get loading store` pattern
- `useIsMobile.ts`
- `useLocalTime.ts` — add file header if missing
- `useVideoPoster.ts` — add file header if missing
- All other composables

### 2. Directives (`app/directives/*.ts`)
- `v-page-split.ts`
- `v-page-fade.ts`
- `v-page-clip.ts`
- `v-page-stagger.ts`

### 3. Plugins (`app/plugins/*.ts`)
- `page-transitions.ts`
- `theme.client.ts`
- `loader-manager.client.ts`
- All others

### 4. Stores (`app/stores/*.ts`)
- `theme.ts`
- `loading.ts`

### 5. Components (`app/components/**/*.vue`)
- Script sections only — focus on `<script setup>` blocks
- Template: keep architectural `<!-- comments -->`, remove obvious ones

### 6. Server plugins (`app/server/plugins/*.ts`)

---

## Section Divider Format

**Before:**
```typescript
// ========================================
// ANIMATION FUNCTIONS
// ========================================
```

**After:**
```typescript
// ─────────── Animation Functions ───────────
```

- Use em-dashes `─` (U+2500)
- Title case for section names
- Total line ~50 chars
- One blank line above, one below

---

## Obvious Comment Grep Patterns

Search for these and evaluate each match:
- `// Get ` — likely obvious
- `// Set ` — often obvious
- `// Create ` — often obvious
- `// Return ` — often obvious
- `// Log ` — often obvious
- Inline trailing comments on simple assignments
