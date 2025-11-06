# Authentication & Authorization System Documentation

## Overview

This application uses Supabase Auth with Row Level Security (RLS) for secure authentication and authorization.

## Features

### ✅ Implemented

1. **Authentication Methods**

   - Email/Password authentication
   - Anonymous (Guest) authentication
   - OAuth providers (GitHub, Google, GitLab) - ⚠️ **COMING SOON** (temporarily disabled)
   - Session management with secure cookies

2. **Security Features**

   - Row Level Security (RLS) on all tables
   - Secure middleware using `getUser()` instead of `getSession()`
   - Rate limiting to prevent abuse
   - Audit logging for security events
   - CSRF protection via Supabase Auth

3. **User Types**

   - **Anonymous Users**: Temporary guest accounts
   - **Permanent Users**: Registered users with email/password
   - **OAuth Users**: Users authenticated via OAuth providers

4. **Authorization**
   - Users can only access their own data
   - Public chats are visible to all authenticated users
   - RLS policies enforce data isolation

## API Endpoints

### Authentication

#### `/api/auth/guest` - Anonymous Login

Creates a temporary guest account without email/password.

```bash
GET /api/auth/guest?redirectUrl=/
```

#### `/api/auth/oauth` - OAuth Login ⚠️ **COMING SOON**

> **Status**: Temporarily disabled while OAuth providers are being configured.

Initiates OAuth flow with supported providers.

```bash
GET /api/auth/oauth?provider=github&redirectTo=/
# Supported providers: github, google, gitlab
# Currently returns 503 Service Unavailable
```

#### `/api/auth/callback` - OAuth Callback ⚠️ **COMING SOON**

> **Status**: Temporarily disabled while OAuth providers are being configured.

Handles OAuth callback and creates session.

```bash
GET /api/auth/callback?code=xxx&next=/
# Currently redirects to login with error message
```

#### `/api/auth/convert` - Convert Anonymous to Permanent

Converts a guest account to a permanent account.

```bash
POST /api/auth/convert
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### `/api/auth/signout` - Sign Out

Signs out the current user.

```bash
POST /api/auth/signout
```

### Server Actions

#### `login(formData)` - Email/Password Login

Server action for logging in with email and password.

#### `register(formData)` - Email/Password Registration

Server action for registering a new user.

#### `signOut()` - Sign Out

Server action for signing out.

## Helper Functions

### `lib/auth/index.ts`

#### `getCurrentUser()`

Returns the current authenticated user (secure method).

#### `isAnonymousUser()`

Checks if current user is anonymous.

#### `requireAuth()`

Throws error if user is not authenticated.

#### `requirePermanentUser()`

Throws error if user is anonymous or not authenticated.

#### `getUserId()`

Returns current user ID or null.

#### `convertAnonymousToPermanent(email, password)`

Converts anonymous user to permanent account.

#### `logAuditEvent(action, resource, resourceId?, metadata?)`

Logs security audit event.

#### `checkRateLimit(key, maxRequests, windowSeconds)`

Checks if rate limit is exceeded.

#### `getRateLimitKey(action)`

Generates rate limit key for current user.

## Database Functions

### Anonymous User Management

#### `auth.cleanup_anonymous_users(retention_days)`

Removes anonymous users older than specified days (default: 7).

```sql
SELECT auth.cleanup_anonymous_users(7);
```

#### `auth.convert_anonymous_to_permanent(user_email, user_password)`

Converts anonymous user to permanent user (alternative SQL method).

### Rate Limiting

#### `public.check_rate_limit(p_key, p_max_requests, p_window_seconds)`

Checks rate limit and returns boolean.

```sql
SELECT public.check_rate_limit('user:123:chat', 10, 60);
```

### Audit Logging

#### `public.log_audit_event(p_action, p_resource, p_resource_id, p_metadata)`

Logs audit event for current user.

```sql
SELECT public.log_audit_event('chat_created', 'Chat', 'uuid', '{"title": "Test"}'::jsonb);
```

## Row Level Security Policies

### Chat Table

- Users can view their own chats and public chats
- Users can insert, update, delete only their own chats

### Message & Message_v2 Tables

- Users can view messages from chats they own or public chats
- Users can insert, update, delete messages only in their own chats

### Document Table

- Users can view, insert, update, delete only their own documents

### Vote & Vote_v2 Tables

- Users can view votes from accessible chats
- Users can insert, update, delete votes in accessible chats

### Suggestion Table

- Users can view, insert, update, delete suggestions only for their own documents

### Stream Table

- Users can view, insert, update, delete streams only from their own chats

### AuditLog Table

- Users can view only their own audit logs
- Only service role can insert audit logs

### RateLimit Table

- No direct access (access only through functions)

## Security Best Practices

### 1. Always Use getUser()

Never use `getSession()` in middleware or API routes. Always use `getUser()` which verifies the JWT with Supabase Auth.

```typescript
// ❌ Bad
const {
  data: { session },
} = await supabase.auth.getSession();

