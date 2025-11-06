# 🔒 Security Audit - Quick Reference

## ⚡ Quick Start

```bash
# Apply all security improvements
./scripts/apply-security-audit.sh

# Or manually:
npx supabase db push
npx supabase gen types typescript --linked > lib/supabase/types.ts
npm run dev
```

## 🔑 What Changed

### Critical Security Fixes

- ✅ **RLS Enabled** - All tables now have Row Level Security
- ✅ **Secure Auth** - Middleware uses `getUser()` instead of `getSession()`
- ✅ **User Sync** - User table synced with Supabase auth.users

### New Features

- 🎭 **OAuth Support** - GitHub, Google, GitLab ⚠️ **COMING SOON**
- 👤 **Guest Users** - Anonymous authentication
- 📊 **Audit Log** - Track all security events
- 🛡️ **Rate Limiting** - Prevent abuse
- 🔧 **Helper Functions** - Easy security checks

## 🚀 New Endpoints

```bash
# Guest login
GET /api/auth/guest?redirectUrl=/

# OAuth login ⚠️ COMING SOON (temporarily disabled)
GET /api/auth/oauth?provider=github&redirectTo=/

# Convert guest to permanent
POST /api/auth/convert
{
  "email": "user@example.com",
  "password": "password123"
}

# OAuth callback ⚠️ COMING SOON (temporarily disabled)
GET /api/auth/callback?code=xxx&next=/
```

## 💻 Code Examples

### Require Authentication

```typescript
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await requireAuth(); // Throws if not authenticated
  // Your code here
}
```

### Rate Limiting

```typescript
import { getRateLimitKey, checkRateLimit } from "@/lib/auth";

const key = await getRateLimitKey("create_chat");
const allowed = await checkRateLimit(key, 10, 60); // 10 per minute

if (!allowed) {
  return new Response("Too many requests", { status: 429 });
}
```

### Audit Logging

```typescript
import { logAuditEvent } from "@/lib/auth";

await logAuditEvent("chat_created", "Chat", chatId, {
  title: "My Chat",
});
```

### Check User Type

```typescript
import { isAnonymousUser, getCurrentUser } from "@/lib/auth";

const isGuest = await isAnonymousUser();
const user = await getCurrentUser();
```

## 📋 Migration Checklist

- [ ] Run `npx supabase db push`
- [ ] Run `npx supabase gen types typescript --linked > lib/supabase/types.ts`
- [ ] Enable "Anonymous sign-ins" in Supabase Dashboard
- [ ] Configure OAuth providers (optional)
- [ ] Test guest login
- [ ] Test OAuth login (if configured)
- [ ] Add rate limiting to sensitive endpoints
- [ ] Update existing code to use new helpers

## 🔗 Resources

- **Full Documentation**: `docs/AUTHENTICATION.md`
- **Audit Summary**: `SECURITY_AUDIT.md`
- **Migrations**: `supabase/migrations/20251104*.sql`
- **Helpers**: `lib/auth/index.ts`

## ⚙️ Supabase Dashboard Setup

1. **Enable Anonymous Sign-ins**

   - Go to Authentication → Providers
   - Enable "Anonymous sign-ins"

2. **Configure OAuth (Optional)**

   - Go to Authentication → Providers
   - Enable GitHub, Google, or GitLab
   - Add OAuth credentials
   - Set callback: `{APP_URL}/api/auth/callback`

3. **Check RLS Policies**
   - Go to Database → Tables
   - Each table should show RLS enabled
   - View policies for each table

## 🐛 Troubleshooting

### "Row Level Security" errors

- Ensure migrations are applied
- Check if user is authenticated
- Use service role key for admin operations

### OAuth not working

- Check OAuth credentials in dashboard
- Verify callback URL is correct
- Check provider-specific requirements

### Type errors after migration

- Run: `npx supabase gen types typescript --linked > lib/supabase/types.ts`
- Restart TypeScript server in VS Code

## 🎯 Recommended Next Steps

1. **Test Authentication**

   - Try guest login
   - Try OAuth login
   - Try converting guest to permanent

2. **Add Rate Limiting**

   - Add to chat creation
   - Add to message sending
   - Add to document operations

3. **Monitor Audit Log**

   - Query AuditLog table
   - Check for suspicious activity
   - Set up alerts (optional)

4. **Schedule Cleanup**
   - Set up cron job for anonymous user cleanup
   - Run: `SELECT auth.cleanup_anonymous_users(7);`

## 📞 Need Help?

Check `docs/AUTHENTICATION.md` for detailed documentation.
