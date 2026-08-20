import { defineChart } from "@tanstack/charts";
import { polar, radialArc } from "@tanstack/charts/polar";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/preact-charts";
import { pie } from "d3-shape";
import { useMemo } from "preact/hooks";
import type { DonutChartConfig } from "./parser";

const COLORS = [
  "var(--ts-chart-1)",
  "var(--ts-chart-2)",
  "var(--ts-chart-3)",
  "var(--ts-chart-4)",
  "var(--ts-chart-5)",
  "var(--ts-chart-6)",
];

interface DonutSlice {
  id: string;
  label: string;
  value: number;
  fill: string;
}

export function DonutChart({ config }: { config: DonutChartConfig }) {
  const rows = useMemo<DonutSlice[]>(
    () => config.data.map((item, index) => ({
      ...item,
      id: `${index}:${item.label}`,
      fill: COLORS[index % COLORS.length],
    })),
    [config.data],
  );

  const definition = useMemo(() => {
    const slices = pie<DonutSlice>()
      .sort(null)
      .value((item) => item.value)(rows);

    return defineChart({
      marks: [
        polar({
          inset: 8,
          radiusRatio: 0.82,
          marks: [
            radialArc(slices, {
              key: (slice) => slice.data.id,
              startAngle: "startAngle",
              endAngle: "endAngle",
              padAngle: "padAngle",
              innerRadius: ({ radius }) => radius * 0.55,
              fill: (slice) => slice.data.fill,
              stroke: "var(--background-primary)",
              strokeWidth: 1.5,
            }),
          ],
        }),
      ],
      guides: false,
      margin: 0,
      x: null,
      y: null,
      tooltip,
    });
  }, [rows]);

  const ariaLabel = config.title
    ? `${config.title} donut chart`
    : `Donut chart showing ${rows.map((row) => row.label).join(", ")}`;

  return (
    <figure class="tanstack-chart tanstack-chart--donut">
      {config.title ? <figcaption class="tanstack-chart__title">{config.title}</figcaption> : null}
      <div class="tanstack-chart__plot">
        <Chart
          definition={definition}
          height={300}
          ariaLabel={ariaLabel}
        />
      </div>
      {config.legend ? (
        <ul class="tanstack-chart__legend" aria-label="Chart legend">
          {rows.map((row) => (
            <li class="tanstack-chart__legend-item" key={row.id}>
              <span
                class="tanstack-chart__swatch"
                style={{ "--slice-color": row.fill }}
                aria-hidden="true"
              />
              <span>{row.label}: {row.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
