# Svenska Mått

A Chrome extension that reads a recipe's ingredients from the current page and
re-presents them for a Swedish cook: imperial quantities converted to metric,
Swedish-style number formatting (decimal comma, `dl`/`msk`/`tsk`), and ingredient
names translated into Swedish.

It reads the page in this order of preference:

1. **Structured data** — schema.org `Recipe` in JSON-LD.
2. **Microdata** — `[itemprop="recipeIngredient"]`.
3. **Your text selection** — highlight an ingredient list and open the popup.

Section headers in a selected list (e.g. `For the frosting:` or `Pastry Crust`)
are detected and kept verbatim, so the converted ingredients stay grouped under
their sections.

Everything runs locally. There is no API key, no network call, and the Swedish
ingredient names come from a built-in dictionary (`src/translation/dictionary.ts`).

## Develop

```bash
bun install
bun dev          # Vite dev server (for iterating on the popup UI)
bun test         # unit tests for the conversion pipeline
bun run typecheck
bun run build    # produces a loadable extension in dist/
bun format       # format with oxfmt (config in .oxfmtrc.json)
bun lint         # lint with oxlint (config in .oxlintrc.json)
```

## Load the extension in Chrome

```bash
bun run build
```

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `dist/` folder.
4. Open a recipe page, click the **Svenska Mått** icon, and the converted list
   appears in the popup. For pages without structured data, select the ingredient
   list first, then open the popup.

Re-run `bun run build` and press the refresh icon on the extension card after
changing the code.

## Architecture

The conversion logic is pure and DOM-free, so it is fully unit-tested without a
browser. The only browser-specific piece is a small function injected into the
page via `chrome.scripting.executeScript`.

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
| Orchestration | `src/pipeline.ts`           |
| Popup UI      | `src/App.tsx`, `src/popup/` |
