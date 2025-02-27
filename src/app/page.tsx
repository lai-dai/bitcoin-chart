"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type BarsInfo } from "lightweight-charts";
import Image from "next/image";
import React from "react";
import {
  cryptoCoins,
  GetCandles,
  getCryptoImage,
  GetCryptoInfo,
} from "~/actions/binance";
import { BitcoinChart } from "~/components/bitcoin-chart";
import { getRange, timeIntervals } from "~/utils/time-intervals";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useLazyRef } from "~/hooks/use-lazy-ref";
import { debounce } from "~/utils/debounce";
import { Button } from "~/components/ui/button";
import { priceFormatter } from "~/utils/formats";
import { cn } from "~/lib/utils";
import { useUrlState } from "~/hooks/use-url-state";
import { RotateCcw } from "lucide-react";

export default function HomePage() {
  const [tabValue, setTabValue] = useUrlState({
    symbol: "BTCUSDT",
  });

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="order-2 border-r lg:order-1">
        <CryptoCoinsDaily />
      </aside>

      <main className="order-1">
        <Tabs
          value={tabValue.symbol}
          onValueChange={(symbol) => setTabValue({ symbol })}
        >
          <Card className="border-none shadow-none">
            <CardHeader>
              <ScrollArea className="pb-3">
                <TabsList>
                  {cryptoCoins.map((it) => (
                    <TabsTrigger
                      key={it.cryptoName}
                      value={it.cryptoName}
                      className="gap-2"
                    >
                      <Image
                        src={it.cryptoImage}
                        alt={it.cryptoName}
                        width={100}
                        height={100}
                        className="size-5"
                      />
                      <h5>{it.cryptoName}</h5>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardHeader>
          </Card>

          {cryptoCoins.map((it) => (
            <TabsContent key={it.cryptoName} value={it.cryptoName}>
              <ChartContent symbol={it.cryptoName} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}

function CryptoCoinsDaily() {
  const [{ symbol }] = useUrlState({
    symbol: "BTCUSDT",
  });

  const { data, status, error, refetch } = useQuery({
    queryKey: ["GetCryptoInfo", symbol],
    queryFn: () => GetCryptoInfo(symbol),
    select: (data) => {
      return {
        ...data.data,
        priceChange: parseFloat(data.data.priceChange),
        priceChangePercent: parseFloat(data.data.priceChangePercent),
        weightedAvgPrice: parseFloat(data.data.weightedAvgPrice),
        openPrice: parseFloat(data.data.openPrice),
        highPrice: parseFloat(data.data.highPrice),
        lowPrice: parseFloat(data.data.lowPrice),
        lastPrice: parseFloat(data.data.lastPrice),
        volume: parseFloat(data.data.volume),
        quoteVolume: parseFloat(data.data.quoteVolume),
      };
    },
    refetchInterval: 3_000, // 3s
  });

  if (status === "pending") {
    return "Loading...";
  }

  if (status === "error") {
    return error.message ?? "Error";
  }

  return (
    <div>
      <Card className="border-none shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Image
                width={100}
                height={100}
                alt="symbol"
                src={getCryptoImage(symbol)!}
                className="size-6"
              />
              <h1 className="font-semibold">
                Bitcoin{" "}
                <span className="text-xs text-muted-foreground">BTC</span>
              </h1>
            </div>

            <Button
              variant={"outline"}
              size={"sm"}
              type="button"
              onClick={() => refetch()}
            >
              <RotateCcw />
              Tải lại
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-semibold">
              {priceFormatter(data?.volume)}
            </h3>

            <p
              className={cn(
                "text-xs font-bold",
                data.priceChangePercent < 0
                  ? "text-destructive"
                  : "text-green-500",
              )}
            >
              {data.priceChangePercent.toFixed(2)} (1d)
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-muted-foreground">
            <pre className="whitespace-pre-wrap text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// số lượng Entry
const limit = 50;

function ChartContent({ symbol }: { symbol: string }) {
  const [timeInterval, setTimeInterval] = React.useState("1m");

  const todayRef = useLazyRef(() => Date.now());

  const [timeRange, setTimeRange] = React.useState({
    startTime: getRange(todayRef.current, limit, timeInterval),
    endTime: todayRef.current,
  });

  const {
    data: cryptoData,
    status,
    error,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["GetCandles", symbol, timeInterval],
    queryFn: ({ pageParam }) =>
      GetCandles({
        symbol,
        interval: timeInterval,
        ...pageParam,
      }),
    initialPageParam: timeRange,
    getNextPageParam: () =>
      // lastPage: ICandleStick[],
      // allPages: Array<ICandleStick[]>,
      // lastPageParam: TimeRange,
      {
        return timeRange;
      },
    // refetchInterval: 10_000, // tải lại sau 10s
    // refetchOnWindowFocus: true, // tải lại khi focus
    select: (cryptoData) => {
      const result = [...(cryptoData?.pages ?? [])];

      // khi tải thêm page thì cần đảo ngược lại
      return result.reverse().flat();
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFetchNextPage = React.useCallback(
    debounce((info: BarsInfo<number>) => {
      // chỉ cần trước đó có < 10 thì tải thêm
      if (info.barsBefore < 10 && !isFetchingNextPage) {
        const endTime = getRange(timeRange.startTime, 1, timeInterval); // không lấy item hiện tại cuối cùng
        setTimeRange({
          endTime,
          startTime: getRange(endTime, limit, timeInterval),
        });

        // trể 1 khoảng để react set state
        setTimeout(() => {
          void fetchNextPage();
        }, 1);
      }
    }, 300),
    [timeRange, isFetchingNextPage, timeInterval],
  );

  const { refetch: refetchNewEntry } = useQuery({
    queryKey: ["GetCandlesNewEntry", timeInterval, symbol],
    queryFn: () =>
      GetCandles({
        symbol,
        interval: timeInterval,
        limit: 1,
      }),
    enabled: false,
  });

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Biểu đồ nến & Biểu đồ khối lượng giao dịch</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs
          value={timeInterval}
          onValueChange={(value) => {
            setTimeInterval(value);

            // khi thay đổi Interval thì phải set lại time range
            setTimeRange({
              startTime: getRange(todayRef.current, limit, value),
              endTime: todayRef.current,
            });
          }}
        >
          <ScrollArea className="pb-3">
            <TabsList>
              {timeIntervals.map(([label, value]) => (
                <TabsTrigger key={value} value={value} className="gap-2">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {timeIntervals.map(([_, value]) => (
            <TabsContent key={value} value={value}>
              {status === "pending" ? (
                "Loading..."
              ) : status === "error" ? (
                (error?.message ?? "Error")
              ) : (
                <BitcoinChart
                  data={cryptoData}
                  isFetchingNextPage={isFetchingNextPage}
                  fetchNextPage={debounceFetchNextPage}
                  fetchNewEntry={(callback) => {
                    void refetchNewEntry().then(({ data }) => {
                      if (data && data?.length > 0) {
                        const newEntry = data[0];
                        callback(newEntry!);
                      }
                    });
                  }}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
