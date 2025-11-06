import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Get the current authenticated user (secure method)
 * This verifies the JWT with the Supabase Auth server
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get current user:", error);
    return null;
  }

  return user;
}

/**
 * Check if current user is anonymous (guest)
 */
export async function isAnonymousUser() {
  const user = await getCurrentUser();
  return user?.is_anonymous === true;
}

/**
 * Check if user is authenticated (including anonymous)
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Require authentication or throw error
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require non-anonymous user or redirect to register
 * Redirects to /register if user is anonymous or not authenticated
 */
export async function requirePermanentUser() {
  const { redirect } = await import("next/navigation");
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // TypeScript doesn't understand that redirect() never returns
  // so we need to check again or use type assertion
  if (user && user.is_anonymous) {
    redirect("/register?fromGuest=true");
  }

  return user;
}

/**
 * Get user ID safely
 */
export async function getUserId() {
  const user = await getCurrentUser();
  return user?.id;
}

/**
 * Convert anonymous user to permanent user
 */
export async function convertAnonymousToPermanent(
  email: string,
  password: string,
) {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user?.is_anonymous) {
    return {
      success: false,
      error: "User is not anonymous",
    };
  }

  // Update user email and password
  const { error: updateError } = await supabase.auth.updateUser({
    email,
    password,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  return {
    success: true,
    userId: user.id,
  };
}

/**
 * Log audit event for current user
 * Note: Types will be updated after running database migrations
 */
export async function logAuditEvent(
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
) {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  try {
    // Insert into AuditLog table (types will be available after migration)
    await (supabase as any).from("AuditLog").insert({
      userId: user.id,
      action,
      resource,
      resourceId: resourceId || null,
      metadata: metadata || null,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Check rate limit for current user or IP
 * Note: Types will be updated after running database migrations
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  try {
    // Call the RPC function (types will be available after migration)
    const { data, error } = await (supabase as any).rpc("check_rate_limit", {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error("Rate limit check failed:", error);
      return true; // Fail open in case of error
    }

    return data === true;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return true; // Fail open in case of error
  }
}

/**
 * Get rate limit key for current user
 */
export async function getRateLimitKey(action: string): Promise<string> {
  const user = await getCurrentUser();
  if (user) {
    return `user:${user.id}:${action}`;
  }
  return `anon:${action}`;
}
