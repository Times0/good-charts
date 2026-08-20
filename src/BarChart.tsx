import { barY, defineChart } from "@tanstack/charts";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/preact-charts";
import { scaleBand, scaleLinear } from "d3-scale";
import { useMemo } from "preact/hooks";
import type { BarChartConfig } from "./parser";

interface BarPoint {
  id: string;
  label: string;
  value: number;
}

export function BarChart({ config }: { config: BarChartConfig }) {
  const points = useMemo<BarPoint[]>(
    () => config.data.map((item, index) => ({ ...item, id: `${index}:${item.label}` })),
    [config.data],
  );

  const definition = useMemo(
    () => defineChart({
      chart: ({ width }) => ({
        marks: [
          barY(points, {
            x: "label",
            y: "value",
            key: "id",
            fill: "var(--ts-chart-1)",
            inset: 2,
            maxThickness: 56,
            radius: 3,
          }),
        ],
        x: {
          scale: () => scaleBand<string>().padding(0.16),
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
      tooltip,
    }),
    [points],
  );

  const ariaLabel = config.title
    ? `${config.title} bar chart`
    : `Bar chart comparing ${points.map((point) => point.label).join(", ")}`;

  return (
    <figure class="tanstack-chart tanstack-chart--bar">
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
