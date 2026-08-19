import { defineChart, lineY } from "@tanstack/charts";
import { Chart } from "@tanstack/preact-charts";
import { scaleLinear, scalePoint } from "d3-scale";
import { useMemo } from "preact/hooks";
import type { LineChartConfig } from "./parser";

interface LinePoint {
  id: string;
  label: string;
  value: number;
}

export function LineChart({ config }: { config: LineChartConfig }) {
  const points = useMemo<LinePoint[]>(
    () => config.data.map((item, index) => ({ ...item, id: `${index}:${item.label}` })),
    [config],
  );

  const definition = useMemo(
    () => defineChart({
      chart: ({ width }) => ({
        marks: [
          lineY(points, {
            x: "label",
            y: "value",
            key: "id",
            stroke: "var(--ts-chart-1)",
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
        clip: true,
      }),
    }),
    [points],
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
