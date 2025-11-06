"use client";

import { CloudSun } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Weather } from "./weather";

type WeatherAtLocation = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  cityName?: string;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
  daily_units: {
    time: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
};

export function WeatherAccordion({
  weatherAtLocation,
}: {
  weatherAtLocation?: WeatherAtLocation;
}) {
  const location =
    weatherAtLocation?.cityName ||
    `${weatherAtLocation?.latitude?.toFixed(1)}°, ${weatherAtLocation?.longitude?.toFixed(1)}°`;

  const temp = weatherAtLocation?.current?.temperature_2m
    ? `${Math.ceil(weatherAtLocation.current.temperature_2m)}°`
    : "N/A";

  return (
    <Accordion className="not-prose mb-4" collapsible type="single">
      <AccordionItem className="rounded-lg border bg-card" value="weather">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <CloudSun className="size-4 text-orange-600 dark:text-orange-400" />
            <span className="font-semibold text-sm">Weather</span>
            <Badge className="ml-2 rounded-full" variant="secondary">
              {location} · {temp}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="pt-2">
            <Weather weatherAtLocation={weatherAtLocation} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
