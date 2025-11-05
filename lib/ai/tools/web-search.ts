import { tavily } from "@tavily/core";
import { tool } from "ai";
import { z } from "zod";

// Initialize Tavily client
const tavilyClient = process.env.TAVILY_API_KEY
    ? tavily({ apiKey: process.env.TAVILY_API_KEY })
    : null;

export const webSearch = tool({
    description:
        "Search the web for up-to-date information, news, facts, and current events. Use this when you need real-time information that might not be in your training data.",
    inputSchema: z.object({
        query: z
            .string()
            .min(1)
            .max(200)
            .describe(
                "The search query to find relevant information on the web",
            ),
        maxResults: z
            .number()
            .int()
            .min(1)
            .max(10)
            .optional()
            .describe("Maximum number of results to return (default: 5)"),
        searchDepth: z
            .enum(["basic", "advanced"])
            .optional()
            .describe(
                "Search depth - 'basic' for quick results, 'advanced' for more comprehensive search (default: basic)",
            ),
        includeAnswer: z
            .boolean()
            .optional()
            .describe(
                "Whether to include a generated answer based on search results (default: true)",
            ),
    }),
    execute: async (
        { query, maxResults = 5, searchDepth = "basic", includeAnswer = true },
    ) => {
        // Check if Tavily API key is configured
        if (!tavilyClient) {
            return {
                error:
                    "Web search is not configured. Please add TAVILY_API_KEY to your environment variables.",
                query,
            };
        }

        try {
            // Perform the search using Tavily
            const response = await tavilyClient.search(query, {
                maxResults,
                searchDepth,
                includeAnswer,
                includeRawContent: false, // Set to true if you need full page content
            });

            // Format the results for better readability
            const formattedResults = response.results.map((result) => ({
                title: result.title,
                url: result.url,
                content: result.content,
                score: result.score,
                publishedDate: result.publishedDate,
            }));

            return {
                query,
                answer: response.answer,
                results: formattedResults,
                images: response.images,
                responseTime: response.responseTime,
            };
        } catch (error) {
            console.error("Tavily search error:", error);

            return {
                error: error instanceof Error
                    ? error.message
                    : "Failed to perform web search",
                query,
            };
        }
    },
});
