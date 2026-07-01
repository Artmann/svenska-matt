# Contributing to Svenska Mått

Thanks for helping out! This is a small, dependency-light Chrome (Manifest V3)
extension built with Vite, React, TypeScript and Tailwind CSS, using **Bun** for
scripts and tests.

## Setup

```bash
bun install
```

## Commands

```bash
bun dev          # Vite dev server (for iterating on the popup UI)
bun test         # unit tests for the conversion pipeline
bun run typecheck # tsc --noEmit
bun run build    # produces a loadable extension in dist/
bun run pack     # build + zip dist/ into svenska-matt-<version>.zip
bun format       # format with oxfmt (config in .oxfmtrc.json)
bun lint         # lint with oxlint (config in .oxlintrc.json)
```

Please run `bun test`, `bun run typecheck`, `bun lint` and `bun format` before
opening a pull request.

## Load the unpacked extension

```bash
bun run build
```

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `dist/` folder.
4. Open a recipe page and click the **Svenska Mått** icon (or right-click →
   **Svenska Mått**). For pages without structured data, select the ingredient
   list first, then open the popup.

Re-run `bun run build` and press the refresh icon on the extension card after
changing the code.

## Architecture

The conversion logic is **pure and DOM-free**, so it is fully unit-tested
without a browser. The only browser-specific pieces are a small function
injected into the page via `chrome.scripting.executeScript` and a background
service worker for the context menu.

```
popup → executeScript → { jsonLd, microdata, selection }
      → extraction → parsing → conversion → translation → formatting → list
```

| Concern       | Module                      |
| ------------- | --------------------------- |
| Extraction    | `src/extraction/`           |
| Parsing       | `src/parsing/`              |
| Conversion    | `src/conversion/`           |
| Translation   | `src/translation/`          |
| Formatting    | `src/formatting/swedish.ts` |
| Sections      | `src/section.ts`            |
| Orchestration | `src/pipeline.ts`           |
| Popup UI      | `src/App.tsx`, `src/popup/` |
| Background    | `src/background.ts`         |

## Adding ingredient translations

Most contributions are new words. Add an entry to the map in
`src/translation/dictionary.ts` (keys are lowercase, singular, hyphen-free) and,
where useful, a case to `src/real-world.test.ts`.

## Code style

Enforced by oxfmt/oxlint and a few project conventions: single quotes, no
semicolons, no `CONSTANT_CASE`, full-word names, nullish coalescing (`??`),
mobile-first Tailwind, and tests co-located next to the implementation.
