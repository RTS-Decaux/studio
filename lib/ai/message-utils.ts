/**
 * Message utilities for handling AI SDK message types
 *
 * Tool messages (role: "tool") are internal AI SDK artifacts that:
 * 1. Contain duplicate data already in assistant message parts
 * 2. Break convertToModelMessages() validation
 * 3. Are not needed for UI or context
 *
 * This module ensures tool messages are ALWAYS filtered out.
 */

/**
 * Filters out tool messages from any message array
 * Tool messages are AI SDK internal artifacts - results are already in assistant parts
 */
export function filterToolMessages<T extends { role: string }>(
  messages: T[]
): T[] {
  return messages.filter((msg) => msg.role !== "tool");
}

/**
 * Logs debug info about filtered tool messages (development only)
 */
export function debugToolMessages(messages: Array<{ role: string }>): void {
  if (process.env.NODE_ENV !== "development") return;

  const toolCount = messages.filter((msg) => msg.role === "tool").length;

  if (toolCount > 0) {
    console.log(
      `[AI] Filtered ${toolCount} tool message(s) from ${messages.length} total`
    );
  }
}
