# Spiekbrief Wiskunde A (vwo 6)

A Dutch cheat sheet for the final exam **wiskunde A vwo**, as a native SwiftUI iPhone app and
as an installable offline web app (`web/`). Both read the same generated content.

The iPhone app: a cheat sheet for the final exam **wiskunde A vwo**
(centraal examen 2027, domains B, C and D) plus statistics and probability (domain E, SE).
Designed for an iPhone 12 mini (375 × 812 pt), iOS 18+, offline, no accounts, no tracking.

Sources for all content: the [examenprogramma wiskunde A vwo](https://www.examenblad.nl/system/files/2014/examenprogramma_wiskunde_a_vwo.pdf)
and the [syllabus centraal examen 2027, versie 2](https://www.examenblad.nl/system/files/exam-document/2025-07/syllabus-wiskunde-a_vwo-2027_versie-2.pdf)
(CvTE), including bijlage 2 (examenwerkwoorden), bijlage 4 (algebraïsche vaardigheden) and
bijlage 5 (the formula sheet printed in the exam).

## Building

Needs macOS with Xcode 16 or newer, plus [XcodeGen](https://github.com/yonaskolb/XcodeGen).

```sh
brew install xcodegen
xcodegen generate            # writes Spiekbrief.xcodeproj and Spiekbrief/Info.plist
open Spiekbrief.xcodeproj    # Xcode resolves the SwiftMath package on first build
```

Tests:

```sh
xcodebuild test -scheme Spiekbrief -destination 'platform=iOS Simulator,name=iPhone 12 mini'
```

## Web version

`web/` is a Vite + React + TypeScript port with the same features: browse, search, favorites,
flashcards and all 15 interactive graphs. It imports the generated JSON straight from
`Spiekbrief/Resources/Content`, so there is no second copy to keep in sync.

```sh
cd web
npm install
npm run dev
npm run test:all     # vitest + playwright, including the offline check
```

See [web/README.md](web/README.md) for what differs from the iOS app. In short: KaTeX instead
of SwiftMath (in a browser the objection below does not apply), inline SVG instead of Swift
Charts, `localStorage` instead of SwiftData.

## Content

Content is authored in Python (readable LaTeX in raw strings) and generated into the JSON that
the app bundles:

```sh
python3 tools/content/build.py    # validates, then writes Spiekbrief/Resources/Content/*.json
```

The build script checks unique ids, known badges, balanced braces and `$…$`, and that every
referenced graph exists in `GraphLibrary`. The Swift tests check the same files again and
additionally typeset **every** formula, so a LaTeX typo fails the test run. The web tests
repeat both checks through KaTeX, and additionally assert that the hand-maintained graph-id
lists in `build.py`, `GraphLibrary.swift` and `web/src/graphs/library.ts` still agree.

Each formula carries a badge:

| Badge | Meaning |
| --- | --- |
| Op formulelijst | Printed in the exam (syllabus bijlage 5) — no need to memorize |
| Paraat kennen | Not on the sheet: learn it. These become the flashcards |
| SE | Schoolexamen only (domain E) |
| Handig, niet vereist | Useful, not required by the syllabus |

## How formulas are rendered

`FormulaRenderer` typesets LaTeX with [SwiftMath](https://github.com/mgriebling/SwiftMath)
(native CoreText, Latin Modern Math) into `UIImage`s, cached in an `NSCache`. Cache hits are
served synchronously so rows do not flash a placeholder; misses render on a background task.
Web views (KaTeX/MathJax) were rejected: a WebContent process per formula is too expensive on
a 12 mini and its async layout makes list rows jump.

`LatexPreprocessor` adds the Dutch conventions: `\glog{g}(a)` renders as ᵍlog(a), a comma
between two digits becomes a decimal comma with the spacing corrected, and `\pct` is a percent
sign. Formulas follow Dynamic Type up to 34 pt; wider ones scroll sideways and open zoomable
full screen. VoiceOver reads the hand-written `spoken` text of each formula.

## Layout of the repo

```
project.yml                     XcodeGen project (iOS 18, Swift 6, SwiftMath)
Spiekbrief/
  App/                          entry point, tabs, orientation lock
  Content/                      model, store, search index
  Math/                         preprocessor, renderer, formula views, inline math, speech
  Graphs/                       Swift Charts graphs and their definitions
  Features/                     browse, topic + blocks, search, favorites, flashcards, about
  Persistence/                  SwiftData: favorites and flashcard progress
  Resources/Content/*.json      generated content — edit tools/content, not these
SpiekbriefTests/                content, formula lint, unit tests (Swift Testing)
tools/content/                  content sources in Python
web/                            the web app; reads the same Resources/Content JSON
```

## Calculator tips

Tips are written for the **NumWorks** in the Dutch exam mode (NL examenstand), where Python and
Elementen are unavailable, exact results are off and units cannot be used. App and menu names
follow the Dutch firmware: Rekenen, Functies, Vergelijking, Rijen, Statistiek, Kansrekenen,
Regressie.
