import { describe, expect, test } from "bun:test";
import { compileChartInput } from "../src/chart";
import { tableMatrixToChartInput } from "../src/tableToCharts";

describe("tableMatrixToChartInput", () => {
  test("turns numeric columns into one multi-series line chart input", () => {
    const input = tableMatrixToChartInput({
      headers: ["Year", "Optimistic", "Normal", "Pessimistic"],
      rows: [
        ["2026", "1.4", "1.4", "1.4"],
        ["2046", "1.7", "1.9", "2.2"],
        ["2076", "1.9", "2.4", "3.2"],
      ],
    });

    expect(input).toMatchObject({
      ariaLabel: "Line chart of Optimistic, Normal, Pessimistic by Year",
      marks: [
        {
          lineY: {
            x: "label",
            y: "value",
            z: "series",
            key: "id",
            points: true,
          },
        },
      ],
      x: {
        scale: "point",
        axis: { label: "Year" },
      },
      y: {
        scale: "linear",
        nice: true,
        grid: true,
      },
      clip: true,
    });

    expect(input?.data).toEqual([
      { id: "1:0", label: "2026", value: 1.4, series: "Optimistic" },
      { id: "1:1", label: "2046", value: 1.7, series: "Optimistic" },
      { id: "1:2", label: "2076", value: 1.9, series: "Optimistic" },
      { id: "2:0", label: "2026", value: 1.4, series: "Normal" },
      { id: "2:1", label: "2046", value: 1.9, series: "Normal" },
      { id: "2:2", label: "2076", value: 2.4, series: "Normal" },
      { id: "3:0", label: "2026", value: 1.4, series: "Pessimistic" },
      { id: "3:1", label: "2046", value: 2.2, series: "Pessimistic" },
      { id: "3:2", label: "2076", value: 3.2, series: "Pessimistic" },
    ]);

    const chart = compileChartInput(input);
    expect(chart.ariaLabel).toBe("Line chart of Optimistic, Normal, Pessimistic by Year");
    expect(chart.height).toBe(300);
  });

  test("strips thousands separators", () => {
    const input = tableMatrixToChartInput({
      headers: ["Year", "Population"],
      rows: [
        ["2026", "1,200"],
        ["2046", "1,700"],
      ],
    });

    expect(input?.data).toEqual([
      { id: "1:0", label: "2026", value: 1200, series: "Population" },
      { id: "1:1", label: "2046", value: 1700, series: "Population" },
    ]);
  });

  test("skips columns without two numeric cells", () => {
    const input = tableMatrixToChartInput({
      headers: ["Year", "Note", "Value"],
      rows: [
        ["2026", "start", "1.4"],
        ["2046", "middle", "1.7"],
      ],
    });

    expect(input?.data).toEqual([
      { id: "2:0", label: "2026", value: 1.4, series: "Value" },
      { id: "2:1", label: "2046", value: 1.7, series: "Value" },
    ]);
  });

  test("keeps missing values as gaps", () => {
    const input = tableMatrixToChartInput({
      headers: ["Year", "Value"],
      rows: [
        ["2026", "1.4"],
        ["2046", ""],
        ["2076", "1.9"],
      ],
    });

    expect(input?.data).toEqual([
      { id: "1:0", label: "2026", value: 1.4, series: "Value" },
      { id: "1:1", label: "2046", value: null, series: "Value" },
      { id: "1:2", label: "2076", value: 1.9, series: "Value" },
    ]);
  });

  test.each([
    {
      headers: ["Name", "Role"],
      rows: [["Ada", "Engineer"], ["Grace", "Admiral"]],
    },
    {
      headers: ["Year", "Value"],
      rows: [["2026", "1.4"]],
    },
    {
      headers: ["Year"],
      rows: [["2026"], ["2046"]],
    },
  ])("returns null for unsuitable tables", (matrix) => {
    expect(tableMatrixToChartInput(matrix)).toBeNull();
  });
});
