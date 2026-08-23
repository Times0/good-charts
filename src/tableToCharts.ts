export interface TableMatrix {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}

function parseNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (trimmed === "") {
    return null;
  }

  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function tableMatrixToChartInput({ headers, rows }: TableMatrix): Record<string, unknown> | null {
  if (headers.length < 2 || rows.length < 2) {
    return null;
  }

  const labels = rows.map((row) => (row[0] ?? "").trim());
  if (labels.some((label) => label === "")) {
    return null;
  }

  const data: Record<string, unknown>[] = [];
  const seriesNames: string[] = [];

  for (let column = 1; column < headers.length; column += 1) {
    const name = (headers[column] ?? "").trim();
    if (name === "") {
      continue;
    }

    const values = rows.map((row) => parseNumber(row[column] ?? ""));
    if (values.filter((value) => value !== null).length < 2) {
      continue;
    }

    seriesNames.push(name);
    data.push(
      ...values.map((value, rowIndex) => ({
        id: `${column}:${rowIndex}`,
        label: labels[rowIndex],
        value,
        series: name,
      })),
    );
  }

  if (data.length === 0) {
    return null;
  }

  const category = (headers[0] ?? "").trim() || "Category";

  return {
    ariaLabel: `Line chart of ${seriesNames.join(", ")} by ${category}`,
    data,
    marks: [
      {
        lineY: {
          x: "label",
          y: "value",
          z: "series",
          key: "id",
          strokeWidth: 2.25,
          points: true,
        },
      },
    ],
    x: {
      scale: "point",
      axis: { label: category },
    },
    y: {
      scale: "linear",
      nice: true,
      grid: true,
    },
    clip: true,
  };
}

function cellText(cell: Element): string {
  return (cell.textContent ?? "").trim();
}

function htmlTableToMatrix(table: HTMLTableElement): TableMatrix {
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

export function htmlTableToChartInput(table: HTMLTableElement): Record<string, unknown> | null {
  return tableMatrixToChartInput(htmlTableToMatrix(table));
}