// ✅ Good
const {
  data: { user },
} = await supabase.auth.getUser();
```

### 2. Use Helper Functions

Use the helper functions from `lib/auth/index.ts` for consistent security.

```typescript
import { requireAuth, logAuditEvent } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await requireAuth(); // Throws if not authenticated

  // Your logic here

  await logAuditEvent("chat_created", "Chat", chatId);
}
```

### 3. Implement Rate Limiting

Add rate limiting to sensitive endpoints.

```typescript
import { getRateLimitKey, checkRateLimit } from "@/lib/auth";

export async function POST(request: Request) {
  const rateLimitKey = await getRateLimitKey("chat_create");
  const allowed = await checkRateLimit(rateLimitKey, 10, 60); // 10 req/min

  if (!allowed) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  // Your logic here
}
```

### 4. Use Service Role Key Carefully

The service role key bypasses RLS. Only use it when absolutely necessary and never expose it to the client.

### 5. Validate User Input

Always validate and sanitize user input using Zod or similar libraries.

### 6. Log Security Events

Log important security events using the audit log.

```typescript
await logAuditEvent("login", "User", userId, {
  ipAddress: request.headers.get("x-forwarded-for"),
});
```

## Environment Variables

Required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OAuth (optional, configure in Supabase Dashboard)
# No environment variables needed for OAuth
```

## Setup Instructions

### 1. Run Migrations

```bash
# Apply all security migrations
npx supabase db push
```

### 2. Enable OAuth Providers (Optional)

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable desired providers (GitHub, Google, GitLab)
3. Configure OAuth credentials

### 3. Configure Email Templates (Optional)

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize confirmation, reset password, and magic link templates

### 4. Set Up Scheduled Cleanup (Optional)

Create a cron job to clean up old anonymous users:

```sql
-- Using pg_cron extension
SELECT cron.schedule(
  'cleanup-anonymous-users',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT auth.cleanup_anonymous_users(7);'
);
```

## Troubleshooting

### Anonymous Sign-in Not Working

1. Check Supabase Dashboard → Authentication → Providers
2. Ensure "Enable anonymous sign-ins" is enabled

### OAuth Not Working

1. Check OAuth credentials in Supabase Dashboard
2. Ensure callback URL is correct: `{APP_URL}/api/auth/callback`
3. Check provider-specific setup requirements

### RLS Blocking Queries

1. Check RLS policies in Supabase Dashboard → Database → Tables
2. Ensure user is authenticated: `SELECT auth.uid();`
3. Check if service role key is needed for admin operations

### Rate Limiting Too Strict

Adjust rate limits in your code or increase window time.

## Migration Files

- `20251104000001_add_rls_and_user_sync.sql` - RLS policies and User table sync
- `20251104000002_anonymous_users_and_security.sql` - Anonymous users, audit log, rate limiting

## Future Enhancements

- [ ] Multi-factor authentication (MFA)
- [ ] Passkey/WebAuthn support
- [ ] Session device management
- [ ] IP-based access control
- [ ] Advanced audit log analytics
- [ ] Automated security reports
