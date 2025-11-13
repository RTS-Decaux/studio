"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Clock, Plane } from "lucide-react";

export type FlightData = {
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    city: string;
    code: string;
    time: string;
    gate?: string;
  };
  arrival: {
    airport: string;
    city: string;
    code: string;
    time: string;
    gate?: string;
  };
  duration: string;
  status: "on-time" | "delayed" | "cancelled" | "boarding" | "departed";
  price?: number;
  class?: string;
};

const statusColors = {
  "on-time": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  delayed: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  boarding: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  departed: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export function FlightCard({ data }: { data: FlightData }) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-border bg-gradient-to-br from-background to-muted/30 p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-bold text-foreground text-xl">
              {data.airline} {data.flightNumber}
            </h3>
          </div>
          {data.class && (
            <p className="mt-1 text-muted-foreground text-sm">{data.class}</p>
          )}
        </div>
        <div
          className={`rounded-full px-3 py-1 font-medium text-sm capitalize ${statusColors[data.status]}`}
        >
          {data.status.replace("-", " ")}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-bold text-3xl text-foreground">
            {data.departure.code}
          </div>
          <div className="mt-1 text-muted-foreground text-sm">
            {data.departure.city}
          </div>
          <div className="mt-2 flex items-center gap-1 font-medium text-foreground text-sm">
            <Clock className="h-4 w-4" />
            {format(parseISO(data.departure.time), "h:mm a")}
          </div>
          {data.departure.gate && (
            <div className="mt-1 text-muted-foreground text-xs">
              Gate {data.departure.gate}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center px-4">
          <div className="flex items-center gap-2">
            <div className="h-px w-12 bg-border" />
            <Plane className="h-5 w-5 rotate-90 text-primary" />
            <div className="h-px w-12 bg-border" />
          </div>
          <div className="mt-2 font-medium text-muted-foreground text-xs">
            {data.duration}
          </div>
        </div>

        <div className="flex-1 text-right">
          <div className="font-bold text-3xl text-foreground">
            {data.arrival.code}
          </div>
          <div className="mt-1 text-muted-foreground text-sm">
            {data.arrival.city}
          </div>
          <div className="mt-2 flex items-center justify-end gap-1 font-medium text-foreground text-sm">
            <Clock className="h-4 w-4" />
            {format(parseISO(data.arrival.time), "h:mm a")}
          </div>
          {data.arrival.gate && (
            <div className="mt-1 text-muted-foreground text-xs">
              Gate {data.arrival.gate}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="h-4 w-4" />
          <span>{format(parseISO(data.departure.time), "MMM d, yyyy")}</span>
        </div>
        {data.price && (
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Price</p>
            <p className="font-bold text-foreground text-lg">
              ${data.price.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function FlightCardLoading() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-border bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="flex items-start justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-10 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="flex-1 text-right">
          <div className="ml-auto h-10 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-2 ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <p className="text-center text-muted-foreground text-sm">
        Searching flights...
      </p>
    </div>
  );
}
