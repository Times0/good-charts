import { colorLegend, defineChart, lineY } from "@tanstack/charts";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/preact-charts";
import { scaleLinear, scalePoint } from "d3-scale";
import { useMemo } from "preact/hooks";
import { CHART_COLORS } from "./palette";
import type { LineChartConfig, LineChartDatum } from "./parser";

interface LinePoint extends LineChartDatum {
  id: string;
}

export function LineChart({ config }: { config: LineChartConfig }) {
  const points = useMemo<LinePoint[]>(
    () => config.data.map((item, index) => ({ ...item, id: `${index}:${item.label}` })),
    [config.data],
  );
  const series = useMemo(
    () => Array.from(new Set(config.data.map((item) => item.series))),
    [config.data],
  );

  const definition = useMemo(
    () => defineChart({
      chart: ({ width }) => ({
        marks: [
          lineY(points, {
            x: "label",
            y: "value",
            z: "series",
            color: "series",
            key: "id",
            strokeWidth: 2.25,
            points: true,
          }),
        ],
        x: {
          scale: () => scalePoint<string>().padding(0.35),
          ticks: width < 420 ? 4 : 7,
        },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          ticks: width < 420 ? 4 : 6,
        },
        color: {
          domain: series,
          range: CHART_COLORS,
          legend: series.length > 1 ? colorLegend() : undefined,
        },
        clip: true,
      }),
      tooltip,
    }),
    [points, series],
  );

  const ariaLabel = config.title
    ? `${config.title} line chart`
    : `Line chart from ${points[0].label} to ${points.at(-1)?.label}`;

  return (
    <figure class="tanstack-chart tanstack-chart--line">
      {config.title ? <figcaption class="tanstack-chart__title">{config.title}</figcaption> : null}
      <div class="tanstack-chart__plot">
        <Chart
          definition={definition}
          height={300}
          ariaLabel={ariaLabel}
        />
      </div>
    </figure>
  );
}
