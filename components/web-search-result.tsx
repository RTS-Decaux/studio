"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon, Globe } from "lucide-react";

type SearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
};

type TavilyImage = {
  url: string;
  description?: string;
};

type WebSearchOutput = {
  query: string;
  answer?: string;
  results?: SearchResult[];
  images?: (string | TavilyImage)[];
  responseTime?: number;
  error?: string;
};

export function WebSearchResult({
  output,
}: {
  output: WebSearchOutput;
}) {
  if (output.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
        <p className="text-red-600 text-sm dark:text-red-400">
          {output.error}
        </p>
      </div>
    );
  }

  const sourcesCount = output.results?.length || 0;

  return (
    <Accordion
      className="not-prose mb-4"
      collapsible
      type="single"
    >
      <AccordionItem className="rounded-lg border bg-card" value="web-search">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-sm">Web Search Results</span>
            {sourcesCount > 0 && (
              <Badge className="ml-2 rounded-full" variant="secondary">
                {sourcesCount} sources
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-3 pt-2">
            {/* Answer Summary */}
            {output.answer && (
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-sm leading-relaxed">
                  {output.answer}
                </p>
              </div>
            )}

            {/* Simple Badge Resources */}
            {output.results && output.results.length > 0 && (
              <div>
                <p className="mb-2 text-muted-foreground text-xs">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {output.results.map((result, index) => {
                    const domain = new URL(result.url).hostname.replace('www.', '');
                    
                    return (
                      <a
                        href={result.url}
                        key={`${result.url}-${index}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Badge
                          className="cursor-pointer gap-1.5 transition-colors hover:bg-primary/90"
                          variant="secondary"
                        >
                          <ExternalLinkIcon className="size-3" />
                          <span className="max-w-[200px] truncate">{domain}</span>
                        </Badge>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
