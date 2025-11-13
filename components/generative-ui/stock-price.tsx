"use client";

import { motion } from "framer-motion";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export type StockData = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume?: number;
  marketCap?: string;
};

export function StockPrice({ data }: { data: StockData }) {
  const [mounted, setMounted] = useState(false);
  const isPositive = data.change >= 0;
  const isNeutral = data.change === 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
      className="relative flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-background to-muted/30 p-6 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-2xl text-foreground">{data.symbol}</h3>
          <p className="text-muted-foreground text-sm">Stock Price</p>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium text-sm ${
            isNeutral
              ? "bg-muted text-muted-foreground"
              : isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          <TrendIcon className="h-4 w-4" />
          <span>
            {isPositive && "+"}
            {data.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-bold text-4xl text-foreground">
          ${data.price.toFixed(2)}
        </span>
        <span
          className={`font-medium text-lg ${
            isNeutral
              ? "text-muted-foreground"
              : isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isPositive && "+"}${data.change.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
        <div>
          <p className="text-muted-foreground text-xs">Open</p>
          <p className="font-semibold text-foreground text-sm">
            ${data.open.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Prev Close</p>
          <p className="font-semibold text-foreground text-sm">
            ${data.previousClose.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">High</p>
          <p className="font-semibold text-foreground text-sm">
            ${data.high.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Low</p>
          <p className="font-semibold text-foreground text-sm">
            ${data.low.toFixed(2)}
          </p>
        </div>
        {data.volume && (
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">Volume</p>
            <p className="font-semibold text-foreground text-sm">
              {data.volume.toLocaleString()}
            </p>
          </div>
        )}
        {data.marketCap && (
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">Market Cap</p>
            <p className="font-semibold text-foreground text-sm">
              {data.marketCap}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function StockPriceLoading({ symbol }: { symbol?: string }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="flex items-baseline gap-2">
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
        {[...new Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-16 animate-pulse rounded bg-muted/50" />
            <div className="mt-1 h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      {symbol && (
        <p className="text-center text-muted-foreground text-sm">
          Loading {symbol} data...
        </p>
      )}
    </div>
  );
}
