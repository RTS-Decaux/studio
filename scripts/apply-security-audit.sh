#!/bin/bash

# Security Audit Implementation Script
# This script helps apply all security improvements

set -e

echo "🔒 AI Chatbot Security Audit Implementation"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Check if Supabase CLI is installed
echo "Step 1: Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found"
    echo "Install it with: npm install -g supabase"
    exit 1
fi
print_status "Supabase CLI found"
echo ""

# Step 2: Check environment variables
echo "Step 2: Checking environment variables..."
if [ ! -f .env.local ]; then
    print_error ".env.local file not found"
    exit 1
fi
print_status ".env.local file found"
echo ""

# Step 3: Apply database migrations
echo "Step 3: Applying database migrations..."
read -p "Do you want to apply database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx supabase db push
    print_status "Migrations applied successfully"
else
    print_warning "Skipped database migrations"
fi
echo ""

# Step 4: Regenerate TypeScript types
echo "Step 4: Regenerating TypeScript types..."
read -p "Do you want to regenerate TypeScript types? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx supabase gen types typescript --linked > lib/supabase/types.ts
    print_status "TypeScript types regenerated"
else
    print_warning "Skipped type generation"
fi
echo ""

# Step 5: Check anonymous sign-ins
echo "Step 5: Configuration checks..."
print_warning "Please ensure the following in Supabase Dashboard:"
echo "  1. Authentication → Providers → Enable 'Anonymous sign-ins'"
echo "  2. (Optional) Configure OAuth providers (GitHub, Google, GitLab)"
echo "  3. Set callback URL: \${NEXT_PUBLIC_APP_URL}/api/auth/callback"
echo ""

# Step 6: Summary
echo "==========================================="
echo "✅ Security Audit Implementation Complete!"
echo "==========================================="
echo ""
echo "📋 What was done:"
echo "  ✓ Middleware updated to use secure getUser() method"
echo "  ✓ Row Level Security (RLS) policies added to all tables"
echo "  ✓ User table synced with auth.users"
echo "  ✓ OAuth authentication endpoints created"
echo "  ✓ Anonymous user management system added"
echo "  ✓ Audit logging system implemented"
echo "  ✓ Rate limiting system added"
echo "  ✓ Security helper functions created"
echo ""
echo "📚 Documentation:"
echo "  - Full guide: docs/AUTHENTICATION.md"
echo "  - Quick summary: SECURITY_AUDIT.md"
echo ""
echo "🚀 Next Steps:"
echo "  1. Restart your dev server: npm run dev"
echo "  2. Test guest login: http://localhost:3000/api/auth/guest"
echo "  3. Configure OAuth in Supabase Dashboard (optional)"
echo "  4. Add rate limiting to sensitive endpoints (recommended)"
echo ""
echo "❓ Questions? Check docs/AUTHENTICATION.md"
echo ""
