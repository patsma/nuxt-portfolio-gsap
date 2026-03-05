# Phase 5: Final Verification

**Goal:** Confirm zero regressions — lint clean, type-safe, builds successfully, all pages work visually.

---

## Automated Checks

Run in order:

```bash
npm run lint:fix      # Auto-fix any lint issues introduced
npm run lint          # Confirm clean (zero errors)
npm run typecheck     # Confirm zero type errors
npm run build         # Confirm production build succeeds
```

---

## Typography CSS Regression Check

After Phase 1a (typography.scss mixin refactor), verify all 56 utilities compiled:

```bash
# Build and search compiled CSS for all utility names
npm run build
# Then check: all display-* and body-* class names exist in .output/public/_nuxt/*.css
```

Key names to spot-check:
- `display-mobile-h1`
- `display-desktop-large-h2`
- `body-mobile-custom-labels`
- `body-desktop-custom-navigation-subcaption`

---

## Visual Checks (Chrome DevTools)

### For each page: `/`, `/about`, `/contact`

**Console:**
- [ ] Zero errors
- [ ] Zero warnings

**Network:**
- [ ] No 404 requests

**Animations:**
- [ ] Theme toggle: dark ↔ light transitions smoothly
- [ ] Page transitions: leave/enter directives fire correctly
- [ ] ScrollSmoother: smooth scrolling active on desktop
- [ ] Entrance animations: play on first hard load
- [ ] No FOUC on hard refresh (Ctrl+Shift+R)

**Typography:**
- [ ] Display headings render at correct sizes (mobile and desktop)
- [ ] Body text renders correctly
- [ ] Service tags render correctly

---

## Notes

- Dev server is always running at http://localhost:3000
- Use Chrome DevTools MCP tools to take screenshots and check console if needed
