# Svenska Mått

Read any recipe in Swedish measurements. **Svenska Mått** is a Chrome extension
that takes the ingredient list on a recipe page and rewrites it the way a Swedish
cook expects:

- **Imperial → metric** — cups become `dl`, tablespoons `msk`, teaspoons `tsk`,
  ounces and pounds grams, °F becomes °C.
- **Swedish formatting** — decimal comma and fraction glyphs (`2½ dl`, `¾ tsk`).
- **Swedish ingredient names** — `butter` → `smör`, `all-purpose flour` →
  `vetemjöl`, and a few hundred more.
- **Sections preserved** — headers like `For the frosting:` or `Pastry Crust`
  stay in place, with their ingredients grouped underneath.

Everything runs on your machine. There is no account, no API key, and no network
request — the translations come from a built-in dictionary.

## Install

Until it is on the Chrome Web Store you can load it yourself:

1. Download this project and run `bun install` then `bun run build` (see
   [CONTRIBUTING.md](CONTRIBUTING.md) for the toolchain).
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `dist/` folder.

## Use

Open a recipe page and either:

- **Click the Svenska Mått icon** in the toolbar, or
- **Right-click the page** and choose **Svenska Mått**.

The converted ingredient list appears in the popup. Use **Kopiera** to copy it.

If a page hides its recipe from the extension, **select the ingredient list**
with your mouse first, then open the popup — the selection is used as a fallback,
and any section headings in it are kept.

## Contributing

Bug reports, dictionary additions, and pull requests are welcome. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the development setup and architecture.

## License

[MIT](LICENSE) © Christoffer Artmann
