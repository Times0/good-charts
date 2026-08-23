# GoodCharts

GoodCharts is an Obsidian plugin for creating powerful, composable charts from YAML. It is powered by [TanStack Charts](https://tanstack.com/charts/latest) under the hood.

GoodCharts exposes a small declarative version of TanStack's chart grammar instead of separate chart components. Layer marks, select scales, and pass ordinary static TanStack options directly from YAML. Charts include accessible labels and show tooltips by default.

This is an independent community plugin and is not affiliated with or endorsed by TanStack or Obsidian.

## Composable chart blocks

Create a fenced `goodcharts` block:

````markdown
```goodcharts
title: Activation rate
height: 340
ariaLabel: Weekly activation rate with expected range and goal

data:
  weeks:
    - week: Week 1
      activation: 64
      expectedLow: 58
      expectedHigh: 70
    - week: Week 2
      activation: 71
      expectedLow: 62
      expectedHigh: 76

marks:
  - areaY:
      data: weeks
      x: week
      y1: expectedLow
      y2: expectedHigh
      fill: "#bfdbfe"
      stroke: cornflowerblue
      fillOpacity: 0.22
      curve: monotoneX

  - ruleY:
      data: [70]
      stroke: slategray
      strokeWidth: 2
      strokeDasharray: 7 7

  - lineY:
      data: weeks
      x: week
      y: activation
      stroke: "#2563eb"
      strokeWidth: 4
      points: true
      curve: monotoneX

x:
  scale: point
  axis:
    label: Week
  grid: false

y:
  scale: linear
  nice: true
  axis:
    label: Activation rate
  grid: true
```
````

### Data

Use a root array when every mark shares one data set. Marks inherit it when they omit `data`:

```yaml
data:
  - category: A
    value: 12
  - category: B
    value: 18
marks:
  - barY:
      x: category
      y: value
x:
  scale: band
y:
  scale: linear
```

Use a mapping for multiple named data sets and select one inside each mark. A mark may also use an inline array, as `ruleY` does in the first example.

### Marks and scales

Marks:

- `lineY`
- `areaY`
- `barY`
- `dot`
- `ruleX`
- `ruleY`
- `text`

Scales:

- `linear`
- `band`
- `point`

The only curve helper is `curve: monotoneX`. Band scales include sensible spacing automatically, and tooltips are enabled by default; set `tooltip: false` to disable them.

Optional Obsidian presentation fields are `title`, `height`, and `ariaLabel`. Height defaults to 300 pixels, and the accessible label falls back to the title and then `Chart`.

Other static axis, grid, layout, and mark options are passed to TanStack Charts.

### Colors

Use TanStack's mark paint options to set one fixed color: `stroke` for lines and rules, `fill` for bars, areas, dots, and text. Areas and bars can use both. Provide a raw CSS color string, preferably a quoted hex value or a CSS color name:

```yaml
marks:
  - barY:
      x: category
      y: value
      fill: "#0f766e"
      stroke: darkslategray
```

To choose the colors for grouped series, use TanStack's chart-level `color.domain` and `color.range`. The domain fixes which series receives each color; omit it when data order is sufficient. A mark's `z` or `color` channel supplies the series values:

```yaml
color:
  domain: [Actual, Forecast]
  range: ["#2563eb", tomato]

marks:
  - lineY:
      x: week
      y: value
      z: series
```

Hex colors must be quoted because `#` starts a YAML comment. CSS variable expressions are not needed; use raw hex colors or CSS color names. If `color` is omitted, TanStack's default palette is used.

GoodCharts never evaluates JavaScript from notes. It does not support accessors, responsive builders, date/time scales, tick formatters, transforms, polar marks, or configured scale instances.

## Turn a table into a chart

Any Markdown table with a label column and at least one numeric column is shown as a chart in reading view, with a **Show table / Show chart** button to switch back. The first column becomes the X-axis, and every remaining numeric column becomes a line on one chart.

```markdown
| Year | Optimistic | Normal | Pessimistic |
|------|------------|--------|-------------|
| 2026 | 1.4        | 1.4    | 1.4         |
| 2046 | 1.7        | 1.9    | 2.2         |
| 2076 | 1.9        | 2.4    | 3.2         |
```

Multiple numeric columns become separate series using TanStack's automatic colors. For a custom table-chart palette, write an equivalent `goodcharts` block and set `color.range`. Thousands separators are accepted, and empty or non-numeric cells create gaps. Toggling the view never changes the note.

## Installation

Once the plugin is listed in the Obsidian Community directory:

1. Open **Settings → Community plugins** in Obsidian.
2. Select **Browse** and search for **GoodCharts**.
3. Select **Install**, then **Enable**.

For manual installation, download `main.js`, `manifest.json`, and `styles.css` from the latest GitHub release. Place them in `<vault>/.obsidian/plugins/goodcharts/`, then reload Obsidian and enable the plugin.

## Agent skill

This repository includes a [GoodCharts Agent Skill](./skills/goodcharts/SKILL.md) that teaches compatible coding agents how to create GoodCharts blocks and chart-ready Markdown tables.

Install it from this public GitHub repository and choose the target agent and installation scope when prompted:

```bash
npx skills add Times0/good-charts
```

To install it globally for Codex without prompts:

```bash
npx skills add Times0/good-charts --skill goodcharts --agent codex --global --yes
```

## Development

This project uses [Bun](https://bun.sh/).

```bash
bun install
bun run verify
```

`bun run build` creates `main.js` in the repository root. To deploy a development build to a vault, pass the vault directory or set `OBSIDIAN_VAULT`:

```bash
bun run deploy --vault=/path/to/vault
```

## Acknowledgements

Chart rendering is powered by [TanStack Charts](https://tanstack.com/charts/latest), Preact, and D3 Shape.

## License

GoodCharts is available under the [MIT License](./LICENSE).

## Support

Please use the repository's [issue tracker](https://github.com/Times0/good-charts/issues) to report bugs or request features.
