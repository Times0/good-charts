import { MarkdownRenderChild, Plugin } from "obsidian";
import { render } from "preact";
import { ChartRenderer } from "./ChartRenderer";
import { parseChartConfig } from "./parser";
import { htmlTableToLineChart } from "./tableToCharts";

class ChartRenderChild extends MarkdownRenderChild {
  constructor(
    containerEl: HTMLElement,
    private readonly mountEl: HTMLElement,
  ) {
    super(containerEl);
  }

  onunload(): void {
    render(null, this.mountEl);
  }
}

export default class GoodChartsPlugin extends Plugin {
  async onload(): Promise<void> {
    this.registerMarkdownCodeBlockProcessor("tanstack-chart", (source, el, context) => {
      let config;

      try {
        config = parseChartConfig(source);
      } catch (error) {
        el.addClass("tanstack-chart-error");
        el.setAttribute("role", "alert");
        el.setText(error instanceof Error ? error.message : String(error));
        return;
      }

      const mountEl = el.createDiv();
      render(<ChartRenderer config={config} />, mountEl);
      context.addChild(new ChartRenderChild(el, mountEl));
    });

    this.registerMarkdownPostProcessor((el, context) => {
      for (const table of Array.from(el.querySelectorAll("table"))) {
        const child = this.enhanceTable(table);
        if (child) {
          context.addChild(child);
        }
      }
    });
  }

  private enhanceTable(table: HTMLTableElement): ChartRenderChild | null {
    if (table.dataset.goodcharts) {
      return null;
    }

    const config = htmlTableToLineChart(table);
    if (!config) {
      return null;
    }

    table.dataset.goodcharts = "true";

    const toolbar = createDiv({ cls: "goodcharts-toolbar" });
    const button = toolbar.createEl("button", {
      cls: "goodcharts-toggle",
      attr: { type: "button" },
    });
    const chartMount = createDiv({ cls: "goodcharts-chart" });

    table.parentElement?.insertBefore(toolbar, table);
    table.insertAdjacentElement("afterend", chartMount);

    let chartVisible = false;

    const applyMode = (): void => {
      if (chartVisible) {
        table.addClass("goodcharts-hidden");
        button.setText("Show table");
        render(<ChartRenderer config={config} />, chartMount);
      } else {
        table.removeClass("goodcharts-hidden");
        button.setText("Show chart");
        render(null, chartMount);
      }
    };

    button.addEventListener("click", () => {
      chartVisible = !chartVisible;
      applyMode();
    });

    applyMode();
    return new ChartRenderChild(toolbar, chartMount);
  }
}
