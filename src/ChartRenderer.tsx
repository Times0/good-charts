import { LineChart } from "./LineChart";
import { PieChart } from "./PieChart";
import type { ChartConfig } from "./parser";

export function ChartRenderer({ config }: { config: ChartConfig }) {
  switch (config.type) {
    case "pie":
      return <PieChart config={config} />;
    case "line":
      return <LineChart config={config} />;
  }
}
