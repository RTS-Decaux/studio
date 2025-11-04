-- ============================================================================
-- SECURITY MIGRATION: Add Row Level Security (RLS) and User Synchronization
-- ============================================================================

-- Step 1: Drop the old User table and sync with auth.users
-- ============================================================================
DROP TABLE IF EXISTS "User" CASCADE;

-- Create a view that references auth.users for backward compatibility
CREATE OR REPLACE VIEW "User" AS
SELECT 
  id,
  email,
  NULL::varchar(64) as password -- password is managed by Supabase Auth
FROM auth.users;

-- Step 2: Enable RLS on all tables
-- ============================================================================
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Suggestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stream" ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies for Chat
-- ============================================================================
-- Users can view their own chats and public chats
CREATE POLICY "Users can view own chats"
  ON "Chat"
  FOR SELECT
  USING (
    "userId" = auth.uid() OR
    "visibility" = 'public'
  );

-- Users can insert their own chats
CREATE POLICY "Users can insert own chats"
  ON "Chat"
  FOR INSERT
  WITH CHECK ("userId" = auth.uid());

-- Users can update their own chats
CREATE POLICY "Users can update own chats"
  ON "Chat"
  FOR UPDATE
  USING ("userId" = auth.uid())
  WITH CHECK ("userId" = auth.uid());

-- Users can delete their own chats
CREATE POLICY "Users can delete own chats"
  ON "Chat"
  FOR DELETE
  USING ("userId" = auth.uid());

-- Step 4: Create RLS Policies for Message and Message_v2
-- ============================================================================
-- Users can view messages from their own chats or public chats
CREATE POLICY "Users can view messages from accessible chats"
  ON "Message"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Message"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

CREATE POLICY "Users can view messages v2 from accessible chats"
  ON "Message_v2"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Message_v2"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

-- Users can insert messages to their own chats
CREATE POLICY "Users can insert messages to own chats"
  ON "Message"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Message"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages v2 to own chats"
  ON "Message_v2"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Message_v2"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

-- Users can update messages in their own chats
CREATE POLICY "Users can update messages in own chats"
  ON "Message"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Message"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can update messages v2 in own chats"
  ON "Message_v2"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Message_v2"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

-- Users can delete messages from their own chats
CREATE POLICY "Users can delete messages from own chats"
  ON "Message"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Message"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages v2 from own chats"
  ON "Message_v2"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Message_v2"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

-- Step 5: Create RLS Policies for Vote and Vote_v2
-- ============================================================================
CREATE POLICY "Users can view votes from accessible chats"
  ON "Vote"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Vote"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

CREATE POLICY "Users can view votes v2 from accessible chats"
  ON "Vote_v2"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Vote_v2"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

CREATE POLICY "Users can insert votes to accessible chats"
  ON "Vote"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Vote"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

CREATE POLICY "Users can insert votes v2 to accessible chats"
  ON "Vote_v2"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Vote_v2"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

CREATE POLICY "Users can update votes in accessible chats"
  ON "Vote"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Vote"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

CREATE POLICY "Users can update votes v2 in accessible chats"
  ON "Vote_v2"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Vote_v2"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

CREATE POLICY "Users can delete votes from accessible chats"
  ON "Vote"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Vote"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

CREATE POLICY "Users can delete votes v2 from accessible chats"
  ON "Vote_v2"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Vote_v2"."chatId"
      AND ("Chat"."userId" = auth.uid() OR "Chat"."visibility" = 'public')
    )
  );

-- Step 6: Create RLS Policies for Document
-- ============================================================================
CREATE POLICY "Users can view own documents"
  ON "Document"
  FOR SELECT
  USING ("userId" = auth.uid());

CREATE POLICY "Users can insert own documents"
  ON "Document"
  FOR INSERT
  WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update own documents"
  ON "Document"
  FOR UPDATE
  USING ("userId" = auth.uid())
  WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can delete own documents"
  ON "Document"
  FOR DELETE
  USING ("userId" = auth.uid());

-- Step 7: Create RLS Policies for Suggestion
-- ============================================================================
CREATE POLICY "Users can view suggestions for own documents"
  ON "Suggestion"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Document"
      WHERE "Document"."id" = "Suggestion"."documentId"
      AND "Document"."createdAt" = "Suggestion"."documentCreatedAt"
      AND "Document"."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can insert suggestions for own documents"
  ON "Suggestion"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Document"
      WHERE "Document"."id" = "Suggestion"."documentId"
      AND "Document"."createdAt" = "Suggestion"."documentCreatedAt"
      AND "Document"."userId" = auth.uid()
    )
    AND "userId" = auth.uid()
  );

CREATE POLICY "Users can update suggestions for own documents"
  ON "Suggestion"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Document"
      WHERE "Document"."id" = "Suggestion"."documentId"
      AND "Document"."createdAt" = "Suggestion"."documentCreatedAt"
      AND "Document"."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can delete suggestions for own documents"
  ON "Suggestion"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Document"
      WHERE "Document"."id" = "Suggestion"."documentId"
      AND "Document"."createdAt" = "Suggestion"."documentCreatedAt"
      AND "Document"."userId" = auth.uid()
    )
  );

-- Step 8: Create RLS Policies for Stream
-- ============================================================================
CREATE POLICY "Users can view streams from own chats"
  ON "Stream"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Stream"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can insert streams to own chats"
  ON "Stream"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Stream"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can update streams in own chats"
  ON "Stream"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Stream"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can delete streams from own chats"
  ON "Stream"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Chat"
      WHERE "Chat"."id" = "Stream"."chatId"
      AND "Chat"."userId" = auth.uid()
    )
  );

-- Step 9: Add indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS "Chat_userId_idx" ON "Chat"("userId");
CREATE INDEX IF NOT EXISTS "Chat_visibility_idx" ON "Chat"("visibility");
CREATE INDEX IF NOT EXISTS "Message_chatId_idx" ON "Message"("chatId");
CREATE INDEX IF NOT EXISTS "Message_v2_chatId_idx" ON "Message_v2"("chatId");
CREATE INDEX IF NOT EXISTS "Document_userId_idx" ON "Document"("userId");
CREATE INDEX IF NOT EXISTS "Suggestion_documentId_documentCreatedAt_idx" ON "Suggestion"("documentId", "documentCreatedAt");
CREATE INDEX IF NOT EXISTS "Stream_chatId_idx" ON "Stream"("chatId");

-- Step 10: Add comments for documentation
-- ============================================================================
COMMENT ON VIEW "User" IS 'View that maps auth.users to the legacy User table structure for backward compatibility';
COMMENT ON POLICY "Users can view own chats" ON "Chat" IS 'Users can view their own chats and any public chats';
COMMENT ON POLICY "Users can view messages from accessible chats" ON "Message" IS 'Users can view messages from chats they own or public chats';
