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

## Turn a table into a chart

Any markdown table with a label column and at least one numeric column is shown as a chart in reading view, with a **Show table / Show chart** button to switch back. The first column becomes the X-axis, and every remaining numeric column becomes a line on a single chart.

```markdown
| Year | Optimistic | Normal | Pessimistic |
|------|------------|--------|-------------|
| 2026 | 1.4        | 1.4    | 1.4         |
| 2046 | 1.7        | 1.9    | 2.2         |
| 2076 | 1.9        | 2.4    | 3.2         |
| 2100 | 1.9        | 2.7    | 4.1         |
| 2126 | 1.8        | 2.8    | 4.7         |
```

The table above renders as one line chart with three lines and a legend. A table with a single numeric column renders as one line without a legend.

The button toggles the current reading view between the table and the chart without changing the note. Numeric cells may include thousands separators (for example `1,200`); empty or non-numeric cells create a gap in that line.

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
