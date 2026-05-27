# HANDOFF.md — Carta

_Update this file at the end of every meaningful work block._

---

## Current phase
**Phase 6 — Final Audit** (linting ✅ · browser testing ✅ · tweaks pending)

## What was just completed (2026-05-27)
Full build across all six phases. User tested in browser and confirmed everything works. Starting next session to address questions and visual tweaks.

Completed:
- Phase 2: `index.html`, all four CSS files, SVG assets
- Phase 3: `data/menu.json` (30 items across 5 sections), `js/menu.js` (render + filter + sticky nav)
- Phase 4: `data/availability.json` (43 dates), `js/reservation.js` (5-step flow + validation + confirmation), `js/data.js`, `js/main.js`
- Phase 5: `package.json`, Husky, lint-staged, ESLint v9 flat config, Stylelint + order, Prettier, html-validate, Netlify config
- Phase 6 (partial): All four linters pass clean; browser-tested by user

## Exact next task
Address user questions and visual tweaks (details to come in the next session).

To re-run linting at any time:
```bash
npx eslint "js/**/*.js"
npx stylelint "css/**/*.css"
npx html-validate index.html
npx prettier --check "**/*.{html,css,js}"
```

To serve locally:
```bash
npx serve .   # http://localhost:3000
```

## Decisions made this session (not yet in CLAUDE.md)
- Availability data keyed by named bands (`small`/`medium`/`large`/`private`) rather than exact party-size integers
- `data.js` uses `fetch()` — requires local server, not `file://` protocol
- `eslint.config.js` uses CommonJS `module.exports` (no `"type": "module"` in package.json)
- Phosphor Icons loaded via CSS CDN (`@phosphor-icons/web` jsDelivr) — avoids module/non-module conflict
- `simulateSubmit()` in `reservation.js` always succeeds — error banner in HTML for future real API integration

## Known gotchas
- The `_note` key in `availability.json` is a metadata comment; lookups for it as a date key return null, which is handled gracefully
- `stylelint-config-standard` defaults to disallowing BEM `--` modifiers — overridden in `stylelint.config.js` with a BEM-compatible pattern

## Remaining phases
- ~~Phase 1: Pre-code declaration~~ ✓
- ~~Phase 2: Core HTML/CSS scaffold~~ ✓
- ~~Phase 3: Menu JS~~ ✓
- ~~Phase 4: Reservation JS~~ ✓
- ~~Phase 5: Pre-commit tooling~~ ✓
- **Phase 6: Final audit** — lint ✅, browser test ✅, Lighthouse audit + Lighthouse contrast check TBD
