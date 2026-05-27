# Carta

Contemporary fine dining — restaurant menu and table reservation system.

## Overview

Carta is a polished single-page experience for a fictional upscale London restaurant. It features:

- **Full menu** rendered from a JSON data file, with live dietary filters (GF, V, VG, DF, NF) and sticky section navigation
- **5-step reservation flow** — party size, date, time slot, contact details, confirmation — with accessible validation and state preserved on back-navigation
- **Mock availability data** driving the time-slot step, including realistic "fully booked" states
- **Print-friendly confirmation** screen
- Warm amber-on-charcoal palette; Cormorant Garamond headings, DM Sans body copy

## Tech

Vanilla HTML/CSS/JS · No framework · No build step · Netlify hosting

## Local development

```bash
npm install         # install dev tooling (Husky, ESLint, Stylelint, Prettier, html-validate)
npx serve .         # serve from project root — required for fetch() of data/*.json
```

Open `http://localhost:3000` in your browser.

## Pre-commit checks

```bash
npx lint-staged     # run all checks manually
```

Runs html-validate → prettier → ESLint → Stylelint on staged files.

## Project structure

```
carta/
├── index.html
├── css/            main.css · menu.css · reservation.css · print.css
├── js/             data.js · menu.js · reservation.js · main.js
├── data/           menu.json · availability.json
└── assets/         favicon.svg · noise.svg (linen texture)
```

## Design decisions

The palette inverts the tomdeluca.dev portfolio intentionally — cool teal-on-navy becomes warm amber-on-charcoal to signal analog luxury over tech portfolio.

## Deployment

Connects to Netlify via GitHub. Security headers and long-lived cache headers are configured in `netlify.toml`.
