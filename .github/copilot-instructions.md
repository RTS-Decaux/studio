# AI Coding Agent Instructions

This is a Next.js 15 AI chatbot with RunwayML-style Studio for image/video generation. Built with Vercel AI SDK, Supabase (auth + storage + DB), and fal.ai.

## Architecture Overview

### Core Stack
- **Next.js 15** (App Router, RSC, Server Actions) with Turbopack dev mode
- **Vercel AI SDK** for streaming LLM responses, tool calling, and Generative UI
- **Supabase** for auth (incl. anonymous), PostgreSQL (pgvector + RLS), and Storage
- **fal.ai** for 40+ image/video generation models (FLUX, Veo 3.1, Sora 2, etc.)
- **shadcn/ui** + Tailwind CSS v4 with monochrome frosted glass design system
- **Biome** (via ultracite) for linting/formatting

### Key Modules
1. **Chat** (`app/(chat)`) - Main AI chat with streaming, artifacts (documents), Generative UI (stocks, flights, weather, products)
2. **Studio** (`app/studio`) - Image/video generation interface with project management, model selector, generation history
3. **Auth** (`app/(auth)`) - Supabase Auth with guest users + email/password (OAuth providers stubbed)
4. **Database** - All tables use RLS; queries in `lib/db/queries.ts`; types generated from Supabase schema

## Critical Patterns

### 1. AI Provider & Models
- **Never call AI SDK from client components**. Use server actions or API routes only.
- Import models via `myProvider` from `lib/ai/providers.ts`:
  ```typescript
  import { streamText, type LanguageModel } from "ai";
  import { myProvider } from "@/lib/ai/providers";
  
  const model = myProvider.languageModel("chat-model") as LanguageModel;
  const result = await streamText({ model, messages, maxTokens: 800, temperature: 0.4 });
  ```
- Registered model IDs: `chat-model`, `chat-model-reasoning`, `chat-model-fast`, `title-model`, `artifact-model`
- Provider selection via `AI_DEFAULT_PROVIDER` env var (`openai` or `gemini`); mapping in `lib/ai/models.ts`

### 2. Supabase Auth & Security
- **Use `@supabase/ssr` for SSR**. Create clients via:
  - Server: `createSupabaseServerClient()` from `lib/supabase/server.ts`
  - Browser: `createSupabaseBrowserClient()` from `lib/supabase/browser.ts`
- **Always use `getUser()` for auth checks** (not `getSession()` which reads cookies without verification)
- **Never trust `user_id` from request bodies**. RLS policies rely on `auth.uid()`.
- Guest users: Check `user.is_anonymous` to detect anonymous sessions.
- Example (server):
  ```typescript
  import { getUser } from "@/lib/supabase/server";
  const user = await getUser();
  if (!user) return new ChatSDKError("unauthorized:chat").toResponse();
  ```

### 3. Database & RLS
- All tables have RLS enabled; policies scope by `auth.uid()`.
- Types generated from Supabase: `lib/supabase/types.ts` (run `npx supabase gen types typescript --local`)
- Type aliases in `lib/supabase/models.ts` (e.g., `Chat`, `DBMessage`, `Document`)
- All queries in `lib/db/queries.ts` (e.g., `getChatById`, `saveMessages`, `createDocument`)
- Use `normalizeJson()` helper when inserting arrays/objects into JSONB columns

### 4. Generative UI
- AI can return React components (not just text) using `createUIMessageStream` and RSC
- Tools return `toolCallId` → client renders loading component → server sends final component
- Example flow: `createDocument` tool → `<DocumentPreview>` component streamed to client
- Components: `components/generative-ui/*.tsx`; tools: `lib/ai/tools/*.ts`
- Always export both loading and final component variants

### 5. Studio (Image/Video Generation)
- Uses fal.ai queue API (submit → poll status → result)
- Models mapped in `lib/studio/model-mapping.ts`; fal client in `lib/studio/fal-client.ts`
- **Never expose `FAL_API_KEY` to client**; all calls in server actions (`lib/studio/actions.ts`)
- UI components: `GenerationPanel`, `ModelSelectorDialog`, `GenerationHistory`, `AssetGallery`
- Database tables: `studio_projects`, `studio_generations`, `studio_assets`

### 6. File Uploads & Storage
- Supabase Storage bucket: `uploads`
- Upload server-side, return signed URLs (TTL 1 hour)
- Path convention: `uploads/{user_id}/{timestamp}-{filename}`
- Example: `lib/db/queries.ts` → `uploadAttachment()`, `getSignedUrl()`

## Developer Workflows

### Local Development
```bash
pnpm install
pnpm dev  # Next.js with Turbopack
npx supabase start  # Local Supabase (optional)
```

### Code Quality
```bash
pnpm lint    # Biome check (extends ultracite config)
pnpm format  # Biome fix
pnpm test    # Playwright tests
```

### Database Migrations
```bash
npx supabase migration new my_migration
# Edit supabase/migrations/*.sql
npx supabase db push
npx supabase gen types typescript --local > lib/supabase/types.ts
```

