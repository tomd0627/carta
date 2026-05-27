# Carta — CLAUDE.md

## Project in one sentence
Vanilla HTML/CSS/JS restaurant menu and table-reservation experience — deployed on Netlify.

## Design palette (deliberately inverts the portfolio at tomdeluca.dev)

| Token | Hex | Portfolio counterpart |
|---|---|---|
| `--c-bg` | `#1a1410` | `#0b1622` (navy → charcoal) |
| `--c-surface` | `#f2ead8` | `#132035` (dark surface → aged cream) |
| `--c-accent` | `#c8922a` | `#5ef0c8` (teal → candlelight amber) |
| `--c-text` | `#1c1610` | `#e8f1ff` (bright on dark → ink on light) |

Portfolio fonts: Inter + Plus Jakarta Sans → Carta fonts: Cormorant Garamond + DM Sans.

## Technology
- Vanilla HTML/CSS/JS — no framework, no build tool
- Phosphor Icons (thin weight) via CSS CDN
- Google Fonts: Cormorant Garamond + DM Sans
- Netlify static hosting

## Hard rules
- **No framework** — if you feel the urge to reach for one, declare why and wait for approval
- **`sourceType: 'script'`** in `eslint.config.js` — our browser JS files are classic scripts, not ESModules
- **`deno.lock`** must stay in `.gitignore` — Netlify CLI generates it at runtime
- **`declaration-no-important` false positive** — suppressed via `.vscode/settings.json` (`"css.validate": false`). Do not remove.
- **Alphabetical CSS properties** — enforced by `stylelint-order`. Always match within a ruleset.
- **Logical properties over physical** — use `padding-inline`, `margin-block`, `inset-block-start`, etc. where directional.

## JS conventions
- All JS files use IIFEs `(function () { ... }());` for encapsulation
- Globals from `data.js` annotated with `/* exported menuData, availabilityData */`
- Consumers annotate with `/* global menuData */` etc.
- No `console.*` statements (ESLint `no-console`)
- `===` everywhere (`eqeqeq`)

## Data flow
1. `data.js` fetches `data/menu.json` and `data/availability.json`
2. Dispatches `carta:ready` CustomEvent when both loads succeed, or `carta:error` on failure
3. `menu.js` and `reservation.js` listen for `carta:ready` before initializing

## Availability data format
`data/availability.json` is keyed by ISO date → `{ small, medium, large, private }` where:
- `small`: 1–2 guests
- `medium`: 3–4 guests
- `large`: 5–8 guests
- `private`: 9–12 guests

Dates not present in the JSON → no availability (restaurant closed, or not yet bookable).
Monday = always closed → no entry.

## Linting / pre-commit
```
npm run prepare   # re-init Husky if .husky/pre-commit is missing
npx lint-staged   # run manually without committing
```

Hooks run: html-validate → prettier → eslint → stylelint

## Local development
```
npx serve .
```
(Required for `fetch()` of JSON data files — won't work over `file://` protocol.)

## Deployment
Netlify auto-deploys `master` branch. Config in `netlify.toml`.
