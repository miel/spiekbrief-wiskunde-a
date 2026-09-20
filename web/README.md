# Spiekbrief Wiskunde A — web

The web version of the iPhone app in this repo: same content, same structure, in a browser.
Installable, works offline, no accounts, no tracking, no backend.

```sh
cd web
npm install
npm run dev          # http://localhost:5173
npm run build        # static site in web/dist
npm run preview      # serve the build, service worker included
```

Tests:

```sh
npm run test         # content, LaTeX lint and unit tests (vitest)
npm run test:e2e     # browser tests against the dev server (playwright)
npm run test:offline # service worker and manifest, against the build
npm run test:all     # all three
```

Playwright needs its browser once: `npx playwright install chromium`.

## Content is not copied

`vite.config.ts` aliases `@content` to `../Spiekbrief/Resources/Content`, so the web app
imports the *same* generated JSON the iOS app bundles. There is no sync step and no second
copy. Content is still authored in `tools/content` and built with
`python3 tools/content/build.py`; both apps pick the result up from there.

## How this differs from the iOS app

| | iOS | web |
| --- | --- | --- |
| Typesetting | SwiftMath → `UIImage`, cached | KaTeX, rendered synchronously during render |
| Graphs | Swift Charts + closures | inline SVG (`src/graphs/Plot.tsx`) + the same functions |
| Storage | SwiftData | `localStorage` via zustand |
| Layout | portrait-locked iPhone | bottom tab bar, sidebar from 900 px up |
| Icons | SF Symbols | Lucide, mapped in `src/app/theme.tsx` |

The README at the repo root explains why iOS rejected KaTeX: a `WKWebView` per formula costs a
WebContent process and lays out asynchronously. In a browser neither applies — KaTeX is
synchronous, which is exactly what the list rows needed.

`\glog` and `\pct` are KaTeX macros (`src/math/katex.ts`); the decimal-comma rule is still a
string pass, as in `LatexPreprocessor.swift`.

## Watch out for

**Render math during render, never in an effect.** Commit `d97fcba` ("Formules bleven leeg na
het openen van een onderwerp") was a cached render that was not a reactive dependency, so rows
kept their placeholder forever. `tests/e2e/app.spec.ts` guards the web equivalent.

**Every content string can mix Markdown and `$…$`.** Render content text with `RichText`, never
as a bare string, or captions will show raw `$` and `**`.

**The graph ids are written out three times** — `GraphLibrary.allIDs` (Swift), `GRAPH_IDS`
(`tools/content/build.py`) and `allIds` (`src/graphs/library.ts`). `tests/graph-ids.test.ts`
fails if they drift apart.
