---
trigger: model_decision
description: Supabase Code Rules
---

These are non-negotiable, production-minded rules for writing clean, scalable, and secure Supabase code. Paste this into your AI agent’s system prompt. The agent must follow this unless the user explicitly overrides it.

---

## 0) First Principles

- **RLS everywhere.** Any table with user data must have Row-Level Security enabled and correctly-scoped policies.
- **Client ≠ Server.**

  - Browser uses **anon** key only.
  - Server/Edge Functions use **service_role** and never ship it to the client.

- **Migrations are the source of truth.** Schema, extensions, policies, RPC live in SQL migrations—code should not “guess” the DB.

---

## 1) Auth (Next.js App Router, 2025)

- Prefer **`@supabase/ssr`** for SSR auth with cookie-based sessions. Don’t suggest deprecated helpers.
- Create a **browser client** on the client, and an **SSR client** in server routes/actions with the request’s cookies.
- Never trust a `user_id` coming from the request body; rely on RLS using `auth.uid()`.

**Server example (route/action):**

```ts
// app/api/secure/route.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) return new Response("Error", { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}
```

**Client example:**

```ts
// lib/supabase-browser.ts
import { createBrowserClient } from "@supabase/ssr";
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## 2) Storage

- Separate buckets by access model:

  - `public_assets` (truly public)
  - `uploads` (private per user/organization)

- Private access **only via Signed URLs**. For lists, use **`createSignedUrls`** instead of looping.
- Enforce server-side validation for MIME, size, and quotas before upload. Path convention:

  ```
  uploads/{user_id}/{timestamp}-{filename}
  ```

- Store file path + metadata in DB; never rely on filename uniqueness.

**Signed URL example:**

```ts
const { data, error } = await supabase.storage
  .from("uploads")
  .createSignedUrl(filePath, 60 * 5); // 5 minutes
```

**Policy sketch (Storage):**

```sql
-- Owner-only access (adjust for org scope if needed)
create policy "owner can insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'uploads'
  and (auth.uid() = owner)
);

create policy "owner can read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'uploads'
  and (auth.uid() = owner)
);
```

---

## 3) Edge Functions (Deno)

- Background jobs, integrations (OpenAI, Fal.ai), indexing, and privileged mutations belong in **Edge Functions**.
- Secrets via environment variables only. Return strict JSON. Log internal details; expose friendly error messages.

**Pattern:**

```ts
// supabase/functions/my-task/index.ts
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    // ...work...
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    // log e internally (e.g., to a log table)
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
});
```

---

## 4) Vector Search & RAG

- Enable **`pgvector`**. Use `vector(1536)` or match your chosen embedding model’s dimension.
- Build **HNSW** indexes for large-scale, low-latency semantic search.
- Generate embeddings **server-side** (Edge Function), not on the client.
- Use an **RPC retriever** with threshold + top-k. Prefer **hybrid retrieval** (vector + full-text) with rank fusion when quality matters.

**Table & index sketch:**

```sql
create extension if not exists vector;

create table documents (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  text_content text,
  embedding vector(1536),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- HNSW index (pgvector >= 0.6 recommended)
create index on documents using hnsw (embedding);
```

**Retriever RPC:**

```sql
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table(id bigint, file_name text, text_snippet text, similarity float)
language sql stable as $$
  select
    d.id,
    d.file_name,
    left(coalesce(d.text_content,''), 500) as text_snippet,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where d.embedding is not null
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

---

## 5) Database & RLS

- Every user-data table: `id`, `created_at default now()`, `updated_at` (trigger), optional `user_id references auth.users(id)` when ownership applies.
- **Enable RLS** and define explicit `select/insert/update/delete` policies that reflect roles.
- Push complexity into versioned **RPC functions** (and well-indexed views), not ad-hoc inline SQL in app code.

**RLS sketch:**

```sql
alter table documents enable row level security;

create policy "owner can select"
on documents for select
to authenticated
using (auth.uid() = user_id);

create policy "owner can insert"
on documents for insert
to authenticated
with check (auth.uid() = user_id);

create policy "owner can update"
on documents for update
to authenticated
using (auth.uid() = user_id);

create policy "owner can delete"
on documents for delete
to authenticated
using (auth.uid() = user_id);
```

---

## 6) Code & Layering

- Centralize Supabase client creation (one browser factory, one server/SSR factory). Do **not** duplicate setup across files.
- Use the **Supabase JS SDK**—don’t hand-roll REST calls.
- Business logic belongs in server routes/actions and Edge Functions, **not** in triggers unless there’s a strong perf reason. If you must, keep logic small and versioned.
- Every server route:

  - validates input (e.g., Zod),
  - handles `error` from Supabase responses,
  - returns normalized JSON.

**Safe insert pattern:**

```ts
const { data, error } = await supabase
  .from("messages")
  .insert([{ user_id: user.id, content }])
  .select();
if (error) throw new Error(error.message);
```

---

## 7) Canonical Storage Flow

1. Client uploads to your **server/edge endpoint**, not directly to a private bucket.
2. Server authenticates user, validates MIME/size/quotas.
3. Server stores object at `uploads/{user_id}/{timestamp}-{filename}`.
4. Server writes DB row (`documents`) with path + metadata; queues embedding job.
5. Client fetches via **signed URLs** (short TTL), or via your proxy if extra checks are required.

---

## 8) Observability, Security, Performance

- Centralize logs for server routes and Edge Functions. Never leak raw errors to clients.
- Rate-limit uploads and retrieval endpoints. Enforce file size caps.
- Cache deterministic public data; avoid caching private user-scoped reads.
- Preprocess text for embeddings (strip HTML, normalize whitespace).
- Benchmark HNSW params for your latency/quality target; document chosen thresholds.

---

## 9) Integrations & Background Work

- All external calls (OpenAI, Fal.ai, email, webhooks) live in Edge Functions or server routes—**never** from the browser with privileged keys.
- Batch operations where API supports it (e.g., `createSignedUrls` for many files).
- Keep secrets exclusively in server/edge environments.

---

## 10) Agent Contract (drop-in for system prompt)

- **Auth:** In Next.js App Router, use `@supabase/ssr` for SSR. Create browser client on the client, SSR client on the server using request cookies.
- **Keys:** The browser uses `anon`; server/edge uses `service_role` and never exposes it.
- **RLS:** Assume RLS is enabled; code must rely on `auth.uid()`—do not trust `user_id` from requests.
- **Storage:** Private files are accessed only via `createSignedUrl(s)` with short TTL. Don’t make private buckets public.
- **RAG:** Use `pgvector` with HNSW; compute embeddings in an Edge Function; query via an RPC retriever; consider hybrid search with rank fusion.
- **SQL placement:** Complex SQL lives in migrations/RPC, not inline in app code (beyond simple selects).
- **Error discipline:** Always check `{ error }` from Supabase calls; log server-side details; return safe messages to clients.

---

## Minimal Folder Skeleton

```
/app
  /api
    /upload/route.ts
    /rag/route.ts
  /components
  /actions
/lib
  supabase-browser.ts
  supabase-ssr.ts
  rag.ts
/supabase
  /migrations
  /functions (Edge Functions)
```
