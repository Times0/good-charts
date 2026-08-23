---
name: goodcharts
description: Create or edit GoodCharts YAML chart blocks and chart-ready Markdown tables in Obsidian. Use when authoring charts for the GoodCharts plugin, not for generic TanStack Charts application code.
---

# GoodCharts

Author powerful, composable GoodCharts charts while preserving unrelated note content.

## Chart block

Use a fenced `goodcharts` block with data, at least one mark, and its positional scales:

```yaml
title: Weekly activation
data:
  - week: Week 1
    value: 64
  - week: Week 2
    value: 71

marks:
  - lineY:
      x: week
      y: value
      stroke: "#2563eb"
      points: true
      curve: monotoneX

x:
  scale: point
y:
  scale: linear
  grid: true
```

Prefer `goodcharts` for new blocks. The legacy `tanstack-chart` language remains supported for existing notes.

Marks: `lineY`, `areaY`, `barY`, `dot`, `ruleX`, `ruleY`, `text`.

Scales: `linear`, `band`, `point`. Use `band` for a bar chart; it adds good spacing automatically.

Each `marks` item has exactly one mark name. Put its channels and static TanStack options directly inside it—never add an `options` wrapper.

## Keep blocks small

- Use a root array when marks share data.
- Use a root mapping of named arrays only when marks need different data; select one with `data: name`.
- Inline data is useful for annotations such as `ruleY: { data: [70] }`.
- Channel names such as `x: week` and `y: value` must match data fields.
- Use `z` for multi-series grouping. Let TanStack choose colors unless the user asks for custom colors.
- Optional root fields are `title`, `height`, and `ariaLabel`. Height defaults to 300.
- Tooltips are on by default; use `tooltip: false` when they add no value.
- `curve: monotoneX` is the only curve helper.

## Colors

Keep color configuration in TanStack's native shape:

- Set a fixed mark color with `stroke` for lines and rules, or `fill` for bars, areas, dots, and text. Areas and bars may use both.
- For grouped series, set root `color.range` and keep `z` or `color` on the mark as the grouping channel.
- Add `color.domain` when each named series must receive a specific range color; domain and range positions correspond.
- Prefer quoted raw hex values such as `"#2563eb"` or CSS names such as `tomato`. Do not emit CSS `var(...)` expressions.
- Keep hex values quoted because an unquoted `#` starts a YAML comment.

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

Do not invent palette names or wrappers. GoodCharts supports only `domain` and `range` inside root `color`; it does not expose configured color scales or legends.

GoodCharts never evaluates JavaScript. Do not emit functions, accessors, formatters, responsive builders, transforms, polar marks, or configured scale instances.

## Markdown tables

A Markdown table with a label column and at least one numeric column becomes a line chart in reading view. The first column is X and each numeric column is a series. Prefer a table when it is the clearest source; the chart/table toggle does not change the note.

## Verification

When Obsidian is already running:

1. Reload `goodcharts`.
2. Check developer errors and error-level console output.
3. Inspect the result in reading view, including its accessible label and table toggle when applicable.

Do not create or persistently modify unrelated vault notes solely for verification.
