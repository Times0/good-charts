import { MarkdownRenderChild, Plugin, setIcon } from "obsidian";
import { render } from "preact";
import {
  ChartView,
  compileChartInput,
  compileChartSource,
  type CompiledChart,
} from "./chart";
import { htmlTableToChartInput } from "./tableToCharts";

class ChartRenderChild extends MarkdownRenderChild {
  constructor(
    containerEl: HTMLElement,
    private readonly mountEl: HTMLElement,
    private readonly cleanup: () => void = () => {},
  ) {
    super(containerEl);
  }

  onunload(): void {
    render(null, this.mountEl);
    this.cleanup();
  }
}

function showError(el: HTMLElement, error: unknown): void {
  el.empty();
  el.addClass("tanstack-chart-error");
  el.setAttribute("role", "alert");
  el.setText(error instanceof Error ? error.message : String(error));
}

function mountChart(chart: CompiledChart, mountEl: HTMLElement): void {
  render(<ChartView chart={chart} />, mountEl);
}

export default class GoodChartsPlugin extends Plugin {
  async onload(): Promise<void> {
    this.registerMarkdownCodeBlockProcessor("tanstack-chart", (source, el, context) => {
      try {
        const chart = compileChartSource(source);
        const mountEl = el.createDiv();
        mountChart(chart, mountEl);
        context.addChild(new ChartRenderChild(el, mountEl));
      } catch (error) {
        showError(el, error);
      }
    });

    this.registerMarkdownPostProcessor((el, context) => {
      for (const table of el.querySelectorAll("table")) {
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

    const input = htmlTableToChartInput(table);
    if (!input) {
      return null;
    }

    let chart: CompiledChart;
    try {
      chart = compileChartInput(input);
    } catch {
      return null;
    }

    table.dataset.goodcharts = "true";

    const toolbar = createDiv({ cls: "goodcharts-toolbar" });
    const button = toolbar.createEl("button", {
      cls: "clickable-icon goodcharts-toggle",
      attr: { type: "button" },
    });
    const chartMount = createDiv({ cls: "goodcharts-chart" });

    table.parentElement?.insertBefore(toolbar, table);
    table.insertAdjacentElement("afterend", chartMount);

    let chartVisible = true;

    const applyMode = (): void => {
      if (chartVisible) {
        table.addClass("goodcharts-hidden");
        button.setAttribute("aria-label", "Show table");
        button.setAttribute("title", "Show table");
        setIcon(button, "table");
        mountChart(chart, chartMount);
      } else {
        table.removeClass("goodcharts-hidden");
        button.setAttribute("aria-label", "Show chart");
        button.setAttribute("title", "Show chart");
        setIcon(button, "line-chart");
        render(null, chartMount);
      }
    };

    const toggle = (): void => {
      chartVisible = !chartVisible;
      applyMode();
    };

    button.addEventListener("click", toggle);
    applyMode();

    return new ChartRenderChild(toolbar, chartMount, () => {
      button.removeEventListener("click", toggle);
      table.removeClass("goodcharts-hidden");
      delete table.dataset.goodcharts;
      toolbar.remove();
      chartMount.remove();
    });
  }
}
