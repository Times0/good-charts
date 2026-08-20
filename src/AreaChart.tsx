import { areaY, defineChart } from "@tanstack/charts";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/preact-charts";
import { scaleLinear, scalePoint } from "d3-scale";
import { useMemo } from "preact/hooks";
import type { AreaChartConfig } from "./parser";

interface AreaPoint {
  id: string;
  label: string;
  value: number;
}

export function AreaChart({ config }: { config: AreaChartConfig }) {
  const points = useMemo<AreaPoint[]>(
    () => config.data.map((item, index) => ({ ...item, id: `${index}:${item.label}` })),
    [config.data],
  );

  const definition = useMemo(
    () => defineChart({
      chart: ({ width }) => ({
        marks: [
          areaY(points, {
            x: "label",
            y: "value",
            key: "id",
            fill: "var(--ts-chart-1)",
            fillOpacity: 0.24,
            stroke: "var(--ts-chart-1)",
            strokeWidth: 2.25,
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
      tooltip,
    }),
    [points],
  );

  const ariaLabel = config.title
    ? `${config.title} area chart`
    : `Area chart from ${points[0].label} to ${points.at(-1)?.label}`;

  return (
    <figure class="tanstack-chart tanstack-chart--area">
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
