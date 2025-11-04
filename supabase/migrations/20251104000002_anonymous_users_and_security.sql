-- ============================================================================
-- ANONYMOUS USERS AND SECURITY ENHANCEMENTS
-- ============================================================================
-- Note: Anonymous user cleanup and conversion should be handled via Supabase API
-- from application code, not via direct auth schema functions

-- Step 1: Create audit log table for security events
-- ============================================================================
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL,
  "action" varchar(255) NOT NULL,
  "resource" varchar(255) NOT NULL,
  "resourceId" uuid,
  "metadata" jsonb,
  "ipAddress" inet,
  "userAgent" text,
  "createdAt" timestamp NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "AuditLog_action_check" CHECK (
    "action" IN (
      'login', 'logout', 'register', 
      'chat_created', 'chat_updated', 'chat_deleted',
      'document_created', 'document_updated', 'document_deleted',
      'anonymous_login', 'anonymous_converted'
    )
  )
);

-- Enable RLS on AuditLog
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON "AuditLog"
  FOR SELECT
  USING ("userId" = auth.uid());

-- Only system can insert audit logs (via trigger or service role)
CREATE POLICY "Service role can insert audit logs"
  ON "AuditLog"
  FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");

-- Step 4: Create function to log audit events
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action varchar(255),
  p_resource varchar(255),
  p_resource_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO "AuditLog" ("userId", "action", "resource", "resourceId", "metadata")
  VALUES (auth.uid(), p_action, p_resource, p_resource_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create triggers for automatic audit logging
-- ============================================================================

-- Trigger for Chat operations
CREATE OR REPLACE FUNCTION audit_chat_operations()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'chat_created',
      'Chat',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'visibility', NEW.visibility)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'chat_updated',
      'Chat',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'visibility', NEW.visibility)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'chat_deleted',
      'Chat',
      OLD.id,
      jsonb_build_object('title', OLD.title)
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER chat_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON "Chat"
  FOR EACH ROW
  EXECUTE FUNCTION audit_chat_operations();

-- Trigger for Document operations
CREATE OR REPLACE FUNCTION audit_document_operations()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'document_created',
      'Document',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'text', NEW.text)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'document_updated',
      'Document',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'text', NEW.text)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'document_deleted',
      'Document',
      OLD.id,
      jsonb_build_object('title', OLD.title)
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER document_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON "Document"
  FOR EACH ROW
  EXECUTE FUNCTION audit_document_operations();

-- Step 6: Create function to check rate limits
-- ============================================================================
CREATE TABLE IF NOT EXISTS "RateLimit" (
  "key" varchar(255) PRIMARY KEY,
  "count" integer NOT NULL DEFAULT 1,
  "resetAt" timestamp NOT NULL
);

-- Enable RLS (only accessible via functions)
ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;

-- No direct access policies - access only through functions
CREATE POLICY "No direct access to rate limits"
  ON "RateLimit"
  FOR ALL
  USING (false);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key varchar(255),
  p_max_requests integer,
  p_window_seconds integer
)
RETURNS boolean AS $$
DECLARE
  v_current_count integer;
  v_reset_at timestamp;
BEGIN
  -- Get or create rate limit entry
  SELECT "count", "resetAt" INTO v_current_count, v_reset_at
  FROM "RateLimit"
  WHERE "key" = p_key;
  
  -- If no entry exists or window expired, create new one
  IF NOT FOUND OR v_reset_at < NOW() THEN
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (p_key, 1, NOW() + (p_window_seconds || ' seconds')::INTERVAL)
    ON CONFLICT ("key") DO UPDATE
    SET "count" = 1,
        "resetAt" = NOW() + (p_window_seconds || ' seconds')::INTERVAL;
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF v_current_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  UPDATE "RateLimit"
  SET "count" = "count" + 1
  WHERE "key" = p_key;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_rate_limit IS 
  'Checks if rate limit is exceeded for given key. Returns true if request is allowed, false if limit exceeded.';

-- Step 7: Grant necessary permissions
-- ============================================================================
-- Grant execute permissions on public functions
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO authenticated, anon;

-- Step 8: Add helpful comments
-- ============================================================================
COMMENT ON TABLE "AuditLog" IS 'Security audit log for tracking user actions and system events';
COMMENT ON TABLE "RateLimit" IS 'Rate limiting tracking table to prevent abuse';
