import { describe, expect, test } from "bun:test";
import { tableMatrixToLineChart } from "../src/tableToCharts";

describe("tableMatrixToLineChart", () => {
  test("turns a multi-column table into one chart with a series per numeric column", () => {
    const config = tableMatrixToLineChart({
      headers: ["Year", "Optimistic", "Normal", "Pessimistic"],
      rows: [
        ["2026", "1.4", "1.4", "1.4"],
        ["2046", "1.7", "1.9", "2.2"],
        ["2076", "1.9", "2.4", "3.2"],
        ["2100", "1.9", "2.7", "4.1"],
        ["2126", "1.8", "2.8", "4.7"],
      ],
    });

    expect(config).not.toBeNull();
    expect(config?.type).toBe("line");
    expect(Array.from(new Set(config?.data.map((item) => item.series)))).toEqual([
      "Optimistic",
      "Normal",
      "Pessimistic",
    ]);
    expect(config?.data.filter((item) => item.series === "Optimistic")).toEqual([
      { label: "2026", value: 1.4, series: "Optimistic" },
      { label: "2046", value: 1.7, series: "Optimistic" },
      { label: "2076", value: 1.9, series: "Optimistic" },
      { label: "2100", value: 1.9, series: "Optimistic" },
      { label: "2126", value: 1.8, series: "Optimistic" },
    ]);
  });

  test("turns a two-column table into a single-series line chart", () => {
    const config = tableMatrixToLineChart({
      headers: ["Year", "Value"],
      rows: [
        ["2026", "1.4"],
        ["2046", "1.7"],
      ],
    });

    expect(config).not.toBeNull();
    expect(config?.type).toBe("line");
    expect(config?.data).toEqual([
      { label: "2026", value: 1.4, series: "Value" },
      { label: "2046", value: 1.7, series: "Value" },
    ]);
  });

  test("strips thousands separators from numbers", () => {
    const config = tableMatrixToLineChart({
      headers: ["Year", "Population"],
      rows: [
        ["2026", "1,200"],
        ["2046", "1,700"],
      ],
    });

    expect(config?.data).toEqual([
      { label: "2026", value: 1200, series: "Population" },
      { label: "2046", value: 1700, series: "Population" },
    ]);
  });

  test("skips columns that lack at least two numeric cells", () => {
    const config = tableMatrixToLineChart({
      headers: ["Year", "Note", "Value"],
      rows: [
        ["2026", "start", "1.4"],
        ["2046", "middle", "1.7"],
      ],
    });

    expect(config?.data).toEqual([
      { label: "2026", value: 1.4, series: "Value" },
      { label: "2046", value: 1.7, series: "Value" },
    ]);
  });

  test("keeps missing values as gaps", () => {
    const config = tableMatrixToLineChart({
      headers: ["Year", "Value"],
      rows: [
        ["2026", "1.4"],
        ["2046", ""],
        ["2076", "1.9"],
      ],
    });

    expect(config?.data).toEqual([
      { label: "2026", value: 1.4, series: "Value" },
      { label: "2046", value: null, series: "Value" },
      { label: "2076", value: 1.9, series: "Value" },
    ]);
  });

  test("returns null for text-only tables", () => {
    expect(
      tableMatrixToLineChart({
        headers: ["Name", "Role"],
        rows: [
          ["Ada", "Engineer"],
          ["Grace", "Admiral"],
        ],
      }),
    ).toBeNull();
  });

  test("returns null when there is only one body row", () => {
    expect(
      tableMatrixToLineChart({
        headers: ["Year", "Value"],
        rows: [["2026", "1.4"]],
      }),
    ).toBeNull();
  });

  test("returns null when there are fewer than two columns", () => {
    expect(
      tableMatrixToLineChart({
        headers: ["Year"],
        rows: [["2026"], ["2046"]],
      }),
    ).toBeNull();
  });
});
