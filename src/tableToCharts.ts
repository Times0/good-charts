import type { LineChartConfig, LineChartDatum } from "./parser";

export interface TableMatrix {
  headers: string[];
  rows: string[][];
}

function parseNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (trimmed === "") {
    return null;
  }

  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function tableMatrixToLineChart({ headers, rows }: TableMatrix): LineChartConfig | null {
  if (headers.length < 2 || rows.length < 2) {
    return null;
  }

  const labels = rows.map((row) => (row[0] ?? "").trim());
  if (labels.some((label) => label === "")) {
    return null;
  }

  const data: LineChartDatum[] = [];

  for (let column = 1; column < headers.length; column += 1) {
    const name = (headers[column] ?? "").trim();
    if (name === "") {
      continue;
    }

    const series = rows.map((row, rowIndex) => ({
      label: labels[rowIndex],
      value: parseNumber(row[column] ?? ""),
      series: name,
    }));

    if (series.filter((item) => item.value !== null).length >= 2) {
      data.push(...series);
    }
  }

  if (data.length === 0) {
    return null;
  }

  return {
    type: "line",
    data,
  };
}

function cellText(cell: Element): string {
  return (cell.textContent ?? "").trim();
}

export function htmlTableToMatrix(table: HTMLTableElement): TableMatrix {
  const headerCells = Array.from(table.querySelectorAll("thead th, thead td"));
  const bodyRowEls = Array.from(table.querySelectorAll("tbody tr"));

  let headers: string[];
  let rowEls: Element[];

  if (headerCells.length > 0) {
    headers = headerCells.map(cellText);
    rowEls = bodyRowEls;
  } else {
    const allRows = Array.from(table.querySelectorAll("tr"));
    const [firstRow, ...restRows] = allRows;
    headers = firstRow ? Array.from(firstRow.querySelectorAll("th, td")).map(cellText) : [];
    rowEls = restRows;
  }

  const rows = rowEls.map((rowEl) => Array.from(rowEl.querySelectorAll("th, td")).map(cellText));

  return { headers, rows };
}

export function htmlTableToLineChart(table: HTMLTableElement): LineChartConfig | null {
  return tableMatrixToLineChart(htmlTableToMatrix(table));
}
