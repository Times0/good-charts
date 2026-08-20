import { AreaChart } from "./AreaChart";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";
import { LineChart } from "./LineChart";
import type { ChartConfig } from "./parser";

export function ChartRenderer({ config }: { config: ChartConfig }) {
  switch (config.type) {
    case "donut":
      return <DonutChart config={config} />;
    case "line":
      return <LineChart config={config} />;
    case "bar":
      return <BarChart config={config} />;
    case "area":
      return <AreaChart config={config} />;
  }
}
