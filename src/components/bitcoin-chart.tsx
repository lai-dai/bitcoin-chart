/* eslint-disable @typescript-eslint/prefer-optional-chain */
"use client";

import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  CrosshairMode,
  LineStyle,
  type LogicalRange,
  type BarsInfo,
  type AutoscaleInfo,
  type ISeriesApi,
} from "lightweight-charts";
import React from "react";
import { type ICandleStick } from "~/actions/binance";
import { formatLargeNum, priceFormatter } from "~/utils/formats";
import { format } from "date-fns";
import { theme } from "~/lib/tailwind-theme";
import { useTheme } from "next-themes";
import { useCallbackRef } from "~/hooks/use-callback-ref";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const chartThemes = [
  {
    value: "1",
    upColor: "#16c784",
    downColor: "#ea3943",
  },
  {
    value: "2",
    upColor: "#2a9d90",
    downColor: "#e8c468",
  },
  {
    value: "3",
    upColor: "#2eb88a",
    downColor: "#2662d9",
  },
];

interface ChartComponentProps {
  data: ICandleStick[];
  isFetchingNextPage?: boolean;
  fetchNextPage?: (info: BarsInfo<number>) => void;
  fetchNewEntry?: (callback: (entry: ICandleStick) => void) => void;
}

const toolTipWidth = 200;
const toolTipHeight = 150;
const toolTipMargin = 15;

