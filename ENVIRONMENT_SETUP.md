# Environment Variables Setup Guide

This guide explains all environment variables used in the project and how to configure them.

## 🔑 Required Variables

### Supabase Configuration

**Required for all deployments**

```bash
# Public variables (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only secrets (NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the values

### AI Provider Configuration

**Choose ONE provider:**

#### Option 1: OpenAI (Default)
```bash
AI_DEFAULT_PROVIDER=openai
OPENAI_API_KEY=sk-...
```
Get your API key: https://platform.openai.com/api-keys

#### Option 2: Google Gemini
```bash
AI_DEFAULT_PROVIDER=gemini
GEMINI_API_KEY=...
```
Get your API key: https://aistudio.google.com/app/apikey

---

## 🔧 Optional Variables

### Redis (Resumable Streams)

Enables stream recovery if connection is lost:

```bash
REDIS_URL=redis://...
```

**How to set up:**
- **Vercel**: https://vercel.com/docs/storage/vercel-kv
- **Local**: Install Redis locally or use Docker

**Note:** If not provided, resumable streams will be disabled (app still works).

### Application URL

Used for OAuth redirects and email confirmations:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Defaults:**
- Development: `http://localhost:3000`
- Production: Auto-detected from request headers

---

## 🏠 Local Development

### Using Local Supabase

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Start local Supabase:
```bash
npx supabase start
```

3. Use the credentials from the output:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-output>
SUPABASE_SERVICE_ROLE_KEY=<from-output>
```

### Example `.env.local` for Local Development

```bash
# AI Provider
AI_DEFAULT_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here

# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Production Deployment (Vercel)

### 1. Add Environment Variables

Go to your Vercel project → Settings → Environment Variables

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY (or GEMINI_API_KEY)
AI_DEFAULT_PROVIDER
```

**Optional:**
```
REDIS_URL
NEXT_PUBLIC_APP_URL
```

### 2. Add GitHub Secrets (for CI/CD)

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the same variables as GitHub Secrets for Playwright tests to work.

---

## 📋 Variables Summary

| Variable | Required | Where Used | Default |
|----------|----------|------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Client & Server | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Client & Server | - |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Server only | - |
| `OPENAI_API_KEY` | ✅ If using OpenAI | Server only | - |
| `GEMINI_API_KEY` | ✅ If using Gemini | Server only | - |
| `AI_DEFAULT_PROVIDER` | ⚠️ Recommended | Server only | `openai` |
| `REDIS_URL` | ❌ Optional | Server only | - |
| `NEXT_PUBLIC_APP_URL` | ❌ Optional | Client & Server | Auto-detected |

---

## 🚫 Removed Variables

The following variables are **NO LONGER USED** after migrating to Supabase Auth:

- ❌ `AUTH_SECRET` (was used by NextAuth)
- ❌ `POSTGRES_URL` (now using Supabase PostgreSQL)
- ❌ `SUPABASE_URL` (duplicate of NEXT_PUBLIC_SUPABASE_URL)
- ❌ `SUPABASE_ANON_KEY` (duplicate of NEXT_PUBLIC_SUPABASE_ANON_KEY)
- ❌ `SUPABASE_DB_URL` (not used in code)

If you have these in your environment, you can safely remove them.

---

## 🔍 Verification

To verify your setup is correct:

1. Start the development server:
```bash
npm run dev
```

2. Check the console for errors
3. Try signing in as a guest
4. Try creating an account

If you see authentication errors, double-check your Supabase credentials.
