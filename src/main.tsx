import { MarkdownRenderChild, Plugin } from "obsidian";
import { render } from "preact";
import { ChartRenderer } from "./ChartRenderer";
import { parseChartConfig } from "./parser";

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

export default class TanStackChartsPlugin extends Plugin {
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
  }
}