export function BitcoinChart(props: ChartComponentProps) {
  const {
    data,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageProp,
    fetchNewEntry: fetchNewEntryProp,
  } = props;

  const fetchNextPage = useCallbackRef(fetchNextPageProp);
  const fetchNewEntry = useCallbackRef(fetchNewEntryProp);

  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const chartRef = React.useRef<IChartApi>();
  const candlestickSeriesRef = React.useRef<ISeriesApi<"Candlestick">>();
  const histogramSeriesRef = React.useRef<ISeriesApi<"Histogram">>();

  const resizeObserver = React.useRef<ResizeObserver>();

  const { theme: mode = "dark" } = useTheme();
  const [currentTheme, setCurrentTheme] = React.useState("1");

  const getModeColor = React.useCallback(
    (lightColor: string, darkColor?: string) => {
      return mode === "dark" ? (darkColor ?? lightColor) : lightColor;
    },
    [mode],
  );

  // init lightweight-chart
  React.useEffect(() => {
    chartRef.current = createChart(chartContainerRef.current!, {
      width: chartContainerRef.current?.clientWidth,
      height: 500, // chartContainerRef.current?.clientHeight,

      layout: {
        background: {
          type: ColorType.Solid,
          color: getModeColor(theme.colors.white, theme.colors.gray["900"]),
        },
        textColor: getModeColor("#7b8298"),
      },

      // lưới hiển thị mặc định
      grid: {
        vertLines: { visible: false },
        horzLines: { color: getModeColor(theme.colors.gray["100"], "#1e2632") },
      },

      // style line khi hover
      crosshair: {
        mode: CrosshairMode.Normal,

        // Vertical crosshair line (showing Date in Label)
        vertLine: {
          width: 2,
          color: "#C3BCDB44",
          style: LineStyle.Solid,
          labelBackgroundColor: "#7e889b",
        },

        // Horizontal crosshair line (showing Price in Label)
        horzLine: {
          color: "#C3BCDB44",
          labelBackgroundColor: "#7e889b",
          style: LineStyle.Solid,
        },
      },

      // X
      timeScale: {
        borderColor: "#C3BCDB44",
        barSpacing: 10,
        timeVisible: true,
        tickMarkFormatter: (time: number) => {
          return format(time, "p");
        },
        fixRightEdge: true,
      },

      // Y
      rightPriceScale: {
        borderColor: "#C3BCDB44",
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      },

      // Apply the custom priceFormatter to the chart
      localization: {
        priceFormatter: (p: number) => {
          return formatLargeNum(p);
        },
        timeFormatter: (t: number) => {
          return format(t, "dd LLL yy HH:MM:ss");
        },
      },

      handleScroll: {
        mouseWheel: false,
      },
      handleScale: {
        mouseWheel: false,
      },
    });
    chartRef.current?.timeScale().fitContent();

    candlestickSeriesRef.current = chartRef.current?.addSeries(
      CandlestickSeries,
      {
        upColor: chartThemes[0]?.upColor,
        downColor: chartThemes[0]?.downColor,
        borderVisible: false,
      },
    );
    candlestickSeriesRef.current.setData(data);

    histogramSeriesRef.current = chartRef.current?.addSeries(HistogramSeries, {
      color: getModeColor("#eff2f5", "#263052"),
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "left",
      autoscaleInfoProvider: (original: () => AutoscaleInfo) => {
        const res = original();

        if (res !== null && res.priceRange !== null) {
          res.priceRange.minValue += 10;
          res.priceRange.maxValue += 10;
        }
        return res;
      },
    });
    histogramSeriesRef.current.priceScale().applyOptions({
      autoScale: false, // disables auto scaling based on visible content
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
      borderVisible: false,
    });
    histogramSeriesRef.current.setData(data);

    // Tooltip
    if (chartContainerRef.current && tooltipRef.current) {
      const container = chartContainerRef.current;
      const toolTip = tooltipRef.current;

      // update tooltip
      chartRef.current.subscribeCrosshairMove((param) => {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > container.clientWidth ||
          param.point.y < 0 ||
          param.point.y > container.clientHeight
        ) {
          toolTip.style.display = "none";
          return;
        }
        toolTip.style.display = "block";

        const dateStr = param.time;
        const histogramData = param.seriesData.get(
          histogramSeriesRef.current!,
        ) as {
          time: number;
          value: number;
        };
        const candlestickData = param.seriesData.get(
          candlestickSeriesRef.current!,
        ) as {
          open: number;
          high: number;
          low: number;
          close: number;
          time: number;
        };

        if (!candlestickData || !histogramData) {
          return;
        }

        toolTip.innerHTML = String.raw`
<div>
  <h5>${format(dateStr as number, "dd/MM/yyyy")}</h5>
  <p style="color: ${"#717d91"}">${format(dateStr as number, "p")}</p>
</div>
<div>
<p><span style="color: ${"#717d91"}">Open:</span> ${priceFormatter(candlestickData.open)}</p>
<p><span style="color: ${"#717d91"}">High:</span> ${priceFormatter(candlestickData.high)}</p>
<p><span style="color: ${"#717d91"}">Low:</span> ${priceFormatter(candlestickData.low)}</p>
<p><span style="color: ${"#717d91"}">Close:</span> ${priceFormatter(candlestickData.close)}</p>
<p><span style="color: ${"#717d91"}">Volume:</span> ${priceFormatter(histogramData.value)}</p>
</div>
`;

        const y = param.point.y;
        let left = param.point.x + toolTipMargin;
        if (left > container.clientWidth - toolTipWidth) {
          left = param.point.x - toolTipMargin - toolTipWidth;
        }

        let top = y + toolTipMargin;
        if (top > container.clientHeight - toolTipHeight) {
          top = y - toolTipHeight - toolTipMargin;
        }

        toolTip.style.left = left + "px";
        toolTip.style.top = top + "px";
      });
    }

    // fetch more
    function onVisibleLogicalRangeChanged(
      newVisibleLogicalRange: LogicalRange | null,
    ) {
      if (!newVisibleLogicalRange) {
        return;
      }

      const candlestickInfo = candlestickSeriesRef.current?.barsInLogicalRange(
        newVisibleLogicalRange,
      );

      // if there less than 50 bars to the left of the visible area
      if (
        candlestickInfo !== null &&
        candlestickInfo?.barsAfter &&
        candlestickInfo?.barsAfter > 0 &&
        typeof fetchNextPage === "function"
      ) {
        // try to load additional historical data and prepend it to the series data
        void fetchNextPage(candlestickInfo as BarsInfo<number>);
      }
    }

    chartRef.current
      ?.timeScale()
      .subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);

    return () => {
      chartRef.current
        ?.timeScale()
        .unsubscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);

      chartRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModeColor]);

  // update data
  React.useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    // cập nhật lại data khi data thay đổi
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(data);
    }

    if (histogramSeriesRef.current) {
      histogramSeriesRef.current.setData(data);
    }
  }, [data]);

  // Resize chart on container resizes.
  React.useEffect(() => {
    resizeObserver.current = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {};

      chartRef.current?.applyOptions({ width, height });

      setTimeout(() => {
        chartRef.current?.timeScale().fitContent();
      }, 0);
    });

    resizeObserver.current.observe(chartContainerRef.current!);

    return () => resizeObserver.current?.disconnect();
  }, []);

  // update entry
  const handleUpdateEntry = React.useCallback((entry: ICandleStick) => {
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.update(entry);
    }

    if (histogramSeriesRef.current) {
      histogramSeriesRef.current.update(entry);
    }
  }, []);

  React.useEffect(() => {
    const intervalID = setInterval(() => {
      fetchNewEntry(handleUpdateEntry);
    }, 2_000); // 2s

    return () => {
      clearInterval(intervalID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" onClick={() => fetchNewEntry(handleUpdateEntry)}>
          Cập nhật
        </Button>

        <div className="flex items-center gap-3">
          {chartThemes.map((theme) => {
            const isActive = currentTheme === theme.value;
            return (
              <div
                key={theme.value}
                role="button"
                onClick={() => {
                  setCurrentTheme(theme.value);

                  candlestickSeriesRef.current?.applyOptions({
                    upColor: theme.upColor,
                    downColor: theme.downColor,
                  });
                }}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-transparent p-0 hover:bg-transparent focus-visible:bg-transparent",
                  isActive ? "border-[--color-2]" : "",
                )}
                style={
                  {
                    "--color-1": theme.upColor,
                    "--color-2": theme.downColor,
                    "--color-3": theme.downColor,
                    "--color-4": theme.upColor,
                  } as React.CSSProperties
                }
              >
                <div className="h-6 w-6 overflow-hidden rounded-sm">
                  <div
                    className={cn(
                      "grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out group-hover:rotate-45",
                      isActive ? "rotate-45 group-hover:rotate-0" : "rotate-0",
                    )}
                  >
                    <span className="flex h-6 w-6 bg-[--color-1]" />
                    <span className="flex h-6 w-6 bg-[--color-2]" />
                    <span className="flex h-6 w-6 bg-[--color-3]" />
                    <span className="flex h-6 w-6 bg-[--color-4]" />
                    <span className="sr-only">{"chart-theme"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg border">
        <div
          aria-label="chart-container"
          className="flex-1"
          ref={chartContainerRef}
        />

        <div
          hidden={!isFetchingNextPage}
          className="absolute left-3 top-3 z-50"
        >
          <div
            className={
              "size-5 animate-spin rounded-full border-y-2 border-white"
            }
          />
        </div>

        <div
          ref={tooltipRef}
          aria-label="chart-tooltip"
          className="absolute z-10 hidden space-y-2 rounded-lg p-3 text-xs shadow-lg [&>div:first-child]:flex [&>div:first-child]:justify-between [&>div:last-child]:space-y-1.5"
          style={{
            minWidth: toolTipWidth,
            height: toolTipHeight,
            backgroundColor: getModeColor(theme.colors.white, "#222531"),
          }}
        ></div>
      </div>
    </div>
  );
}
