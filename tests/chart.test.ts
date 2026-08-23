import { describe, expect, test } from "bun:test";
import {
  createChartScene,
  type StaticChartDefinition,
} from "@tanstack/charts";
import { type BandScale } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import {
  compileChartSource,
  type CompiledChart,
} from "../src/chart";

function staticDefinition(chart: CompiledChart): StaticChartDefinition {
  if ("chart" in chart.definition) {
    throw new Error("Expected a static chart definition.");
  }
  return chart.definition;
}

describe("compileChartSource", () => {
  test("compiles shared data, presentation fields, options, and a deterministic scene", () => {
    const chart = compileChartSource(`
title: Weekly values
height: 360
ariaLabel: Weekly values line chart
data:
  - id: a
    week: One
    value: 2
  - id: b
    week: Two
    value: 5
marks:
  - lineY:
      x: week
      y: value
      key: id
      points: true
x:
  scale: point
  axis:
    label: Week
  grid: false
y:
  scale: linear
  nice: true
  grid: true
clip: true
margin: 12
`);

    expect(chart).toMatchObject({
      title: "Weekly values",
      height: 360,
      ariaLabel: "Weekly values line chart",
    });

    const definition = staticDefinition(chart);
    expect(definition.marks).toHaveLength(1);
    expect(definition.x?.scale).toBe(scalePoint);
    expect(definition.y?.scale).toBe(scaleLinear);
    expect(definition).toMatchObject({
      clip: true,
      margin: 12,
      x: {
        axis: { label: "Week" },
        grid: false,
      },
      y: {
        nice: true,
        grid: true,
      },
    });
    expect(definition.tooltip).not.toBe(false);

    const scene = createChartScene(definition, { width: 640, height: 360 });
    expect(scene).toMatchObject({ width: 640, height: 360 });
    expect(scene.nodes.length).toBeGreaterThan(0);
  });

  test("composes every v1 mark from named and inline data", () => {
    const chart = compileChartSource(`
data:
  rows:
    - id: a
      category: A
      value: 2
      low: 1
      high: 3
      label: Alpha
    - id: b
      category: B
      value: 4
      low: 2
      high: 5
      label: Beta
marks:
  - areaY:
      data: rows
      x: category
      y1: low
      y2: high
      curve: monotoneX
  - barY:
      data: rows
      x: category
      y: value
  - dot:
      data: rows
      x: category
      y: value
  - lineY:
      data: rows
      x: category
      y: value
      curve: monotoneX
  - ruleX:
      data: [A]
  - ruleY:
      data: [3]
  - text:
      data: rows
      x: category
      y: value
      text: label
x:
  scale: point
y:
  scale: linear
`);

    expect(staticDefinition(chart).marks).toHaveLength(7);
  });

  test.each([
    ["linear", scaleLinear],
    ["point", scalePoint],
  ])("resolves the %s scale", (name, scale) => {
    const chart = compileChartSource(`
data:
  - x: 1
    y: 2
marks:
  - dot:
      x: x
      y: y
x:
  scale: ${name}
y:
  scale: linear
`);

    expect(staticDefinition(chart).x?.scale).toBe(scale);
  });

  test("pads band scales by default so bars do not touch", () => {
    const chart = compileChartSource(`
data:
  - category: Housing
    value: 1200
  - category: Food
    value: 450
  - category: Travel
    value: 300
marks:
  - barY:
      x: category
      y: value
x:
  scale: band
y:
  scale: linear
`);

    const scale = (staticDefinition(chart).x?.scale as () => BandScale)();
    expect(scale.padding()).toBe(0.2);
  });

  test("allows tooltip opt-out", () => {
    const chart = compileChartSource(`
data:
  - x: A
    y: 2
  - x: B
    y: 4
marks:
  - lineY:
      x: x
      y: y
x:
  scale: point
y:
  scale: linear
tooltip: false
`);

    const definition = staticDefinition(chart);
    expect(definition.tooltip).toBe(false);
  });

  test("uses presentation defaults", () => {
    const chart = compileChartSource(`
data: [1]
marks:
  - ruleY: {}
y:
  scale: linear
`);

    expect(chart).toMatchObject({
      height: 300,
      ariaLabel: "Chart",
    });
  });

  test("reports malformed YAML", () => {
    expect(() => compileChartSource("marks: [broken"))
      .toThrow("Invalid YAML:");
  });

  test.each([
    ["responsive builders", "chart: {}\nmarks: [{}]", "Responsive chart builders are not supported"],
    ["unknown marks", "marks:\n  - arc: {}", "Unknown mark \"arc\""],
    ["unknown scales", "data: [1]\nmarks:\n  - ruleY: {}\ny:\n  scale: utc", "Unknown scale \"utc\""],
    ["unknown curves", "data: [{x: A, y: 1}]\nmarks:\n  - lineY: {x: x, y: y, curve: step}", "Unknown curve \"step\""],
    ["unknown data", "data: {rows: []}\nmarks:\n  - dot: {data: missing}", "unknown data set \"missing\""],
    ["malformed marks", "data: []\nmarks:\n  - lineY: {}\n    dot: {}", "exactly one named mark"],
  ])("reports %s", (_name, source, message) => {
    expect(() => compileChartSource(source)).toThrow(message);
  });
});
