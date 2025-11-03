---
trigger: model_decision
description: Vercel AI SDK Code Rules
---

## 0) First Principles

- **Server first.** Heavy LLM calls, tools, and secrets run on the server (API routes / server actions / Edge Functions).
- **Stateless prompts, stateful app.** Keep model prompts pure; store app state (threads, tools, RAG) in your DB.
- **Streams by default.** Prefer streamed responses for UX and cost visibility.

---

## 1) Models & Providers

- Use official providers (`openai`, `google`, `anthropic`, `xai`, etc.) via `@ai-sdk/*` packages.
- Centralize model map and surface only approved IDs:

  ```ts
  export const MODELS = {
    chat: "gpt-4.1-mini",
    reasoning: "o4-mini",
    vision: "gpt-4o-mini",
  } as const;
  ```

- Do not hardcode keys; inject via env and provider factories.

---

## 2) Server Usage (App Router)

- **Server actions / API routes** call `generateText`, `streamText`, `generateObject`, `streamObject`, or `tool` runners.
- Never call providers from client components.
- Always validate input (Zod) and cap tokens, temperature, and tool max depth.

---

## 3) Streaming Patterns

- Use `streamText` → return `ReadableStream` to the client.
- For React, prefer `useAIState` with server actions to hydrate progressively.
- For SSE/Edge, set proper headers and flush chunks promptly.

---

## 4) Structured Output (Guardrails)

- Prefer `generateObject` / `streamObject` with strict Zod schemas for machine-readable results.
- Reject on schema mismatch; never silently coerce.
- Keep schemas small and versioned; include `schemaVersion`.

---

## 5) Tools & Function Calling

- Define tools as pure, idempotent server functions with explicit input/output Zod schemas.
- Enforce a **tools budget** (max calls, recursion depth).
- Log each tool call (name, duration, args hash) without leaking secrets.

---

## 6) RAG Integration

- Separate concerns:

  - `retriever(query) → context[]`
  - `prompt(system, context, user) → messages[]`
  - `model(messages) → answer`

- Run retrieval before model call; attach citations (ids + spans) to the response.
- Cache retrieval results on the server (short TTL) keyed by normalized query.

---

## 7) Prompt Engineering Contract

- System prompts live in code (versioned) and accept **params**, not prose concatenation.
- Keep messages short; prefer **explicit delimiters** and **few-shot minimalism**.
- Never embed secrets or PII in prompts.

---

## 8) Safety & Cost Controls

- Set conservative defaults:

  ```ts
  { maxTokens: 800, temperature: 0.4, topP: 1, presencePenalty: 0 }
  ```

- Enforce per-request and per-user budgets (tokens, tool calls).
- Add server-side rate limits and abuse detection.

---

## 9) Observability

- Log: model id, tokens in/out, latency, tool calls, cache hits.
- Sample prompt/response pairs with redaction.
- Emit custom events for “answer_generated”, “tool_called”, “rag_retrieved”.

---

## 10) Errors & Retries

- Distinguish **user errors** (400) vs **provider errors** (502/503) vs **policy blocks** (403).
- Retry only idempotent operations (exponential backoff, jitter).
- On tool failure: return partial result + actionable error field.

---

## 11) Caching & Idempotency

- Cache retrieval and deterministic generations (fixed seed, low temp).
- Use request fingerprinting (model, prompt hash, tool inputs) for reuse.
- Do not cache user-private content without scoping keys to user/org.

---

## 12) Multi-Turn & Threads

- Store chat turns and tool outcomes in DB with normalized shape:

  ```ts
  {
    threadId, role, content, toolCalls, citations, createdAt;
  }
  ```

- Rehydrate only **minimal** prior context; don’t flood the prompt.

---

## 13) Vision, Audio, and Media

- Upload media server-side; pass **signed URLs** to the model.
- For large media, pre-extract metadata (duration, transcript, OCR) and reference via IDs.
- Never inline base64 for big assets in prompts.

---

## 14) Agents & Routing

- Router policy first: classify intent → pick **one** agent or return “needs-clarification”.
- Each agent has: system prompt, allowed tools, RAG profile, and budget.
- Prevent infinite delegation; hard-cap depth and cycles.

---

## 15) Minimal Server Action Example

```ts
"use server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const Input = z.object({ query: z.string().min(1).max(2000) });

export async function askAction(formData: FormData) {
  const { query } = Input.parse({ query: formData.get("query") });

  // 1) RAG
  const context = await retriever(query); // your server fn
  const messages = buildMessages({ query, context }); // system+user

  // 2) Stream
  const result = await streamText({
    model: openai("gpt-4.1-mini"),
    messages,
    maxTokens: 800,
    temperature: 0.5,
  });

  return result.toAIStreamResponse(); // Next.js streaming helper
}
```

---

## 16) Client Hook (React)

- Prefer a thin client that posts to server actions and renders the stream.
- Keep client state minimal: input, stream, optimistic UI.

---

## 17) Folder Skeleton

```
/app
  /api (or server actions)
  /agents
  /prompts
  /components
/lib
  ai/models.ts
  ai/retriever.ts
  ai/router.ts
  ai/metrics.ts
  ai/schemas.ts
```

---

## 18) Agent Contract (drop-in)

- Use **server** to call models, tools, and RAG; the client only streams results.
- Stream outputs by default; fall back to `generateObject` for strict JSON.
- Respect budgets (tokens, tools, time). Stop gracefully when exceeded.
- Always validate inputs (Zod). On error, return structured `{ error, hint }`.
- Never leak secrets. Never call providers from the browser.

---

## 19) Defaults to Enforce

```ts
const DEFAULTS = {
  maxTokens: 800,
  temperature: 0.4,
  toolMaxDepth: 2,
  topP: 1,
  presencePenalty: 0,
};
```

---

## 20) What Not To Do

- No model calls from client components.
- No unbounded prompts or context windows.
- No silent schema coercion.
- No tool recursion without hard caps.
- No plaintext secrets in code or prompts.
