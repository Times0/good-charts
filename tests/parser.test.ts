import { describe, expect, test } from "bun:test";
import { parseChartConfig } from "../src/parser";

describe("parseChartConfig", () => {
  test("parses a pie chart and applies the legend default", () => {
    expect(parseChartConfig(`
type: pie
title: Expenses
data:
  - label: Housing
    value: 1200
  - label: Food
    value: 450
`)).toEqual({
      type: "pie",
      title: "Expenses",
      legend: true,
      data: [
        { label: "Housing", value: 1200 },
        { label: "Food", value: 450 },
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
        { label: "Morning", value: -2 },
        { label: "Afternoon", value: 7 },
      ],
    });
  });

  test("reports malformed YAML", () => {
    expect(() => parseChartConfig("data: [broken")).toThrow("Invalid YAML:");
  });

  test("requires a known chart type", () => {
    expect(() => parseChartConfig("type: bar\ndata: []"))
      .toThrow("type must be pie or line");
  });

  test("rejects an empty dataset", () => {
    expect(() => parseChartConfig("type: pie\ndata: []"))
      .toThrow("data must contain at least one point");
  });

  test.each<[string, string, string]>([
    ["a string", "nope", "finite number"],
    ["infinity", ".inf", "finite number"],
    ["negative pie", "-1", "cannot be negative"],
  ])("rejects %s values", (_name, value, message) => {
    expect(() => parseChartConfig(`type: pie\ndata:\n  - label: Bad\n    value: ${value}`))
      .toThrow(message);
  });

  test("rejects an all-zero pie dataset", () => {
    expect(() => parseChartConfig(`
type: pie
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
