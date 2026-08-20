# GoodCharts

Render simple, theme-aware charts from YAML code blocks in Obsidian using [TanStack Charts](https://github.com/TanStack/charts).

GoodCharts supports donut, line, bar, and area charts. Charts adapt to your Obsidian theme, display interactive tooltips, and include accessible labels.

This is an independent community plugin and is not affiliated with or endorsed by TanStack or Obsidian.

## Usage

Create a fenced `tanstack-chart` code block in any note:

````markdown
```tanstack-chart
type: donut
title: Monthly expenses
legend: true
data:
  - label: Housing
    value: 1200
  - label: Food
    value: 450
  - label: Transport
    value: 180
```
````

Change `type` to `line`, `bar`, or `area` for another chart style:

````markdown
```tanstack-chart
type: line
title: Weekly focus time
data:
  - label: Monday
    value: 2.5
  - label: Tuesday
    value: 4
  - label: Wednesday
    value: 3.5
```
````

Every data point requires a non-empty `label` and a finite numeric `value`. Donut values cannot be negative, and line and area charts require at least two data points. The `legend` option is available for donut charts and defaults to `true`.

## Installation

Once the plugin is listed in the Obsidian Community directory:

1. Open **Settings → Community plugins** in Obsidian.
2. Select **Browse** and search for **GoodCharts**.
3. Select **Install**, then **Enable**.

For manual installation, download `main.js`, `manifest.json`, and `styles.css` from the latest GitHub release. Place them in `<vault>/.obsidian/plugins/goodcharts/`, then reload Obsidian and enable the plugin.

## Development

This project uses [Bun](https://bun.sh/).

```bash
bun install
bun run verify
```

`bun run build` creates `main.js` in the repository root. To deploy a development build to a vault, pass the vault directory or set the `OBSIDIAN_VAULT` environment variable:

```bash
bun run deploy --vault=/path/to/vault
```

## Acknowledgements

Chart rendering is powered by [TanStack Charts](https://github.com/TanStack/charts), Preact, and D3.

## License

GoodCharts is available under the [MIT License](./LICENSE).

## Support

Please use the repository's [issue tracker](https://github.com/Times0/obsidian-tanstack-charts/issues) to report bugs or request features.