## Project Conventions

### Type Safety
- Always use `type` imports for types (not `import type { ... }`)
- Prefer union types over enums (e.g., `type Role = "user" | "assistant"`)
- Explicitly type function returns for exported functions

### Imports
```typescript
// External packages first
import { streamText, type LanguageModel } from "ai";
import type { User } from "@supabase/supabase-js";

// Internal imports grouped
import { myProvider } from "@/lib/ai/providers";
import { getUser } from "@/lib/supabase/server";
import type { Chat } from "@/lib/supabase/models";
```

### Error Handling
- API errors: Use `ChatSDKError` class (returns structured JSON response)
- Always check `{ error }` from Supabase calls
- Log errors server-side; return safe messages to clients

### Design System
- **Monochrome palette** with frosted glass effects (`glass`, `glass-strong` CSS classes)
- **Thin borders** (`border-thin` = 0.5px) on all containers
- **Border radius**: `rounded-xl` (12px) for cards/buttons, `rounded-lg` (8px) for smaller items
- Spacing: 4px grid system
- See `DESIGN_SYSTEM.md` for full specs

### Server Actions
- Located in `app/(chat)/actions.ts`, `app/(auth)/actions.ts`, `lib/studio/actions.ts`, `artifacts/actions.ts`
- Always mark with `"use server"` directive
- Validate inputs with Zod schemas
- Return structured responses: `{ success: true, data }` or `{ error: string }`

### Tools (AI Function Calling)
- Defined in `lib/ai/tools/*.ts`
- Export as `tool({ description, parameters, execute })` from `ai` package
- Tools have access to `{ user, dataStream }` for auth and streaming UI
- Example: `createDocument`, `webSearch`, `getWeather`, `requestSuggestions`, `updateDocument`

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, for admin ops)
- `OPENAI_API_KEY` or `GEMINI_API_KEY`
- `AI_DEFAULT_PROVIDER=openai` or `gemini`

### Optional
- `REDIS_URL` (for resumable streams)
- `FAL_API_KEY` (for Studio)
- `NEXT_PUBLIC_APP_URL` (for OAuth redirects)

**Note**: No longer used: `AUTH_SECRET`, `POSTGRES_URL` (migrated to Supabase)

## Key Files Reference

| Path | Purpose |
|------|---------|
| `app/(chat)/api/chat/route.ts` | Main chat streaming endpoint |
| `lib/ai/providers.ts` | AI provider registry (OpenAI/Gemini) |
| `lib/ai/prompts.ts` | System prompts and context |
| `lib/supabase/server.ts` | Server-side Supabase client factory |
| `lib/db/queries.ts` | All database operations |
| `lib/studio/actions.ts` | Studio server actions (fal.ai) |
| `components/chat.tsx` | Main chat UI with streaming |
| `components/artifact.tsx` | Document editor (code, text, sheets) |
| `DESIGN_SYSTEM.md` | UI design tokens and specs |

## Common Tasks

### Adding a New AI Tool
1. Create `lib/ai/tools/my-tool.ts` with `tool({ ... })` export
2. Import in `app/(chat)/api/chat/route.ts` and add to `tools` array
3. (Optional) Create Generative UI component in `components/generative-ui/`
4. Test with user message triggering the tool

### Adding a Studio Model
1. Add model to `lib/ai/studio-models.ts` with metadata
2. Mapping auto-infers from `modelId` convention (provider prefix)
3. Model appears in `ModelSelectorDialog` automatically

### Creating a Database Table
1. Create migration: `npx supabase migration new add_my_table`
2. Write SQL with RLS policies
3. Push: `npx supabase db push`
4. Regen types: `npx supabase gen types typescript --local > lib/supabase/types.ts`
5. Add type aliases to `lib/supabase/models.ts`

## Testing
- E2E tests with Playwright in `tests/`
- Run with `PLAYWRIGHT=True pnpm test`
- GitHub Actions config in `.github/workflows/`

## Performance Notes
- AI streaming uses `smoothStream()` for better UX (gradual token reveal)
- TokenLens integration for usage tracking (`getUsage()` helper)
- Resumable streams via Redis (optional, gracefully degrades)
- Server Actions invoked from client via `useFormStatus` for optimistic UI

## Prohibited Patterns
❌ Don't call AI SDK from client components  
❌ Don't create Supabase clients inline (use factories)  
❌ Don't use `as Parameters<typeof streamText>[0]['model']` (use `as LanguageModel`)  
❌ Don't expose service role keys to browser  
❌ Don't trust user input without Zod validation  
❌ Don't use thick borders or heavy shadows (design system violation)

## Documentation Links
- See `.windsurf/rules/` for detailed rules on Vercel AI SDK, Supabase, fal.ai, and project conventions
- `STUDIO_QUICKSTART.md` for Studio feature walkthrough
- `GENERATIVE_UI_QUICKSTART.md` for Generative UI examples
- `ENVIRONMENT_SETUP.md` for deployment config
