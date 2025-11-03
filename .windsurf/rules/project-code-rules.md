# Project Code Rules

This document defines the coding standards and best practices for this Next.js + Supabase + AI SDK project.

## Authentication (Supabase Auth)

### ✅ DO:
- Use `@supabase/ssr` for SSR auth with cookie-based sessions
- Create server clients using `createSupabaseServerClient()` from `/lib/supabase/server.ts`
- Create browser clients using `createSupabaseBrowserClient()` from `/lib/supabase/browser.ts`
- Use `getSession()` and `getUser()` helpers for server-side auth checks
- Use `useSupabaseSession()` hook for client-side auth state
- Check `user.is_anonymous` to detect guest users

### ❌ DON'T:
- Don't create Supabase clients inline - use centralized factories
- Don't trust `user_id` from request body - rely on RLS with `auth.uid()`
- Don't expose `SUPABASE_SERVICE_ROLE_KEY` to the browser
- Don't use NextAuth or any other auth library (removed from project)

### Example (Server):
```typescript
import { getSession } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }
  
  const isGuest = session.user.is_anonymous;
  // ... use session
}
```

### Example (Client):
```typescript
import { useSupabaseSession } from "@/lib/supabase/provider";

export function Component() {
  const { session, user } = useSupabaseSession();
  const isGuest = user?.is_anonymous ?? false;
  // ... use session
}
```

---

## AI SDK (Vercel AI SDK)

### ✅ DO:
- Import `LanguageModel` type from `"ai"` for model typing
- Use centralized `myProvider.languageModel(modelId)` from `/lib/ai/providers.ts`
- Cast models as `LanguageModel` type:
  ```typescript
  const model = myProvider.languageModel("chat-model") as LanguageModel;
  ```
- Use registered model IDs: `"chat-model"`, `"chat-model-reasoning"`, `"chat-model-fast"`, `"title-model"`, `"artifact-model"`
- Call AI SDK functions (`streamText`, `generateText`, `streamObject`) only on the server
- Set conservative defaults: `{ maxTokens: 800, temperature: 0.4 }`

### ❌ DON'T:
- Don't use type assertions like `as Parameters<typeof streamText>[0]['model']`
- Don't call AI SDK functions from client components
- Don't hardcode API keys - use env variables
- Don't make unbounded prompts

### Example:
```typescript
import { streamText, type LanguageModel } from "ai";
import { myProvider } from "@/lib/ai/providers";

export async function POST(request: Request) {
  const model = myProvider.languageModel("chat-model") as LanguageModel;
  
  const result = await streamText({
    model,
    messages,
    maxTokens: 800,
    temperature: 0.4,
  });
  
  return result.toAIStreamResponse();
}
```

---

## Database Types (Supabase)

### ✅ DO:
- Use types from `/lib/supabase/types.ts` (generated from Supabase schema)
- Use type aliases from `/lib/supabase/models.ts` for cleaner code
- Use native Supabase types: `Session`, `User` from `@supabase/supabase-js`
- Define literal union types in Database types for enum-like fields

### ❌ DON'T:
- Don't create custom wrapper types that duplicate Database types
- Don't use type intersections (`&`) when native types already match
- Don't import from deleted NextAuth types

### Example:
```typescript
import type { Document, DocumentInsert } from "@/lib/supabase/models";
import type { Session } from "@supabase/supabase-js";

export async function createDoc(session: Session, doc: DocumentInsert): Promise<Document> {
  // Document.kind is typed as "text" | "code" | "image" | "sheet" from Database types
  const { data } = await supabase.from("Document").insert(doc).select().single();
  return data;
}
```

---

## Environment Variables

### Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `OPENAI_API_KEY` or `GEMINI_API_KEY` - AI provider key
- `AI_DEFAULT_PROVIDER` - `"openai"` or `"gemini"`

### Optional:
- `REDIS_URL` - For resumable streams
- `NEXT_PUBLIC_APP_URL` - App URL for redirects

### Removed (no longer used):
- ❌ `AUTH_SECRET` (was for NextAuth)
- ❌ `POSTGRES_URL` (using Supabase PostgreSQL)

---

## File Structure

### Centralized Configs:
- `/lib/ai/providers.ts` - AI provider configuration and model registry
- `/lib/ai/models.ts` - Chat model definitions
- `/lib/supabase/server.ts` - Server-side Supabase client factory
- `/lib/supabase/browser.ts` - Browser-side Supabase client factory
- `/lib/supabase/provider.tsx` - React context for Supabase session
- `/lib/supabase/models.ts` - Type aliases for database tables
- `/lib/supabase/types.ts` - Generated Supabase types

### Server Code:
- `/app/(chat)/api/**` - API routes
- `/app/(chat)/actions.ts` - Server actions
- `/lib/ai/tools/**` - AI tool implementations
- `/lib/db/queries.ts` - Database queries

### Client Code:
- `/components/**` - React components
- `/hooks/**` - Custom React hooks

---

## Code Style

### Imports:
```typescript
// External packages first
import { streamText, type LanguageModel } from "ai";
import type { Session } from "@supabase/supabase-js";

// Internal imports grouped
import { myProvider } from "@/lib/ai/providers";
import { getSession } from "@/lib/supabase/server";
import type { Document } from "@/lib/supabase/models";
```

### Type Safety:
- Always use `type` imports for types
- Prefer union types over enums
- Use `as const` for constant objects
- Explicitly type function returns for exported functions

### Error Handling:
- Always check `{ error }` from Supabase calls
- Use `ChatSDKError` for API errors
- Return structured errors: `{ error: string }`
- Log errors server-side, return safe messages to clients

---

## Testing

- Use Supabase credentials in tests
- Mock AI providers in test environment
- Store test configs in `.env.local`
- Add GitHub secrets for CI/CD

---

## Migration Checklist

When updating authentication or database schema:

1. Update Supabase migrations in `/supabase/migrations/`
2. Regenerate types: `npx supabase gen types typescript --local > lib/supabase/types.ts`
3. Update type aliases in `/lib/supabase/models.ts` if needed
4. Update server-side auth helpers if needed
5. Update client-side hooks if needed
6. Test locally with `npx supabase start`
7. Update environment variable documentation

---

## Prohibited Patterns

❌ **NEVER DO THIS:**

```typescript
// DON'T: Type assertion with Parameters utility
const model = myProvider.languageModel("model") as Parameters<typeof streamText>[0]['model'];

// DON'T: Creating custom auth types
type AppSession = Session & { customField: string };

// DON'T: Inline Supabase client creation
const supabase = createClient(url, key);

// DON'T: Client-side AI calls
"use client";
import { streamText } from "ai";

// DON'T: Trust user_id from request body
const { user_id } = await request.json();
```

✅ **DO THIS INSTEAD:**

```typescript
// DO: Simple type cast
const model = myProvider.languageModel("model") as LanguageModel;

// DO: Use native Supabase types
import type { Session } from "@supabase/supabase-js";

// DO: Use centralized factories
import { createSupabaseServerClient } from "@/lib/supabase/server";

// DO: Server-side AI calls only
"use server";
import { streamText, type LanguageModel } from "ai";

// DO: Get user from session
const session = await getSession();
const userId = session.user.id;
```
