"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, ImageIcon } from "lucide-react";

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
      <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
        <p className="text-red-600 text-sm dark:text-red-400">
          {output.error}
        </p>
        {output.query && (
          <p className="text-muted-foreground text-xs">
            Query: {output.query}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Answer Summary */}
      {output.answer && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <h5 className="mb-2 font-medium text-sm">Summary</h5>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {output.answer}
          </p>
        </div>
      )}

      {/* Search Results */}
      {output.results && output.results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-sm">
              Sources ({output.results.length})
            </h5>
            {output.responseTime && (
              <span className="text-muted-foreground text-xs">
                {output.responseTime}ms
              </span>
            )}
          </div>

          <div className="space-y-2">
            {output.results.map((result, index) => (
              <a
                className={cn(
                  "block rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
                href={result.url}
                key={`${result.url}-${index}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h6 className="line-clamp-1 font-medium text-sm">
                        {result.title}
                      </h6>
                      <ExternalLinkIcon className="size-3 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                      {result.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="truncate text-muted-foreground text-xs">
                        {new URL(result.url).hostname}
                      </span>
                      {result.publishedDate && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(result.publishedDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {result.score && (
                    <Badge
                      className="shrink-0"
                      variant={result.score > 0.8 ? "default" : "secondary"}
                    >
                      {Math.round(result.score * 100)}%
                    </Badge>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      {output.images && output.images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-4 text-muted-foreground" />
            <h5 className="font-medium text-sm">Images ({output.images.length})</h5>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {output.images.slice(0, 6).map((image, index) => {
              const imageUrl = typeof image === "string" ? image : image.url;
              const imageDescription = typeof image === "string" ? undefined : image.description;
              
              return (
                <a
                  className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
                  href={imageUrl}
                  key={`${imageUrl}-${index}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <img
                    alt={imageDescription || `Search result ${index + 1}`}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    src={imageUrl}
                  />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
