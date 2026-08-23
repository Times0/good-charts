import {
  areaY,
  barY,
  d3Curve,
  defineChart,
  dot,
  lineY,
  ruleX,
  ruleY,
  text,
  type ChartMark,
  type ChartValue,
  type DomChartDefinition,
} from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/preact-charts";
import { curveMonotoneX } from "d3-shape";
import { parse } from "yaml";

type RecordValue = Record<string, unknown>;
type DynamicMark = ChartMark<unknown, ChartValue, ChartValue>;
type MarkFactory = (data: readonly unknown[], options: RecordValue) => DynamicMark;

const markRegistry = {
  areaY,
  barY,
  dot,
  lineY,
  ruleX,
  ruleY,
  text,
} as const;

const scaleRegistry = {
  band: () => scaleBand().padding(0.2),
  linear: scaleLinear,
  point: scalePoint,
};

interface DataSources {
  shared?: readonly unknown[];
  named: Record<string, readonly unknown[]>;
}

export interface CompiledChart {
  definition: DomChartDefinition;
  title?: string;
  height: number;
  ariaLabel: string;
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseDataSources(value: unknown): DataSources {
  if (value === undefined) {
    return { named: {} };
  }

  if (Array.isArray(value)) {
    return { shared: value, named: {} };
  }

  if (!isRecord(value)) {
    throw new Error("data must be an array or a mapping of named arrays.");
  }

  const named: Record<string, readonly unknown[]> = {};
  for (const [name, rows] of Object.entries(value)) {
    if (!Array.isArray(rows)) {
      throw new Error(`data.${name} must be an array.`);
    }
    named[name] = rows;
  }

  return { named };
}

function resolveMarkData(
  value: unknown,
  sources: DataSources,
  markName: string,
): readonly unknown[] {
  if (value === undefined) {
    if (sources.shared) {
      return sources.shared;
    }
    throw new Error(`${markName} needs data because the chart has no shared data array.`);
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const data = sources.named[value];
    if (!data) {
      throw new Error(`${markName} references unknown data set "${value}".`);
    }
    return data;
  }

  throw new Error(`${markName}.data must be a named data set or an inline array.`);
}

function compileMark(value: unknown, sources: DataSources, index: number): DynamicMark {
  if (!isRecord(value) || Object.keys(value).length !== 1) {
    throw new Error(`marks[${index}] must contain exactly one named mark.`);
  }

  const [markName] = Object.keys(value);
  const factory = markRegistry[markName as keyof typeof markRegistry];
  if (!factory) {
    throw new Error(`Unknown mark "${markName}".`);
  }

  const rawOptions = value[markName];
  if (!isRecord(rawOptions)) {
    throw new Error(`${markName} must contain an options mapping.`);
  }

  const { data: dataReference, curve, ...options } = rawOptions;
  if (curve !== undefined) {
    if (curve !== "monotoneX") {
      throw new Error(`Unknown curve "${typeof curve === "string" ? curve : typeof curve}".`);
    }
    options.curve = d3Curve(curveMonotoneX);
  }

  return (factory as MarkFactory)(resolveMarkData(dataReference, sources, markName), options);
}

function compileAxis(value: unknown, axis: "x" | "y"): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (!isRecord(value)) {
    throw new Error(`${axis} must be an options mapping or null.`);
  }
  if (typeof value.scale !== "string") {
    throw new Error(`${axis}.scale must be linear, band, or point.`);
  }

  const scale = scaleRegistry[value.scale as keyof typeof scaleRegistry];
  if (!scale) {
    throw new Error(`Unknown scale "${value.scale}".`);
  }

  return { ...value, scale };
}

function optionalText(value: unknown, name: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} must be a non-empty string when provided.`);
  }
  return value.trim();
}

export function compileChartInput(value: unknown): CompiledChart {
  if (!isRecord(value)) {
    throw new Error("Chart configuration must be a YAML mapping.");
  }
  if ("chart" in value) {
    throw new Error("Responsive chart builders are not supported.");
  }
  if (!Array.isArray(value.marks) || value.marks.length === 0) {
    throw new Error("marks must contain at least one named mark.");
  }

  const title = optionalText(value.title, "title");
  const ariaLabel = optionalText(value.ariaLabel, "ariaLabel") ?? title ?? "Chart";
  const height = value.height ?? 300;
  if (typeof height !== "number" || !Number.isFinite(height) || height <= 0) {
    throw new Error("height must be a positive finite number.");
  }
  if (value.tooltip !== undefined && typeof value.tooltip !== "boolean") {
    throw new Error("tooltip must be true or false.");
  }

  const sources = parseDataSources(value.data);
  const marks = value.marks.map((mark, index) => compileMark(mark, sources, index));
  const {
    title: _title,
    height: _height,
    ariaLabel: _ariaLabel,
    data: _data,
    tooltip: tooltipEnabled,
    x,
    y,
    ...options
  } = value;

  const spec = {
    ...options,
    marks,
    x: compileAxis(x, "x"),
    y: compileAxis(y, "y"),
    tooltip: tooltipEnabled === false ? false : tooltip,
  };

  return {
    definition: defineChart(spec as never) as unknown as DomChartDefinition,
    title,
    height,
    ariaLabel,
  };
}

export function compileChartSource(source: string): CompiledChart {
  let value: unknown;
  try {
    value = parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid YAML: ${message}`);
  }
  return compileChartInput(value);
}

export function ChartView({ chart }: { chart: CompiledChart }) {
  return (
    <figure class="tanstack-chart">
      {chart.title ? <figcaption class="tanstack-chart__title">{chart.title}</figcaption> : null}
      <div class="tanstack-chart__plot" style={{ height: `${chart.height}px` }}>
        <Chart
          definition={chart.definition}
          height={chart.height}
          ariaLabel={chart.ariaLabel}
        />
      </div>
    </figure>
  );
}
