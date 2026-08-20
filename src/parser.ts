import { parse } from "yaml";

export interface ChartDatum {
  label: string;
  value: number;
}

export interface DonutChartConfig {
  type: "donut";
  title?: string;
  legend: boolean;
  data: ChartDatum[];
}

export interface LineChartConfig {
  type: "line";
  title?: string;
  data: ChartDatum[];
}

export interface BarChartConfig {
  type: "bar";
  title?: string;
  data: ChartDatum[];
}

export interface AreaChartConfig {
  type: "area";
  title?: string;
  data: ChartDatum[];
}

export type ChartConfig = DonutChartConfig | LineChartConfig | BarChartConfig | AreaChartConfig;

const DONUT_KEYS = new Set(["type", "title", "legend", "data"]);
const CARTESIAN_KEYS = new Set(["type", "title", "data"]);
const DATUM_KEYS = new Set(["label", "value"]);
const CHART_TYPES = new Set(["donut", "line", "bar", "area"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unknownKeys(value: Record<string, unknown>, allowed: Set<string>): string[] {
  return Object.keys(value).filter((key) => !allowed.has(key));
}

export function parseChartConfig(source: string): ChartConfig {
  let raw: unknown;

  try {
    raw = parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid YAML: ${message}`);
  }

  if (!isRecord(raw)) {
    throw new Error("Chart configuration must be a YAML mapping.");
  }

  if (typeof raw.type !== "string" || !CHART_TYPES.has(raw.type)) {
    throw new Error("type must be donut, line, bar, or area.");
  }

  const extraRootKeys = unknownKeys(raw, raw.type === "donut" ? DONUT_KEYS : CARTESIAN_KEYS);
  if (extraRootKeys.length > 0) {
    throw new Error(`Unknown option${extraRootKeys.length === 1 ? "" : "s"}: ${extraRootKeys.join(", ")}.`);
  }

  if (raw.title !== undefined && (typeof raw.title !== "string" || raw.title.trim() === "")) {
    throw new Error("title must be a non-empty string when provided.");
  }

  if (raw.legend !== undefined && typeof raw.legend !== "boolean") {
    throw new Error("legend must be true or false.");
  }

  if (!Array.isArray(raw.data) || raw.data.length === 0) {
    throw new Error("data must contain at least one point.");
  }

  const data = raw.data.map((item, index): ChartDatum => {
    if (!isRecord(item)) {
      throw new Error(`data[${index}] must contain label and value.`);
    }

    const extraDatumKeys = unknownKeys(item, DATUM_KEYS);
    if (extraDatumKeys.length > 0) {
      throw new Error(`Unknown data[${index}] option${extraDatumKeys.length === 1 ? "" : "s"}: ${extraDatumKeys.join(", ")}.`);
    }

    if (typeof item.label !== "string" || item.label.trim() === "") {
      throw new Error(`data[${index}].label must be a non-empty string.`);
    }

    if (typeof item.value !== "number" || !Number.isFinite(item.value)) {
      throw new Error(`data[${index}].value must be a finite number.`);
    }

    if (raw.type === "donut" && item.value < 0) {
      throw new Error(`data[${index}].value cannot be negative.`);
    }

    return { label: item.label.trim(), value: item.value };
  });

  if (raw.type === "donut" && data.every((item) => item.value === 0)) {
    throw new Error("At least one slice must have a value greater than zero.");
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : undefined;

  if (raw.type === "line" || raw.type === "area") {
    if (data.length < 2) {
      const article = raw.type === "area" ? "An" : "A";
      throw new Error(`${article} ${raw.type} chart needs at least two points.`);
    }

    return { type: raw.type, title, data };
  }

  if (raw.type === "bar") {
    return { type: "bar", title, data };
  }

  return { type: "donut", title, legend: raw.legend ?? true, data };
}
