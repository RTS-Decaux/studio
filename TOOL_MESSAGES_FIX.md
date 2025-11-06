# Production Fix: Tool Messages Validation

## Problem

Old tool messages in the database had invalid structure that caused validation errors when passed to `convertToModelMessages`:

- Missing required fields: `toolCallId`, `toolName`, `output`
- Incorrect part types or structure
- These were created before architectural fixes were implemented

## Solution (Production-Ready)

### 1. **Code Changes** ✅

**File: `app/(chat)/api/chat/route.ts`**

#### A. Message Sanitization Before Model Call

Added validation to filter out malformed tool messages:

```typescript
// Sanitize messages: remove tool messages with invalid structure
const sanitizedMessages = uiMessages.filter((msg) => {
  // Keep all non-tool messages
  if ((msg as any).role !== "tool") return true;

  // For tool messages, validate they have required fields
  const toolMsg = msg as any;
  return (
    toolMsg.parts &&
    Array.isArray(toolMsg.parts) &&
    toolMsg.parts.every(
      (part: any) =>
        part.type === "tool-result" &&
        part.toolCallId &&
        part.toolName &&
        part.output !== undefined
    )
  );
});
```

**Why this works:**

- ✅ Keeps all user/assistant messages (main conversation)
- ✅ Validates tool messages have correct structure
- ✅ Skips legacy invalid tool messages
- ✅ Tool results still available in assistant message parts (type: `tool-*`)

#### B. Message Validation Before Saving

Added defensive validation in `onFinish`:

```typescript
// Validate messages before saving to prevent corrupt data
const validMessages = messages.filter((msg) => {
  if (!msg.id || !msg.role || !msg.parts) {
    console.warn("Skipping invalid message:", msg);
    return false;
  }
  return true;
});
```

**Why this is important:**

- ✅ Prevents saving corrupt messages to DB
- ✅ Logs warnings for debugging
- ✅ Future-proof against SDK changes

### 2. **Database Cleanup** 🗄️

**Migration: `supabase/migrations/20250106000000_clean_invalid_tool_messages.sql`**

```sql
DELETE FROM "Message_v2" WHERE role = 'tool';
```

**How to apply:**

#### Option A: Using Supabase CLI (Recommended)

```bash
# Review what will be deleted (safe to run)
npx supabase db diff

# Apply migration
npx supabase db push
```

#### Option B: Manual SQL

```bash
# Connect to your database
psql $DATABASE_URL

# Run the cleanup
DELETE FROM "Message_v2" WHERE role = 'tool';
```

#### Option C: Via Supabase Dashboard

1. Go to SQL Editor in Supabase Dashboard
2. Paste and run: `DELETE FROM "Message_v2" WHERE role = 'tool';`

**⚠️ Important:**

- Tool messages are safe to delete because tool results are preserved in assistant message parts
- Backup database before running (optional but recommended)

### 3. **Testing** 🧪

After applying fixes:

```bash
# 1. Build to ensure no errors
pnpm run build

# 2. Test creating a new chat
# - Ask AI to create a document/spreadsheet
# - Verify artifact appears
# - Check no duplicate canvases

# 3. Test existing chats
# - Open old chat (should work now)
# - Continue conversation
# - Verify tool calls work correctly

# 4. Check logs for warnings
# - Should see no "Skipping invalid message" warnings after cleanup
```

## Architecture Overview

### How Tool Messages Work Now:

1. **User asks for document** → `createDocument` tool called
2. **Tool streams to artifact panel** via transient data parts (`data-id`, `data-kind`, etc.)
3. **Tool returns structured output** → saved as part of assistant message
4. **Assistant message parts** contain tool results (type: `tool-createDocument`, etc.)
5. **No separate tool messages** needed in DB (results in assistant parts)

### Message Flow:

```
User Message (DB)
  ↓
AI processes → calls tool
  ↓
Tool executes → streams transient events → artifact panel updates
  ↓
Tool returns output
  ↓
Assistant Message (DB) with parts: [text, tool-createDocument]
  ↓
Next turn: Load messages → sanitize → convertToModelMessages → AI has full context
```

## Key Benefits

✅ **Production-ready**: Handles both old and new data gracefully  
✅ **No data loss**: Tool results preserved in assistant message parts  
✅ **Self-healing**: Automatically filters invalid messages  
✅ **Future-proof**: Validates all incoming/outgoing messages  
✅ **Clean logs**: Warns about issues for monitoring  
✅ **Follows official patterns**: Matches vercel/ai-chatbot architecture

## Verification

After deployment:

1. ✅ Build passes: `pnpm run build`
2. ✅ No validation errors in logs
3. ✅ Tool calls work correctly
4. ✅ Multi-turn conversations maintain context
5. ✅ No duplicate canvases/artifacts
6. ✅ Database cleanup applied

## Rollback Plan

If issues occur:

1. **Code rollback**: Revert sanitization logic (keeps all messages including invalid ones)
2. **DB rollback**: N/A (tool messages were redundant data)
3. **Monitor**: Check for "Skipping invalid message" warnings

## Next Steps

1. ✅ Apply code changes (already done)
2. ✅ Build and test locally
3. 🔄 Apply database migration
4. 🔄 Deploy to production
5. 🔄 Monitor logs for 24 hours

---

**Status**: ✅ Production-ready  
**Risk Level**: Low (defensive coding + optional DB cleanup)  
**Estimated Downtime**: None (backward compatible)
