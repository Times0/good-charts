import { describe, expect, test } from "bun:test";
import {
  createChartScene,
  type SceneNode,
} from "@tanstack/charts";
import { type BandScale } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { compileChartSource } from "../src/chart";

function flattenNodes(nodes: readonly SceneNode[]): SceneNode[] {
  return nodes.flatMap((node) => (
    node.kind === "group" ? [node, ...flattenNodes(node.children)] : [node]
  ));
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

    const definition = chart.definition;
    expect(definition.marks).toHaveLength(1);
    expect(definition.scales?.x?.scale).toBe(scalePoint);
    expect(definition.scales?.y?.scale).toBe(scaleLinear);
    expect(definition).toMatchObject({
      clip: true,
      margin: 12,
      scales: {
        x: {
          axis: { label: "Week" },
          grid: false,
        },
        y: {
          nice: true,
          grid: true,
        },
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

    const definition = chart.definition;
    expect(definition.marks).toHaveLength(7);
    const scene = createChartScene(definition, { width: 640, height: 300 });
    expect(scene.points.length).toBeGreaterThan(0);
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

    expect(chart.definition.scales?.x?.scale).toBe(scale);
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

    const scale = (chart.definition.scales?.x?.scale as () => BandScale)();
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

    const definition = chart.definition;
    expect(definition.tooltip).toBe(false);
  });

  test("uses TanStack color domain and range for grouped series", () => {
    const chart = compileChartSource(`
data:
  - {x: A, y: 1, series: Actual}
  - {x: B, y: 2, series: Actual}
  - {x: A, y: 2, series: Forecast}
  - {x: B, y: 3, series: Forecast}
marks:
  - lineY:
      x: x
      y: y
      z: series
x: {scale: point}
y: {scale: linear}
color:
  domain: [Forecast, Actual]
  range: ["#f97316", steelblue]
`);

    const scene = createChartScene(chart.definition, { width: 640, height: 300 });
    expect(scene.colors).toMatchObject({
      domain: ["Forecast", "Actual"],
      range: ["#f97316", "steelblue"],
    });
    expect(scene.points.map((point) => point.color)).toEqual([
      "steelblue",
      "steelblue",
      "#f97316",
      "#f97316",
    ]);
  });

  test("passes fixed fill and stroke colors directly to TanStack marks", () => {
    const chart = compileChartSource(`
data:
  - {x: A, y: 2, low: 1, high: 3, label: Alpha}
  - {x: B, y: 4, low: 2, high: 5, label: Beta}
marks:
  - areaY: {x: x, y1: low, y2: high, fill: "#bfdbfe", stroke: royalblue}
  - barY: {x: x, y: y, fill: tomato, stroke: maroon}
  - dot: {x: x, y: y, fill: gold, stroke: "#713f12"}
  - lineY: {x: x, y: y, stroke: "#0f766e"}
  - ruleY: {data: [3], stroke: rebeccapurple}
  - text: {x: x, y: y, text: label, fill: navy}
x: {scale: band}
y: {scale: linear}
`);

    const nodes = flattenNodes(
      createChartScene(chart.definition, { width: 640, height: 300 }).nodes,
    );
    expect(nodes.some((node) => (
      node.kind === "area"
      && node.style?.fill === "#bfdbfe"
      && node.style.stroke === "royalblue"
    ))).toBe(true);
    expect(nodes.some((node) => (
      node.kind === "rect"
      && node.style?.fill === "tomato"
      && node.style.stroke === "maroon"
    ))).toBe(true);
    expect(nodes.some((node) => (
      node.kind === "dot"
      && node.style?.fill === "gold"
      && node.style.stroke === "#713f12"
    ))).toBe(true);
    expect(nodes.some((node) => (
      node.kind === "polyline" && node.style?.stroke === "#0f766e"
    ))).toBe(true);
    expect(nodes.some((node) => (
      node.kind === "rule" && node.style?.stroke === "rebeccapurple"
    ))).toBe(true);
    expect(nodes.some((node) => (
      node.kind === "label" && node.style?.fill === "navy"
    ))).toBe(true);
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
    ["malformed color options", "data: [1]\nmarks: [{ruleY: {}}]\ncolor: red", "color must be an options mapping"],
    ["empty color range", "data: [1]\nmarks: [{ruleY: {}}]\ncolor: {range: []}", "color.range must be a non-empty array"],
    ["non-string mark paint", "data: [1]\nmarks: [{ruleY: {stroke: 42}}]", "ruleY.stroke must be a non-empty CSS color string"],
  ])("reports %s", (_name, source, message) => {
    expect(() => compileChartSource(source)).toThrow(message);
  });
});
