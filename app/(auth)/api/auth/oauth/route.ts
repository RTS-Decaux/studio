import { NextResponse } from "next/server";

/**
 * OAuth Authentication Endpoint
 *
 * ⚠️ STATUS: TEMPORARILY DISABLED - COMING SOON
 * This endpoint is currently deactivated while OAuth providers are being configured.
 * Supported providers: GitHub, Google, GitLab
 */
export async function GET(request: Request) {
  // TODO: Remove this when OAuth is ready
  return NextResponse.json(
    { error: "OAuth authentication is coming soon" },
    { status: 503 }
  );
}
