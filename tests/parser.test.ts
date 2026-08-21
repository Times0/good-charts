import { describe, expect, test } from "bun:test";
import { parseChartConfig } from "../src/parser";

describe("parseChartConfig", () => {
  test("parses a donut chart and applies the legend default", () => {
    expect(parseChartConfig(`
type: donut
title: Expenses
data:
  - label: Housing
    value: 1200
  - label: Food
    value: 450
`)).toEqual({
      type: "donut",
      title: "Expenses",
      legend: true,
      data: [
        { label: "Housing", value: 1200 },
        { label: "Food", value: 450 },
      ],
    });
  });

  test("accepts numeric labels and stores them as strings", () => {
    expect(parseChartConfig(`
type: line
title: Temperature
data:
  - label: 2020
    value: -2
  - label: 2021
    value: 7.5
`)).toEqual({
      type: "line",
      title: "Temperature",
      data: [
        { label: "2020", value: -2, series: "Temperature" },
        { label: "2021", value: 7.5, series: "Temperature" },
      ],
    });
  });

  test("parses a line chart with negative values", () => {
    expect(parseChartConfig(`
type: line
title: Temperature
data:
  - label: Morning
    value: -2
  - label: Afternoon
    value: 7
`)).toEqual({
      type: "line",
      title: "Temperature",
      data: [
        { label: "Morning", value: -2, series: "Temperature" },
        { label: "Afternoon", value: 7, series: "Temperature" },
      ],
    });
  });

  test("parses a bar chart with one point", () => {
    expect(parseChartConfig(`
type: bar
title: Bugs by priority
data:
  - label: High
    value: 3
`)).toEqual({
      type: "bar",
      title: "Bugs by priority",
      data: [{ label: "High", value: 3 }],
    });
  });

  test("parses an area chart", () => {
    expect(parseChartConfig(`
type: area
data:
  - label: Monday
    value: 3
  - label: Tuesday
    value: 7
`)).toEqual({
      type: "area",
      data: [
        { label: "Monday", value: 3 },
        { label: "Tuesday", value: 7 },
      ],
    });
  });

  test("reports malformed YAML", () => {
    expect(() => parseChartConfig("data: [broken")).toThrow("Invalid YAML:");
  });

  test("requires a known chart type", () => {
    expect(() => parseChartConfig("type: pie\ndata: []"))
      .toThrow("type must be donut, line, bar, or area");
  });

  test("rejects an empty dataset", () => {
    expect(() => parseChartConfig("type: donut\ndata: []"))
      .toThrow("data must contain at least one point");
  });

  test.each<[string, string, string]>([
    ["a string", "nope", "finite number"],
    ["infinity", ".inf", "finite number"],
    ["negative donut", "-1", "cannot be negative"],
  ])("rejects %s values", (_name, value, message) => {
    expect(() => parseChartConfig(`type: donut\ndata:\n  - label: Bad\n    value: ${value}`))
      .toThrow(message);
  });

  test("rejects an all-zero donut dataset", () => {
    expect(() => parseChartConfig(`
type: donut
data:
  - label: One
    value: 0
  - label: Two
    value: 0
`)).toThrow("At least one slice must have a value greater than zero");
  });

  test("requires two line points", () => {
    expect(() => parseChartConfig(`
type: line
data:
  - label: Only
    value: 1
`)).toThrow("A line chart needs at least two points");
  });

  test("requires two area points", () => {
    expect(() => parseChartConfig(`
type: area
data:
  - label: Only
    value: 1
`)).toThrow("An area chart needs at least two points");
  });

  test("rejects options unsupported by the selected type", () => {
    expect(() => parseChartConfig(`
type: line
legend: true
data:
  - label: One
    value: 1
  - label: Two
    value: 2
`)).toThrow("Unknown option: legend");
  });
});
